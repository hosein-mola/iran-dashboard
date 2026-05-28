import Link from 'next/link'
import { formatDistance } from 'date-fns'
import { FaEdit, FaWpforms } from 'react-icons/fa'
import { HiCursorClick } from 'react-icons/hi'
import { LuView } from 'react-icons/lu'
import { Plus, Layers3 } from 'lucide-react'
import { TbArrowBounce } from 'react-icons/tb'

import {
  GetFormModuleCatalog,
  GetFormSetupOptions,
  GetFormStats,
} from '@/actions/form'
import CreateFormButton from '@/components/CreateFormButton'
import DeleteRecordButton from '@/components/DeleteRecordButton'
import FormBuilderFilters from '@/components/FormBuilderFilters'
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

type Catalog = Awaited<ReturnType<typeof GetFormModuleCatalog>>
type Forms = Catalog['forms']
type Templates = Catalog['templates']
type SetupOptions = Awaited<ReturnType<typeof GetFormSetupOptions>>

const scheduleLabels: Record<string, string> = {
  hourly: 'ساعتی',
  weekly: 'هفتگی',
  monthly: 'ماهانه',
}

function readSearchParam(
  value: string | string[] | undefined,
  fallback = ''
) {
  if (Array.isArray(value)) return value[0] ?? fallback
  return value ?? fallback
}

export default async function FormBuilderHome(props: {
  searchParams?: Promise<{
    formsSubmodule?: string | string[]
    templatesSubmodule?: string | string[]
  }>
}) {
  const searchParams = (await props.searchParams) ?? {}
  const [catalog, stats, setupOptions] = await Promise.all([
    GetFormModuleCatalog(),
    GetFormStats(),
    GetFormSetupOptions(),
  ])

  const formsSubmoduleId = readSearchParam(searchParams.formsSubmodule)
  const templatesSubmoduleId = readSearchParam(searchParams.templatesSubmodule)

  const forms = formsSubmoduleId
    ? catalog.forms.filter(
        (form) => String(form.submoduleId ?? '') === formsSubmoduleId
      )
    : catalog.forms

  const templateUsage = new Map<number, Set<number>>()
  for (const form of catalog.forms) {
    if (!form.templateId || !form.submoduleId) continue

    if (!templateUsage.has(form.templateId)) {
      templateUsage.set(form.templateId, new Set())
    }

    templateUsage.get(form.templateId)?.add(form.submoduleId)
  }

  const templates = templatesSubmoduleId
    ? catalog.templates.filter((template) =>
        templateUsage.get(template.id)?.has(Number(templatesSubmoduleId))
      )
    : catalog.templates

  const publishedCount = catalog.forms.filter((form) => form.published).length
  const draftCount = catalog.forms.length - publishedCount

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
                {new Date().toLocaleString('fa-IR')}
              </span>
            </div>
            <p className="text-muted-foreground">
              فرم‌ها و قالب‌ها جدا شده‌اند تا مدیریت هر بخش شفاف‌تر باشد.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <CreateFormButton options={setupOptions} />
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/submodule">فرم‌های زیرماژول‌ها</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/form-builder/modules">زیرماژول و قالب‌ها</Link>
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
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
                  <CardDescription>خلاصه فرم‌های فعال و پیش‌نویس</CardDescription>
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
              <Card className="border-border/60 bg-card/90 rounded-lg border shadow-sm backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    میانبرها
                  </CardTitle>
                  <CardDescription>
                    دسترسی سریع به اقدامات پرکاربرد
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>فرم‌ها را به زیرماژول و قالب وصل کنید.</p>
                  <p>قالب‌ها از فرم‌های موجود ساخته می‌شوند.</p>
                </CardContent>
              </Card>
            </div>
          </header>
        </div>

        <StatsCards loading={false} data={stats} />

        <Separator />

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-foreground text-2xl font-bold">قالب‌ها</h2>
              <p className="text-muted-foreground text-sm">
                {templates.length.toLocaleString('fa-IR')} قالب در این نما
              </p>
            </div>
            <FormBuilderFilters
              submodules={catalog.submodules}
              scope="templates"
              value={templatesSubmoduleId}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TemplateCards
              templates={templates}
              forms={catalog.forms}
              submodules={catalog.submodules}
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-foreground text-2xl font-bold">فرم‌ها</h2>
              <p className="text-muted-foreground text-sm">
                {forms.length.toLocaleString('fa-IR')} فرم در این نما
              </p>
            </div>
            <FormBuilderFilters
              submodules={catalog.submodules}
              scope="forms"
              value={formsSubmoduleId}
            />
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

      {forms.length === 0 ? (
        <Card className="border-border/70 bg-card/90 rounded-lg border shadow-sm backdrop-blur md:col-span-2 lg:col-span-3">
          <CardContent className="text-muted-foreground flex min-h-40 items-center justify-center text-sm">
            فرم مطابق این فیلتر پیدا نشد.
          </CardContent>
        </Card>
      ) : (
        forms.map((form) => <FormCard key={form.id} form={form} />)
      )}
    </>
  )
}

