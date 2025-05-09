'use client'
import HeaderDropdown from '@/components/header-dropdown'
import Logo from '@/components/logo'
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
    <div className="bg-background flex flex-1 flex-col">
      <header className="border-border bg-background sticky top-0 z-[10] hidden h-16 shrink-0 items-center justify-between border-b px-4 md:flex">
        <Button
          variant={'ghost'}
          onClick={() => {
            redirect('/dashboard')
          }}
          className="gorup/site-name border-border flex h-16 w-96 flex-row items-center justify-start gap-1 rounded-none border-b"
        >
          <RiWaterFlashFill className="group-hover/site-name:text-primary mr-2 size-8" />
          <span className="text-2xl">سد‌ایران</span>
        </Button>
        <HeaderDropdown />
      </header>
      <div className="gap- flex flex-1 flex-col items-center justify-center">
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
                onClick={() => redirect('/modules/resources')}
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
              <Button variant={'outline'} onClick={() => redirect('/studio')}>
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
    </div>
  )
}
