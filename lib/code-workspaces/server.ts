import prisma from '@/lib/prisma'

export function getClientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || null
  }

  return req.headers.get('cf-connecting-ip') ?? req.headers.get('x-real-ip') ?? null
}

export function getUserIdentity(req: Request): string {
  const cookie = req.headers.get('cookie') ?? ''
  const match = cookie.match(/(?:^|;\s*)session=([^;]+)/)

  if (match?.[1]) {
    try {
      const parsed = JSON.parse(decodeURIComponent(match[1])) as
        | { userId?: unknown; id?: unknown; email?: unknown; token?: unknown }
        | undefined

      const userId =
        (typeof parsed?.userId === 'string' && parsed.userId) ||
        (typeof parsed?.id === 'string' && parsed.id) ||
        (typeof parsed?.email === 'string' && parsed.email) ||
        (typeof parsed?.token === 'string' && parsed.token) ||
        null

      if (userId) return userId
    } catch {
      // Ignore malformed session cookie.
    }
  }

  return 'local-dev'
}

export async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function findWorkspaceBySlugForUser(slug: string, userId: string) {
  const direct = await prisma.codeWorkspace.findUnique({
    where: {
      createdByUserId_slug: {
        createdByUserId: userId,
        slug,
      },
    },
  })

  if (direct) return direct
  if (userId === 'public') return null

  // Backward compatibility for legacy workspaces saved before user scoping.
  const legacyPublic = await prisma.codeWorkspace.findUnique({
    where: {
      createdByUserId_slug: {
        createdByUserId: 'public',
        slug,
      },
    },
  })
  if (legacyPublic) return legacyPublic

  // Dev/CLI compatibility: anonymous curl calls have no session cookie, so
  // they resolve as local-dev. In that case, fall back to latest workspace
  // by slug regardless of owner.
  if (userId === 'local-dev') {
    return await prisma.codeWorkspace.findFirst({
      where: { slug, active: true },
      orderBy: { updatedAt: 'desc' },
    })
  }

  return null
}

export function normalizeEntryPath(path: string) {
  const trimmed = path.trim()
  if (!trimmed) return '/'
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}
