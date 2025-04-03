'use client'
import { CalenderType } from '@/types/calender-type'
import { FilterIcon } from 'lucide-react'
import React, { useState } from 'react'
import DatePickerInput from '@/components/datepicker-input'
import { Button } from '@/components/ui/button'
import PersianDate from 'persian-date'

export default function Filter({
  callback,
}: {
  callback: (data: { date: PersianDate; date2: PersianDate }) => void
}) {
  const [date, setDate] = useState<PersianDate>(new PersianDate())
  const [date2, setDate2] = useState<PersianDate>(new PersianDate())

  
  
  return (
    <div className="flex items-center gap-2">
      <DatePickerInput
        initDate={new PersianDate()}
        type={CalenderType.FA}
        setValue={setDate}
      />
      <DatePickerInput
        initDate={new PersianDate()}
        type={CalenderType.FA}
        setValue={setDate2}
      />
      <Button
        onClick={() => callback({ date: date, date2: date2 })}
        variant={'outline'}
      >
        <FilterIcon />
        Search
      </Button>
    </div>
  )
}
