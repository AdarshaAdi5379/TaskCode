import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    hasSupabaseUrl: Boolean(url),
    hasSupabaseAnonKey: Boolean(anon),
    supabaseUrlHost: url ? safeHost(url) : null,
    supabaseAnonKeyPreview: anon ? `${anon.slice(0, 8)}...${anon.slice(-6)}` : null,
  })
}

function safeHost(input: string): string {
  try {
    return new URL(input).host
  } catch {
    return "invalid-url"
  }
}

