import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { BoardModel, RoomModel, YjsDocModel } from '@/lib/models'
import mongoose from 'mongoose'

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id
}

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  await connectDB()

  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid board id' }, { status: 400 })
  }

  const board = await BoardModel.findById(id).lean()
  if (!board) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 })
  }

  const room = await RoomModel.findOne({ boardId: id }).lean()
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  const isMember = room.members.some((m) => m.userId === session.user.userId)
  if (!isMember) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({
    id: (board._id as mongoose.Types.ObjectId).toString(),
    title: board.title,
    ownerId: board.ownerId,
    roomCode: board.roomCode,
    thumbnailUrl: board.thumbnailUrl ?? null,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
    memberCount: room.members.length,
  })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  await connectDB()

  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid board id' }, { status: 400 })
  }

  const board = await BoardModel.findById(id)
  if (!board) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 })
  }

  if (board.ownerId !== session.user.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Request body must be an object' }, { status: 400 })
  }

  const patch = body as Record<string, unknown>

  if ('title' in patch) {
    if (typeof patch.title !== 'string' || !patch.title.trim()) {
      return NextResponse.json({ error: 'title must be a non-empty string' }, { status: 400 })
    }
    board.title = patch.title.trim()
  }

  await board.save()

  return NextResponse.json({
    id: (board._id as mongoose.Types.ObjectId).toString(),
    title: board.title,
    ownerId: board.ownerId,
    roomCode: board.roomCode,
    thumbnailUrl: board.thumbnailUrl ?? null,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
  })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  await connectDB()

  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid board id' }, { status: 400 })
  }

  const board = await BoardModel.findById(id)
  if (!board) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 })
  }

  if (board.ownerId !== session.user.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await Promise.all([
    BoardModel.deleteOne({ _id: id }),
    RoomModel.deleteOne({ boardId: id }),
    YjsDocModel.deleteOne({ boardId: id }),
  ])

  return new NextResponse(null, { status: 204 })
}
