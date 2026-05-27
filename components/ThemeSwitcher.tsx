"use client"
import { DesktopIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { TreePine } from 'lucide-react'
import { useTheme } from './providers/ThemeProvider'
import React, { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Tabs defaultValue={theme}>
      <TabsList className="border">
        <TabsTrigger value={'light'} onClick={() => setTheme('light')}>
          <SunIcon className="h-[1.2rem] w-[1.2rem]" />
        </TabsTrigger>
        <TabsTrigger value={'dark'} onClick={() => setTheme('dark')}>
          <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
        </TabsTrigger>
        <TabsTrigger value={'wood'} onClick={() => setTheme('wood')}>
          <TreePine className="h-[1.2rem] w-[1.2rem]" />
        </TabsTrigger>
        <TabsTrigger value={'system'} onClick={() => setTheme('system')}>
          <DesktopIcon className="h-[1.2rem] w-[1.2rem]" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default ThemeSwitcher
