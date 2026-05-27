'use client'
import React from 'react'
import ScrollTable from '@/components/data-grid'
import Filter from '@/components/persons/person-filter'
import PersianDate from 'persian-date'
import { CalenderFormat } from '@/types/calender-type'
export type OnSubmitParams = {
  date: PersianDate
  date2: PersianDate
}
export default function page() {
  const onSubmit = ({ date, date2 }: OnSubmitParams) => {
    console.log({
      date: date
        .toCalendar('gregorian')
        .toLocale('en')
        .format(CalenderFormat.ISO8601),
      date2: date2.format('LLLL'),
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="bg-background border-border flex h-12 items-center gap-2 rounded-xl border px-2">
        <Filter callback={onSubmit} />
      </div>
      <div className="bg-background h-full flex-11/12 overflow-auto">
        <ScrollTable />
      </div>
    </div>
  )
}
