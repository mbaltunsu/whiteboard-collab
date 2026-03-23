import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { RoomModel } from '@/lib/models'

type RouteContext = { params: Promise<{ code: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  await connectDB()

  let session
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code } = await context.params

  if (!code || typeof code !== 'string' || code.trim() === '') {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 })
  }

  const room = await RoomModel.findOne({ code: code.trim() })
  if (!room) {
    return NextResponse.json({ error: 'Invite code not found' }, { status: 404 })
  }

  const alreadyMember = room.members.some((m) => m.userId === session.user.userId)

  if (!alreadyMember) {
    if (room.members.length >= room.maxUsers) {
      return NextResponse.json({ error: 'Room is full' }, { status: 403 })
    }

    room.members.push({ userId: session.user.userId, permission: 'editor' })
    await room.save()
  }

  return NextResponse.json({ boardId: room.boardId })
}
