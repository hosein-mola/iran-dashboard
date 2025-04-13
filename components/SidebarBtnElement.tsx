"use client"
import React from 'react'
import { FormElement } from './FormElement'
import { Button } from './ui/button';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

function SidebarBtnElement({ formElement }: { formElement: FormElement }) {

    const { label, icon: Icon } = formElement.designerBtnElement;
    const draggble = useDraggable({
        id: `designer-btn-${formElement.type}`,
        data: {
            type: formElement.type,
            isDesignerBtnElement: true
        }
    });
    return <Button
        ref={draggble.setNodeRef}
        variant={'outline'}
        className={cn('flex flex-col hover:ring hover:ring-foreground cursor-grab w-full gap-2 h-[120px] ', draggble.isDragging && "ring-2 ring-primary")}
        {...draggble.listeners}
        {...draggble.attributes}
    >
        <Icon className='h-8 w-8 text-primary cursor-grab' />
        <p className='text-xs'>{label}</p>
    </Button>
}

function SidebarBtnElementOverlay({ formElement }: { formElement: FormElement }) {
    const { label, icon: Icon } = formElement.designerBtnElement;
    return <Button
        variant={'outline'}
        className={'flex flex-col gap-2 h-[120px] w-[120px] cursor-grab'}
    >
        <Icon className='h-8 w-8 text-primary cursor-grab' />
        <p className='text-xs'>{label}</p>
    </Button>
}
export default SidebarBtnElement