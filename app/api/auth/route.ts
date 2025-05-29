import { NextResponse } from 'next/server'

// If you want to force Edge runtime uncomment this
// export const runtime = 'edge'

export async function POST(req: Request) {
  const body = await req.json()
  const sessionData = JSON.stringify(
    body?.sessionData ?? {
      name: 'test',
      token: 'lorem ipsum dolor sit amet',
    }
  )

  // Manually build the cookie header for full compatibility
  const cookie = [
    `session=${encodeURIComponent(sessionData)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${60 * 60 * 24 * 7}`,
    'SameSite=Lax'
  ].filter(Boolean).join('; ')

  const res = NextResponse.json({ message: 'Successfully set cookie!' })
  res.headers.set('Set-Cookie', cookie)
  return res
}
