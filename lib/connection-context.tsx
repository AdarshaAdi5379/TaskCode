"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { Wifi, WifiOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type ConnectionStatus = "connected" | "disconnected" | "connecting"

interface ConnectionContextType {
  status: ConnectionStatus
  isOnline: boolean
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined)

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting")
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setStatus("connected")
    setIsOnline(true)

    const handleOnline = () => {
      setStatus("connected")
      setIsOnline(true)
    }

    const handleOffline = () => {
      setStatus("disconnected")
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <ConnectionContext.Provider value={{ status, isOnline }}>
      {children}
    </ConnectionContext.Provider>
  )
}

export function useConnection() {
  const context = useContext(ConnectionContext)
  if (!context) {
    throw new Error("useConnection must be used within ConnectionProvider")
  }
  return context
}

export function ConnectionStatus() {
  const { status, isOnline } = useConnection()

  if (status === "connected") {
    return null
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg z-50",
        status === "connecting" 
          ? "bg-blue-500 text-white" 
          : "bg-red-500 text-white"
      )}
    >
      {status === "connecting" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Connecting...</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm">Offline - Changes will sync when connected</span>
        </>
      )}
    </div>
  )
}
