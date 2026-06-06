import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { normalizeRowLimit } from '@/lib/ai-database-chat'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const conversation = await prisma.aiDbChatConversation.findUnique({
      where: { id },
      include: {
        schema: {
          select: {
            id: true,
            name: true,
            rowLimit: true,
            messageQuota: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            sql: true,
            rowCount: true,
            createdAt: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'گفتگو پیدا نشد.' }, { status: 404 })
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        schemaId: conversation.schemaId,
        schemaName: conversation.schema.name,
        rowLimit: normalizeRowLimit(conversation.schema.rowLimit),
        messageQuota: conversation.schema.messageQuota,
        messageCount: conversation._count.messages,
        updatedAt: conversation.updatedAt.toISOString(),
        messages: conversation.messages.map((message) => ({
          ...message,
          createdAt: message.createdAt.toISOString(),
        })),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'خطا در دریافت گفتگو.' },
      { status: 500 }
    )
  }
}
