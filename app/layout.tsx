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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="rtl" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Loader />
        <ThemeProvider attribute="class">
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
              <footer className="bg-background text-muted-foreground flex h-12 w-full flex-shrink-0 items-center justify-center border-t text-xs">
                <span className="">توسعه در سازمان آب و برق خوستان</span>
                <span className="">-</span>
                <span className="">0.0.1</span>
              </footer>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
