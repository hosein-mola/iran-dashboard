'use client'
import PersianDate from 'persian-date'
import SimpleGrid from '@/components/simple-grid'
import Filter from '@/components/persons/person-filter'

export type OnSubmitParams = {
  date: PersianDate
  date2: PersianDate
}
export default function page() {
  const onSubmit = () => {}
  return (
    <div className="flex min-h-screen flex-1 flex-col gap-2 overflow-y-auto px-2 pb-4">
      <div className="bg-background border-border flex h-12 shrink-0 items-center gap-2 rounded-xl border px-2">
        <Filter callback={onSubmit} />
      </div>
      <div className="bg-background flex-1 min-h-[420px] rounded-xl border border-border/60">
        <SimpleGrid />
      </div>
    </div>
  )
}
