import { NextResponse } from 'next/server'

function buildSampleData(resourceId: string) {
  const numericId = Number(resourceId || 1)

  return {
    ok: true,
    data: {
      item: {
        id: resourceId || '1',
        name: `Sample resource ${resourceId || '1'}`,
        owner: 'Runtime datasource',
        metrics: {
          level: 1200 + numericId,
          volume: 75.5 + numericId,
          inflow: 18 + numericId,
          outflow: 12 + numericId,
        },
        status: numericId % 2 === 0 ? 'active' : 'review',
      },
    },
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const resourceId = searchParams.get('resourceId') ?? '1'

  return NextResponse.json(buildSampleData(resourceId))
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const resourceId = String(body?.resourceId ?? '1')

  return NextResponse.json(buildSampleData(resourceId))
}
