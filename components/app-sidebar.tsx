'use client'

import * as React from 'react'
import {
  LucideUserSearch,
  UserRoundPenIcon,
  UserSearchIcon,
} from 'lucide-react'
import { RiWaterFlashFill } from 'react-icons/ri'
import { usePathname } from 'next/navigation'

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import { moduleMenuConfig } from '@/components/module-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { Button } from './ui/button'
import { redirect } from 'next/navigation'

const teams = [
  {
    name: 'کاربر سد',
    logo: UserRoundPenIcon,
    isDefault: true,
  },
  {
    name: 'رئیس سد',
    logo: UserSearchIcon,
    isDefault: false,
  },
  {
    name: 'راهبر آب منطقه ای',
    logo: LucideUserSearch,
    isDefault: false,
  },
]

const user = {
  name: 'shadcn',
  email: 'm@example.com',
  avatar: '/avatars/shadcn.jpg',
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname() || '/'
  const activeModule =
    moduleMenuConfig.find(
      (module) =>
        pathname === module.base || pathname.startsWith(`${module.base}/`)
    ) ?? moduleMenuConfig[0]

  const navMain = activeModule?.navMain ?? []
  const projects = activeModule?.projects ?? []
  const moduleHome = activeModule?.base ?? '/dashboard'

  return (
    <Sidebar
      variant="sidebar"
      className="bg-background border-l"
      collapsible="offcanvas"
      {...props}
    >
      <SidebarHeader className="bg-background border-border flex h-auto min-w-4 items-center justify-center gap-0">
        <Button
          variant={'ghost'}
          onClick={() => {
            redirect(moduleHome)
          }}
          className="gorup/site-name border-border flex h-16 w-full flex-row items-center justify-start gap-1 rounded-none border-b"
        >
          <RiWaterFlashFill className="group-hover/site-name:text-primary mr-2 size-8" />
          <span className="text-2xl">سد‌ایران</span>
        </Button>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter className="bg-background">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
