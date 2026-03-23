import type { Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose'

export interface IBoard extends Document {
  title: string
  ownerId: string
  thumbnailUrl?: string
  roomCode: string
  createdAt: Date
  updatedAt: Date
}

const BoardSchema = new Schema<IBoard>(
  {
    title: { type: String, required: true },
    ownerId: { type: String, required: true },
    thumbnailUrl: { type: String },
    roomCode: { type: String, required: true },
  },
  { timestamps: true }
)

BoardSchema.index({ ownerId: 1 })
BoardSchema.index({ roomCode: 1 }, { unique: true })

export const BoardModel: Model<IBoard> =
  (mongoose.models.Board as Model<IBoard>) ?? mongoose.model<IBoard>('Board', BoardSchema)
