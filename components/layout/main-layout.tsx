"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMainClick = () => {
    if (sidebarOpen) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto" onClick={handleMainClick}>
          {children}
        </main>
      </div>
    </div>
  )
}
