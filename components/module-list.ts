'use client'

import { type ComponentType } from 'react'
import {
  BoxIcon,
  BrainIcon,
  ClipboardList,
  CodeSquareIcon,
  FolderDot,
  FormInputIcon,
  ShieldCheckIcon,
  User2,
} from 'lucide-react'

export interface ModuleCard {
  label: string
  description: string
  href: string
  icon: ComponentType<{ className?: string }>
}

export const moduleList: ModuleCard[] = [
  {
    label: 'داشبورد کاربر',
    description: 'زیرسیستم‌های کاربر شامل منابع، مصارف و داشبوردهای اختصاصی.',
    href: '/dashboard',
    icon: User2,
  },
  {
    label: 'فرمساز',
    description: 'ورود به استودیو فرم‌سازی و مدیریت فرم‌ها.',
    href: '/form-builder',
    icon: FormInputIcon,
  },
  {
    label: 'هوش مصنوعی',
    description: 'موتور پیشنهادی و تحلیل داده‌ها با هوش مصنوعی.',
    href: '/ai',
    icon: BrainIcon,
  },
  {
    label: 'فرایند',
    description: 'جریان‌های اتوماسیون و ابزارهای خودکارسازی.',
    href: '/process',
    icon: CodeSquareIcon,
  },
  {
    label: 'گزارش',
    description: 'داشبورد گزارش‌ها و خلاصه‌های تحلیلی.',
    href: '/reports',
    icon: BoxIcon,
  },
  {
    label: 'لاگ',
    description: 'ثبت رخدادها و خطاهای سیستمی.',
    href: '/logs',
    icon: ClipboardList,
  },
  {
    label: 'امنیت و کاربران',
    description: 'مدیریت دسترسی‌ها، نقش‌ها و امنیت سامانه.',
    href: '/security',
    icon: ShieldCheckIcon,
  },
  {
    label: 'مدیریت فایل',
    description: 'آپلود و سازماندهی اسناد پروژه.',
    href: '/files',
    icon: FolderDot,
  },
]
