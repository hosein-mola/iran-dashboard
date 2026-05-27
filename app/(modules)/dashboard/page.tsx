'use client'
import HeaderDropdown from '@/components/header-dropdown'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DamIcon, Layers3, WavesIcon } from 'lucide-react'
import { redirect } from 'next/navigation'
import { RiWaterFlashFill } from 'react-icons/ri'

export default function app() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center">
      <Card className="w-4/12 px-4">
        <CardHeader>
          <CardTitle>انتخاب زیرسیستم</CardTitle>
          <CardDescription>
            بر اساس سطح دسترسی زیر سیستم مورد نظر را انتخاب کنید
          </CardDescription>
          <Separator />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <section className="flex flex-row items-center justify-between">
            <div className="flex gap-6">
              <DamIcon />
              <span>منابع</span>
            </div>
            <Button
              variant={'outline'}
              onClick={() => redirect('/dashboard/resources')}
            >
              ورود
            </Button>
          </section>
          <Separator />
          <section className="flex flex-row items-center justify-between">
            <div className="flex gap-6">
              <WavesIcon />
              <span>مصارف</span>
            </div>
            <Button variant={'outline'}>ورود</Button>
          </section>
          <Separator />
          <section className="flex flex-row items-center justify-between">
            <div className="flex gap-6">
              <Layers3 />
              <span>فرم ساز</span>
            </div>
            <Button
              variant={'outline'}
              onClick={() => redirect('/form-builder')}
            >
              ورود
            </Button>
          </section>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-center">
          {new Date().toLocaleString('fa-ir')}
        </CardFooter>
      </Card>
    </div>
  )
}
