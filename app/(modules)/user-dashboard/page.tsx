'use client'

import Link from 'next/link'
import { ShieldCheck, ClipboardList, Inbox } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const submodules = [
  {
    title: 'منابع',
    description: 'نمایش منابع ثبت‌شده و داشبورد مرتبط.',
    href: '/dashboard/resources',
  },
  {
    title: 'مصارف',
    description: 'ورود داده‌های مصرف و مشاهده خروجی‌های مرتبط.',
    href: '/dashboard',
  },
]

export default function UserDashboardPage() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative z-10 space-y-6">
        <div className="sticky top-0 z-[180] space-y-4 bg-background/98 pb-2 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
          <header className="space-y-3 rounded-xl border border-border/60 bg-card/90 p-4 shadow-md backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">دسترسی کاربر</p>
                <h1 className="text-3xl font-bold">داشبورد کاربر</h1>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleString('fa-ir')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              زیرماژول‌های فعال شده توسط ادمین برای شما. منابع، مصارف و پیام‌ها را در یک نگاه
              ببینید.
            </p>
          </header>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">زیرماژول‌ها</CardTitle>
              <CardDescription>ماژول‌هایی که برای شما فعال شده است</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {submodules.map((item) => (
                <Card
                  key={item.title}
                  className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur"
                >
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="outline">
                      <Link href={item.href}>ورود</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">پیام‌ها و تاییدها</CardTitle>
              <CardDescription>کارتابل امروز</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <Inbox className="size-5 text-primary" />
                <div className="space-y-1">
                  <p className="font-semibold">پیام‌های جدید</p>
                  <p className="text-xs text-muted-foreground">۳ پیام در انتظار خواندن</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <ShieldCheck className="size-5 text-primary" />
                <div className="space-y-1">
                  <p className="font-semibold">درخواست تایید</p>
                  <p className="text-xs text-muted-foreground">۲ فرم نیازمند تایید</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">راهنمای سریع</CardTitle>
              <CardDescription>چگونه داده‌ها را کامل و سریع ارسال کنیم</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>۱) فرم‌های روزانه را تا ساعت ۱۴ تکمیل کنید.</p>
              <p>۲) منابع و مصارف را دوباره بررسی کنید.</p>
              <p>۳) پیام‌های تایید را هر روز پاسخ دهید.</p>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">درخواست پشتیبانی</CardTitle>
              <CardDescription>برای فعال‌سازی زیرماژول جدید</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/form-builder">ثبت درخواست</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
