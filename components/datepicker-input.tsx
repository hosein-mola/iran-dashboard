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

export default function DatePickerInput({ initDate, setValue, type }) {
  const [date, setDate] = useState(initDate)
  const [open, setOpen] = useState(false)

  const close = (newDate) => {
    setOpen(false)
    setDate(newDate)
    setValue(newDate)
  }

  return (
    <div>
      <DropdownMenu defaultOpen={false} open={open} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            onClick={() => setOpen((prev) => !prev)}
            className="cursor-pointer"
            variant={'ghost'}
          >
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
