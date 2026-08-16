'use client'

import { useMemo } from 'react'
import type { ColDef } from 'ag-grid-community'
import { BarChart3 } from 'lucide-react'
import PersianDate from 'persian-date'

import DataGrid from '@/components/data-grid'
import type {
  DatabaseQueryCell,
  DatabaseQueryData,
} from '@/lib/ai-database-chat'

const AI_RESULT_GRID_HEIGHT = '560px'

const iranNumberFormatter = new Intl.NumberFormat('fa-IR')
const iranDateFormatter = new Intl.DateTimeFormat('fa-IR', {
  calendar: 'persian',
  dateStyle: 'medium',
  numberingSystem: 'arabext',
  timeZone: 'Asia/Tehran',
})
const iranDatePartsFormatter = new Intl.DateTimeFormat('fa-IR', {
  calendar: 'persian',
  day: 'numeric',
  month: 'long',
  numberingSystem: 'arabext',
  timeZone: 'Asia/Tehran',
  weekday: 'long',
  year: 'numeric',
})

type PersianDatePart = 'year' | 'month' | 'day' | 'weekday'

const DATE_PART_VALUE_TYPES = new Set([
  'year',
  'year_month',
  'month',
  'month_name',
  'day',
  'weekday_name',
  'season_name',
])

function localizeDigits(value: string) {
  return value.replace(/\d/g, (digit) =>
    Number(digit).toLocaleString('fa-IR', { useGrouping: false })
  )
}

function normalizeDigits(value: string) {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩'

  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = persianDigits.indexOf(digit)
    return String(
      persianIndex >= 0 ? persianIndex : arabicDigits.indexOf(digit)
    )
  })
}

function isDateColumn(column: string, valueType?: string) {
  return /(?:date|time|تاریخ|زمان)/i.test(`${column} ${valueType ?? ''}`)
}

function isDatePartColumn(valueType?: string) {
  return valueType ? DATE_PART_VALUE_TYPES.has(valueType) : false
}

function isIdentifierColumn(
  column: string,
  label?: string,
  valueType?: string
) {
  return (
    /(?:^|_)(?:id|code|key)(?:$|_)/i.test(column) ||
    /(?:Id|ID|Code|Key)$/.test(column) ||
    /^(?:id|identifier|code|key)$/i.test(valueType ?? '') ||
    /شناسه|کد|شماره\s*(?:پرسنلی|ملی)/.test(label ?? '')
  )
}

function getColumnDisplayPriority(
  column: string,
  label?: string,
  valueType?: string
) {
  if (isIdentifierColumn(column, label, valueType)) return 0
  if (isDateColumn(column, valueType) || isDatePartColumn(valueType)) return 1
  return 2
}

function formatDateValue(value: string | number) {
  const normalized = normalizeDigits(String(value)).trim()
  const compactJalaliDate = normalized.replace(/[/-]/g, '')

  if (/^(?:13|14)\d{6}$/.test(compactJalaliDate)) {
    return localizeDigits(
      `${compactJalaliDate.slice(0, 4)}/${compactJalaliDate.slice(4, 6)}/${compactJalaliDate.slice(6, 8)}`
    )
  }

  if (typeof value === 'number') return iranNumberFormatter.format(value)

  const parsedDate = new Date(normalized)
  return Number.isNaN(parsedDate.getTime())
    ? localizeDigits(value)
    : iranDateFormatter.format(parsedDate)
}

function getPersianDateParts(value: DatabaseQueryCell) {
  if (typeof value !== 'string' && typeof value !== 'number') return null

  const normalized = normalizeDigits(String(value)).trim()
  const compactJalaliDate = normalized.replace(/[/-]/g, '')

  if (/^(?:13|14)\d{6}$/.test(compactJalaliDate)) {
    const year = Number(compactJalaliDate.slice(0, 4))
    const month = Number(compactJalaliDate.slice(4, 6))
    const day = Number(compactJalaliDate.slice(6, 8))
    const [formattedYear, formattedMonth, formattedDay, formattedWeekday] =
      new PersianDate([year, month, day]).format('YYYY|MMMM|DD|dddd').split('|')

    return {
      year: formattedYear,
      month: formattedMonth,
      day: formattedDay,
      weekday: formattedWeekday,
    }
  }

  const parsedDate = new Date(normalized)
  if (Number.isNaN(parsedDate.getTime())) return null

  const parts = Object.fromEntries(
    iranDatePartsFormatter
      .formatToParts(parsedDate)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  )

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    weekday: parts.weekday,
  }
}

function createPersianDatePartColumn(
  sourceColumn: string,
  sourceLabel: string,
  part: PersianDatePart,
  partLabel: string
): ColDef<Record<string, DatabaseQueryCell>> {
  return {
    colId: `${sourceColumn}__persian_${part}`,
    headerName: `${partLabel} (${sourceLabel})`,
    headerTooltip: `${partLabel} محاسبه‌شده از ${sourceLabel}`,
    minWidth: part === 'weekday' ? 150 : 130,
    cellDataType: 'text',
    chartDataType: 'category',
    valueGetter: ({ data: row }) =>
      getPersianDateParts(row?.[sourceColumn] ?? null)?.[part] ?? '—',
    tooltipValueGetter: ({ value }) => String(value ?? '—'),
  }
}

