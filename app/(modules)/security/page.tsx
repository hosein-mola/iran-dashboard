'use client'

import Link from 'next/link'
import { BadgeCheck, Lock, ShieldAlert, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const roles = [
  { name: 'ادمین', permissions: 'تمام دسترسی‌ها', color: 'text-primary' },
  { name: 'کارشناس', permissions: 'مشاهده + ویرایش محدود', color: 'text-amber-600' },
  { name: 'ناظر', permissions: 'مشاهده گزارش‌ها', color: 'text-muted-foreground' },
]

export default function SecurityPage() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative z-10 space-y-6">
        <div className="sticky top-0 z-[180] space-y-4 bg-background/98 pb-2 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
          <header className="space-y-3 rounded-xl border border-border/60 bg-card/90 p-4 shadow-md backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">امنیت و کاربران</p>
                <h1 className="text-3xl font-bold">مدیریت دسترسی</h1>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleString('fa-ir')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              نقش‌ها، دسترسی‌ها و هشدارهای امنیتی کاربران را در یک نگاه مدیریت کنید.
            </p>
          </header>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">نقش‌ها و دسترسی</h2>
              <p className="text-sm text-muted-foreground">نقش‌های اصلی و سطح مجوز</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/persons">مدیریت کاربران</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((role) => (
              <Card
                key={role.name}
                className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{role.name}</CardTitle>
                  <CardDescription className={role.color}>{role.permissions}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/security">تنظیم مجوز</Link>
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
              <CardTitle className="text-lg font-semibold">هشدارهای امنیتی</CardTitle>
              <CardDescription>رخدادهایی که باید همین امروز بررسی شود</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <ShieldAlert className="size-5 text-rose-500" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">ورود مشکوک</p>
                  <p className="text-xs text-muted-foreground">IP ناشناس در دسترسی شبانه</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <Lock className="size-5 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">توکن منقضی</p>
                  <p className="text-xs text-muted-foreground">نیاز به صدور مجدد برای API</p>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/logs">مشاهده رویداد</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">ممیزی و تایید</CardTitle>
              <CardDescription>آخرین اقدامات تأیید شده</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-2">
                <span>به‌روزرسانی نقش ادمین</span>
                <BadgeCheck className="size-5 text-primary" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-2">
                <span>تغییر دسترسی گزارش</span>
                <BadgeCheck className="size-5 text-primary" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-2">
                <span>غیرفعال‌سازی کاربر</span>
                <BadgeCheck className="size-5 text-primary" />
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link href="/reports">خروجی ممیزی</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
