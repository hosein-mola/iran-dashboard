import prisma from '@/lib/prisma'
import { getDefaultDatabaseSchemaJson } from '@/lib/ai-database-chat'

import { AiDatabaseChatClient } from './AiDatabaseChatClient'

export const dynamic = 'force-dynamic'

export default async function AIPage() {
  const [schemas, conversations] = await Promise.all([
    prisma.aiDatabaseSchema.findMany({
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
    }),
    prisma.aiDbChatConversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        schema: {
          select: {
            name: true,
            rowLimit: true,
            messageQuota: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    }),
  ])

  return (
    <AiDatabaseChatClient
      initialSchemas={schemas.map((schema) => ({
        ...schema,
        updatedAt: schema.updatedAt.toISOString(),
      }))}
      defaultSchemaJson={getDefaultDatabaseSchemaJson()}
      initialConversations={conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        schemaId: conversation.schemaId,
        schemaName: conversation.schema.name,
        rowLimit: conversation.schema.rowLimit,
        messageQuota: conversation.schema.messageQuota,
        messageCount: conversation._count.messages,
        updatedAt: conversation.updatedAt.toISOString(),
      }))}
    />
  )
}
