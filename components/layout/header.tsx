"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Menu, Moon, Search, Sun, X, CheckCircle2, Circle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useTaskContext } from "@/lib/task-context"
import { useProjectContext } from "@/lib/project-context"
import Link from "next/link"

interface HeaderProps {
  onSidebarToggle: () => void
  sidebarOpen: boolean
}

export function Header({ onSidebarToggle, sidebarOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [searchValue, setSearchValue] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [mounted, setMounted] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { tasks } = useTaskContext()
  const { projects } = useProjectContext()

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredTasks = searchValue.trim()
    ? tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          task.description.toLowerCase().includes(searchValue.toLowerCase()),
      ).slice(0, 5)
    : []

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project?.name || "Unknown Project"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onSidebarToggle} aria-label="Toggle sidebar">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-foreground">
              <span className="text-primary">Task</span>Zen
            </h1>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden flex-1 max-w-md md:flex" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-10 h-10"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              aria-label="Search tasks"
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue("")
                  setShowResults(false)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {showResults && filteredTasks.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg overflow-hidden z-50">
                {filteredTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/projects/${task.projectId}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                    onClick={() => {
                      setShowResults(false)
                      setSearchValue("")
                    }}
                  >
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{getProjectName(task.projectId)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Theme + Notifications + User */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
