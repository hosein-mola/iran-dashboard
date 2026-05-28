'use client'

import { Clock3, RotateCcw } from 'lucide-react'

import RestoreFormVersionButton from '@/components/RestoreFormVersionButton'
import { Badge } from '@/components/ui/badge'

type FormVersionSummary = {
  id: number
  version: number
  name: string
  description?: string
  published?: boolean
  createdAt: Date | string
}

type FormVersionsPanelProps = {
  form: {
    id: number
    currentVersion: number
    versions?: FormVersionSummary[]
  }
  onRestored: (form: any) => void
}

export default function FormVersionsPanel({
  form,
  onRestored,
}: FormVersionsPanelProps) {
  const versions = form.versions ?? []

  return (
    <section className="bg-background flex h-full w-full flex-col overflow-hidden border-r">
      <header className="flex min-h-16 items-center justify-between border-b px-4">
        <div>
          <h2 className="text-base font-semibold">نسخه‌های فرم</h2>
          <p className="text-muted-foreground text-xs">
            هر ذخیره، تنظیمات یا رویداد یک نسخه جدید ثبت می‌کند.
          </p>
        </div>
        <RestoreFormVersionButton
          formId={form.id}
          currentVersion={form.currentVersion}
          versions={versions}
          onRestored={onRestored}
        />
      </header>

      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_320px] overflow-hidden">
        <div className="space-y-3 overflow-y-auto p-4">
          {versions.length === 0 ? (
            <div className="border-border text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed text-sm">
              هنوز نسخه‌ای برای این فرم ثبت نشده است.
            </div>
          ) : (
            versions.map((version) => {
              const isCurrent = version.version === form.currentVersion

              return (
                <div
                  key={version.id}
                  className="border-border bg-card grid gap-3 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">
                        نسخه {version.version.toLocaleString('fa-IR')} -{' '}
                        {version.name}
                      </h3>
                      <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                        <Clock3 className="size-3" />
                        {new Date(version.createdAt).toLocaleString('fa-IR')}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {isCurrent && <Badge>نسخه جاری</Badge>}
                      <Badge variant="outline">
                        {version.published ? 'منتشر شده' : 'پیش‌نویس'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground truncate text-sm">
                    {version.description || 'توضیحی ثبت نشده است'}
                  </p>
                </div>
              )
            })
          )}
        </div>

        <aside className="bg-muted/30 space-y-4 overflow-y-auto border-r p-4">
          <div>
            <h3 className="text-sm font-semibold">بازیابی نسخه</h3>
            <p className="text-muted-foreground text-xs">
              برای برگشت به یک نسخه قبلی، همان نسخه را انتخاب کنید. بازیابی به
              شکل نسخه جدید ذخیره می‌شود.
            </p>
          </div>
          <div className="border-border bg-card rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <RotateCcw className="size-4" />
              نسخه جاری
            </div>
            <p className="text-primary text-2xl font-bold">
              {form.currentVersion.toLocaleString('fa-IR')}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              تعداد نسخه‌ها: {versions.length.toLocaleString('fa-IR')}
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
