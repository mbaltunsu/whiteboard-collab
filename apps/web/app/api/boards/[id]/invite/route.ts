import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { BoardModel, RoomModel } from '@/lib/models'
import mongoose from 'mongoose'

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id
}

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: NextRequest, context: RouteContext) {
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

  const member = room.members.find((m) => m.userId === session.user.userId)
  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (member.permission !== 'owner' && member.permission !== 'editor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ roomCode: room.code })
}
