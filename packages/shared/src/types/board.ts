export type RoomPermission = "owner" | "editor" | "viewer"

export interface RoomMember {
  userId: string
  permission: RoomPermission
}

export interface Board {
  id: string
  title: string
  ownerId: string
  thumbnailUrl?: string
  createdAt: number
  updatedAt: number
  roomCode: string
}

export interface Room {
  id: string
  boardId: string
  code: string
  members: RoomMember[]
  maxUsers: number
}
