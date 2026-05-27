const description =
  'در اینجا فرایندهای کدگذاری، اسکریپت‌ها و اتوماسیون‌های تعریف‌شده مشاهده می‌شوند.'

export default function CodePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <h1 className="text-3xl font-semibold">ماژول کد و فرایند</h1>
      <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
    </div>
  )
}
