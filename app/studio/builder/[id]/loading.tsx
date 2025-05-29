import React from 'react'
import { Progress } from '@/components/ui/progress'
import Logo from '@/components/logo'

function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="flex w-2/12 flex-col items-center justify-center gap-5">
        <Logo noText className="h-32 w-32" />
        <Progress value={100} className="h-3" />
      </div>
    </div>
  )
}

export default Loading
