"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { QuickAddTaskModal } from "@/components/modals/quick-add-task-modal"
import { useProjectContext } from "@/lib/project-context"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleMainClick = () => {
    if (sidebarOpen) {
      setSidebarOpen(false    )
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto relative" onClick={handleMainClick}>
          {children}
          
          {/* Mobile Floating Action Button */}
          {isMobile && (
            <Button
              size="lg"
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden z-40"
              onClick={() => setShowQuickAdd(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          )}
        </main>
      </div>

      {/* Quick Add Modal for Mobile */}
      <QuickAddTaskModal open={showQuickAdd} onOpenChange={setShowQuickAdd} />
    </div>
  )
}
