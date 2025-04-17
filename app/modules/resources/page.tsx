'use client'
import PersianDate from 'persian-date'
import SimpleGrid from '@/components/simple-grid'
export type OnSubmitParams = {
  date: PersianDate
  date2: PersianDate
}
export default function page() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="bg-background border-border flex h-12 items-center gap-2 rounded-xl border px-2"></div>
      <div className="bg-background h-full flex-11/12 overflow-auto">
        <SimpleGrid />
      </div>
    </div>
  )
}
