'use client'

import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type SVGProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Bot,
  MessageSquarePlus,
  Pencil,
  Save,
  Send,
  Settings,
  User,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { AiResultGrid } from '@/components/ai-result-grid'
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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  AI_MODEL_SELECTION_COOKIE,
  AI_MODEL_SELECTION_COOKIE_MAX_AGE,
} from '@/lib/ai-model-options'
import { cn } from '@/lib/utils'
import type { DatabaseQueryData } from '@/lib/ai-database-chat'

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
  reasoning?: string | null
  data?: DatabaseQueryData | null
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
  | { type: 'assistantData'; data: DatabaseQueryData }
  | { type: 'assistantReasoningDelta'; content: string }
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

type SchemaFieldSuggestion = {
  column: string
  label: string
  description?: string
}

type FieldAutocompleteMatch = {
  start: number
  end: number
  query: string
  suggestions: SchemaFieldSuggestion[]
}

const DEFAULT_ROW_LIMIT = '50'
const MAX_ROW_LIMIT = 50
const CHAT_BACKGROUND_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='112' viewBox='0 0 112 112'%3E%3Cg fill='none' stroke='%23806f57' stroke-opacity='.18' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cellipse cx='22' cy='24' rx='5.5' ry='10' transform='rotate(-28 22 24)'/%3E%3Cpath d='M21 15c-2.5 5-1.5 11 2 18'/%3E%3Cellipse cx='82' cy='18' rx='4.8' ry='8.5' transform='rotate(32 82 18)'/%3E%3Cpath d='M84 11c1.5 4.8.4 10-3.4 15'/%3E%3Cellipse cx='56' cy='58' rx='5.2' ry='9.6' transform='rotate(18 56 58)'/%3E%3Cpath d='M58 50c1 5-.3 10.6-4 16'/%3E%3Cellipse cx='24' cy='90' rx='4.8' ry='8.8' transform='rotate(35 24 90)'/%3E%3Cpath d='M27 83c.8 4.8-.9 10-5 15'/%3E%3Cellipse cx='92' cy='86' rx='5.4' ry='9.5' transform='rotate(-22 92 86)'/%3E%3Cpath d='M91 78c-2 5-1.2 10.8 2.4 16'/%3E%3Cpath d='M43 20c3-4 7-4 10 0M41 23c5 3 10 3 15 0M72 52c2.5-3 6.5-3 9 0M70 55c4 2.8 8.5 2.8 13 0M42 86c3.2-3.8 7.4-3.8 10.6 0M40 89c4.8 2.8 9.8 2.8 14.6 0'/%3E%3Ccircle cx='8' cy='55' r='1.4'/%3E%3Ccircle cx='101' cy='42' r='1.2'/%3E%3Ccircle cx='63' cy='101' r='1.3'/%3E%3C/g%3E%3C/svg%3E\")"
const CHAT_BACKGROUND_PATTERN_DARK = CHAT_BACKGROUND_PATTERN.replace(
  '%23806f57',
  '%23c7b99e'
).replace("stroke-opacity='.18'", "stroke-opacity='.16'")

function normalizeAutocompleteText(value: string) {
  return value
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .trim()
    .toLocaleLowerCase('fa-IR')
}

function getSchemaFieldSuggestions(schemaJson: string) {
  const suggestions = new Map<string, SchemaFieldSuggestion>()

  try {
    const visit = (value: unknown) => {
      if (Array.isArray(value)) {
        value.forEach(visit)
        return
      }
      if (!value || typeof value !== 'object') return

      const item = value as Record<string, unknown>
      const column = [item.name, item.column, item.c].find(
        (candidate): candidate is string =>
          typeof candidate === 'string' && Boolean(candidate.trim())
      )
      const label = [item.label, item.fa, item.title, item.displayName].find(
        (candidate): candidate is string =>
          typeof candidate === 'string' && /[\u0600-\u06ff]/.test(candidate)
      )
      const description = [item.description, item.desc].find(
        (candidate): candidate is string =>
          typeof candidate === 'string' && Boolean(candidate.trim())
      )

      if (column && label) {
        suggestions.set(`${column}\u0000${label}`, {
          column: column.trim(),
          label: label.trim(),
          description: description?.trim(),
        })
      }

      Object.values(item).forEach(visit)
    }

    visit(JSON.parse(schemaJson))
  } catch {
    return []
  }

  return [...suggestions.values()]
}

