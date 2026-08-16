'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  Loader2,
  Search,
  Sparkles,
  Waves,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type ReservoirValue = string | number | null
type ReservoirRow = Record<string, ReservoirValue>

type ReservoirPayload = {
  rows: ReservoirRow[]
  pagination: {
    page: number
    pageSize: number
    total: number
    pageCount: number
  }
  overview: {
    totalRows: number
    objectCount: number
    minDate: string
    maxDate: string
    latestTotalVolume: number
  }
  objectIds: number[]
}

type Filters = {
  objectId: string
  from: string
  to: string
  pageSize: string
}

const visibleColumns = [
  ['ObjectId', 'شناسه مخزن'],
  ['PersianDate', 'تاریخ شمسی'],
  ['InputTime', 'تاریخ میلادی'],
  ['Level', 'تراز'],
  ['Volume', 'حجم'],
  ['InputFlowCalculator', 'دبی ورودی'],
  ['TotalOutFlow', 'دبی خروجی'],
  ['TotalUsageVolume', 'حجم مصرف'],
  ['TotalRain', 'بارش'],
] as const

const numberFormatter = new Intl.NumberFormat('fa-IR', {
  maximumFractionDigits: 2,
})

function formatValue(value: ReservoirValue) {
  if (value === null || value === '') return '—'
  return typeof value === 'number' ? numberFormatter.format(value) : value
}

function formatCellValue(name: string, value: ReservoirValue) {
  if (name === 'PersianDate' && value !== null && value !== '') {
    const digits = String(value).padStart(8, '0')
    const formatted = `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6, 8)}`
    return formatted.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])
  }

  return formatValue(value)
}

function formatDateRangeDate(value: string) {
  if (!value) return '—'
  return new Date(value.replace(' ', 'T')).toLocaleDateString('fa-IR')
}

async function readPayload(response: Response) {
  const payload = (await response.json()) as ReservoirPayload & {
    error?: string
  }
  if (!response.ok) throw new Error(payload.error ?? 'دریافت داده ناموفق بود.')
  return payload
}

