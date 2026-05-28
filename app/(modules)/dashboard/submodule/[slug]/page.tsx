import Link from 'next/link'
import { BarChart3, ClipboardList, Database, FileText } from 'lucide-react'

import { GetSubmoduleDashboard } from '@/actions/form'
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
import { Chart1 } from '@/components/Chart1'
import { Chart2 } from '@/components/Chart2'

export default async function SubmoduleDashboardPage(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const submodule = await GetSubmoduleDashboard(params.slug)

  if (!submodule) {
    throw new Error('submodule not found')
  }

  return (
    <section className="space-y-6 p-4">
      <header className="bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">زیرماژول</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{submodule.name}</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {submodule.description}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/submodule">بازگشت</Link>
          </Button>
        </div>
      </header>
      <Card className="w-full rounded-lg">
        <CardHeader>
          <CardTitle>توزیع سابمیشن‌ها در طول زمان</CardTitle>
          <CardDescription>روند ثبت داده‌ها در این زیرماژول</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Chart1 />
          <Chart2 />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-lg">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-sm">فرم‌ها</p>
              <p className="text-2xl font-semibold">
                {submodule.forms.length.toLocaleString('fa-IR')}
              </p>
            </div>
            <FileText className="text-primary size-8" />
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-sm">سابمیشن‌ها</p>
              <p className="text-2xl font-semibold">
                {submodule.submissionCount.toLocaleString('fa-IR')}
              </p>
            </div>
            <BarChart3 className="text-primary size-8" />
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-muted-foreground text-sm">جداول پایه</p>
              <p className="text-2xl font-semibold">
                {submodule.baseTables.length.toLocaleString('fa-IR')}
              </p>
            </div>
            <Database className="text-primary size-8" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>فرم‌های این زیرماژول</CardTitle>
            <CardDescription>
              هر فرم به نقش، کاربر و نسخه جاری خودش وصل است.
            </CardDescription>
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
                    {form.role?.name && (
                      <Badge variant="outline">{form.role.name}</Badge>
                    )}
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
                      داشبورد پاسخ‌ها
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>آخرین سابمیشن‌ها</CardTitle>
            <CardDescription>
              آخرین داده‌های ثبت‌شده در این زیرماژول
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {submodule.latestSubmissions.length === 0 && (
              <p className="text-muted-foreground text-sm">
                هنوز داده‌ای ثبت نشده است.
              </p>
            )}
            {submodule.latestSubmissions.map((submission: any) => (
              <div key={submission.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">
                    {submission.form?.name || `#${submission.formId}`}
                  </p>
                  <Badge variant="outline">
                    v{submission.version.toLocaleString('fa-IR')}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Date(submission.submittedAt).toLocaleString('fa-IR')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator />
    </section>
  )
}
