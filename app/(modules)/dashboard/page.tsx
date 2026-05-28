'use client'

import {
  Activity,
  AlertTriangle,
  BellDot,
  CheckCircle2,
  ClipboardList,
  DamIcon,
  Droplets,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  WavesIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { GetDashboardSubmoduleCards } from '@/actions/form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Chart1 } from '@/components/Chart1'
import { Chart2 } from '@/components/Chart2'

type DashboardSubmoduleCard = Awaited<
  ReturnType<typeof GetDashboardSubmoduleCards>
>[number]

const defaultSubmoduleCards: DashboardSubmoduleCard[] = [
  {
    id: 0,
    slug: 'resources',
    name: 'منابع',
    description: 'فرم‌ها و داشبوردهای مرتبط با زیرسیستم منابع سد.',
    formsCount: 0,
    submissionsCount: 0,
    baseTablesCount: 0,
    href: '/dashboard/submodule/resources',
  },
  {
    id: 0,
    slug: 'usage',
    name: 'مصارف',
    description: 'فرم‌ها و داشبوردهای مرتبط با زیرسیستم مصارف سد.',
    formsCount: 0,
    submissionsCount: 0,
    baseTablesCount: 0,
    href: '/dashboard/submodule/usage',
  },
]

const stats = [
  {
    label: 'منابع فعال',
    module: 'زیرسیستم منابع',
    value: '18',
    hint: 'آخرین به‌روزرسانی ۳ ساعت پیش',
    icon: Droplets,
  },
  {
    label: 'مصارف ثبت‌شده',
    module: 'زیرسیستم مصارف',
    value: '42',
    hint: 'هفته جاری',
    icon: Activity,
  },
  {
    label: 'فرم‌های فعال',
    module: 'فرم‌ساز',
    value: '12',
    hint: 'منتشر شده',
    icon: FileSpreadsheet,
  },
  {
    label: 'پیام‌های جدید',
    module: 'هشدار و پیام',
    value: '7',
    hint: 'برای بررسی امروز',
    icon: BellDot,
  },
]

const inbox = [
  {
    title: 'پیام جدید',
    description: 'پشتیبان: نیاز به تایید فرم روزانه',
    href: '/reports',
    icon: MessageSquare,
    count: 3,
    category: 'reports',
    priority: 'urgent',
  },
  {
    title: 'هشدار منابع',
    description: 'سد کرخه به سقف هشدار نزدیک می‌شود',
    href: '/dashboard/resources',
    icon: BellDot,
    count: 1,
    category: 'resources',
    priority: 'info',
  },
]

const approvals = [
  {
    title: 'تایید مصرف روزانه',
    detail: 'کارشناس بهره‌برداری منتظر تایید شماست',
    href: '/dashboard/resources',
    status: 'در انتظار',
    category: 'resources',
    priority: 'urgent',
  },
  {
    title: 'بررسی هشدار ایمنی',
    detail: 'مربوط به سد دز - حساس',
    href: '/reports',
    status: 'حساس',
    category: 'security',
    priority: 'info',
  },
]

const quickActions = [
  { label: 'ثبت ورودی جدید', href: '/dashboard/submodule' },
  { label: 'گزارش هفتگی', href: '/reports' },
  { label: 'مدیریت کاربران', href: '/security' },
  { label: 'ارسال اعلان', href: '/logs' },
]

const heatmap = Array.from({ length: 28 }).map((_, idx) => {
  const value = (idx * 7) % 100
  return {
    day: idx + 1,
    value,
    status: value > 60 ? 'good' : value > 30 ? 'ok' : 'low',
  }
})

export default function DashboardHome() {
  const [submoduleCards, setSubmoduleCards] = useState<
    DashboardSubmoduleCard[]
  >(defaultSubmoduleCards)
  const [moduleFilter, setModuleFilter] = useState<
    'all' | 'resources' | 'reports' | 'security'
  >('all')
  const [priorityFilter, setPriorityFilter] = useState<
    'all' | 'urgent' | 'info'
  >('all')

  const filteredInbox = useMemo(
    () =>
      inbox.filter(
        (item) =>
          (moduleFilter === 'all' || item.category === moduleFilter) &&
          (priorityFilter === 'all' || item.priority === priorityFilter)
      ),
    [moduleFilter, priorityFilter]
  )

  const filteredApprovals = useMemo(
    () =>
      approvals.filter(
        (item) =>
          (moduleFilter === 'all' || item.category === moduleFilter) &&
          (priorityFilter === 'all' || item.priority === priorityFilter)
      ),
    [moduleFilter, priorityFilter]
  )

  useEffect(() => {
    let ignore = false

    GetDashboardSubmoduleCards().then((cards) => {
      if (!ignore && cards.length > 0) {
        setSubmoduleCards(cards)
      }
    })

    return () => {
      ignore = true
    }
  }, [])

  const getSubmoduleIcon = (slug: string) => {
    if (slug === 'resources') return DamIcon
    if (slug === 'usage') return WavesIcon
    return FileSpreadsheet
  }

  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="from-background via-background to-accent/10 pointer-events-none absolute inset-0 bg-gradient-to-br" />
      <div className="relative z-0 space-y-6">
        <div className="bg-background/98 sticky top-0 z-[200] space-y-4 rounded-xl pb-4 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
          <header className="border-border/60 bg-card/90 supports-[backdrop-filter]:bg-card/80 space-y-4 rounded-xl border p-4 shadow-md backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  مرکز کنترل سد‌ایران
                </p>
                <h1 className="text-3xl font-bold">داشبورد کاربر</h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {quickActions.map((action) => (
                <Button key={action.label} asChild variant="outline" size="sm">
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ))}
            </div>
            <Separator className="my-2" />
            <div className="space-y-2 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Link
                    href="/dashboard/submodule"
                    className="text-sm font-semibold"
                  >
                    زیرسیستم‌های شما
                  </Link>
                  <p className="text-muted-foreground text-sm">
                    مرکز کنترل سد‌ایران
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {submoduleCards.map((submodule) => {
                  const SubmoduleIcon = getSubmoduleIcon(submodule.slug)

                  return (
                    <Card
                      key={`${submodule.slug}-${submodule.id}`}
                      className="border-border/60 bg-card/90 rounded-lg border shadow-sm backdrop-blur"
                    >
                      <CardHeader className="flex flex-row items-center gap-3 pb-3">
                        <SubmoduleIcon className="text-primary size-8" />
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {submodule.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {submodule.description}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                          <span>
                            {submodule.formsCount.toLocaleString('fa-IR')} فرم
                          </span>
                          <span>
                            {submodule.submissionsCount.toLocaleString('fa-IR')}{' '}
                            ثبت
                          </span>
                          <span>
                            {submodule.baseTablesCount.toLocaleString('fa-IR')}{' '}
                            جدول پایه
                          </span>
                        </div>
                        <Button asChild variant="default" className="w-full">
                          <Link href={submodule.href}>ورود</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
            <div className="mt-2 grid gap-2 md:grid-cols-4">
              {stats.map((item) => (
                <Card
                  key={item.label}
                  className="border-border/60 bg-card/90 text-foreground rounded-lg border shadow-sm backdrop-blur"
                >
                  <CardContent className="space-y-2 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">
                          {item.module}
                        </p>
                        <p className="text-sm font-semibold">{item.label}</p>
                      </div>
                      <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
                        <item.icon className="text-primary size-6" />
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl leading-tight font-semibold">
                        {item.value}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {item.hint}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </header>
        </div>

        <section className="space-y-3">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">وضعیت پایش فوری</h2>
              <p className="text-muted-foreground text-sm">
                خلاصه اطمینان از عملکرد سامانه‌ها و سرویس‌های اصلی
              </p>
            </div>
          </header>

          <div className="grid gap-3 md:grid-cols-4">
            <Card className="border-border/60 bg-card/90 border shadow-sm backdrop-blur">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-semibold">
                  در دسترس بودن سامانه
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-semibold">99.9%</p>
                  <ShieldCheck className="size-8 text-emerald-500" />
                </div>
                <p className="text-muted-foreground text-xs">
                  پایدار در ۲۴ ساعت گذشته
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90 border shadow-sm backdrop-blur">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-semibold">
                  درخواست‌های معطل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-semibold">6</p>
                  <BellDot className="size-8 text-amber-500" />
                </div>
                <p className="text-muted-foreground text-xs">
                  نیازمند اقدام تا پایان امروز
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90 border shadow-sm backdrop-blur">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-semibold">
                  ظرفیت ذخیره
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-semibold">82%</p>
                  <Droplets className="size-8 text-sky-500" />
                </div>
                <p className="text-muted-foreground text-xs">
                  ۱۸٪ فضای آزاد تا سقف هشدار
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90 border shadow-sm backdrop-blur">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-semibold">
                  رویدادهای امنیتی
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-semibold">2</p>
                  <AlertTriangle className="size-8 text-rose-500" />
                </div>
                <p className="text-muted-foreground text-xs">
                  نیازمند بررسی فوری
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="border-border/60 bg-card/90 flex flex-wrap items-center justify-between gap-4 rounded-lg border p-3 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-sm">
                فیلتر زیرسیستم
              </span>
              {[
                { key: 'all', label: 'همه' },
                { key: 'resources', label: 'منابع' },
                { key: 'reports', label: 'گزارش‌ها' },
                { key: 'security', label: 'ایمنی' },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  size="sm"
                  variant={moduleFilter === filter.key ? 'default' : 'outline'}
                  onClick={() =>
                    setModuleFilter(filter.key as typeof moduleFilter)
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-sm">اولویت</span>
              {[
                { key: 'all', label: 'همه' },
                { key: 'urgent', label: 'فوری' },
                { key: 'info', label: 'اطلاع‌رسانی' },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  size="sm"
                  variant={
                    priorityFilter === filter.key ? 'default' : 'outline'
                  }
                  onClick={() =>
                    setPriorityFilter(filter.key as typeof priorityFilter)
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/60 bg-card/90 border shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  درخواست‌های تایید
                </CardTitle>
                <CardDescription>موارد معطل شما</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredApprovals.map((item) => (
                  <div
                    key={item.title}
                    className="border-border/60 flex items-start gap-3 rounded-xl border p-3"
                  >
                    <ShieldCheck className="text-primary size-6" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.detail}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={item.href}>مشاهده</Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90 border shadow-sm backdrop-blur md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  پیام‌ها و هشدارها
                </CardTitle>
                <CardDescription>پیام‌های جدید برای بررسی</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {filteredInbox.map((item) => (
                  <Card
                    key={item.title}
                    className="border-border/60 bg-background/80 border shadow-sm"
                  >
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      <div className="relative">
                        <item.icon className="text-primary size-7" />
                        {item.count ? (
                          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {item.count}
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {item.title}
                        </CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Link href={item.href}>مشاهده</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </section>
        </section>

        <section className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/60 bg-card/90 border shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  تقویم ورود داده
                </CardTitle>
                <CardDescription>
                  وضعیت روزهای ثبت داده: روزهای سبز کامل، زرد متوسط و قرمز
                  کم‌فعال
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="grid grid-cols-7 gap-2 text-center text-xs">
                  {heatmap.map((entry) => {
                    const tone =
                      entry.status === 'good'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-50 dark:border-emerald-500/40'
                        : entry.status === 'ok'
                          ? 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-400/20 dark:text-amber-50 dark:border-amber-400/40'
                          : 'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-500/20 dark:text-rose-50 dark:border-rose-500/40'

                    return (
                      <div
                        key={entry.day}
                        className={`flex h-16 flex-col items-center justify-center rounded-xl border ${tone}`}
                      >
                        <span className="text-[11px]">روز {entry.day}</span>
                        <span className="text-base font-semibold">
                          {entry.value}%
                        </span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-muted-foreground text-xs">
                  آخرین به‌روزرسانی خودکار بر اساس ارسال‌های فرم روزانه
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90 border shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  اطلاعیه‌ها
                </CardTitle>
                <CardDescription>مسائل اخیر امنیتی و عملیاتی</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="border-border/60 flex items-start gap-3 rounded-xl border p-3">
                  <AlertTriangle className="size-6 text-amber-500" />
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">نگهداری برنامه‌ریزی‌شده</p>
                    <p className="text-muted-foreground text-xs">
                      شنبه ۹ شب - یک ساعت
                    </p>
                  </div>
                </div>
                <div className="border-border/60 flex items-start gap-3 rounded-xl border p-3">
                  <BellDot className="text-primary size-6" />
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">هشدار سطح مخزن</p>
                    <p className="text-muted-foreground text-xs">
                      سد کارون ۳ - بررسی فوری
                    </p>
                  </div>
                </div>
                <div className="border-border/60 flex items-start gap-3 rounded-xl border p-3">
                  <CheckCircle2 className="size-6 text-green-600" />
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">تکمیل همگام‌سازی</p>
                    <p className="text-muted-foreground text-xs">
                      گزارش هفتگی آماده است
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-3">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">مرور حرفه‌ای روز</h2>
              <p className="text-muted-foreground text-sm">
                برآورد وضعیت عملیاتی، امنیتی و داده‌ای امروز
              </p>
            </div>
          </header>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/60 bg-card/90 border shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  لیست کارهای امروز
                </CardTitle>
                <CardDescription>سه اقدام مهم برای شروع</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    title: 'بررسی هشدار منابع',
                    detail: 'سطح مخزن کارون ۳ را تایید کنید',
                  },
                  {
                    title: 'تایید فرم‌های روزانه',
                    detail: '۴ فرم منابع در انتظار تایید',
                  },
                  {
                    title: 'ارسال گزارش خلاصه',
                    detail: 'ارسال گزارش هفتگی به مدیریت',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="border-border/60 flex items-start gap-3 rounded-xl border p-3"
                  >
                    <div className="bg-primary mt-0.5 h-2 w-2 rounded-full" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90 border shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  وضعیت امنیت و دسترسی
                </CardTitle>
                <CardDescription>بازبینی امنیتی سریع</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-border/60 flex items-center justify-between rounded-xl border p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">نشست‌های فعال</p>
                    <p className="text-muted-foreground text-xs">
                      ۲ نشست اداری
                    </p>
                  </div>
                  <ShieldCheck className="size-8 text-emerald-500" />
                </div>
                <div className="border-border/60 flex items-center justify-between rounded-xl border p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">درخواست دسترسی</p>
                    <p className="text-muted-foreground text-xs">
                      ۱ مورد در انتظار تایید
                    </p>
                  </div>
                  <AlertTriangle className="size-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90 border shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  شاخص‌های کلیدی
                </CardTitle>
                <CardDescription>نمایی سریع از متریک‌های امروز</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-border/60 flex items-center justify-between rounded-xl border p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">ورود داده امروز</p>
                    <p className="text-muted-foreground text-xs">۷۵٪ تکمیل</p>
                  </div>
                  <Droplets className="text-primary size-8" />
                </div>
                <div className="border-border/60 flex items-center justify-between rounded-xl border p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">پیام‌های بحرانی</p>
                    <p className="text-muted-foreground text-xs">۲ مورد تازه</p>
                  </div>
                  <BellDot className="size-8 text-rose-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
