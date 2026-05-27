const description =
  'در نسخه‌ی اول صرفاً لاگ‌های اصلی سیستم نمایش داده می‌شود؛ فیلترها و جست‌وجو به زودی اضافه خواهند شد.'

export default function LogsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <h1 className="text-3xl font-semibold">ماژول لاگ</h1>
      <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
    </div>
  )
}
