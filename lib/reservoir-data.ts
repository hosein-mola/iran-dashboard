import 'server-only'

import { mkdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import PersianDate from 'persian-date'

import { PrismaClient } from '@/prisma/client/client'

import prisma from '@/lib/prisma'

export const RESERVOIR_AI_SCHEMA_ID = 'reservoir-csv-daily-data'
export const RESERVOIR_VIEW_NAME = 'reservoir_daily_view'
const RESERVOIR_SCHEMA_VERSION = 'shamsi-search-columns-v1'

export type ReservoirColumn = {
  name: string
  type: 'integer' | 'real' | 'text'
  valueType?:
    | 'datetime'
    | 'persian_date'
    | 'year'
    | 'year_month'
    | 'month'
    | 'month_name'
    | 'day'
    | 'weekday_name'
    | 'season_name'
  label: string
  description?: string
}

const integerColumns = new Set([
  'Id',
  'ObjectId',
  'PersianDate',
  'TotalActiveHour',
  'TotalActiveMinute',
  'TotalReactiveHour',
  'TotalReactiveMinute',
])

const columnLabels: Record<string, string> = {
  Id: 'شناسه رکورد',
  ObjectId: 'شناسه مخزن',
  InputTime: 'تاریخ ثبت',
  PersianDate: 'تاریخ شمسی',
  Level: 'تراز آب',
  PreviousLevel: 'تراز روز قبل',
  Volume: 'حجم مخزن',
  PreviousVolume: 'حجم روز قبل',
  Area: 'مساحت سطح مخزن',
  EvaporationCoefficient: 'ضریب تبخیر',
  InputVolumeCalculator: 'حجم ورودی محاسبه‌شده',
  InputFlowCalculator: 'دبی ورودی محاسبه‌شده',
  DaricheAbgiriFlow: 'دبی دریچه آبگیری',
  DaricheAbgiriVolume: 'حجم دریچه آبگیری',
  PumpazhFlow: 'دبی پمپاژ',
  PumpazhVolume: 'حجم پمپاژ',
  SarrizFlow: 'دبی سرریز',
  SarrizVolume: 'حجم سرریز',
  TakhlieRosobFlow: 'دبی تخلیه رسوب',
  TakhlieRosobVolume: 'حجم تخلیه رسوب',
  Tabkhir: 'تبخیر',
  TabkhirVolume: 'حجم تبخیر',
  NashtFlow: 'دبی نشت',
  NashtVolume: 'حجم نشت',
  ZehkeshFlow: 'دبی زهکش',
  ZehkeshVolume: 'حجم زهکش',
  NiroghahFlow: 'دبی نیروگاه',
  NiroghahVolume: 'حجم نیروگاه',
  TotalOutVolume: 'حجم کل خروجی',
  TotalOutFlow: 'دبی کل خروجی',
  TotalActiveEnergy: 'انرژی اکتیو کل',
  TotalReactiveEnergy: 'انرژی راکتیو کل',
  TotalActiveHour: 'ساعت اکتیو',
  TotalActiveMinute: 'دقیقه اکتیو',
  TotalReactiveHour: 'ساعت راکتیو',
  TotalReactiveMinute: 'دقیقه راکتیو',
  ShorbFlow: 'دبی شرب',
  ShorbVolume: 'حجم شرب',
  SanatFlow: 'دبی صنعت',
  SanatVolume: 'حجم صنعت',
  KeshavarziFlow: 'دبی کشاورزی',
  KeshavarziVolume: 'حجم کشاورزی',
  SayerFlow: 'دبی سایر مصارف',
  SayerVolume: 'حجم سایر مصارف',
  TotalUsageVolume: 'حجم کل مصرف',
  TotalUsageFlow: 'دبی کل مصرف',
  Baran: 'باران',
  Barf: 'برف',
  TotalRain: 'بارش کل',
  WaterYearInputVolume: 'ورودی تجمعی سال آبی',
  WaterYearOutPutVolume: 'خروجی تجمعی سال آبی',
  TotalVolume: 'حجم کل',
}

const expectedColumnNames = Object.keys(columnLabels)

const RESERVOIR_CSV_COLUMNS: ReservoirColumn[] = expectedColumnNames.map(
  (name) => ({
    name,
    type:
      name === 'InputTime'
        ? 'text'
        : integerColumns.has(name)
          ? 'integer'
          : 'real',
    label: columnLabels[name],
    valueType:
      name === 'InputTime'
        ? 'datetime'
        : name === 'PersianDate'
          ? 'persian_date'
          : undefined,
    description:
      name === 'ObjectId'
        ? 'شناسه یکتای مخزن؛ داده شامل ۹ مخزن است.'
        : name === 'InputTime'
          ? 'تاریخ میلادی ثبت روزانه با قالب YYYY-MM-DD HH:mm:ss.SSS'
          : name === 'PersianDate'
            ? 'تاریخ شمسی عددی با قالب YYYYMMDD'
            : name === 'Level'
              ? 'تراز یا سطح فعلی آب مخزن؛ عبارت‌های سطح، میزان سطح و تراز به این ستون اشاره می‌کنند.'
              : name === 'Volume'
                ? 'حجم فعلی مخزن؛ عبارت حجم به‌تنهایی به این ستون اشاره می‌کند.'
                : name === 'PreviousLevel'
                  ? 'تراز یا سطح روز قبل؛ فقط وقتی کاربر صریحاً روز قبل یا سطح قبلی را می‌خواهد.'
                  : name === 'PreviousVolume'
                    ? 'حجم روز قبل؛ فقط وقتی کاربر صریحاً روز قبل یا حجم قبلی را می‌خواهد.'
                    : undefined,
  })
)

const RESERVOIR_SHAMSI_COLUMNS: ReservoirColumn[] = [
  {
    name: 'PersianDateText',
    type: 'text',
    valueType: 'persian_date',
    label: 'تاریخ شمسی متنی',
    description: 'تاریخ شمسی قابل جستجو با قالب YYYY/MM/DD؛ مثال: ۱۴۰۴/۰۶/۱۵',
  },
  {
    name: 'PersianYear',
    type: 'integer',
    valueType: 'year',
    label: 'سال شمسی',
    description: 'سال شمسی عددی؛ مثال: ۱۴۰۴',
  },
  {
    name: 'PersianYearMonth',
    type: 'integer',
    valueType: 'year_month',
    label: 'سال و ماه شمسی',
    description: 'سال و ماه شمسی عددی با قالب YYYYMM؛ مثال: ۱۴۰۴۰۶',
  },
  {
    name: 'PersianMonth',
    type: 'integer',
    valueType: 'month',
    label: 'شماره ماه شمسی',
    description: 'شماره ماه شمسی از ۱ تا ۱۲؛ مثال: شهریور برابر ۶ است.',
  },
  {
    name: 'PersianMonthName',
    type: 'text',
    valueType: 'month_name',
    label: 'نام ماه شمسی',
    description: 'نام فارسی ماه شمسی؛ مثال: شهریور',
  },
  {
    name: 'PersianDay',
    type: 'integer',
    valueType: 'day',
    label: 'روز ماه شمسی',
    description: 'شماره روز ماه شمسی از ۱ تا ۳۱',
  },
  {
    name: 'PersianWeekdayName',
    type: 'text',
    valueType: 'weekday_name',
    label: 'روز هفته',
    description: 'نام فارسی روز هفته؛ مثال: دوشنبه',
  },
  {
    name: 'PersianSeasonName',
    type: 'text',
    valueType: 'season_name',
    label: 'فصل شمسی',
    description: 'نام فصل شمسی: بهار، تابستان، پاییز یا زمستان',
  },
]

export const RESERVOIR_COLUMNS: ReservoirColumn[] = [
  ...RESERVOIR_CSV_COLUMNS,
  ...RESERVOIR_SHAMSI_COLUMNS,
]

type ReservoirPrismaGlobal = typeof globalThis & {
  reservoirPrisma?: PrismaClient
  reservoirImportPromise?: Promise<void>
  reservoirImportVersion?: string
}

const reservoirGlobal = globalThis as ReservoirPrismaGlobal
const databasePath = path.join(process.cwd(), 'data', 'reservoir-data.db')
const reservoirPrisma =
  reservoirGlobal.reservoirPrisma ??
  new PrismaClient({ datasourceUrl: `file:${databasePath}` })

if (process.env.NODE_ENV !== 'production') {
  reservoirGlobal.reservoirPrisma = reservoirPrisma
}

if (reservoirGlobal.reservoirImportVersion !== RESERVOIR_SCHEMA_VERSION) {
  reservoirGlobal.reservoirImportPromise = undefined
  reservoirGlobal.reservoirImportVersion = RESERVOIR_SCHEMA_VERSION
}

function quoteIdentifier(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

function findCsvPath() {
  return path.join(process.cwd(), 'data', 'reservoir-readings.csv')
}

function parseCsvLine(line: string) {
  const fields: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      fields.push(field)
      field = ''
    } else {
      field += character
    }
  }

  fields.push(field)
  return fields
}

