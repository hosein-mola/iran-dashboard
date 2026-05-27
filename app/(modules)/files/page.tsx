import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const documents = [
  { title: 'پروژه سد ۱۴', modified: '۲ ساعت پیش' },
  { title: 'استانداردهای ایمنی', modified: '۱ روز پیش' },
  { title: 'گزارش نگهداری', modified: '۳ روز پیش' },
]

export default function FilesPage() {
  return (
    <section className="space-y-6 py-4">
      <header>
        <p className="text-sm text-muted-foreground">مرکز اسناد</p>
        <h1 className="text-3xl font-bold">فایل‌های پروژه</h1>
      </header>
      <Separator />
      <div className="grid gap-4 md:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.title} className="border">
            <CardHeader>
              <CardTitle className="text-lg">{doc.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              آخرین تغییر: {doc.modified}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/dashboard">بازگشت به داشبورد</Link>
        </Button>
        <Button asChild>
          <Link href="/form-builder">ارسال سند جدید</Link>
        </Button>
      </div>
    </section>
  )
}
