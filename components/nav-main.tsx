'use client'

import { ChevronLeft, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

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

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: NavItem[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="h-10">بخش ها</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavItemComponent key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavItemComponent({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(item.isActive || false)

  return (
    <SidebarMenuItem>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="group/collapsible w-full overflow-hidden"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant={item.isActive ? 'default' : 'ghost'}
            className={cn(
              'group/abc dark:bg-sidebar dark:text-sidebar-foreground flex h-auto w-full cursor-pointer flex-row items-center justify-between rounded-[0] transition-colors dark:border-0 dark:border-b',
              item.isActive && 'text-background bg-sidebar'
            )}
          >
            <div className="flex flex-row items-center justify-center">
              {item.icon && (
                <item.icon className="border-sidebar-accent group-hover/abc:border-accent-foreground size-6 rounded-full border-2 p-0.5" />
              )}
              <span className="mr-2 text-xs">{item.title}</span>
            </div>
            {item.items && (
              <ChevronLeft
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isOpen && 'rotate-90'
                )}
              />
            )}
          </Button>
        </CollapsibleTrigger>

        {item.items && item.items.length > 0 && (
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
              <SidebarMenuSub className="mx-0 translate-0 p-0">
                {item.items.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    {subItem.items && subItem.items.length > 0 ? (
                      <SidebarMenuSub>
                        <NavItemComponent item={subItem} />
                      </SidebarMenuSub>
                    ) : (
                      <Button
                        variant={'ghost'}
                        className={cn(
                          'bg-sidebar hover:bg-muted-foreground/20 hover:text-foreground flex h-10 w-full cursor-pointer justify-start text-sm',
                          subItem.items && subItem.items.length > 0
                            ? 'mr-0'
                            : 'mr-0'
                        )}
                      >
                        {subItem.title}
                      </Button>
                    )}
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </motion.div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </SidebarMenuItem>
  )
}
