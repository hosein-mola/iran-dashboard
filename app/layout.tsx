import { AppSidebar } from '@/components/app-sidebar'
import './globals.css'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import NextTopLoader from 'nextjs-toploader'
import { ThemeProvider } from 'next-themes'
import HeaderDropdown from '@/components/HeaderDropdown'
import { estedad } from 'next-persian-fonts/estedad'
import { Button } from '@/components/ui/button'
import {
  LucideAArrowDown,
  LucideAmphora,
  LucideBoxSelect,
  LucideBuilding,
  LucideBuilding2,
  LucideCalendarArrowDown,
  LucideCheckCircle2,
  LucideChevronDown,
  LucideDam,
  LucideFilter,
  LucideListStart,
  LucidePickaxe,
} from 'lucide-react'
import { Separator } from '@radix-ui/react-separator'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="rtl" suppressHydrationWarning>
      <body className={estedad.className}>
        <NextTopLoader
          color="#040273"
          initialPosition={0.08}
          crawlSpeed={200}
          height={10}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2299DD,0 0 5px #2299DD"
          template='<div class="bar" role="bar"><div class="peg"></div></div> 
  <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
          zIndex={1600}
          showAtBottom={false}
        />
        <ThemeProvider attribute="class">
          <SidebarProvider>
            <AppSidebar side="right" variant="inset" />
            <SidebarInset className="">
              <header className="border-border bg-background sticky top-0 flex h-16 shrink-0 items-center justify-between border-b px-4">
                <SidebarTrigger className="border-border hover:bg-accent rotate-180 cursor-pointer border" />
                {/* <Button
                  title="search"
                  value={'search'}
                  variant={'outline'}
                  className="text-muted-foreground border-border h-12 w-96 cursor-pointer gap-4 border bg-slate-50 shadow-none"
                >
                  <LucideSearch />
                  <span className="">جست و جو</span>
                </Button> */}
                <HeaderDropdown />
              </header>
              <div className="bg-background sticky top-16 flex min-h-12 w-full items-center gap-2 border-b px-4">
                <div className="flex items-center gap-1">
                  <LucideFilter className="size-3" />
                  <span className="text-foreground text-xs">فیلتر سراسری:</span>
                </div>
                <Separator
                  className="h-full border-l"
                  orientation="horizontal"
                  decorative
                />
                <Button className="cursor-pointer" variant={'default'}>
                  <LucideDam className="size-5" />
                  <span className="text-accent-foreground">انتخاب سد</span>
                </Button>
                <Button className="cursor-pointer" variant={'default'}>
                  <LucideCalendarArrowDown className="size-5" />
                  <span className="text-accent-foreground">تاریخ شروع</span>
                </Button>
                <Button className="cursor-pointer" variant={'default'}>
                  <LucideCalendarArrowDown className="size-5" />
                  <span className="text-accent-foreground">تاریخ پایان</span>
                </Button>
              </div>
              <main className="bg-sidebar flex-1 p-2">{children}</main>
              <footer className="border-border bg-background sticky bottom-0 flex h-14 w-full items-center border-t px-2">
                test
              </footer>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
