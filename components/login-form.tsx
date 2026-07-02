'use client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Database,
  Eye,
  EyeOff,
  Fingerprint,
  Gauge,
  LoaderCircle,
  LockKeyhole,
  RadioTower,
  ServerCog,
  ShieldCheck,
  UserCircle2,
  UsersRound,
  Waves,
} from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

const statusItems = [
  { label: 'پایش برخط', value: '۲۴/۷', icon: Activity },
  { label: 'دسترسی', value: 'سازمانی', icon: ShieldCheck },
  { label: 'پایداری', value: '۹۹.۹٪', icon: Gauge },
]

const highlightItems = [
  { label: 'تحلیل مدیریتی', value: '۸ نمای فعال', icon: BarChart3 },
  { label: 'منابع داده', value: 'همگام', icon: Database },
  { label: 'کنترل دسترسی', value: 'سطح‌بندی شده', icon: UsersRound },
  { label: 'هسته پردازش', value: 'در حال پایش', icon: ServerCog },
]

const accessDetails = [
  { label: 'احراز هویت', value: 'رمزنگاری شده', icon: Fingerprint },
  { label: 'اتصال سامانه', value: 'آنلاین', icon: RadioTower },
]

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const username = String(formData.get('username') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      })

      if (response.ok) {
        router.push('/modules')
        router.refresh()
        return
      }

      setError('نام کاربری یا رمز عبور صحیح نیست.')
    } catch {
      setError('ارتباط با سرور برقرار نشد. دوباره تلاش کنید.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn('w-full', className)} dir="rtl" {...props}>
      <div className="border-border/70 bg-card shadow-primary/10 grid min-h-[40rem] overflow-hidden rounded-lg border shadow-2xl lg:grid-cols-[1.08fr_0.92fr]">
        <section className="border-border/70 bg-primary text-primary-foreground hidden border-l p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="border-primary-foreground/30 grid size-12 place-items-center rounded-lg border">
                <Waves className="size-7" />
              </span>
              <div>
                <p className="text-xl font-black">سد‌ایران</p>
                <p className="text-primary-foreground/70 mt-1 text-xs">
                  مرکز عملیات منابع آب
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-md text-4xl leading-tight font-black">
                ورود امن به داشبورد سازمانی
              </h1>
              <p className="text-primary-foreground/70 max-w-sm text-sm leading-7">
                دسترسی متمرکز به گزارش‌ها، منابع داده و ابزارهای مدیریتی در یک
                محیط پایدار و کنترل‌شده.
              </p>
            </div>

            <div className="bg-primary-foreground/40 h-px w-24" />

            <div className="space-y-4">
              {highlightItems.map((item) => (
                <div
                  className="border-primary-foreground/20 flex items-center justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                  key={item.label}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <item.icon className="text-primary-foreground/70 size-5 shrink-0" />
                    <span className="text-primary-foreground/80 truncate text-sm">
                      {item.label}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-bold">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {statusItems.map((item) => (
                <div key={item.label} className="min-w-0">
                  <item.icon className="text-primary-foreground/70 mb-2 size-4" />
                  <p className="text-primary-foreground/60 truncate text-xs">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-black">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="border-primary-foreground/20 border-t pt-5">
              <p className="text-primary-foreground/60 text-xs leading-6">
                طراحی شده برای استفاده روزمره، خوانایی بالا و سازگاری کامل با
                تم‌های روشن و تیره.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-card relative flex min-h-[40rem] items-center overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[25rem]">
            <div className="relative z-10 mb-8 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="bg-primary text-primary-foreground shadow-primary/20 grid size-11 shrink-0 place-items-center rounded-lg shadow-md">
                  <Waves className="size-6" />
                </span>
                <div>
                  <p className="text-foreground text-sm font-bold">سد‌ایران</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    درگاه احراز هویت
                  </p>
                </div>
              </div>
              <span className="border-border/70 bg-muted/50 text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium">
                <ShieldCheck className="text-primary size-3.5" />
                امن
              </span>
            </div>

            <div className="relative z-10 mb-6 grid gap-3 sm:grid-cols-2">
              {accessDetails.map((item) => (
                <div
                  className="border-border/70 bg-background rounded-lg border px-3 py-2.5 shadow-sm"
                  key={item.label}
                >
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <item.icon className="text-primary size-3.5" />
                    {item.label}
                  </div>
                  <p className="text-foreground mt-1 text-sm font-semibold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative z-10 mb-8 space-y-2">
              <h2 className="text-card-foreground text-2xl leading-tight font-extrabold">
                ورود به سامانه
              </h2>
              <p className="text-muted-foreground text-sm leading-6">
                برای ادامه، اطلاعات حساب سازمانی خود را وارد کنید.
              </p>
            </div>

            {error ? (
              <div
                className="border-destructive/30 bg-destructive/10 text-destructive mb-5 rounded-md border px-3 py-2 text-sm"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <form
              onSubmit={handleSubmit}
              className="border-border/70 bg-background shadow-foreground/5 relative z-10 space-y-5 rounded-lg border p-4 shadow-lg"
            >
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">
                  نام کاربری
                </Label>
                <div className="relative">
                  <UserCircle2 className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
                  <Input
                    autoComplete="username"
                    className="border-input bg-card focus-visible:bg-card h-12 rounded-lg pr-10 text-right shadow-sm transition-colors"
                    disabled={isSubmitting}
                    id="username"
                    name="username"
                    placeholder="نام کاربری یا ایمیل"
                    required
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    رمز عبور
                  </Label>
                  <span className="text-muted-foreground text-xs font-medium">
                    حساب سازمانی
                  </span>
                </div>
                <div className="relative">
                  <LockKeyhole className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
                  <Input
                    autoComplete="current-password"
                    className="border-input bg-card focus-visible:bg-card h-12 rounded-lg pr-10 pl-11 text-right shadow-sm transition-colors"
                    disabled={isSubmitting}
                    id="password"
                    name="password"
                    placeholder="رمز عبور"
                    required
                    type={showPassword ? 'text' : 'password'}
                  />
                  <button
                    aria-label={
                      showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'
                    }
                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 absolute top-1/2 left-2 grid size-8 -translate-y-1/2 place-items-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    disabled={isSubmitting}
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                className="shadow-primary/20 h-12 w-full rounded-lg text-sm font-bold shadow-lg"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <ArrowLeft className="size-4" />
                )}
                <span>
                  {isSubmitting ? 'در حال ورود...' : 'ورود به سامانه'}
                </span>
              </Button>
            </form>

            <div className="border-border/70 relative z-10 mt-8 border-t pt-5">
              <p className="text-muted-foreground text-center text-xs leading-6">
                ورود شما به منزله پذیرش سیاست‌های دسترسی سازمانی است.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
