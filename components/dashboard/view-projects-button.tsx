"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectContext } from "@/lib/project-context"

export function ViewProjectsButton() {
  const { projects } = useProjectContext()

  const firstActiveProjectId = useMemo(() => {
    const first = projects.find((p) => !p.isArchived)
    return first?.id ?? null
  }, [projects])

  if (!firstActiveProjectId) {
    return (
      <Button className="gap-2 bg-primary hover:bg-primary/90" disabled>
        <Plus className="h-4 w-4" />
        View Projects
      </Button>
    )
  }

  return (
    <Link href={`/projects/${firstActiveProjectId}`}>
      <Button className="gap-2 bg-primary hover:bg-primary/90">
        <Plus className="h-4 w-4" />
        View Projects
      </Button>
    </Link>
  )
}

