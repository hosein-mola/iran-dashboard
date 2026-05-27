// app/(modules)/form-builder/page.tsx (or wherever your page is)

import { Suspense, ReactNode } from 'react'
import Link from 'next/link'
import { formatDistance } from 'date-fns'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import CreateFormButton from '@/components/CreateFormButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { LuView } from 'react-icons/lu'
import { FaWpforms, FaEdit } from 'react-icons/fa'
import { HiCursorClick } from 'react-icons/hi'
import { TbArrowBounce } from 'react-icons/tb'
import { BiRightArrowAlt } from 'react-icons/bi'

import { Form } from '@/prisma/client'
import { StatsCard } from './StatsCard'

// Hardcoded forms data (for demonstration)
const forms: Form[] = [
  {
    id: 1,
    name: 'فرم نمونه 1',
    published: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    visit: 120,
    submission: 35,
    description: 'توضیحات فرم نمونه 1',
    userId: '',
    updatedAt: new Date(),
    page: null,
    components: '',
    context: '',
    sharedURL: ''
  },
  {
    id: 2,
    name: 'فرم نمونه 2',
    published: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    visit: 50,
    submission: 10,
    description: '',
    userId: '',
    updatedAt: new Date(),
    page: null,
    components: '',
    context: '',
    sharedURL: ''
  },
]

// Hardcoded stats data
const stats = {
  forms: 12,
  visits: 1234,
  submissions: 4321,
  submissionsRate: 123,
  bounceRate: 345,
}

export default function Home() {
  return (
    <div className="">
      <Suspense fallback={<StatsCards loading={true} />}>
        {/* No longer async fetching, use hardcoded stats */}
        <StatsCards loading={false} data={stats} />
      </Suspense>

      <Separator className="pagebreak my-6" />
      <h2 className="text-foreground col-span-2 text-4xl font-bold">فرم ها</h2>
      <Separator className="my-6" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateFormButton />
        <Suspense
          fallback={[1, 2, 3, 4].map((el) => (
            <FormCardSkeleton key={el} />
          ))}
        >
          <FormCards forms={forms} />
        </Suspense>
      </div>
    </div>
  )
}

interface StatsCardProps {
  data?: {
    forms: number
    visits: number
    submissions: number
    submissionsRate: number
    bounceRate: number
  }
  loading: boolean
}

function StatsCards(props: StatsCardProps) {
  const { data, loading } = props
  return (
    <div className="xl:grid-col-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title={'تعداد کل فرم ها'}
        value={loading ? '' : data?.forms?.toLocaleString() || '0'}
        icon={<FaWpforms className={'text-blue-600'} />}
        loading={loading}
        helperText="تعداد فرم‌هایی که ساخته‌اید"
        className={''}
      />
      <StatsCard
        title={'تعداد کل داده‌های وارد شده'}
        value={loading ? '' : data?.submissions?.toLocaleString() || '0'}
        icon={<LuView className={'text-muted-foreground'} />}
        loading={loading}
        helperText="جمع کل سابمیشن‌ها"
        className={''}
      />
      <StatsCard
        title={'داده‌های امروز'}
        value={loading ? '' : data?.submissionsRate?.toLocaleString() || '0'}
        icon={<HiCursorClick className={'text-green-600'} />}
        loading={loading}
        helperText="تعداد سابمیشن‌های امروز"
        className={''}
      />
      <StatsCard
        title={'داده‌های ماه جاری'}
        value={loading ? '' : data?.bounceRate?.toLocaleString() || '0'}
        icon={<TbArrowBounce className={'text-rose-600'} />}
        loading={loading}
        helperText="تعداد سابمیشن‌های این ماه"
        className={''}
      />
    </div>
  )
}



function FormCardSkeleton() {
  return <Skeleton className="border-primary/20 h-[190px] w-full border-2" />
}

function FormCards({ forms }: { forms: Form[] }) {
  return (
    <>
      {forms.map((form: Form) => (
        <FormCard key={form.id} form={form} />
      ))}
    </>
  )
}

function FormCard({ form }: { form: Form }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="truncate font-bold">{form.name}</span>
          {form.published ? (
            <Badge>Published</Badge>
          ) : (
            <Badge variant={'destructive'}>Draft</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-muted-foreground flex items-center justify-between text-sm">
          {formatDistance(form.createdAt, new Date(), { addSuffix: true })}
          {form.published && (
            <span className="flex items-center gap-2">
              <LuView className="text-muted-foreground" />
              <span>{form.visit.toLocaleString()}</span>
              <FaWpforms className="text-muted-foreground" />
              <span>{form.submission.toLocaleString()}</span>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground h-[20px] truncate text-sm">
        {form.description || 'No description'}
      </CardContent>
      <CardFooter>
        {form.published ? (
          <Button asChild className="text-md mt-2 w-full gap-4">
            <Link href={`/forms/${form.id}`}>
              View submissions <BiRightArrowAlt />
            </Link>
          </Button>
        ) : (
          <Button
            asChild
            variant={'secondary'}
            className="text-md mt-2 w-full gap-4"
          >
            <Link href={`/form-builder/builder/${form.id}`}>
              Edit form <FaEdit />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
