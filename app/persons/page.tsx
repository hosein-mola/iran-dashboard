import React from 'react'
import ScrollTable from './srcrolltable'

async function page() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="bg-background border-border flex-1/5 rounded-2xl border"></div>
      <div className="bg-background h-full flex-3/3 overflow-auto">
        <ScrollTable />
      </div>
      <div className="bg-background relative flex-0"></div>
    </div>
  )
}

export default page
