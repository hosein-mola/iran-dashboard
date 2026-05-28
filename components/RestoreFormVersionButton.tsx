'use client'

import { useMemo, useState, useTransition } from 'react'
import { RotateCcw } from 'lucide-react'
import { FaSpinner } from 'react-icons/fa'

import { RestoreFormVersion } from '@/actions/form'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

type FormVersionSummary = {
  id: number
  version: number
  name: string
  createdAt: Date | string
}

type RestoreFormVersionButtonProps = {
  formId: number
  currentVersion: number
  versions: FormVersionSummary[]
  onRestored: (form: any) => void
}

export default function RestoreFormVersionButton({
  formId,
  currentVersion,
  versions,
  onRestored,
}: RestoreFormVersionButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState('')
  const [pending, startTransition] = useTransition()

  const restorableVersions = useMemo(
    () => versions.filter((item) => item.version < currentVersion),
    [currentVersion, versions]
  )

  const selected = restorableVersions.find(
    (item) => String(item.version) === selectedVersion
  )

  const restore = () => {
    if (!selected) return

    startTransition(async () => {
      try {
        const restoredForm = await RestoreFormVersion(formId, selected.version)
        onRestored(restoredForm)
        setOpen(false)
        setSelectedVersion('')
        toast({
          title: 'نسخه بازیابی شد',
          description: `نسخه ${selected.version.toLocaleString('fa-IR')} به عنوان نسخه جدید فرم ذخیره شد.`,
        })
      } catch {
        toast({
          title: 'خطا',
          description: 'بازیابی نسخه انجام نشد.',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={restorableVersions.length === 0}
        >
          <RotateCcw className="h-4 w-4" />
          نسخه‌های قبلی
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>بازیابی نسخه قبلی فرم</AlertDialogTitle>
          <AlertDialogDescription>
            نسخه انتخاب‌شده روی فرم فعلی اعمال می‌شود و به عنوان یک نسخه جدید
            ذخیره خواهد شد.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Select value={selectedVersion} onValueChange={setSelectedVersion}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="انتخاب نسخه" />
          </SelectTrigger>
          <SelectContent>
            {restorableVersions.map((version) => (
              <SelectItem key={version.id} value={String(version.version)}>
                نسخه {version.version.toLocaleString('fa-IR')} -{' '}
                {new Date(version.createdAt).toLocaleDateString('fa-IR')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>انصراف</AlertDialogCancel>
          <AlertDialogAction
            disabled={!selected || pending}
            onClick={(event) => {
              event.preventDefault()
              restore()
            }}
          >
            {pending && <FaSpinner className="h-4 w-4 animate-spin" />}
            بازیابی
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
