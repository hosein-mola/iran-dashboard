import Link from 'next/link'
import { ClipboardList, Layers3 } from 'lucide-react'

import { GetUserSubmodules } from '@/actions/form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const scheduleLabels: Record<string, string> = {
  hourly: 'ساعتی',
  weekly: 'هفتگی',
  monthly: 'ماهانه',
}

export default async function DashboardSubmodulePage() {
  const submodules = await GetUserSubmodules()
  console.log('🚀 ~ DashboardSubmodulePage ~ submodules:', submodules)

  return (
    <section className="space-y-6 p-4">
      <header className="bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">داشبورد کاربر</p>
        <h1 className="text-3xl font-bold">فرم‌های زیرسیستم</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          فرم‌های منتشرشده بر اساس تخصیص کاربر، نقش و زیرماژول نمایش داده
          می‌شوند.
        </p>
      </header>

      <Separator />

      {submodules.length === 0 && (
        <div className="text-muted-foreground flex min-h-60 items-center justify-center rounded-lg border border-dashed text-sm">
          هنوز فرم منتشرشده‌ای به این کاربر تخصیص داده نشده است.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {submodules.map((submodule) => (
          <Card key={submodule.id} className="rounded-lg">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layers3 className="text-primary size-5" />
                    {submodule.name}
                  </CardTitle>
                  <CardDescription>{submodule.description}</CardDescription>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/submodule/${submodule.slug}`}>
                    داشبورد
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {submodule.forms.map((form: any) => (
                <div
                  key={form.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{form.name}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        نسخه {form.currentVersion.toLocaleString('fa-IR')}
                      </Badge>
                      <Badge variant="outline">
                        {scheduleLabels[form.scheduleType] || form.scheduleType}
                      </Badge>
                      <Badge variant="outline">
                        {form._count.submissions.toLocaleString('fa-IR')} ثبت
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/form-builder/submit/${form.id}`}>
                        <ClipboardList className="size-4" />
                        ثبت
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link
                        href={`/dashboard/submodule/${submodule.slug}/forms/${form.id}`}
                      >
                        پاسخ‌ها
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
