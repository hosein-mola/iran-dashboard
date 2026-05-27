'use client'

import {
  BoxIcon,
  BrainIcon,
  ChartBarBig,
  CodeSquareIcon,
  FolderDot,
  FormInputIcon,
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
    base: '/dashboard',
    label: 'ماژول سیستم',
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
        items: [
          {
            title: 'نمایش کلی منابع',
            url: '/dashboard/resources',
          },
          {
            title: 'داشبورد منابع',
            url: '/dashboard/resources/dashboard',
          },
        ],
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
        title: 'فرم‌ها',
        items: [
          {
            title: 'ایجاد و ویرایش',
            url: '/form-builder/builder',
          },
          {
            title: 'لیست فرم‌ها',
            url: '/form-builder/forms',
          },
          {
            title: 'سبد ارسال',
            url: '/form-builder/submit',
          },
        ],
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
    base: '/code',
    label: 'کد و فرایند',
    navMain: [
      {
        title: 'جریان های فرایندی',
        url: '/code',
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
      {
        title: 'خلاصه گزارش',
        url: '/reports/summary',
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
]
