const description =
  'فضای اشتراک فایل برای بارگذاری و مدیریت اسناد پشتیبانی می‌شود، با تمرکز روی انواع مرتبط با پروژه‌های سدسازی.'

export default function FilesPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <h1 className="text-3xl font-semibold">ماژول مدیریت فایل</h1>
      <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
    </div>
  )
}
