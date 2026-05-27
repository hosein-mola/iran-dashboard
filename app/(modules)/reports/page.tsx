'use client'

import Link from 'next/link'
import { BarChart3, ClipboardList, FilePieChart, PieChart, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const reportStats = [
  { title: 'گزارش‌های تولید شده', value: '۳۲', hint: 'این هفته', icon: FilePieChart },
  { title: 'گزارش‌های تصویب شده', value: '۱۸', hint: 'در انتظار ۲', icon: ClipboardList },
  { title: 'شاخص کلیدی', value: '۷٪+', hint: 'رشد نسبت به هفته پیش', icon: TrendingUp },
]

const summaries = [
  { title: 'خلاصه تولید', detail: 'وضعیت خطوط تولید و مصرف انرژی', link: '/reports/summary' },
  { title: 'گزارش منابع', detail: 'تجمیع داده‌های ورودی سد و منابع آب', link: '/dashboard/resources' },
  { title: 'گزارش امنیت', detail: 'رخدادهای امنیتی و دسترسی کاربران', link: '/security' },
]

export default function ReportsPage() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative z-10 space-y-6">
        <div className="sticky top-0 z-[180] space-y-4 bg-background/98 pb-2 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
          <header className="space-y-3 rounded-xl border border-border/60 bg-card/90 p-4 shadow-md backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">مرکز گزارش‌های تحلیلی</p>
                <h1 className="text-3xl font-bold">گزارش‌های سامانه</h1>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleString('fa-ir')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              جمع‌بندی گزارش‌های عملیاتی، منابع و امنیت با دسترسی سریع به خلاصه‌ها.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {reportStats.map((stat) => (
                <Card
                  key={stat.title}
                  className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur"
                >
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{stat.hint}</p>
                      <p className="text-sm font-semibold">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className="size-9 text-primary" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </header>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">خلاصه‌ها</h2>
              <p className="text-sm text-muted-foreground">
                دسترسی سریع به مهم‌ترین گزارش‌های آماده
              </p>
            </div>
            <Button asChild>
              <Link href="/reports/summary">مشاهده همه خلاصه‌ها</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {summaries.map((item) => (
              <Card
                key={item.title}
                className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                  <CardDescription>{item.detail}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={item.link}>باز کردن</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">داشبورد KPI</CardTitle>
              <CardDescription>مرور شاخص‌های کلیدی امروز</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">تولید</p>
                <p className="text-2xl font-bold text-primary">+۱۲٪</p>
                <p className="text-xs text-muted-foreground">رشد نسبت به دیروز</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">مصرف انرژی</p>
                <p className="text-2xl font-bold text-primary">-۴٪</p>
                <p className="text-xs text-muted-foreground">کاهش با بهینه‌سازی</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">داده‌های ناقص</p>
                <p className="text-2xl font-bold text-primary">۳ فرم</p>
                <p className="text-xs text-muted-foreground">نیاز به تکمیل</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">هشدارهای امنیتی</p>
                <p className="text-2xl font-bold text-primary">۱ مورد</p>
                <p className="text-xs text-muted-foreground">بررسی در انتظار</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">خروجی‌ها</CardTitle>
              <CardDescription>دریافت سریع فایل‌های گزارش</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link href="/files">دانلود فایل PDF</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/reports/summary">مشاهده خلاصه آنلاین</Link>
              </Button>
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">گزارش لحظه‌ای</p>
                  <p className="text-xs text-muted-foreground">به‌روزرسانی هر ۱۰ دقیقه</p>
                </div>
                <PieChart className="size-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
