import sqlServer from 'mssql'

import appPackage from '@/package.json'
import {
  DEFAULT_AI_MODEL_OPTION_ID,
  getAiModelOption,
  normalizeAiModelOptionId,
  type AiModelOptionId,
  type AiModelProvider,
} from '@/lib/ai-model-options'
import { requestDenoWorkerAiResponse } from '@/lib/deno-worker-api'
import {
  RESERVOIR_VIEW_NAME,
  executeReservoirQuery,
} from '@/lib/reservoir-data'

export type ChatRole = 'user' | 'assistant'

export const DATABASE_QUERY_ROW_LIMIT = 50
export const DATABASE_CHAT_HISTORY_LIMIT = 20

export type DatabaseQuestionHistoryMessage = {
  role: ChatRole
  content: string
  sql?: string | null
  rowCount?: number | null
}

export type DatabaseQueryCell = string | number | boolean | null

export type DatabaseQueryData = {
  columns: string[]
  columnLabels?: Record<string, string>
  columnValueTypes?: Record<string, string>
  rows: Record<string, DatabaseQueryCell>[]
}

type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const MAX_ROW_LIMIT = DATABASE_QUERY_ROW_LIMIT
const MAX_HISTORY_MESSAGES = DATABASE_CHAT_HISTORY_LIMIT

type AiProviderConfig = {
  provider: AiModelProvider
  model: string
  modelLabel: string
  reasoningEffort: 'low' | 'medium' | 'high'
  errorLabel: string
}

type AiProviderConfigOptions = {
  allowEnvModelOverride?: boolean
}

type AnswerDatabaseQuestionCallbacks = {
  onStatus?: (message: string) => void | Promise<void>
  onAnswerDelta?: (delta: string) => void | Promise<void>
  onReasoningDelta?: (delta: string) => void | Promise<void>
  onAnswerMeta?: (meta: {
    sql: string
    rowCount: number
    model: string
    modelLabel: string
  }) => void | Promise<void>
  onAnswerData?: (data: DatabaseQueryData) => void | Promise<void>
}

export type DatabaseConnectionHealth = {
  configured: boolean
  connected: boolean
  provider: 'sqlite' | 'sqlserver'
  message: string
  server?: string
  database?: string
}

export function getSqlServerConnectionString() {
  const config = appPackage as typeof appPackage & {
    aiDatabase?: { connectionString?: string; tableName?: string }
  }

  return config.aiDatabase?.connectionString?.trim() ?? ''
}

export function getConfiguredSqlServerTableName() {
  const config = appPackage as typeof appPackage & {
    aiDatabase?: { tableName?: string }
  }

  return config.aiDatabase?.tableName?.trim() ?? 'vwRptPersonelInfo'
}

export function getDefaultDatabaseSchemaJson() {
  const connectionString = getSqlServerConnectionString()
  const target = getSqlServerTarget(parseConnectionString(connectionString))
  const tableName = getConfiguredSqlServerTableName()

  return JSON.stringify(
    {
      database: target.database || 'DGTDB',
      defaultObject: tableName,
      views: [
        {
          name: tableName,
          columns: [],
        },
      ],
    },
    null,
    2
  )
}

function normalizeSchemaJson(schemaJson: string) {
  const defaultObject = getConfiguredSqlServerTableName()
  const connectionString = getSqlServerConnectionString()
  const target = getSqlServerTarget(parseConnectionString(connectionString))

  try {
    const parsed = JSON.parse(schemaJson)

    if (Array.isArray(parsed)) {
      return JSON.stringify(
        {
          database: target.database || 'DGTDB',
          defaultObject,
          views: [
            {
              name: defaultObject,
              columns: parsed,
            },
          ],
        },
        null,
        2
      )
    }

    if (parsed && typeof parsed === 'object') {
      const parsedObject = parsed as Record<string, unknown>

      return JSON.stringify(
        {
          database: target.database || 'DGTDB',
          ...parsedObject,
          defaultObject:
            typeof parsedObject.defaultObject === 'string' &&
            parsedObject.defaultObject
              ? parsedObject.defaultObject
              : defaultObject,
        },
        null,
        2
      )
    }
  } catch {
    return schemaJson
  }

  return schemaJson
}

function compressSchemaJsonForPrompt(schemaJson: string) {
  type JsonObject = Record<string, unknown>

  const readString = (values: unknown[]) =>
    values
      .find(
        (value): value is string =>
          typeof value === 'string' && Boolean(value.trim())
      )
      ?.trim()

  const compactColumn = (value: unknown): unknown[] | null => {
    if (typeof value === 'string' && value.trim()) return [value.trim()]
    if (Array.isArray(value)) {
      return value.length && typeof value[0] === 'string'
        ? value.slice(0, 5)
        : null
    }
    if (!value || typeof value !== 'object') return null

    const column = value as JsonObject
    const name = readString([column.name, column.column, column.c])
    if (!name) return null

    const type = readString([column.type, column.t])
    const label = readString([
      column.label,
      column.fa,
      column.title,
      column.displayName,
    ])
    const valueType = readString([column.valueType, column.vt])
    const description = readString([column.description, column.d])?.replace(
      /\s+/g,
      ' '
    )
    const tuple: unknown[] = [name]
    const optionalValues = [type, label, valueType, description]
    const lastValueIndex = optionalValues.findLastIndex(Boolean)

    for (let index = 0; index <= lastValueIndex; index += 1) {
      tuple.push(optionalValues[index] ?? null)
    }

    return tuple
  }

  try {
    const parsed = JSON.parse(schemaJson) as unknown
    const root =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as JsonObject)
        : {}
    const defaultObject =
      readString([root.defaultObject, root.object]) ??
      getConfiguredSqlServerTableName()
    const rawViews = Array.isArray(parsed)
      ? [{ name: defaultObject, columns: parsed }]
      : Array.isArray(root.views)
        ? root.views
        : Array.isArray(root.tables)
          ? root.tables
          : [
              {
                name: defaultObject,
                columns: root.columns ?? root.fields ?? root.cols ?? [],
              },
            ]

    const views = rawViews.flatMap((rawView) => {
      if (!rawView || typeof rawView !== 'object') return []
      const view = rawView as JsonObject
      const name = readString([
        view.name,
        view.view,
        view.table,
        view.v,
        defaultObject,
      ])
      const rawColumns = [view.columns, view.fields, view.cols, view.c].find(
        Array.isArray
      ) as unknown[] | undefined
      const columns = (rawColumns ?? [])
        .map(compactColumn)
        .filter((column): column is unknown[] => Boolean(column))

      return name ? [{ v: name, c: columns }] : []
    })

    return JSON.stringify({
      db: readString([root.database, root.db]),
      dialect: readString([root.dialect]),
      source: readString([root.source]),
      object: defaultObject,
      views,
    })
  } catch {
    return schemaJson.trim()
  }
}

type DatabaseDialect = 'sqlserver' | 'sqlite'

