'use client'

import * as React from 'react'
import {
  BookOpen,
  Bot,
  LucideChartBarBig,
  LucideTerminal,
  LucideTextCursorInput,
  LucideUserSearch,
  Settings2,
  User2,
  UserRoundPenIcon,
  UserSearchIcon,
} from 'lucide-react'

import { RiWaterFlashFill } from 'react-icons/ri'
import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { Button } from './ui/button'
import { redirect } from 'next/navigation'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
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
  ],
  navMain: [
    {
      title: 'کاربران',
      url: 'plauyground',
      icon: User2,
      isActive: true,
      items: [
        {
          title: 'افراد',
          url: '/dashboard/persons',
        },
      ],
    },
    {
      title: 'اطلاعات پایه',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'ورود اطلاعات',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'گزارش',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          icon: Settings2,
          url: '#',
          items: [
            {
              title: 'Profile',
              url: '#',
            },
            {
              title: 'Notifications',
              url: '#',
            },
            {
              title: 'Security',
              url: '#',
            },
          ],
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'گزارش ساز',
      url: '#',
      icon: LucideChartBarBig,
    },
    {
      name: 'فرم ساز',
      url: '#',
      icon: LucideTextCursorInput,
    },
    {
      name: 'فرمول ‌ساز',
      url: '#',
      icon: LucideTerminal,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
            redirect('/dashboard')
          }}
          className="gorup/site-name border-border flex h-16 w-full flex-row items-center justify-start gap-1 rounded-none border-b"
        >
          <RiWaterFlashFill className="group-hover/site-name:text-primary mr-2 size-8" />
          <span className="text-2xl">سد‌ایران</span>
        </Button>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter className="bg-background">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