function parseCell(value: string, column: ReservoirColumn) {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (column.type === 'text') return trimmed

  const numericValue = Number(trimmed)
  if (!Number.isFinite(numericValue)) {
    throw new Error(`Invalid numeric value for ${column.name}: ${trimmed}`)
  }

  return numericValue
}

function sqliteType(column: ReservoirColumn) {
  if (column.type === 'integer') return 'INTEGER'
  if (column.type === 'real') return 'REAL'
  return 'TEXT'
}

function createShamsiHelperValues(persianDateValue: unknown) {
  const compactDate = String(persianDateValue ?? '').replace(/\D/g, '')
  if (!/^\d{8}$/.test(compactDate)) {
    return RESERVOIR_SHAMSI_COLUMNS.map(() => null)
  }

  const year = Number(compactDate.slice(0, 4))
  const month = Number(compactDate.slice(4, 6))
  const day = Number(compactDate.slice(6, 8))
  const persianDate = new PersianDate([year, month, day])
  const seasons = ['بهار', 'تابستان', 'پاییز', 'زمستان']

  return [
    `${compactDate.slice(0, 4)}/${compactDate.slice(4, 6)}/${compactDate.slice(6, 8)}`,
    year,
    year * 100 + month,
    month,
    persianDate.format('MMMM'),
    day,
    persianDate.format('dddd'),
    seasons[Math.floor((month - 1) / 3)] ?? null,
  ]
}