function getSchemaDataSource(schemaJson: string): {
  dialect: DatabaseDialect
  defaultObject: string
} {
  try {
    const parsed = JSON.parse(schemaJson) as {
      dialect?: unknown
      source?: unknown
      defaultObject?: unknown
    }

    if (
      parsed?.dialect === 'sqlite' &&
      parsed?.source === 'reservoir-csv' &&
      typeof parsed.defaultObject === 'string'
    ) {
      return { dialect: 'sqlite', defaultObject: parsed.defaultObject }
    }
  } catch {
    // Invalid schema JSON is rejected at the API boundary. Fall back safely here.
  }

  return {
    dialect: 'sqlserver',
    defaultObject: getConfiguredSqlServerTableName(),
  }
}

function parseConnectionString(connectionString: string) {
  const entries = new Map<string, string>()

  for (const part of connectionString.split(';')) {
    const separatorIndex = part.indexOf('=')
    if (separatorIndex < 0) continue

    const key = part.slice(0, separatorIndex).trim().toLowerCase()
    const value = part
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^\{|\}$/g, '')
      .replace(/^"|"$/g, '')

    if (key) entries.set(key, value)
  }

  return entries
}

function getConnectionValue(
  parsed: Map<string, string>,
  keys: string[],
  fallback = ''
) {
  for (const key of keys) {
    const value = parsed.get(key)
    if (value) return value
  }

  return fallback
}

function isTruthyConnectionValue(value: string | undefined) {
  return /^(true|yes|sspi)$/i.test(value ?? '')
}

function isFalseyConnectionValue(value: string | undefined) {
  return /^(false|no)$/i.test(value ?? '')
}

function hasSqlServerCredentials(parsed: Map<string, string>) {
  return Boolean(
    getConnectionValue(parsed, ['user id', 'uid', 'user']) ||
      getConnectionValue(parsed, ['password', 'pwd'])
  )
}

function getConnectionNumber(
  parsed: Map<string, string>,
  keys: string[],
  fallback: number
) {
  const value = Number(getConnectionValue(parsed, keys))

  return Number.isFinite(value) ? value : fallback
}

function getTimeoutMs(
  parsed: Map<string, string>,
  keys: string[],
  fallbackMs: number
) {
  return Math.max(
    0,
    Math.trunc(getConnectionNumber(parsed, keys, fallbackMs / 1000) * 1000)
  )
}

function getConnectionPoolConfig(parsed: Map<string, string>) {
  if (!isFalseyConnectionValue(parsed.get('pooling'))) return {}

  return {
    pool: {
      max: 1,
      min: 0,
      idleTimeoutMillis: 1,
    },
  }
}

function getTediousOptions(parsed: Map<string, string>) {
  const packetSize = getConnectionNumber(parsed, ['packet size'], 0)
  const appName = getConnectionValue(parsed, ['application name'])

  return {
    ...(appName ? { appName } : {}),
    ...(packetSize > 0 ? { packetSize } : {}),
    trustServerCertificate: parsed.has('trustservercertificate')
      ? isTruthyConnectionValue(parsed.get('trustservercertificate'))
      : true,
    encrypt: isTruthyConnectionValue(parsed.get('encrypt')),
  }
}

function getSqlServerTarget(parsed: Map<string, string>) {
  const serverValue = getConnectionValue(parsed, ['server', 'data source'])
  const [serverWithPort, instanceName] = serverValue.split('\\')
  const [server, portText] = serverWithPort.split(',')
  const port = portText ? Number(portText) : undefined
  const database = getConnectionValue(
    parsed,
    ['database', 'initial catalog'],
    'DGTDB'
  )

  return {
    server: server.trim(),
    database,
    instanceName,
    ...(Number.isFinite(port) ? { port } : {}),
  }
}

function usesWindowsAuth(parsed: Map<string, string>) {
  if (hasSqlServerCredentials(parsed)) return false

  return (
    isTruthyConnectionValue(parsed.get('trusted_connection')) ||
    isTruthyConnectionValue(parsed.get('trustedconnection')) ||
    isTruthyConnectionValue(parsed.get('integrated security'))
  )
}

function buildSqlAuthConfig(
  connectionString: string,
  timeoutOverrideMs?: number
) {
  const parsed = parseConnectionString(connectionString)
  const target = getSqlServerTarget(parsed)
  const connectionTimeout =
    timeoutOverrideMs ??
    getTimeoutMs(parsed, ['connect timeout', 'connection timeout'], 30000)
  const requestTimeout =
    timeoutOverrideMs ??
    getTimeoutMs(parsed, ['command timeout', 'request timeout'], 30000)

  return {
    server: target.server,
    ...(target.port ? { port: target.port } : {}),
    database: target.database,
    user: getConnectionValue(parsed, ['user id', 'uid', 'user']),
    password: getConnectionValue(parsed, ['password', 'pwd']),
    connectionTimeout,
    requestTimeout,
    ...getConnectionPoolConfig(parsed),
    options: {
      ...getTediousOptions(parsed),
      instanceName: target.instanceName,
    },
  }
}

function createSqlServerPool(
  connectionString: string,
  timeoutOverrideMs?: number
) {
  const parsed = parseConnectionString(connectionString)
  const target = getSqlServerTarget(parsed)

  if (!target.server) {
    throw new Error('SQL Server connection string does not include a server.')
  }

  if (usesWindowsAuth(parsed)) {
    throw new Error(
      'Use SQL Server authentication with User ID and Password for this app.'
    )
  }

  return {
    pool: new sqlServer.ConnectionPool(
      buildSqlAuthConfig(connectionString, timeoutOverrideMs)
    ),
    target,
  }
}

type SqlServerPoolCache = {
  connectionString: string
  pool: InstanceType<typeof sqlServer.ConnectionPool>
  connectPromise: Promise<InstanceType<typeof sqlServer.ConnectionPool>>
}

let cachedSqlServerPool: SqlServerPoolCache | null = null

async function closeCachedSqlServerPool() {
  const current = cachedSqlServerPool
  cachedSqlServerPool = null
  await current?.pool.close().catch(() => undefined)
}

async function resetSharedSqlServerPool(
  pool: InstanceType<typeof sqlServer.ConnectionPool>
) {
  if (cachedSqlServerPool?.pool === pool) {
    cachedSqlServerPool = null
  }

  await pool.close().catch(() => undefined)
}

async function getSharedSqlServerPool(connectionString: string) {
  if (cachedSqlServerPool?.connectionString === connectionString) {
    return cachedSqlServerPool.connectPromise
  }

  await closeCachedSqlServerPool()

  const { pool } = createSqlServerPool(connectionString)
  const cache: SqlServerPoolCache = {
    connectionString,
    pool,
    connectPromise: Promise.resolve(pool),
  }

  cache.connectPromise = pool
    .connect()
    .then(() => pool)
    .catch(async (error) => {
      await resetSharedSqlServerPool(pool)
      throw error
    })
  cachedSqlServerPool = cache

  return cache.connectPromise
}

