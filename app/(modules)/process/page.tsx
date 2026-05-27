'use client'

import Link from 'next/link'
import { CheckCircle2, Clock3, Cog, GitMerge, Workflow } from 'lucide-react'

import { WorkflowEditor } from '@/components/WorkflowEditor'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const flowStats = [
  { title: 'فرایندهای فعال', value: '۱۲', hint: 'در حال اجرا', icon: Workflow },
  { title: 'در انتظار تایید', value: '۳', hint: 'نیاز به اقدام', icon: Clock3 },
  { title: 'اتمام موفق', value: '۲۴', hint: 'این هفته', icon: CheckCircle2 },
]

const workflows = [
  {
    title: 'تایید قرارداد',
    status: 'در حال اجرا',
    detail: 'گردش سه مرحله‌ای با امضای دیجیتال',
  },
  {
    title: 'انتشار گزارش',
    status: 'برنامه‌ریزی شده',
    detail: 'تولید PDF و ارسال به ایمیل',
  },
  {
    title: 'درخواست تدارکات',
    status: 'در انتظار امضا',
    detail: 'مرحله خرید و انبارداری',
  },
]

export default function ProcessPage() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="from-background via-background to-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br" />
      <div className="relative z-10 space-y-6">
        <div className="bg-background/98 sticky top-0 z-[180] space-y-4 pb-2 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
          <header className="border-border/60 bg-card/90 supports-[backdrop-filter]:bg-card/80 space-y-3 rounded-xl border p-4 shadow-md backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  اتوماسیون فرایند
                </p>
                <h1 className="text-3xl font-bold">جریان‌های عملیاتی</h1>
              </div>
              <span className="text-muted-foreground text-sm">
                {new Date().toLocaleString('fa-ir')}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              تعریف، پایش و اجرای فرایندهای خودکار با دسترسی سریع به وضعیت هر
              جریان.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {flowStats.map((stat) => (
                <Card
                  key={stat.title}
                  className="border-border/60 bg-card/90 rounded-lg border shadow-sm backdrop-blur"
                >
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">
                        {stat.hint}
                      </p>
                      <p className="text-sm font-semibold">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className="text-primary size-9" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </header>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">ویرایشگر جریان</h2>
              <p className="text-muted-foreground text-sm">
                گره‌ها را اضافه کنید، اتصال دهید و به صورت زنده در مرورگر ذخیره
                کنید.
              </p>
            </div>
          </div>
          <WorkflowEditor />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">گردش‌های فعال</h2>
              <p className="text-muted-foreground text-sm">
                مهم‌ترین فرایندهای در جریان با وضعیت فعلی
              </p>
            </div>
            <Button asChild>
              <Link href="/process/new">ایجاد فرایند جدید</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {workflows.map((flow) => (
              <Card
                key={flow.title}
                className="border-border/60 bg-card/90 rounded-lg border shadow-sm backdrop-blur"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {flow.title}
                  </CardTitle>
                  <CardDescription>{flow.detail}</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  وضعیت:{' '}
                  <span className="text-primary font-semibold">
                    {flow.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/60 bg-card/90 rounded-lg border shadow-sm backdrop-blur md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                چک‌لیست امروز
              </CardTitle>
              <CardDescription>
                کارهایی که باید پیش از پایان روز انجام شود
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border-border/60 flex items-start gap-3 rounded-lg border p-3">
                <Cog className="text-primary size-5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">بازبینی SLA</p>
                  <p className="text-muted-foreground text-xs">
                    اطمینان از اجرای SLA در فرایندهای حساس
                  </p>
                </div>
              </div>
              <div className="border-border/60 flex items-start gap-3 rounded-lg border p-3">
                <GitMerge className="text-primary size-5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">همگام‌سازی سیستم‌ها</p>
                  <p className="text-muted-foreground text-xs">
                    هماهنگ‌سازی جریان‌ها با مخزن Git سازمان
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/logs">مشاهده رویدادهای مرتبط</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/90 rounded-lg border shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                یکپارچگی داده
              </CardTitle>
              <CardDescription>
                گزارش کوتاه از موفقیت اجرای گام‌ها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="border-border/60 flex items-center justify-between rounded-lg border p-2">
                <span>موفق</span>
                <span className="text-primary font-semibold">۹۶٪</span>
              </div>
              <div className="border-border/60 flex items-center justify-between rounded-lg border p-2">
                <span>در انتظار</span>
                <span className="font-semibold text-amber-600">۳ مورد</span>
              </div>
              <div className="border-border/60 flex items-center justify-between rounded-lg border p-2">
                <span>شکست</span>
                <span className="font-semibold text-rose-600">۱ مورد</span>
              </div>
              <Button asChild className="mt-2 w-full" variant="outline">
                <Link href="/reports">گزارش کامل</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
