import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Logo(props: any) {
  return (
    <Link
      href={'/'}
      className={cn(
        'flex flex-row items-center gap-4 bg-gradient-to-r bg-clip-text text-3xl font-bold',
        ''
      )}
    >
      <Image
        width={100}
        height={100}
        src={'/logo.svg'}
        className={cn('h-12 w-12', props.className)}
        alt={'Logo'}
      />
      {!props.noText && <span className="text-foreground/80">Form Studio</span>}
    </Link>
  )
}

export default Logo
