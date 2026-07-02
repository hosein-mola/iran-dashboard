'use client'

import Link from 'next/link'
import { type ReactNode, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Droplets,
  FilePieChart,
  Gauge,
  PieChart as PieChartIcon,
  ShieldCheck,
  Waves,
} from 'lucide-react'

import { IranMap } from '@/components/shadcnmaps/maps/iran'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Separator } from '@/components/ui/separator'

const reportStats = [
  {
    title: 'گزارش‌های تولید شده',
    value: '۱۲۸',
    hint: '۳۲ گزارش بیشتر از دوره قبل',
    icon: FilePieChart,
    tone: 'text-cyan-500',
  },
  {
    title: 'گزارش‌های تصویب شده',
    value: '۸۶',
    hint: '۹ مورد در انتظار تایید',
    icon: ClipboardList,
    tone: 'text-emerald-500',
  },
  {
    title: 'شاخص پایداری',
    value: '۹۴٪',
    hint: 'رشد ۷٪ نسبت به هفته پیش',
    icon: ShieldCheck,
    tone: 'text-violet-500',
  },
  {
    title: 'هشدارهای تحلیلی',
    value: '۱۴',
    hint: '۴ هشدار با اولویت بالا',
    icon: AlertTriangle,
    tone: 'text-amber-500',
  },
]

const summaries = [
  {
    title: 'خلاصه تولید و بهره‌برداری',
    detail: 'مقایسه حجم تولید، توقف‌ها و بازدهی شیفت‌ها',
    link: '/reports/summary',
  },
  {
    title: 'گزارش منابع آب',
    detail: 'تجمیع ورودی سد، ذخیره مخزن و روند مصرف استانی',
    link: '/dashboard/resources',
  },
  {
    title: 'گزارش امنیت و دسترسی',
    detail: 'رخدادهای امنیتی، ورود کاربران و درخواست‌های حساس',
    link: '/security',
  },
]

const monthlyTrend = [
  { month: 'فروردین', current: 68, previous: 54, target: 72 },
  { month: 'اردیبهشت', current: 74, previous: 61, target: 76 },
  { month: 'خرداد', current: 82, previous: 65, target: 79 },
  { month: 'تیر', current: 77, previous: 70, target: 81 },
  { month: 'مرداد', current: 91, previous: 73, target: 84 },
  { month: 'شهریور', current: 88, previous: 78, target: 86 },
]

const resourceComparison = [
  { name: 'کرخه', input: 82, output: 61, reserve: 78 },
  { name: 'دز', input: 74, output: 58, reserve: 72 },
  { name: 'کارون', input: 91, output: 67, reserve: 84 },
  { name: 'سفیدرود', input: 63, output: 49, reserve: 59 },
  { name: 'زاینده‌رود', input: 52, output: 47, reserve: 44 },
]

const provinceRisk = [
  { subject: 'منابع', value: 86 },
  { subject: 'مصارف', value: 68 },
  { subject: 'امنیت', value: 74 },
  { subject: 'کیفیت داده', value: 92 },
  { subject: 'پاسخگویی', value: 79 },
  { subject: 'پایداری', value: 88 },
]

const reportMix = [
  { name: 'منابع', value: 36, fill: 'var(--chart-1)' },
  { name: 'مصارف', value: 28, fill: 'var(--chart-2)' },
  { name: 'امنیت', value: 18, fill: 'var(--chart-5)' },
  { name: 'عملیاتی', value: 18, fill: 'var(--chart-4)' },
]

const weeklySignals = [
  { day: 'شنبه', normal: 48, warning: 9 },
  { day: 'یکشنبه', normal: 55, warning: 7 },
  { day: 'دوشنبه', normal: 61, warning: 12 },
  { day: 'سه‌شنبه', normal: 58, warning: 8 },
  { day: 'چهارشنبه', normal: 67, warning: 6 },
  { day: 'پنجشنبه', normal: 53, warning: 5 },
  { day: 'جمعه', normal: 44, warning: 4 },
]

const efficiencyRings = [
  { name: 'کیفیت داده', value: 92, fill: 'var(--color-quality)' },
  { name: 'پاسخگویی', value: 81, fill: 'var(--color-response)' },
  { name: 'پایداری', value: 74, fill: 'var(--color-stability)' },
]

const riskScatter = [
  { name: 'خوزستان', x: 82, y: 74, z: 520 },
  { name: 'تهران', x: 64, y: 42, z: 390 },
  { name: 'اصفهان', x: 71, y: 55, z: 440 },
  { name: 'فارس', x: 58, y: 48, z: 320 },
  { name: 'کرمان', x: 76, y: 68, z: 470 },
  { name: 'مازندران', x: 49, y: 31, z: 260 },
]

const channelLoad = [
  { label: 'فرم‌ها', value: 78 },
  { label: 'API', value: 64 },
  { label: 'دستی', value: 38 },
  { label: 'بازبینی', value: 52 },
]

const heatDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

const flowSteps = [
  { label: 'دریافت', value: 86 },
  { label: 'اعتبارسنجی', value: 73 },
  { label: 'تحلیل', value: 64 },
  { label: 'تایید', value: 51 },
]

