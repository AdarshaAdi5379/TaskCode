export interface ParsedTask {
  title: string
  description?: string
  priority?: "low" | "medium" | "high" | "critical"
  dueDate?: string
  labels?: string[]
  assignees?: string[]
}

export interface PriorityScore {
  score: number
  factors: {
    urgency: number
    importance: number
    complexity: number
    deadline: number
  }
}

export function parseNaturalLanguage(input: string): ParsedTask {
  const result: ParsedTask = {
    title: input,
    labels: [],
  }

  const lowerInput = input.toLowerCase()

  const priorityPatterns = [
    { pattern: /\b(urgent|asap|right now|immediately|critical)\b/i, priority: "critical" as const },
    { pattern: /\b(high priority|important|soon|very important)\b/i, priority: "high" as const },
    { pattern: /\b(medium priority|normal|regular)\b/i, priority: "medium" as const },
    { pattern: /\b(low priority|whenever|not urgent|eventually)\b/i, priority: "low" as const },
  ]

  for (const { pattern, priority } of priorityPatterns) {
    if (pattern.test(input)) {
      result.priority = priority
      break
    }
  }

  const today = new Date()
  const datePatterns = [
    { pattern: /\btoday\b/i, date: today.toISOString().split("T")[0] },
    { pattern: /\btomorrow\b/i, date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0] },
    { pattern: /\bnext week\b/i, date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] },
    { pattern: /\bnext monday\b/i, date: getNextDayOfWeek(1) },
    { pattern: /\bnext friday\b/i, date: getNextDayOfWeek(5) },
    { pattern: /\bin (\d+) days?\b/i, handler: (match: RegExpMatchArray) => {
      const days = parseInt(match[1])
      return new Date(today.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    }},
    { pattern: /\bin (\d+) weeks?\b/i, handler: (match: RegExpMatchArray) => {
      const weeks = parseInt(match[1])
      return new Date(today.getTime() + weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    }},
  ]

  for (const { pattern, date, handler } of datePatterns) {
    const match = input.match(pattern)
    if (match) {
      result.dueDate = date || (handler ? handler(match) : undefined)
      break
    }
  }

  const labelPatterns = [
    { pattern: /#(\w+)/g, extract: (match: string) => match.slice(1) },
    { pattern: /\b(bug|feature|enhancement|task|todo|fix)\b/gi, extract: (match: string) => match.toLowerCase() },
  ]

  for (const { pattern, extract } of labelPatterns) {
    const matches = input.match(pattern)
    if (matches) {
      const labels = matches.map(extract)
      result.labels = [...(result.labels || []), ...labels]
    }
  }

  if (result.labels && result.labels.length === 0) {
    delete result.labels
  }

  const titlePatterns = [
    /^create (?:a )?(.+)/i,
    /^add (?:a )?(.+)/i,
    /^make (?:a )?(.+)/i,
    /^finish (.+)/i,
    /^complete (.+)/i,
    /^fix (.+)/i,
    /^update (.+)/i,
    /^review (.+)/i,
  ]

  for (const pattern of titlePatterns) {
    const match = input.match(pattern)
    if (match) {
      result.title = match[1].trim()
      break
    }
  }

  result.title = result.title.replace(/#\w+/g, "").replace(/\b(today|tomorrow|next week|urgent|important|asap)\b/gi, "").trim()

  if (!result.title) {
    result.title = input
  }

  return result
}

function getNextDayOfWeek(dayOfWeek: number): string {
  const today = new Date()
  const result = new Date(today)
  result.setDate(today.getDate() + ((dayOfWeek - today.getDay() + 7) % 7))
  return result.toISOString().split("T")[0]
}

export function calculatePriorityScore(
  task: { priority: string; dueDate?: string; labels?: string[]; description?: string }
): PriorityScore {
  const factors = {
    urgency: 0,
    importance: 0,
    complexity: 0,
    deadline: 0,
  }

  const priorityMap: Record<string, number> = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
  }
  factors.importance = priorityMap[task.priority] || 50

  if (task.dueDate) {
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) {
      factors.deadline = 100
    } else if (daysUntilDue === 0) {
      factors.deadline = 90
    } else if (daysUntilDue === 1) {
      factors.deadline = 80
    } else if (daysUntilDue <= 3) {
      factors.deadline = 60
    } else if (daysUntilDue <= 7) {
      factors.deadline = 40
    } else {
      factors.deadline = 20
    }
  }

  const urgentLabels = ["urgent", "asap", "critical", "important"]
  if (task.labels?.some((l) => urgentLabels.includes(l.toLowerCase()))) {
    factors.urgency = 80
  }

  const complexityKeywords = ["complex", "difficult", "hard", "extensive", "major", "full"]
  if (task.description && complexityKeywords.some((k) => task.description!.toLowerCase().includes(k))) {
    factors.complexity = 60
  }

  const score = Math.min(100, Math.round(
    factors.importance * 0.3 +
    factors.deadline * 0.4 +
    factors.urgency * 0.2 +
    factors.complexity * 0.1
  ))

  return { score, factors }
}

export function suggestPriority(input: string): "low" | "medium" | "high" | "critical" {
  const parsed = parseNaturalLanguage(input)
  if (parsed.priority) return parsed.priority

  const score = calculatePriorityScore({ priority: "medium", ...parsed }).score

  if (score >= 80) return "critical"
  if (score >= 60) return "high"
  if (score >= 40) return "medium"
  return "low"
}
