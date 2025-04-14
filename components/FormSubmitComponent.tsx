'use client'
import React, {
  ChangeEvent,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'
import { FormElementInstance, FormElements } from './FormElement'
import { Button } from './ui/button'
import { HiCursorClick } from 'react-icons/hi'
import { toast } from './ui/use-toast'
import { ulid } from 'ulid'
import { ImSpinner } from 'react-icons/im'
import { SubmitForm } from '@/actions/form'
import useDesigner from './hooks/useDesigner'
import { PageType } from './context/DesignerContext'
import { TbBrandSublimeText } from 'react-icons/tb'
import {
  atan2,
  chain,
  derivative,
  e,
  evaluate,
  log,
  pi,
  pow,
  round,
  sqrt,
} from 'mathjs'
import { useForm } from 'react-hook-form'
import Confetti from 'react-confetti'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

function FormSubmitComponent({
  formId,
  form,
  type,
  setData,
}: {
  formId: number
  form: Omit<FormElementInstance, 'page'> & {
    page: {
      id: string
      extraAttributes: string
    }
    components: FormElementInstance[]
  }
  type: string
  setData?: any
}) {
  const { setElements, setPages, setSelectedPage } = useDesigner()
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const formErrors = useRef<{ [key: string]: boolean }>({})
  const [renderkey, setRenderKey] = useState(ulid(10))
  const [submitted, setSubmitted] = useState(false)
  const [pending, transition] = useTransition()
  const { selectedPage } = useDesigner()
  const formController = useForm({
    mode: 'onChange',
    defaultValues: { itemOne: 1, itemTwo: 2 },
  })
  const theme = useTheme()

  useEffect(() => {
    setElements(form.components)
    const _pages = JSON.parse(form.page.extraAttributes)
    setPages(_pages)
    setSelectedPage(_pages[0])
    ;() => {
      setPages([])
      setElements([])
    }
    if (setData) {
      setData(formController)
    }
  }, [
    form.components,
    form.page.extraAttributes,
    formController,
    setData,
    setElements,
    setPages,
    setSelectedPage,
  ])

  const validateForm: () => boolean = useCallback(() => {
    for (const field of form.components) {
      const actualValue = formValues[field.id] || ''
      const valid = FormElements[field.type].validate(field, actualValue)
      if (!valid) {
        formErrors.current[field.id] = true
      }
    }
    if (Object.keys(formErrors.current).length > 0) {
      return false
    }
    return true
  }, [form.components, formValues])

  const submitForm = async (data: any) => {
    console.log('🚀 ~ submitForm ~ data:', data)
    try {
      const jsonContent = JSON.stringify(data)
      await SubmitForm(String(formId), jsonContent)
      setSubmitted(true)
      toast({
        title: 'success',
        description: 'done',
        variant: 'default',
      })
    } catch (error) {
      toast({
        title: 'invalid',
        description: 'something went wrong',
        variant: 'destructive',
      })
    }
  }

  const change = (data: any, event: any) => {
    const id = event.target.dataset.id
    const findElement = form.components.find((el) => el.id == id)
    if (findElement) {
      const { formula, destination } = findElement.extraAttributes
      console.log('🚀 ~ change ~ formula:', formula)
      try {
        const compute = evaluate(formula, data)
        formController.setValue(destination, compute)
      } catch (error) {
        return console.log(error)
      }
    }
  }

  if (submitted) {
    return (
      <div className="flex h-full w-full flex-1 flex-grow items-center justify-center p-8">
        <Confetti recycle={false} numberOfPieces={1000} />
        <div className="bg-background flex w-full max-w-[620px] flex-grow flex-col gap-4 overflow-y-auto rounded border p-8 shadow">
          <h1 className="text-2xl font-bold">Form submitted</h1>
          <p className="text-muted-foreground">
            Thank you for submitting the form, you can close this page now.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      onChange={formController.handleSubmit(change)}
      className={cn(
        'flex h-full w-full items-start p-8',
        `nord:bg-red-500 bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]`,
        theme.theme == 'nord' && 'bg-[url(/paper-dark.svg)]'
      )}
    >
      <div
        key={renderkey}
        className="bg-background flex w-full flex-grow flex-col overflow-y-auto rounded-none border-none p-4 shadow-none"
      >
        <div className="flex w-full flex-grow flex-col items-center justify-center overflow-y-auto">
          <div className="bg-background w-full overflow-y-auto p-2">
            {form.components
              .filter(
                (_element) =>
                  _element.parentId == null && _element.page == selectedPage.id
              )
              .map((element) => {
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
              startTransition(formController.handleSubmit(submitForm) as any)
            }
          >
            {!pending && (
              <div className="flex flex-row gap-2">
                <TbBrandSublimeText className="h-4 w-4" />
                Submit
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
