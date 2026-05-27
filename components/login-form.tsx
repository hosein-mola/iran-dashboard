'use client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserCircle2, LockKeyhole, ArrowLeft } from 'lucide-react'
import { FormEvent } from 'react'
import { redirect } from 'next/navigation'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')

    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    })

    if (response.ok) {
      redirect('/modules')
    }
  }

  return (
    <div
      className={cn(
        'bg-background flex items-center justify-center',
        className
      )}
      dir="rtl"
      {...props}
    >
      <div className="border-border bg-card flex w-full overflow-hidden rounded-xl">
        {/* Blue Sidebar */}
        <div className="bg-primary relative hidden w-1/2 p-10 md:flex md:flex-col md:justify-between">
          {/* Decorative SVG Pattern */}
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.08]"
            viewBox="0 0 400 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="350"
              cy="100"
              r="150"
              fill="currentColor"
              className="text-primary-foreground"
            />
            <circle
              cx="50"
              cy="500"
              r="120"
              fill="currentColor"
              className="text-primary-foreground"
            />
            <rect
              x="200"
              y="300"
              width="200"
              height="200"
              rx="20"
              fill="currentColor"
              className="text-primary-foreground"
            />
          </svg>

          {/* Logo & Title */}
          <div className="relative space-y-4">
            <svg
              className="text-primary-foreground h-12 w-12"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 4L6 14v8c0 9.94 7.67 19.21 18 21.74C34.33 41.21 42 31.94 42 22v-8L24 4z"
                fill="currentColor"
                className="opacity-20"
              />
              <path
                d="M24 8L10 16v6c0 8.55 6.58 16.52 14 18.68C31.42 38.52 38 30.55 38 22v-6L24 8z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M20 22l3 3 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="text-primary-foreground text-2xl font-bold">
              سامانه مدیریت منابع آب
            </h1>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              سامانه یکپارچه مدیریت منابع و مصارف آب کشور با قابلیت‌های پیشرفته
              گزارش‌گیری و تحلیل داده
            </p>
          </div>

          {/* Features */}
          <div className="relative space-y-4">
            <div className="text-primary-foreground/80 flex items-center gap-3">
              <svg
                className="text-primary-foreground h-5 w-5 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">احراز هویت امن و رمزنگاری شده</span>
            </div>
            <div className="text-primary-foreground/80 flex items-center gap-3">
              <svg
                className="text-primary-foreground h-5 w-5 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">گزارش‌های تحلیلی و مدیریتی</span>
            </div>
            <div className="text-primary-foreground/80 flex items-center gap-3">
              <svg
                className="text-primary-foreground h-5 w-5 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">مدیریت ماژول‌ها و دسترسی‌ها</span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-primary-foreground/60 relative text-xs">
            © ۱۴۰۴ سازمان منابع آب ایران
          </p>
        </div>

        {/* Login Form */}
        <div className="w-full p-8 md:w-1/2 md:p-12">
          <div className="mb-8 space-y-2">
            <h2 className="text-card-foreground text-xl font-bold">
              ورود به سامانه
            </h2>
            <p className="text-muted-foreground text-sm">
              لطفاً نام کاربری و رمز عبور خود را وارد کنید
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                نام کاربری
              </Label>
              <div className="relative">
                <UserCircle2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="example@mail.com"
                  className="h-11 pr-10 text-right"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  رمز عبور
                </Label>
                <a
                  href="#"
                  className="text-primary hover:text-primary/80 text-xs transition-colors"
                >
                  فراموش کرده‌اید؟
                </a>
              </div>
              <div className="relative">
                <LockKeyhole className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 pr-10 text-right"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full transition-colors"
            >
              <span>ورود به سامانه</span>
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-muted-foreground mt-8 text-center text-xs">
            با ورود به سامانه، قوانین و شرایط استفاده را می‌پذیرید
          </p>
        </div>
      </div>
    </div>
  )
}