async function importCsv() {
  const csvPath = findCsvPath()
  const [csvText, fileInfo] = await Promise.all([
    readFile(csvPath, 'utf8'),
    stat(csvPath),
  ])
  const signature = `${RESERVOIR_SCHEMA_VERSION}:${fileInfo.size}:${Math.trunc(fileInfo.mtimeMs)}`

  await mkdir(path.dirname(databasePath), { recursive: true })
  await reservoirPrisma.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS reservoir_import_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)'
  )

  const metadata = await reservoirPrisma.$queryRawUnsafe<
    Array<{ value: string }>
  >(
    "SELECT value FROM reservoir_import_meta WHERE key = 'csv_signature' LIMIT 1"
  )
  if (metadata[0]?.value === signature) return

  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
  const headers = parseCsvLine(lines.shift() ?? '')

  if (
    headers.length !== expectedColumnNames.length ||
    headers.some((header, index) => header !== expectedColumnNames[index])
  ) {
    throw new Error(
      'ساختار ستون‌های Data.csv با ساختار مورد انتظار تطابق ندارد.'
    )
  }

  const rows = lines.map((line, rowIndex) => {
    const values = parseCsvLine(line)
    if (values.length !== RESERVOIR_CSV_COLUMNS.length) {
      throw new Error(`CSV row ${rowIndex + 2} has ${values.length} columns.`)
    }
    const csvValues = values.map((value, index) =>
      parseCell(value, RESERVOIR_CSV_COLUMNS[index])
    )
    const persianDateIndex = expectedColumnNames.indexOf('PersianDate')

    return [
      ...csvValues,
      ...createShamsiHelperValues(csvValues[persianDateIndex]),
    ]
  })

  const columnSql = RESERVOIR_COLUMNS.map(
    (column) =>
      `${quoteIdentifier(column.name)} ${sqliteType(column)}${
        column.name === 'Id' ? ' PRIMARY KEY' : ''
      }`
  ).join(', ')
  const quotedColumns = RESERVOIR_COLUMNS.map((column) =>
    quoteIdentifier(column.name)
  ).join(', ')

  await reservoirPrisma.$transaction(
    async (transaction) => {
      await transaction.$executeRawUnsafe(
        'DROP TABLE IF EXISTS reservoir_daily_import'
      )
      await transaction.$executeRawUnsafe(
        `CREATE TABLE reservoir_daily_import (${columnSql})`
      )

      const batchSize = 15
      for (let offset = 0; offset < rows.length; offset += batchSize) {
        const batch = rows.slice(offset, offset + batchSize)
        const placeholders = batch
          .map(() => `(${RESERVOIR_COLUMNS.map(() => '?').join(', ')})`)
          .join(', ')
        await transaction.$executeRawUnsafe(
          `INSERT INTO reservoir_daily_import (${quotedColumns}) VALUES ${placeholders}`,
          ...batch.flat()
        )
      }

      await transaction.$executeRawUnsafe(
        `DROP VIEW IF EXISTS ${RESERVOIR_VIEW_NAME}`
      )
      await transaction.$executeRawUnsafe(
        'DROP TABLE IF EXISTS reservoir_daily'
      )
      await transaction.$executeRawUnsafe(
        'ALTER TABLE reservoir_daily_import RENAME TO reservoir_daily'
      )
      await transaction.$executeRawUnsafe(
        'CREATE INDEX reservoir_daily_object_date_idx ON reservoir_daily (ObjectId, InputTime)'
      )
      await transaction.$executeRawUnsafe(
        'CREATE INDEX reservoir_daily_persian_date_idx ON reservoir_daily (PersianDate)'
      )
      await transaction.$executeRawUnsafe(
        'CREATE INDEX reservoir_daily_persian_year_month_idx ON reservoir_daily (PersianYearMonth, ObjectId)'
      )
      await transaction.$executeRawUnsafe(
        'CREATE INDEX reservoir_daily_persian_parts_idx ON reservoir_daily (PersianYear, PersianMonth, PersianDay, ObjectId)'
      )
      await transaction.$executeRawUnsafe(
        `CREATE VIEW ${RESERVOIR_VIEW_NAME} AS SELECT ${quotedColumns} FROM reservoir_daily`
      )
      await transaction.$executeRawUnsafe(
        "INSERT INTO reservoir_import_meta (key, value) VALUES ('csv_signature', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        signature
      )
    },
    { maxWait: 10_000, timeout: 120_000 }
  )
}

