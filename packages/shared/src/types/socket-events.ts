export interface CursorMovePayload {
  userId: string
  x: number
  y: number
  boardId: string
}

export interface CursorLeavePayload {
  userId: string
  boardId: string
}

export interface UserJoinPayload {
  userId: string
  name: string
  avatar: string
  color: string
}

export interface UserLeavePayload {
  userId: string
}

export interface SelectionSetPayload {
  userId: string
  elementIds: string[]
}

export interface ViewportSharePayload {
  userId: string
  bounds: { x: number; y: number; w: number; h: number }
}

export interface ServerToClientEvents {
  "cursor:move": (payload: CursorMovePayload) => void
  "cursor:leave": (payload: CursorLeavePayload) => void
  "user:join": (payload: UserJoinPayload) => void
  "user:leave": (payload: UserLeavePayload) => void
  "selection:set": (payload: SelectionSetPayload) => void
  "viewport:share": (payload: ViewportSharePayload) => void
}

export interface ClientToServerEvents {
  "cursor:move": (payload: CursorMovePayload) => void
  "cursor:leave": (payload: CursorLeavePayload) => void
  "user:join": (payload: UserJoinPayload) => void
  "user:leave": (payload: UserLeavePayload) => void
  "selection:set": (payload: SelectionSetPayload) => void
  "viewport:share": (payload: ViewportSharePayload) => void
}
