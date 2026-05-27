import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const forms = [
  { id: 101, name: 'فرم استخدام نیرو' },
  { id: 102, name: 'فرم گزارش نظارت' },
  { id: 103, name: 'فرم درخواست مصالح' },
]

export default function FormsIndexPage() {
  return (
    <section className="space-y-6 py-4">
      <header>
        <p className="text-sm text-muted-foreground">لیست فرم‌ها</p>
        <h1 className="text-3xl font-bold">مدیریت فرم‌ها</h1>
      </header>
      <Separator />
      <div className="grid gap-4 md:grid-cols-3">
        {forms.map((form) => (
          <Card key={form.id} className="border">
            <CardHeader>
              <CardTitle className="text-lg">{form.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>شناسه: #{form.id}</p>
              <Button asChild size="sm" variant="outline">
                <Link href={`/form-builder/forms/${form.id}`}>نمایش</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button asChild>
        <Link href="/form-builder">بازگشت به استودیو</Link>
      </Button>
    </section>
  )
}
