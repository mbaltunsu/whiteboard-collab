import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { RoomModel, UserModel } from '@/lib/models'
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

  const room = await RoomModel.findOne({ boardId: id }).lean()
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  const isMember = room.members.some((m) => m.userId === session.user.userId)
  if (!isMember) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const userIds = room.members.map((m) => m.userId)
  const users = await UserModel.find({ _id: { $in: userIds.map((uid) => new mongoose.Types.ObjectId(uid)) } }).lean()

  const userMap = new Map(users.map((u) => [(u._id as mongoose.Types.ObjectId).toString(), u]))

  const members = room.members.map((m) => {
    const user = userMap.get(m.userId)
    return {
      userId: m.userId,
      permission: m.permission,
      name: user?.name ?? null,
      email: user?.email ?? null,
      image: user?.image ?? null,
    }
  })

  return NextResponse.json(members)
}
