'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type LucideIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { moduleList } from '@/components/module-list'

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const pathname = usePathname() || '/'
  const shortcuts = moduleList.map((mod) => ({
    label: mod.label,
    href: mod.href,
    Icon: mod.icon,
  }))

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>میانبر ها</SidebarGroupLabel>
      <SidebarMenu>
        {shortcuts.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild>
                <Link
                  href={href}
                  className={cn(
                    'flex h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
