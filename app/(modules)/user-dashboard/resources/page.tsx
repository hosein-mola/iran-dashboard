'use client'

import Link from 'next/link'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const resources = [
  { id: 'R-101', title: 'منبع شمالی', type: 'آب سطحی', status: 'فعال' },
  { id: 'R-204', title: 'منبع جنوبی', type: 'زیرزمینی', status: 'در حال بررسی' },
  { id: 'R-305', title: 'منبع غربی', type: 'شبکه مشترک', status: 'فعال' },
]

export default function UserResourcesPage() {
  return (
    <section className="space-y-6 py-4">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">منابع فعال کاربر</p>
        <h1 className="text-3xl font-bold">منابع</h1>
      </header>
      <Separator />
      <div className="grid gap-4 md:grid-cols-3">
        {resources.map((item) => (
          <Card key={item.id} className="border">
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                نوع: {item.type} | وضعیت: {item.status}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/reports/summary?resource=${item.id}`}>مشاهده داشبورد</Link>
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
