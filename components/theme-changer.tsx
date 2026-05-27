'use client'
import { useTheme } from './providers/ThemeProvider'
import { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { SunIcon, MoonIcon, ComputerIcon, TreePine } from 'lucide-react'

const ThemeChanger = () => {
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Tabs defaultValue={theme} className="w-full">
      <TabsList className="bg-background w-full border">
        <TabsTrigger
          className={'cursor-pointer'}
          value={'light'}
          onClick={() => setTheme('light')}
        >
          <SunIcon className="h-[1.2rem] w-[1.2rem] text-yellow-600" />
        </TabsTrigger>
        <TabsTrigger
          className={'cursor-pointer'}
          value={'dark'}
          onClick={() => setTheme('dark')}
        >
          <MoonIcon className="h-[1.2rem] w-[1.2rem] text-blue-700" />
        </TabsTrigger>
        <TabsTrigger
          className={'cursor-pointer'}
          value={'wood'}
          onClick={() => setTheme('wood')}
        >
          <TreePine className="h-[1.2rem] w-[1.2rem] text-amber-700" />
        </TabsTrigger>
        <TabsTrigger
          className={'cursor-pointer'}
          value={'system'}
          onClick={() => setTheme('system')}
        >
          <ComputerIcon className="h-[1.2rem] w-[1.2rem]" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default ThemeChanger
