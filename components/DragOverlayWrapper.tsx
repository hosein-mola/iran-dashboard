"use client"
import { Active, DragOverlay, useDndMonitor } from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import React, { useState } from 'react'
import SidebarBtnElement from './SidebarBtnElement';
import { ElementType, FormElements } from './FormElement';
import useDesigner from './hooks/useDesigner';
import { cn } from '@/lib/utils';

function DragOverlayWrapper() {
    const { elements, draggedItem, setDraggedItem } = useDesigner();
    useDndMonitor({
        onDragStart: (event) => {
            setDraggedItem(event.active);
        },
        onDragCancel: (event) => {
            setDraggedItem(null);
        },
        onDragEnd: (event) => {
            setDraggedItem(null);
        },
    })

    if (draggedItem == null) return null;
    let node = <div>No drag overlay</div>;

    const isPage = draggedItem?.data?.current?.type == 'page';
    if (isPage) {
        node = <div dir='rtl' className='flex flex-row gap-2 bg-background p-1'  >
            <div
                className={cn('flex flex-row gap-2 bg-background p-1 w-full')}
            >
                <div className={cn('w-full flex  items-center px-2 border cursor-pointer active:ring-2 ring-foreground h-32 rounded-xl',
                    "ring-2 ring-foreground"
                )}>{ }</div>
            </div>
        </div>
    }
    const isSidebarBtnElemnt = draggedItem?.data?.current?.isDesignerBtnElement;
    if (isSidebarBtnElemnt) {
        const type = draggedItem.data?.current?.type as ElementType;
        node = <div className='w-full flex flex-grow  bg-accent border rounded-md min-h-[120px] min-w-[120px] scale-[0.5]    !pointer-events-none  '>
            <SidebarBtnElement formElement={FormElements?.[type]} />
        </div>
    }

    const isDesignerElement = draggedItem?.data?.current?.isDesignerElement;
    if (isDesignerElement == true) {
        const id = draggedItem?.data?.current?.id;
        const element = elements.find(el => el.id == id);
        if (element == null) {
            node = <div>element not found</div>
        } else {
            const DesignerElementComponent = FormElements?.[element?.type];
            node = <div className='w-full flex flex-grow  bg-accent border rounded-md min-h-[120px] min-w-[120px] scale-[0.5]    !pointer-events-none  '>
                <SidebarBtnElement formElement={DesignerElementComponent} />
            </div>
        }
    }


    return (
        <DragOverlay modifiers={[snapCenterToCursor]}>
            {node}
        </DragOverlay >
    )
}

export default DragOverlayWrapper