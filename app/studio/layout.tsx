import Logo from '@/components/logo'
import ThemeSwitcher from '@/components/theme-changer'
import React, { ReactNode } from 'react'

function layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex max-h-screen min-h-screen min-w-full flex-col">
      <nav className="border-border flex h-[60px] flex-row-reverse items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
        </div>
        <Logo />
      </nav>
      <main className="flex w-full flex-grow">{children}</main>
    </div>
  )
}

export default layout
