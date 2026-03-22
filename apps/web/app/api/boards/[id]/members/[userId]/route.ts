import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { RoomModel } from '@/lib/models'
import { RoomPermission } from '@/lib/models/room'
import mongoose from 'mongoose'

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id
}

type RouteContext = { params: Promise<{ id: string; userId: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  await connectDB()

  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, userId } = await context.params

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid board id' }, { status: 400 })
  }

  const room = await RoomModel.findOne({ boardId: id })
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  const requester = room.members.find((m) => m.userId === session.user.userId)
  if (!requester || requester.permission !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (userId === session.user.userId) {
    return NextResponse.json({ error: 'Cannot change your own permission' }, { status: 400 })
  }

  const target = room.members.find((m) => m.userId === userId)
  if (!target) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
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
  const allowedPermissions: RoomPermission[] = ['editor', 'viewer']

  if (!('permission' in patch) || !allowedPermissions.includes(patch.permission as RoomPermission)) {
    return NextResponse.json(
      { error: "permission must be one of: 'editor', 'viewer'" },
      { status: 400 }
    )
  }

  // Guard: cannot demote the last owner
  if (target.permission === 'owner') {
    const ownerCount = room.members.filter((m) => m.permission === 'owner').length
    if (ownerCount <= 1) {
      return NextResponse.json({ error: 'Cannot change permission of the last owner' }, { status: 400 })
    }
  }

  target.permission = patch.permission as RoomPermission
  await room.save()

  return NextResponse.json({ userId, permission: target.permission })
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  await connectDB()

  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, userId } = await context.params

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid board id' }, { status: 400 })
  }

  const room = await RoomModel.findOne({ boardId: id })
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  const requester = room.members.find((m) => m.userId === session.user.userId)
  if (!requester || requester.permission !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (userId === session.user.userId) {
    return NextResponse.json({ error: 'Cannot remove yourself as owner' }, { status: 400 })
  }

  const memberIndex = room.members.findIndex((m) => m.userId === userId)
  if (memberIndex === -1) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  room.members.splice(memberIndex, 1)
  await room.save()

  return new NextResponse(null, { status: 204 })
}
