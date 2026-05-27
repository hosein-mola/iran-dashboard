import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const drafts = [
  { id: 1, title: 'فرم ثبت ورود' },
  { id: 2, title: 'فرم بازخورد کاربری' },
  { id: 3, title: 'فرم درخواست پشتیبانی' },
]

export default function BuilderIndexPage() {
  return (
    <section className="space-y-6 py-4">
      <header>
        <p className="text-sm text-muted-foreground">استودیو فرم‌سازی سد‌ایران</p>
        <h1 className="text-3xl font-bold">فرم‌های آماده</h1>
      </header>
      <Separator />
      <div className="grid gap-4 md:grid-cols-3">
        {drafts.map((form) => (
          <Card key={form.id} className="border">
            <CardHeader>
              <CardTitle className="text-lg">{form.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>شماره فرم: {form.id}</p>
              <Button asChild size="sm">
                <Link href={`/form-builder/builder/${form.id}`}>ویرایش</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button asChild>
        <Link href="/form-builder">بازگشت به استودیو اصلی</Link>
      </Button>
    </section>
  )
}
