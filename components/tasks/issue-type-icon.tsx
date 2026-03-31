"use client"

import { Bug, BookOpen, CheckSquare, Layers } from "lucide-react"
import type { IssueType } from "@/lib/types"
import { cn } from "@/lib/utils"

interface IssueTypeIconProps {
  type: IssueType
  className?: string
  size?: "sm" | "md"
}

const iconMap: Record<IssueType, { icon: React.ElementType; color: string; label: string }> = {
  task:  { icon: CheckSquare, color: "text-blue-500",   label: "Task" },
  bug:   { icon: Bug,         color: "text-red-500",    label: "Bug" },
  story: { icon: BookOpen,    color: "text-green-500",  label: "Story" },
  epic:  { icon: Layers,      color: "text-purple-500", label: "Epic" },
}

export function IssueTypeIcon({ type, className, size = "sm" }: IssueTypeIconProps) {
  const { icon: Icon, color, label } = iconMap[type] ?? iconMap.task
  const sizeClass = size === "md" ? "h-5 w-5" : "h-4 w-4"
  return (
    <span title={label}>
      <Icon className={cn(sizeClass, color, className)} />
    </span>
  )
}

export function IssueTypeBadge({ type }: { type: IssueType }) {
  const { color, label } = iconMap[type] ?? iconMap.task
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", color)}>
      <IssueTypeIcon type={type} />
      {label}
    </span>
  )
}

export { iconMap as issueTypeMap }
