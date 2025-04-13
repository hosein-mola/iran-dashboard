import Logo from '@/components/Logo'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import React, { ReactNode } from 'react'

function layout({ children }: { children: ReactNode }) {
    return (
        <main className='flex w-full flex-grow'>{children}</main>
    )
}

export default layout