import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const highlights = [
  { title: 'تعداد درخواست‌ها', value: '42', detail: 'در هفته جاری ثبت شده' },
  { title: 'میانگین زمان پاسخ', value: '1.4 روز', detail: 'پاسخ‌دهی به تیکت‌ها' },
  { title: 'متوسط امتیاز', value: '4.8/5', detail: 'رضایت کاربران' },
]

export default function ReportsSummaryPage() {
  return (
    <section className="space-y-4 py-4">
      <header>
        <p className="text-muted-foreground">اطلاعات مختصر درباره‌ی روند گزارش‌ها</p>
        <h1 className="text-3xl font-bold">خلاصه گزارش</h1>
      </header>
      <Separator className="my-2" />
      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title} className="border">
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {item.detail}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
