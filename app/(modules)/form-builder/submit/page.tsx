import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const batches = [
  { id: 'A-12', target: 'پایش کیفیت', count: 18 },
  { id: 'B-04', target: 'ثبت بازخورد', count: 24 },
]

export default function SubmitIndexPage() {
  return (
    <section className="space-y-7 py-4">
      <header>
        <p className="text-sm text-muted-foreground">گزارش ارسال‌ها</p>
        <h1 className="text-3xl font-bold">سبدهای ارسال</h1>
      </header>
      <Separator />
      <div className="grid gap-4 md:grid-cols-2">
        {batches.map((batch) => (
          <Card key={batch.id} className="border">
            <CardHeader>
              <CardTitle className="text-lg">{batch.target}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>شناسه سبد: {batch.id}</p>
              <p>فرم‌های ارسالی: {batch.count}</p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link href={`/form-builder/submit/${batch.id}`}>مشاهده</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button asChild>
        <Link href="/form-builder">بازگشت به فرم‌ساز</Link>
      </Button>
    </section>
  )
}
