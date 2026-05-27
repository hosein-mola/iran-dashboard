'use client'

import { TrendingUp } from 'lucide-react'
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
const chartData = [{ month: 'january', desktop: 400, mobile: 40 }]

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-7))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-6))',
  },
} satisfies ChartConfig

export function Chart2() {
  const totalVisitors = chartData[0].desktop + chartData[0].mobile

  return (
    <Card className="flex flex-col rounded-none shadow-none">
      <CardHeader className="items-center pb-0">
        <CardTitle>میزان پرشدگی</CardTitle>
        <CardDescription>از مهر - آبان</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={360}
            innerRadius={90}
            outerRadius={140}
          >
            <defs>
              <linearGradient id="desktopGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--chart-7)" />
                <stop offset="100%" stopColor="var(--chart-6)" />
              </linearGradient>
              <linearGradient id="mobileGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" />
                <stop offset="100%" stopColor="var(--chart-3)" />
              </linearGradient>
            </defs>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 5}
                          className="fill-foreground p-num text-2xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 25}
                          className="fill-muted-foreground"
                        >
                          حجم
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="desktop"
              stackId="a"
              cornerRadius={0}
              fill="url(#desktopGradient)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="mobile"
              fill="url(#mobileGradient)"
              stackId="a"
              cornerRadius={0}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          میزان نسبت به شاخص دیروز <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          میزان پرشدگی نسبت به سال قبل
        </div>
      </CardFooter>
    </Card>
  )
}
