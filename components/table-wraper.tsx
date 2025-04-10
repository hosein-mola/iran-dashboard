import ScrollTable from '@/components/data-grid'
import React from 'react'

export default async function TableWrapper() {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return <ScrollTable />
}
