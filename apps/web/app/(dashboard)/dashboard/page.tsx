import type { Metadata } from 'next'
import { Layers } from 'lucide-react'
import { requireAuth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { BoardModel } from '@/lib/models/board'
import { RoomModel } from '@/lib/models/room'
import mongoose from 'mongoose'
import { BoardCard } from './board-card'
import { CreateBoardDialog } from './create-board-dialog'

export const metadata: Metadata = {
  title: 'Active Rooms',
}

interface BoardData {
  id: string
  title: string
  ownerId: string
  thumbnailUrl: string | null
  updatedAt: string
  memberCount: number
}

async function getUserBoards(userId: string): Promise<BoardData[]> {
  await connectDB()

  const rooms = await RoomModel.find({ 'members.userId': userId }).lean()
  const boardIds = rooms.map((r) => r.boardId)

  if (boardIds.length === 0) return []

  const boards = await BoardModel.find({
    _id: { $in: boardIds.map((id) => new mongoose.Types.ObjectId(id)) },
  })
    .sort({ updatedAt: -1 })
    .lean()

  const roomByBoardId = new Map(rooms.map((r) => [r.boardId, r]))

  return boards.map((b) => {
    const id = (b._id as mongoose.Types.ObjectId).toString()
    const room = roomByBoardId.get(id)
    return {
      id,
      title: b.title,
      ownerId: b.ownerId,
      thumbnailUrl: b.thumbnailUrl ?? null,
      updatedAt: (b.updatedAt as Date).toISOString(),
      memberCount: room ? room.members.length : 0,
    }
  })
}

export default async function DashboardPage() {
  const session = await requireAuth()
  const userId = session.user.userId

  let boards: BoardData[] = []
  let fetchError = false
  try {
    boards = await getUserBoards(userId)
  } catch {
    fetchError = true
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1
            className="text-3xl font-bold leading-tight tracking-tight"
            style={{
              color: '#2c2f30',
              fontFamily: 'Manrope, var(--font-manrope, sans-serif)',
            }}
          >
            Active Rooms
          </h1>
          <p className="max-w-md text-sm leading-relaxed" style={{ color: '#595c5d' }}>
            Browse and manage your ongoing creative collaborations and digital whiteboards.
          </p>
        </div>

        <div className="shrink-0">
          <CreateBoardDialog />
        </div>
      </div>

      {/* Error state */}
      {fetchError && (
        <div
          className="rounded-xl px-5 py-4 text-sm"
          style={{ backgroundColor: '#fff0f3', color: '#b41340' }}
        >
          Could not load your boards. Please refresh to try again.
        </div>
      )}

      {/* Board grid */}
      {!fetchError && boards.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              id={board.id}
              title={board.title}
              thumbnailUrl={board.thumbnailUrl}
              updatedAt={board.updatedAt}
              memberCount={board.memberCount}
              isOwner={board.ownerId === userId}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!fetchError && boards.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-5 rounded-2xl py-20 text-center"
          style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px -2px rgba(12, 15, 16, 0.06)' }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: '#eff1f2' }}
          >
            <Layers className="h-7 w-7" style={{ color: '#595c5d' }} />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2
              className="text-lg font-bold"
              style={{
                color: '#2c2f30',
                fontFamily: 'Manrope, var(--font-manrope, sans-serif)',
              }}
            >
              No rooms yet
            </h2>
            <p className="max-w-xs text-sm" style={{ color: '#595c5d' }}>
              Create your first whiteboard to start collaborating with your team.
            </p>
          </div>
          <CreateBoardDialog />
        </div>
      )}
    </div>
  )
}
