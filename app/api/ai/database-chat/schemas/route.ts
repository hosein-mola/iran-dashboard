import { NextResponse } from 'next/server'
import { z } from 'zod'

import prisma from '@/lib/prisma'
import {
  DATABASE_QUERY_ROW_LIMIT,
  normalizeMessageQuota,
  normalizeRowLimit,
} from '@/lib/ai-database-chat'

const schemaPayload = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
  schemaJson: z.string().trim().min(2),
  rowLimit: z.coerce.number().optional(),
  messageQuota: z.coerce.number().optional(),
})

function assertJsonText(schemaJson: string) {
  JSON.parse(schemaJson)
}

export async function GET() {
  try {
    const schemas = await prisma.aiDatabaseSchema.findMany({
      where: { active: true },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        schemaJson: true,
        rowLimit: true,
        messageQuota: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      schemas: schemas.map((schema) => ({
        ...schema,
        rowLimit: normalizeRowLimit(schema.rowLimit),
        updatedAt: schema.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'خطا در دریافت اسکیماها.' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = schemaPayload.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'درخواست نامعتبر است.', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    try {
      assertJsonText(parsed.data.schemaJson)
    } catch {
      return NextResponse.json(
        { error: 'متن اسکیمای پایگاه داده باید JSON معتبر باشد.' },
        { status: 400 }
      )
    }

    const created = await prisma.aiDatabaseSchema.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? '',
        schemaJson: parsed.data.schemaJson,
        rowLimit: normalizeRowLimit(
          parsed.data.rowLimit ?? DATABASE_QUERY_ROW_LIMIT
        ),
        messageQuota: normalizeMessageQuota(parsed.data.messageQuota ?? 100),
      },
    })

    return NextResponse.json(
      {
        schema: {
          ...created,
          updatedAt: created.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'خطا در ذخیره اسکیما.' },
      { status: 500 }
    )
  }
}
