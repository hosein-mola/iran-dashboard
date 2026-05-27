const description =
  'کارت‌ها، داشبوردها و گزارش‌های محاسباتی این بخش قابل مشاهده و سفارشی‌سازی خواهند بود.'

export default function ReportsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <h1 className="text-3xl font-semibold">ماژول گزارش</h1>
      <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
    </div>
  )
}
