'use client'

import { Check, MonitorCog, Palette } from 'lucide-react'

import { type ThemeMode, useTheme } from '@/components/providers/ThemeProvider'
import { professionalThemeBases } from '@/components/theme-bases'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function ThemesPage() {
  const { theme, setTheme } = useTheme()

  return (
    <main dir="rtl" className="space-y-4 p-2 md:p-4">
      <section className="border-border bg-background text-foreground rounded-lg border p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <MonitorCog className="size-4" />
              <span>۱۰۰ تم اول بخش professional در tweakcn</span>
            </div>
            <h1 className="text-2xl font-bold">انتخاب پایه تم</h1>
            <p className="text-muted-foreground text-sm leading-7">
              این صفحه پایه رنگی برنامه را از تم‌های حرفه‌ای tweakcn تغییر
              می‌دهد. سوییچر فعلی هدر برای حالت‌های سریع روشن، تیره، چوبی و
              سیستم بدون تغییر باقی می‌ماند.
            </p>
          </div>
          <div className="border-border bg-card text-card-foreground flex items-center gap-3 rounded-md border px-4 py-3">
            <Palette className="text-primary size-5" />
            <div>
              <p className="text-sm font-semibold">تم فعال</p>
              <p className="text-muted-foreground text-xs">{theme}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {professionalThemeBases.map((base) => {
          const darkThemeId = `${base.id}:dark` as ThemeMode
          const selectedLight = theme === base.id
          const selectedDark = theme === darkThemeId
          const selected = selectedLight || selectedDark
          const previewTokens = selectedDark ? base.styles.dark : base.styles.light
          const swatches = [
            previewTokens.background,
            previewTokens.card,
            previewTokens.primary,
            previewTokens.foreground,
          ]

          return (
            <Card
              key={base.id}
              className={cn(
                'overflow-hidden rounded-lg transition-colors',
                selected && 'border-primary shadow-primary/15 shadow-md'
              )}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{base.name}</CardTitle>
                    <CardDescription className="mt-2 leading-6">
                      {base.author} - {base.likeCount} likes
                    </CardDescription>
                  </div>
                  <span
                    className={cn(
                      'border-border grid size-8 shrink-0 place-items-center rounded-md border',
                      selected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {selected ? <Check className="size-4" /> : null}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex min-h-6 flex-wrap gap-1">
                  {base.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-[11px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {swatches.map((color, index) => (
                    <span
                      key={`${base.id}-${index}-${color}`}
                      className="border-border h-12 rounded-md border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="w-full"
                    variant={selectedLight ? 'default' : 'outline'}
                    onClick={() => setTheme(base.id)}
                  >
                    {selectedLight ? 'روشن فعال' : 'روشن'}
                  </Button>
                  <Button
                    className="w-full"
                    variant={selectedDark ? 'default' : 'outline'}
                    onClick={() => setTheme(darkThemeId)}
                  >
                    {selectedDark ? 'تیره فعال' : 'تیره'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </main>
  )
}
