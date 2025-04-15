import React from 'react'
import { Button } from './ui/button'
import { MdPreview } from 'react-icons/md'
import useDesigner from './hooks/useDesigner'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog'
import { FormElementInstance } from '../types/element-type'
import { useTheme } from 'next-themes'
import FormSubmitComponent from './FormSubmitComponent'
import { string } from 'zod'

const PreviewDialogButton = () => {
  const { elements, pages } = useDesigner()
  const { theme, setTheme } = useTheme()

  type ExtendedFormElementInstance = Omit<FormElementInstance, 'page'> & {
    page: {
      id: string
      extraAttributes: string
    }
    components: FormElementInstance[]
  }

  const form: ExtendedFormElementInstance = {
    id: '-1',
    index: -1,
    type: 'flex',
    parentId: null,
    components: elements,
    extraAttributes: {},
    page: {
      id: '-1',
      extraAttributes: JSON.stringify(pages),
    },
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'outline'} className="gap-2">
          <MdPreview className="h-6 w-6" />
          پیش‌نمایش
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[50vh] w-full flex-col items-start justify-start overflow-scroll lg:max-h-full lg:max-w-7/12">
        <DialogTitle className="w-full border-b px-4 py-2">
          <p className="text-lg font-bold text-black">پیش‌نمایش فرم</p>
          <p className="text-muted-foreground text-sm">
            این چیزی است که کاربران شما خواهند دید
          </p>
        </DialogTitle>
        <FormSubmitComponent formId={0} form={form} type={'preview'} />
      </DialogContent>
    </Dialog>
  )
}

export default PreviewDialogButton
