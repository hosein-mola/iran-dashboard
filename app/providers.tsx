'use client'

import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ThemeOverlayButton } from '@/components/ThemeOverlayButton'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ThemeOverlayButton />
    </ThemeProvider>
  )
}
