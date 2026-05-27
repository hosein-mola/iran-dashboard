'use client'

import Link from 'next/link'
import { CloudUpload, FolderOpen, HardDrive, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const documents = [
  { title: 'پروژه سد ۱۴', modified: '۲ ساعت پیش' },
  { title: 'استانداردهای ایمنی', modified: '۱ روز پیش' },
  { title: 'گزارش نگهداری', modified: '۳ روز پیش' },
]

const storage = [
  { label: 'فضای استفاده‌شده', value: '۶۴٪', desc: '۵۶ از ۸۸ گیگابایت' },
  { label: 'فایل‌های حساس', value: '۱۲', desc: 'نیاز به بازبینی دسترسی' },
]

export default function FilesPage() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative z-10 space-y-6">
        <div className="sticky top-0 z-[180] space-y-4 bg-background/98 pb-2 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
          <header className="space-y-3 rounded-xl border border-border/60 bg-card/90 p-4 shadow-md backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">مرکز اسناد</p>
                <h1 className="text-3xl font-bold">فایل‌های پروژه</h1>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleString('fa-ir')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              مدیریت اسناد پروژه، دسترسی امن و وضعیت فضای ذخیره‌سازی.
            </p>
          </header>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">فایل‌های اخیر</h2>
              <p className="text-sm text-muted-foreground">آخرین اسناد به‌روزشده</p>
            </div>
            <Button asChild>
              <Link href="/files/upload">
                <CloudUpload className="ml-2 size-4" />
                بارگذاری فایل
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {documents.map((doc) => (
              <Card
                key={doc.title}
                className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{doc.title}</CardTitle>
                  <CardDescription>آخرین تغییر: {doc.modified}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/files">{'مشاهده'}</Link>
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
              <CardTitle className="text-lg font-semibold">وضعیت ذخیره‌سازی</CardTitle>
              <CardDescription>مرور سریع استفاده از فضای فایل</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {storage.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border/60 p-3 text-sm"
                >
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold text-primary">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">امنیت اسناد</CardTitle>
              <CardDescription>پیشنهادهای ایمنی برای دسترسی</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <ShieldCheck className="size-5 text-primary" />
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">بازبینی مجوزها</p>
                  <p className="text-xs text-muted-foreground">
                    بررسی دسترسی فایل‌های حساس به‌صورت هفتگی
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <FolderOpen className="size-5 text-primary" />
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">مرتب‌سازی پوشه‌ها</p>
                  <p className="text-xs text-muted-foreground">
                    انتقال فایل‌های آرشیوی به فضای سرد
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/security">بررسی دسترسی‌ها</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
