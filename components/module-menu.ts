'use client'

import {
  BoxIcon,
  BrainIcon,
  ChartBarBig,
  ClipboardList,
  CodeSquareIcon,
  FolderDot,
  FormInputIcon,
  Layers3,
  ShieldCheckIcon,
  User2,
  type LucideIcon,
} from 'lucide-react'

import type { NavItem } from '@/components/nav-main'

export interface ModuleMenuConfig {
  base: string
  label: string
  navMain: NavItem[]
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}

export const moduleMenuConfig: ModuleMenuConfig[] = [
  {
    base: '/modules',
    label: 'درگاه ماژول‌ها',
    navMain: [],
    projects: [],
  },
  {
    base: '/dashboard',
    label: 'داشبورد',
    navMain: [
      {
        title: 'افراد',
        url: '/dashboard/persons',
        icon: User2,
      },
      {
        title: 'منابع',
        url: '/dashboard/resources',
        icon: ShieldCheckIcon,
      },
      {
        title: 'زیرماژول',
        url: '/dashboard/submodule',
        icon: ClipboardList,
      },
    ],
    projects: [
      {
        name: 'گزارش ساز',
        url: '/reports',
        icon: ChartBarBig,
      },
      {
        name: 'فرم ساز',
        url: '/form-builder',
        icon: FormInputIcon,
      },
      {
        name: 'فضای فایل',
        url: '/files',
        icon: FolderDot,
      },
    ],
  },
  {
    base: '/form-builder',
    label: 'فرم‌ساز',
    navMain: [
      {
        title: 'استودیو فرم',
        url: '/form-builder',
        icon: FormInputIcon,
      },
      {
        title: 'زیرماژول و قالب‌ها',
        url: '/form-builder/modules',
        icon: Layers3,
      },
    ],
    projects: [
      {
        name: 'پنل هوش مصنوعی',
        url: '/ai',
        icon: BrainIcon,
      },
      {
        name: 'خلاصه گزارش',
        url: '/reports',
        icon: ChartBarBig,
      },
    ],
  },
  {
    base: '/ai',
    label: 'هوش مصنوعی',
    navMain: [
      {
        title: 'موتور هوش مصنوعی',
        url: '/ai',
        icon: BrainIcon,
      },
    ],
    projects: [
      {
        name: 'گزارش',
        url: '/reports',
        icon: ChartBarBig,
      },
    ],
  },
  {
    base: '/process',
    label: 'فرایند',
    navMain: [
      {
        title: 'جریان های فرایندی',
        url: '/process',
        icon: CodeSquareIcon,
      },
    ],
    projects: [
      {
        name: 'فرم ساز',
        url: '/form-builder',
        icon: FormInputIcon,
      },
    ],
  },
  {
    base: '/reports',
    label: 'گزارش',
    navMain: [
      {
        title: 'داشبورد گزارش ها',
        url: '/reports',
        icon: ChartBarBig,
      },
    ],
    projects: [
      {
        name: 'لاگ ها',
        url: '/logs',
        icon: BoxIcon,
      },
    ],
  },
  {
    base: '/logs',
    label: 'لاگ‌ها',
    navMain: [
      {
        title: 'لاگ‌های عملیاتی',
        url: '/logs',
        icon: BoxIcon,
      },
    ],
    projects: [
      {
        name: 'مدیریت فایل',
        url: '/files',
        icon: FolderDot,
      },
    ],
  },
  {
    base: '/files',
    label: 'مدیریت فایل',
    navMain: [
      {
        title: 'اسناد پروژه',
        url: '/files',
        icon: FolderDot,
      },
    ],
    projects: [
      {
        name: 'داشبورد',
        url: '/dashboard',
        icon: BoxIcon,
      },
    ],
  },
  {
    base: '/security',
    label: 'امنیت و کاربران',
    navMain: [
      {
        title: 'کاربران و دسترسی',
        url: '/security',
        icon: ShieldCheckIcon,
      },
    ],
    projects: [
      {
        name: 'پروفایل‌ها',
        url: '/dashboard/persons',
        icon: User2,
      },
    ],
  },
]