function formatCellValue(
  value: DatabaseQueryCell,
  column: string,
  dateColumn = isDateColumn(column)
) {
  if (value === null) return '—'
  if (dateColumn && (typeof value === 'string' || typeof value === 'number')) {
    return formatDateValue(value)
  }
  if (typeof value === 'number') return iranNumberFormatter.format(value)
  if (typeof value === 'boolean') return value ? 'بله' : 'خیر'
  return value
}

export function AiResultGrid({ data }: { data: DatabaseQueryData }) {
  const columnDefs = useMemo<ColDef<Record<string, DatabaseQueryCell>>[]>(
    () =>
      [...data.columns]
        .sort(
          (left, right) =>
            getColumnDisplayPriority(
              left,
              data.columnLabels?.[left],
              data.columnValueTypes?.[left]
            ) -
            getColumnDisplayPriority(
              right,
              data.columnLabels?.[right],
              data.columnValueTypes?.[right]
            )
        )
        .flatMap((column) => {
          const valueType = data.columnValueTypes?.[column]
          const columnLabel = data.columnLabels?.[column]
          const dateColumn = isDateColumn(column, valueType)
          const datePartColumn = isDatePartColumn(valueType)
          const identifierColumn = isIdentifierColumn(
            column,
            columnLabel,
            valueType
          )
          const numericColumn = data.rows.some(
            (row) => typeof row[column] === 'number'
          )

          const baseColumn: ColDef<Record<string, DatabaseQueryCell>> = {
            field: column,
            headerName: columnLabel ?? column,
            headerTooltip: columnLabel ? `${columnLabel} (${column})` : column,
            minWidth: 140,
            flex: data.columns.length <= 4 ? 1 : undefined,
            tooltipField: dateColumn ? undefined : column,
            tooltipValueGetter: dateColumn
              ? ({ value }) => String(value ?? '—')
              : undefined,
            cellDataType:
              dateColumn || datePartColumn
                ? 'text'
                : numericColumn
                  ? 'number'
                  : 'text',
            chartDataType:
              dateColumn || datePartColumn || identifierColumn
                ? 'category'
                : numericColumn
                  ? 'series'
                  : 'category',
            valueGetter: dateColumn
              ? ({ data: row }) =>
                  formatCellValue(row?.[column] ?? null, column, true)
              : undefined,
            valueFormatter: ({ value }) =>
              dateColumn
                ? String(value ?? '—')
                : datePartColumn && value !== null
                  ? localizeDigits(String(value))
                  : formatCellValue(value as DatabaseQueryCell, column),
          }

          if (!dateColumn) return [baseColumn]

          const sourceLabel = columnLabel ?? column
          const includedValueTypes = new Set(
            data.columns.map(
              (resultColumn) => data.columnValueTypes?.[resultColumn]
            )
          )
          const computedColumns = [
            includedValueTypes.has('year')
              ? null
              : createPersianDatePartColumn(
                  column,
                  sourceLabel,
                  'year',
                  'سال شمسی'
                ),
            includedValueTypes.has('month_name')
              ? null
              : createPersianDatePartColumn(
                  column,
                  sourceLabel,
                  'month',
                  'ماه شمسی'
                ),
            includedValueTypes.has('day')
              ? null
              : createPersianDatePartColumn(
                  column,
                  sourceLabel,
                  'day',
                  'روز ماه'
                ),
            includedValueTypes.has('weekday_name')
              ? null
              : createPersianDatePartColumn(
                  column,
                  sourceLabel,
                  'weekday',
                  'روز هفته'
                ),
          ].filter(
            (
              computedColumn
            ): computedColumn is ColDef<Record<string, DatabaseQueryCell>> =>
              computedColumn !== null
          )

          return [baseColumn, ...computedColumns]
        }),
    [data.columnLabels, data.columnValueTypes, data.columns, data.rows]
  )
  return (
    <div
      className="border-border/70 bg-background/80 mt-3 min-w-0 overflow-hidden rounded-lg border"
      dir="rtl"
    >
      <div className="border-border/70 text-muted-foreground flex items-center justify-between gap-3 border-b px-3 py-2 text-xs">
        <span className="font-medium">نتیجه کوئری</span>
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden items-center gap-1 sm:flex">
            <BarChart3 className="size-3.5" />
            انتخاب شناسه/تاریخ و مقادیر، سپس راست‌کلیک برای نمودار
          </span>
          <span>{data.rows.length.toLocaleString('fa-IR')} ردیف</span>
        </div>
      </div>
      {data.columns.length ? (
        <DataGrid
          rowData={data.rows}
          columnDefs={columnDefs}
          height={AI_RESULT_GRID_HEIGHT}
          rowGroupPanelShow="never"
          compact
          enableCharts
          paginationPageSize={10}
          paginationPageSizeSelector={[5, 10, 20, 50]}
        />
      ) : (
        <div className="text-muted-foreground px-3 py-5 text-center text-xs">
          داده‌ای برای نمایش وجود ندارد.
        </div>
      )}
    </div>
  )
}
