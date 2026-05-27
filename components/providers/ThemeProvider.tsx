"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

type ThemeMode = "light" | "dark" | "system" | "wood"
type ResolvedTheme = "light" | "dark"

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

const applyThemeClass = (mode: ThemeMode, system: ResolvedTheme) => {
  const root = document.documentElement
  if (!root) return
  const resolved = mode === "system" ? system : mode === "dark" ? "dark" : "light"
  root.classList.remove("dark", "wood")
  if (mode === "dark") root.classList.add("dark")
  if (mode === "wood") root.classList.add("wood")
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
    const initial = stored && ["light", "dark", "system", "wood"].includes(stored) ? stored : "light"
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
    const resolvedTheme = theme === "dark" ? "dark" : theme === "system" ? systemTheme : "light"
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
