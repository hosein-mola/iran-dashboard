'use client'

import Link from 'next/link'
import { Braces, CheckSquare, Rocket } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const snippets = [
  {
    title: 'وظیفه زمان‌بندی شده',
    detail: 'اجرای اسکریپت پاکسازی لاگ‌ها هر شب',
  },
  {
    title: 'وب‌هوک رویداد',
    detail: 'ارسال خروجی فرایند به سامانه گزارش',
  },
  {
    title: 'ادغام API',
    detail: 'دریافت داده سنسور و ثبت در فرم‌ساز',
  },
]

export default function CodePage() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative z-10 space-y-6">
        <div className="sticky top-0 z-[180] space-y-4 bg-background/98 pb-2 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
          <header className="space-y-3 rounded-xl border border-border/60 bg-card/90 p-4 shadow-md backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">اتوماسیون کد</p>
                <h1 className="text-3xl font-bold">اسکریپت‌ها و ادغام‌ها</h1>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleString('fa-ir')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              مدیریت اسکریپت‌های زمان‌بندی شده، وب‌هوک‌ها و ادغام API برای خودکارسازی جریان‌ها.
            </p>
          </header>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">نمونه اسکریپت‌ها</h2>
              <p className="text-sm text-muted-foreground">
                سه الگوی متداول برای شروع خودکارسازی کد
              </p>
            </div>
            <Button asChild>
              <Link href="/process">بازگشت به فرایند</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {snippets.map((item) => (
              <Card
                key={item.title}
                className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                  <CardDescription>{item.detail}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <div className="rounded-lg border border-dashed border-border/60 p-3">
                    <p className="font-mono text-xs text-muted-foreground">
                      curl -X POST https://api.example.com/webhook
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">تست و استقرار</CardTitle>
              <CardDescription>اطمینان از اجرای صحیح اسکریپت‌ها</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <span>Pipeline</span>
                <CheckSquare className="size-6 text-primary" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <span>Health Check</span>
                <Braces className="size-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">برنامه انتشار</CardTitle>
              <CardDescription>گام‌های بعدی برای نسخه جدید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <Rocket className="size-5 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">استقرار مرحله‌ای</p>
                  <p className="text-xs text-muted-foreground">
                    انتشار در محیط آزمایشی و سپس عملیاتی
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/logs">پیگیری رویدادها</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
