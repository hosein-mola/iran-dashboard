import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const scenarios = [
  {
    title: 'پیشنهاد هوش مصنوعی',
    detail: 'تشخیص روند مصرف و ارائه سناریو برای کاهش مصرف انرژی.',
  },
  {
    title: 'تحلیل فشار',
    detail: 'مدل‌سازی فشار در سدها و اطلاع‌رسانی به موقع.',
  },
  {
    title: 'تشخیص ناهنجاری',
    detail: 'شناسایی خودکار داده‌های غیرمعمول در سامانه‌های مانیتورینگ.',
  },
]

export default function AIPage() {
  return (
    <section className="space-y-8 py-4">
      <header>
        <p className="text-sm text-muted-foreground">هوش مصنوعی سد ایران</p>
        <h1 className="text-3xl font-bold">موتور پیشنهادگر</h1>
      </header>
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <Card key={scenario.title} className="border">
            <CardHeader>
              <CardTitle className="text-lg">{scenario.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {scenario.detail}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/reports">مشاهده گزارش‌ها</Link>
        </Button>
        <Button asChild>
          <Link href="/form-builder">بازگشت به فرم‌ساز</Link>
        </Button>
      </div>
    </section>
  )
}
