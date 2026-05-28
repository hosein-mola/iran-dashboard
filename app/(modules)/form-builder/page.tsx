import Link from 'next/link'
import { formatDistance } from 'date-fns'
import { BiRightArrowAlt } from 'react-icons/bi'
import { FaEdit, FaWpforms } from 'react-icons/fa'
import { HiCursorClick } from 'react-icons/hi'
import { LuView } from 'react-icons/lu'
import { TbArrowBounce } from 'react-icons/tb'
import { Plus } from 'lucide-react'

import {
  GetForms,
  GetFormSetupOptions,
  GetFormStats,
} from '@/actions/form'
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

import { StatsCard } from './StatsCard'

type Forms = Awaited<ReturnType<typeof GetForms>>
type FormCardData = Forms[number]
type SetupOptions = Awaited<ReturnType<typeof GetFormSetupOptions>>

const scheduleLabels: Record<string, string> = {
  hourly: 'ساعتی',
  weekly: 'هفتگی',
  monthly: 'ماهانه',
}

export default async function FormBuilderHome() {
  const [forms, stats, setupOptions] = await Promise.all([
    GetForms(),
    GetFormStats(),
    GetFormSetupOptions(),
  ])
  const publishedCount = forms.filter((form) => form.published).length
  const draftCount = forms.length - publishedCount

  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
      <div className="from-background via-background to-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br" />
      <div className="relative z-0 space-y-6">
        <div className="bg-background/98 sticky top-0 z-[220] space-y-4 pb-2 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur">
          <header className="border-border/60 bg-card/90 supports-[backdrop-filter]:bg-card/80 space-y-4 rounded-xl border p-4 shadow-md backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  استودیو فرم‌سازی
                </p>
                <h1 className="text-3xl font-bold">فرم‌ساز</h1>
              </div>
              <span className="text-muted-foreground text-sm">
                {new Date().toLocaleString('fa-ir')}
              </span>
            </div>
            <p className="text-muted-foreground">
              فرم‌ها با نسخه مستقل ذخیره می‌شوند تا تغییر ساختار فرم، پاسخ‌های
              قبلی را خراب نکند.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <Card className="border-border/60 bg-card/90 rounded-lg border shadow-sm backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    میانبرها
                  </CardTitle>
                  <CardDescription>
                    دسترسی سریع به اقدامات پرکاربرد
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <CreateFormButton options={setupOptions} />
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/dashboard/submodule">فرم‌های زیرماژول‌ها</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/form-builder/modules">زیرماژول و قالب‌ها</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-card/90 rounded-lg border shadow-sm backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    نسخه‌بندی
                  </CardTitle>
                  <CardDescription>
                    هر ذخیره، تنظیمات و رویداد یک نسخه جدید می‌سازد.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>نسخه فرم داخل هر سابمیشن ثبت می‌شود.</p>
                  <p>فرم‌های منتشرشده همچنان قابل ویرایش هستند.</p>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-card/90 rounded-lg border shadow-sm backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    وضعیت انتشار
                  </CardTitle>
                  <CardDescription>
                    خلاصه فرم‌های فعال و پیش‌نویس
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2 text-sm">
                  <div className="border-border/60 rounded-lg border p-2">
                    <p className="text-muted-foreground text-xs">منتشر شده</p>
                    <p className="text-primary text-lg font-semibold">
                      {publishedCount.toLocaleString('fa-IR')} فرم
                    </p>
                  </div>
                  <div className="border-border/60 rounded-lg border p-2">
                    <p className="text-muted-foreground text-xs">پیش‌نویس</p>
                    <p className="text-lg font-semibold text-amber-600">
                      {draftCount.toLocaleString('fa-IR')} فرم
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </header>
        </div>

        <StatsCards loading={false} data={stats} />

        <Separator />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-2xl font-bold">فرم‌ها</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FormCards forms={forms} setupOptions={setupOptions} />
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
        value={
          loading
            ? ''
            : data?.submissionsRate?.toLocaleString('fa-IR') || '۰'
        }
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

function FormCards({
  forms,
  setupOptions,
}: {
  forms: Forms
  setupOptions: SetupOptions
}) {
  return (
    <>
      <Card className="border-border/70 bg-card/90 rounded-lg border border-dashed shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Plus className="text-primary size-5" />
            ایجاد فرم جدید
          </CardTitle>
          <CardDescription>
            فرم را به زیرماژول، نقش و کاربر مسئول وصل کنید.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          دوره ثبت ساعتی، هفتگی یا ماهانه از همین ابتدا روی فرم ذخیره می‌شود.
        </CardContent>
        <CardFooter>
          <CreateFormButton options={setupOptions} />
        </CardFooter>
      </Card>
      {forms.map((form) => (
        <FormCard key={form.id} form={form} />
      ))}
    </>
  )
}

function FormCard({ form }: { form: FormCardData }) {
  return (
    <Card className="border-border/70 bg-card/90 rounded-lg border shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="truncate font-bold">{form.name}</span>
          {form.published ? (
            <Badge>منتشر شده</Badge>
          ) : (
            <Badge variant={'destructive'}>پیش‌نویس</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-muted-foreground flex items-center justify-between gap-3 text-sm">
          <span>
            {formatDistance(form.createdAt, new Date(), { addSuffix: true })}
          </span>
          <span className="flex items-center gap-2">
            <LuView className="text-muted-foreground" />
            <span>{form.visit.toLocaleString('fa-IR')}</span>
            <FaWpforms className="text-muted-foreground" />
            <span>{form.submission.toLocaleString('fa-IR')}</span>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-2 text-sm">
        <p className="truncate">{form.description || 'توضیحی ثبت نشده است'}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            نسخه {form.currentVersion.toLocaleString('fa-IR')}
          </Badge>
          <Badge variant="outline">
            {scheduleLabels[form.scheduleType] || form.scheduleType}
          </Badge>
          {form.submodule?.name && (
            <Badge variant="outline">{form.submodule.name}</Badge>
          )}
          {form.template?.name && (
            <Badge variant="outline">قالب: {form.template.name}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild variant="outline" className="text-md mt-2 flex-1 gap-2">
          <Link href={`/form-builder/builder/${form.id}`}>
            ویرایش <FaEdit />
          </Link>
        </Button>
        <Button asChild className="text-md mt-2 flex-1 gap-2">
          <Link href={`/form-builder/forms/${form.id}`}>
            پاسخ‌ها <BiRightArrowAlt />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
