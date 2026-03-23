import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { BoardModel, RoomModel } from '@/lib/models'
import { randomUUID } from 'crypto'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  await connectDB()

  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('title' in body) ||
    typeof (body as Record<string, unknown>).title !== 'string' ||
    !(body as Record<string, unknown>).title
  ) {
    return NextResponse.json({ error: 'title is required and must be a non-empty string' }, { status: 400 })
  }

  const title = ((body as Record<string, unknown>).title as string).trim()
  if (!title) {
    return NextResponse.json({ error: 'title must not be blank' }, { status: 400 })
  }

  const roomCode = randomUUID().replace(/-/g, '').slice(0, 12)

  const dbSession = await mongoose.startSession()
  dbSession.startTransaction()

  try {
    const [board] = await BoardModel.create(
      [{ title, ownerId: session.user.userId, roomCode }],
      { session: dbSession }
    )

    await RoomModel.create(
      [
        {
          boardId: (board._id as mongoose.Types.ObjectId).toString(),
          code: roomCode,
          members: [{ userId: session.user.userId, permission: 'owner' }],
          maxUsers: 20,
        },
      ],
      { session: dbSession }
    )

    await dbSession.commitTransaction()
    dbSession.endSession()

    return NextResponse.json(
      {
        id: (board._id as mongoose.Types.ObjectId).toString(),
        title: board.title,
        ownerId: board.ownerId,
        roomCode: board.roomCode,
        thumbnailUrl: board.thumbnailUrl ?? null,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
      },
      { status: 201 }
    )
  } catch (err) {
    await dbSession.abortTransaction()
    dbSession.endSession()
    console.error('[POST /api/boards]', err)
    return NextResponse.json({ error: 'Failed to create board' }, { status: 500 })
  }
}

export async function GET() {
  await connectDB()

  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.userId

  try {
    // Find all rooms the user belongs to
    const rooms = await RoomModel.find({ 'members.userId': userId }).lean()
    const boardIds = rooms.map((r) => r.boardId)

    const boards = await BoardModel.find({
      _id: { $in: boardIds.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .sort({ updatedAt: -1 })
      .lean()

    const roomByBoardId = new Map(rooms.map((r) => [r.boardId, r]))

    const result = boards.map((b) => {
      const id = (b._id as mongoose.Types.ObjectId).toString()
      const room = roomByBoardId.get(id)
      return {
        id,
        title: b.title,
        ownerId: b.ownerId,
        roomCode: b.roomCode,
        thumbnailUrl: b.thumbnailUrl ?? null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        memberCount: room ? room.members.length : 0,
      }
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/boards]', err)
    return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 })
  }
}
