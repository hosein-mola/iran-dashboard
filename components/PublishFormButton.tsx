import React, { useTransition } from 'react'
import { Button } from './ui/button'
import { MdOutlinePublish } from 'react-icons/md'
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
import { useRouter } from 'next/navigation'
import { FaSpinner } from 'react-icons/fa'
import { toast } from './ui/use-toast'
import { PublishForm } from '@/actions/form'

function PublishFormButton({ id }: { id: number }) {
  const [loading, startTransition] = useTransition()
  const router = useRouter()
  async function publishForm() {
    try {
      const response = await PublishForm(id)
      toast({
        title: 'موفقیت',
        description: 'فرم شما اکنون برای عموم در دسترس است',
      })
      if (location !== undefined) {
        location.reload()
      }
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی پیش آمده است',
      })
      throw error
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="text-background bg-foreground gap-2">
          <MdOutlinePublish className="h-4 w-4" />
          انتشار
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right">
            آیا کاملاً مطمئن هستید؟
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            این عملیات قابل بازگشت نیست. پس از انتشار، دیگر قادر به ویرایش این
            فرم نخواهید بود. <br />
            <br />
            <span className="font-medium">
              با انتشار این فرم، آن را برای عموم در دسترس قرار می‌دهید و
              می‌توانید پاسخ‌ها را جمع‌آوری کنید.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>لغو</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault()
              startTransition(publishForm)
            }}
          >
            ادامه {loading && <FaSpinner className="animate-spin" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default PublishFormButton
