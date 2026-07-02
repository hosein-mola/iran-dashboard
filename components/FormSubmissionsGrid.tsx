'use client'

import { useMemo } from 'react'
import type { ColDef, ColGroupDef } from 'ag-grid-community'
import type { FormElementInstance } from '@/types/element-type'

import DataGrid from '@/components/data-grid'

type SubmissionRow = Record<string, any>
type SubmissionColumnDef = ColDef<SubmissionRow> | ColGroupDef<SubmissionRow>

const systemColumns = ['id', 'submittedAt', 'version']
const containerTypes = ['panel', 'flex']

function readNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return undefined
  if (typeof value === 'string' && value.trim() === '') return undefined

  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function formatHeader(key: string) {
  if (key === 'id') return 'شناسه'
  if (key === 'submittedAt') return 'زمان ثبت'
  if (key === 'version') return 'نسخه فرم'
  return key
}

function getElementField(element: FormElementInstance) {
  return String(element.extraAttributes?.name || element.id)
}

function getElementHeader(element: FormElementInstance) {
  return String(
    element.extraAttributes?.label ||
      element.extraAttributes?.title ||
      element.extraAttributes?.name ||
      element.id
  )
}

function resolveDataType(element: FormElementInstance) {
  const configuredType = String(element.extraAttributes?.gridDataType || 'auto')

  if (configuredType !== 'auto') return configuredType
  if (element.extraAttributes?.type === 'number') return 'number'

  return 'text'
}

function resolveFilter(
  element: FormElementInstance,
  dataType: string,
  sampleValue: unknown
) {
  const configuredFilter = String(element.extraAttributes?.gridFilter || 'auto')

  if (configuredFilter === 'none') return false
  if (configuredFilter === 'text') return 'agTextColumnFilter'
  if (configuredFilter === 'number') return 'agNumberColumnFilter'
  if (configuredFilter === 'date') return 'agDateColumnFilter'
  if (configuredFilter === 'set') return 'agSetColumnFilter'
  if (configuredFilter === 'multi') return 'agMultiColumnFilter'

  if (dataType === 'number' || typeof sampleValue === 'number') {
    return 'agNumberColumnFilter'
  }
  if (dataType === 'date') return 'agDateColumnFilter'
  if (dataType === 'boolean' || typeof sampleValue === 'boolean') {
    return 'agSetColumnFilter'
  }

  return 'agTextColumnFilter'
}

function normalizeDateText(value: string) {
  return value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
}

function jalaliToGregorian(
  jalaliYear: number,
  jalaliMonth: number,
  jalaliDay: number
) {
  const jy = jalaliYear - 979
  const jm = jalaliMonth - 1
  const jd = jalaliDay - 1
  const jalaliMonthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
  const gregorianMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  let dayNumber =
    365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4)

  for (let index = 0; index < jm; index += 1) {
    dayNumber += jalaliMonthDays[index]
  }

  dayNumber += jd

  let gregorianDayNumber = dayNumber + 79
  let gy = 1600 + 400 * Math.floor(gregorianDayNumber / 146097)
  gregorianDayNumber %= 146097

  let leap = true
  if (gregorianDayNumber >= 36525) {
    gregorianDayNumber -= 1
    gy += 100 * Math.floor(gregorianDayNumber / 36524)
    gregorianDayNumber %= 36524

    if (gregorianDayNumber >= 365) {
      gregorianDayNumber += 1
    } else {
      leap = false
    }
  }

  gy += 4 * Math.floor(gregorianDayNumber / 1461)
  gregorianDayNumber %= 1461

  if (gregorianDayNumber >= 366) {
    leap = false
    gregorianDayNumber -= 1
    gy += Math.floor(gregorianDayNumber / 365)
    gregorianDayNumber %= 365
  }

  let gm = 0
  while (
    gregorianDayNumber >=
    gregorianMonthDays[gm] + (gm === 1 && leap ? 1 : 0)
  ) {
    gregorianDayNumber -= gregorianMonthDays[gm] + (gm === 1 && leap ? 1 : 0)
    gm += 1
  }

  return new Date(gy, gm, gregorianDayNumber + 1)
}

function parseDateValue(value: unknown) {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const normalizedValue = normalizeDateText(String(value))
  const dateParts = normalizedValue.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/
  )

  if (dateParts) {
    const year = Number(dateParts[1])
    const month = Number(dateParts[2])
    const day = Number(dateParts[3])

    if (year >= 1200 && year < 1700) {
      return jalaliToGregorian(year, month, day)
    }

    const date = new Date(year, month - 1, day)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(normalizedValue)
  return Number.isNaN(date.getTime()) ? null : date
}

function dateComparator(filterDate: Date, cellValue: unknown) {
  const cellDate = parseDateValue(cellValue)
  if (!cellDate) return -1

  const filterMidnight = new Date(filterDate)
  filterMidnight.setHours(0, 0, 0, 0)
  const cellMidnight = new Date(cellDate)
  cellMidnight.setHours(0, 0, 0, 0)

  return cellMidnight.getTime() - filterMidnight.getTime()
}

