"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"
import { IndexeddbPersistence } from "y-indexeddb"
import { ELEMENTS_MAP_KEY } from "@whiteboard/shared"
import type { WhiteboardElement } from "@whiteboard/shared"

export interface UseYjsReturn {
  doc: Y.Doc | null
  elements: WhiteboardElement[]
  undoManager: Y.UndoManager | null
  isConnected: boolean
  provider: WebsocketProvider | null
}

function elementsMapToArray(map: Y.Map<Y.Map<unknown>>): WhiteboardElement[] {
  const result: WhiteboardElement[] = []
  map.forEach((yElement) => {
    const obj = yElement.toJSON() as WhiteboardElement
    result.push(obj)
  })
  return result.sort((a, b) => a.zIndex - b.zIndex)
}

export function useYjs(boardId: string): UseYjsReturn {
  const docRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const persistenceRef = useRef<IndexeddbPersistence | null>(null)
  const undoManagerRef = useRef<Y.UndoManager | null>(null)

  const [elements, setElements] = useState<WhiteboardElement[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const stableSetElements = useCallback((map: Y.Map<Y.Map<unknown>>) => {
    setElements(elementsMapToArray(map))
  }, [])

  useEffect(() => {
    if (!boardId) return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000"

    const doc = new Y.Doc()
    docRef.current = doc

    const elementsMap = doc.getMap<Y.Map<unknown>>(ELEMENTS_MAP_KEY)

    const persistence = new IndexeddbPersistence(`wb-${boardId}`, doc)
    persistenceRef.current = persistence

    persistence.once("synced", () => {
      stableSetElements(elementsMap)
    })

    const provider = new WebsocketProvider(wsUrl, `${boardId}`, doc, {
      connect: true,
    })
    providerRef.current = provider

    provider.on("status", ({ status }: { status: string }) => {
      setIsConnected(status === "connected")
    })

    const undoManager = new Y.UndoManager(elementsMap)
    undoManagerRef.current = undoManager

    const observer = () => {
      stableSetElements(elementsMap)
    }
    elementsMap.observeDeep(observer)

    stableSetElements(elementsMap)

    return () => {
      elementsMap.unobserveDeep(observer)
      undoManager.destroy()
      provider.disconnect()
      provider.destroy()
      persistence.destroy()
      doc.destroy()
      docRef.current = null
      providerRef.current = null
      persistenceRef.current = null
      undoManagerRef.current = null
      setIsConnected(false)
    }
  }, [boardId, stableSetElements])

  return {
    doc: docRef.current,
    elements,
    undoManager: undoManagerRef.current,
    isConnected,
    provider: providerRef.current,
  }
}
