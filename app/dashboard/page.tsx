import { Chart1 } from '@/components/Chart1'
import { Chart2 } from '@/components/Chart2'
import { memo } from 'react'

const MemoizedChart1 = memo(Chart1)

export default function Page() {
  return (
    <section className="grid grid-cols-2 gap-2">
      {/* <MemoizedChart1 /> */}
      <MemoizedChart1 />
      <Chart2 />
      <div className="bg-card border-border aspect-video border" />
      <div className="bg-card border-border aspect-video h-min border" />
    </section>
  )
}
