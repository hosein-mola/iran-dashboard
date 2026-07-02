"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type {
  ProfessionalThemeBase,
  ProfessionalThemeId,
  ProfessionalThemeModeId,
} from "@/components/theme-bases"

const baseThemeModes = [
  "light",
  "dark",
  "system",
  "wood",
] as const

export const themeModes = baseThemeModes

type BaseThemeMode = (typeof baseThemeModes)[number]
export type ThemeMode = BaseThemeMode | ProfessionalThemeModeId
type ResolvedTheme = "light" | "dark"

const customThemeClasses = ["wood"] as const
const professionalThemeTokenNames = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
  "chart-7",
  "map-region",
  "map-region-hover",
  "map-region-selected",
  "map-region-disabled",
  "map-region-stroke",
  "map-region-stroke-hover",
  "map-region-focus-ring",
  "map-label",
  "map-label-hover",
  "map-label-selected",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "radius",
  "font-sans",
  "font-serif",
  "font-mono",
  "letter-spacing",
  "spacing",
  "shadow-color",
  "shadow-opacity",
  "shadow-blur",
  "shadow-spread",
  "shadow-offset-x",
  "shadow-offset-y",
  "sidebar-active",
  "sidebar-active-foreground",
]
const professionalThemeTokenAliases: Record<string, string> = {
  "font-sans": "theme-font-sans",
  "font-serif": "theme-font-serif",
  "font-mono": "theme-font-mono",
  spacing: "theme-spacing",
}

const darkResolvedThemes: ThemeMode[] = ["dark"]
const darkSelectedSidebarThemes: ThemeMode[] = ["wood"]
let professionalThemesPromise: Promise<readonly ProfessionalThemeBase[]> | null = null
let applyThemeRequestId = 0

type ThemeContextValue = {
  theme: ThemeMode
  resolvedTheme: ResolvedTheme
  systemTheme: ResolvedTheme
  setTheme: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const STORAGE_KEY = "theme"

const getSystemTheme = (): ResolvedTheme =>
  typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"

const getProfessionalThemeMode = (mode: ThemeMode) => {
  if (!mode.startsWith("tweakcn-")) return null
  if (mode.endsWith(":dark")) {
    return { id: mode.slice(0, -5) as ProfessionalThemeId, variant: "dark" as const }
  }
  return { id: mode as ProfessionalThemeId, variant: "light" as const }
}

const loadProfessionalThemes = async () => {
  professionalThemesPromise ??= import("@/components/theme-bases").then(
    (module) => module.professionalThemeBases
  )
  return professionalThemesPromise
}

const applyThemeToken = (root: HTMLElement, token: string, value: string) => {
  root.style.setProperty(`--${professionalThemeTokenAliases[token] ?? token}`, value)
  if (token !== "spacing") return

  root.style.setProperty("--theme-text-xs", `calc(${value} * 3)`)
  root.style.setProperty("--theme-text-sm", `calc(${value} * 3.5)`)
  root.style.setProperty("--theme-text-base", `calc(${value} * 4)`)
  root.style.setProperty("--theme-text-lg", `calc(${value} * 4.5)`)
  root.style.setProperty("--theme-text-xl", `calc(${value} * 5)`)
}

const applySidebarInteractiveContrast = (root: HTMLElement, resolved: ResolvedTheme) => {
  const background =
    resolved === "dark"
      ? "color-mix(in oklch, var(--sidebar-foreground) 10%, var(--sidebar))"
      : "color-mix(in oklch, var(--sidebar-foreground) 6%, var(--sidebar))"

  root.style.setProperty("--sidebar-active", background)
  root.style.setProperty("--sidebar-active-foreground", "var(--sidebar-primary)")
  root.style.setProperty("--sidebar-accent", background)
  root.style.setProperty("--sidebar-accent-foreground", "var(--sidebar-primary)")
}

const applyThemeClass = async (mode: ThemeMode, system: ResolvedTheme) => {
  const requestId = ++applyThemeRequestId
  const root = document.documentElement
  if (!root) return
  const professionalThemeMode = getProfessionalThemeMode(mode)
  const resolved =
    professionalThemeMode?.variant ?? (mode === "system" ? system : darkResolvedThemes.includes(mode) ? "dark" : "light")
  root.classList.remove("dark", ...customThemeClasses)
  professionalThemeTokenNames.forEach((token) => {
    root.style.removeProperty(`--${token}`)
    const alias = professionalThemeTokenAliases[token]
    if (alias) root.style.removeProperty(`--${alias}`)
  })
  ;["xs", "sm", "base", "lg", "xl"].forEach((size) => {
    root.style.removeProperty(`--theme-text-${size}`)
  })
  root.style.removeProperty("--sidebar-background")
  if (resolved === "dark") root.classList.add("dark")
  if (customThemeClasses.includes(mode as (typeof customThemeClasses)[number])) {
    root.classList.add(mode)
  }
  const professionalTheme = professionalThemeMode
    ? (await loadProfessionalThemes()).find((theme) => theme.id === professionalThemeMode.id)
    : null
  if (requestId !== applyThemeRequestId) return
  if (professionalTheme) {
    const tokens = professionalTheme.styles[professionalThemeMode?.variant ?? resolved]
    Object.entries(tokens).forEach(([token, value]) => {
      applyThemeToken(root, token, value)
    })
    root.style.setProperty("--sidebar-background", "var(--sidebar)")
  }
  applySidebarInteractiveContrast(root, darkSelectedSidebarThemes.includes(mode) ? "dark" : resolved)
  if (mode === "system" && system === "dark") root.classList.add("dark")
  root.dataset.theme = mode === "system" ? system : mode
  root.style.colorScheme = resolved
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light")
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light")
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) : null
    const system = getSystemTheme()
    setSystemTheme(system)
    const initial =
      stored && (themeModes.includes(stored as BaseThemeMode) || stored.startsWith("tweakcn-"))
        ? stored
        : "light"
    setThemeState(initial as ThemeMode)
    void applyThemeClass(initial as ThemeMode, system)
    setHydrated(true)
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (event: MediaQueryListEvent) => {
      const nextSystem = event.matches ? "dark" : "light"
      setSystemTheme(nextSystem)
      if (hydrated && theme === "system") void applyThemeClass("system", nextSystem)
    }
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [theme, hydrated])

  useEffect(() => {
    if (!hydrated) return
    void applyThemeClass(theme, systemTheme)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, theme)
    }
  }, [theme, systemTheme, hydrated])

  const value = useMemo<ThemeContextValue>(() => {
    const professionalThemeMode = getProfessionalThemeMode(theme)
    const resolvedTheme =
      professionalThemeMode?.variant ??
      (theme === "system" ? systemTheme : darkResolvedThemes.includes(theme) ? "dark" : "light")
    return { theme, resolvedTheme, systemTheme, setTheme: setThemeState }
  }, [theme, systemTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return ctx
}
