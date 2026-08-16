import { NextResponse } from 'next/server'

import { checkSqlServerConnection } from '@/lib/ai-database-chat'
import prisma from '@/lib/prisma'
import { getReservoirDataHealth } from '@/lib/reservoir-data'

export const dynamic = 'force-dynamic'

async function checkSqliteConnection() {
  try {
    await prisma.$queryRaw`SELECT 1 AS connected`

    return {
      configured: true,
      connected: true,
      provider: 'sqlite' as const,
      message: 'SQLite connection is healthy.',
    }
  } catch (error) {
    return {
      configured: true,
      connected: false,
      provider: 'sqlite' as const,
      message:
        error instanceof Error
          ? error.message
          : 'SQLite connection check failed.',
    }
  }
}

export async function GET() {
  const [sqlite, sqlServer, reservoir] = await Promise.all([
    checkSqliteConnection(),
    checkSqlServerConnection(),
    getReservoirDataHealth(),
  ])

  return NextResponse.json({
    sqlite,
    sqlServer,
    reservoir,
    checkedAt: new Date().toISOString(),
  })
}
