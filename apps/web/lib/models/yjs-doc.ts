import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IYjsDoc extends Document {
  boardId: string
  state: Buffer
  updatedAt: Date
}

const YjsDocSchema = new Schema<IYjsDoc>(
  {
    boardId: { type: String, required: true, unique: true },
    state: { type: Buffer, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

YjsDocSchema.pre('save', function () {
  this.updatedAt = new Date()
})

YjsDocSchema.pre('findOneAndUpdate', function () {
  this.set({ updatedAt: new Date() })
})

YjsDocSchema.index({ boardId: 1 }, { unique: true })

export const YjsDocModel: Model<IYjsDoc> =
  (mongoose.models.YjsDoc as Model<IYjsDoc>) ?? mongoose.model<IYjsDoc>('YjsDoc', YjsDocSchema)
