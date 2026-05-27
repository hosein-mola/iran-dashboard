'use client'

import Link from 'next/link'
import { AlarmClock, Bug, ListChecks, ServerCrash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const logStats = [
  { title: 'رویداد امروز', value: '۴۲', hint: 'آخرین ۲ ساعت', icon: AlarmClock },
  { title: 'اخطارها', value: '۳', hint: 'در انتظار بررسی', icon: Bug },
  { title: 'خطاهای حیاتی', value: '۱', hint: 'در حال پیگیری', icon: ServerCrash },
]

const streams = [
  { title: 'عملیات CRUD', status: '09:42:03', icon: '⚙️', detail: 'به‌روزرسانی رکوردها' },
  { title: 'اتصال سنسورها', status: '08:58:37', icon: '🛰️', detail: 'سنسور غرب همگام‌سازی شد' },
  { title: 'گزارش خطا', status: '08:15:45', icon: '🚨', detail: 'خطای دسترسی API' },
]

export default function LogsPage() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative z-10 space-y-6">
        <div className="sticky top-0 z-[180] space-y-4 bg-background/98 pb-2 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
          <header className="space-y-3 rounded-xl border border-border/60 bg-card/90 p-4 shadow-md backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">لاگ‌های سیستمی</p>
                <h1 className="text-3xl font-bold">ثبت رویدادها</h1>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleString('fa-ir')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              مرور سریع رخدادهای اخیر، اخطارها و خطاهای حیاتی برای پیگیری تیم.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {logStats.map((stat) => (
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
              <h2 className="text-2xl font-bold">جریان‌های اخیر</h2>
              <p className="text-sm text-muted-foreground">
                تازه‌ترین رویدادهای ثبت شده در سامانه
              </p>
            </div>
            <Button asChild>
              <Link href="/reports">رفتن به تحلیل</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {streams.map((item) => (
              <Card
                key={item.title}
                className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 text-lg font-semibold">
                    <span>{item.title}</span>
                    <span>{item.icon}</span>
                  </CardTitle>
                  <CardDescription>{item.detail}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>آخرین بروزرسانی: {item.status}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">اقدامات پیشنهادی</CardTitle>
              <CardDescription>گام‌های فوری برای کاهش خطا</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <ListChecks className="size-5 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">بازبینی دسترسی‌ها</p>
                  <p className="text-xs text-muted-foreground">تایید نقش کاربران حساس</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <ServerCrash className="size-5 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">تحلیل خطای حیاتی</p>
                  <p className="text-xs text-muted-foreground">
                    هماهنگی با تیم امنیت برای خطای API
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/security">ارجاع به تیم امنیت</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">خروجی و آرشیو</CardTitle>
              <CardDescription>دسترسی سریع به فایل‌های لاگ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link href="/files">دانلود لاگ امروز</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/logs/archive">آرشیو هفتگی</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
