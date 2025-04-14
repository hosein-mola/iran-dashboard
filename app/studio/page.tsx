import { GetFormStats, GetForms } from '@/actions/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ReactNode, Suspense } from 'react'
import { LuView } from 'react-icons/lu'
import { FaWpforms } from 'react-icons/fa'
import { HiCursorClick } from 'react-icons/hi'
import { TbArrowBounce } from 'react-icons/tb'
import { BiRightArrowAlt } from 'react-icons/bi'
import { FaEdit } from 'react-icons/fa'
import { Separator } from '@/components/ui/separator'
import CreateFormButton from '@/components/CreateFormButton'
import { Form } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { formatDistance } from 'date-fns'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
export default function Home() {
  return (
    <div className="">
      <Suspense fallback={<StatsCards loading={true} />}>
        <CardStatsWrapper />
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
          <FormCards />
        </Suspense>
      </div>
    </div>
  )
}

async function CardStatsWrapper() {
  const stats = await GetFormStats()
  return <StatsCards loading={false} data={stats} />
}

interface StatsCardProps {
  data?: Awaited<ReturnType<typeof GetFormStats>>
  loading: boolean
}

function StatsCards(props: StatsCardProps) {
  const { data, loading } = props
  return (
    <div className="xl:grid-col-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title={'تعداد کل فرم ها'}
        value={data?.visits?.toLocaleString() || ''}
        icon={<LuView className={'text-blue-600'} />}
        loading={false}
        helperText="تعداد کل فرم ها"
        className={' '}
      />
      <StatsCard
        title={'تعدا کل داده های وارد شده'}
        value={data?.submissions?.toLocaleString() || ''}
        icon={<FaWpforms className={''} />}
        loading={false}
        helperText="تعداد کل داده های وارد شده"
        className={' '}
      />
      <StatsCard
        title={'تعداد کل داده های وارد شده برای امروز'}
        value={data?.submissionsRate?.toLocaleString() || ''}
        icon={<HiCursorClick className={'text-green-600'} />}
        loading={false}
        helperText="تعداد کل داده های وارد شده برای امروز"
        className={' '}
      />
      <StatsCard
        title={'تعداد کل داده های وارد شده برای کل ماه جاری'}
        value={data?.bounceRate?.toLocaleString() || ''}
        icon={<TbArrowBounce className={'text-rose-600'} />}
        loading={false}
        helperText="تعداد کل داده های وارد شده برای کل ماه جاری"
        className={' '}
      />
    </div>
  )
}

export function StatsCard({
  title,
  value,
  icon,
  helperText,
  loading,
  className,
}: {
  title: string
  value: string
  icon: ReactNode
  helperText: string
  loading: boolean
  className: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold">
          {loading && (
            <Skeleton>
              <span className="opacity-0">0</span>
            </Skeleton>
          )}
          {!loading && value}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-xl">{helperText}</p>
      </CardFooter>
    </Card>
  )
}

function FormCardSkeleton() {
  return <Skeleton className="border-primary/20 h-[190px] w-full border-2" />
}

async function FormCards() {
  const forms = await GetForms()
  return (
    <>
      {forms.map((form: Form) => {
        return <FormCard key={form.id} form={form} />
      })}
    </>
  )
}

function FormCard({ form }: { form: Form }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="truncate font-bold">{form.name}</span>
          {Boolean(form.published) && <Badge>Published</Badge>}
          {!Boolean(form.published) && (
            <Badge variant={'destructive'}>Draft</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-muted-foreground flex items-center justify-between text-sm">
          {formatDistance(form.created_at, new Date(), {
            addSuffix: true,
          })}
          {Boolean(form.published) && (
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
        {Boolean(form.published) && (
          <Button asChild className="text-md mt-2 w-full gap-4">
            <Link href={`/forms/${form.id}`}>
              View submissions <BiRightArrowAlt />
            </Link>
          </Button>
        )}
        {!Boolean(form.published) && (
          <Button
            asChild
            variant={'secondary'}
            className="text-md mt-2 w-full gap-4"
          >
            <Link href={`/studio/builder/${form.id}`}>
              Edit form <FaEdit />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
