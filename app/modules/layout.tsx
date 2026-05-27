import Link from 'next/link'
import { RiWaterFlashFill } from 'react-icons/ri'

import HeaderDropdown from '@/components/header-dropdown'
import { Button } from '@/components/ui/button'

export default function ModulesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-border bg-background sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4">
        <Button
          asChild
          variant="ghost"
          className="flex items-center gap-2 text-2xl font-semibold"
        >
          <Link href="/modules">
            <RiWaterFlashFill className="size-8" />
            <span>سد‌ایران</span>
          </Link>
        </Button>
        <HeaderDropdown />
      </header>
      <main className="px-4 py-6">{children}</main>
    </div>
  )
}
