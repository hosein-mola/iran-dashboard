import ScrollTable from '@/app/persons/srcrolltable'
import React from 'react'

export default async function TableWrapper() {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return <ScrollTable />
}
