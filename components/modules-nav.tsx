'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { moduleMenuConfig } from '@/components/module-menu'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function ModulesNav() {
  const pathname = usePathname() || '/'
  const modules = moduleMenuConfig.filter((mod) => mod.base !== '/modules')

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>ماژول ها</SidebarGroupLabel>
      <SidebarMenu>
        {modules.map((mod) => {
          const isActive = pathname === mod.base || pathname.startsWith(`${mod.base}/`)
          return (
            <SidebarMenuItem key={mod.base}>
              <SidebarMenuButton asChild>
                <Link
                  href={mod.base}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-muted/70'
                  )}
                >
                  <span>{mod.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
