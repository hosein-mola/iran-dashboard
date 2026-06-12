"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  professionalThemeBases,
  professionalThemeModeIds,
  type ProfessionalThemeId,
  type ProfessionalThemeModeId,
} from "@/components/theme-bases"

const baseThemeModes = [
  "light",
  "dark",
  "system",
  "wood",
] as const

export const themeModes = [...baseThemeModes, ...professionalThemeModeIds]

type BaseThemeMode = (typeof baseThemeModes)[number]
export type ThemeMode = BaseThemeMode | ProfessionalThemeModeId
type ResolvedTheme = "light" | "dark"

const customThemeClasses = ["wood"] as const
const professionalThemesById = new Map(professionalThemeBases.map((theme) => [theme.id, theme]))
const professionalThemeTokenNames = Object.keys(professionalThemeBases[0]?.styles.light ?? {})
const professionalThemeTokenAliases: Record<string, string> = {
  "font-sans": "theme-font-sans",
  "font-serif": "theme-font-serif",
  "font-mono": "theme-font-mono",
  spacing: "theme-spacing",
}

const darkResolvedThemes: ThemeMode[] = ["dark"]

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

const applyThemeToken = (root: HTMLElement, token: string, value: string) => {
  root.style.setProperty(`--${professionalThemeTokenAliases[token] ?? token}`, value)
  if (token !== "spacing") return

  root.style.setProperty("--theme-text-xs", `calc(${value} * 3)`)
  root.style.setProperty("--theme-text-sm", `calc(${value} * 3.5)`)
  root.style.setProperty("--theme-text-base", `calc(${value} * 4)`)
  root.style.setProperty("--theme-text-lg", `calc(${value} * 4.5)`)
  root.style.setProperty("--theme-text-xl", `calc(${value} * 5)`)
}

const applyThemeClass = (mode: ThemeMode, system: ResolvedTheme) => {
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
    ? professionalThemesById.get(professionalThemeMode.id)
    : null
  if (professionalTheme) {
    const tokens = professionalTheme.styles[professionalThemeMode?.variant ?? resolved]
    Object.entries(tokens).forEach(([token, value]) => {
      applyThemeToken(root, token, value)
    })
    root.style.setProperty("--sidebar-background", "var(--sidebar)")
  }
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
    const initial = stored && themeModes.includes(stored) ? stored : "light"
    setThemeState(initial as ThemeMode)
    applyThemeClass(initial as ThemeMode, system)
    setHydrated(true)
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (event: MediaQueryListEvent) => {
      const nextSystem = event.matches ? "dark" : "light"
      setSystemTheme(nextSystem)
      if (hydrated && theme === "system") applyThemeClass("system", nextSystem)
    }
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [theme, hydrated])

  useEffect(() => {
    if (!hydrated) return
    applyThemeClass(theme, systemTheme)
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