export async function ensureReservoirData() {
  reservoirGlobal.reservoirImportPromise ??= importCsv().catch((error) => {
    reservoirGlobal.reservoirImportPromise = undefined
    throw error
  })
  await reservoirGlobal.reservoirImportPromise
}

export function getReservoirSchemaJson() {
  return JSON.stringify(
    {
      dialect: 'sqlite',
      source: 'reservoir-csv',
      database: 'reservoir-data.db',
      defaultObject: RESERVOIR_VIEW_NAME,
      description:
        'داده‌های روزانه ۹ مخزن از Data.csv، از 2023-09-23 تا 2025-09-22 (۱۴۰۲/۰۷/۰۱ تا ۱۴۰۴/۰۶/۳۱).',
      views: [
        {
          name: RESERVOIR_VIEW_NAME,
          description: 'نمای خواندنی همه رکوردهای روزانه مخازن',
          columns: RESERVOIR_COLUMNS.map((column) => ({
            name: column.name,
            type: column.type,
            label: column.label,
            ...(column.valueType ? { valueType: column.valueType } : {}),
            ...(column.description ? { description: column.description } : {}),
          })),
        },
      ],
    },
    null,
    2
  )
}

export async function ensureReservoirAiSchema() {
  await ensureReservoirData()
  const schemaJson = getReservoirSchemaJson()

  return prisma.aiDatabaseSchema.upsert({
    where: { id: RESERVOIR_AI_SCHEMA_ID },
    create: {
      id: RESERVOIR_AI_SCHEMA_ID,
      name: 'داده‌های روزانه مخازن',
      description: 'منبع Data.csv؛ آماده پرسش و تحلیل با هوش مصنوعی',
      schemaJson,
      rowLimit: 50,
      messageQuota: 100,
      active: true,
    },
    update: {
      name: 'داده‌های روزانه مخازن',
      description: 'منبع Data.csv؛ آماده پرسش و تحلیل با هوش مصنوعی',
      schemaJson,
      active: true,
    },
  })
}

export async function executeReservoirQuery(query: string, rowLimit: number) {
  await ensureReservoirData()
  const rows =
    await reservoirPrisma.$queryRawUnsafe<Record<string, unknown>[]>(query)
  return rows.slice(0, Math.max(1, rowLimit)).map(serializeRecord)
}

type ReservoirSerializedValue = string | number | null

