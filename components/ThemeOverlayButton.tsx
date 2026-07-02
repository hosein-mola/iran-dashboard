'use client'

import { lazy, Suspense, useState } from 'react'
import { Palette } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const ThemeOverlayContent = lazy(() => import('@/components/ThemeOverlayContent'))

export function ThemeOverlayButton() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button
              aria-label="باز کردن انتخاب تم"
              className="fixed left-3 top-1/2 z-40 size-11 -translate-y-1/2 rounded-full border shadow-lg"
              size="icon"
              variant="secondary"
            >
              <Palette className="size-5" />
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">انتخاب تم</TooltipContent>
      </Tooltip>
      <SheetContent
        side="left"
        className="w-[min(92vw,820px)] gap-0 p-0 sm:max-w-none"
      >
        <SheetHeader className="border-border border-b px-5 py-4 text-right">
          <SheetTitle>انتخاب تم</SheetTitle>
          <SheetDescription>
            تم‌های حرفه‌ای فقط بعد از باز کردن این پنل بارگذاری می‌شوند.
          </SheetDescription>
        </SheetHeader>
        {open ? (
          <Suspense
            fallback={
              <div className="text-muted-foreground grid min-h-64 place-items-center text-sm">
                در حال بارگذاری تم‌ها...
              </div>
            }
          >
            <ThemeOverlayContent />
          </Suspense>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
