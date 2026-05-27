import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  // Clear auth-related cookies (best effort)
  res.cookies.set('session', '', { path: '/', maxAge: 0 })
  res.cookies.set('token', '', { path: '/', maxAge: 0 })
  res.cookies.set('auth', '', { path: '/', maxAge: 0 })
  return res
}
