import { AppSidebar } from '@/components/app-sidebar'
import './globals.css'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { ThemeProvider } from 'next-themes'
import HeaderDropdown from '@/components/HeaderDropdown'
import { Button } from '@/components/ui/button'
import { LucideCalendarArrowDown, LucideDam } from 'lucide-react'
import Loader from '@/components/loader'
// import { estedad } from 'next-persian-fonts/estedad'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="rtl" suppressHydrationWarning>
      <body>
        <Loader />
        <ThemeProvider attribute="class">
          <SidebarProvider>
            <AppSidebar side="right" variant="inset" />
            <SidebarInset>
              <header className="border-border bg-background sticky top-0 z-[99] hidden h-16 shrink-0 items-center justify-between border-b px-4 md:flex">
                <SidebarTrigger className="border-border hover:bg-accent rotate-180 cursor-pointer border" />
                <HeaderDropdown />
              </header>
              <div className="bg-background sticky top-16 z-[98] hidden min-h-12 w-full items-center gap-2 border-b px-4 md:flex">
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
              <main className="bg-sidebar flex-1 p-2">
                <header className="border-border bg-background z-[99] flex h-16 shrink-0 items-center justify-between border-b px-4 md:hidden">
                  <SidebarTrigger className="border-border hover:bg-accent rotate-180 cursor-pointer border" />
                  <HeaderDropdown />
                </header>
                {children}
              </main>
              <footer className="bg-background bottom-0 h-12 w-full border-t"></footer>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
