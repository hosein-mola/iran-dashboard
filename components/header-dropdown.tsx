'use client'
import React, { Fragment, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'
import ThemeChanger from './theme-changer'
import { MenuIcon } from 'lucide-react'
import { DrawerDemo } from './drawer'
import { DrawerTrigger } from './ui/drawer'
export default function HeaderDropdown() {
  const changeModuleRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  const handleLogout = () => {
    const clearClient = () => {
      try {
        document.cookie = 'token=; Max-Age=0; path=/'
        document.cookie = 'auth=; Max-Age=0; path=/'
        document.cookie = 'session=; Max-Age=0; path=/'
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
      } catch {
        // ignore storage errors
      }
    }

    fetch('/api/logout', { method: 'POST' })
      .catch(() => {})
      .finally(() => {
        clearClient()
        router.replace('/login')
      })
  }

  return (
    <Fragment>
      <DrawerDemo>
        <DrawerTrigger asChild className="hidden">
          <Button ref={changeModuleRef} variant="outline">
            Open Drawer
          </Button>
        </DrawerTrigger>
      </DrawerDemo>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="default" className="cursor-pointer">
            <MenuIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-background shadow-primary/70 z-[90] mt-3 w-56 flex-row-reverse rounded border shadow-2xl"
          side="right"
          align="end"
          sideOffset={7}
        >
          <DropdownMenuLabel dir="rtl" className="font-bold">
            تنظیمات
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="background"
              onClick={(e) => e.preventDefault()}
            >
              <ThemeChanger />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => changeModuleRef.current?.click()}>
              تغییر ماژول
            </DropdownMenuItem>
          <DropdownMenuItem>
            امنیت
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem>تنظیمات کاربر</DropdownMenuItem>
        <DropdownMenuItem>پشتیبانی</DropdownMenuItem>
        <DropdownMenuItem disabled>مستندات API</DropdownMenuItem>
        <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              handleLogout()
            }}
          >
            خروج
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Fragment>
  )
}
