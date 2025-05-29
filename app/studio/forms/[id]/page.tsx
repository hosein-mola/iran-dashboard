'use client'
import { GetFormById, GetFormWithSubmissions } from '@/actions/form'
import FormLinkShare from '@/components/FormLinkShare'
import VisitBtn from '@/components/VisitBtn'
import React, { ReactNode } from 'react'
import { FaWpforms } from 'react-icons/fa'
import { HiCursorClick } from 'react-icons/hi'
import { LuView } from 'react-icons/lu'
import { TbArrowBounce } from 'react-icons/tb'
import { ElementType } from '@/types/element-type'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { randomUUID } from 'crypto'
import { StatsCard } from '../../StatsCard'

async function FormDetailPage(props: { params: Promise<{ id: number }> }) {
  const params = await props.params
  const form = await GetFormById(params.id)

  if (!form) {
    throw new Error('form not found')
  }
  const { visit, submission } = form

  let submissionRate = 0
  if (visit > 0) {
    submissionRate = (submission / visit) * 100
  }
  const bounceRate = 100 - submissionRate

  return (
    <>
      <div className="border-muted border-b py-10">
        <div className="container flex justify-between">
          <h1 className="truncate text-4xl font-bold">{form.name}</h1>
          <VisitBtn formId={`${form.id}`} />
        </div>
      </div>
      <div className="border-muted border-b py-4">
        <div className="container flex items-center justify-between gap-2">
          <FormLinkShare formId={`${form.id}`} />
        </div>
      </div>
      <div className="container grid w-full grid-cols-1 gap-4 pt-8 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total visits"
          icon={<LuView className="text-blue-600" />}
          helperText="All time form visits"
          value={visit.toLocaleString() || ''}
          loading={false}
          className=""
        />

        <StatsCard
          title="Total submissions"
          icon={<FaWpforms className="text-yellow-600" />}
          helperText="All time form submissions"
          value={submission.toLocaleString() || ''}
          loading={false}
          className=""
        />
        <StatsCard
          title="Submission rate"
          icon={<HiCursorClick className="text-green-600" />}
          helperText="Visits that result in form submission"
          value={submissionRate.toLocaleString() + '%' || ''}
          loading={false}
          className=""
        />
        <StatsCard
          title="Bounce rate"
          icon={<TbArrowBounce className="text-red-600" />}
          helperText="Visits that leaves without interacting"
          value={bounceRate.toLocaleString() + '%' || ''}
          loading={false}
          className=""
        />
      </div>

      <div className="container pt-10">
        <SubmissionsTable id={form.id} />
      </div>
    </>
  )
}

export default FormDetailPage


async function SubmissionsTable({ id }: { id: number }) {
  const form = await GetFormWithSubmissions(id)
  console.log('🚀 ~ SubmissionsTable ~ form:', form)

  if (!form) {
    throw new Error('form not found')
  }


  const columns: any[] = []

  const rows: any[] = []

  form?.submissions?.forEach((submission: any) => {
    const content = JSON.parse(submission.data)
    const id = randomUUID().toString()
    content['id'] = id
    rows.push(content)
    Object.entries(content).forEach(([key, value]) => {
      if (!columns.includes(key)) {
        columns.push(key)
      }
    })
  })

  return (
    <>
      <h1 className="my-4 text-2xl font-bold">Submissions</h1>
      <div className="border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              {columns.map((column) => (
                <TableHead key={column} className="text-center uppercase">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              return (
                <TableRow key={row.id}>
                  {columns.map((col) => {
                    return <RowCell key={col} value={row[col]} type={'panel'} />
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

function RowCell({
  key,
  type,
  value,
}: {
  type: ElementType
  value: string
  key: string
}) {
  const node: ReactNode = value
  return (
    <TableCell key={key} className="text-foreground text-center">
      {node}
    </TableCell>
  )
}
