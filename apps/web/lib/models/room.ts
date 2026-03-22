import mongoose, { Schema, Document, Model } from 'mongoose'

export type RoomPermission = 'owner' | 'editor' | 'viewer'

export interface RoomMember {
  userId: string
  permission: RoomPermission
}

export interface IRoom extends Document {
  boardId: string
  code: string
  members: RoomMember[]
  maxUsers: number
}

const RoomMemberSchema = new Schema<RoomMember>(
  {
    userId: { type: String, required: true },
    permission: { type: String, required: true, enum: ['owner', 'editor', 'viewer'] },
  },
  { _id: false }
)

const RoomSchema = new Schema<IRoom>(
  {
    boardId: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    members: { type: [RoomMemberSchema], default: [] },
    maxUsers: { type: Number, default: 20 },
  },
  { timestamps: false }
)

RoomSchema.index({ boardId: 1 }, { unique: true })
RoomSchema.index({ code: 1 }, { unique: true })

export const RoomModel: Model<IRoom> =
  (mongoose.models.Room as Model<IRoom>) ?? mongoose.model<IRoom>('Room', RoomSchema)
