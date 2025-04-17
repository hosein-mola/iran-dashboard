import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 1. Specify protected and public routes
const protectedRoutes: string[] = ['/dashboard']
const publicRoutes: string[] = ['/login', '/signup', '/']

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname.trim().toLowerCase()
  if (!path || typeof path !== 'string') {
    return NextResponse.error()
  }
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  )
  const isPublicRoute = publicRoutes.includes(path)

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get('session')?.value
  const session = cookie ? JSON.parse(cookie) : null

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.token) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
  if (
    isPublicRoute &&
    session?.token &&
    !req.nextUrl.pathname.startsWith('/modules')
  ) {
    return NextResponse.redirect(new URL('/modules', req.nextUrl))
  }
  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
