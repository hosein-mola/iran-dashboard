import Link from 'next/link'
import { FaWpforms } from 'react-icons/fa'
import { HiCursorClick } from 'react-icons/hi'
import { LuView } from 'react-icons/lu'
import { TbArrowBounce } from 'react-icons/tb'

import { GetFormWithSubmissions } from '@/actions/form'
import FormSubmissionsGrid from '@/components/FormSubmissionsGrid'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StatsCard } from '../../StatsCard'

export default async function FormDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const form = await GetFormWithSubmissions(Number(params.id))

  if (!form) {
    throw new Error('form not found')
  }

  const submissionRate =
    form.visit > 0 ? Math.round((form.submission / form.visit) * 100) : 0
  const bounceRate = 100 - submissionRate

  return (
    <section className="space-y-6 p-4">
      <header className="space-y-4 rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              نسخه جاری {form.currentVersion.toLocaleString('fa-IR')}
            </p>
            <h1 className="text-3xl font-bold">{form.name}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/form-builder/builder/${form.id}`}>ویرایش فرم</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="بازدید"
          icon={<LuView className="text-blue-600" />}
          helperText="همه بازدیدهای فرم"
          value={form.visit.toLocaleString('fa-IR')}
          loading={false}
          className=""
        />
        <StatsCard
          title="پاسخ‌ها"
          icon={<FaWpforms className="text-yellow-600" />}
          helperText="همه سابمیشن‌ها"
          value={form.submission.toLocaleString('fa-IR')}
          loading={false}
          className=""
        />
        <StatsCard
          title="نرخ ثبت"
          icon={<HiCursorClick className="text-green-600" />}
          helperText="نسبت ثبت به بازدید"
          value={`${submissionRate.toLocaleString('fa-IR')}٪`}
          loading={false}
          className=""
        />
        <StatsCard
          title="نرخ خروج"
          icon={<TbArrowBounce className="text-red-600" />}
          helperText="بازدید بدون ثبت"
          value={`${bounceRate.toLocaleString('fa-IR')}٪`}
          loading={false}
          className=""
        />
      </div>

      <Separator />

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold">سابمیشن‌ها</h2>
          <p className="text-sm text-muted-foreground">
            هر ردیف با نسخه فرم زمان ثبت ذخیره شده است.
          </p>
        </div>
        <FormSubmissionsGrid rows={form.submissionRows} />
      </section>
    </section>
  )
}
