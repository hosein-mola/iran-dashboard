'use client'

import Link from 'next/link'
import { useMemo, useSyncExternalStore } from 'react'
import {
  AlertCircle,
  Apple,
  BrainIcon,
  CheckCircle2,
  Download,
  FormInputIcon,
  LogIn,
  QrCode,
  ShieldCheck,
  Smartphone,
  User2,
  Wifi,
} from 'lucide-react'

import { moduleList } from '@/components/module-list'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const quickInfo = [
  {
    title: 'ماژول‌های شما',
    value: moduleList.length.toString(),
    hint: 'فعال برای حساب شما',
  },
  {
    title: 'آخرین ورود',
    value: new Date().toLocaleDateString('fa-IR'),
    hint: 'بازدید امروز',
  },
  {
    title: 'درخواست پشتیبانی',
    value: '۲',
    hint: 'در انتظار پاسخ',
  },
]

const fallbackMobileAppUrl = 'http://localhost:3000/modules'

function createQrCodeUrl(value: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=18&format=svg&data=${encodeURIComponent(
    value,
  )}`
}

function createDownloadTarget(baseUrl: string, platform: 'android' | 'ios') {
  try {
    const url = new URL(baseUrl)
    url.searchParams.set('download', platform)
    return url.toString()
  } catch {
    return `/modules?download=${platform}`
  }
}

function subscribeToStaticLocation(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  window.addEventListener('popstate', onStoreChange)
  return () => window.removeEventListener('popstate', onStoreChange)
}

function getCurrentLocation() {
  if (typeof window === 'undefined') {
    return fallbackMobileAppUrl
  }

  return window.location.href
}

function getFallbackLocation() {
  return fallbackMobileAppUrl
}

function ProfessionalPhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-40 w-[7.5rem] drop-shadow-xl"
      fill="none"
      viewBox="0 0 168 216"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="modules-mobile-body" x1="44" x2="130" y1="11" y2="199">
          <stop stopColor="color-mix(in oklch, var(--card) 72%, white)" />
          <stop offset=".42" stopColor="color-mix(in oklch, var(--primary) 24%, var(--card))" />
          <stop offset="1" stopColor="color-mix(in oklch, var(--foreground) 72%, var(--primary))" />
        </linearGradient>
        <linearGradient id="modules-mobile-bezel" x1="54" x2="119" y1="24" y2="184">
          <stop stopColor="var(--foreground)" />
          <stop offset=".56" stopColor="color-mix(in oklch, var(--foreground) 78%, var(--primary))" />
          <stop offset="1" stopColor="color-mix(in oklch, var(--foreground) 92%, black)" />
        </linearGradient>
        <linearGradient id="modules-mobile-screen" x1="63" x2="111" y1="42" y2="158">
          <stop stopColor="color-mix(in oklch, var(--background) 88%, white)" />
          <stop offset=".54" stopColor="color-mix(in oklch, var(--muted) 70%, var(--card))" />
          <stop offset="1" stopColor="color-mix(in oklch, var(--background) 86%, var(--primary))" />
        </linearGradient>
        <linearGradient id="modules-mobile-top" x1="62" x2="112" y1="54" y2="96">
          <stop stopColor="var(--primary)" />
          <stop offset=".62" stopColor="var(--chart-2)" />
          <stop offset="1" stopColor="var(--chart-5)" />
        </linearGradient>
        <filter id="modules-mobile-depth" colorInterpolationFilters="sRGB" x="0" y="0" width="168" height="216">
          <feDropShadow dx="0" dy="18" stdDeviation="12" floodColor="black" floodOpacity=".2" />
        </filter>
        <clipPath id="modules-mobile-screen-clip">
          <path d="M59.8 31.7h50.7c9.7 0 17.6 7.9 17.6 17.6v111.4c0 9.7-7.9 17.6-17.6 17.6H59.8c-9.7 0-17.6-7.9-17.6-17.6V49.3c0-9.7 7.9-17.6 17.6-17.6Z" />
        </clipPath>
      </defs>
      <ellipse cx="84" cy="195" fill="var(--foreground)" opacity=".12" rx="50" ry="10" />
      <g filter="url(#modules-mobile-depth)">
        <path d="M46.5 13.5h76c12.4 0 22.5 10.1 22.5 22.5v140c0 12.4-10.1 22.5-22.5 22.5h-76C34.1 198.5 24 188.4 24 176V36c0-12.4 10.1-22.5 22.5-22.5Z" fill="url(#modules-mobile-body)" />
        <path d="M46.5 13.5h76c12.4 0 22.5 10.1 22.5 22.5v140c0 12.4-10.1 22.5-22.5 22.5h-76C34.1 198.5 24 188.4 24 176V36c0-12.4 10.1-22.5 22.5-22.5Z" stroke="white" strokeOpacity=".32" strokeWidth="2" />
        <path d="M55 23h59.8c13.4 0 24.2 10.8 24.2 24.2v117.6c0 13.4-10.8 24.2-24.2 24.2H55c-13.4 0-24.2-10.8-24.2-24.2V47.2C30.8 33.8 41.6 23 55 23Z" fill="url(#modules-mobile-bezel)" />
        <path d="M59.8 31.7h50.7c9.7 0 17.6 7.9 17.6 17.6v111.4c0 9.7-7.9 17.6-17.6 17.6H59.8c-9.7 0-17.6-7.9-17.6-17.6V49.3c0-9.7 7.9-17.6 17.6-17.6Z" fill="url(#modules-mobile-screen)" />
        <g clipPath="url(#modules-mobile-screen-clip)">
          <path d="M42.2 31.7h85.9v146.6H42.2V31.7Z" fill="url(#modules-mobile-screen)" />
          <path d="M51 55h68v45H51V55Z" fill="url(#modules-mobile-top)" />
          <path d="M60 69h27M60 82h18M60 92h35" stroke="var(--primary-foreground)" strokeLinecap="round" strokeOpacity=".86" strokeWidth="4" />
          <rect x="91" y="67" width="18" height="18" rx="5" fill="var(--primary-foreground)" opacity=".22" />
          <path d="M96 76h8M100 72v8" stroke="var(--primary-foreground)" strokeLinecap="round" strokeWidth="2.4" />
          <rect x="52" y="114" width="67" height="20" rx="7" fill="var(--card)" opacity=".9" />
          <circle cx="63" cy="124" r="4.5" fill="var(--primary)" opacity=".82" />
          <path d="M74 120h27M74 128h18" stroke="var(--foreground)" strokeLinecap="round" strokeOpacity=".42" strokeWidth="3" />
          <rect x="52" y="144" width="67" height="20" rx="7" fill="var(--card)" opacity=".86" />
          <path d="M59.5 154l3.5 3.5 8-10" stroke="var(--chart-6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" />
          <path d="M74 150h27M74 158h23" stroke="var(--foreground)" strokeLinecap="round" strokeOpacity=".36" strokeWidth="3" />
          <path d="M55 44h8M103 44h5M112 44h3" stroke="var(--foreground)" strokeLinecap="round" strokeOpacity=".36" strokeWidth="2.5" />
        </g>
        <path d="M75 36h20c4.1 0 7.5 3.4 7.5 7.5S99.1 51 95 51H75c-4.1 0-7.5-3.4-7.5-7.5S70.9 36 75 36Z" fill="var(--foreground)" opacity=".92" />
        <circle cx="94.7" cy="43.5" r="2.35" fill="var(--card)" opacity=".48" />
        <path d="M24 67h-4v25h4M145 81h4v42h-4" stroke="var(--foreground)" strokeLinecap="round" strokeOpacity=".42" strokeWidth="4" />
        <path d="M70 174h30" stroke="var(--foreground)" strokeLinecap="round" strokeOpacity=".2" strokeWidth="4" />
      </g>
    </svg>
  )
}

function MobileDownloadPanel() {
  const mobileAppUrl = useSyncExternalStore(
    subscribeToStaticLocation,
    getCurrentLocation,
    getFallbackLocation,
  )
  const mobileQrCodeUrl = useMemo(() => createQrCodeUrl(mobileAppUrl), [mobileAppUrl])
  const androidDownloadUrl = useMemo(
    () => createDownloadTarget(mobileAppUrl, 'android'),
    [mobileAppUrl],
  )
  const iosDownloadUrl = useMemo(() => createDownloadTarget(mobileAppUrl, 'ios'), [mobileAppUrl])
  const displayMobileUrl = mobileAppUrl.replace(/^https?:\/\//, '')

  return (
    <aside className="rounded-lg border border-border/70 bg-background/85 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">اپلیکیشن موبایل</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            نسخه همراه برای دسترسی سریع به ماژول‌ها
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          امن
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[122px_minmax(0,1fr)]">
        <div className="flex items-center justify-center rounded-lg border border-border/60 bg-card/75 px-2 py-3">
          <ProfessionalPhoneIcon />
        </div>

        <Link
          href={mobileAppUrl}
          className="group rounded-lg border border-border/60 bg-card p-3 text-right shadow-xs transition hover:border-primary/50"
          rel="noreferrer"
          target="_blank"
        >
          <span
            aria-label="QR کد برای باز کردن صفحه ماژول‌ها"
            className="mx-auto flex size-28 rounded-md bg-white p-2 shadow-inner"
            role="img"
          >
            <span
              className="block flex-1 bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${mobileQrCodeUrl})` }}
            />
          </span>
          <span className="mt-3 flex items-center justify-between gap-2 text-xs font-semibold text-foreground">
            <span className="flex items-center gap-1.5">
              <QrCode className="size-3.5 text-primary" />
              QR موبایل
            </span>
            <CheckCircle2 className="size-3.5 text-primary" />
          </span>
          <span className="mt-1 block truncate text-left font-mono text-[10px] text-muted-foreground" dir="ltr">
            {displayMobileUrl}
          </span>
        </Link>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button asChild className="h-11 justify-center gap-2 rounded-lg">
          <Link href={androidDownloadUrl} aria-label="دانلود نسخه اندروید">
            <Smartphone className="size-4" />
            <span className="text-sm font-semibold">دانلود Android</span>
            <Download className="size-4 opacity-75" />
          </Link>
        </Button>
        <Button
          asChild
          className="h-11 justify-center gap-2 rounded-lg bg-foreground text-background hover:bg-foreground/90"
        >
          <Link href={iosDownloadUrl} aria-label="دانلود نسخه آی او اس">
            <Apple className="size-4" />
            <span className="text-sm font-semibold">دانلود iOS</span>
            <Download className="size-4 opacity-75" />
          </Link>
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/45 px-3 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Wifi className="size-3.5 text-primary" />
          آنلاین
        </span>
        <span>نسخه سازمانی</span>
      </div>
    </aside>
  )
}

