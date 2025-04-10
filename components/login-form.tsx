'use client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpenIcon, HeadsetIcon, VideoIcon } from 'lucide-react'
import { FormEvent } from 'react'
import { redirect } from 'next/navigation'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'> & {}) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = formData.get('username')
    const password = formData.get('password')

    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      redirect('/dashboard')
    } else {
      // Handle errors
    }
  }

  return (
    <div
      className={cn('bg-background flex flex-col gap-6', className)}
      {...props}
    >
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">ورود به سامانه</h1>
                <p className="text-muted-foreground text-balance">
                  سامانه مدیریت منابع و مصارف آب کشور
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">نام کاربری</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">رمز عبور</Label>
                  <a
                    href="#"
                    className="mr-auto text-sm underline-offset-2 hover:underline"
                  >
                    رمز عبور خود را فراموش کردید ؟
                  </a>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                ورود به سامانه
              </Button>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  مدریت سرویس
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button" className="w-full">
                  <BookOpenIcon />
                  <span className="sr-only">مستندات فنی</span>
                </Button>
                <Button variant="outline" type="button" className="w-full">
                  <HeadsetIcon />
                  <span className="sr-only">پشتیبانی</span>
                </Button>
                <Button variant="outline" type="button" className="w-full">
                  <VideoIcon />
                  <span className="sr-only">ویدیو آموزشی</span>
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <a href="#" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
          <div className="from-primary to-accent relative hidden bg-gradient-to-b md:block">
            {/* <Image
              src="/images/1.jpg"
              alt="Image"
              width={500}
              height={500}
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            /> */}
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
