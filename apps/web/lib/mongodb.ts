import mongoose from 'mongoose'

function getMongoURI(): string {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set. Add it to your .env.local file.')
  }
  return uri
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
   
  var __mongoose: MongooseCache | undefined
}

const cached: MongooseCache = globalThis.__mongoose ?? { conn: null, promise: null }
globalThis.__mongoose = cached

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(getMongoURI(), {
      bufferCommands: false,
    }).catch((err) => {
      cached.promise = null
      throw err
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
