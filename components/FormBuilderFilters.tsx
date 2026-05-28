'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FilterX } from 'lucide-react'

import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

type SubmoduleOption = {
  id: number
  slug: string
  name: string
}

type FormBuilderFiltersProps = {
  submodules: SubmoduleOption[]
  scope: 'forms' | 'templates'
  value: string
}

function updateQueryString(
  current: URLSearchParams,
  key: string,
  value: string
) {
  const next = new URLSearchParams(current.toString())

  if (!value || value === 'all') {
    next.delete(key)
  } else {
    next.set(key, value)
  }

  return next
}

export default function FormBuilderFilters({
  submodules,
  scope,
  value,
}: FormBuilderFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const applyFilter = (key: string, value: string) => {
    const next = updateQueryString(searchParams, key, value)
    const query = next.toString()

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams.toString())
    next.delete(scope === 'forms' ? 'formsSubmodule' : 'templatesSubmodule')
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }

  return (
    <div dir="rtl" className="flex flex-wrap items-end gap-3">
      <div className="grid min-w-[220px] gap-2">
        <label className="text-sm font-medium">
          {scope === 'forms' ? 'فیلتر فرم‌ها' : 'فیلتر قالب‌ها'}
        </label>
        <Select
          value={value || 'all'}
          onValueChange={(nextValue) =>
            applyFilter(
              scope === 'forms' ? 'formsSubmodule' : 'templatesSubmodule',
              nextValue
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="همه زیرماژول‌ها" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه زیرماژول‌ها</SelectItem>
            {submodules.map((submodule) => (
              <SelectItem key={submodule.id} value={String(submodule.id)}>
                {submodule.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={clearFilters}>
        <FilterX className="size-4" />
        حذف فیلتر
      </Button>
    </div>
  )
}
