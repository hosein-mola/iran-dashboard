import { NextResponse } from 'next/server'
import { z } from 'zod'

import prisma from '@/lib/prisma'
import { normalizeRowLimit } from '@/lib/ai-database-chat'

const createConversationPayload = z.object({
  schemaId: z.string().min(1),
  title: z.string().trim().min(1).optional(),
})

export async function GET() {
  try {
    const conversations = await prisma.aiDbChatConversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        schema: {
          select: {
            id: true,
            name: true,
            rowLimit: true,
            messageQuota: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    })

    return NextResponse.json({
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        schemaId: conversation.schemaId,
        schemaName: conversation.schema.name,
        rowLimit: normalizeRowLimit(conversation.schema.rowLimit),
        messageQuota: conversation.schema.messageQuota,
        messageCount: conversation._count.messages,
        updatedAt: conversation.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'خطا در دریافت گفتگوها.' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = createConversationPayload.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'درخواست نامعتبر است.', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const schema = await prisma.aiDatabaseSchema.findFirst({
      where: { id: parsed.data.schemaId, active: true },
      select: { id: true, name: true },
    })

    if (!schema) {
      return NextResponse.json(
        { error: 'اسکیمای انتخاب‌شده پیدا نشد.' },
        { status: 404 }
      )
    }

    const conversation = await prisma.aiDbChatConversation.create({
      data: {
        schemaId: schema.id,
        title: parsed.data.title ?? `گفتگو با ${schema.name}`,
      },
    })

    return NextResponse.json(
      {
        conversation: {
          id: conversation.id,
          title: conversation.title,
          schemaId: conversation.schemaId,
          updatedAt: conversation.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'خطا در ساخت گفتگو.' },
      { status: 500 }
    )
  }
}