export async function checkSqlServerConnection(): Promise<DatabaseConnectionHealth> {
  const connectionString = getSqlServerConnectionString()

  if (!connectionString) {
    return {
      configured: false,
      connected: false,
      provider: 'sqlserver',
      message:
        'SQL Server connection string is not configured in package.json.',
    }
  }

  let target: ReturnType<typeof getSqlServerTarget> | undefined
  let pool: InstanceType<typeof sqlServer.ConnectionPool> | null = null

  try {
    const created = createSqlServerPool(connectionString, 8000)
    pool = created.pool
    target = created.target

    await pool.connect()
    await pool.request().query('SELECT 1 AS connected')

    return {
      configured: true,
      connected: true,
      provider: 'sqlserver',
      message: 'SQL Server connection is healthy.',
      server: target.server,
      database: target.database,
    }
  } catch (error) {
    target ??= getSqlServerTarget(parseConnectionString(connectionString))

    return {
      configured: true,
      connected: false,
      provider: 'sqlserver',
      message:
        error instanceof Error
          ? error.message
          : 'SQL Server connection check failed.',
      server: target.server,
      database: target.database,
    }
  } finally {
    await pool?.close()
  }
}

export function normalizeRowLimit(value: number) {
  if (!Number.isFinite(value)) return DATABASE_QUERY_ROW_LIMIT
  return Math.min(Math.max(Math.trunc(value), 1), MAX_ROW_LIMIT)
}

export function normalizeMessageQuota(value: number) {
  if (!Number.isFinite(value)) return 100
  return Math.min(Math.max(Math.trunc(value), 1), 1000)
}

function extractJsonObject(content: string) {
  const trimmed = content.trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) return fenced[1].trim()

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)

  return trimmed
}

function isReadOnlySql(query: string) {
  const normalized = query
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim()
    .toLowerCase()

  if (!/^(select|with)\b/.test(normalized)) return false
  if (normalized.includes(';')) return false

  return !/\b(insert|update|delete|merge|drop|alter|create|truncate|exec|execute|grant|revoke|backup|restore|set|use)\b/.test(
    normalized
  )
}

function hasBalancedSqlStringLiterals(query: string) {
  let inString = false

  for (let index = 0; index < query.length; index += 1) {
    if (query[index] !== "'") continue

    if (inString && query[index + 1] === "'") {
      index += 1
      continue
    }

    inString = !inString
  }

  return !inString
}

function hasFieldIntentLabelInSqlLiteral(query: string) {
  const stringLiterals = query.match(/\bN?'(?:''|[^'])*'/gi) ?? []
  const fieldLabelPattern =
    /نام\s*خانوادگی|نام\s*خانوداگی|خانوادگی|خانوداگی|نام\s*کوچک|کد\s*ملی|شماره\s*ملی|شماره\s*پرسنلی|فامیل/

  return stringLiterals.some((literal) => fieldLabelPattern.test(literal))
}

function stripSqlStringsAndComments(query: string) {
  return query
    .replace(/N?'(?:''|[^'])*'/gi, "''")
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
}

function isAggregateSqlQuery(query: string) {
  const normalized = stripSqlStringsAndComments(query).toLowerCase()

  return (
    /\b(count|sum|avg|min|max|stdev|stdevp|var|varp)\s*\(/.test(normalized) ||
    /\b(group\s+by|having)\b/.test(normalized)
  )
}

function asksForLimitedAggregate(question: string) {
  return /\b(top|bottom|first|last|rank|ranking)\b|تاپ|برترین|بیشترین|کمترین|اولین|آخرین|رتبه|رده|نفر\s+اول|\b\d+\s*(تا|مورد|ردیف|گروه)/i.test(
    question
  )
}

const PERSIAN_MONTH_FILTERS = [
  { name: 'فروردین', number: 1 },
  { name: 'اردیبهشت', number: 2 },
  { name: 'خرداد', number: 3 },
  { name: 'تیر', number: 4 },
  { name: 'مرداد', number: 5 },
  { name: 'شهریور', number: 6 },
  { name: 'مهر', number: 7 },
  { name: 'آبان', number: 8 },
  { name: 'آذر', number: 9 },
  { name: 'دی', number: 10 },
  { name: 'بهمن', number: 11 },
  { name: 'اسفند', number: 12 },
] as const

function normalizePersianFilterText(value: string) {
  return value
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
}

type SchemaFieldMapping = {
  column: string
  label: string
}

function getSchemaFieldMappings(schemaJson: string) {
  const fields: SchemaFieldMapping[] = []
  const seen = new Set<string>()

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
          typeof candidate === 'string' && Boolean(candidate.trim())
      )

      if (column && label) {
        const field = { column: column.trim(), label: label.trim() }
        const key = `${field.column}\u0000${field.label}`
        if (!seen.has(key)) {
          seen.add(key)
          fields.push(field)
        }
      }
      Object.values(item).forEach(visit)
    }

    visit(JSON.parse(schemaJson))
  } catch {
    return fields
  }

  return fields
}

function getRequestedSchemaFields(question: string, schemaJson: string) {
  const normalizedQuestion = normalizePersianFilterText(question)
  const occupiedRanges: Array<{ start: number; end: number }> = []
  const requestedFields: SchemaFieldMapping[] = []

  for (const field of getSchemaFieldMappings(schemaJson).sort(
    (left, right) => right.label.length - left.label.length
  )) {
    const label = normalizePersianFilterText(field.label)
    let start = normalizedQuestion.indexOf(label)

    while (start >= 0) {
      const end = start + label.length
      const overlapsLongerLabel = occupiedRanges.some(
        (range) => start < range.end && end > range.start
      )
      if (!overlapsLongerLabel) {
        occupiedRanges.push({ start, end })
        requestedFields.push(field)
        break
      }
      start = normalizedQuestion.indexOf(label, start + label.length)
    }
  }

  return requestedFields
}

function hasSqlColumnReference(sql: string, column: string) {
  const escapedColumn = column.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(
    `(?:\\[${escapedColumn}\\]|\\b${escapedColumn}\\b)`,
    'i'
  ).test(sql)
}

function getSelectProjection(query: string) {
  return query.match(
    /^\s*select\s+(?:distinct\s+)?(?:top\s*(?:\(\s*\d+\s*\)|\d+)\s+)?([\s\S]*?)\s+from\b/i
  )?.[1]
}

function getRequestedPersianMonths(question: string) {
  const normalizedQuestion = normalizePersianFilterText(question)
  return PERSIAN_MONTH_FILTERS.filter(({ name }) =>
    new RegExp(`(?:^|[^\\u0600-\\u06ff])${name}(?:$|[^\\u0600-\\u06ff])`).test(
      normalizedQuestion
    )
  )
}

