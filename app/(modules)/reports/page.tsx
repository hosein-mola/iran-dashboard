import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const highlights = [
  { title: 'فرم‌های تصویب شده', value: '128', detail: 'نوشتارهای کارتابل' },
  { title: 'گزارش‌های تولید', value: '32', detail: 'نسخه‌ی خلاصه' },
  { title: 'تیکت‌های باز', value: '18', detail: 'فرم‌های پشتیبانی' },
]

export default function ReportsPage() {
  return (
    <section className="space-y-6 py-4">
      <header>
        <p className="text-sm text-muted-foreground">مرکز گزارش‌های تحلیلی</p>
        <h1 className="text-3xl font-bold">گزارش‌های سامانه</h1>
      </header>
      <Separator />
      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title} className="border">
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="text-2xl font-semibold">{item.value}</p>
              <p>{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/reports/summary">مشاهده خلاصه</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">بازگشت به داشبورد</Link>
        </Button>
      </div>
    </section>
  )
}
