import sqlServer from 'mssql'

import appPackage from '@/package.json'
import {
  DEFAULT_AI_MODEL_OPTION_ID,
  getAiModelOption,
  normalizeAiModelOptionId,
  type AiModelOptionId,
  type AiModelProvider,
} from '@/lib/ai-model-options'

export type ChatRole = 'user' | 'assistant'

export const DATABASE_QUERY_ROW_LIMIT = 50
export const DATABASE_CHAT_HISTORY_LIMIT = 20

export type DatabaseQuestionHistoryMessage = {
  role: ChatRole
  content: string
  sql?: string | null
  rowCount?: number | null
}

type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1'
const MAX_ROW_LIMIT = DATABASE_QUERY_ROW_LIMIT
const MAX_HISTORY_MESSAGES = DATABASE_CHAT_HISTORY_LIMIT

type AiProviderConfig = {
  provider: AiModelProvider
  model: string
  modelLabel: string
  baseUrl: string
  apiKey: string | undefined
  disableAuthHeader: boolean
  reasoningEffort: string
  missingApiKeyMessage: string
  errorLabel: string
}

type AiProviderConfigOptions = {
  allowEnvModelOverride?: boolean
}

type AnswerDatabaseQuestionCallbacks = {
  onStatus?: (message: string) => void | Promise<void>
  onAnswerDelta?: (delta: string) => void | Promise<void>
  onAnswerMeta?: (meta: {
    sql: string
    rowCount: number
    model: string
    modelLabel: string
  }) => void | Promise<void>
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

function normalizeSchemaJsonForPrompt(schemaJson: string) {
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

function normalizeGeneratedSql(query: string) {
  return query
    .trim()
    .replace(/;+\s*$/g, '')
    .trim()
}

function trimBaseUrl(value: string) {
  return value.replace(/\/+$/, '')
}

function isEnabled(value: string | undefined) {
  return /^true$/i.test(value ?? '')
}

function formatProviderModelLabel(
  providerLabel: string,
  model: string,
  option: ReturnType<typeof getAiModelOption>
) {
  return model === option.model ? option.label : `${providerLabel} ${model}`
}

function getProviderConfig(
  modelOptionId: AiModelOptionId = DEFAULT_AI_MODEL_OPTION_ID,
  options: AiProviderConfigOptions = {}
): AiProviderConfig {
  const option = getAiModelOption(modelOptionId)

  if (option.provider === 'arvan') {
    const model =
      options.allowEnvModelOverride && process.env.ARVAN_MODEL?.trim()
        ? process.env.ARVAN_MODEL.trim()
        : option.model
    const disableThinking = isEnabled(
      process.env.ARVAN_DISABLE_THINKING ?? process.env.OPENAI_DISABLE_THINKING
    )
    const reasoningEffort =
      process.env.ARVAN_REASONING_EFFORT?.trim() ||
      process.env.OPENAI_REASONING_EFFORT?.trim() ||
      (disableThinking && /gpt-?oss|oss/i.test(model) ? 'low' : '')

    return {
      provider: option.provider,
      model,
      modelLabel: formatProviderModelLabel('Arvan', model, option),
      baseUrl: trimBaseUrl(process.env.ARVAN_BASE_URL?.trim() || ''),
      apiKey: process.env.ARVAN_API_KEY,
      disableAuthHeader: isEnabled(
        process.env.ARVAN_DISABLE_AUTH_HEADER ??
          process.env.OPENAI_DISABLE_AUTH_HEADER
      ),
      reasoningEffort,
      missingApiKeyMessage: 'ARVAN_API_KEY is not configured.',
      errorLabel: 'Arvan',
    }
  }

  const model =
    options.allowEnvModelOverride && process.env.OPENAI_MODEL?.trim()
      ? process.env.OPENAI_MODEL.trim()
      : option.model

  return {
    provider: option.provider,
    model,
    modelLabel: formatProviderModelLabel('OpenAI', model, option),
    baseUrl: trimBaseUrl(
      process.env.OPENAI_BASE_URL?.trim() || DEFAULT_OPENAI_BASE_URL
    ),
    apiKey: process.env.OPENAI_API_KEY,
    disableAuthHeader: isEnabled(process.env.OPENAI_DISABLE_AUTH_HEADER),
    reasoningEffort: process.env.OPENAI_REASONING_EFFORT?.trim() || '',
    missingApiKeyMessage: 'OPENAI_API_KEY is not configured.',
    errorLabel: 'OpenAI',
  }
}

function getChatCompletionsUrl(config: AiProviderConfig) {
  if (!config.baseUrl) {
    throw new Error(`${config.errorLabel} base URL is not configured.`)
  }

  return `${config.baseUrl}/chat/completions`
}

function getAiHeaders(config: AiProviderConfig) {
  return {
    ...(config.disableAuthHeader || !config.apiKey
      ? {}
      : { Authorization: `Bearer ${config.apiKey}` }),
    'Content-Type': 'application/json',
  }
}

function shouldOmitTemperature(config: AiProviderConfig) {
  const model = config.model.toLowerCase()

  return (
    config.provider === 'openai' &&
    (model.startsWith('gpt-5') || /^o\d/.test(model))
  )
}

function getAiRequestOptions(config: AiProviderConfig, temperature: number) {
  return {
    ...(shouldOmitTemperature(config) ? {} : { temperature }),
    ...(config.reasoningEffort
      ? { reasoning_effort: config.reasoningEffort }
      : {}),
  }
}

async function callAiChat(
  messages: OpenAIMessage[],
  modelOptionId: AiModelOptionId,
  temperature = 1,
  responseFormat?: 'json_object',
  configOptions: AiProviderConfigOptions = {}
) {
  const config = getProviderConfig(modelOptionId, configOptions)
  if (!config.apiKey && !config.disableAuthHeader) {
    throw new Error(config.missingApiKeyMessage)
  }

  const response = await fetch(getChatCompletionsUrl(config), {
    method: 'POST',
    headers: getAiHeaders(config),
    body: JSON.stringify({
      model: config.model,
      messages,
      ...getAiRequestOptions(config, temperature),
      ...(responseFormat ? { response_format: { type: responseFormat } } : {}),
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`${config.errorLabel} request failed: ${details}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  return payload.choices?.[0]?.message?.content?.trim() ?? ''
}

async function streamAiChat(
  messages: OpenAIMessage[],
  modelOptionId: AiModelOptionId,
  onDelta: (delta: string) => void | Promise<void>,
  temperature = 1,
  configOptions: AiProviderConfigOptions = {}
) {
  const config = getProviderConfig(modelOptionId, configOptions)
  if (!config.apiKey && !config.disableAuthHeader) {
    throw new Error(config.missingApiKeyMessage)
  }

  const response = await fetch(getChatCompletionsUrl(config), {
    method: 'POST',
    headers: getAiHeaders(config),
    body: JSON.stringify({
      model: config.model,
      messages,
      ...getAiRequestOptions(config, temperature),
      stream: true,
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`${config.errorLabel} request failed: ${details}`)
  }

  if (!response.body) {
    throw new Error('OpenAI stream response was empty.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let answer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue

      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') return answer

      let payload: { choices?: Array<{ delta?: { content?: string } }> }
      try {
        payload = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>
        }
      } catch {
        throw new Error('OpenAI stream returned invalid JSON.')
      }

      const delta = payload.choices?.[0]?.delta?.content ?? ''
      if (delta) {
        answer += delta
        await onDelta(delta)
      }
    }
  }

  return answer
}

function formatHistoryMessage(message: DatabaseQuestionHistoryMessage) {
  const parts = [message.content]

  if (message.role === 'assistant' && message.sql) {
    parts.push(`SQL used for this answer:\n${message.sql}`)
  }

  if (message.role === 'assistant' && typeof message.rowCount === 'number') {
    parts.push(`Returned row count: ${message.rowCount}`)
  }

  return parts.join('\n\n')
}

async function executeSqlServerQuery(query: string, rowLimit: number) {
  const connectionString = getSqlServerConnectionString()
  if (!connectionString) {
    throw new Error(
      'SQL Server connection string is not configured in package.json.'
    )
  }

  const limit = normalizeRowLimit(rowLimit)
  const pool = await getSharedSqlServerPool(connectionString)

  try {
    const result = await pool
      .request()
      .query(`SET ROWCOUNT ${limit}\n${query}\nSET ROWCOUNT 0`)

    return (result.recordset ?? []).slice(0, limit)
  } catch (error) {
    if (!pool.connected) {
      await resetSharedSqlServerPool(pool)
    }

    throw error
  }
}

function buildSystemPrompt(schemaJson: string, rowLimit: number) {
  const defaultObject = getConfiguredSqlServerTableName()

  return [
    'You are a data analyst for a Persian RTL dashboard.',
    'The user writes in Persian. Answer in Persian, right-to-left friendly prose.',
    'Use the provided database schema JSON as the only source of schema truth.',
    `Primary SQL Server view: ${defaultObject}.`,
    `Every generated query must read from ${defaultObject} unless the schema JSON explicitly names another full table or view.`,
    'Column names are not table names. Never put a column name after FROM or JOIN.',
    'If schema JSON is an array, treat it as the column list for the primary SQL Server view.',
    'If the configured object has no column list, use SELECT TOP with * for broad lookups instead of inventing column names.',
    'Generate SQL Server SELECT queries only. Never modify data or schema.',
    `Never return more than ${rowLimit} rows. Prefer TOP or narrow filters when possible.`,
    'When asked for data, first produce the SQL needed as strict JSON with this shape: {"sql":"SELECT ...","reason":"short Persian reason"}.',
    'Do not include markdown in the SQL JSON response.',
    '',
    'Database schema JSON:',
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
  const schemaJson = normalizeSchemaJsonForPrompt(input.schemaJson)
  const systemPrompt = buildSystemPrompt(schemaJson, rowLimit)
  const recentHistory = input.history.slice(-MAX_HISTORY_MESSAGES)
  const modelOptionId = normalizeAiModelOptionId(input.modelOptionId)
  const configOptions = {
    allowEnvModelOverride: !input.modelOptionId,
  }
  const providerConfig = getProviderConfig(modelOptionId, configOptions)
  const providerLabel = providerConfig.errorLabel

  await input.callbacks?.onStatus?.('در حال ساخت کوئری SQL...')
  const sqlDraft = await callAiChat(
    [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map((message) => ({
        role: message.role,
        content: formatHistoryMessage(message),
      })),
      { role: 'user', content: input.question },
    ],
    modelOptionId,
    0.1,
    'json_object',
    configOptions
  )

  let parsed: { sql?: string; reason?: string }
  try {
    parsed = JSON.parse(extractJsonObject(sqlDraft)) as {
      sql?: string
      reason?: string
    }
  } catch {
    throw new Error(`${providerLabel} did not return valid SQL JSON.`)
  }

  const query = parsed.sql ? normalizeGeneratedSql(parsed.sql) : ''

  if (!query || !isReadOnlySql(query)) {
    throw new Error(
      'Generated SQL was rejected because it is not a single read-only SELECT query.'
    )
  }

  await input.callbacks?.onStatus?.(
    `در حال اجرای کوئری با سقف ${rowLimit} ردیف...`
  )
  const rows = await executeSqlServerQuery(query, rowLimit)
  await input.callbacks?.onAnswerMeta?.({
    sql: query,
    rowCount: rows.length,
    model: providerConfig.model,
    modelLabel: providerConfig.modelLabel,
  })

  const answerMessages: OpenAIMessage[] = [
    {
      role: 'system',
      content: [
        'You answer database questions in Persian for an RTL chat UI.',
        'Use only the user question, SQL, and returned rows below.',
        'Start with a direct answer in one short sentence, then add structured details only when useful.',
        'For one-row or single-value results, answer inline without a table.',
        'For simple lists, use short bullet or numbered lists with one fact per item.',
        'For multi-row comparisons or records with several useful fields, use a compact Markdown table with Persian column labels when possible.',
        'Keep tables narrow: include only columns that answer the question, and summarize first if there are more than 10 rows.',
        'If the rows are empty, say that no matching records were found.',
        'Do not output raw JSON or code fences. Preserve names, numbers, and dates exactly from the rows.',
      ].join('\n'),
    },
    { role: 'user', content: `پرسش: ${input.question}` },
    { role: 'user', content: `SQL:\n${query}` },
    {
      role: 'user',
      content: `Rows JSON, capped at ${rowLimit} rows:\n${JSON.stringify(rows)}`,
    },
  ]

  await input.callbacks?.onStatus?.('در حال آماده‌سازی پاسخ...')
  const answer = input.streamAnswer
    ? await streamAiChat(
        answerMessages,
        modelOptionId,
        (delta) => input.callbacks?.onAnswerDelta?.(delta),
        0.2,
        configOptions
      )
    : await callAiChat(
        answerMessages,
        modelOptionId,
        0.2,
        undefined,
        configOptions
      )

  return {
    answer,
    sql: query,
    rowCount: rows.length,
    reason: parsed.reason ?? '',
    model: providerConfig.model,
    modelLabel: providerConfig.modelLabel,
  }
}
