'use client'

import { ChevronLeft, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import { usePathname } from 'next/navigation'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

import { redirect } from 'next/navigation'

export interface NavItem {
  title: string
  url?: string
  icon?: LucideIcon
  items?: NavItem[]
}

const matchesPath = (current: string, candidate?: string) => {
  if (!candidate) return false
  if (candidate === '/') {
    return current === '/'
  }
  return (
    current === candidate ||
    current.startsWith(`${candidate}/`) ||
    (candidate.endsWith('/') && current === candidate.slice(0, -1))
  )
}

const hasActiveDescendant = (item: NavItem, path: string): boolean => {
  if (matchesPath(path, item.url)) {
    return true
  }

  if (!item.items) {
    return false
  }

  return item.items.some((child) => hasActiveDescendant(child, path))
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname() || '/'

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="h-10">بخش ها</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavItemComponent key={item.title} item={item} activePath={pathname} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavItemComponent({
  item,
  activePath,
}: {
  item: NavItem
  activePath: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const itemHasChildren = Boolean(item.items && item.items.length > 0)
  const isActive = matchesPath(activePath, item.url)
  const activeDescendant = useMemo(
    () => (itemHasChildren ? hasActiveDescendant(item, activePath) : false),
    [activePath, item, itemHasChildren]
  )

  useEffect(() => {
    if (activeDescendant) {
      setIsOpen(true)
    }
  }, [activeDescendant])

  return (
    <SidebarMenuItem className="p-1">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="group/collapsible bg-sidebar w-full overflow-hidden"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant={isActive ? 'default' : 'ghost'}
            className={cn(
              'flex h-auto w-full cursor-pointer flex-row items-center justify-between rounded-xl transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-foreground hover:bg-muted/70'
            )}
          >
            <div className="flex flex-row items-center justify-center">
              {item.icon && (
                <item.icon className="size-6 rounded-full border-2 p-0.5" />
              )}
              <span className="mr-2 text-xs">{item.title}</span>
            </div>
            {itemHasChildren && (
              <ChevronLeft
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isOpen && 'rotate-90'
                )}
              />
            )}
          </Button>
        </CollapsibleTrigger>

        {itemHasChildren && (
          <CollapsibleContent asChild forceMount>
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{
                opacity: isOpen ? 1 : 0,
                height: isOpen ? 'auto' : 0,
                y: isOpen ? 0 : -10,
              }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <SidebarMenuSub className="mx-0 translate-0 p-1">
                {item.items?.map((subItem) => {
                  const subIsActive = hasActiveDescendant(subItem, activePath)

                  return (
                    <SidebarMenuSubItem key={subItem.title}>
                      {subItem.items && subItem.items.length > 0 ? (
                        <SidebarMenuSub>
                          <NavItemComponent item={subItem} activePath={activePath} />
                        </SidebarMenuSub>
                      ) : (
                        <Button
                          onClick={() => {
                            if (subItem.url) {
                              redirect(subItem.url)
                            }
                          }}
                          variant={subIsActive ? 'default' : 'ghost'}
                          className={cn(
                            'flex h-10 w-full cursor-pointer justify-start rounded-xl text-sm',
                            subIsActive
                              ? 'bg-accent text-accent-foreground shadow-sm'
                              : 'text-foreground hover:bg-muted/70'
                          )}
                        >
                          {subItem.title}
                        </Button>
                      )}
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            </motion.div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </SidebarMenuItem>
  )
}
