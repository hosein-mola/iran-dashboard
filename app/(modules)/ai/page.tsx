const description =
  'این بخش برای نمایش و مدیریت قابلیت‌های هوش مصنوعی در آینده نزدیک فعال خواهد شد.'

export default function AIPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <h1 className="text-3xl font-semibold">ماژول هوش مصنوعی</h1>
      <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
    </div>
  )
}