function getDateFilterParams() {
  return {
    comparator: dateComparator,
    browserDatePicker: true,
    inRangeInclusive: true,
    isValidDate: (value: unknown) => Boolean(parseDateValue(value)),
  }
}

function makeValueFormatter(element: FormElementInstance, dataType: string) {
  if (dataType === 'date') {
    return (params: { value: unknown }) => {
      const date = parseDateValue(params.value)
      return date ? date.toLocaleString('fa-IR') : ''
    }
  }

  if (dataType === 'boolean') {
    return (params: { value: unknown }) => {
      if (params.value === true) return 'بله'
      if (params.value === false) return 'خیر'
      return ''
    }
  }

  if (dataType !== 'number') return undefined

  const decimalScale = readNumber(
    element.extraAttributes?.gridDecimalScale || element.extraAttributes?.scale
  )
  const radix = String(element.extraAttributes?.radix ?? '')
  const thousandsSeparator = String(
    element.extraAttributes?.thousandsSeparator ?? ''
  )

  return (params: { value: unknown }) => {
    if (
      params.value === null ||
      params.value === undefined ||
      params.value === ''
    ) {
      return ''
    }

    const number = Number(String(params.value).replace(/,/g, ''))
    if (!Number.isFinite(number)) return String(params.value)

    const formatted = number.toLocaleString('fa-IR', {
      minimumFractionDigits: decimalScale,
      maximumFractionDigits: decimalScale,
    })

    return formatted
      .replace(/٫/g, radix || '٫')
      .replace(/٬/g, thousandsSeparator || '٬')
  }
}

function resolveAggFunc(element: FormElementInstance, dataType: string) {
  const configuredAggFunc = String(
    element.extraAttributes?.gridAggFunc || 'none'
  )

  if (configuredAggFunc !== 'none') return configuredAggFunc
  if (!element.extraAttributes?.gridEnableValue) return 'none'

  return dataType === 'number' ? 'sum' : 'count'
}

function resolvePinnedSide(pinned: string) {
  if (pinned === 'right') return 'left'
  if (pinned === 'left') return 'right'

  return undefined
}

function buildFieldColumnDef(
  element: FormElementInstance,
  sampleValue: unknown
): ColDef<SubmissionRow> {
  const field = getElementField(element)
  const dataType = resolveDataType(element)
  const width = readNumber(element.extraAttributes?.gridWidth)
  const minWidth = readNumber(element.extraAttributes?.gridMinWidth)
  const pinned = String(element.extraAttributes?.gridPinned || 'none')
  const aggFunc = resolveAggFunc(element, dataType)
  const filter = resolveFilter(element, dataType, sampleValue)
  const pinnedSide = resolvePinnedSide(pinned)
  const pinnedWidth = width ?? 180
  const effectiveWidth = pinnedSide ? pinnedWidth : width
  const groupByDefault = Boolean(element.extraAttributes?.gridGroupByDefault)

  return {
    field,
    headerName: getElementHeader(element),
    cellDataType: dataType === 'date' ? false : dataType,
    filter,
    filterParams:
      filter === 'agDateColumnFilter'
        ? getDateFilterParams()
        : undefined,
    valueFormatter: makeValueFormatter(element, dataType),
    pinned: pinnedSide,
    initialPinned: pinnedSide,
    width: effectiveWidth,
    minWidth:
      minWidth ?? (pinnedSide ? Math.min(pinnedWidth, 160) : undefined),
    suppressSizeToFit: Boolean(pinnedSide),
    hide: Boolean(element.extraAttributes?.gridHide || groupByDefault),
    sortable: element.extraAttributes?.gridSortable !== false,
    resizable: element.extraAttributes?.gridResizable !== false,
    floatingFilter: element.extraAttributes?.gridFloatingFilter !== false,
    enableRowGroup: Boolean(
      element.extraAttributes?.gridRowGroup || groupByDefault
    ),
    rowGroup: groupByDefault,
    initialRowGroup: groupByDefault,
    enablePivot: Boolean(element.extraAttributes?.gridPivot),
    enableValue: Boolean(element.extraAttributes?.gridEnableValue),
    aggFunc: aggFunc === 'none' ? undefined : aggFunc,
    initialAggFunc: aggFunc === 'none' ? undefined : aggFunc,
    defaultAggFunc: aggFunc === 'none' ? undefined : aggFunc,
    allowedAggFuncs: ['sum', 'avg', 'min', 'max', 'count'],
    type: dataType === 'number' ? 'numericColumn' : undefined,
  }
}

function getLeafElements(elements: FormElementInstance[]) {
  return elements.filter((element) => !containerTypes.includes(element.type))
}

