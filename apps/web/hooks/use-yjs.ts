"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"
import { IndexeddbPersistence } from "y-indexeddb"
import { ELEMENTS_MAP_KEY, META_MAP_KEY } from "@whiteboard/shared"
import type { WhiteboardElement } from "@whiteboard/shared"

export type ConnectionStatus = "connecting" | "connected" | "disconnected"

export interface UseYjsReturn {
  doc: Y.Doc | null
  elementsMap: Y.Map<Y.Map<unknown>> | null
  metaMap: Y.Map<unknown> | null
  elements: WhiteboardElement[]
  undoManager: Y.UndoManager | null
  connectionStatus: ConnectionStatus
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

export function useYjs(boardId: string, token?: string | null): UseYjsReturn {
  const docRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const persistenceRef = useRef<IndexeddbPersistence | null>(null)
  const undoManagerRef = useRef<Y.UndoManager | null>(null)
  const elementsMapRef = useRef<Y.Map<Y.Map<unknown>> | null>(null)
  const metaMapRef = useRef<Y.Map<unknown> | null>(null)

  const [elements, setElements] = useState<WhiteboardElement[]>([])
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected")

  const stableSetElements = useCallback((map: Y.Map<Y.Map<unknown>>) => {
    setElements(elementsMapToArray(map))
  }, [])

  useEffect(() => {
    if (!boardId) return

    const serverUrl = process.env.NEXT_PUBLIC_WS_SERVER_URL ?? "http://localhost:4000"
    const wsUrl = serverUrl.replace(/^http/, "ws") + "/yjs"

    const doc = new Y.Doc()
    docRef.current = doc

    const elementsMap = doc.getMap<Y.Map<unknown>>(ELEMENTS_MAP_KEY)
    const metaMap = doc.getMap<unknown>(META_MAP_KEY)
    elementsMapRef.current = elementsMap
    metaMapRef.current = metaMap

    // Offline persistence via IndexedDB — syncs local state before network
    const persistence = new IndexeddbPersistence(`wb-${boardId}`, doc)
    persistenceRef.current = persistence

    persistence.once("synced", () => {
      stableSetElements(elementsMap)
    })

    // Connect WebSocket provider
    setConnectionStatus("connecting")
    const provider = new WebsocketProvider(wsUrl, boardId, doc, {
      connect: true,
      params: token ? { token } : {},
    })
    providerRef.current = provider

    provider.on("status", ({ status }: { status: string }) => {
      if (status === "connected") {
        setConnectionStatus("connected")
      } else if (status === "disconnected") {
        setConnectionStatus("disconnected")
      } else {
        setConnectionStatus("connecting")
      }
    })

    // UndoManager scoped to elements map only — does not track meta changes
    const undoManager = new Y.UndoManager(elementsMap)
    undoManagerRef.current = undoManager

    const observer = () => {
      stableSetElements(elementsMap)
    }
    elementsMap.observeDeep(observer)

    // Initial read from local state
    stableSetElements(elementsMap)

    return () => {
      elementsMap.unobserveDeep(observer)
      undoManager.destroy()
      // React 18 Strict Mode calls cleanup before the connection is established in dev.
      // "WebSocket is closed before connection is established" warning is harmless in production.
      try { provider.disconnect() } catch { /* ignore Strict Mode dev-only warning */ }
      provider.destroy()
      persistence.destroy()
      doc.destroy()
      docRef.current = null
      providerRef.current = null
      persistenceRef.current = null
      undoManagerRef.current = null
      elementsMapRef.current = null
      metaMapRef.current = null
      setConnectionStatus("disconnected")
    }
  }, [boardId, token, stableSetElements])

  return {
    doc: docRef.current,
    elementsMap: elementsMapRef.current,
    metaMap: metaMapRef.current,
    elements,
    undoManager: undoManagerRef.current,
    connectionStatus,
    isConnected: connectionStatus === "connected",
    provider: providerRef.current,
  }
}
