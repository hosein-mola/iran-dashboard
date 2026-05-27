'use client'
import * as React from 'react'
import {
  BoxIcon,
  BrainIcon,
  FormInputIcon,
  ShieldCheckIcon,
  CodeSquareIcon,
  ChartBarBig,
  FolderDot,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

export function DrawerDemo({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const modules = [
    {
      icon: ShieldCheckIcon,
      label: 'کاربران و دسترسی',
      href: '/dashboard/persons',
    },
    { icon: FormInputIcon, label: 'فرمساز', href: '/form-builder' },
    { icon: BrainIcon, label: 'هوش مصنوعی', href: '/ai' },
    { icon: CodeSquareIcon, label: 'کد و فرایند', href: '/code' },
    { icon: ChartBarBig, label: 'گزارش', href: '/reports' },
    { icon: BoxIcon, label: 'لاگ', href: '/logs' },
    { icon: FolderDot, label: 'مدیریت فایل', href: '/files' },
  ]

  return (
    <Drawer direction="top">
      {children}
      <DrawerContent className="z-[9999] h-auto" dir="rtl">
        <div className="mx-auto w-full">
          <DrawerHeader>
            <DrawerTitle>انتخابگر ماژول</DrawerTitle>
            <DrawerDescription>ماژول مورد نظر را انتخاب کنید</DrawerDescription>
          </DrawerHeader>
          <div className="border-border flex flex-wrap justify-center gap-8 border p-4">
            {modules.map((module) => (
              <DrawerClose key={module.href} asChild>
                <Link
                  href={module.href}
                  className="border-border hover:bg-accent hover:text-accent-foreground flex h-48 w-40 flex-col items-center justify-between rounded-2xl border p-4"
                >
                  <module.icon className="size-28" />
                  <span className="text-center">{module.label}</span>
                </Link>
              </DrawerClose>
            ))}
          </div>
          <DrawerFooter className="border-border my-2 flex items-center border">
            <DrawerClose asChild>
              <Button size="default" variant="ghost" className="h-full w-40">
                بستن
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
