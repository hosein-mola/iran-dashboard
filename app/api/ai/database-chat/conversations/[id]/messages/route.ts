import { NextResponse } from 'next/server'
import { z } from 'zod'

import prisma from '@/lib/prisma'
import {
  DATABASE_CHAT_HISTORY_LIMIT,
  answerDatabaseQuestion,
} from '@/lib/ai-database-chat'
import {
  AI_MODEL_OPTION_IDS,
  normalizeAiModelOptionId,
} from '@/lib/ai-model-options'

const sendMessagePayload = z.object({
  content: z.string().trim().min(1),
  modelOptionId: z.enum(AI_MODEL_OPTION_IDS).optional(),
})

type SerializedChatMessage = {
  id: string
  role: string
  content: string
  sql?: string | null
  rowCount?: number | null
  model?: string | null
  modelLabel?: string | null
  createdAt: string
}

type ChatStreamEvent =
  | { type: 'status'; message: string }
  | { type: 'message'; message: SerializedChatMessage }
  | {
      type: 'assistantMeta'
      sql: string
      rowCount: number
      model: string
      modelLabel: string
    }
  | { type: 'assistantDelta'; content: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

type RouteContext = {
  params: Promise<{ id: string }>
}

function serializeChatMessage(message: {
  id: string
  role: string
  content: string
  sql?: string | null
  rowCount?: number | null
  createdAt: Date
}, metadata?: {
  model?: string | null
  modelLabel?: string | null
}): SerializedChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    sql: message.sql,
    rowCount: message.rowCount,
    model: metadata?.model,
    modelLabel: metadata?.modelLabel,
    createdAt: message.createdAt.toISOString(),
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json().catch(() => null)
    const parsed = sendMessagePayload.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'متن پیام معتبر نیست.', issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const conversation = await prisma.aiDbChatConversation.findUnique({
      where: { id },
      include: {
        schema: true,
        messages: {
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: DATABASE_CHAT_HISTORY_LIMIT,
          select: {
            role: true,
            content: true,
            sql: true,
            rowCount: true,
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

    if (conversation._count.messages + 2 > conversation.schema.messageQuota) {
      return NextResponse.json(
        { error: 'سهمیه پیام این گفتگو تمام شده است.' },
        { status: 429 }
      )
    }

    const encoder = new TextEncoder()

    return new Response(new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: ChatStreamEvent) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
        }

        try {
          send({ type: 'status', message: 'در حال ثبت پیام...' })

          const userMessage = await prisma.aiDbChatMessage.create({
            data: {
              conversationId: conversation.id,
              role: 'user',
              content: parsed.data.content,
            },
          })

          if (conversation.title === 'گفتگوی جدید') {
            await prisma.aiDbChatConversation.update({
              where: { id: conversation.id },
              data: { title: parsed.data.content.slice(0, 64) },
            })
          }

          send({
            type: 'message',
            message: serializeChatMessage(userMessage),
          })

          const historyMessages = [...conversation.messages].reverse()

          const result = await answerDatabaseQuestion({
            modelOptionId: normalizeAiModelOptionId(
              parsed.data.modelOptionId
            ),
            schemaJson: conversation.schema.schemaJson,
            rowLimit: conversation.schema.rowLimit,
            history: historyMessages
              .filter(
                (message) =>
                  message.role === 'user' || message.role === 'assistant'
              )
              .map((message) => ({
                role: message.role as 'user' | 'assistant',
                content: message.content,
                sql: message.sql,
                rowCount: message.rowCount,
              })),
            question: parsed.data.content,
            streamAnswer: true,
            callbacks: {
              onStatus: (message) => send({ type: 'status', message }),
              onAnswerMeta: (meta) =>
                send({
                  type: 'assistantMeta',
                  sql: meta.sql,
                  rowCount: meta.rowCount,
                  model: meta.model,
                  modelLabel: meta.modelLabel,
                }),
              onAnswerDelta: (content) =>
                send({ type: 'assistantDelta', content }),
            },
          })

          send({ type: 'status', message: 'در حال ذخیره پاسخ...' })

          const assistantMessage = await prisma.aiDbChatMessage.create({
            data: {
              conversationId: conversation.id,
              role: 'assistant',
              content: result.answer,
              sql: result.sql,
              rowCount: result.rowCount,
            },
          })

          send({
            type: 'message',
            message: serializeChatMessage(assistantMessage, {
              model: result.model,
              modelLabel: result.modelLabel,
            }),
          })
          send({ type: 'done' })
        } catch (error) {
          send({
            type: 'error',
            message: error instanceof Error ? error.message : 'خطای ناشناخته',
          })
        } finally {
          controller.close()
        }
      },
    }), {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطای ناشناخته'
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    )
  }
}
