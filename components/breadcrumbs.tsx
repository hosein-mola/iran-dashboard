'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { moduleMenuConfig } from '@/components/module-menu'

const breadcrumbMatchers: Array<{
  test: (path: string) => boolean
  label: string
}> = [
  { test: (path) => path === '/', label: 'خانه' },
  { test: (path) => path === '/dashboard/persons', label: 'افراد' },
  { test: (path) => path === '/dashboard/resources', label: 'منابع' },
  {
    test: (path) => path.startsWith('/dashboard/resources/dashboard'),
    label: 'داشبورد منابع',
  },
  { test: (path) => path === '/form-builder', label: 'فرم‌ساز' },
  { test: (path) => path.startsWith('/form-builder/builder'), label: 'ویرایش فرم' },
  { test: (path) => path.startsWith('/form-builder/forms'), label: 'فرم‌ها' },
  { test: (path) => path.startsWith('/form-builder/submit'), label: 'ارسال فرم' },
  { test: (path) => path === '/ai', label: 'هوش مصنوعی' },
  { test: (path) => path === '/code', label: 'کد و فرایند' },
  { test: (path) => path === '/reports', label: 'گزارش‌ها' },
  { test: (path) => path === '/reports/summary', label: 'خلاصه گزارش' },
  { test: (path) => path === '/logs', label: 'لاگ‌ها' },
  { test: (path) => path === '/files', label: 'فایل‌ها' },
]

const formatLabel = (path: string) => {
  const matcher = breadcrumbMatchers.find((item) => item.test(path))
  if (matcher) {
    return matcher.label
  }

  if (path === '/') {
    return 'خانه'
  }

  const segments = path.split('/').filter(Boolean)
  return segments[segments.length - 1]?.replace(/-/g, ' ') ?? 'صفحه'
}

const findModuleForPath = (path: string) =>
  moduleMenuConfig.find(
    (module) => path === module.base || path.startsWith(`${module.base}/`)
  ) ?? moduleMenuConfig[0]

export default function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname()

  if (!pathname) {
    return null
  }

  const activeModule = findModuleForPath(pathname)
  const moduleBase = activeModule?.base ?? '/'
  const segmentsAfterBase = pathname
    .replace(moduleBase, '')
    .split('/')
    .filter(Boolean)

  const paths = ['/', moduleBase, ...segmentsAfterBase.map((_, index) => `${moduleBase}/${segmentsAfterBase.slice(0, index + 1).join('/')}`)]
    .filter((value, index, array) => array.indexOf(value) === index)
    .filter(Boolean)

  if (paths.length <= 1) {
    return null
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        className
      )}
    >
      {paths.map((path, index) => (
        <span
          key={`${path}-${index}`}
          className="flex items-center gap-1 text-muted-foreground"
        >
          {index > 0 && <span className="text-accent">/</span>}
          <Link
            href={path}
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            {path === moduleBase ? activeModule?.label ?? 'ماژول' : formatLabel(path)}
          </Link>
        </span>
      ))}
    </nav>
  )
}