function getFieldAutocompleteMatch(
  value: string,
  cursorPosition: number,
  fields: SchemaFieldSuggestion[]
): FieldAutocompleteMatch | null {
  const beforeCursor = value.slice(0, cursorPosition)
  const boundaryIndex = Math.max(
    beforeCursor.lastIndexOf('\n'),
    beforeCursor.lastIndexOf('،'),
    beforeCursor.lastIndexOf(','),
    beforeCursor.lastIndexOf(':'),
    beforeCursor.lastIndexOf('؛'),
    beforeCursor.lastIndexOf('?'),
    beforeCursor.lastIndexOf('؟'),
    beforeCursor.lastIndexOf('!')
  )
  const segmentStart = boundaryIndex + 1
  const segment = beforeCursor.slice(segmentStart)
  const candidateStarts = [0]

  for (const match of segment.matchAll(/\s+/g)) {
    candidateStarts.push((match.index ?? 0) + match[0].length)
  }

  for (const relativeStart of candidateStarts) {
    const rawQuery = segment.slice(relativeStart)
    const leadingWhitespace = rawQuery.length - rawQuery.trimStart().length
    const query = rawQuery.trim()
    const normalizedQuery = normalizeAutocompleteText(query)
    if (normalizedQuery.length < 2) continue

    const matchingFields = fields
      .flatMap((field) => {
        const normalizedLabel = normalizeAutocompleteText(field.label)
        const normalizedColumn = field.column.toLocaleLowerCase('en-US')
        const labelPosition = normalizedLabel.indexOf(normalizedQuery)
        const columnPosition = normalizedColumn.indexOf(normalizedQuery)

        if (normalizedLabel === normalizedQuery) return []
        if (labelPosition < 0 && columnPosition < 0) return []

        return [
          {
            field,
            rank:
              labelPosition === 0
                ? 0
                : labelPosition > 0
                  ? 1
                  : columnPosition === 0
                    ? 2
                    : 3,
          },
        ]
      })
      .sort(
        (left, right) =>
          left.rank - right.rank ||
          left.field.label.localeCompare(right.field.label, 'fa')
      )
      .slice(0, 7)
      .map(({ field }) => field)

    if (matchingFields.length) {
      return {
        start: segmentStart + relativeStart + leadingWhitespace,
        end: cursorPosition,
        query,
        suggestions: matchingFields,
      }
    }
  }

  return null
}

function NoConversationSelectedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 128 128" fill="none" aria-hidden="true" {...props}>
      <path
        d="M26 41c0-12.2 9.8-22 22-22h37c12.2 0 22 9.8 22 22v29c0 12.2-9.8 22-22 22H66l-19.8 15.5c-2.6 2-6.2.2-6.2-3.1V91.1C31.9 88 26 80.2 26 71V41Z"
        className="fill-primary/10 stroke-primary/35"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M44 47h42M44 61h32M44 75h22"
        className="stroke-foreground/50"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M93 28c5 1.8 8.8 5.9 10.1 11M21.8 62.5c-3.7 2.4-6.1 6.6-6.1 11.4M88.6 101.5c4.7-.2 8.9-2.5 11.6-6.1"
        className="stroke-muted-foreground/35"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="92" cy="39" r="4" className="fill-primary/35" />
      <circle cx="25" cy="78" r="3.5" className="fill-muted-foreground/30" />
    </svg>
  )
}

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
    reasoning: message.reasoning ?? existing?.reasoning,
    data: message.data ?? existing?.data,
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
  defaultModelOptionId,
  modelOptions,
}: {
  initialSchemas: DbSchema[]
  initialConversations: ConversationListItem[]
  defaultSchemaJson: string
  defaultModelOptionId: string
  modelOptions: AiModelOption[]
}) {
  const normalizedDefaultModelId =
    modelOptions.find((option) => option.id === defaultModelOptionId)?.id ??
    modelOptions[0]?.id ??
    ''
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
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const [messageCursorPosition, setMessageCursorPosition] = useState(0)
  const [activeFieldSuggestionIndex, setActiveFieldSuggestionIndex] =
    useState(0)
  const [isFieldAutocompleteOpen, setIsFieldAutocompleteOpen] = useState(true)
  const [selectedModelId, setSelectedModelId] = useState(
    normalizedDefaultModelId
  )
  const [includePreviousMessages, setIncludePreviousMessages] = useState(true)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
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
  const autocompleteSchema = useMemo(
    () =>
      schemas.find(
        (schema) =>
          schema.id === (activeConversation?.schemaId ?? selectedSchemaId)
      ),
    [activeConversation?.schemaId, schemas, selectedSchemaId]
  )
  const schemaFieldSuggestions = useMemo(
    () => getSchemaFieldSuggestions(autocompleteSchema?.schemaJson ?? ''),
    [autocompleteSchema?.schemaJson]
  )
  const fieldAutocomplete = useMemo(
    () =>
      isFieldAutocompleteOpen && activeConversation && !isSending
        ? getFieldAutocompleteMatch(
            message,
            messageCursorPosition,
            schemaFieldSuggestions
          )
        : null,
    [
      activeConversation,
      isFieldAutocompleteOpen,
      isSending,
      message,
      messageCursorPosition,
      schemaFieldSuggestions,
    ]
  )

  const usedMessages = activeConversation?.messageCount ?? 0
  const messageQuota =
    selectedSchema?.messageQuota ?? activeConversation?.messageQuota ?? 0
  const selectedModel = useMemo(
    () => modelOptions.find((option) => option.id === selectedModelId),
    [modelOptions, selectedModelId]
  )

  function selectModel(modelId: string) {
    if (!modelOptions.some((option) => option.id === modelId)) return

    setSelectedModelId(modelId)
    document.cookie = `${AI_MODEL_SELECTION_COOKIE}=${encodeURIComponent(modelId)}; path=/; max-age=${AI_MODEL_SELECTION_COOKIE_MAX_AGE}; samesite=lax`
  }

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
      setEditingMessageId(null)
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

  function insertFieldSuggestion(suggestion: SchemaFieldSuggestion) {
    if (!fieldAutocomplete) return

    const suffix = message.slice(fieldAutocomplete.end)
    const trailingSpace = suffix.length === 0 ? ' ' : ''
    const insertedValue = `${suggestion.label}${trailingSpace}`
    const nextMessage = `${message.slice(0, fieldAutocomplete.start)}${insertedValue}${suffix}`
    const nextCursorPosition = fieldAutocomplete.start + insertedValue.length

    setMessage(nextMessage)
    setMessageCursorPosition(nextCursorPosition)
    setIsFieldAutocompleteOpen(false)

    window.requestAnimationFrame(() => {
      messageInputRef.current?.focus()
      messageInputRef.current?.setSelectionRange(
        nextCursorPosition,
        nextCursorPosition
      )
    })
  }

  function handleMessageKeyDown(
    event: ReactKeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.nativeEvent.isComposing) return

    const suggestions = fieldAutocomplete?.suggestions ?? []

    if (suggestions.length && event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveFieldSuggestionIndex(
        (current) => (current + 1) % suggestions.length
      )
      return
    }

    if (suggestions.length && event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveFieldSuggestionIndex(
        (current) => (current - 1 + suggestions.length) % suggestions.length
      )
      return
    }

    if (
      suggestions.length &&
      ((event.key === 'Enter' && !event.shiftKey) || event.key === 'Tab')
    ) {
      event.preventDefault()
      insertFieldSuggestion(
        suggestions[
          Math.min(activeFieldSuggestionIndex, suggestions.length - 1)
        ]
      )
      return
    }

    if (suggestions.length && event.key === 'Escape') {
      event.preventDefault()
      setIsFieldAutocompleteOpen(false)
      return
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  function startEditingMessage(messageToEdit: ChatMessage) {
    if (messageToEdit.role !== 'user' || isSending) return

    setEditingMessageId(messageToEdit.id)
    setMessage(messageToEdit.content)
    setMessageCursorPosition(messageToEdit.content.length)
    setIsFieldAutocompleteOpen(true)
    setStatus(
      'ویرایش فعال است؛ با ارسال، این پیام و پاسخ‌های بعد از آن دوباره ساخته می‌شوند.'
    )
  }

  function cancelEditingMessage() {
    setEditingMessageId(null)
    setMessage('')
    setMessageCursorPosition(0)
    setIsFieldAutocompleteOpen(false)
    setStatus('')
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || !activeConversation || isSending) return

    const conversationId = activeConversation.id
    const editMessageId = editingMessageId
    const previousMessages = activeConversation.messages
    const editIndex = editMessageId
      ? previousMessages.findIndex(
          (item) => item.id === editMessageId && item.role === 'user'
        )
      : -1

    if (editMessageId && editIndex < 0) {
      setStatus('پیام قابل ویرایش پیدا نشد.')
      return
    }

    const branchMessages = editMessageId
      ? previousMessages.slice(0, editIndex)
      : previousMessages
    const pendingTimestamp = Date.now()
    const pendingUserId = `pending-user-${pendingTimestamp}`
    const pendingAssistantId = `pending-assistant-${pendingTimestamp}`
    let streamCompleted = false

    setIsSending(true)
    setStatus('')
    setInlineStatus('در حال ارسال پیام...')
    setMessage('')
    setMessageCursorPosition(0)
    setIsFieldAutocompleteOpen(false)
    setEditingMessageId(null)

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
        current?.id === conversationId
          ? {
              ...current,
              messages: [
                ...branchMessages,
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
            includePreviousMessages,
            editMessageId: editMessageId ?? undefined,
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
                          modelLabel: streamEvent.modelLabel ?? item.modelLabel,
                        }
                      : item
                  ),
                }
              : current
          )
          return
        }

        if (streamEvent.type === 'assistantData') {
          setActiveConversation((current) =>
            current
              ? {
                  ...current,
                  messages: current.messages.map((item) =>
                    item.id === pendingAssistantId
                      ? { ...item, data: streamEvent.data }
                      : item
                  ),
                }
              : current
          )
          return
        }

        if (streamEvent.type === 'assistantDelta') {
          setInlineStatus('در حال دریافت پاسخ...')
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

        if (streamEvent.type === 'assistantReasoningDelta') {
          setInlineStatus('در حال دریافت روند استدلال...')
          setActiveConversation((current) =>
            current
              ? {
                  ...current,
                  messages: current.messages.map((item) =>
                    item.id === pendingAssistantId
                      ? {
                          ...item,
                          reasoning: `${item.reasoning ?? ''}${streamEvent.content}`,
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
        if (editMessageId) {
          setEditingMessageId(editMessageId)
        }
        setActiveConversation((current) =>
          current?.id === conversationId
            ? {
                ...current,
                messages: editMessageId
                  ? previousMessages
                  : current.messages.filter(
                      (item) =>
                        item.id !== pendingUserId &&
                        item.id !== pendingAssistantId
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
      <div
        className="pointer-events-none absolute inset-0 bg-repeat opacity-70 mix-blend-multiply dark:opacity-25 dark:mix-blend-screen"
        style={{
          backgroundImage: CHAT_BACKGROUND_PATTERN,
          backgroundSize: '112px 112px',
        }}
      />
      <div className="relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden">
        <Tabs
          defaultValue="chat"
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden"
        >
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
            <div
              className="border-border/60 bg-card/90 flex h-10 items-center justify-center gap-2 rounded-lg border px-3 py-1 text-sm leading-none shadow-sm"
              dir="rtl"
            >
              <Switch
                id="include-previous-messages"
                checked={includePreviousMessages}
                onCheckedChange={setIncludePreviousMessages}
                disabled={isSending}
                aria-label="استفاده از پیام‌های قبلی"
                dir="ltr"
              />
              <Label
                htmlFor="include-previous-messages"
                className="text-muted-foreground cursor-pointer text-xs leading-none"
              >
                پیام‌های قبلی
              </Label>
            </div>
            <TabsList className="border-border/60 bg-card/90 grid h-10 w-full max-w-md grid-cols-2 rounded-lg border p-1 shadow-sm">
              <TabsTrigger value="chat" className="h-full gap-2 px-3 py-1">
                <Bot className="size-4" />
                گفتگو
              </TabsTrigger>
              <TabsTrigger value="settings" className="h-full gap-2 px-3 py-1">
                <Settings className="size-4" />
                تنظیمات اسکیما
              </TabsTrigger>
            </TabsList>
          </div>

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
                    onValueChange={selectModel}
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
                        <span className="block font-semibold">
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
                  <ScrollArea
                    className="border-border/60 bg-background/80 dark:bg-background/60 min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border [background-image:var(--chat-bg-pattern)] [background-size:112px_112px] [background-repeat:repeat] dark:[background-image:var(--chat-bg-pattern-dark)] [&_[data-slot=scroll-area-viewport]]:overflow-x-hidden [&_[data-slot=scroll-area-viewport]>div]:!h-full"
                    style={
                      {
                        '--chat-bg-pattern': CHAT_BACKGROUND_PATTERN,
                        '--chat-bg-pattern-dark': CHAT_BACKGROUND_PATTERN_DARK,
                      } as CSSProperties
                    }
                  >
                    <div
                      className={cn(
                        'flex h-full min-h-full min-w-0 flex-col gap-3 overflow-x-hidden',
                        !activeConversation?.messages.length ? 'p-0' : 'p-3'
                      )}
                    >
                      {!activeConversation?.messages.length ? (
                        <div
                          className="grid h-full min-h-full flex-1 place-items-center px-4 text-center"
                          dir="rtl"
                        >
                          <div className="flex max-w-80 flex-col items-center justify-center gap-4">
                            <NoConversationSelectedIcon className="text-primary/85 size-28" />
                            <div className="space-y-1.5">
                              <p className="text-foreground text-base font-semibold">
                                {activeConversation
                                  ? 'هنوز پیامی ثبت نشده است'
                                  : 'گفتگویی انتخاب نشده است'}
                              </p>
                              <p className="text-muted-foreground text-sm leading-6">
                                پیام‌های این گفتگو اینجا نمایش داده می‌شود.
                              </p>
                            </div>
                          </div>
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
                                'min-w-0 overflow-hidden rounded-2xl border px-3 py-2 text-sm leading-6 [overflow-wrap:anywhere] break-words shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.22)]',
                                item.role === 'assistant' && item.data
                                  ? 'w-[64rem] max-w-[92%]'
                                  : 'w-[34rem] max-w-[92%]',
                                item.role === 'user'
                                  ? 'border-primary/25 bg-primary/15 dark:bg-primary/20 rounded-br-sm'
                                  : 'border-border/70 bg-card/95 rounded-bl-sm'
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
                                {item.role === 'user' ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground h-6 w-6"
                                    onClick={() => startEditingMessage(item)}
                                    disabled={isSending}
                                    title="ویرایش از این پیام"
                                    aria-label="ویرایش از این پیام"
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
                                ) : null}
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
                              {item.role === 'assistant' && item.reasoning ? (
                                <div
                                  className="border-border/60 bg-muted/40 mb-3 max-h-36 overflow-y-auto rounded-md border p-2 text-right text-xs leading-5"
                                  dir="rtl"
                                >
                                  <div className="text-muted-foreground mb-1 font-medium">
                                    روند استدلال
                                  </div>
                                  <p
                                    className="text-muted-foreground [overflow-wrap:anywhere] break-words whitespace-pre-wrap"
                                    dir="auto"
                                  >
                                    {item.reasoning}
                                  </p>
                                </div>
                              ) : null}
                              {item.role === 'assistant' && item.data ? (
                                <AiResultGrid data={item.data} />
                              ) : null}
                              {item.content ? (
                                <p
                                  className={cn(
                                    'max-w-full [overflow-wrap:anywhere] break-words whitespace-pre-wrap',
                                    item.role === 'assistant'
                                      ? cn(
                                          'text-right',
                                          item.data ? 'mt-3' : null
                                        )
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

                  {editingMessageId ? (
                    <div
                      className="border-primary/30 bg-primary/5 flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                      dir="rtl"
                    >
                      <span className="text-muted-foreground">
                        ویرایش از این پیام فعال است؛ پیام‌های بعدی دوباره ساخته
                        می‌شوند.
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={cancelEditingMessage}
                        disabled={isSending}
                      >
                        <X className="size-4" />
                        لغو
                      </Button>
                    </div>
                  ) : null}

                  <form dir="rtl" onSubmit={sendMessage} className="flex gap-2">
                    <div className="relative min-w-0 flex-1">
                      {fieldAutocomplete?.suggestions.length ? (
                        <div
                          role="listbox"
                          aria-label="پیشنهاد فیلدهای پایگاه داده"
                          className="border-border bg-popover absolute right-0 bottom-full z-50 mb-2 max-h-64 w-full max-w-xl overflow-y-auto rounded-lg border p-1.5 text-right shadow-lg"
                        >
                          <div className="text-muted-foreground px-2 py-1 text-[11px]">
                            فیلدهای پیشنهادی — با ↑↓ انتخاب و با Enter یا Tab
                            درج کنید
                          </div>
                          {fieldAutocomplete.suggestions.map(
                            (suggestion, index) => (
                              <button
                                key={`${suggestion.column}-${suggestion.label}`}
                                type="button"
                                role="option"
                                aria-selected={
                                  index === activeFieldSuggestionIndex
                                }
                                className={cn(
                                  'flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-right text-sm transition-colors',
                                  index === activeFieldSuggestionIndex
                                    ? 'bg-accent text-accent-foreground'
                                    : 'hover:bg-accent/60'
                                )}
                                title={suggestion.description}
                                onMouseEnter={() =>
                                  setActiveFieldSuggestionIndex(index)
                                }
                                onMouseDown={(event) => {
                                  event.preventDefault()
                                  insertFieldSuggestion(suggestion)
                                }}
                              >
                                <span className="font-medium">
                                  {suggestion.label}
                                </span>
                                <code
                                  dir="ltr"
                                  className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[11px]"
                                >
                                  {suggestion.column}
                                </code>
                              </button>
                            )
                          )}
                        </div>
                      ) : null}
                      <Textarea
                        ref={messageInputRef}
                        value={message}
                        onChange={(event) => {
                          setMessage(event.target.value)
                          setMessageCursorPosition(
                            event.target.selectionStart ??
                              event.target.value.length
                          )
                          setActiveFieldSuggestionIndex(0)
                          setIsFieldAutocompleteOpen(true)
                        }}
                        onSelect={(event) =>
                          setMessageCursorPosition(
                            event.currentTarget.selectionStart ?? message.length
                          )
                        }
                        onClick={(event) => {
                          setMessageCursorPosition(
                            event.currentTarget.selectionStart ?? message.length
                          )
                          setIsFieldAutocompleteOpen(true)
                        }}
                        onFocus={() => setIsFieldAutocompleteOpen(true)}
                        onBlur={() =>
                          window.setTimeout(
                            () => setIsFieldAutocompleteOpen(false),
                            100
                          )
                        }
                        onKeyDown={handleMessageKeyDown}
                        placeholder={
                          editingMessageId
                            ? 'متن ویرایش‌شده را بنویسید...'
                            : 'سوال خود را درباره داده‌ها بنویسید...'
                        }
                        className="min-h-12 w-full resize-none"
                        autoComplete="off"
                        disabled={!activeConversation || isSending}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="h-auto min-w-24 gap-2"
                      disabled={
                        !activeConversation || !message.trim() || isSending
                      }
                    >
                      <Send className="size-4" />
                      {editingMessageId ? 'به‌روزرسانی' : 'ارسال'}
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