function FormCard({ form }: { form: Forms[number] }) {
  return (
    <Card className="border-border/70 bg-card/90 rounded-lg border shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="truncate font-bold">{form.name}</span>
          {form.published ? (
            <Badge>منتشر شده</Badge>
          ) : (
            <Badge variant="destructive">پیش‌نویس</Badge>
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
          {form.submoduleName && (
            <Badge variant="outline">{form.submoduleName}</Badge>
          )}
          {form.templateName && (
            <Badge variant="outline">قالب: {form.templateName}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="text-md flex-1 gap-2">
          <Link href={`/form-builder/builder/${form.id}`}>
            ویرایش <FaEdit />
          </Link>
        </Button>
        <Button asChild className="text-md flex-1 gap-2">
          <Link href={`/form-builder/forms/${form.id}`}>
            پاسخ‌ها <LuView />
          </Link>
        </Button>
        <Button asChild variant="outline" className="text-md flex-1 gap-2">
          <Link href={`/form-builder/submit/${form.id}`}>
            ثبت فرم <FaWpforms />
          </Link>
        </Button>
        <DeleteRecordButton kind="form" id={form.id} name={form.name} />
      </CardFooter>
    </Card>
  )
}

function TemplateCards({
  templates,
  forms,
  submodules,
}: {
  templates: Templates
  forms: Forms
  submodules: Catalog['submodules']
}) {
  const submoduleMap = new Map(submodules.map((item) => [item.id, item.name]))
  const usageMap = new Map<number, Set<number>>()

  for (const form of forms) {
    if (!form.templateId || !form.submoduleId) continue

    if (!usageMap.has(form.templateId)) {
      usageMap.set(form.templateId, new Set())
    }

    usageMap.get(form.templateId)?.add(form.submoduleId)
  }

  return (
    <>
      <Card className="border-border/70 bg-card/90 rounded-lg border border-dashed shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Layers3 className="text-primary size-5" />
            مدیریت قالب‌ها
          </CardTitle>
          <CardDescription>
            قالب‌ها از فرم‌های موجود ساخته و در کاتالوگ نگه‌داری می‌شوند.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          برای ساخت یا ویرایش قالب‌ها به صفحه کاتالوگ قالب‌ها بروید.
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/form-builder/modules">رفتن به قالب‌ها</Link>
          </Button>
        </CardFooter>
      </Card>

      {templates.length === 0 ? (
        <Card className="border-border/70 bg-card/90 rounded-lg border shadow-sm backdrop-blur md:col-span-2 lg:col-span-3">
          <CardContent className="text-muted-foreground flex min-h-40 items-center justify-center text-sm">
            قالب مطابق این فیلتر پیدا نشد.
          </CardContent>
        </Card>
      ) : (
        templates.map((template) => {
          const submoduleIds = [...(usageMap.get(template.id) ?? [])]
          const submoduleNames = submoduleIds
            .map((id) => submoduleMap.get(id))
            .filter((name): name is string => Boolean(name))

          return (
            <Card
              key={template.id}
              className="border-border/70 bg-card/90 rounded-lg border shadow-sm backdrop-blur"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="truncate font-bold">{template.name}</span>
                  <Badge>
                    نسخه {template.currentVersion.toLocaleString('fa-IR')}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-muted-foreground flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{template.slug}</span>
                  <span className="text-xs">
                    {template.updatedAt.toLocaleDateString('fa-IR')}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2 text-sm">
                <p className="truncate">
                  {template.description || 'توضیحی ثبت نشده است'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {template._count.forms.toLocaleString('fa-IR')} فرم
                  </Badge>
                  <Badge variant="outline">
                    {template._count.versions.toLocaleString('fa-IR')} نسخه
                  </Badge>
                  {submoduleNames.length > 0 ? (
                    submoduleNames.map((name) => (
                      <Badge key={name} variant="outline">
                        {name}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">بدون استفاده</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <DeleteRecordButton
                  kind="template"
                  id={template.id}
                  name={template.name}
                />
              </CardFooter>
            </Card>
          )
        })
      )}
    </>
  )
}
