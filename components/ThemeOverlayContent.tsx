'use client'

import { useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'

import { type ThemeMode, useTheme } from '@/components/providers/ThemeProvider'
import { professionalThemeBases } from '@/components/theme-bases'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export default function ThemeOverlayContent() {
  const { theme, setTheme } = useTheme()
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const filteredThemes = useMemo(() => {
    if (!normalizedQuery) return professionalThemeBases

    return professionalThemeBases.filter((base) => {
      const searchable = [
        base.name,
        base.author,
        base.id,
        base.themeId,
        ...base.tags,
      ]
        .join(' ')
        .toLowerCase()

      return searchable.includes(normalizedQuery)
    })
  }, [normalizedQuery])

  return (
    <div dir="rtl" className="flex h-[calc(100vh-89px)] flex-col">
      <div className="bg-background/95 border-border sticky top-0 z-10 border-b p-4 backdrop-blur">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            aria-label="جستجوی تم"
            className="pr-9"
            placeholder="جستجو بر اساس نام، سازنده یا تگ..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          {filteredThemes.length} تم پیدا شد
        </p>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {filteredThemes.length === 0 ? (
          <div className="text-muted-foreground grid min-h-64 place-items-center px-4 text-center text-sm">
            تمی با این جستجو پیدا نشد.
          </div>
        ) : (
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {filteredThemes.map((base) => {
              const darkThemeId = `${base.id}:dark` as ThemeMode
              const selectedLight = theme === base.id
              const selectedDark = theme === darkThemeId
              const selected = selectedLight || selectedDark
              const previewTokens = selectedDark
                ? base.styles.dark
                : base.styles.light
              const swatches = [
                previewTokens.background,
                previewTokens.card,
                previewTokens.primary,
                previewTokens.foreground,
              ]

              return (
                <div
                  key={base.id}
                  className={cn(
                    'border-border bg-card text-card-foreground rounded-lg border p-3 transition-colors',
                    selected && 'border-primary shadow-primary/15 shadow-md'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">
                        {base.name}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {base.author} - {base.likeCount} likes
                      </p>
                    </div>
                    <span
                      className={cn(
                        'border-border grid size-7 shrink-0 place-items-center rounded-md border',
                        selected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {selected ? <Check className="size-4" /> : null}
                    </span>
                  </div>
                  <div className="mt-3 flex min-h-6 flex-wrap gap-1">
                    {base.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-[11px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {swatches.map((color, index) => (
                      <span
                        key={`${base.id}-${index}-${color}`}
                        className="border-border h-9 rounded-md border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      className="w-full"
                      size="sm"
                      variant={selectedLight ? 'default' : 'outline'}
                      onClick={() => setTheme(base.id as ThemeMode)}
                    >
                      {selectedLight ? 'روشن فعال' : 'روشن'}
                    </Button>
                    <Button
                      className="w-full"
                      size="sm"
                      variant={selectedDark ? 'default' : 'outline'}
                      onClick={() => setTheme(darkThemeId)}
                    >
                      {selectedDark ? 'تیره فعال' : 'تیره'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