function aggregateValues(rows: SubmissionRow[], field: string, aggFunc: string) {
  const values = rows
    .map((row) => row[field])
    .filter((value) => value !== null && value !== undefined && value !== '')

  if (aggFunc === 'count') return values.length

  const numbers = values
    .map((value) => Number(String(value).replace(/,/g, '')))
    .filter((value) => Number.isFinite(value))

  if (numbers.length === 0) return ''
  if (aggFunc === 'avg') {
    return numbers.reduce((sum, value) => sum + value, 0) / numbers.length
  }
  if (aggFunc === 'min') return Math.min(...numbers)
  if (aggFunc === 'max') return Math.max(...numbers)

  return numbers.reduce((sum, value) => sum + value, 0)
}

function buildPinnedAggregateRow(
  rows: SubmissionRow[],
  components: FormElementInstance[]
) {
  const aggregateRow: SubmissionRow = {}
  let hasAggregate = false

  for (const element of getLeafElements(components)) {
    const aggFunc = resolveAggFunc(element, resolveDataType(element))
    const field = getElementField(element)

    if (aggFunc === 'none') continue

    aggregateRow[field] = aggregateValues(rows, field, aggFunc)
    hasAggregate = true
  }

  if (!hasAggregate) return []

  return [aggregateRow]
}

function buildFormColumnDefs(
  elements: FormElementInstance[],
  rows: SubmissionRow[],
  parentId: string | null = null,
  visited = new Set<string>()
): SubmissionColumnDef[] {
  return elements
    .filter((element) => element.parentId === parentId)
    .sort((a, b) => a.index - b.index)
    .flatMap<SubmissionColumnDef>((element) => {
      if (visited.has(element.id)) return []

      const nextVisited = new Set(visited)
      nextVisited.add(element.id)

      if (containerTypes.includes(element.type)) {
        const children = buildFormColumnDefs(
          elements,
          rows,
          element.id,
          nextVisited
        )

        if (children.length === 0) return []

        return [
          {
            headerName: getElementHeader(element),
            marryChildren: true,
            children,
          },
        ]
      }

      const field = getElementField(element)
      const sampleValue = rows.find((row) => row[field] !== undefined)?.[field]

      return [buildFieldColumnDef(element, sampleValue)]
    })
}

export default function FormSubmissionsGrid({
  rows,
  components = [],
  showRowGroupPanel = true,
}: {
  rows: SubmissionRow[]
  components?: FormElementInstance[]
  showRowGroupPanel?: boolean
}) {
  const columnDefs = useMemo<SubmissionColumnDef[]>(() => {
    const keys = new Set<string>()

    rows.forEach((row) => {
      Object.keys(row).forEach((key) => keys.add(key))
    })

    const systemColumnDefs = systemColumns
      .filter((key) => keys.has(key))
      .map<ColDef<SubmissionRow>>((key) => ({
        field: key,
        headerName: formatHeader(key),
        filter:
          key === 'submittedAt'
            ? 'agDateColumnFilter'
            : typeof rows[0]?.[key] === 'number'
              ? 'agNumberColumnFilter'
              : 'agTextColumnFilter',
        filterParams:
          key === 'submittedAt' ? getDateFilterParams() : undefined,
        cellDataType: key === 'submittedAt' ? false : undefined,
        valueFormatter:
          key === 'submittedAt'
            ? (params) =>
                params.value
                  ? new Date(params.value).toLocaleString('fa-IR')
                  : ''
            : undefined,
      }))

    const formColumnDefs = buildFormColumnDefs(components, rows)
    const knownFormKeys = new Set(
      components
        .filter((element) => !containerTypes.includes(element.type))
        .map(getElementField)
    )
    const extraColumnDefs = Array.from(keys)
      .filter(
        (key) => !systemColumns.includes(key) && !knownFormKeys.has(key)
      )
      .map<ColDef<SubmissionRow>>((key) => ({
        field: key,
        headerName: formatHeader(key),
        filter:
          typeof rows[0]?.[key] === 'number'
            ? 'agNumberColumnFilter'
            : 'agTextColumnFilter',
      }))

    return [
      ...(systemColumnDefs.length
        ? [
            {
              headerName: 'اطلاعات ثبت',
              marryChildren: true,
              children: systemColumnDefs,
            },
          ]
        : []),
      ...formColumnDefs,
      ...(extraColumnDefs.length
        ? [
            {
              headerName: 'سایر داده‌ها',
              marryChildren: true,
              children: extraColumnDefs,
            },
          ]
        : []),
    ]
  }, [components, rows])
  const pinnedBottomRowData = useMemo(
    () => buildPinnedAggregateRow(rows, components),
    [components, rows]
  )

  return (
    <div className="bg-card min-h-0 w-full flex-1 overflow-hidden rounded-lg border">
      <DataGrid
        rowData={rows}
        columnDefs={columnDefs}
        loading={false}
        height="100%"
        pinnedBottomRowData={pinnedBottomRowData}
        rowGroupPanelShow={showRowGroupPanel ? 'always' : 'never'}
      />
    </div>
  )
}
