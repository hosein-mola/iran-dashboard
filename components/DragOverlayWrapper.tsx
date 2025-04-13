'use client'
import { Active, DragOverlay, useDndMonitor } from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import React, { useState } from 'react'
import SidebarBtnElement from './SidebarBtnElement'
import { ElementType, FormElements } from './FormElement'
import useDesigner from './hooks/useDesigner'
import { cn } from '@/lib/utils'

function DragOverlayWrapper() {
  const { elements, draggedItem, setDraggedItem } = useDesigner()
  useDndMonitor({
    onDragStart: (event) => {
      setDraggedItem(event.active)
    },
    onDragCancel: () => {
      setDraggedItem(null)
    },
    onDragEnd: () => {
      setDraggedItem(null)
    },
  })

  if (draggedItem == null) return null
  let node = <div>No drag overlay</div>

  const isPage = draggedItem?.data?.current?.type == 'page'

  if (isPage) {
    node = (
      <div dir="rtl" className="bg-background flex flex-row gap-2 p-1">
        <div className={cn('bg-background flex w-full flex-row gap-2 p-1')}>
          <div
            className={cn(
              'ring-foreground flex h-32 w-full cursor-pointer items-center rounded-xl border px-2 active:ring-2',
              'ring-foreground ring-2'
            )}
          >
            {}
          </div>
        </div>
      </div>
    )
  }
  const isSidebarBtnElemnt = draggedItem?.data?.current?.isDesignerBtnElement
  if (isSidebarBtnElemnt) {
    const type = draggedItem.data?.current?.type as ElementType
    node = (
      <div className="bg-accent !pointer-events-none flex min-h-[120px] w-full min-w-[120px] flex-grow scale-[0.5] rounded-md border">
        <SidebarBtnElement formElement={FormElements?.[type]} />
      </div>
    )
  }

  const isDesignerElement = draggedItem?.data?.current?.isDesignerElement
  if (isDesignerElement == true) {
    const id = draggedItem?.data?.current?.id
    const element = elements.find((el) => el.id == id)
    if (element == null) {
      node = <div>element not found</div>
    } else {
      const DesignerElementComponent = FormElements?.[element?.type]
      node = (
        <div className="bg-accent !pointer-events-none flex min-h-[120px] w-full min-w-[120px] flex-grow scale-[0.5] rounded-md border">
          <SidebarBtnElement formElement={DesignerElementComponent} />
        </div>
      )
    }
  }

  return <DragOverlay modifiers={[snapCenterToCursor]}>{node}</DragOverlay>
}

export default DragOverlayWrapper
