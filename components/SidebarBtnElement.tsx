'use client'
import React from 'react'
import { FormElement } from '../types/element-type'
import { Button } from './ui/button'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

function SidebarBtnElement({ formElement }: { formElement: FormElement }) {
  const { label, icon: Icon } = formElement.designerBtnElement
  const draggble = useDraggable({
    id: `designer-btn-${formElement.type}`,
    data: {
      type: formElement.type,
      isDesignerBtnElement: true,
    },
  })
  return (
    <Button
      ref={draggble.setNodeRef}
      variant={'outline'}
      className={cn(
        'hover:ring-foreground group/sidebar-button flex h-[120px] w-full cursor-grab flex-col gap-2 hover:ring',
        draggble.isDragging && 'ring-primary ring-2'
      )}
      {...draggble.listeners}
      {...draggble.attributes}
    >
      <Icon className="group-hover:/sidebar-button:text-background h-8 w-8 cursor-grab" />
      <p className="group-hover:/sidebar-button:text-background text-xs">
        {label}
      </p>
    </Button>
  )
}

function SidebarBtnElementOverlay({
  formElement,
}: {
  formElement: FormElement
}) {
  const { label, icon: Icon } = formElement.designerBtnElement
  return (
    <Button
      variant={'outline'}
      className={'flex h-[120px] w-[120px] cursor-grab flex-col gap-2'}
    >
      <Icon className="text-primary h-8 w-8 cursor-grab" />
      <p className="text-xs">{label}</p>
    </Button>
  )
}
export default SidebarBtnElement