const operationalRows = [
  { label: 'دقت داده‌های ورودی', value: '۹۶٪', delta: '+۴٪', tone: 'text-emerald-500' },
  { label: 'زمان آماده‌سازی گزارش', value: '۱۸ دقیقه', delta: '-۱۲٪', tone: 'text-cyan-500' },
  { label: 'فرم‌های ناقص', value: '۷ مورد', delta: '-۳', tone: 'text-amber-500' },
  { label: 'رخدادهای بحرانی', value: '۲ مورد', delta: '+۱', tone: 'text-rose-500' },
]

const clamp = (value: number, min = 8, max = 98) =>
  Math.max(min, Math.min(max, Math.round(value)))

const provinceSeed = (id?: string | null) =>
  id
    ? id.split('').reduce((total, char, index) => total + char.charCodeAt(0) * (index + 7), 0)
    : 431

const shiftValue = (value: number, seed: number, index: number, spread = 14) => {
  const wave = Math.sin((seed + index * 47) * 0.41) * spread
  const saw = ((seed * (index + 3)) % (spread * 3 + 1)) - spread * 1.5
  return clamp(value + wave + saw, 2, 99)
}

const dramaticValue = (value: number, seed: number, index: number, spread = 26) =>
  shiftValue(value + (((seed + index * 29) % 5) - 2) * 4, seed, index, spread)

const formatPercentDelta = (value: number) =>
  `${value > 0 ? '+' : ''}${value.toLocaleString('fa-IR')}٪`

