'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { ImSpinner } from 'react-icons/im'

import { DeleteForm, DeleteTemplate } from '@/actions/form'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'
import { Button } from './ui/button'
import { toast } from './ui/use-toast'

type DeleteRecordButtonProps = {
  kind: 'form' | 'template'
  id: number
  name: string
}

const labels = {
  form: {
    button: 'حذف فرم',
    title: 'حذف فرم',
    description: 'این فرم و نسخه‌ها و داده‌های وابسته به آن حذف می‌شود.',
    success: 'فرم حذف شد',
    failure: 'فرم حذف نشد.',
  },
  template: {
    button: 'حذف قالب',
    title: 'حذف قالب',
    description: 'اگر فرم وابسته داشته باشد، قالب حذف نمی‌شود.',
    success: 'قالب حذف شد',
    failure: 'قالب حذف نشد.',
  },
} as const

export default function DeleteRecordButton({
  kind,
  id,
  name,
}: DeleteRecordButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const meta = labels[kind]

  const onDelete = () => {
    startTransition(async () => {
      try {
        if (kind === 'form') {
          await DeleteForm(id)
        } else {
          await DeleteTemplate(id)
        }

        router.refresh()
        toast({
          title: meta.success,
          description: `${name} حذف شد.`,
        })
      } catch (error) {
        toast({
          title: 'خطا',
          description:
            error instanceof Error ? error.message : meta.failure,
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive"
          disabled={pending}
        >
          <Trash2 className="size-4" />
          {meta.button}
          {pending && <ImSpinner className="mr-1 size-4 animate-spin" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>{meta.title}</AlertDialogTitle>
          <AlertDialogDescription>{meta.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>انصراف</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>حذف</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
