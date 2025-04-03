'use client'
import { CalenderType } from '@/types/calender-type'
import pd from 'persian-date'

import { FilterIcon } from 'lucide-react'
import React, { useState } from 'react'
import DatePickerInput from '@/components/datepicker-input'
import { Button } from '@/components/ui/button'

export default function Filter({ callback }) {
  const [date, setDate] = useState(new pd())
  const [date2, setDate2] = useState(new pd())
  
  return (
    <div className="flex items-center gap-2">
      <DatePickerInput
        initDate={new pd()}
        type={CalenderType.FA}
        setValue={setDate}
      />
      <DatePickerInput
        initDate={new pd()}
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
