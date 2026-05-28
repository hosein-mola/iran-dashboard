import Link from 'next/link'
import { formatDistance } from 'date-fns'
import { FaEdit, FaWpforms } from 'react-icons/fa'
import { LuView } from 'react-icons/lu'
import { Plus } from 'lucide-react'

import { GetFormModuleCatalog } from '@/actions/form'
import DeleteRecordButton from '@/components/DeleteRecordButton'
import FormBuilderFilters from '@/components/FormBuilderFilters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

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

export default async function FormsIndexPage(props: {
  searchParams?: Promise<{ formsSubmodule?: string | string[] }>
}) {
  const searchParams = (await props.searchParams) ?? {}
  const catalog = await GetFormModuleCatalog()
  const formsSubmoduleId = readSearchParam(searchParams.formsSubmodule)

  const forms = formsSubmoduleId
    ? catalog.forms.filter(
        (form) => String(form.submoduleId ?? '') === formsSubmoduleId
      )
    : catalog.forms

  return (
    <section className="space-y-6 py-4">
      <header className="space-y-4 rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">لیست فرم‌ها</p>
            <h1 className="text-3xl font-bold">مدیریت فرم‌ها</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/form-builder">
              <Plus className="size-4" />
              فرم‌ساز
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          فرم‌ها را بر اساس زیرماژول بررسی، ویرایش یا حذف کنید.
        </p>
        <FormBuilderFilters
          submodules={catalog.submodules}
          scope="forms"
          value={formsSubmoduleId}
        />
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {forms.length === 0 ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="text-muted-foreground flex min-h-40 items-center justify-center text-sm">
              فرم مطابق این فیلتر پیدا نشد.
            </CardContent>
          </Card>
        ) : (
          forms.map((form) => (
            <Card key={form.id} className="border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="truncate">{form.name}</span>
                  {form.published ? (
                    <Badge>منتشر شده</Badge>
                  ) : (
                    <Badge variant="destructive">پیش‌نویس</Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center justify-between gap-3 text-sm">
                  <span>{formatDistance(form.createdAt, new Date(), { addSuffix: true })}</span>
                  <span className="flex items-center gap-2">
                    <LuView className="text-muted-foreground" />
                    <span>{form.visit.toLocaleString('fa-IR')}</span>
                    <FaWpforms className="text-muted-foreground" />
                    <span>{form.submission.toLocaleString('fa-IR')}</span>
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
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
                <Button asChild variant="outline" className="flex-1 gap-2">
                  <Link href={`/form-builder/builder/${form.id}`}>
                    ویرایش <FaEdit />
                  </Link>
                </Button>
                <Button asChild className="flex-1 gap-2">
                  <Link href={`/form-builder/forms/${form.id}`}>پاسخ‌ها</Link>
                </Button>
                <DeleteRecordButton kind="form" id={form.id} name={form.name} />
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </section>
  )
}
