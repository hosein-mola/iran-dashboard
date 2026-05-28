'use client'

import { useMemo } from 'react'
import type { ColDef } from 'ag-grid-community'

import DataGrid from '@/components/data-grid'

type SubmissionRow = Record<string, any>

const systemColumns = ['id', 'submittedAt', 'version']

function formatHeader(key: string) {
  if (key === 'id') return 'شناسه'
  if (key === 'submittedAt') return 'زمان ثبت'
  if (key === 'version') return 'نسخه فرم'
  return key
}

export default function FormSubmissionsGrid({
  rows,
}: {
  rows: SubmissionRow[]
}) {
  const columnDefs = useMemo<ColDef<SubmissionRow>[]>(() => {
    const keys = new Set<string>()

    rows.forEach((row) => {
      Object.keys(row).forEach((key) => keys.add(key))
    })

    const orderedKeys = [
      ...systemColumns.filter((key) => keys.has(key)),
      ...Array.from(keys).filter((key) => !systemColumns.includes(key)),
    ]

    return orderedKeys.map((key) => ({
      field: key,
      headerName: formatHeader(key),
      filter:
        typeof rows[0]?.[key] === 'number'
          ? 'agNumberColumnFilter'
          : 'agTextColumnFilter',
      valueFormatter:
        key === 'submittedAt'
          ? (params) =>
              params.value
                ? new Date(params.value).toLocaleString('fa-IR')
                : ''
          : undefined,
    }))
  }, [rows])

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-lg border">
      <DataGrid rowData={rows} columnDefs={columnDefs} loading={false} />
    </div>
  )
}