function buildProvinceReportData(region?: { id: string; name: string } | null) {
  const seed = provinceSeed(region?.id)
  const reportCount = 46 + (seed % 142)
  const approvedCount = Math.max(18, reportCount - (8 + (seed % 48)))
  const stability = clamp(48 + (seed % 51), 34, 99)
  const alertCount = 2 + (seed % 34)
  const dataAccuracy = clamp(58 + (seed % 39), 28, 99)
  const reportMinutes = 8 + (seed % 38)
  const incompleteForms = 1 + (seed % 22)
  const criticalEvents = seed % 9

  const monthlyTrendData = monthlyTrend.map((item, index) => ({
    ...item,
    current: dramaticValue(item.current, seed, index, 28),
    previous: dramaticValue(item.previous, seed + 41, index, 24),
    target: dramaticValue(item.target, seed + 73, index, 15),
    gradient: dramaticValue(58 + index * 5, seed + 101, index, 20),
  }))

  const resourceComparisonData = resourceComparison.map((item, index) => ({
    ...item,
    input: dramaticValue(item.input, seed, index, 29),
    output: dramaticValue(item.output, seed + 31, index, 25),
    reserve: dramaticValue(item.reserve, seed + 61, index, 27),
  }))

  const provinceRiskData = provinceRisk.map((item, index) => ({
    ...item,
    value: dramaticValue(item.value, seed + 5, index, 24),
  }))

  const mixBase = [
    10 + (seed % 52),
    8 + ((seed + 19) % 46),
    6 + ((seed + 37) % 38),
    4 + ((seed + 53) % 36),
  ]
  const mixTotal = mixBase.reduce((total, value) => total + value, 0)
  const reportMixData = reportMix.map((item, index) => ({
    ...item,
    value: Math.round((mixBase[index] / mixTotal) * 100),
  }))

  const weeklySignalsData = weeklySignals.map((item, index) => ({
    ...item,
    normal: dramaticValue(item.normal, seed + 13, index, 25),
    warning: clamp(item.warning + ((seed + index * 13) % 21) - 5, 1, 34),
  }))

  const efficiencyRingsData = efficiencyRings.map((item, index) => ({
    ...item,
    value: dramaticValue(item.value, seed + 29, index, 23),
  }))

  const riskScatterData = riskScatter.map((item, index) => ({
    ...item,
    x: dramaticValue(item.x, seed + 7, index, 29),
    y: dramaticValue(item.y, seed + 17, index, 31),
    z: clamp(item.z + ((seed + index * 113) % 420) - 170, 80, 850),
  }))

  const channelLoadData = channelLoad.map((item, index) => ({
    ...item,
    value: dramaticValue(item.value, seed + 37, index, 28),
  }))

  const heatGridData = Array.from({ length: 35 }).map((_, index) => ({
    day: heatDays[index % heatDays.length],
    value: dramaticValue(42 + ((index * 7) % 38), seed + 89, index, 34),
  }))

  const treemapData = [
    { name: 'منابع سطحی', size: 280 + (seed % 220), fill: 'var(--chart-1)' },
    { name: 'مصارف صنعتی', size: 180 + ((seed + 17) % 240), fill: 'var(--chart-2)' },
    { name: 'کشاورزی', size: 160 + ((seed + 31) % 210), fill: 'var(--chart-3)' },
    { name: 'امنیت داده', size: 90 + ((seed + 47) % 180), fill: 'var(--chart-5)' },
    { name: 'پایش میدانی', size: 120 + ((seed + 61) % 160), fill: 'var(--chart-6)' },
    { name: 'هشدارها', size: 70 + ((seed + 79) % 170), fill: 'var(--chart-4)' },
  ]

  const flowData = flowSteps.map((item, index) => ({
    ...item,
    value: dramaticValue(item.value, seed + 127, index, 22),
  }))

  const topMetric = Math.max(...resourceComparisonData.map((item) => item.reserve))
  const hotCells = heatGridData.filter((item) => item.value > 72).length

  return {
    reportStats: [
      {
        title: 'گزارش‌های تولید شده',
        value: reportCount.toLocaleString('fa-IR'),
        hint: `${(18 + (seed % 34)).toLocaleString('fa-IR')} گزارش بیشتر از دوره قبل`,
        icon: FilePieChart,
        tone: 'text-cyan-500',
      },
      {
        title: 'گزارش‌های تصویب شده',
        value: approvedCount.toLocaleString('fa-IR'),
        hint: `${(reportCount - approvedCount).toLocaleString('fa-IR')} مورد در انتظار تایید`,
        icon: ClipboardList,
        tone: 'text-emerald-500',
      },
      {
        title: 'شاخص پایداری',
        value: `${stability.toLocaleString('fa-IR')}٪`,
        hint: `تغییر ${formatPercentDelta((seed % 15) - 4)} نسبت به هفته پیش`,
        icon: ShieldCheck,
        tone: 'text-violet-500',
      },
      {
        title: 'هشدارهای تحلیلی',
        value: alertCount.toLocaleString('fa-IR'),
        hint: `${(2 + (seed % 6)).toLocaleString('fa-IR')} هشدار با اولویت بالا`,
        icon: AlertTriangle,
        tone: 'text-amber-500',
      },
    ],
    monthlyTrend: monthlyTrendData,
    resourceComparison: resourceComparisonData,
    provinceRisk: provinceRiskData,
    reportMix: reportMixData,
    weeklySignals: weeklySignalsData,
    efficiencyRings: efficiencyRingsData,
    riskScatter: riskScatterData,
    channelLoad: channelLoadData,
    heatGrid: heatGridData,
    treemap: treemapData,
    flow: flowData,
    mapDetails: [
      { label: 'بیشترین ذخیره', value: `${topMetric.toLocaleString('fa-IR')}٪` },
      { label: 'خانه‌های پرریسک', value: hotCells.toLocaleString('fa-IR') },
      { label: 'سطح هشدار', value: alertCount > 17 ? 'بالا' : alertCount > 10 ? 'متوسط' : 'کنترل‌شده' },
      { label: 'میانگین کیفیت', value: `${dataAccuracy.toLocaleString('fa-IR')}٪` },
    ],
    operationalRows: [
      {
        label: 'دقت داده‌های ورودی',
        value: `${dataAccuracy.toLocaleString('fa-IR')}٪`,
        delta: formatPercentDelta((seed % 9) - 2),
        tone: 'text-emerald-500',
      },
      {
        label: 'زمان آماده‌سازی گزارش',
        value: `${reportMinutes.toLocaleString('fa-IR')} دقیقه`,
        delta: formatPercentDelta(-1 * (4 + (seed % 13))),
        tone: 'text-cyan-500',
      },
      {
        label: 'فرم‌های ناقص',
        value: `${incompleteForms.toLocaleString('fa-IR')} مورد`,
        delta: `${((seed % 7) - 3).toLocaleString('fa-IR')}`,
        tone: incompleteForms > 9 ? 'text-rose-500' : 'text-amber-500',
      },
      {
        label: 'رخدادهای بحرانی',
        value: `${criticalEvents.toLocaleString('fa-IR')} مورد`,
        delta: `${((seed % 5) - 1).toLocaleString('fa-IR')}`,
        tone: criticalEvents > 3 ? 'text-rose-500' : 'text-emerald-500',
      },
    ],
    bottomCards: [
      { label: 'روند ورودی آب', value: formatPercentDelta((seed % 28) - 7), icon: Waves, color: 'text-cyan-500' },
      { label: 'مصرف کنترل‌شده', value: formatPercentDelta(-1 * (seed % 15)), icon: Gauge, color: 'text-emerald-500' },
      { label: 'پوشش گزارش‌ها', value: `${clamp(72 + (seed % 24)).toLocaleString('fa-IR')}٪`, icon: FilePieChart, color: 'text-violet-500' },
      { label: 'ریسک فعال', value: alertCount > 17 ? 'بالا' : alertCount > 10 ? 'متوسط' : 'پایین', icon: AlertTriangle, color: 'text-amber-500' },
    ],
  }
}

const chartConfig = {
  current: { label: 'دوره جاری', color: 'var(--primary)' },
  previous: { label: 'دوره قبل', color: 'var(--chart-4)' },
  target: { label: 'هدف', color: 'var(--chart-2)' },
  gradient: { label: 'روند ترکیبی', color: 'var(--chart-6)' },
  input: { label: 'ورودی', color: 'var(--chart-1)' },
  output: { label: 'خروجی', color: 'var(--chart-3)' },
  reserve: { label: 'ذخیره', color: 'var(--chart-4)' },
  normal: { label: 'عادی', color: 'var(--chart-2)' },
  warning: { label: 'هشدار', color: 'var(--chart-5)' },
  resources: { label: 'منابع', color: 'var(--chart-1)' },
  usage: { label: 'مصارف', color: 'var(--chart-2)' },
  security: { label: 'امنیت', color: 'var(--chart-5)' },
  ops: { label: 'عملیاتی', color: 'var(--chart-4)' },
  quality: { label: 'کیفیت داده', color: 'var(--chart-1)' },
  response: { label: 'پاسخگویی', color: 'var(--chart-2)' },
  stability: { label: 'پایداری', color: 'var(--chart-6)' },
  x: { label: 'شدت مصرف', color: 'var(--chart-1)' },
  y: { label: 'ریسک', color: 'var(--chart-5)' },
  z: { label: 'حجم گزارش', color: 'var(--chart-3)' },
  value: { label: 'بار کانال', color: 'var(--chart-4)' },
  size: { label: 'حجم', color: 'var(--chart-1)' },
} satisfies ChartConfig

