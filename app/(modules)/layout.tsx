import { DashboardShell } from '@/components/dashboard-shell'
import {
  getSidebarOpenFromCookie,
  SIDEBAR_COOKIE_NAME,
} from '@/lib/sidebar-state'
import { cookies } from 'next/headers'
import type { ReactNode } from 'react'

export default async function ModulesLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const cookieStore = await cookies()
  const defaultSidebarOpen = getSidebarOpenFromCookie(
    cookieStore.get(SIDEBAR_COOKIE_NAME)?.value
  )

  return (
    <DashboardShell defaultSidebarOpen={defaultSidebarOpen}>
      {children}
    </DashboardShell>
  )
}
