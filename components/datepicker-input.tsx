'use client'
import React, { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { LucideCalendarArrowDown } from 'lucide-react'
import DatePicker from './DatePicker'
import { Button } from './ui/button'
import PersianDate from 'persian-date'
import { CalenderType } from '@/types/calender-type'

export default function DatePickerInput({
  initDate,
  setValue,
  type,
}: {
  initDate: PersianDate
  setValue: React.Dispatch<React.SetStateAction<PersianDate>>
  type: CalenderType
}) {
  const [date, setDate] = useState(initDate)
  const [open, setOpen] = useState(false)

  const close = (newDate: PersianDate) => {
    setOpen(false)
    setDate(newDate)
    setValue(newDate)
  }

  return (
    <div>
      <DropdownMenu
        defaultOpen={false}
        modal={false}
        open={open}
        onOpenChange={setOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button className="cursor-pointer" variant={'ghost'}>
            <LucideCalendarArrowDown className="size-5" />
            {date.format('L')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-background shadow-primary/70 z-[100] h-full w-full rounded shadow-2xl"
          side="bottom"
          align="center"
          sideOffset={7}
        >
          <DatePicker
            date={date}
            calender={type}
            setDate={setDate}
            close={close}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
