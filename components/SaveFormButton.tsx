import React, { useTransition } from 'react'
import { Button } from './ui/button'
import { HiSaveAs } from 'react-icons/hi'
import useDesigner from './hooks/useDesigner'
import { UpdateFormContent } from '@/actions/form'
import { toast } from './ui/use-toast'
import { FaSpinner } from 'react-icons/fa'

function SaveFormButton({ id }: { id: number }) {
  const { elements, pages } = useDesigner()
  const [loading, startTransition] = useTransition()

  const updateFormContent = async () => {
    try {
      await UpdateFormContent(id, elements, pages)
      toast({
        title: 'موفقیت',
        description: 'فرم شما ذخیره شد!',
      })
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی پیش آمده است',
        variant: 'destructive',
      })
    }
  }
  return (
    <Button
      disabled={loading}
      onClick={() => {
        startTransition(updateFormContent)
      }}
      variant={'outline'}
      className="gap-2"
    >
      <HiSaveAs className="h-6 w-6" />
      ذخیره
      {loading && <FaSpinner className="animate-spin" />}
    </Button>
  )
}

export default SaveFormButton
