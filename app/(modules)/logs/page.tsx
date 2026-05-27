import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

const streams = [
  { title: 'عملیات CRUD', status: '09:42:03', icon: '⚙️' },
  { title: 'اتصال سنسورها', status: '08:58:37', icon: '🛰️' },
  { title: 'گزارش خطا', status: '08:15:45', icon: '🚨' },
]

export default function LogsPage() {
  return (
    <section className="space-y-4 py-4">
      <header>
        <p className="text-sm text-muted-foreground">لاگ‌های سیستمی</p>
        <h1 className="text-3xl font-bold">ثبت رویدادها</h1>
      </header>
      <Separator />
      <div className="grid gap-4 md:grid-cols-3">
        {streams.map((item) => (
          <Card key={item.title} className="border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-lg">
                <span>{item.title}</span>
                <span>{item.icon}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>آخرین بروز رسانی: {item.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/reports">برو به تحلیل</Link>
        </Button>
        <Button asChild>
          <Link href="/files">مدیریت فایل‌ها</Link>
        </Button>
      </div>
    </section>
  )
}
