'use client'

import * as React from 'react'
import {
  CheckCircle2,
  Copy,
  Database,
  Loader2,
  PlugZap,
  Save,
  Trash2,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

type DbConnection = {
  id: string
  code: string
  name: string
  description: string
  provider: string
  active: boolean
  connectionStringPreview: string
  lastTestAt: string | null
  lastTestOk: boolean | null
  lastTestMessage: string | null
  updatedAt: string
}

type FormState = {
  code: string
  name: string
  description: string
  connectionString: string
  active: boolean
}

const emptyForm: FormState = {
  code: '',
  name: '',
  description: '',
  connectionString: '',
  active: true,
}

const apiBase = '/api/process/deno-worker/api/process/data/connections'

export default function DataConnectionsPage() {
  const [connections, setConnections] = React.useState<DbConnection[]>([])
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [editingCode, setEditingCode] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [testing, setTesting] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState<string>('')

  const loadConnections = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(apiBase, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || 'خطا در دریافت اتصال‌ها')
      setConnections(data.connections ?? [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'خطای ناشناخته')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadConnections()
  }, [loadConnections])

  async function saveConnection() {
    setSaving(true)
    setMessage('')
    try {
      const isEdit = Boolean(editingCode)
      const payload: Partial<FormState> = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        active: form.active,
      }
      if (!isEdit || form.connectionString.trim()) {
        payload.connectionString = form.connectionString.trim()
      }
      const res = await fetch(isEdit ? `${apiBase}/${editingCode}` : apiBase, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || 'ذخیره انجام نشد')
      setMessage('اتصال با موفقیت ذخیره شد.')
      setForm(emptyForm)
      setEditingCode(null)
      await loadConnections()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'خطای ناشناخته')
    } finally {
      setSaving(false)
    }
  }

  async function testConnection(code?: string) {
    setTesting(code ?? 'draft')
    setMessage('')
    try {
      const res = await fetch(code ? `${apiBase}/${code}/test` : `${apiBase}/test`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: code
          ? '{}'
          : JSON.stringify({ connectionString: form.connectionString.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || data?.error?.message || 'تست اتصال ناموفق بود')
      setMessage(`تست اتصال موفق بود. زمان پاسخ: ${data.durationMs ?? 0}ms`)
      if (code) await loadConnections()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'خطای ناشناخته')
    } finally {
      setTesting(null)
    }
  }

  async function deleteConnection(code: string) {
    setTesting(code)
    setMessage('')
    try {
      const res = await fetch(`${apiBase}/${code}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || 'حذف انجام نشد')
      setMessage('اتصال حذف شد.')
      await loadConnections()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'خطای ناشناخته')
    } finally {
      setTesting(null)
    }
  }

  function editConnection(connection: DbConnection) {
    setEditingCode(connection.code)
    setForm({
      code: connection.code,
      name: connection.name,
      description: connection.description,
      connectionString: '',
      active: connection.active,
    })
    setMessage('برای ویرایش، Connection String را دوباره وارد کنید.')
  }

  const usage = `const result = await api.db.query(
  '${form.code || 'mainDb'}',
  'SELECT TOP (10) * FROM dbo.Users WHERE IsActive = @isActive',
  { isActive: true }
)`

  return (
    <div className="relative flex min-h-screen flex-1 flex-col gap-5 overflow-y-auto px-4 py-4" dir="rtl">
      <div className="from-background via-background to-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br" />
      <div className="relative z-10 grid gap-5 xl:grid-cols-[minmax(22rem,28rem)_1fr]">
        <header className="border-border/60 bg-card/95 rounded-lg border p-4 shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-sm">ماژول داده</p>
              <h1 className="text-2xl font-bold">مدیریت Connection String</h1>
            </div>
            <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-lg">
              <Database className="size-5" />
            </div>
          </div>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
            اتصال‌ها با یک کد خوانا ذخیره می‌شوند و داخل Deno Worker با همان کد
            قابل استفاده هستند؛ مقدار اصلی Connection String در لیست نمایش داده
            نمی‌شود.
          </p>
        </header>

        <Card className="border-border/60 bg-card/95 rounded-lg border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingCode ? 'ویرایش اتصال' : 'ثبت اتصال جدید'}
            </CardTitle>
            <CardDescription>
              کد اتصال را کوتاه، پایدار و بدون فاصله انتخاب کنید.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="code">کد اتصال</Label>
              <Input
                id="code"
                dir="ltr"
                disabled={Boolean(editingCode)}
                value={form.code}
                placeholder="mainDb"
                onChange={(event) => setForm({ ...form, code: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">عنوان</Label>
              <Input
                id="name"
                value={form.name}
                placeholder="پایگاه داده اصلی"
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="connectionString">Connection String</Label>
              <Textarea
                id="connectionString"
                dir="ltr"
                className="min-h-28 resize-y text-left font-mono text-xs"
                value={form.connectionString}
                placeholder="Server=...;Database=...;User Id=...;Password=...;Encrypt=False;TrustServerCertificate=True;"
                onChange={(event) =>
                  setForm({ ...form, connectionString: event.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">توضیح</Label>
              <Textarea
                id="description"
                value={form.description}
                className="min-h-20"
                placeholder="کاربرد این اتصال در اجرای کدها"
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </div>
            <div className="border-border/60 flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">فعال</p>
                <p className="text-muted-foreground text-xs">اتصال غیرفعال در Worker اجرا نمی‌شود.</p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => setForm({ ...form, active: checked })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!form.connectionString || testing === 'draft'}
                onClick={() => testConnection()}
              >
                {testing === 'draft' ? <Loader2 className="size-4 animate-spin" /> : <PlugZap className="size-4" />}
                تست اتصال
              </Button>
              <Button type="button" disabled={saving} onClick={saveConnection}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                ذخیره
              </Button>
            </div>
            {editingCode ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setEditingCode(null)
                  setForm(emptyForm)
                  setMessage('')
                }}
              >
                انصراف از ویرایش
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-border/60 bg-card/95 rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">اتصال‌های ثبت‌شده</CardTitle>
              <CardDescription>
                برای اجرای کد از مقدار ستون کد استفاده کنید.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {message ? (
                <div className="border-border/60 bg-muted/40 rounded-lg border px-3 py-2 text-sm">
                  {message}
                </div>
              ) : null}
              {loading ? (
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Loader2 className="size-4 animate-spin" />
                  در حال دریافت اطلاعات
                </div>
              ) : connections.length === 0 ? (
                <div className="border-border/60 bg-muted/30 rounded-lg border p-6 text-center text-sm text-muted-foreground">
                  هنوز اتصالی ثبت نشده است.
                </div>
              ) : (
                <div className="grid gap-3">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="border-border/60 bg-background/60 rounded-lg border p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">{connection.name}</span>
                            <code className="bg-muted rounded px-2 py-1 text-xs" dir="ltr">
                              {connection.code}
                            </code>
                            {connection.active ? (
                              <span className="text-emerald-600 text-xs">فعال</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">غیرفعال</span>
                            )}
                          </div>
                          <p className="text-muted-foreground break-words text-xs">
                            {connection.description || 'بدون توضیح'}
                          </p>
                          <p className="text-muted-foreground break-all text-left font-mono text-xs" dir="ltr">
                            {connection.connectionStringPreview}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testConnection(connection.code)}
                            disabled={testing === connection.code}
                          >
                            {testing === connection.code ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <PlugZap className="size-4" />
                            )}
                            تست
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => editConnection(connection)}>
                            ویرایش
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteConnection(connection.code)}
                            disabled={testing === connection.code}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {connection.lastTestOk === true ? (
                          <CheckCircle2 className="size-4 text-emerald-600" />
                        ) : connection.lastTestOk === false ? (
                          <XCircle className="size-4 text-destructive" />
                        ) : null}
                        <span>{connection.lastTestMessage || 'تستی ثبت نشده است.'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/95 rounded-lg border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">استفاده داخل Deno Worker</CardTitle>
              <CardDescription>
                روش پیشنهادی استفاده از کد اتصال است، نه ارسال Connection String خام.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <pre className="bg-muted/70 overflow-x-auto rounded-lg p-3 text-left text-xs" dir="ltr">
                <code>{usage}</code>
              </pre>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigator.clipboard?.writeText(usage)}
              >
                <Copy className="size-4" />
                کپی نمونه
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
