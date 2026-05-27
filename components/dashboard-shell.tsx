'use client'

import { Fragment, ReactNode, useMemo } from 'react'

import Breadcrumbs from '@/components/breadcrumbs'
import { AppSidebar } from '@/components/app-sidebar'
import HeaderDropdown from '@/components/header-dropdown'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useTheme } from './providers/ThemeProvider'
import HolyLoader from 'holy-loader'

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { resolvedTheme, theme } = useTheme()
  const loaderColor = useMemo(() => {
    const isWood = theme === 'wood'
    if (resolvedTheme === 'dark' || isWood) return '#facc15' // yellow for dark/wood
    return 'hsl(var(--primary))' // primary color for light/system
  }, [resolvedTheme, theme])

  return (
    <Fragment>
      <HolyLoader
        color={loaderColor}
        height="0.8rem"
        speed={1000}
        easing="cubic-bezier(0.4, 0, 0.2, 1)"
        boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)"
        showSpinner
        dir="rtl"
      />
      <SidebarProvider>
        <AppSidebar side="right" variant="inset" />
        <SidebarInset className="flex flex-1 flex-col">
          <header className="border-border bg-background sticky top-0 z-[10] hidden h-16 shrink-0 items-center justify-between border-b px-4 md:flex">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="border-border hover:bg-accent rotate-180 cursor-pointer border" />
              <Breadcrumbs className="hidden max-w-[60vw] min-w-0 flex-1 md:flex" />
            </div>
            <HeaderDropdown />
          </header>
          {/* <div className="bg-background sticky top-16 z-[10] hidden min-h-12 w-full items-center gap-2 border-b px-4 md:flex">
            <Button className="cursor-pointer" variant={'ghost'}>
              <LucideDam className="size-5" />
              <span className="">انتخاب سد</span>
            </Button>
            <Button className="cursor-pointer" variant={'ghost'}>
              <LucideCalendarArrowDown className="size-5" />
              <span className="">تاریخ شروع</span>
            </Button>
            <Button className="cursor-pointer" variant={'ghost'}>
              <LucideCalendarArrowDown className="size-5" />
              <span className="">تاریخ پایان</span>
            </Button>
          </div> */}
          <main className="bg-sidebar flex-grow overflow-y-auto p-2">
            <header className="border-border bg-background z-[99] flex h-16 shrink-0 items-center justify-between border-b px-4 md:hidden">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="border-border hover:bg-accent rotate-180 cursor-pointer border" />
                <Breadcrumbs className="flex-1 text-[0.6rem]" />
              </div>
              <HeaderDropdown />
            </header>
            {children}
          </main>
          <footer className="bg-background text-muted-foreground flex h-16 w-full flex-shrink-0 items-center justify-center border-t text-xs">
            <span className="">توسعه در سازمان آب و برق خوستان</span>
            <span className="">-</span>
            <span className="">0.0.1</span>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </Fragment>
  )
}