function buildSimpleMultiMonthReservoirQuery(
  question: string,
  rowLimit: number
) {
  const requestedMonths = getRequestedPersianMonths(question)
  const normalizedQuestion = normalizePersianFilterText(question)

  if (
    requestedMonths.length < 2 ||
    !/(?:تمام|همه)\s+(?:مقادیر|رکوردها|داده‌ها|اطلاعات)/.test(
      normalizedQuestion
    ) ||
    /[0-9۰-۹٠-٩]/.test(normalizedQuestion)
  ) {
    return ''
  }

  return `SELECT * FROM ${RESERVOIR_VIEW_NAME} WHERE PersianMonth IN (${requestedMonths.map(({ number }) => number).join(', ')}) ORDER BY PersianDay ASC, ObjectId ASC, PersianMonth ASC, PersianYear DESC LIMIT ${rowLimit}`
}

function getRequestedReservoirLevelColumn(question: string) {
  const normalizedQuestion = normalizePersianFilterText(question).replace(
    /مساحت\s+سطح(?:\s+مخزن)?/g,
    ' '
  )

  if (!/(?:سطح|تراز)/.test(normalizedQuestion)) return ''

  return /(?:سطح|تراز)[^.!؟\n]{0,24}(?:قبلی|روز\s*قبل)|(?:قبلی|روز\s*قبل)[^.!؟\n]{0,24}(?:سطح|تراز)/.test(
    normalizedQuestion
  )
    ? 'PreviousLevel'
    : 'Level'
}

function getRequestedProjectionFields(
  question: string,
  schemaJson: string,
  includeReservoirAliases: boolean
) {
  const requestedFields = getRequestedSchemaFields(question, schemaJson)
  const requestedColumns = new Set(
    requestedFields.map(({ column }) => column.toLowerCase())
  )

  if (includeReservoirAliases) {
    const levelColumn = getRequestedReservoirLevelColumn(question)
    if (levelColumn && !requestedColumns.has(levelColumn.toLowerCase())) {
      requestedFields.push({ column: levelColumn, label: levelColumn })
    }
  }

  return requestedFields
}

function getMissingRequestedProjectionFields(
  query: string,
  question: string,
  schemaJson: string,
  includeReservoirAliases: boolean
) {
  if (isAggregateSqlQuery(query)) return []

  const projection = getSelectProjection(query)
  if (!projection || /(?:^|,)\s*(?:\w+\.)?\*\s*(?:,|$)/.test(projection)) {
    return []
  }

  return getRequestedProjectionFields(
    question,
    schemaJson,
    includeReservoirAliases
  ).filter(({ column }) => !hasSqlColumnReference(projection, column))
}

function getSchemaProjectionRejectionReason(
  query: string,
  question: string,
  schemaJson: string,
  includeReservoirAliases: boolean
) {
  const missingFields = getMissingRequestedProjectionFields(
    query,
    question,
    schemaJson,
    includeReservoirAliases
  )
  if (!missingFields.length) return ''

  return `The Persian schema fields ${missingFields
    .map(({ label, column }) => `${label} -> ${column}`)
    .join(
      ', '
    )} were explicitly requested. Include their exact columns in SELECT.`
}

function repairRequestedFieldProjection(
  query: string,
  question: string,
  schemaJson: string,
  includeReservoirAliases: boolean
) {
  const missingFields = getMissingRequestedProjectionFields(
    query,
    question,
    schemaJson,
    includeReservoirAliases
  )
  if (!missingFields.length || !/^\s*select\b/i.test(query)) return ''

  const columns = missingFields.map(({ column }) => column).join(', ')
  return query.replace(
    /^(\s*select\s+(?:distinct\s+)?(?:top\s*(?:\(\s*\d+\s*\)|\d+)\s+)?)/i,
    `$1${columns}, `
  )
}

