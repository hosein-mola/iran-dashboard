'use client'

import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ToastAction } from '@radix-ui/react-toast'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { BsFileEarmarkPlus } from 'react-icons/bs'
import { ImSpinner } from 'react-icons/im'

import { CreateForm } from '@/actions/form'
import { formSchemaType, formSchemea } from '@/schemas/form'
import { cn } from '@/lib/utils'

import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Textarea } from './ui/textarea'
import { toast } from './ui/use-toast'

type CreateFormOptions = {
  roles: Array<{ id: number; key: string; name: string }>
  users: Array<{ id: string; name: string; email: string | null }>
  submodules: Array<{ id: number; slug: string; name: string }>
  templates: Array<{
    id: number
    name: string
    description: string
    scheduleType: string
    scheduleInterval: number
    currentVersion: number
  }>
}

function CreateFormButton({ options }: { options: CreateFormOptions }) {
  const router = useRouter()

  const form = useForm<formSchemaType>({
    resolver: zodResolver(formSchemea),
    defaultValues: {
      scheduleType: 'monthly',
      scheduleInterval: 1,
      submoduleId: options.submodules[0]?.id,
      roleId:
        options.roles.find((role) => role.key === 'user')?.id ||
        options.roles[0]?.id,
      assignedUserId: options.users[0]?.id,
      templateId: undefined,
    },
  })

  async function onSubmit(values: formSchemaType) {
    try {
      const formId = await CreateForm(values)
      router.push(`builder/${formId}`)
      toast({
        className: cn(
          'fixed top-0 right-0 flex md:top-4 md:right-4 md:max-w-[420px]'
        ),
        title: 'فرم ساخته شد',
        description: 'نسخه اولیه فرم ذخیره شد.',
      })
    } catch (error) {
      toast({
        title: 'خطا',
        className: cn(
          'fixed top-0 right-0 flex md:top-4 md:right-4 md:max-w-[420px]'
        ),
        variant: 'destructive',
        description: 'فرم ساخته نشد.',
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
      console.log(error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="group gap-2 border-primary/20 hover:border-primary"
        >
          <BsFileEarmarkPlus className="text-muted-foreground h-5 w-5 group-hover:text-primary" />
          <span className="text-muted-foreground font-bold group-hover:text-primary">
            ایجاد فرم جدید
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>ایجاد فرم</DialogTitle>
          <DialogDescription>
            فرم جدید با دسترسی و نسخه اولیه ساخته می‌شود.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>قالب فرم</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : 'none'}
                    onValueChange={(value) => {
                      if (value === 'none') {
                        field.onChange(undefined)
                        return
                      }

                      const template = options.templates.find(
                        (item) => item.id === Number(value)
                      )
                      field.onChange(Number(value))

                      if (template) {
                        if (
                          ['hourly', 'weekly', 'monthly'].includes(
                            template.scheduleType
                          )
                        ) {
                          form.setValue(
                            'scheduleType',
                            template.scheduleType as
                              | 'hourly'
                              | 'weekly'
                              | 'monthly'
                          )
                        }
                        form.setValue(
                          'scheduleInterval',
                          template.scheduleInterval
                        )
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="بدون قالب" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">بدون قالب</SelectItem>
                      {options.templates.map((template) => (
                        <SelectItem key={template.id} value={String(template.id)}>
                          {template.name} - نسخه {template.currentVersion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <FormField
                control={form.control}
                name="scheduleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>دوره ثبت</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hourly">ساعتی</SelectItem>
                        <SelectItem value="weekly">هفتگی</SelectItem>
                        <SelectItem value="monthly">ماهانه</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduleInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>فاصله دوره</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="submoduleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>زیرماژول</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="انتخاب زیرماژول" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {options.submodules.map((submodule) => (
                        <SelectItem key={submodule.id} value={String(submodule.id)}>
                          {submodule.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نقش</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="انتخاب نقش" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.roles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کاربر</FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="انتخاب کاربر" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
            className="mt-4 w-full"
          >
            {!form.formState.isSubmitting && <span>ذخیره</span>}
            {form.formState.isSubmitting && (
              <ImSpinner className="animate-spin" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateFormButton
