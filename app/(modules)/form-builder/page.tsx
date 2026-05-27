'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { formatDistance } from 'date-fns'
import { BiRightArrowAlt } from 'react-icons/bi'
import { FaEdit, FaWpforms } from 'react-icons/fa'
import { HiCursorClick } from 'react-icons/hi'
import { LuView } from 'react-icons/lu'
import { TbArrowBounce } from 'react-icons/tb'
import { Plus } from 'lucide-react'

import CreateFormButton from '@/components/CreateFormButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { Form } from '@/prisma/client'
import { StatsCard } from './StatsCard'

const forms: Form[] = [
  {
    id: 1,
    name: 'فرم نمونه 1',
    published: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    visit: 120,
    submission: 35,
    description: 'توضیحات فرم نمونه 1',
    userId: '',
    updatedAt: new Date(),
    page: null,
    components: '',
    context: '',
    sharedURL: '',
  },
  {
    id: 2,
    name: 'فرم نمونه 2',
    published: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    visit: 50,
    submission: 10,
    description: '',
    userId: '',
    updatedAt: new Date(),
    page: null,
    components: '',
    context: '',
    sharedURL: '',
  },
]

const stats = {
  forms: 12,
  visits: 1234,
  submissions: 4321,
  submissionsRate: 123,
  bounceRate: 345,
}

export default function FormBuilderHome() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative z-0 space-y-6">
        <div className="sticky top-0 z-[220] space-y-4 bg-background/98 pb-2 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
        <header className="space-y-4 rounded-xl border border-border/60 bg-card/90 p-4 shadow-md backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">استودیو فرم‌سازی</p>
              <h1 className="text-3xl font-bold">فرم‌ساز</h1>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleString('fa-ir')}
            </span>
          </div>
          <p className="text-muted-foreground">
            فرم‌های فعال شما، آمار بازدید و سابمیشن‌ها در یک نگاه. فرم جدید بسازید یا
            یکی از فرم‌های موجود را ویرایش کنید.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">میانبرها</CardTitle>
                <CardDescription>دسترسی سریع به اقدامات پرکاربرد</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href="/form-builder/builder/new">ساخت فرم جدید</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/form-builder">مشاهده فرم‌ها</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/form-builder/forms/analytics">آمار فرم‌ها</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">راهنمای سریع</CardTitle>
                <CardDescription>نکات مهم برای فرم‌سازی حرفه‌ای</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>۱) برچسب‌ها را کوتاه و شفاف نگه دارید.</p>
                <p>۲) اعتبارسنجی اجباری را برای فیلدهای کلیدی فعال کنید.</p>
                <p>۳) لینک عمومی را پس از انتشار برای تیم ارسال کنید.</p>
              </CardContent>
            </Card>
            <Card className="rounded-lg border border-border/60 bg-card/90 shadow-sm backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">وضعیت انتشار</CardTitle>
                <CardDescription>خلاصه‌ی فرم‌های فعال و پیش‌نویس</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-border/60 p-2">
                  <p className="text-xs text-muted-foreground">منتشر شده</p>
                  <p className="text-lg font-semibold text-primary">۸ فرم</p>
                </div>
                <div className="rounded-lg border border-border/60 p-2">
                  <p className="text-xs text-muted-foreground">پیش‌نویس</p>
                  <p className="text-lg font-semibold text-amber-600">۴ فرم</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>
        </div>

        <Suspense fallback={<StatsCards loading={true} />}>
          <StatsCards loading={false} data={stats} />
        </Suspense>

        <Separator />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-2xl font-bold">فرم‌ها</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Suspense fallback={[1, 2, 3, 4].map((el) => <FormCardSkeleton key={el} />)}>
              <FormCards forms={forms} />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  )
}

interface StatsCardProps {
  data?: {
    forms: number
    visits: number
    submissions: number
    submissionsRate: number
    bounceRate: number
  }
  loading: boolean
}

function StatsCards(props: StatsCardProps) {
  const { data, loading } = props
  return (
    <div className="xl:grid-col-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title={'تعداد کل فرم‌ها'}
        value={loading ? '' : data?.forms?.toLocaleString('fa-IR') || '۰'}
        icon={<FaWpforms className={'text-primary'} />}
        loading={loading}
        helperText="همه فرم‌های ساخته‌شده"
        className={''}
      />
      <StatsCard
        title={'کل داده‌های ثبت‌شده'}
        value={loading ? '' : data?.submissions?.toLocaleString('fa-IR') || '۰'}
        icon={<LuView className={'text-primary'} />}
        loading={loading}
        helperText="جمع سابمیشن‌ها"
        className={''}
      />
      <StatsCard
        title={'داده‌های امروز'}
        value={loading ? '' : data?.submissionsRate?.toLocaleString('fa-IR') || '۰'}
        icon={<HiCursorClick className={'text-primary'} />}
        loading={loading}
        helperText="سابمیشن‌های ۲۴ ساعت اخیر"
        className={''}
      />
      <StatsCard
        title={'داده‌های ماه جاری'}
        value={loading ? '' : data?.bounceRate?.toLocaleString('fa-IR') || '۰'}
        icon={<TbArrowBounce className={'text-primary'} />}
        loading={loading}
        helperText="مجموع این ماه"
        className={''}
      />
    </div>
  )
}

function FormCardSkeleton() {
  return <Skeleton className="border-primary/20 h-[190px] w-full border-2" />
}

function FormCards({ forms }: { forms: Form[] }) {
  return (
    <>
      <Card className="border border-dashed border-border/70 bg-card/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Plus className="size-5 text-primary" />
            ایجاد فرم جدید
          </CardTitle>
          <CardDescription>یک فرم تازه برای جمع‌آوری داده بسازید</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          فیلدها را اضافه کنید، اعتبارسنجی بگذارید و لینک عمومی فرم را منتشر کنید.
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/form-builder/builder/new">
              شروع ساخت فرم <BiRightArrowAlt />
            </Link>
          </Button>
        </CardFooter>
      </Card>
      {forms.map((form: Form) => (
        <FormCard key={form.id} form={form} />
      ))}
    </>
  )
}

function FormCard({ form }: { form: Form }) {
  return (
    <Card className="border border-border/70 bg-card/90 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="truncate font-bold">{form.name}</span>
          {form.published ? <Badge>منتشر شده</Badge> : <Badge variant={'destructive'}>پیش‌نویس</Badge>}
        </CardTitle>
        <CardDescription className="text-muted-foreground flex items-center justify-between text-sm">
          {formatDistance(form.createdAt, new Date(), { addSuffix: true })}
          {form.published && (
            <span className="flex items-center gap-2">
              <LuView className="text-muted-foreground" />
              <span>{form.visit.toLocaleString()}</span>
              <FaWpforms className="text-muted-foreground" />
              <span>{form.submission.toLocaleString()}</span>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground h-[20px] truncate text-sm">
        {form.description || 'توضیحی ثبت نشده است'}
      </CardContent>
      <CardFooter>
        {form.published ? (
          <Button asChild className="text-md mt-2 w-full gap-4">
            <Link href={`/forms/${form.id}`}>
              مشاهده پاسخ‌ها <BiRightArrowAlt />
            </Link>
          </Button>
        ) : (
          <Button
            asChild
            variant={'outline'}
            className="text-md mt-2 w-full gap-4"
          >
            <Link href={`/form-builder/builder/${form.id}`}>
              ویرایش فرم <FaEdit />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
