import { NextResponse } from 'next/server'
import { z } from 'zod'

import prisma from '@/lib/prisma'
import {
  normalizeMessageQuota,
  normalizeRowLimit,
} from '@/lib/ai-database-chat'

const schemaPayload = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  schemaJson: z.string().trim().min(2).optional(),
  rowLimit: z.coerce.number().optional(),
  messageQuota: z.coerce.number().optional(),
})

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json().catch(() => null)
    const parsed = schemaPayload.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'درخواست نامعتبر است.', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    if (parsed.data.schemaJson) {
      try {
        JSON.parse(parsed.data.schemaJson)
      } catch {
        return NextResponse.json(
          { error: 'متن اسکیمای پایگاه داده باید JSON معتبر باشد.' },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.aiDatabaseSchema.update({
      where: { id },
      data: {
        ...(parsed.data.name ? { name: parsed.data.name } : {}),
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description }
          : {}),
        ...(parsed.data.schemaJson ? { schemaJson: parsed.data.schemaJson } : {}),
        ...(parsed.data.rowLimit !== undefined
          ? { rowLimit: normalizeRowLimit(parsed.data.rowLimit) }
          : {}),
        ...(parsed.data.messageQuota !== undefined
          ? { messageQuota: normalizeMessageQuota(parsed.data.messageQuota) }
          : {}),
      },
    })

    return NextResponse.json({
      schema: {
        ...updated,
        rowLimit: normalizeRowLimit(updated.rowLimit),
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'خطا در ویرایش اسکیما.' },
      { status: 500 }
    )
  }
}