const iranProvinceRegions = [
  { id: 'HG', name: 'هرمزگان', abbreviation: 'هرمزگان', labelX: 417.8, labelY: 550.0 },
  { id: 'BS', name: 'بوشهر', abbreviation: 'بوشهر', labelX: 245.8, labelY: 484.1 },
  { id: 'KB', name: 'کهگیلویه و بویراحمد', abbreviation: 'کهگیلویه', labelX: 219.4, labelY: 396.5 },
  { id: 'FA', name: 'فارس', abbreviation: 'فارس', labelX: 305.4, labelY: 456.9 },
  { id: 'ES', name: 'اصفهان', abbreviation: 'اصفهان', labelX: 279.2, labelY: 317.9 },
  { id: 'SM', name: 'سمنان', abbreviation: 'سمنان', labelX: 350.6, labelY: 180.2 },
  { id: 'GO', name: 'گلستان', abbreviation: 'گلستان', labelX: 368.9, labelY: 117.2 },
  { id: 'MN', name: 'مازندران', abbreviation: 'مازندران', labelX: 272.9, labelY: 157.6 },
  { id: 'TH', name: 'تهران', abbreviation: 'تهران', labelX: 262.6, labelY: 195.8 },
  { id: 'MK', name: 'مرکزی', abbreviation: 'مرکزی', labelX: 191.9, labelY: 234.1 },
  { id: 'YA', name: 'یزد', abbreviation: 'یزد', labelX: 393.2, labelY: 322.8 },
  { id: 'CM', name: 'چهارمحال و بختیاری', abbreviation: 'چهارمحال', labelX: 210.6, labelY: 351.3 },
  {
    id: 'KZ',
    name: 'خوزستان',
    abbreviation: 'خوزستان',
    labelX: 153.8,
    labelY: 365.1,
    className: 'fill-map-region-selected',
    labelClassName: 'fill-map-label-selected text-[8px]',
  },
  { id: 'LO', name: 'لرستان', abbreviation: 'لرستان', labelX: 135.4, labelY: 278.9 },
  { id: 'IL', name: 'ایلام', abbreviation: 'ایلام', labelX: 76.8, labelY: 294.6 },
  { id: 'AR', name: 'اردبیل', abbreviation: 'اردبیل', labelX: 120.4, labelY: 66.1 },
  { id: 'QM', name: 'قم', abbreviation: 'قم', labelX: 228.6, labelY: 231.3 },
  { id: 'HD', name: 'همدان', abbreviation: 'همدان', labelX: 143.2, labelY: 219.9 },
  { id: 'ZA', name: 'زنجان', abbreviation: 'زنجان', labelX: 136.6, labelY: 154.5 },
  { id: 'QZ', name: 'قزوین', abbreviation: 'قزوین', labelX: 184.8, labelY: 166.9 },
  { id: 'WA', name: 'آذربایجان غربی', abbreviation: 'آذربایجان غربی', labelX: 51.5, labelY: 82.9 },
  { id: 'EA', name: 'آذربایجان شرقی', abbreviation: 'آذربایجان شرقی', labelX: 87.5, labelY: 84.0 },
  { id: 'BK', name: 'کرمانشاه', abbreviation: 'کرمانشاه', labelX: 74.8, labelY: 232.7 },
  { id: 'GI', name: 'گیلان', abbreviation: 'گیلان', labelX: 180.6, labelY: 107.4 },
  { id: 'KD', name: 'کردستان', abbreviation: 'کردستان', labelX: 85.2, labelY: 184.6 },
  { id: 'KJ', name: 'خراسان جنوبی', abbreviation: 'خراسان جنوبی', labelX: 540.5, labelY: 322.1 },
  { id: 'KV', name: 'خراسان رضوی', abbreviation: 'خراسان رضوی', labelX: 503.3, labelY: 198.3 },
  { id: 'KS', name: 'خراسان شمالی', abbreviation: 'خراسان شمالی', labelX: 439.8, labelY: 108.5 },
  { id: 'SB', name: 'سیستان و بلوچستان', abbreviation: 'سیستان', labelX: 611.9, labelY: 495.6 },
  { id: 'KE', name: 'کرمان', abbreviation: 'کرمان', labelX: 448.8, labelY: 469.8 },
  { id: 'AL', name: 'البرز', abbreviation: 'البرز', labelX: 223.3, labelY: 175.9 },
].map((region) => ({
  labelClassName: 'text-[8px]',
  ...region,
}))

function GlowCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Card
      className={`border-border/60 bg-card/90 relative overflow-hidden rounded-lg border backdrop-blur ${className}`}
      style={{
        boxShadow:
          '0 0 0 1px color-mix(in oklch, var(--primary) 10%, transparent), 0 18px 50px -30px color-mix(in oklch, var(--primary) 70%, transparent)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-4 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, color-mix(in oklch, var(--primary) 58%, transparent), color-mix(in oklch, var(--chart-2) 52%, transparent), transparent)',
          boxShadow:
            '0 0 28px color-mix(in oklch, var(--primary) 45%, transparent)',
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 left-8 h-32 w-32 rounded-full blur-3xl"
        style={{
          background:
            'color-mix(in oklch, var(--chart-2) 18%, transparent)',
        }}
      />
      {children}
    </Card>
  )
}

function BacklitRingChart({
  data,
  centerLabel,
}: {
  data: typeof reportMix
  centerLabel: string
}) {
  let cursor = 0
  const gradient = data
    .map((item) => {
      const start = cursor
      cursor += item.value
      return `${item.fill} ${start}% ${cursor}%`
    })
    .join(', ')

  return (
    <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
      <div className="relative mx-auto size-44">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${gradient})`,
            boxShadow:
              '0 0 0 1px color-mix(in oklch, var(--primary) 18%, transparent), 0 0 42px color-mix(in oklch, var(--primary) 42%, transparent)',
          }}
        />
        <div className="absolute inset-5 rounded-full border border-border/60 bg-card/95 shadow-[inset_0_0_30px_color-mix(in_oklch,var(--primary)_16%,transparent)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground text-xs">{centerLabel}</p>
          <p className="text-3xl font-black">۱۰۰٪</p>
          <p className="text-muted-foreground text-[11px]">کل گزارش‌ها</p>
        </div>
      </div>
      <div className="grid gap-2">
        {data.map((item) => (
          <div
            key={item.name}
            className="border-border/60 bg-background/50 flex items-center justify-between gap-3 rounded-lg border p-3 shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_8%,transparent)]"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-full shadow-[0_0_16px_currentColor]"
                style={{ background: item.fill, color: item.fill }}
              />
              <span className="truncate text-sm font-semibold">{item.name}</span>
            </div>
            <span className="text-xl font-black">
              {item.value.toLocaleString('fa-IR')}٪
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [selectedRegion, setSelectedRegion] = useState<{
    id: string
    name: string
  } | null>(null)

  const generatedAt = useMemo(
    () => new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date()),
    []
  )
  const reportData = useMemo(
    () => buildProvinceReportData(selectedRegion),
    [selectedRegion]
  )
  const activeProvinceName = selectedRegion?.name ?? 'کل ایران'

  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="from-background via-background to-primary/10 pointer-events-none absolute inset-0 bg-gradient-to-br" />
      <div className="pointer-events-none absolute inset-x-8 top-8 h-40 rounded-full bg-primary/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-x-4 top-0 h-72 opacity-70"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, color-mix(in oklch, var(--chart-2) 18%, transparent), transparent 38%), radial-gradient(circle at 72% 18%, color-mix(in oklch, var(--chart-5) 14%, transparent), transparent 34%)',
        }}
      />

      <div className="relative z-10 space-y-6">
        <div className="bg-background/98 sticky top-0 z-[180] space-y-4 rounded-xl pb-3 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
          <header className="border-border/60 bg-card/90 supports-[backdrop-filter]:bg-card/80 space-y-4 rounded-xl border p-4 shadow-md backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">مرکز گزارش‌های تحلیلی سد‌ایران</p>
                <h1 className="text-3xl font-bold">داشبورد گزارش‌ها</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/reports/summary">خلاصه مدیریتی</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/files">خروجی فایل‌ها</Link>
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-muted-foreground max-w-3xl text-sm">
                نمای مقایسه‌ای از عملکرد منابع، مصارف، کیفیت داده و رخدادهای امنیتی
                با داده‌های نمونه برای ارزیابی سریع وضعیت استان‌ها و سدهای کلیدی.
                نمای فعال: {activeProvinceName}
              </p>
              <span className="border-border/60 bg-background/70 rounded-lg border px-3 py-2 text-xs text-muted-foreground">
                به‌روزرسانی: {generatedAt}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {reportData.reportStats.map((stat) => (
                <GlowCard key={stat.title}>
                  <CardContent className="flex items-center justify-between gap-3 p-3">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">{stat.hint}</p>
                      <p className="text-sm font-semibold">{stat.title}</p>
                      <p className="text-3xl font-bold leading-tight">{stat.value}</p>
                    </div>
                    <div
                      className="bg-primary/10 border-primary/20 flex size-12 items-center justify-center rounded-full border"
                      style={{
                        boxShadow:
                          '0 0 28px color-mix(in oklch, var(--primary) 25%, transparent)',
                      }}
                    >
                      <stat.icon className={`size-6 ${stat.tone}`} />
                    </div>
                  </CardContent>
                </GlowCard>
              ))}
            </div>
          </header>
        </div>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
          <GlowCard>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">نقشه گزارش‌های استانی ایران</CardTitle>
                <CardDescription>
                  روی هر استان کلیک کنید تا همه نمودارها و کارت‌ها با داده همان استان به‌روزرسانی شوند.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant={selectedRegion ? 'outline' : 'default'}
                size="sm"
                onClick={() => setSelectedRegion(null)}
              >
                کل ایران
              </Button>
            </CardHeader>
            <CardContent>
              <div
                className="dashboard-iran-map border-border/60 bg-background/60 mx-auto max-w-5xl rounded-lg border p-3"
                style={{
                  boxShadow:
                    'inset 0 0 48px color-mix(in oklch, var(--primary) 10%, transparent)',
                }}
              >
                <IranMap
                  aria-label="نقشه گزارش‌های استانی ایران"
                  selectedRegion={selectedRegion?.id}
                  regions={iranProvinceRegions}
                  showLabels
                  showTooltips
                  enableZoom
                  className="max-h-[520px]"
                  onRegionClick={({ region }) =>
                    setSelectedRegion((current) =>
                      current?.id === region.id
                        ? null
                        : { id: region.id, name: region.name ?? region.id }
                    )
                  }
                />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {reportData.mapDetails.map((item) => (
                  <div
                    key={item.label}
                    className="border-border/60 bg-background/55 rounded-lg border p-3 shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_10%,transparent),0_12px_30px_-24px_color-mix(in_oklch,var(--primary)_70%,transparent)]"
                  >
                    <p className="text-muted-foreground text-xs">{item.label}</p>
                    <p className="mt-1 text-xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="border-border/60 bg-background/45 rounded-lg border p-3 shadow-[0_0_0_1px_color-mix(in_oklch,var(--chart-2)_10%,transparent)]">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">جزئیات ناحیه انتخاب‌شده</p>
                    <span className="text-muted-foreground text-xs">{activeProvinceName}</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {reportData.reportMix.slice(0, 3).map((item) => (
                      <div key={item.name} className="rounded-lg border border-border/50 bg-card/60 p-2">
                        <div className="mb-2 h-1.5 rounded-full" style={{ background: item.fill }} />
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-muted-foreground text-xs">{item.value.toLocaleString('fa-IR')}٪ سهم گزارش</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-border/60 bg-background/45 rounded-lg border p-3 shadow-[0_0_0_1px_color-mix(in_oklch,var(--chart-5)_10%,transparent)]">
                  <p className="text-sm font-semibold">وضعیت عملیاتی</p>
                  <div className="mt-3 space-y-2">
                    {reportData.bottomCards.slice(0, 3).map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </GlowCard>

          <div className="grid gap-4">
            <GlowCard>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{activeProvinceName}</CardTitle>
                <CardDescription>خلاصه وضعیت انتخاب‌شده</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {reportData.operationalRows.map((item) => (
                  <div key={item.label} className="border-border/60 bg-background/50 flex items-center justify-between rounded-lg border p-3 shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_8%,transparent)]">
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-muted-foreground text-xs">مبنای فعلی نمودارها</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-bold">{item.value}</p>
                      <p className={`text-xs font-semibold ${item.tone}`}>{item.delta}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </GlowCard>
            <GlowCard>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">ترکیب گزارش‌ها</CardTitle>
                <CardDescription>سهم موضوعی برای {activeProvinceName}</CardDescription>
              </CardHeader>
              <CardContent>
                <BacklitRingChart
                  data={reportData.reportMix}
                  centerLabel={activeProvinceName}
                />
              </CardContent>
            </GlowCard>
          </div>
        </section>

        <section className="grid gap-4">
          <GlowCard>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">روند مقایسه‌ای شاخص‌ها</CardTitle>
                <CardDescription>چند خط رنگی برای مقایسه دوره جاری، دوره قبل و هدف برنامه</CardDescription>
              </div>
              <BarChart3 className="size-8 text-primary" />
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[310px] w-full">
                <ComposedChart data={reportData.monthlyTrend} margin={{ left: 8, right: 8, top: 10 }}>
                  <defs>
                    <linearGradient id="trendSolidGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--color-current)" />
                      <stop offset="52%" stopColor="var(--color-target)" />
                      <stop offset="100%" stopColor="var(--color-gradient)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey="gradient" type="monotone" stroke="url(#trendSolidGradient)" strokeWidth={7} dot={false} opacity={0.82} />
                  <Line dataKey="current" type="monotone" stroke="var(--color-current)" strokeWidth={3} dot={{ r: 3 }} />
                  <Line dataKey="previous" type="monotone" stroke="var(--color-previous)" strokeWidth={3} dot={{ r: 3 }} />
                  <Line dataKey="target" type="monotone" stroke="var(--color-target)" strokeWidth={3} strokeDasharray="7 5" dot={{ r: 3 }} />
                </ComposedChart>
              </ChartContainer>
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'دوره جاری', color: 'var(--color-current)' },
                  { label: 'دوره قبل', color: 'var(--color-previous)' },
                  { label: 'هدف برنامه', color: 'var(--color-target)' },
                  { label: 'روند ترکیبی', color: 'linear-gradient(90deg, var(--color-current), var(--color-target), var(--color-gradient))' },
                ].map((item) => (
                  <div key={item.label} className="border-border/60 bg-background/50 flex items-center gap-2 rounded-lg border px-3 py-2">
                    <span
                      className="h-2 w-8 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </GlowCard>
        </section>

        <section className="grid gap-4">
          <GlowCard>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">پهنه تجمعی عملکرد</CardTitle>
              <CardDescription>نمودار area برای نمایش حجم تجمعی شاخص‌ها در {activeProvinceName}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <AreaChart data={reportData.monthlyTrend} margin={{ left: 8, right: 8, top: 10 }}>
                  <defs>
                    <linearGradient id="areaCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-current)" stopOpacity={0.48} />
                      <stop offset="95%" stopColor="var(--color-current)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="areaTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-target)" stopOpacity={0.36} />
                      <stop offset="95%" stopColor="var(--color-target)" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area dataKey="current" type="monotone" stroke="var(--color-current)" fill="url(#areaCurrent)" strokeWidth={2} />
                  <Area dataKey="target" type="monotone" stroke="var(--color-target)" fill="url(#areaTarget)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </GlowCard>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <GlowCard>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">حلقه‌های کارایی</CardTitle>
              <CardDescription>مقایسه چند شاخص روی یک قاب روشن</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[245px] w-full">
                <RadialBarChart
                  data={reportData.efficiencyRings}
                  innerRadius="34%"
                  outerRadius="94%"
                  startAngle={90}
                  endAngle={-270}
                >
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <RadialBar dataKey="value" cornerRadius={10} background />
                </RadialBarChart>
              </ChartContainer>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {reportData.efficiencyRings.map((item) => (
              <div key={item.name} className="border-border/60 bg-background/50 rounded-lg border p-2 shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_8%,transparent)]">
                    <p className="font-semibold">{item.value.toLocaleString('fa-IR')}٪</p>
                    <p className="text-muted-foreground">{item.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </GlowCard>

          <GlowCard>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">پراکندگی ریسک استان‌ها</CardTitle>
              <CardDescription>شدت مصرف، سطح ریسک و حجم گزارش</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[295px] w-full">
                <ScatterChart margin={{ left: 8, right: 8, top: 10 }}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis dataKey="x" name="شدت مصرف" tickLine={false} axisLine={false} />
                  <YAxis dataKey="y" name="ریسک" tickLine={false} axisLine={false} width={28} />
                  <ZAxis dataKey="z" range={[70, 420]} name="حجم گزارش" />
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Scatter data={reportData.riskScatter} fill="var(--color-y)" />
                </ScatterChart>
              </ChartContainer>
            </CardContent>
          </GlowCard>

          <GlowCard>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">بار کانال‌های داده</CardTitle>
              <CardDescription>سهم نسبی مسیرهای دریافت اطلاعات بدون نمودار تکراری</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportData.channelLoad.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-muted-foreground">{item.value.toLocaleString('fa-IR')}٪</span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.value}%`,
                        background:
                          'linear-gradient(90deg, var(--chart-4), var(--primary))',
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="border-border/60 bg-background/50 rounded-lg border p-3 text-xs text-muted-foreground shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_8%,transparent)]">
                بیشترین فشار داده برای {activeProvinceName} روی کانال‌های اصلی سامانه توزیع شده است.
              </div>
            </CardContent>
          </GlowCard>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <GlowCard className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">نقشه درختی حوزه‌های گزارش</CardTitle>
              <CardDescription>تقسیم حجم موضوعات برای {activeProvinceName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid h-[320px] grid-cols-12 grid-rows-6 gap-2 overflow-hidden rounded-lg border border-border/60 bg-background/45 p-2">
                {reportData.treemap.map((item, index) => {
                  const layout = [
                    'col-span-6 row-span-3',
                    'col-span-3 row-span-3',
                    'col-span-3 row-span-2',
                    'col-span-3 row-span-2',
                    'col-span-5 row-span-3',
                    'col-span-4 row-span-3',
                  ][index]

                  return (
                    <div
                      key={item.name}
                      className={`${layout} flex min-h-0 min-w-0 flex-col justify-between overflow-hidden rounded-lg border border-background/70 p-3 text-primary-foreground shadow-[inset_0_0_24px_color-mix(in_oklch,var(--foreground)_14%,transparent),0_12px_28px_-24px_color-mix(in_oklch,var(--primary)_80%,transparent)]`}
                      style={{
                        background: `linear-gradient(135deg, ${item.fill}, color-mix(in oklch, ${item.fill} 72%, var(--background)))`,
                      }}
                    >
                      <div className="min-w-0 space-y-1 text-right">
                        <p className="truncate text-sm font-bold leading-5">{item.name}</p>
                        <p className="text-xs opacity-85">حجم حوزه</p>
                      </div>
                      <div className="flex items-end justify-between gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background/35">
                          <div
                            className="h-full rounded-full bg-primary-foreground/85"
                            style={{
                              width: `${Math.min(100, Math.max(24, item.size / 5))}%`,
                            }}
                          />
                        </div>
                        <p className="shrink-0 text-lg font-black leading-none">
                          {item.size.toLocaleString('fa-IR')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </GlowCard>

          <GlowCard>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">نقشه حرارتی فعالیت</CardTitle>
              <CardDescription>شدت ثبت و هشدار در ۵ هفته اخیر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {reportData.heatGrid.map((item, index) => (
                  <div
                    key={`${item.day}-${index}`}
                    className="flex aspect-square items-center justify-center rounded-md border border-border/40 text-[10px] font-semibold"
                    style={{
                      background: `color-mix(in oklch, var(--primary) ${Math.max(16, item.value)}%, var(--background))`,
                      color: item.value > 62 ? 'var(--primary-foreground)' : 'var(--foreground)',
                      boxShadow:
                        item.value > 72
                          ? '0 0 18px color-mix(in oklch, var(--primary) 38%, transparent)'
                          : undefined,
                    }}
                    title={`${item.day}: ${item.value}`}
                  >
                    {item.day}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>کم</span>
                <span>شدت فعالیت</span>
                <span>زیاد</span>
              </div>
            </CardContent>
          </GlowCard>
        </section>

        <section className="grid gap-4">
          <GlowCard>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">جریان پردازش گزارش</CardTitle>
              <CardDescription>نمای گرافی از حرکت داده‌ها تا تایید نهایی</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-4">
                {reportData.flow.map((item, index) => (
                  <div key={item.label} className="relative">
                    <div className="border-border/60 bg-background/55 rounded-lg border p-4 shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_10%,transparent),0_16px_36px_-28px_color-mix(in_oklch,var(--primary)_70%,transparent)]">
                      <p className="text-muted-foreground text-xs">{item.label}</p>
                      <p className="mt-2 text-3xl font-bold">{item.value.toLocaleString('fa-IR')}٪</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.value}%`,
                            background:
                              'linear-gradient(90deg, var(--chart-1), var(--chart-2), var(--primary))',
                          }}
                        />
                      </div>
                    </div>
                    {index < reportData.flow.length - 1 ? (
                      <div className="pointer-events-none absolute top-1/2 -left-3 hidden h-px w-6 bg-primary/50 shadow-[0_0_18px_color-mix(in_oklch,var(--primary)_55%,transparent)] md:block" />
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </GlowCard>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <GlowCard className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">مقایسه سدهای کلیدی</CardTitle>
              <CardDescription>ورودی، خروجی و ذخیره مخزن در داده‌های نمونه</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[310px] w-full">
                <BarChart data={reportData.resourceComparison} margin={{ left: 8, right: 8, top: 10 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="input" fill="var(--color-input)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="output" fill="var(--color-output)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="reserve" fill="var(--color-reserve)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </GlowCard>

          <GlowCard>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">کیفیت پایش</CardTitle>
              <CardDescription>امتیاز نسبی حوزه‌های کنترلی</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <RadarChart data={reportData.provinceRisk}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.32} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </GlowCard>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="grid gap-4">
            <GlowCard>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">سیگنال‌های هفته</CardTitle>
                <CardDescription>تفکیک رخدادهای عادی و هشدار بدون نمودار تکراری</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                {reportData.weeklySignals.map((item) => (
                  <div key={item.day} className="border-border/60 bg-background/50 rounded-lg border p-3 shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_8%,transparent)]">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">{item.day}</p>
                      <p className="text-muted-foreground text-xs">
                        {(item.normal + item.warning).toLocaleString('fa-IR')} رخداد
                      </p>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        style={{
                          width: `${(item.normal / (item.normal + item.warning)) * 100}%`,
                          background: 'var(--color-normal)',
                        }}
                      />
                      <div
                        style={{
                          width: `${(item.warning / (item.normal + item.warning)) * 100}%`,
                          background: 'var(--color-warning)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </GlowCard>

            <GlowCard>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">شاخص‌های عملیاتی</CardTitle>
                <CardDescription>خلاصه عددی برای تصمیم سریع در {activeProvinceName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {reportData.operationalRows.map((item) => (
                  <div key={item.label} className="border-border/60 bg-background/50 flex items-center justify-between rounded-lg border p-3 shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_8%,transparent)]">
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-muted-foreground text-xs">مقایسه با دوره قبل</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-bold">{item.value}</p>
                      <p className={`text-xs font-semibold ${item.tone}`}>{item.delta}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </GlowCard>
          </div>
          <GlowCard>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">جمع‌بندی انتخاب</CardTitle>
              <CardDescription>وضعیت سریع کارت‌های پایین برای {activeProvinceName}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {reportData.bottomCards.map((item) => (
                <div key={item.label} className="border-border/60 bg-background/50 flex items-center justify-between rounded-lg border p-4 shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_8%,transparent)]">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">{item.label}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                  <item.icon className={`size-8 ${item.color}`} />
                </div>
              ))}
            </CardContent>
          </GlowCard>
        </section>

        <Separator />

        <section className="grid gap-4 md:grid-cols-3">
          {summaries.map((item, index) => {
            const Icon = [Gauge, Droplets, PieChartIcon][index] ?? Activity

            return (
              <GlowCard key={item.title}>
                <CardHeader className="flex flex-row items-start gap-3">
                  <div className="bg-primary/10 flex size-11 shrink-0 items-center justify-center rounded-full">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                    <CardDescription>{item.detail}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={item.link}>باز کردن گزارش</Link>
                  </Button>
                </CardContent>
              </GlowCard>
            )
          })}
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {reportData.bottomCards.map((item) => (
            <GlowCard key={item.label}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
                <item.icon className={`size-8 ${item.color}`} />
              </CardContent>
            </GlowCard>
          ))}
        </section>
      </div>
    </div>
  )
}
