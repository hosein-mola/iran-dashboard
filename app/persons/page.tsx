'use client'
import React from 'react'
import ScrollTable from './srcrolltable'
import Filter from './filter'

export default function page() {
  const onSubmit = ({ date, date2 }) => {
    console.log({ date: date.format('LLLL'), date2: date2.format('LLLL') })
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="bg-background border-border flex h-12 items-center gap-2 rounded-xl border px-2">
        <Filter callback={onSubmit} />
      </div>
      <div className="bg-background h-full flex-11/12 overflow-auto">
        <ScrollTable />
      </div>
    </div>
  )
}
