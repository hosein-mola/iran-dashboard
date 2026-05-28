'use client'

import { useMemo, useState, useTransition } from 'react'
import { evaluate } from 'mathjs'
import { Calculator, Plus, Save, Trash2 } from 'lucide-react'
import { FaSpinner } from 'react-icons/fa'

import { FormEventRuleInput, SaveFormEvents } from '@/actions/form'
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

function getFieldKey(element: any) {
  return String(element.extraAttributes?.name || element.id)
}

export default function FormEventsEditor({
  formId,
  initialEvents,
}: {
  formId: number
  initialEvents: FormEventRuleInput[]
}) {
  const { elements } = useDesigner()
  const [pending, startTransition] = useTransition()
  const fields = useMemo(
    () =>
      elements
        .filter((element) => element.type === 'text')
        .map((element) => ({
          id: element.id,
          key: getFieldKey(element),
          label: element.extraAttributes?.label || getFieldKey(element),
        })),
    [elements]
  )
  const [events, setEvents] = useState<FormEventRuleInput[]>(
    initialEvents?.length ? initialEvents : []
  )
  const [sampleScope, setSampleScope] = useState<Record<string, number>>({})
  const [testResult, setTestResult] = useState<string>('')

  const addEvent = () => {
    setEvents((current) => [
      ...current,
      {
        name: `محاسبه ${current.length + 1}`,
        sourceField: fields[0]?.key || '',
        targetField: fields[1]?.key || fields[0]?.key || '',
        expression: fields[0]?.key || '',
        trigger: 'change',
        enabled: true,
      },
    ])
  }

  const updateEvent = (
    index: number,
    patch: Partial<FormEventRuleInput>
  ) => {
    setEvents((current) =>
      current.map((event, eventIndex) =>
        eventIndex === index ? { ...event, ...patch } : event
      )
    )
  }

  const deleteEvent = (index: number) => {
    setEvents((current) =>
      current.filter((_, eventIndex) => eventIndex !== index)
    )
  }

  const saveEvents = () => {
    startTransition(async () => {
      try {
        await SaveFormEvents(formId, events)
        toast({
          title: 'عبارات ذخیره شد',
          description: 'قوانین محاسباتی در نسخه جدید فرم ذخیره شدند.',
        })
      } catch (error) {
        toast({
          title: 'خطا',
          description: 'ذخیره قوانین محاسباتی انجام نشد.',
          variant: 'destructive',
        })
      }
    })
  }

  const testEvent = (event: FormEventRuleInput) => {
    try {
      const result = evaluate(event.expression || '0', sampleScope)
      setTestResult(String(result))
    } catch (error) {
      setTestResult('خطا در عبارت')
    }
  }

  return (
    <section className="bg-background flex h-full w-full flex-col overflow-hidden border-r">
      <header className="flex min-h-16 items-center justify-between border-b px-4">
        <div>
          <h2 className="text-base font-semibold">رویدادهای محاسباتی فرم</h2>
          <p className="text-muted-foreground text-xs">
            عبارات mathjs روی تغییر مقدار فیلدها اجرا و مقدار فیلد هدف را به‌روز
            می‌کنند.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addEvent}>
            <Plus className="size-4" />
            رویداد
          </Button>
          <Button disabled={pending} onClick={saveEvents}>
            <Save className="size-4" />
            ذخیره
            {pending && <FaSpinner className="size-4 animate-spin" />}
          </Button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_320px] overflow-hidden">
        <div className="space-y-3 overflow-y-auto p-4">
          {events.length === 0 && (
            <div className="border-border text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed text-sm">
              هنوز رویدادی تعریف نشده است.
            </div>
          )}

          {events.map((event, index) => (
            <div
              key={`${event.targetField}-${index}`}
              className="border-border bg-card grid gap-4 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <Input
                  value={event.name || ''}
                  onChange={(inputEvent) =>
                    updateEvent(index, { name: inputEvent.target.value })
                  }
                  placeholder="نام رویداد"
                />
                <div className="flex items-center gap-2">
                  <Switch
                    checked={event.enabled !== false}
                    onCheckedChange={(enabled) =>
                      updateEvent(index, { enabled })
                    }
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => deleteEvent(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>فیلد محرک</Label>
                  <Select
                    value={event.sourceField || ''}
                    onValueChange={(value) =>
                      updateEvent(index, { sourceField: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب فیلد" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((field) => (
                        <SelectItem key={field.id} value={field.key}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>فیلد هدف</Label>
                  <Select
                    value={event.targetField || ''}
                    onValueChange={(value) =>
                      updateEvent(index, { targetField: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب فیلد" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((field) => (
                        <SelectItem key={field.id} value={field.key}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>عبارت mathjs</Label>
                <Textarea
                  dir="ltr"
                  value={event.expression || ''}
                  onChange={(inputEvent) =>
                    updateEvent(index, { expression: inputEvent.target.value })
                  }
                  placeholder="fieldA + fieldB * 0.1"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => testEvent(event)}
                  className="gap-2"
                >
                  <Calculator className="size-4" />
                  تست
                </Button>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-muted/30 space-y-4 overflow-y-auto border-r p-4">
          <div>
            <h3 className="text-sm font-semibold">مقادیر تست</h3>
            <p className="text-muted-foreground text-xs">
              برای تست عبارت‌ها مقدار نمونه وارد کنید.
            </p>
          </div>
          {fields.map((field) => (
            <div key={field.id} className="grid gap-1">
              <Label>{field.label}</Label>
              <Input
                dir="ltr"
                type="number"
                value={sampleScope[field.key] ?? ''}
                onChange={(event) =>
                  setSampleScope((current) => ({
                    ...current,
                    [field.key]: Number(event.target.value || 0),
                  }))
                }
              />
            </div>
          ))}
          <div className="border-border bg-card rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">نتیجه تست</p>
            <p dir="ltr" className="mt-1 font-mono text-sm">
              {testResult || '-'}
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
