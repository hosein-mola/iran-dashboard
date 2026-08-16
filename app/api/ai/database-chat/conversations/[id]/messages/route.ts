import { NextResponse } from 'next/server'
import { z } from 'zod'

import prisma from '@/lib/prisma'
import {
  DATABASE_CHAT_HISTORY_LIMIT,
  answerDatabaseQuestion,
  type DatabaseQueryData,
} from '@/lib/ai-database-chat'
import {
  AI_MODEL_OPTION_IDS,
  normalizeAiModelOptionId,
} from '@/lib/ai-model-options'

const sendMessagePayload = z.object({
  content: z.string().trim().min(1),
  modelOptionId: z.enum(AI_MODEL_OPTION_IDS).optional(),
  includePreviousMessages: z.boolean().optional().default(true),
  editMessageId: z.string().optional(),
})

type SerializedChatMessage = {
  id: string
  role: string
  content: string
  sql?: string | null
  rowCount?: number | null
  model?: string | null
  modelLabel?: string | null
  reasoning?: string | null
  data?: DatabaseQueryData | null
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
  | { type: 'assistantData'; data: DatabaseQueryData }
  | { type: 'assistantReasoningDelta'; content: string }
  | { type: 'assistantDelta'; content: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

type RouteContext = {
  params: Promise<{ id: string }>
}

function serializeChatMessage(
  message: {
    id: string
    role: string
    content: string
    sql?: string | null
    rowCount?: number | null
    resultJson?: string | null
    model?: string | null
    modelLabel?: string | null
    createdAt: Date
  },
  metadata?: {
    model?: string | null
    modelLabel?: string | null
    reasoning?: string | null
  }
): SerializedChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    sql: message.sql,
    rowCount: message.rowCount,
    model: metadata?.model ?? message.model,
    modelLabel: metadata?.modelLabel ?? message.modelLabel,
    reasoning: metadata?.reasoning,
    data: parseResultJson(message.resultJson),
    createdAt: message.createdAt.toISOString(),
  }
}

function parseResultJson(resultJson?: string | null): DatabaseQueryData | null {
  if (!resultJson) return null

  try {
    const parsed = JSON.parse(resultJson) as DatabaseQueryData
    return Array.isArray(parsed.columns) && Array.isArray(parsed.rows)
      ? parsed
      : null
  } catch {
    return null
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

    let branchHistoryMessages = [...conversation.messages].reverse()
    let deleteFromEditMessageIds: string[] = []
    let remainingMessageCount = conversation._count.messages

    if (parsed.data.editMessageId) {
      const conversationMessages = await prisma.aiDbChatMessage.findMany({
        where: { conversationId: conversation.id },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          role: true,
          content: true,
          sql: true,
          rowCount: true,
          createdAt: true,
        },
      })
      const editIndex = conversationMessages.findIndex(
        (message) => message.id === parsed.data.editMessageId
      )
      const editMessage = conversationMessages[editIndex]

      if (!editMessage || editMessage.role !== 'user') {
        return NextResponse.json(
          { error: 'پیام قابل ویرایش پیدا نشد.' },
          { status: 404 }
        )
      }

      deleteFromEditMessageIds = conversationMessages
        .slice(editIndex)
        .map((message) => message.id)
      remainingMessageCount =
        conversation._count.messages - deleteFromEditMessageIds.length
      branchHistoryMessages = conversationMessages
        .slice(0, editIndex)
        .slice(-DATABASE_CHAT_HISTORY_LIMIT)
    }

    if (remainingMessageCount + 2 > conversation.schema.messageQuota) {
      return NextResponse.json(
        { error: 'سهمیه پیام این گفتگو تمام شده است.' },
        { status: 429 }
      )
    }

    const encoder = new TextEncoder()

    return new Response(
      new ReadableStream<Uint8Array>({
        async start(controller) {
          const send = (event: ChatStreamEvent) => {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
          }

          try {
            if (deleteFromEditMessageIds.length) {
              send({
                type: 'status',
                message: 'در حال حذف پیام‌های بعد از نقطه ویرایش...',
              })
              await prisma.aiDbChatMessage.deleteMany({
                where: {
                  conversationId: conversation.id,
                  id: { in: deleteFromEditMessageIds },
                },
              })
            }

            send({ type: 'status', message: 'در حال ثبت پیام شما...' })

            const userMessage = await prisma.aiDbChatMessage.create({
              data: {
                conversationId: conversation.id,
                role: 'user',
                content: parsed.data.content,
              },
            })

            if (
              conversation.title === 'گفتگوی جدید' ||
              remainingMessageCount === 0
            ) {
              await prisma.aiDbChatConversation.update({
                where: { id: conversation.id },
                data: { title: parsed.data.content.slice(0, 64) },
              })
            }

            send({
              type: 'message',
              message: serializeChatMessage(userMessage),
            })

            const historyMessages = parsed.data.includePreviousMessages
              ? branchHistoryMessages
              : []

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
                onAnswerData: (data) => send({ type: 'assistantData', data }),
                onReasoningDelta: (content) =>
                  send({ type: 'assistantReasoningDelta', content }),
                onAnswerDelta: (content) =>
                  send({ type: 'assistantDelta', content }),
              },
            })

            send({ type: 'status', message: 'در حال ذخیره پاسخ نهایی...' })

            const assistantMessage = await prisma.aiDbChatMessage.create({
              data: {
                conversationId: conversation.id,
                role: 'assistant',
                content: result.answer,
                sql: result.sql,
                rowCount: result.rowCount,
                resultJson: JSON.stringify(result.data),
                model: result.model,
                modelLabel: result.modelLabel,
              },
            })

            send({
              type: 'message',
              message: serializeChatMessage(assistantMessage, {
                model: result.model,
                modelLabel: result.modelLabel,
                reasoning: result.reasoning,
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
      }),
      {
        headers: {
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      }
    )
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