function serializeValue(value: unknown): ReservoirSerializedValue {
  if (typeof value === 'bigint') return Number(value)
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    value === null
  ) {
    return value
  }
  return String(value)
}

function serializeRecord(
  row: Record<string, unknown>
): Record<string, ReservoirSerializedValue> {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, serializeValue(value)])
  )
}

export type ReservoirPageInput = {
  page?: number
  pageSize?: number
  objectId?: number
  from?: string
  to?: string
}

export async function getReservoirPage(input: ReservoirPageInput = {}) {
  await ensureReservoirData()
  const pageSize = Math.min(Math.max(Math.trunc(input.pageSize ?? 25), 10), 100)
  const page = Math.max(Math.trunc(input.page ?? 1), 1)
  const clauses: string[] = []
  const values: Array<string | number> = []

  if (input.objectId !== undefined && Number.isFinite(input.objectId)) {
    clauses.push('ObjectId = ?')
    values.push(Math.trunc(input.objectId))
  }
  if (input.from) {
    clauses.push('InputTime >= ?')
    values.push(`${input.from} 00:00:00.000`)
  }
  if (input.to) {
    clauses.push('InputTime <= ?')
    values.push(`${input.to} 23:59:59.999`)
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const [countRows, rows, overviewRows, latestRows, objectRows] =
    await Promise.all([
      reservoirPrisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
        `SELECT COUNT(*) AS count FROM ${RESERVOIR_VIEW_NAME} ${where}`,
        ...values
      ),
      reservoirPrisma.$queryRawUnsafe<Record<string, unknown>[]>(
        `SELECT * FROM ${RESERVOIR_VIEW_NAME} ${where} ORDER BY InputTime DESC, ObjectId ASC LIMIT ? OFFSET ?`,
        ...values,
        pageSize,
        (page - 1) * pageSize
      ),
      reservoirPrisma.$queryRawUnsafe<
        Array<{
          totalRows: bigint | number
          objectCount: bigint | number
          minDate: string
          maxDate: string
        }>
      >(
        `SELECT COUNT(*) AS totalRows, COUNT(DISTINCT ObjectId) AS objectCount, MIN(InputTime) AS minDate, MAX(InputTime) AS maxDate FROM ${RESERVOIR_VIEW_NAME}`
      ),
      reservoirPrisma.$queryRawUnsafe<Array<{ totalVolume: number }>>(
        `SELECT SUM(Volume) AS totalVolume FROM ${RESERVOIR_VIEW_NAME} WHERE InputTime = (SELECT MAX(InputTime) FROM ${RESERVOIR_VIEW_NAME})`
      ),
      reservoirPrisma.$queryRawUnsafe<Array<{ ObjectId: bigint | number }>>(
        `SELECT DISTINCT ObjectId FROM ${RESERVOIR_VIEW_NAME} ORDER BY ObjectId`
      ),
    ])

  const total = Number(countRows[0]?.count ?? 0)
  const overview = overviewRows[0]

  return {
    rows: rows.map(serializeRecord),
    pagination: {
      page,
      pageSize,
      total,
      pageCount: Math.max(Math.ceil(total / pageSize), 1),
    },
    overview: {
      totalRows: Number(overview?.totalRows ?? 0),
      objectCount: Number(overview?.objectCount ?? 0),
      minDate: overview?.minDate ?? '',
      maxDate: overview?.maxDate ?? '',
      latestTotalVolume: Number(latestRows[0]?.totalVolume ?? 0),
    },
    objectIds: objectRows.map((row) => Number(row.ObjectId)),
  }
}

export async function getReservoirDataHealth() {
  try {
    await ensureReservoirData()
    const result = await reservoirPrisma.$queryRawUnsafe<
      Array<{ count: bigint | number }>
    >(`SELECT COUNT(*) AS count FROM ${RESERVOIR_VIEW_NAME}`)

    return {
      configured: true,
      connected: true,
      provider: 'sqlite' as const,
      message: `${Number(result[0]?.count ?? 0).toLocaleString('fa-IR')} رکورد CSV آماده تحلیل است.`,
      database: 'reservoir-data.db',
    }
  } catch (error) {
    return {
      configured: true,
      connected: false,
      provider: 'sqlite' as const,
      message:
        error instanceof Error ? error.message : 'خطا در آماده‌سازی Data.csv.',
      database: 'reservoir-data.db',
    }
  }
}
