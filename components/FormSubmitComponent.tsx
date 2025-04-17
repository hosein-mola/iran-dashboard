'use client'
import { startTransition, useState, useTransition } from 'react'
import { FormElementInstance, FormElements } from '../types/element-type'
import { Button } from './ui/button'
import { ulid } from 'ulid'
import { ImSpinner } from 'react-icons/im'
import useDesigner from './hooks/useDesigner'
import { TbBrandSublimeText } from 'react-icons/tb'
import { useForm } from 'react-hook-form'
import Confetti from 'react-confetti'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

function FormSubmitComponent({
  form,
  type,
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
  const { elements } = useDesigner()

  const [renderkey] = useState(ulid(10))
  const [submitted] = useState(false)
  const [pending] = useTransition()
  const { selectedPage } = useDesigner()
  const formController = useForm({
    mode: 'onChange',
    defaultValues: { itemOne: 1, itemTwo: 2 },
  })
  const theme = useTheme()

  const submitForm = async (data: FormElementInstance) => {}

  const change = (data: any, event: any) => {
    const id = event.target.dataset.id
    const findElement = form.components.find((el) => el.id == id)
    if (findElement) {
      try {
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
        'flex h-full w-full items-start border',
        `nord:bg-red-500 bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]`,
        theme.theme == 'nord' && 'bg-[url(/paper-dark.svg)]'
      )}
    >
      <div
        key={renderkey}
        className="bg-background flex w-full flex-grow flex-col overflow-y-auto rounded-none border-none shadow-none"
      >
        <div className="flex w-full flex-grow flex-col items-center justify-center overflow-y-auto">
          <div className="bg-background w-full overflow-y-auto p-2">
            {elements
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
