'use client'

import { ClipboardList } from 'lucide-react'
import { useState, useTransition } from 'react'

import {
  GetFormById,
  RegisterFormVisit,
  ResolveFormInitialData,
} from '@/actions/form'
import DesignerContextProvider from '@/components/context/DesignerContext'
import FormSubmitComponent from '@/components/FormSubmitComponent'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type LoadedForm = Awaited<ReturnType<typeof GetFormById>>

export default function SubmitFormDialogButton({
  formId,
  formName,
}: {
  formId: number
  formName: string
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<LoadedForm | null>(null)
  const [initialData, setInitialData] = useState<Record<string, unknown>>({})
  const [pending, startTransition] = useTransition()

  const openForm = () => {
    setOpen(true)

    if (form) return

    startTransition(async () => {
      const [loadedForm, resolvedInitialData] = await Promise.all([
        GetFormById(formId),
        ResolveFormInitialData(formId),
        RegisterFormVisit(formId),
      ])

      loadedForm.components = loadedForm.components.sort(
        (a, b) => a.index - b.index
      )
      setForm(loadedForm)
      setInitialData(resolvedInitialData)
    })
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="text-md flex-1 gap-2"
        onClick={openForm}
      >
        ثبت فرم <ClipboardList className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[70vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader className="">
            <DialogTitle className="mr-5 text-right">{formName}</DialogTitle>
          </DialogHeader>
          {form ? (
            <DesignerContextProvider>
              <FormSubmitComponent
                formId={formId}
                form={form}
                type="submit"
                initialData={initialData}
              />
            </DesignerContextProvider>
          ) : (
            <div className="text-muted-foreground flex min-h-40 items-center justify-center text-sm">
              {pending ? 'در حال بارگذاری فرم...' : 'فرم آماده نیست.'}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
