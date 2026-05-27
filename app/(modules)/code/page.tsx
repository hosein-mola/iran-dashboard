import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const workflows = [
  {
    title: 'فرایند تایید قرارداد',
    status: 'در حال اجرا',
  },
  {
    title: 'اتوماسیون انتشار گزارش',
    status: 'تاخیر ۲ ساعته',
  },
  {
    title: 'گردش درخواست تدارکات',
    status: 'در انتظار امضا',
  },
]

export default function CodePage() {
  return (
    <section className="space-y-6 py-4">
      <header>
        <p className="text-sm text-muted-foreground">کد و فرایند خودکار شده</p>
        <h1 className="text-3xl font-bold">جریان‌های اتوماسیون</h1>
      </header>
      <Separator className="mb-2" />
      <div className="grid gap-4 md:grid-cols-3">
        {workflows.map((workflow) => (
          <Card key={workflow.title} className="border">
            <CardHeader>
              <CardTitle className="text-lg">{workflow.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              وضعیت: {workflow.status}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/reports/summary">ثبت رویداد جدید</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">بازگشت به داشبورد</Link>
        </Button>
      </div>
    </section>
  )
}
