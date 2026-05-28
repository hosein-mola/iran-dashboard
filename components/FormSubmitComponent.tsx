'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { evaluate } from 'mathjs'
import Confetti from 'react-confetti'
import { TbBrandSublimeText } from 'react-icons/tb'
import { ImSpinner } from 'react-icons/im'
import { ulid } from 'ulid'
import { useForm, useWatch } from 'react-hook-form'

import { SubmitForm } from '@/actions/form'
import { PageType } from '@/components/context/DesignerContext'
import useDesigner from '@/components/hooks/useDesigner'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { FormElementInstance, FormElements } from '@/types/element-type'
import { useTheme } from './providers/ThemeProvider'

type FormRuntimeEvent = {
  name?: string
  sourceField?: string | null
  targetField: string
  expression: string
  enabled?: boolean
}

function getRuntimePages(form: any): PageType[] {
  if (Array.isArray(form.page)) return form.page
  if (form.page?.id) {
    return [
      {
        id: form.page.id,
        index: 1,
        name: 'Preview',
      },
    ]
  }
  return [{ id: 'page-1', index: 1, name: 'Page-1' }]
}

function toMathValue(value: unknown) {
  if (typeof value === 'string') {
    const numericValue = Number(value.replaceAll(',', ''))
    return Number.isFinite(numericValue) && value.trim() !== ''
      ? numericValue
      : value
  }

  return value
}

function buildScope(values: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, toMathValue(value)])
  )
}

function FormSubmitComponent({
  formId,
  form,
  type,
  setData,
}: {
  formId: number
  form: any
  type: string
  setData?: (data: any) => void
}) {
  const {
    elements,
    setElements,
    pages,
    setPages,
    selectedPage,
    setSelectedPage,
  } = useDesigner()
  const [renderkey] = useState(ulid(10))
  const [submitted, setSubmitted] = useState(false)
  const [pending, startTransition] = useTransition()
  const formController = useForm({
    mode: 'onChange',
  })
  const watchedValues = useWatch({ control: formController.control })
  const theme = useTheme()

  const runtimePages = useMemo(() => getRuntimePages(form), [form])
  const runtimeEvents = useMemo<FormRuntimeEvent[]>(
    () => form.events || form.eventConfig || [],
    [form]
  )

  useEffect(() => {
    setData?.(formController)
  }, [formController, setData])

  useEffect(() => {
    if (type === 'preview') return

    setElements([...(form.components || [])])
    setPages(runtimePages)
    setSelectedPage(runtimePages[0])
  }, [form.components, runtimePages, setElements, setPages, setSelectedPage, type])

  useEffect(() => {
    if (!runtimeEvents.length) return

    const scope = buildScope(watchedValues || {})

    runtimeEvents
      .filter((event) => event.enabled !== false)
      .forEach((event) => {
        try {
          const result = evaluate(event.expression, scope)
          const currentValue = formController.getValues(event.targetField)

          if (String(currentValue ?? '') !== String(result ?? '')) {
            formController.setValue(event.targetField, result, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        } catch {
          return
        }
      })
  }, [formController, runtimeEvents, watchedValues])

  const submitForm = async (data: Record<string, unknown>) => {
    try {
      await SubmitForm(formId, data)
      setSubmitted(true)
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'ثبت فرم انجام نشد.',
        variant: 'destructive',
      })
    }
  }

  const showValidationErrors = () => {
    toast({
      title: 'خطای اعتبارسنجی',
      description: 'فیلدهای مشخص‌شده را اصلاح کنید.',
      variant: 'destructive',
    })
  }

  const visibleElements = elements
    .filter(
      (_element) =>
        _element.parentId == null && _element.page == selectedPage.id
    )
    .sort((a: FormElementInstance, b: FormElementInstance) => a.index - b.index)

  if (submitted) {
    return (
      <div className="flex h-full w-full flex-1 flex-grow items-center justify-center p-8">
        <Confetti recycle={false} numberOfPieces={1000} />
        <div className="bg-background flex w-full max-w-[620px] flex-grow flex-col gap-4 overflow-y-auto rounded border p-8 shadow">
          <h1 className="text-2xl font-bold">فرم ثبت شد</h1>
          <p className="text-muted-foreground">
            پاسخ شما با نسخه فعلی فرم ذخیره شد.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      className={cn(
        'flex h-full w-full items-start border',
        `nord:bg-red-500 bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]`,
        theme.theme == 'wood' && 'bg-[url(/paper-dark.svg)]'
      )}
    >
      <div
        key={renderkey}
        className="bg-background flex w-full flex-grow flex-col overflow-y-auto rounded-none border-none shadow-none"
      >
        {type !== 'preview' && pages.length > 1 && (
          <div className="flex items-center justify-center gap-2 border-b p-3">
            {pages.map((page) => (
              <Button
                key={page.id}
                type="button"
                size="sm"
                variant={page.id === selectedPage.id ? 'default' : 'outline'}
                onClick={() => setSelectedPage(page)}
              >
                {page.name}
              </Button>
            ))}
          </div>
        )}

        <div className="flex w-full flex-grow flex-col items-center justify-center overflow-y-auto">
          <div className="bg-background w-full overflow-y-auto p-2">
            {visibleElements.map((element) => {
              const FormComponent = FormElements[element.type].formComponent
              return (
                <FormComponent
                  key={element.id + element.parentId}
                  formController={formController}
                  elementInstance={element}
                />
              )
            })}
          </div>
        </div>
        {type !== 'preview' && (
          <Button
            type="button"
            disabled={pending}
            className="flex w-full flex-row items-center justify-center"
            onClick={() =>
              startTransition(() => {
                formController.handleSubmit(submitForm, showValidationErrors)()
              })
            }
          >
            {!pending && (
              <div className="flex flex-row gap-2">
                <TbBrandSublimeText className="h-4 w-4" />
                ثبت فرم
              </div>
            )}
            {pending && <ImSpinner className="animate-spin" />}
          </Button>
        )}
      </div>
    </form>
  )
}

export default FormSubmitComponent
