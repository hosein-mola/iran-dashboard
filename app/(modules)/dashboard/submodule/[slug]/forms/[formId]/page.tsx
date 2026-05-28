import Link from 'next/link'

import { GetSubmoduleFormSubmissions } from '@/actions/form'
import FormSubmissionsGrid from '@/components/FormSubmissionsGrid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function SubmoduleFormSubmissionsPage(props: {
  params: Promise<{ slug: string; formId: string }>
}) {
  const params = await props.params
  const form = await GetSubmoduleFormSubmissions(
    params.slug,
    Number(params.formId)
  )

  if (!form) {
    throw new Error('form not found')
  }

  return (
    <section className="space-y-6 p-4">
      <header className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              {form.submodule?.name} / داشبورد سابمیشن
            </p>
            <h1 className="text-3xl font-bold">{form.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">
                نسخه جاری {form.currentVersion.toLocaleString('fa-IR')}
              </Badge>
              <Badge variant="outline">
                {form.submissionRows.length.toLocaleString('fa-IR')} ردیف
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/submodule/${params.slug}`}>بازگشت</Link>
            </Button>
          </div>
        </div>
      </header>

      <FormSubmissionsGrid rows={form.submissionRows} />
    </section>
  )
}
