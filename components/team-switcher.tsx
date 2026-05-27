'use client'

import * as React from 'react'
import { ChevronsUpDown, LucideSettings } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    isDefault: boolean
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              variant={'outline'}
              size="lg"
              className="data-[state=open]:bg-accent data-[state=open]:text-sidebar-accent-foreground h-12 cursor-pointer rounded-none shadow-none"
            >
              <div className="flex aspect-square size-8 items-center justify-center">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-right text-sm leading-tight">
                <span className="text-md truncate font-bold">
                  {activeTeam.name}
                </span>
                <span className="truncate text-xs font-light">
                  {activeTeam.isDefault ? 'پیشفرض' : 'فرعی'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="shadow-primary/70 z-[100] w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded shadow-2xl"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
            alignOffset={1}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              نقش ها
            </DropdownMenuLabel>
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md">
                  <team.logo className="group-hover/team:text-accent-foreground size-3.5 shrink-0" />
                </div>
                {team.name}
                {team.isDefault && (
                  <DropdownMenuShortcut>پیشفرض</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <LucideSettings className="group-hover/team:text-accent-foreground size-4" />
              </div>
              تنظیمات نقش کاربر
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
