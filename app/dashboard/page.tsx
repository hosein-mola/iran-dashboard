import { Chart1 } from '@/components/Chart1'
import { Chart2 } from '@/components/Chart2'
import ScrollTable from '../persons/srcrolltable'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Page() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="bg-background hidden flex-[1] grid-cols-2 gap-2 rounded-2xl md:grid">
        <Chart1 />
        <Chart2 />
      </div>
      <div className="bg-background h-full flex-[4] overflow-auto">
        <Card className="h-full gap-2 rounded-none shadow-none" dir="rtl">
          <CardHeader className="col-span-3 flex items-center gap-2 space-y-0 border-b sm:flex-row">
            <div className="grid flex-1 justify-between gap-1 text-right">
              <CardTitle>ورودی سد به صورت ماهانه</CardTitle>
              <CardDescription>
                نمایش میزان خرجی سد به اضای هرماه به واحد MCM
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="bg-background h-full flex-1 rounded-2xl px-2">
            <ScrollTable />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
