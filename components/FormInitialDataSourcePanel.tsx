'use client'

import { useMemo, useState, useTransition } from 'react'
import { Database, FlaskConical, Save } from 'lucide-react'
import { FaSpinner } from 'react-icons/fa'

import {
  FormInitialDataSourceInput,
  SaveFormInitialDataSource,
  TestFormInitialDataSource,
} from '@/actions/form'
import useDesigner from '@/components/hooks/useDesigner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

function parseJsonObject(value: string, fallback: Record<string, string>) {
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : fallback
  } catch {
    return fallback
  }
}

function formatJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2)
}

function getFieldName(element: any) {
  return String(element.extraAttributes?.name || element.id)
}

const sampleDataSourcePreset = {
  url: '/api/form-builder/sample-initial-data?resourceId={resourceId}',
  dataPath: 'data.item',
  testParams: '{\n  "resourceId": "7"\n}',
}

type FormInitialDataSourcePanelProps = {
  form: {
    id: number
    initialDataSource?: FormInitialDataSourceInput
  }
  onSaved: (form: any) => void
}

export default function FormInitialDataSourcePanel({
  form,
  onSaved,
}: FormInitialDataSourcePanelProps) {
  const { elements } = useDesigner()
  const [pending, startTransition] = useTransition()
  const config = form.initialDataSource
  const [enabled, setEnabled] = useState(config?.enabled ?? false)
  const [url, setUrl] = useState(
    config?.url ??
      '/api/form-builder/sample-initial-data?resourceId={resourceId}'
  )
  const [method, setMethod] = useState<'GET' | 'POST'>(config?.method ?? 'GET')
  const [headers, setHeaders] = useState(formatJson(config?.headers ?? {}))
  const [body, setBody] = useState(config?.body ?? '')
  const [dataPath, setDataPath] = useState(config?.dataPath ?? '')
  const [mapping, setMapping] = useState(formatJson(config?.mapping ?? {}))
  const [testParams, setTestParams] = useState('{\n  "resourceId": "7"\n}')
  const [testResult, setTestResult] = useState<{
    ok: boolean
    error?: string
    status?: number
    data: unknown
    raw: unknown
  } | null>(null)

  const fields = useMemo(
    () =>
      elements.map((element) => ({
        id: element.id,
        name: getFieldName(element),
        label: element.extraAttributes?.label || getFieldName(element),
      })),
    [elements]
  )

  const save = () => {
    const headersObject = parseJsonObject(headers, {})
    const mappingObject = parseJsonObject(mapping, {})

    startTransition(async () => {
      try {
        const updatedForm = await SaveFormInitialDataSource(form.id, {
          enabled,
          url,
          method,
          headers: headersObject,
          body,
          dataPath,
          mapping: mappingObject,
        })
        onSaved(updatedForm)
        toast({
          title: 'منبع داده ذخیره شد',
          description: 'داده اولیه فرم در زمان اجرای فرم دریافت می‌شود.',
        })
      } catch {
        toast({
          title: 'خطا',
          description: 'ذخیره منبع داده انجام نشد.',
          variant: 'destructive',
        })
      }
    })
  }

  const applySamplePreset = () => {
    setEnabled(true)
    setMethod('GET')
    setUrl(sampleDataSourcePreset.url)
    setDataPath(sampleDataSourcePreset.dataPath)
    setTestParams(sampleDataSourcePreset.testParams)
    setHeaders('{}')
    setBody('')
    setMapping(
      formatJson({
        damName: 'name',
        waterLevel: 'metrics.level',
        volume: 'metrics.volume',
        inflow: 'metrics.inflow',
        outflow: 'metrics.outflow',
      })
    )
    setTestResult(null)
  }

  const test = () => {
    const headersObject = parseJsonObject(headers, {})
    const mappingObject = parseJsonObject(mapping, {})
    const paramsObject = parseJsonObject(testParams, {})

    startTransition(async () => {
      const result = await TestFormInitialDataSource(
        {
          enabled,
          url,
          method,
          headers: headersObject,
          body,
          dataPath,
          mapping: mappingObject,
        },
        paramsObject
      )

      setTestResult(result)
      if (result.ok && result.data && typeof result.data === 'object') {
        onSaved({
          ...form,
          previewInitialData: result.data as Record<string, unknown>,
        })
      }
    })
  }

  return (
    <section
      dir="rtl"
      className="bg-background flex h-full w-full flex-col overflow-hidden border-r"
    >
      <header className="flex min-h-16 items-center justify-between border-b px-4">
        <div>
          <h2 className="text-base font-semibold">داده اولیه زمان اجرا</h2>
          <p className="text-muted-foreground text-xs">
            داده از منبع خارجی خوانده و قبل از نمایش فرم روی فیلدها اعمال
            می‌شود.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={pending}
            variant="outline"
            onClick={applySamplePreset}
          >
            نمونه
          </Button>
          <Button disabled={pending} variant="outline" onClick={test}>
            <FlaskConical className="size-4" />
            تست
            {pending && <FaSpinner className="size-4 animate-spin" />}
          </Button>
          <Button disabled={pending} onClick={save}>
            <Save className="size-4" />
            ذخیره
            {pending && <FaSpinner className="size-4 animate-spin" />}
          </Button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_320px] overflow-hidden">
        <div className="space-y-4 overflow-y-auto p-4">
          <div className="border-border bg-card grid gap-4 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">اتصال HTTP</h3>
                <p className="text-muted-foreground text-xs">
                  داخل URL و بدنه می‌توانید از پارامترهای مسیر با قالب {'{id}'}
                  استفاده کنید.
                </p>
              </div>
              <div dir="ltr" className="flex items-center gap-2">
                <Label>فعال</Label>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[140px_minmax(0,1fr)]">
              <div className="grid gap-2">
                <Label>روش</Label>
                <Select
                  value={method}
                  onValueChange={(value) => setMethod(value as 'GET' | 'POST')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>آدرس منبع داده</Label>
                <Input
                  dir="ltr"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="/api/form-builder/sample-initial-data?resourceId={resourceId}"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>مسیر داده در پاسخ</Label>
              <Input
                dir="ltr"
                value={dataPath}
                onChange={(event) => setDataPath(event.target.value)}
                placeholder="data.item"
              />
            </div>

            <div className="grid gap-2">
              <Label>Headers JSON</Label>
              <Textarea
                dir="ltr"
                value={headers}
                onChange={(event) => setHeaders(event.target.value)}
                className="min-h-28 font-mono"
              />
            </div>

            {method === 'POST' && (
              <div className="grid gap-2">
                <Label>Body</Label>
                <Textarea
                  dir="ltr"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  className="min-h-28 font-mono"
                  placeholder='{"id":"{resourceId}"}'
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label>نگاشت فیلدها JSON</Label>
              <Textarea
                dir="ltr"
                value={mapping}
                onChange={(event) => setMapping(event.target.value)}
                className="min-h-36 font-mono"
                placeholder='{"fieldName":"source.path"}'
              />
            </div>

            <div className="grid gap-2">
              <Label>پارامترهای تست JSON</Label>
              <Textarea
                dir="ltr"
                value={testParams}
                onChange={(event) => setTestParams(event.target.value)}
                className="min-h-24 font-mono"
              />
            </div>
          </div>

          {testResult && (
            <div
              dir="ltr"
              className={`grid gap-3 rounded-lg border p-4 ${
                testResult.ok
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-destructive/50 bg-destructive/5'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">
                  {testResult.ok ? 'نتیجه تست' : 'خطای تست'}
                </h3>
                {testResult.status && (
                  <span className="text-muted-foreground text-xs">
                    HTTP {testResult.status}
                  </span>
                )}
              </div>
              {!testResult.ok && (
                <p className="text-destructive text-sm">{testResult.error}</p>
              )}
              <div className="grid gap-2">
                <Label>داده اعمال‌شده روی فرم</Label>
                <pre className="bg-background text-foreground max-h-56 overflow-auto rounded border p-3 text-xs">
                  {formatJson(testResult.data)}
                </pre>
              </div>
              <div className="grid gap-2">
                <Label>پاسخ خام</Label>
                <pre className="bg-background text-foreground max-h-56 overflow-auto rounded border p-3 text-xs">
                  {formatJson(testResult.raw)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <aside className="bg-muted/30 space-y-4 overflow-y-auto border-r p-4">
          <div>
            <h3 className="text-sm font-semibold">فیلدهای فرم</h3>
            <p className="text-muted-foreground text-xs">
              کلید سمت چپ نگاشت باید نام همین فیلدها باشد.
            </p>
          </div>

          <div className="border-border bg-card rounded-lg border p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Database className="size-4" />
              نمونه نگاشت
            </div>
            <pre className="text-muted-foreground overflow-x-auto text-xs">
              {formatJson(
                Object.fromEntries(
                  fields.slice(0, 4).map((field) => [field.name, field.name])
                )
              )}
            </pre>
          </div>

          <div className="space-y-2">
            {fields.map((field) => (
              <div
                key={field.id}
                className="border-border bg-card rounded-lg border p-2"
              >
                <p className="truncate text-sm font-medium">{field.label}</p>
                <p dir="ltr" className="text-muted-foreground truncate text-xs">
                  {field.name}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