export default function ModulesLandingPage() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto bg-background px-4 py-4">
      <div className="relative z-0 space-y-6">
        <header className="relative isolate overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--accent)_58%,transparent)_0%,transparent_46%)]" />
          <div className="pointer-events-none absolute -left-20 -top-20 -z-10 h-60 w-80 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_34%,transparent)_0%,color-mix(in_oklch,var(--chart-2)_20%,transparent)_42%,transparent_74%)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-20 -z-10 h-72 w-88 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--chart-2)_28%,transparent)_0%,color-mix(in_oklch,var(--primary)_18%,transparent)_44%,transparent_76%)] blur-3xl" />
          <div className="border-b border-border/60 bg-muted/35 px-5 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>درگاه ماژول‌ها</span>
              </div>
              <Button asChild className="self-start rounded-lg sm:self-auto" variant="outline" size="sm">
                <Link href="/dashboard">بازگشت به داشبورد</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center" dir="rtl">
            <div className="min-w-0 space-y-5 text-right">
              <div className="max-w-3xl space-y-3">
                <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
                  مرکز دسترسی ماژول‌های سازمانی
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  همه ماژول‌های فعال حساب شما در یک نمای منظم قرار گرفته‌اند تا سریع وارد محیط کاری موردنظر شوید.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {quickInfo.map((item) => (
                  <div
                    key={item.title}
                    className="min-h-24 rounded-lg border border-border/60 bg-background/80 p-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <AlertCircle className="mt-1 size-5 shrink-0 text-primary" />
                      <p className="text-xs text-muted-foreground">{item.hint}</p>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <MobileDownloadPanel />
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">انتخاب ماژول</h2>
              <p className="text-sm text-muted-foreground">
                ماژول‌ها را بر اساس نیاز خود انتخاب کنید؛ زیرصفحه‌ها در منو نمایش داده نمی‌شوند.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {moduleList.map((module) => (
              <Card
                key={module.href}
                className="group rounded-lg border border-border/60 bg-card/95 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 transition group-hover:bg-primary/15">
                    <module.icon className="size-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">{module.label}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Button asChild className="w-full rounded-lg" variant="outline">
                    <Link href={module.href}>
                      <LogIn className="ml-2 size-4" />
                      ورود به {module.label}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg border border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">ماژول‌های پرکاربرد</CardTitle>
              <CardDescription>بر اساس استفاده کاربران</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 rounded-lg border border-border/60 p-2">
                <FormInputIcon className="size-5 text-primary" />
                <span>فرم‌ساز</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 p-2">
                <User2 className="size-5 text-primary" />
                <span>داشبورد کاربر</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 p-2">
                <BrainIcon className="size-5 text-primary" />
                <span>هوش مصنوعی</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">دسترسی سریع</CardTitle>
              <CardDescription>برای کاربران مجاز</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Button asChild className="w-full rounded-lg" variant="outline">
                <Link href="/logs">لاگ‌ها</Link>
              </Button>
              <Button asChild className="w-full rounded-lg" variant="outline">
                <Link href="/reports">گزارش‌ها</Link>
              </Button>
              <Button asChild className="w-full rounded-lg" variant="outline">
                <Link href="/security">امنیت و کاربران</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-border/60 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">راهنمای انتخاب</CardTitle>
              <CardDescription>اگر نمی‌دانید از کجا شروع کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>۱) برای ساخت فرم‌های جدید، وارد فرم‌ساز شوید.</p>
              <p>۲) برای تحلیل داده‌ها، به گزارش‌ها بروید.</p>
              <p>۳) برای مشاهده رخدادها، لاگ‌ها را باز کنید.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
