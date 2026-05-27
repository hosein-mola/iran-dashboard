'use client'

import Link from 'next/link'
import { Activity, BrainCircuit, Gauge, Sparkles, Wand2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const aiStats = [
  { title: 'سناریوهای فعال', value: '۱۸', hint: 'در حال اجرا', icon: Sparkles },
  { title: 'تحلیل‌های امروز', value: '۷', hint: 'آخرین ۲ ساعت', icon: Activity },
  { title: 'مدل‌های منتشر شده', value: '۴', hint: 'نسخه پایدار', icon: BrainCircuit },
]

const playbooks = [
  {
    title: 'پیشنهاد هوش مصنوعی',
    detail: 'تشخیص روند مصرف و ارائه سناریو کاهش مصرف.',
    cta: 'اجرای سناریو',
  },
  {
    title: 'تحلیل فشار',
    detail: 'مدل‌سازی فشار در سدها و اطلاع‌رسانی به موقع.',
    cta: 'شروع تحلیل',
  },
  {
    title: 'تشخیص ناهنجاری',
    detail: 'شناسایی خودکار داده‌های غیرمعمول در مانیتورینگ.',
    cta: 'پایش لحظه‌ای',
  },
]

export default function AIPage() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative z-10 space-y-6">
        <div className="sticky top-0 z-[180] space-y-4 bg-background/98 pb-2 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
          <header className="space-y-3 rounded-xl border border-border/60 bg-card/90 p-4 shadow-md backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">مرکز هوش مصنوعی</p>
                <h1 className="text-3xl font-bold">موتور پیشنهادگر</h1>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleString('fa-ir')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              اجرای سناریوهای هوشمند، تحلیل ناهنجاری و پیشنهادهای مبتنی بر داده برای سد ایران.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {aiStats.map((stat) => (
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
              <h2 className="text-2xl font-bold">سناریوهای آماده</h2>
              <p className="text-sm text-muted-foreground">
                گزیده‌ای از اقدام‌های هوشمند برای تیم بهره‌برداری
              </p>
            </div>
            <Button asChild>
              <Link href="/reports">مشاهده خروجی‌ها</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {playbooks.map((item) => (
              <Card
                key={item.title}
                className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                  <CardDescription>{item.detail}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    {item.cta}
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
              <CardTitle className="text-lg font-semibold">تحلیل سریع</CardTitle>
              <CardDescription>خلاصه وضعیت پیش‌بینی فشار و ناهنجاری‌ها</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">ریسک فشار</p>
                <p className="text-2xl font-bold text-primary">کم</p>
                <p className="text-xs text-muted-foreground">پایش هر ۱۰ دقیقه</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">نرخ ناهنجاری</p>
                <p className="text-2xl font-bold text-primary">۲ مورد</p>
                <p className="text-xs text-muted-foreground">در ۲۴ ساعت گذشته</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">زمان پاسخ مدل</p>
                <p className="text-2xl font-bold text-primary">۱.۲ ثانیه</p>
                <p className="text-xs text-muted-foreground">میانگین استنتاج</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">نسخه مدل</p>
                <p className="text-2xl font-bold text-primary">v4.3</p>
                <p className="text-xs text-muted-foreground">منتشر شده امروز</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">اقدامات بعدی</CardTitle>
              <CardDescription>پیشنهادهای هوش مصنوعی برای امروز</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <Wand2 className="size-5 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">بهینه‌سازی استنتاج</p>
                  <p className="text-xs text-muted-foreground">
                    کاهش بار GPU در ساعات پیک
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <Gauge className="size-5 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">کالیبراسیون سنسور</p>
                  <p className="text-xs text-muted-foreground">
                    تطبیق مدل با سنسورهای جدید ایستگاه غرب
                  </p>
                </div>
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link href="/reports">مشاهده جزئیات</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
