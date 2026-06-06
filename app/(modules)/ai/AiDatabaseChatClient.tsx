'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Bot,
  MessageSquarePlus,
  Save,
  Send,
  Settings,
  User,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type DbSchema = {
  id: string
  name: string
  description: string
  schemaJson: string
  rowLimit: number
  messageQuota: number
  updatedAt: string
}

type ConversationListItem = {
  id: string
  title: string
  schemaId: string
  schemaName: string
  rowLimit: number
  messageQuota: number
  messageCount: number
  updatedAt: string
}

type ChatMessage = {
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
  | { type: 'message'; message: ChatMessage }
  | {
      type: 'assistantMeta'
      sql: string
      rowCount: number
      model?: string | null
      modelLabel?: string | null
    }
  | { type: 'assistantDelta'; content: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

type ActiveConversation = ConversationListItem & {
  messages: ChatMessage[]
}

type ConnectionHealth = {
  configured: boolean
  connected: boolean
  provider: 'sqlite' | 'sqlserver'
  message: string
  server?: string
  database?: string
}

type ConnectionStatusPayload = {
  sqlite: ConnectionHealth
  sqlServer: ConnectionHealth
  checkedAt: string
}

type SchemaForm = {
  id?: string
  name: string
  description: string
  schemaJson: string
  rowLimit: string
  messageQuota: string
}

type AiModelOption = {
  id: string
  label: string
  description: string
}

const DEFAULT_ROW_LIMIT = '50'
const MAX_ROW_LIMIT = 50

function createEmptySchemaForm(defaultSchemaJson: string): SchemaForm {
  return {
    name: '',
    description: '',
    schemaJson: defaultSchemaJson,
    rowLimit: DEFAULT_ROW_LIMIT,
    messageQuota: '100',
  }
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  const payload = text ? safeJsonParse(text) : null

  if (!response.ok) {
    throw new Error(
      payload?.error ??
        (text ? text.slice(0, 240) : 'درخواست با خطا روبه‌رو شد.')
    )
  }

  if (!payload) {
    throw new Error(
      text.startsWith('<!DOCTYPE html') || text.startsWith('<html')
        ? 'API به جای JSON صفحه HTML برگرداند. dev server را ری‌استارت کنید یا مسیر API را بررسی کنید.'
        : text || 'پاسخ API خالی یا نامعتبر است.'
    )
  }

  return payload as T
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function upsertStreamMessage(
  messages: ChatMessage[],
  pendingId: string,
  message: ChatMessage
) {
  const index = messages.findIndex(
    (item) => item.id === pendingId || item.id === message.id
  )

  if (index < 0) return [...messages, message]

  const next = [...messages]
  const existing = next[index]
  next[index] = {
    ...message,
    model: message.model ?? existing?.model,
    modelLabel: message.modelLabel ?? existing?.modelLabel,
  }
  return next
}

function parseChatStreamEvent(line: string) {
  const payload = safeJsonParse(line)

  if (!payload || typeof payload !== 'object' || !('type' in payload)) {
    throw new Error('پاسخ جریانی چت نامعتبر است.')
  }

  return payload as ChatStreamEvent
}

export function AiDatabaseChatClient({
  initialSchemas,
  initialConversations,
  defaultSchemaJson,
  modelOptions,
}: {
  initialSchemas: DbSchema[]
  initialConversations: ConversationListItem[]
  defaultSchemaJson: string
  modelOptions: AiModelOption[]
}) {
  const emptySchemaForm = useMemo(
    () => createEmptySchemaForm(defaultSchemaJson),
    [defaultSchemaJson]
  )
  const [schemas, setSchemas] = useState(initialSchemas)
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedSchemaId, setSelectedSchemaId] = useState(
    initialSchemas[0]?.id ?? ''
  )
  const [activeConversation, setActiveConversation] =
    useState<ActiveConversation | null>(null)
  const [schemaForm, setSchemaForm] = useState<SchemaForm>(
    initialSchemas[0] ? schemaToForm(initialSchemas[0]) : emptySchemaForm
  )
  const [message, setMessage] = useState('')
  const [selectedModelId, setSelectedModelId] = useState(
    modelOptions[0]?.id ?? ''
  )
  const [status, setStatus] = useState('')
  const [inlineStatus, setInlineStatus] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isSavingSchema, setIsSavingSchema] = useState(false)
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatusPayload | null>(null)
  const [isCheckingConnections, setIsCheckingConnections] = useState(true)

  const selectedSchema = useMemo(
    () => schemas.find((schema) => schema.id === selectedSchemaId),
    [schemas, selectedSchemaId]
  )

  const usedMessages = activeConversation?.messageCount ?? 0
  const messageQuota =
    selectedSchema?.messageQuota ?? activeConversation?.messageQuota ?? 0
  const selectedModel = useMemo(
    () => modelOptions.find((option) => option.id === selectedModelId),
    [modelOptions, selectedModelId]
  )

  useEffect(() => {
    let isMounted = true

    async function loadConnectionStatus() {
      setIsCheckingConnections(true)

      try {
        const payload = await fetch('/api/ai/database-chat/status').then(
          (response) => readJson<ConnectionStatusPayload>(response)
        )

        if (isMounted) {
          setConnectionStatus(payload)
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof Error
              ? error.message
              : 'خطا در بررسی اتصال پایگاه داده.'

          setConnectionStatus({
            sqlite: {
              configured: true,
              connected: false,
              provider: 'sqlite',
              message,
            },
            sqlServer: {
              configured: true,
              connected: false,
              provider: 'sqlserver',
              message,
            },
            checkedAt: new Date().toISOString(),
          })
        }
      } finally {
        if (isMounted) {
          setIsCheckingConnections(false)
        }
      }
    }

    loadConnectionStatus()

    return () => {
      isMounted = false
    }
  }, [])

  function schemaToForm(schema: DbSchema): SchemaForm {
    return {
      id: schema.id,
      name: schema.name,
      description: schema.description,
      schemaJson: schema.schemaJson,
      rowLimit: String(schema.rowLimit),
      messageQuota: String(schema.messageQuota),
    }
  }

  async function refreshConversations() {
    const payload = await fetch('/api/ai/database-chat/conversations').then(
      (response) =>
        readJson<{ conversations: ConversationListItem[] }>(response)
    )
    setConversations(payload.conversations)
    return payload.conversations
  }

  async function loadConversation(id: string) {
    try {
      setStatus('در حال بارگذاری گفتگو...')
      const payload = await fetch(
        `/api/ai/database-chat/conversations/${id}`
      ).then((response) =>
        readJson<{ conversation: ActiveConversation }>(response)
      )
      setActiveConversation(payload.conversation)
      setSelectedSchemaId(payload.conversation.schemaId)
      setStatus('')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'خطا در بارگذاری گفتگو.'
      )
    }
  }

  async function createConversation() {
    if (!selectedSchemaId) {
      setStatus('ابتدا یک اسکیمای ذخیره‌شده انتخاب کنید.')
      return
    }

    try {
      setStatus('در حال ساخت گفتگوی جدید...')
      const payload = await fetch('/api/ai/database-chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemaId: selectedSchemaId }),
      }).then((response) =>
        readJson<{ conversation: ConversationListItem }>(response)
      )

      await refreshConversations()
      await loadConversation(payload.conversation.id)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'خطا در ساخت گفتگو.')
    }
  }

  async function saveSchema(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSavingSchema(true)
    setStatus('در حال ذخیره تنظیمات اسکیمای پایگاه داده...')

    try {
      const payload = await fetch(
        schemaForm.id
          ? `/api/ai/database-chat/schemas/${schemaForm.id}`
          : '/api/ai/database-chat/schemas',
        {
          method: schemaForm.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: schemaForm.name,
            description: schemaForm.description,
            schemaJson: schemaForm.schemaJson,
            rowLimit: Number(schemaForm.rowLimit),
            messageQuota: Number(schemaForm.messageQuota),
          }),
        }
      ).then((response) => readJson<{ schema: DbSchema }>(response))

      setSchemas((current) => {
        const existing = current.some(
          (schema) => schema.id === payload.schema.id
        )
        return existing
          ? current.map((schema) =>
              schema.id === payload.schema.id ? payload.schema : schema
            )
          : [payload.schema, ...current]
      })
      setSelectedSchemaId(payload.schema.id)
      setSchemaForm(schemaToForm(payload.schema))
      setStatus('اسکیما ذخیره شد.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'خطا در ذخیره اسکیما.')
    } finally {
      setIsSavingSchema(false)
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || !activeConversation || isSending) return

    const conversationId = activeConversation.id
    const pendingTimestamp = Date.now()
    const pendingUserId = `pending-user-${pendingTimestamp}`
    const pendingAssistantId = `pending-assistant-${pendingTimestamp}`
    let streamCompleted = false

    setIsSending(true)
    setStatus('')
    setInlineStatus('در حال ارسال پیام...')
    setMessage('')

    try {
      const createdAt = new Date().toISOString()
      const optimisticUser: ChatMessage = {
        id: pendingUserId,
        role: 'user',
        content: trimmed,
        createdAt,
      }
      const optimisticAssistant: ChatMessage = {
        id: pendingAssistantId,
        role: 'assistant',
        content: '',
        model: selectedModelId || null,
        modelLabel: selectedModel?.label ?? selectedModelId ?? null,
        createdAt,
      }
      setActiveConversation((current) =>
        current
          ? {
              ...current,
              messages: [
                ...current.messages,
                optimisticUser,
                optimisticAssistant,
              ],
            }
          : current
      )

      const response = await fetch(
        `/api/ai/database-chat/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: trimmed,
            modelOptionId: selectedModelId,
          }),
        }
      )

      if (!response.ok) {
        await readJson<never>(response)
        throw new Error('خطا در ارسال پیام.')
      }

      if (!response.body) {
        throw new Error('پاسخ جریانی چت خالی است.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const handleStreamEvent = (streamEvent: ChatStreamEvent) => {
        if (streamEvent.type === 'status') {
          setInlineStatus(streamEvent.message)
          return
        }

        if (streamEvent.type === 'message') {
          const pendingId =
            streamEvent.message.role === 'user'
              ? pendingUserId
              : pendingAssistantId

          setActiveConversation((current) =>
            current
              ? {
                  ...current,
                  messages: upsertStreamMessage(
                    current.messages,
                    pendingId,
                    streamEvent.message
                  ),
                }
              : current
          )
          return
        }

        if (streamEvent.type === 'assistantMeta') {
          setActiveConversation((current) =>
            current
              ? {
                  ...current,
                  messages: current.messages.map((item) =>
                    item.id === pendingAssistantId
                        ? {
                            ...item,
                            sql: streamEvent.sql,
                            rowCount: streamEvent.rowCount,
                            model: streamEvent.model ?? item.model,
                            modelLabel:
                              streamEvent.modelLabel ?? item.modelLabel,
                          }
                        : item
                  ),
                }
              : current
          )
          return
        }

        if (streamEvent.type === 'assistantDelta') {
          setActiveConversation((current) =>
            current
              ? {
                  ...current,
                  messages: current.messages.map((item) =>
                    item.id === pendingAssistantId
                      ? {
                          ...item,
                          content: `${item.content}${streamEvent.content}`,
                        }
                      : item
                  ),
                }
              : current
          )
          return
        }

        if (streamEvent.type === 'done') {
          streamCompleted = true
          setInlineStatus('')
          return
        }

        if (streamEvent.type === 'error') {
          throw new Error(streamEvent.message)
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.trim()) {
            handleStreamEvent(parseChatStreamEvent(line))
          }
        }
      }

      buffer += decoder.decode()
      if (buffer.trim()) {
        handleStreamEvent(parseChatStreamEvent(buffer))
      }

      streamCompleted = true
      setInlineStatus('')

      const latest = await refreshConversations()
      const updated = latest.find((item) => item.id === conversationId)
      if (updated) {
        setActiveConversation((current) =>
          current ? { ...current, ...updated } : current
        )
      }
      setStatus('')
    } catch (error) {
      if (!streamCompleted) {
        setMessage(trimmed)
        setActiveConversation((current) =>
          current
            ? {
                ...current,
                messages: current.messages.filter(
                  (item) =>
                    item.id !== pendingUserId && item.id !== pendingAssistantId
                ),
              }
            : current
        )
      }
      setInlineStatus('')
      setStatus(error instanceof Error ? error.message : 'خطا در ارسال پیام.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div
      className="relative flex h-[calc(100svh-9rem)] max-h-[calc(100svh-9rem)] min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-4"
      dir="ltr"
    >
      <div className="from-background via-background to-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br" />
      <div className="relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden">
        <Tabs
          defaultValue="chat"
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="chat" className="gap-2">
              <Bot className="size-4" />
              گفتگو
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="size-4" />
              تنظیمات اسکیما
            </TabsTrigger>
          </TabsList>

          <TabsContent
            dir="rtl"
            value="chat"
            className="m-0 min-h-0 w-full min-w-0 flex-1 overflow-hidden"
          >
            <section className="grid h-full min-h-0 w-full min-w-0 grid-rows-[minmax(0,220px)_minmax(0,1fr)] gap-4 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)] lg:grid-rows-1">
              <aside
                className="flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden"
                dir="rtl"
              >
                <div className="border-border/60 bg-card/90 rounded-lg border p-3 shadow-sm">
                  <Label className="text-muted-foreground text-xs">
                    اسکیما
                  </Label>
                  <Select
                    value={selectedSchemaId}
                    onValueChange={setSelectedSchemaId}
                    disabled={!schemas.length}
                  >
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder="انتخاب اسکیما" />
                    </SelectTrigger>
                    <SelectContent>
                      {schemas.map((schema) => (
                        <SelectItem key={schema.id} value={schema.id}>
                          {schema.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Label className="text-muted-foreground mt-4 block text-xs">
                    مدل
                  </Label>
                  <Select
                    value={selectedModelId}
                    onValueChange={setSelectedModelId}
                    disabled={!modelOptions.length || isSending}
                  >
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder="انتخاب مدل" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedModel?.description ? (
                    <p className="text-muted-foreground mt-2 text-xs leading-5">
                      {selectedModel.description}
                    </p>
                  ) : null}
                  <Button
                    className="mt-3 w-full gap-2"
                    onClick={createConversation}
                    disabled={!selectedSchemaId}
                  >
                    <MessageSquarePlus className="size-4" />
                    گفتگوی جدید
                  </Button>
                </div>

                <ScrollArea className="min-h-0 min-w-0 flex-1 overflow-hidden [&_[data-slot=scroll-area-viewport]]:overflow-x-hidden">
                  <div className="space-y-2 pl-3">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => loadConversation(conversation.id)}
                        className={cn(
                          'border-border/60 bg-card/80 hover:bg-accent w-full rounded-lg border p-3 text-right text-sm shadow-sm transition',
                          activeConversation?.id === conversation.id &&
                            'border-primary/60 bg-accent'
                        )}
                      >
                        <span className="block truncate font-semibold">
                          {conversation.title}
                        </span>
                        <span className="text-muted-foreground mt-1 block truncate text-xs">
                          {conversation.schemaName}
                        </span>
                        <span className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
                          <span>{conversation.messageCount} پیام</span>
                          <span>
                            {new Date(
                              conversation.updatedAt
                            ).toLocaleDateString('fa-ir')}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </aside>

              <Card className="border-border/60 bg-card/90 flex h-full min-h-0 w-full min-w-0 flex-col gap-0 overflow-hidden rounded-lg border py-0 shadow-sm">
                <CardHeader className="shrink-0 space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl">
                        {activeConversation?.title ?? 'گفتگویی انتخاب نشده است'}
                      </CardTitle>
                      <CardDescription>
                        {activeConversation
                          ? activeConversation.schemaName
                          : 'برای شروع، یک اسکیما انتخاب و گفتگوی جدید بسازید.'}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        سقف ردیف:{' '}
                        {selectedSchema?.rowLimit ??
                          activeConversation?.rowLimit ??
                          0}
                      </Badge>
                      <Badge variant="outline">
                        سهمیه: {usedMessages}/{messageQuota}
                      </Badge>
                      {selectedModel ? (
                        <Badge variant="secondary">{selectedModel.label}</Badge>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent
                  dir="ltr"
                  className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4"
                >
                  <ScrollArea className="border-border/60 bg-background/50 min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border [&_[data-slot=scroll-area-viewport]]:overflow-x-hidden">
                    <div className="flex min-h-full min-w-0 flex-col gap-3 overflow-x-hidden p-3">
                      {!activeConversation?.messages.length ? (
                        <div className="text-muted-foreground flex min-h-full items-center justify-center text-center text-sm">
                          پیام‌های این گفتگو اینجا نمایش داده می‌شود.
                        </div>
                      ) : (
                        activeConversation.messages.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              'flex w-full min-w-0 gap-2',
                              item.role === 'user'
                                ? 'justify-end'
                                : 'justify-start'
                            )}
                          >
                            <div
                              className={cn(
                                'w-[min(42rem,82%)] max-w-full min-w-0 overflow-hidden rounded-lg border px-3 py-2 text-sm leading-7 [overflow-wrap:anywhere] break-words shadow-sm',
                                item.role === 'user'
                                  ? 'border-primary/20 bg-primary/10'
                                  : 'border-border/60 bg-card'
                              )}
                              dir={item.role === 'assistant' ? 'rtl' : 'rtl'}
                            >
                              <div className="text-muted-foreground mb-1 flex min-w-0 flex-wrap items-center gap-2 text-xs">
                                {item.role === 'user' ? (
                                  <User className="size-3.5" />
                                ) : (
                                  <Bot className="size-3.5" />
                                )}
                                <span>
                                  {item.role === 'user' ? 'شما' : 'دستیار'}
                                </span>
                                {item.role === 'assistant' &&
                                (item.modelLabel || item.model) ? (
                                  <span className="bg-muted/70 text-foreground/80 rounded px-1.5 py-0.5 font-medium">
                                    مدل:{' '}
                                    <span dir="ltr" className="inline-block">
                                      {item.modelLabel ?? item.model}
                                    </span>
                                  </span>
                                ) : null}
                                {item.rowCount !== null &&
                                item.rowCount !== undefined ? (
                                  <span>{item.rowCount} ردیف</span>
                                ) : null}
                              </div>
                              {item.id.startsWith('pending-assistant') &&
                              inlineStatus ? (
                                <div className="text-muted-foreground mb-2 text-xs">
                                  {inlineStatus}
                                </div>
                              ) : null}
                              {item.content ? (
                                <p
                                  className={cn(
                                    'max-w-full [overflow-wrap:anywhere] break-words whitespace-pre-wrap',
                                    item.role === 'assistant'
                                      ? 'text-right'
                                      : 'text-right'
                                  )}
                                  dir={
                                    item.role === 'assistant' ? 'rtl' : 'rtl'
                                  }
                                >
                                  {item.content}
                                </p>
                              ) : item.id.startsWith('pending-assistant') ? (
                                <p
                                  className="text-muted-foreground max-w-full text-right [overflow-wrap:anywhere] break-words whitespace-pre-wrap"
                                  dir="rtl"
                                >
                                  {inlineStatus || 'در حال آماده‌سازی پاسخ...'}
                                </p>
                              ) : null}
                              {item.sql ? (
                                <pre
                                  className="border-border/70 bg-muted/70 mt-3 max-w-full overflow-x-hidden rounded-md border p-2 text-left text-xs leading-5 [overflow-wrap:anywhere] break-words whitespace-pre-wrap shadow-inner"
                                  dir="ltr"
                                >
                                  {item.sql}
                                </pre>
                              ) : null}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  <form dir="rtl" onSubmit={sendMessage} className="flex gap-2">
                    <Textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="سوال خود را درباره داده‌ها بنویسید..."
                      className="min-h-12 flex-1 resize-none"
                      disabled={!activeConversation || isSending}
                    />
                    <Button
                      type="submit"
                      className="h-auto min-w-24 gap-2"
                      disabled={
                        !activeConversation || !message.trim() || isSending
                      }
                    >
                      <Send className="size-4" />
                      ارسال
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="settings" className="m-0 min-h-0 flex-1">
            <ScrollArea className="h-full min-h-0">
              <section className="grid gap-4 pl-3 lg:grid-cols-[minmax(0,1fr)_320px]">
                <Card className="border-border/60 bg-card/90 rounded-lg border shadow-sm">
                  <CardHeader>
                    <CardTitle>تنظیمات اسکیمای پایگاه داده</CardTitle>
                    <CardDescription>
                      JSON اسکیما، سقف ردیف‌های برگشتی و سهمیه پیام هر گفتگو را
                      ذخیره کنید.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={saveSchema} className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="schema-name">نام اسکیما</Label>
                          <Input
                            id="schema-name"
                            value={schemaForm.name}
                            onChange={(event) =>
                              setSchemaForm((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schema-description">توضیح</Label>
                          <Input
                            id="schema-description"
                            value={schemaForm.description}
                            onChange={(event) =>
                              setSchemaForm((current) => ({
                                ...current,
                                description: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="row-limit">سقف ردیف برگشتی</Label>
                          <Input
                            id="row-limit"
                            type="number"
                            min={1}
                            max={MAX_ROW_LIMIT}
                            value={schemaForm.rowLimit}
                            onChange={(event) =>
                              setSchemaForm((current) => ({
                                ...current,
                                rowLimit: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message-quota">
                            سهمیه پیام هر گفتگو
                          </Label>
                          <Input
                            id="message-quota"
                            type="number"
                            min={1}
                            max={1000}
                            value={schemaForm.messageQuota}
                            onChange={(event) =>
                              setSchemaForm((current) => ({
                                ...current,
                                messageQuota: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="schema-json">JSON اسکیما</Label>
                        <Textarea
                          id="schema-json"
                          dir="ltr"
                          className="min-h-[360px] font-mono text-sm"
                          value={schemaForm.schemaJson}
                          onChange={(event) =>
                            setSchemaForm((current) => ({
                              ...current,
                              schemaJson: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="submit"
                          className="gap-2"
                          disabled={isSavingSchema}
                        >
                          <Save className="size-4" />
                          ذخیره اسکیما
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSchemaForm(emptySchemaForm)}
                        >
                          اسکیمای جدید
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  {schemas.map((schema) => (
                    <button
                      key={schema.id}
                      type="button"
                      onClick={() => {
                        setSchemaForm(schemaToForm(schema))
                        setSelectedSchemaId(schema.id)
                      }}
                      className={cn(
                        'border-border/60 bg-card/90 hover:bg-accent w-full rounded-lg border p-3 text-left text-sm shadow-sm transition',
                        schemaForm.id === schema.id &&
                          'border-primary/60 bg-accent'
                      )}
                    >
                      <span className="block font-semibold">{schema.name}</span>
                      <span className="text-muted-foreground mt-1 block text-xs">
                        سقف {schema.rowLimit} ردیف، سهمیه {schema.messageQuota}{' '}
                        پیام
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {status ? (
          <div className="border-border/60 bg-card/90 text-muted-foreground rounded-lg border px-3 py-2 text-sm">
            {status}
          </div>
        ) : null}
      </div>
    </div>
  )
}
