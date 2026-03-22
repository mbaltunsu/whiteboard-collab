import mongoose, { Schema, Document, Model } from "mongoose"
import * as Y from "yjs"
import { THROTTLE } from "@whiteboard/shared"

// ---- Mongoose model -------------------------------------------------------

interface IYjsDoc extends Document {
  boardId: string
  state: Buffer
  updatedAt: Date
}

const YjsDocSchema = new Schema<IYjsDoc>(
  {
    boardId: { type: String, required: true, unique: true, index: true },
    state: { type: Buffer, required: true },
  },
  { timestamps: true }
)

let YjsDocModel: Model<IYjsDoc>

function getModel(): Model<IYjsDoc> {
  if (!YjsDocModel) {
    YjsDocModel =
      (mongoose.models["YjsDoc"] as Model<IYjsDoc> | undefined) ??
      mongoose.model<IYjsDoc>("YjsDoc", YjsDocSchema)
  }
  return YjsDocModel
}

// ---- Debounce helper -------------------------------------------------------

const saveTimers = new Map<string, ReturnType<typeof setTimeout>>()

function scheduleSave(boardId: string, ydoc: Y.Doc): void {
  const existing = saveTimers.get(boardId)
  if (existing) clearTimeout(existing)

  const timer = setTimeout(() => {
    saveTimers.delete(boardId)
    saveDocument(boardId, ydoc).catch((err: unknown) => {
      console.error(`[persistence] failed to save doc for board ${boardId}:`, err)
    })
  }, THROTTLE.PERSISTENCE_MS)

  saveTimers.set(boardId, timer)
}

// ---- Public API ------------------------------------------------------------

export async function connectMongo(): Promise<void> {
  const uri = process.env["MONGODB_URI"]
  if (!uri) {
    console.warn("[persistence] MONGODB_URI not set — persistence disabled")
    return
  }

  if (mongoose.connection.readyState >= 1) return

  await mongoose.connect(uri)
  console.log("[persistence] MongoDB connected")
}

export async function loadDocument(boardId: string, ydoc: Y.Doc): Promise<void> {
  try {
    const model = getModel()
    const record = await model.findOne({ boardId }).lean()
    if (record?.state) {
      const update = new Uint8Array(record.state.buffer)
      Y.applyUpdate(ydoc, update)
      console.log(`[persistence] loaded doc for board ${boardId}`)
    }
  } catch (err) {
    console.error(`[persistence] failed to load doc for board ${boardId}:`, err)
  }
}

export async function saveDocument(boardId: string, ydoc: Y.Doc): Promise<void> {
  try {
    const model = getModel()
    const update = Y.encodeStateAsUpdate(ydoc)
    await model.findOneAndUpdate(
      { boardId },
      { state: Buffer.from(update), updatedAt: new Date() },
      { upsert: true, new: true }
    )
    console.log(`[persistence] saved doc for board ${boardId}`)
  } catch (err) {
    console.error(`[persistence] failed to save doc for board ${boardId}:`, err)
  }
}

/**
 * Returns a y-websocket-compatible persistence object.
 * Pass this to setupWSConnection via setPersistence().
 */
export const mongoPersistence = {
  provider: null as null,

  bindState: async (docName: string, ydoc: Y.Doc): Promise<void> => {
    await loadDocument(docName, ydoc)
    ydoc.on("update", () => {
      scheduleSave(docName, ydoc)
    })
  },

  writeState: async (docName: string, ydoc: Y.Doc): Promise<void> => {
    // Called by y-websocket when the last connection leaves the room
    const pending = saveTimers.get(docName)
    if (pending) {
      clearTimeout(pending)
      saveTimers.delete(docName)
    }
    await saveDocument(docName, ydoc)
  },
}
