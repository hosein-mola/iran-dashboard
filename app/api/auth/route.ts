import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const sessionData = JSON.stringify(
    body?.sessionData ?? {
      name: 'test',
      token: 'lorem ipsum dolor sit amet',
    }
  )

  const cookieStore = await cookies()

  cookieStore.set({
    name: 'session',
    value: sessionData,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ message: 'Successfully set cookie!' })
}