export function ReservoirDataClient({
  initialData,
  columns,
}: {
  initialData: ReservoirPayload
  columns: Array<{ name: string; label: string }>
}) {
  const [data, setData] = useState(initialData)
  const [filters, setFilters] = useState<Filters>({
    objectId: 'all',
    from: '',
    to: '',
    pageSize: String(initialData.pagination.pageSize),
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [selectedRow, setSelectedRow] = useState<ReservoirRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadData(nextPage: number, nextFilters: Filters) {
    const params = new URLSearchParams({
      page: String(nextPage),
      pageSize: nextFilters.pageSize,
    })
    if (nextFilters.objectId !== 'all') {
      params.set('objectId', nextFilters.objectId)
    }
    if (nextFilters.from) params.set('from', nextFilters.from)
    if (nextFilters.to) params.set('to', nextFilters.to)

    setLoading(true)
    setError('')
    try {
      const nextData = await fetch(`/api/reservoir-data?${params}`).then(
        readPayload
      )
      setData(nextData)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'دریافت داده ناموفق بود.'
      )
    } finally {
      setLoading(false)
    }
  }

  const rangeLabel = useMemo(
    () =>
      `${formatDateRangeDate(data.overview.minDate)} تا ${formatDateRangeDate(
        data.overview.maxDate
      )}`,
    [data.overview.maxDate, data.overview.minDate]
  )

  function applyFilters() {
    setAppliedFilters({ ...filters })
    void loadData(1, filters)
  }

  return (
    <div
      className="flex min-h-0 w-full max-w-full min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-1 pb-5 md:w-[calc(100vw-var(--sidebar-width)-1rem)] md:max-w-[calc(100vw-var(--sidebar-width)-1rem)]"
      dir="rtl"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <Waves className="text-primary size-6" />
            داده‌های روزانه مخازن
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            نمای جستجوپذیر و صفحه‌بندی‌شده رکوردهای Data.csv
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/ai">
            <Sparkles className="size-4" />
            پرسش از هوش مصنوعی
          </Link>
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Database}
          label="کل رکوردها"
          value={numberFormatter.format(data.overview.totalRows)}
          hint={`${numberFormatter.format(data.overview.objectCount)} مخزن`}
        />
        <SummaryCard
          icon={CalendarRange}
          label="بازه داده"
          value={rangeLabel}
          hint="ثبت روزانه"
        />
        <SummaryCard
          icon={Waves}
          label="حجم آخرین روز"
          value={numberFormatter.format(data.overview.latestTotalVolume)}
          hint="مجموع ۹ مخزن"
        />
        <SummaryCard
          icon={Search}
          label="نتیجه فیلتر"
          value={numberFormatter.format(data.pagination.total)}
          hint={`صفحه ${numberFormatter.format(data.pagination.page)} از ${numberFormatter.format(data.pagination.pageCount)}`}
        />
      </section>

      <Card className="border-border/60 gap-3 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-base">فیلتر داده‌ها</CardTitle>
          <CardDescription>
            مخزن یا بازه تاریخ میلادی را انتخاب کنید.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-[180px_1fr_1fr_140px_auto]">
          <div className="space-y-2">
            <Label>شناسه مخزن</Label>
            <Select
              value={filters.objectId}
              onValueChange={(value) =>
                setFilters((current) => ({ ...current, objectId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه مخازن</SelectItem>
                {data.objectIds.map((objectId) => (
                  <SelectItem key={objectId} value={String(objectId)}>
                    {numberFormatter.format(objectId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="from-date">از تاریخ</Label>
            <Input
              id="from-date"
              type="date"
              dir="ltr"
              value={filters.from}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  from: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to-date">تا تاریخ</Label>
            <Input
              id="to-date"
              type="date"
              dir="ltr"
              value={filters.to}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  to: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>تعداد در صفحه</Label>
            <Select
              value={filters.pageSize}
              onValueChange={(value) =>
                setFilters((current) => ({ ...current, pageSize: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {numberFormatter.format(size)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={applyFilters} disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            اعمال فیلتر
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60 min-h-[420px] max-w-full min-w-0 gap-0 overflow-hidden shadow-sm">
        {error ? (
          <div className="bg-destructive/10 text-destructive m-4 rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        ) : null}
        <div className="relative w-full max-w-full min-w-0 overflow-x-auto">
          {loading ? (
            <div className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <Loader2 className="text-primary size-8 animate-spin" />
            </div>
          ) : null}
          <Table className="min-w-[1280px]">
            <TableHeader>
              <TableRow>
                {visibleColumns.map(([name, label]) => (
                  <TableHead
                    key={name}
                    className="text-right whitespace-nowrap"
                  >
                    {label}
                  </TableHead>
                ))}
                <TableHead className="w-20 text-center">جزئیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.length ? (
                data.rows.map((row) => (
                  <TableRow key={String(row.Id)}>
                    {visibleColumns.map(([name]) => (
                      <TableCell
                        key={name}
                        className="whitespace-nowrap"
                        dir={name === 'InputTime' ? 'ltr' : 'rtl'}
                      >
                        {formatCellValue(name, row[name])}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedRow(row)}
                        aria-label="نمایش جزئیات"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + 1}
                    className="text-muted-foreground h-32 text-center"
                  >
                    رکوردی پیدا نشد.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            {numberFormatter.format(data.pagination.total)} رکورد
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                void loadData(
                  Math.max(1, data.pagination.page - 1),
                  appliedFilters
                )
              }
              disabled={loading || data.pagination.page <= 1}
            >
              <ChevronRight className="size-4" />
              قبلی
            </Button>
            <span className="min-w-24 text-center">
              {numberFormatter.format(data.pagination.page)} /{' '}
              {numberFormatter.format(data.pagination.pageCount)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                void loadData(
                  Math.min(data.pagination.pageCount, data.pagination.page + 1),
                  appliedFilters
                )
              }
              disabled={
                loading || data.pagination.page >= data.pagination.pageCount
              }
            >
              بعدی
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        open={Boolean(selectedRow)}
        onOpenChange={(open) => !open && setSelectedRow(null)}
      >
        <DialogContent
          className="max-h-[85vh] max-w-4xl overflow-y-auto"
          dir="rtl"
        >
          <DialogHeader className="text-right">
            <DialogTitle>جزئیات کامل رکورد</DialogTitle>
            <DialogDescription>
              همه {numberFormatter.format(columns.length)} ستون ثبت‌شده برای این
              روز
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {selectedRow
              ? columns.map((column) => (
                  <div
                    key={column.name}
                    className="bg-muted/40 border-border/60 rounded-lg border p-3"
                  >
                    <div className="text-muted-foreground text-xs">
                      {column.label}
                    </div>
                    <div
                      className="mt-1 font-medium break-words"
                      dir={column.name === 'InputTime' ? 'ltr' : 'rtl'}
                    >
                      {formatCellValue(column.name, selectedRow[column.name])}
                    </div>
                    <div
                      className="text-muted-foreground mt-1 text-[10px]"
                      dir="ltr"
                    >
                      {column.name}
                    </div>
                  </div>
                ))
              : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Database
  label: string
  value: string
  hint: string
}) {
  return (
    <Card className="border-border/60 gap-2 shadow-sm">
      <CardContent className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="mt-2 truncate text-lg font-bold" title={value}>
            {value}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
        </div>
        <div className="bg-primary/10 text-primary rounded-lg p-2">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}
