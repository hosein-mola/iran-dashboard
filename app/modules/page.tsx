'use client'

import Link from 'next/link'
import { AlertCircle, BoxIcon, BrainIcon, CodeSquareIcon, FolderDot, FormInputIcon, LogIn, ShieldCheckIcon, User2 } from 'lucide-react'

import { moduleList } from '@/components/module-list'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const quickInfo = [
  {
    title: 'ماژول‌های شما',
    value: moduleList.length.toString(),
    hint: 'فعال برای حساب شما',
  },
  {
    title: 'آخرین ورود',
    value: new Date().toLocaleDateString('fa-IR'),
    hint: 'بازدید امروز',
  },
  {
    title: 'درخواست پشتیبانی',
    value: '۲',
    hint: 'در انتظار پاسخ',
  },
]

export default function ModulesLandingPage() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative z-0 space-y-6">
        <header className="sticky top-0 z-[220] space-y-4 rounded-xl border border-border/60 bg-card/90 p-4 shadow-md backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">درگاه ماژول‌ها</p>
              <h1 className="text-3xl font-bold">ماژول‌های قابل دسترسی</h1>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">بازگشت به داشبورد</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            همه ماژول‌های فعال برای حساب شما. روی هر کارت کلیک کنید تا وارد محیط مربوطه شوید.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {quickInfo.map((item) => (
              <Card
                key={item.title}
                className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur"
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{item.hint}</p>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                  <AlertCircle className="size-6 text-primary" />
                </CardContent>
              </Card>
            ))}
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">انتخاب ماژول</h2>
              <p className="text-sm text-muted-foreground">
                ماژول‌ها را بر اساس نیاز خود انتخاب کنید؛ زیرصفحه‌ها در منو نمایش داده نمی‌شوند.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {moduleList.map((module) => (
              <Card
                key={module.href}
                className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur"
              >
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                    <module.icon className="size-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">{module.label}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Button asChild className="w-full" variant="outline">
                    <Link href={module.href}>
                      <LogIn className="ml-2 size-4" />
                      ورود به {module.label}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">ماژول‌های پرکاربرد</CardTitle>
              <CardDescription>بر اساس استفاده کاربران</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 rounded-lg border border-border/60 p-2">
                <FormInputIcon className="size-5 text-primary" />
                <span>فرم‌ساز</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 p-2">
                <User2 className="size-5 text-primary" />
                <span>داشبورد کاربر</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 p-2">
                <BrainIcon className="size-5 text-primary" />
                <span>هوش مصنوعی</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">دسترسی سریع</CardTitle>
              <CardDescription>برای کاربران مجاز</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Button asChild className="w-full" variant="outline">
                <Link href="/logs">لاگ‌ها</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/reports">گزارش‌ها</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/security">امنیت و کاربران</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">راهنمای انتخاب</CardTitle>
              <CardDescription>اگر نمی‌دانید از کجا شروع کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>۱) برای ساخت فرم‌های جدید، وارد فرم‌ساز شوید.</p>
              <p>۲) برای تحلیل داده‌ها، به گزارش‌ها بروید.</p>
              <p>۳) برای مشاهده رخدادها، لاگ‌ها را باز کنید.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
