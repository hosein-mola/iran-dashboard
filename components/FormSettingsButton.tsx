'use client'

import { useState, useTransition } from 'react'
import { Settings2 } from 'lucide-react'
import { FaSpinner } from 'react-icons/fa'

import { UpdateFormSettings } from '@/actions/form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

type SetupOptions = {
  roles: Array<{ id: number; key: string; name: string }>
  users: Array<{ id: string; name: string; email: string | null }>
  submodules: Array<{ id: number; slug: string; name: string }>
}

export default function FormSettingsButton({
  form,
  options,
  onSaved,
}: {
  form: any
  options: SetupOptions
  onSaved?: (form: any) => void
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [scheduleType, setScheduleType] = useState(
    form.scheduleType || 'monthly'
  )
  const [scheduleInterval, setScheduleInterval] = useState(
    String(form.scheduleInterval || 1)
  )
  const [submoduleId, setSubmoduleId] = useState(
    form.submoduleId ? String(form.submoduleId) : ''
  )
  const [roleId, setRoleId] = useState(form.roleId ? String(form.roleId) : '')
  const [assignedUserId, setAssignedUserId] = useState(
    form.assignedUserId || form.userId || ''
  )

  const saveSettings = () => {
    startTransition(async () => {
      try {
        const updatedForm = await UpdateFormSettings(form.id, {
          scheduleType,
          scheduleInterval: Number(scheduleInterval || 1),
          submoduleId: submoduleId ? Number(submoduleId) : null,
          roleId: roleId ? Number(roleId) : null,
          assignedUserId: assignedUserId || null,
        })

        onSaved?.(updatedForm)
        setOpen(false)
        toast({
          title: 'تنظیمات ذخیره شد',
          description: 'نسخه جدیدی برای فرم ثبت شد.',
        })
      } catch (error) {
        toast({
          title: 'خطا',
          description: 'تنظیمات فرم ذخیره نشد.',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings2 className="size-4" />
          تنظیمات
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>تنظیمات فرم</DialogTitle>
          <DialogDescription>
            دوره ثبت، زیرماژول و دسترسی‌های این فرم در نسخه جدید ذخیره می‌شود.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>دوره ثبت</Label>
            <Select value={scheduleType} onValueChange={setScheduleType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">ساعتی</SelectItem>
                <SelectItem value="weekly">هفتگی</SelectItem>
                <SelectItem value="monthly">ماهانه</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>فاصله دوره</Label>
            <Input
              dir="ltr"
              type="number"
              min={1}
              value={scheduleInterval}
              onChange={(event) => setScheduleInterval(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>زیرماژول</Label>
            <Select value={submoduleId} onValueChange={setSubmoduleId}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب زیرماژول" />
              </SelectTrigger>
              <SelectContent>
                {options.submodules.map((submodule) => (
                  <SelectItem key={submodule.id} value={String(submodule.id)}>
                    {submodule.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>نقش مجاز</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب نقش" />
              </SelectTrigger>
              <SelectContent>
                {options.roles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>کاربر مسئول</Label>
            <Select value={assignedUserId} onValueChange={setAssignedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کاربر" />
              </SelectTrigger>
              <SelectContent>
                {options.users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button disabled={pending} onClick={saveSettings}>
            ذخیره
            {pending && <FaSpinner className="mr-2 size-4 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
