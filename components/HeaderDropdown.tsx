'use client'
import React from 'react'
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
import ThemeChanger from './ThemeChanger'
import { MenuIcon } from 'lucide-react'
export default function HeaderDropdown() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="default" className="cursor-pointer">
          <MenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-background shadow-primary/70 z-[100] mt-3 w-56 flex-row-reverse rounded border shadow-2xl"
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
          <DropdownMenuItem>تغییر ماژول</DropdownMenuItem>
          <DropdownMenuItem>
            امنیت
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem>تنظیمات کاربر</DropdownMenuItem>
        <DropdownMenuItem>پشتیبانی</DropdownMenuItem>
        <DropdownMenuItem disabled>مستندات API</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          خروج
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
