import Link from 'next/link'
import { Activity, Code2, Database, GitBranch, Server, Terminal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const processTools = [
  {
    title: 'ویرایشگر کد',
    description: 'مدیریت workspace، نسخه‌ها، اجرا و خروجی کدهای ذخیره‌شده.',
    href: '/process/code-editor',
    icon: Code2,
    action: 'باز کردن ویرایشگر',
  },
  {
    title: 'Worker Pool',
    description: 'پایش workerها، صف اجرا، وضعیت jobها و logهای پردازش.',
    href: '/process/workers',
    icon: Server,
    action: 'مشاهده Workerها',
  },
  {
    title: 'داده و اتصال‌ها',
    description: 'ثبت Connection String، تست اتصال و تعریف کد امن برای استفاده در Deno Worker.',
    href: '/process/data',
    icon: Database,
    action: 'مدیریت داده',
  },
  {
    title: 'Workflow',
    description: 'تعریف نسخه‌دار فرایند، گردش فرم، تایید موازی و وضعیت اجرای Temporal.',
    href: '/process/workflow',
    icon: GitBranch,
    action: 'باز کردن Workflow',
  },
]

export default function ProcessPage() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="from-background via-background to-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br" />
      <div className="relative z-10 space-y-6">
        <header className="border-border/60 bg-card/90 supports-[backdrop-filter]:bg-card/80 rounded-xl border p-4 shadow-md backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">ابزارهای اجرا</p>
              <h1 className="text-3xl font-bold">Process</h1>
            </div>
            <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-lg">
              <Terminal className="size-6" />
            </div>
          </div>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
            دسترسی سریع به ابزارهای توسعه، اجرای کد و پایش workerها در این بخش
            قرار دارد.
          </p>
        </header>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-4">
          {processTools.map((tool) => (
            <Card
              key={tool.href}
              className="border-border/60 bg-card/90 min-h-56 min-w-72 rounded-lg border shadow-sm backdrop-blur"
            >
              <CardHeader className="space-y-3">
                <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-lg">
                  <tool.icon className="size-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="whitespace-nowrap text-lg font-semibold">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="min-h-10">
                    {tool.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full whitespace-nowrap">
                  <Link href={tool.href}>{tool.action}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-border/60 bg-card/90 rounded-lg border shadow-sm backdrop-blur">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <Activity className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">وضعیت سرویس‌ها</p>
                <p className="text-muted-foreground text-xs">
                  برای جزئیات اجرا و صف‌ها وارد داشبورد Worker شوید.
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/process/workers">مشاهده داشبورد</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
