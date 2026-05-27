'use client'

import Link from 'next/link'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const usages = [
  { id: 'U-11', title: 'مصرف شرب', volume: '12,400 m³', status: 'فعال' },
  { id: 'U-22', title: 'مصرف کشاورزی', volume: '34,100 m³', status: 'بررسی' },
  { id: 'U-33', title: 'مصرف صنعتی', volume: '8,900 m³', status: 'فعال' },
]

export default function UserUsagePage() {
  return (
    <section className="space-y-6 py-4">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">مصارف ثبت‌شده کاربر</p>
        <h1 className="text-3xl font-bold">مصارف</h1>
      </header>
      <Separator />
      <div className="grid gap-4 md:grid-cols-3">
        {usages.map((item) => (
          <Card key={item.id} className="border">
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                حجم: {item.volume} | وضعیت: {item.status}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/reports?usage=${item.id}`}>مشاهده داشبورد</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/process`}>ورود به کنسول</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