function getReservoirSemanticRejectionReason(
  query: string,
  question: string,
  rowLimit: number
) {
  const normalizedSql = stripSqlStringsAndComments(query)
  const asksForCount = /تعداد|چند\s*(?:مورد|رکورد|ردیف)/.test(question)
  const requestedLevelColumn = getRequestedReservoirLevelColumn(question)
  const selectsAllReservoirFields =
    /\bselect\s+(?:distinct\s+)?(?:\w+\.)?\*/i.test(normalizedSql)

  if (requestedLevelColumn && !asksForCount) {
    if (/\bcount\s*\(/i.test(normalizedSql)) {
      return `The user asks for the ${requestedLevelColumn} value, not a row count. Select ${requestedLevelColumn} in a detail query.`
    }
    if (
      !selectsAllReservoirFields &&
      !new RegExp(`\\b${requestedLevelColumn}\\b`, 'i').test(normalizedSql)
    ) {
      return `The requested reservoir level field is ${requestedLevelColumn}. Include ${requestedLevelColumn} in SELECT.`
    }
  }

  if (
    /حجم\s+(?:برابر|مساوی)/.test(question) &&
    !/\bwhere\b[\s\S]*\bvolume\b/i.test(normalizedSql)
  ) {
    return 'Bare حجم with an equality condition maps to Volume. Filter WHERE Volume equals the requested number.'
  }

  const requestedMonths = getRequestedPersianMonths(question)
  if (requestedMonths.length > 1) {
    const whereClause = query.match(
      /\bwhere\b([\s\S]*?)(?:\border\s+by\b|\blimit\b|$)/i
    )?.[1]
    const normalizedWhereClause = normalizePersianFilterText(whereClause ?? '')
    const missingMonths = requestedMonths.filter(
      ({ name, number }) =>
        !normalizedWhereClause.includes(name) &&
        !new RegExp(`\\b${number}\\b`).test(normalizedWhereClause)
    )

    if (missingMonths.length) {
      return `The multi-month filter dropped: ${missingMonths.map(({ name }) => name).join(', ')}. Include every requested month with one inclusive IN or OR filter.`
    }

    if (!isAggregateSqlQuery(query)) {
      const orderByClause = normalizedSql.match(
        /\border\s+by\b([\s\S]*?)(?:\blimit\b|$)/i
      )?.[1]
      const yearPosition = orderByClause?.search(/\bPersianYear\b/i) ?? -1
      const dayPosition = orderByClause?.search(/\bPersianDay\b/i) ?? -1
      const objectPosition = orderByClause?.search(/\bObjectId\b/i) ?? -1
      const monthPosition = orderByClause?.search(/\bPersianMonth\b/i) ?? -1

      if (
        yearPosition < 0 ||
        dayPosition < 0 ||
        objectPosition < 0 ||
        monthPosition < 0 ||
        dayPosition > monthPosition ||
        objectPosition > monthPosition
      ) {
        return 'Capped multi-month detail results must interleave all requested months. Order by PersianDay ASC, ObjectId ASC, PersianMonth ASC, PersianYear DESC so one month cannot fill the entire result.'
      }

      const generatedLimit = Number(
        normalizedSql.match(/\blimit\s+(\d+)/i)?.[1] ?? 0
      )
      if (
        /تمام|همه/.test(question) &&
        generatedLimit > 0 &&
        generatedLimit < rowLimit
      ) {
        return `The user requested all available values. Use the hard-cap LIMIT ${rowLimit}, not the smaller default limit.`
      }
    }
  }

  return ''
}

function getSqlRejectionReason(query: string, question = '') {
  if (!query) return 'SQL is empty.'
  if (!isReadOnlySql(query)) {
    return 'SQL must be one read-only SELECT or WITH query, with no semicolon.'
  }
  if (!hasBalancedSqlStringLiterals(query)) {
    return 'SQL has an unclosed quoted string. Escape single quotes by doubling them.'
  }
  if (hasFieldIntentLabelInSqlLiteral(query)) {
    return 'SQL search literal includes a Persian field label. Remove labels like نام خانوادگی or کد ملی from the literal and keep only the search value.'
  }
  if (
    isAggregateSqlQuery(query) &&
    /\btop\s*\(?\s*\d+/i.test(stripSqlStringsAndComments(query)) &&
    !asksForLimitedAggregate(question)
  ) {
    return 'Aggregate SQL must not use TOP or default row limits unless the user explicitly asks for top/bottom N.'
  }
  if (/```|…|\?\?/.test(query)) {
    return 'SQL contains markdown, ellipses, or placeholder marks.'
  }

  return ''
}

function normalizeGeneratedSql(query: string) {
  return query
    .trim()
    .replace(/;+\s*$/g, '')
    .trim()
}

function getProviderConfig(
  modelOptionId: AiModelOptionId = DEFAULT_AI_MODEL_OPTION_ID,
  _options: AiProviderConfigOptions = {}
): AiProviderConfig {
  const option = getAiModelOption(modelOptionId)

  return {
    provider: option.provider,
    model: option.model,
    modelLabel: option.label,
    reasoningEffort: 'medium',
    errorLabel: 'ParsPack',
  }
}

async function callAiChat(
  messages: OpenAIMessage[],
  modelOptionId: AiModelOptionId,
  _temperature = 1,
  _responseFormat?: 'json_object',
  configOptions: AiProviderConfigOptions = {}
) {
  const config = getProviderConfig(modelOptionId, configOptions)
  const response = await requestDenoWorkerAiResponse({
    model: config.model,
    messages,
    reasoningEffort: config.reasoningEffort,
  })

  return response.outputText.trim()
}

async function streamAiChat(
  messages: OpenAIMessage[],
  modelOptionId: AiModelOptionId,
  onDelta: (delta: string) => void | Promise<void>,
  onReasoningDelta?: (delta: string) => void | Promise<void>,
  _temperature = 1,
  configOptions: AiProviderConfigOptions = {}
) {
  const config = getProviderConfig(modelOptionId, configOptions)
  const response = await requestDenoWorkerAiResponse({
    model: config.model,
    messages,
    reasoningEffort: config.reasoningEffort,
  })

  if (response.reasoningText) {
    await onReasoningDelta?.(response.reasoningText)
  }
  if (response.outputText) {
    await onDelta(response.outputText)
  }

  return {
    answer: response.outputText,
    reasoning: response.reasoningText,
  }
}

function formatHistoryMessage(message: DatabaseQuestionHistoryMessage) {
  const parts = [message.content]

  if (message.role === 'assistant' && typeof message.rowCount === 'number') {
    parts.push(`Returned row count: ${message.rowCount}`)
  }

  return parts.join('\n\n')
}

function serializeQueryCell(value: unknown): DatabaseQueryCell {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number')
    return Number.isFinite(value) ? value : String(value)
  if (typeof value === 'bigint') {
    const numericValue = Number(value)
    return Number.isSafeInteger(numericValue) ? numericValue : value.toString()
  }
  if (value instanceof Date) return value.toISOString()
  if (Buffer.isBuffer(value)) return value.toString('base64')

  try {
    return JSON.stringify(value, (_key, nestedValue) =>
      typeof nestedValue === 'bigint' ? nestedValue.toString() : nestedValue
    )
  } catch {
    return String(value)
  }
}

function getSchemaColumnLabels(schemaJson: string) {
  return Object.fromEntries(
    getSchemaFieldMappings(schemaJson).map(({ column, label }) => [
      column,
      label,
    ])
  )
}

function getSchemaColumnValueTypes(schemaJson: string) {
  const valueTypes: Record<string, string> = {}

  try {
    const visit = (value: unknown) => {
      if (Array.isArray(value)) {
        value.forEach(visit)
        return
      }
      if (!value || typeof value !== 'object') return

      const item = value as Record<string, unknown>
      const name = [item.name, item.column, item.c].find(
        (candidate): candidate is string =>
          typeof candidate === 'string' && Boolean(candidate.trim())
      )
      const valueType = [item.valueType, item.vt, item.type, item.t].find(
        (candidate): candidate is string =>
          typeof candidate === 'string' && Boolean(candidate.trim())
      )

      if (name && valueType) valueTypes[name] = valueType.trim()
      Object.values(item).forEach(visit)
    }

    visit(JSON.parse(schemaJson))
  } catch {
    return valueTypes
  }

  return valueTypes
}

function serializeQueryData(
  rows: Record<string, unknown>[],
  schemaColumnLabels: Record<string, string>,
  schemaColumnValueTypes: Record<string, string>
): DatabaseQueryData {
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
  const columnLabels = Object.fromEntries(
    columns.flatMap((column) =>
      schemaColumnLabels[column] ? [[column, schemaColumnLabels[column]]] : []
    )
  )
  const columnValueTypes = Object.fromEntries(
    columns.flatMap((column) =>
      schemaColumnValueTypes[column]
        ? [[column, schemaColumnValueTypes[column]]]
        : []
    )
  )

  return {
    columns,
    columnLabels,
    columnValueTypes,
    rows: rows.map((row) =>
      Object.fromEntries(
        columns.map((column) => [column, serializeQueryCell(row[column])])
      )
    ),
  }
}

const iranAnswerDateFormatter = new Intl.DateTimeFormat('fa-IR', {
  calendar: 'persian',
  day: '2-digit',
  month: '2-digit',
  numberingSystem: 'arabext',
  timeZone: 'Asia/Tehran',
  year: 'numeric',
})

function localizeAnswerDigits(value: string) {
  return value.replace(/\d/g, (digit) =>
    Number(digit).toLocaleString('fa-IR', { useGrouping: false })
  )
}

function formatAnswerDateValue(value: DatabaseQueryCell, valueType?: string) {
  if (value === null) return value

  if (valueType === 'persian_date') {
    const compactDate = String(value).replace(/\D/g, '')
    if (/^(?:13|14)\d{6}$/.test(compactDate)) {
      return localizeAnswerDigits(
        `${compactDate.slice(0, 4)}/${compactDate.slice(4, 6)}/${compactDate.slice(6, 8)}`
      )
    }
  }

  if (valueType === 'datetime' && typeof value === 'string') {
    const normalized = value.includes('T') ? value : value.replace(' ', 'T')
    const parsedDate = new Date(normalized)
    if (!Number.isNaN(parsedDate.getTime())) {
      return iranAnswerDateFormatter.format(parsedDate)
    }
  }

  return value
}

function createAnswerRows(data: DatabaseQueryData) {
  return data.rows.map((row) =>
    Object.fromEntries(
      data.columns.map((column) => [
        column,
        formatAnswerDateValue(
          row[column] ?? null,
          data.columnValueTypes?.[column]
        ),
      ])
    )
  )
}

async function executeSqlServerQuery(query: string, rowLimit: number) {
  const connectionString = getSqlServerConnectionString()
  if (!connectionString) {
    throw new Error(
      'SQL Server connection string is not configured in package.json.'
    )
  }

  const limit = normalizeRowLimit(rowLimit)
  const shouldApplyRowLimit = !isAggregateSqlQuery(query)
  const pool = await getSharedSqlServerPool(connectionString)

  try {
    const result = await pool
      .request()
      .query(
        shouldApplyRowLimit
          ? `SET ROWCOUNT ${limit}\n${query}\nSET ROWCOUNT 0`
          : query
      )

    const rows = result.recordset ?? []
    return shouldApplyRowLimit ? rows.slice(0, limit) : rows
  } catch (error) {
    if (!pool.connected) {
      await resetSharedSqlServerPool(pool)
    }

    throw error
  }
}

function buildSystemPrompt(
  schemaJson: string,
  rowLimit: number,
  dataSource: ReturnType<typeof getSchemaDataSource>
) {
  const { defaultObject, dialect } = dataSource
  const targetRows = Math.min(rowLimit, 25)
  const isSqlite = dialect === 'sqlite'

  return [
    `ROLE: ${isSqlite ? 'SQLite' : 'SQL Server'} database agent for a Persian database chat.`,
    `TASK: Convert the user question into one safe ${isSqlite ? 'SQLite' : 'SQL Server'} query.`,
    'OUTPUT: valid JSON only, exactly {"sql":"...","reason":"..."}',
    '',
    'SQL RULES:',
    '- sql must contain SQL only and start with SELECT or WITH.',
    `- Query ${defaultObject} unless schema JSON explicitly names another table/view.`,
    '- Use only table, view, and column names present in the schema. Never invent names.',
    '- Column names are not table names. Never put a column name after FROM or JOIN.',
    isSqlite
      ? `- Use LIMIT ${targetRows} for normal detail/list queries. Hard cap is ${rowLimit} rows.`
      : `- Use TOP (${targetRows}) for normal detail/list queries. Hard cap is ${rowLimit} rows.`,
    `- If the user explicitly requests N rows/items, use exactly ${isSqlite ? 'LIMIT N' : 'TOP (N)'} when N is at most ${rowLimit}; do not replace it with the default limit.`,
    isSqlite
      ? '- Do not apply LIMIT or row-limit behavior to aggregate queries.'
      : '- Do not apply TOP or row-limit behavior to aggregate queries.',
    '- For counts, totals, averages, min/max, and grouped summaries, return all aggregate/group rows instead of raw detail rows.',
    '- Select only columns needed for the answer. Use SELECT * only if the schema has no column list.',
    '- For a non-aggregate detail query, include every schema field explicitly named by the user in SELECT, even when that field is also used in WHERE or ORDER BY.',
    '- Complete multi-word Persian schema labels take precedence over individual words inside them. Map each complete label to its exact English column.',
    'DATE REQUIREMENTS:',
    '- Every detail/list query must SELECT the most relevant date or date-time column available in the schema, even when the user lists output columns but omits the date.',
    '- Choose the date column that matches the question context; never invent a date column.',
    '- For reservoir detail/list queries, include InputTime by default. Use PersianDate as the primary date when the user asks for a Persian/Jalali/Shamsi date.',
    '- For aggregate-only questions, include a date or date range only when it is meaningful for the requested aggregation.',
    '- Prefer simple WHERE filters. Avoid joins unless the schema and question require them.',
    'PERSIAN FILTER INTENT:',
    "- شامل, حاوی, and دربرگیرنده mean textual contains. Generate LIKE '%value%', never equality and never IN.",
    "- شامل نباشد, حاوی نباشد, and فاقد mean textual exclusion. Generate NOT LIKE '%value%'.",
    "- If several contains values are joined by 'و', use AND; if joined by 'یا' or 'یکی از', use OR with one LIKE per value.",
    "- Example intent: 'نام شامل علی' means the mapped name column LIKE '%علی%'. The word شامل is an operator and must not appear inside the search value.",
    ...(isSqlite
      ? [
          '- Persian labels in the schema describe the English column names; always use the exact English name in SQL.',
        ]
      : [
          '- Persian field words are intent labels, not search values. Remove labels such as نام, نام خانوادگی, فامیل, نام کوچک, کد ملی, شماره پرسنلی from text literals.',
          '- For personnel schemas, map intent when those columns exist: نام/full name -> vcFarsiFullName, نام کوچک/first name -> vcFarsiFName, نام خانوادگی/فامیل/last name -> vcFarsiLName, کد ملی/national code -> vcNationalCode.',
          "- Example: \"نام خانوادگی حسین\" means search vcFarsiLName for only N'%حسین%', not N'%نام خانوادگی حسین%'.",
        ]),
    '- For IDs, codes, dates, and numbers use exact comparisons.',
    ...(isSqlite
      ? [
          '- InputTime is ISO date text. Use date(InputTime), strftime(), or direct ISO text comparisons for date analysis.',
          '- PersianDate is an integer in YYYYMMDD format and ObjectId identifies the reservoir.',
          '- RESERVOIR FIELD MAPPING: سطح, میزان سطح, and تراز mean Level. The complete schema label مساحت سطح مخزن means Area and takes precedence over the bare word سطح. حجم by itself means Volume. تراز روز قبل or سطح قبلی means PreviousLevel. Use PreviousVolume only when the user explicitly requests حجم قبلی or حجم روز قبل.',
          "- In Persian, 'میزان X زمانی که Y' or 'X وقتی Y' asks for the value of X under condition Y. It is a detail lookup, not a count and not a time-duration question.",
          '- Generate COUNT only when the user explicitly asks تعداد, چند مورد, or چند رکورد. Never interpret the word میزان as COUNT when it is followed by a requested field such as سطح.',
          "- Exact example: for 'میزان سطح زمانی که حجم برابر با 2945.97', return the fields InputTime, Level, and Volume, filter the Volume field by 2945.97, and use the normal detail limit. It is not a count query.",
          "- MULTI-VALUE FILTERS: when categorical values are joined by 'و', 'یا', commas, or 'یکی از', include every named value with one inclusive IN (...) filter or OR conditions. Never silently drop a value.",
          "- For multiple Persian months such as 'آبان و شهریور', filter both months and include PersianMonthName in the result. For capped detail rows, interleave months with ORDER BY PersianDay ASC, ObjectId ASC, PersianMonth ASC, PersianYear DESC so the first page contains every requested month even when years have different coverage.",
          `- If a multi-month detail request says تمام or همه, use the hard-cap LIMIT ${rowLimit} instead of the default ${targetRows}.`,
          '- For Shamsi/Jalali search and grouping, prefer the real helper columns PersianDateText, PersianYear, PersianYearMonth, PersianMonth, PersianMonthName, PersianDay, PersianWeekdayName, and PersianSeasonName when they are present in the schema.',
          "- Shamsi examples: 'سال ۱۴۰۴' means PersianYear = 1404; 'شهریور' means PersianMonthName = 'شهریور'; 'دوشنبه' means PersianWeekdayName = 'دوشنبه'; 'پاییز' means PersianSeasonName = 'پاییز'.",
          '- When returning reservoir rows for a Shamsi request, select PersianDateText plus the requested date helper columns so the answer and chart keep the requested Shamsi context.',
          '- Do not use SQL Server-only syntax such as TOP, N-prefixed strings, DATEPART, or CONVERT.',
        ]
      : [
          "- Database text may store Arabic ي/ك while users type Persian ی/ک. For Persian/Arabic text LIKE, normalize both sides: REPLACE(REPLACE(column, N'ي', N'ی'), N'ك', N'ک') LIKE REPLACE(REPLACE(N'%term%', N'ي', N'ی'), N'ك', N'ک').",
          "- Correct last-name example: REPLACE(REPLACE(vcFarsiLName, N'ي', N'ی'), N'ك', N'ک') LIKE REPLACE(REPLACE(N'%حسین%', N'ي', N'ی'), N'ك', N'ک').",
        ]),
    '- Escape single quotes in SQL strings by doubling them. Close every string literal.',
    '- Forbidden in sql: semicolons, comments, markdown, ellipses, ??, placeholders, JSON fragments, Persian explanation, and mutation commands.',
    '- Never invent column names. Use only exact column names from the schema.',
    'COMPACT SCHEMA FORMAT:',
    '- db=database, object=default table/view, views[].v=view name, views[].c=column tuples.',
    '- Each column tuple is [exact English name, SQL type, Persian label, semantic value type, optional description]. Trailing missing values are omitted and internal missing values are null.',
    'COMPACT SCHEMA JSON:',
    schemaJson,
  ].join('\n')
}

export async function answerDatabaseQuestion(input: {
  modelOptionId?: AiModelOptionId
  schemaJson: string
  rowLimit: number
  history: DatabaseQuestionHistoryMessage[]
  question: string
  streamAnswer?: boolean
  callbacks?: AnswerDatabaseQuestionCallbacks
}) {
  const rowLimit = normalizeRowLimit(input.rowLimit)
  const schemaJson = normalizeSchemaJson(input.schemaJson)
  const promptSchemaJson = compressSchemaJsonForPrompt(schemaJson)
  const dataSource = getSchemaDataSource(schemaJson)
  const systemPrompt = buildSystemPrompt(promptSchemaJson, rowLimit, dataSource)
  const requestedSchemaFields = getRequestedProjectionFields(
    input.question,
    schemaJson,
    dataSource.dialect === 'sqlite'
  )
  const requestedSchemaFieldHint = requestedSchemaFields.length
    ? [
        'Exact schema mappings detected in this question:',
        requestedSchemaFields
          .map(({ label, column }) => `${label} -> ${column}`)
          .join(', '),
        'For a non-aggregate detail query, include every mapped column in SELECT.',
      ].join('\n')
    : ''
  const recentHistory = input.history.slice(-MAX_HISTORY_MESSAGES)
  const modelOptionId = normalizeAiModelOptionId(input.modelOptionId)
  const configOptions = {
    allowEnvModelOverride: !input.modelOptionId,
  }
  const providerConfig = getProviderConfig(modelOptionId, configOptions)
  const providerLabel = providerConfig.errorLabel
  const deterministicReservoirQuery =
    dataSource.dialect === 'sqlite'
      ? buildSimpleMultiMonthReservoirQuery(input.question, rowLimit)
      : ''

  await input.callbacks?.onStatus?.('در حال تحلیل سوال و ساخت کوئری SQL...')
  let parsed: { sql?: string; reason?: string } = deterministicReservoirQuery
    ? {
        sql: deterministicReservoirQuery,
        reason:
          'Deterministic multi-month reservoir query preserving every requested month.',
      }
    : {}
  let query = deterministicReservoirQuery
  let rejectionReason = ''
  let lastRejectedQuery = ''

  for (let attempt = 0; !query && attempt < 2; attempt += 1) {
    if (attempt > 0) {
      await input.callbacks?.onStatus?.(
        'در حال بررسی و تکمیل فیلدهای کوئری SQL...'
      )
    }

    const sqlDraft = await callAiChat(
      [
        { role: 'system', content: systemPrompt },
        ...recentHistory.map((message) => ({
          role: message.role,
          content: formatHistoryMessage(message),
        })),
        {
          role: 'user',
          content:
            attempt === 0
              ? [input.question, requestedSchemaFieldHint]
                  .filter(Boolean)
                  .join('\n\n')
              : [
                  'Regenerate the SQL JSON for the same question.',
                  `Previous output was rejected: ${rejectionReason}`,
                  `Return exactly one JSON object with sql and reason. The sql value must be valid ${dataSource.dialect === 'sqlite' ? 'SQLite' : 'SQL Server'} SELECT/WITH only.`,
                  `Question: ${input.question}`,
                ].join('\n'),
        },
      ],
      modelOptionId,
      attempt === 0 ? 0.1 : 0,
      'json_object',
      configOptions
    )

    try {
      parsed = JSON.parse(extractJsonObject(sqlDraft)) as {
        sql?: string
        reason?: string
      }
    } catch {
      rejectionReason = `${providerLabel} did not return valid SQL JSON.`
      continue
    }

    query = parsed.sql ? normalizeGeneratedSql(parsed.sql) : ''
    rejectionReason = getSqlRejectionReason(query, input.question)
    if (!rejectionReason && dataSource.dialect === 'sqlite') {
      rejectionReason = getReservoirSemanticRejectionReason(
        query,
        input.question,
        rowLimit
      )
    }
    if (!rejectionReason) {
      rejectionReason = getSchemaProjectionRejectionReason(
        query,
        input.question,
        schemaJson,
        dataSource.dialect === 'sqlite'
      )
    }
    if (!rejectionReason) break

    // A rejected SQL string is still non-empty. Clear it so the loop performs
    // the correction attempt with the rejection reason in the next prompt.
    lastRejectedQuery = query
    query = ''
  }

  if (rejectionReason) {
    const includeReservoirAliases = dataSource.dialect === 'sqlite'
    const repairedQuery = repairRequestedFieldProjection(
      lastRejectedQuery,
      input.question,
      schemaJson,
      includeReservoirAliases
    )
    let repairRejectionReason = repairedQuery
      ? getSqlRejectionReason(repairedQuery, input.question)
      : rejectionReason

    if (repairedQuery && !repairRejectionReason && includeReservoirAliases) {
      repairRejectionReason = getReservoirSemanticRejectionReason(
        repairedQuery,
        input.question,
        rowLimit
      )
    }
    if (repairedQuery && !repairRejectionReason) {
      repairRejectionReason = getSchemaProjectionRejectionReason(
        repairedQuery,
        input.question,
        schemaJson,
        includeReservoirAliases
      )
    }

    if (repairedQuery && !repairRejectionReason) {
      query = repairedQuery
      parsed.reason =
        'Added every explicitly requested schema field to the detail projection.'
      rejectionReason = ''
      await input.callbacks?.onStatus?.(
        'فیلدهای درخواستی به خروجی SQL اضافه شدند.'
      )
    }
  }

  if (rejectionReason && dataSource.dialect === 'sqlite') {
    const fallbackQuery = buildSimpleMultiMonthReservoirQuery(
      input.question,
      rowLimit
    )
    if (fallbackQuery) {
      query = fallbackQuery
      parsed.reason =
        'Deterministic multi-month reservoir query preserving every requested month.'
      rejectionReason = ''
      await input.callbacks?.onStatus?.(
        'فیلتر چندماهه به‌صورت کامل و متوازن اصلاح شد.'
      )
    }
  }

  if (rejectionReason) {
    throw new Error(`Generated SQL was rejected: ${rejectionReason}`)
  }

  const isAggregateQuery = isAggregateSqlQuery(query)

  await input.callbacks?.onStatus?.(
    isAggregateQuery
      ? 'در حال اجرای کوئری تجمیعی روی پایگاه داده...'
      : 'در حال اجرای کوئری روی پایگاه داده...'
  )
  const rows =
    dataSource.dialect === 'sqlite'
      ? await executeReservoirQuery(query, rowLimit)
      : await executeSqlServerQuery(query, rowLimit)
  const data = serializeQueryData(
    rows as Record<string, unknown>[],
    getSchemaColumnLabels(schemaJson),
    getSchemaColumnValueTypes(schemaJson)
  )
  await input.callbacks?.onAnswerMeta?.({
    sql: query,
    rowCount: rows.length,
    model: providerConfig.model,
    modelLabel: providerConfig.modelLabel,
  })
  await input.callbacks?.onAnswerData?.(data)

  if (deterministicReservoirQuery) {
    const requestedMonths = getRequestedPersianMonths(input.question)
    const monthExamples = requestedMonths.flatMap(({ name }) => {
      const exampleRow = data.rows.find(
        (row) => row.PersianMonthName === name && row.PersianDateText
      )
      const exampleDate = exampleRow?.PersianDateText
      return typeof exampleDate === 'string' || typeof exampleDate === 'number'
        ? [`${name}: ${formatAnswerDateValue(exampleDate, 'persian_date')}`]
        : []
    })
    const answer = `نتیجه شامل همه ماه‌های درخواستی، ${requestedMonths.map(({ name }) => name).join(' و ')}، است${monthExamples.length ? `؛ نمونه تاریخ‌ها: ${monthExamples.join('، ')}` : ''}. ${rows.length.toLocaleString('fa-IR')} ردیف اول به‌صورت متوازن در جدول زیر نمایش داده شده‌اند؛ این عدد سقف نمایش است، نه تعداد کل رکوردهای پایگاه داده.`

    await input.callbacks?.onStatus?.('پاسخ چندماهه آماده است.')
    await input.callbacks?.onAnswerDelta?.(answer)

    return {
      answer,
      reasoning: '',
      sql: query,
      rowCount: rows.length,
      reason: parsed.reason ?? '',
      model: providerConfig.model,
      modelLabel: providerConfig.modelLabel,
      data,
    }
  }

  const answerRows = createAnswerRows(data)

  const answerMessages: OpenAIMessage[] = [
    {
      role: 'system',
      content: [
        'ROLE: Persian answer writer for an RTL database chat.',
        'Use only the user question, relevant prior context, SQL, and returned rows.',
        'Prior context is only for follow-up references; facts must come from returned rows.',
        'MANDATORY DATE OUTPUT: Inspect returned row keys for date or date-time fields before writing the answer.',
        'When a returned date exists, the answer is invalid unless it includes that date, even if the user requested only other columns.',
        'For lists with dates, begin every bullet/item with the relevant date field and its exact returned value.',
        'For a single row with a date, include the date in the first sentence.',
        'Dates in Rows JSON are already Iran-localized and date-only. Copy them exactly and never add an hour or time.',
        'Answer fast and directly in Persian.',
        'First sentence must answer the question.',
        'For one value or one row, use one short paragraph.',
        'For lists, use short bullets and include only useful fields.',
        'For comparisons, use a compact Markdown table with at most 6 columns.',
        'If many rows are returned, summarize first and show the most relevant rows.',
        'If rows are empty, say no matching records were found.',
        'If row count reaches the cap, mention that the result is capped.',
        'Use only date values present in the returned rows. Never invent or estimate a missing date.',
        'Do not output raw JSON, code fences, or unsupported claims.',
      ].join('\n'),
    },
    ...recentHistory.map((message) => ({
      role: message.role,
      content: formatHistoryMessage(message),
    })),
    { role: 'user', content: `پرسش: ${input.question}` },
    {
      role: 'user',
      content: isAggregateQuery
        ? `Rows JSON, aggregate results are not row-capped:\n${JSON.stringify(answerRows)}`
        : `Rows JSON, capped at ${rowLimit} rows:\n${JSON.stringify(answerRows)}`,
    },
  ]

  await input.callbacks?.onStatus?.('در حال استدلال و آماده‌سازی پاسخ...')
  let answer = ''
  let reasoning = ''

  try {
    if (input.streamAnswer) {
      const streamed = await streamAiChat(
        answerMessages,
        modelOptionId,
        (delta) => input.callbacks?.onAnswerDelta?.(delta),
        (delta) => input.callbacks?.onReasoningDelta?.(delta),
        0.2,
        configOptions
      )
      answer = streamed.answer
      reasoning = streamed.reasoning
    } else {
      answer = await callAiChat(
        answerMessages,
        modelOptionId,
        0.2,
        undefined,
        configOptions
      )
    }
  } catch {
    answer = rows.length
      ? `کوئری با موفقیت اجرا شد و ${rows.length.toLocaleString('fa-IR')} ردیف در جدول زیر آماده نمایش است.`
      : 'کوئری با موفقیت اجرا شد، اما رکوردی مطابق پرسش پیدا نشد.'
    await input.callbacks?.onStatus?.(
      'پاسخ متنی سرویس هوش مصنوعی در دسترس نبود؛ نتیجه جدول آماده است.'
    )
    await input.callbacks?.onAnswerDelta?.(answer)
  }

  return {
    answer,
    reasoning,
    sql: query,
    rowCount: rows.length,
    reason: parsed.reason ?? '',
    model: providerConfig.model,
    modelLabel: providerConfig.modelLabel,
    data,
  }
}
