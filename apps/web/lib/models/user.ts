import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  image?: string
  provider: 'google' | 'github'
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    provider: { type: String, required: true, enum: ['google', 'github'] },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

UserSchema.index({ email: 1 }, { unique: true })

export const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ?? mongoose.model<IUser>('User', UserSchema)
