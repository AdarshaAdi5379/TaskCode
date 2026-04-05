"use client"

import type { FormEvent } from "react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserContext } from "@/lib/user-context"
import { isSupabaseConfigured } from "@/lib/supabase/client"

export function LoginForm() {
  const router = useRouter()
  const { isAuthenticated, isLoading, signInWithPassword, signUpWithPassword } = useUserContext()
  const configured = useMemo(() => isSupabaseConfigured(), [])

  const [mode, setMode] = useState<"sign_in" | "sign_up">("sign_in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!configured) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Supabase not configured</CardTitle>
          <CardDescription>
            Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
            <code className="font-mono">.env.local</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Then run the SQL in <code className="font-mono">supabase/schema.sql</code> in your Supabase project.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!isLoading && isAuthenticated) {
    router.replace("/")
    return null
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result =
        mode === "sign_in"
          ? await signInWithPassword(email, password)
          : await signUpWithPassword(email, password, displayName.trim() || undefined)

      if (result.error) {
        setError(result.error)
        return
      }

      router.replace("/")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{mode === "sign_in" ? "Sign in" : "Create account"}</CardTitle>
        <CardDescription>Use your email + password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={onSubmit}>
          {mode === "sign_up" && (
            <Input
              placeholder="Display name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
            />
          )}
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "sign_in" ? "current-password" : "new-password"}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "sign_in" ? "Sign in" : "Sign up"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setMode((m) => (m === "sign_in" ? "sign_up" : "sign_in"))}
            disabled={submitting}
          >
            {mode === "sign_in" ? "Create an account" : "I already have an account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
