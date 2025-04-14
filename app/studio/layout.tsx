import { AppSidebar } from '@/components/app-sidebar'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import HeaderDropdown from '@/components/header-dropdown'
import { Button } from '@/components/ui/button'
import { LucideCalendarArrowDown, LucideDam } from 'lucide-react'
import HolyLoader from 'holy-loader'
import { Fragment } from 'react'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Fragment>
      <HolyLoader
        color="oklch(0.16546762589928057 0.13333333333333336 258)"
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
          {/* Header Section */}
          <header className="border-border bg-background sticky top-0 z-[10] hidden h-16 shrink-0 items-center justify-between border-b px-4 md:flex">
            <SidebarTrigger className="border-border hover:bg-accent rotate-180 cursor-pointer border" />
            <HeaderDropdown />
          </header>
          {/* Filter Section */}
          <div className="bg-background sticky top-16 z-[10] hidden min-h-12 w-full items-center gap-2 border-b px-4 md:flex">
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
          </div>
          {/* Scrollable Content */}
          <main className="bg-sidebar flex-grow overflow-y-auto p-2">
            <header className="border-border bg-background z-[99] flex h-16 shrink-0 items-center justify-between border-b px-4 md:hidden">
              <SidebarTrigger className="border-border hover:bg-accent rotate-180 cursor-pointer border" />
              <HeaderDropdown />
            </header>
            {children}
          </main>
          {/* Footer */}
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
