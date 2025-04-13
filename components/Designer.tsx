"use client"

import React, { useEffect, useRef, useState } from 'react'
import DesignerSidebar from './DesignerSidebar'
import { DragStartEvent, useDndMonitor, useDraggable, useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils';
import { ElementType, FormElementInstance, FormElements } from './FormElement';
import useDesigner from './hooks/useDesigner';
import { ulid } from 'ulid'
import { BiGrid, BiSolidTrash } from 'react-icons/bi';
import { Button } from './ui/button';
import DesignerPageList from './DesignerPageList';
import { GoGrabber } from "react-icons/go";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LuLocateFixed } from 'react-icons/lu';
import { Separator } from '@radix-ui/react-separator';
import { sidebarOverDesigner } from './actions/sidebarOverDesigner';
import { elementOverPanel } from './actions/elementOverPanel';
import { sidebarOverElement } from './actions/sidebarOverElement';
import { elementOverElement } from './actions/elementOverElement';
import { ContextType, DesignerContextType } from './context/DesignerContext';
import { pageOverPage } from './actions/pageOverPage';
import { sidebarOrElementOverPage } from './actions/sidebarOrElementOverPage';
import { elementOverDesigner } from './actions/elementOverDesinger';
import DesignerNestedTree from './DesignerNestedTree';

function Designer() {
    const activeRef = useRef(null);
    const red = [
        'bg-violet-900',
        'bg-violet-800',
        'bg-violet-700',
        'bg-violet-600',
        'bg-violet-500',
        'bg-violet-400',
        'bg-violet-300',
        'bg-violet-200',
    ];

    const {
        context,
        elements,
        selectedPage,
        selectedElement,
        selectedElementParents,
        setDraggedItem,
        addElement,
        setSelectedElement,
        removeElement,
        updateParent,
        updateSelectedParents,
        swapElement,
        setElements,
        updateElement,
        setSelectedPage,
        leftView,
        setLeftView } = useDesigner();


    const droppable = useDroppable({
        id: 'designer-drop-area',
        data: {
            type: 'designer',
            isDesignerDropArea: true
        }
    });


    useDndMonitor({
        onDragOver: (event) => {
            if (!context) return;
            sidebarOrElementOverPage(event, selectedPage, context);
        },
        onDragEnd: (event) => {
            const { active, over } = event as any;
            if (!active || !over || !context) return;
            active.data.current = (activeRef?.current as any)?.data?.current;
            sidebarOverDesigner(event, selectedPage, context);
            elementOverDesigner(event, selectedPage, context);
            sidebarOverElement(event, selectedPage, context);
            elementOverElement(event, selectedPage, context);
            elementOverPanel(event, selectedPage, context);
            pageOverPage(event, selectedPage, context);
            activeRef.current = null;
        },
        onDragStart: (event: DragStartEvent) => {
            activeRef.current = event?.active as any;
        }
    })

    return (
        <div className='w-full h-full flex-grow flex'>
            {leftView == 'page' && <DesignerPageList />}
            {leftView == 'tree' && <DesignerNestedTree />}
            <div className="pt-4 pb-8 w-full " onClick={() => selectedElement && setSelectedElement(null)}>
                <div ref={droppable.setNodeRef} autoFocus={false} className={cn("bg-background shadow-2xl max-w-[90%] h-full m-auto rounded-xl flex flex-col flex-grow item-center justify-start flex-1 overflow-y-auto",
                    droppable.isOver && "ring-4 ring-foreground",
                )}>
                    <div className='min-h-12 flex items-center justify-between px-4  w-full border-b' >
                        <div className='bg-foreground text-background font-black text-base flex justify-center items-center min-w-6 w-auto px-2 min-h-6  text-center rounded-sm'>
                            {selectedPage.name}
                        </div>
                        <div key={selectedElement?.id} className={cn(' w-max -top-5 hidden flex-row cursor-pointer ',
                            selectedElement && "flex"
                        )}>
                            {selectedElementParents.map((parent: FormElementInstance, index: number) => {
                                return <div
                                    dir='rtl'
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setSelectedElement(parent);
                                        // updateSelectedParents(parent, 0);
                                    }}
                                    key={parent.id + 'nested'}
                                    className={cn('h-auto px-4 text-xs py-1 rounded-l-full flex  flex-row items-center gap-2 w-fit  bg-blue-700 ',
                                        parent?.type == "panel" && red[selectedElementParents.length - index - 1],
                                    )}>
                                    <div
                                        dir='rtl'
                                        className={cn("rounded-full  h-5 items-center flex  ")}
                                    >
                                        <LuLocateFixed className='w-3 h-3 dark:text-foreground text-background' />
                                    </div>
                                    <div className='h-5 flex items-center  w-full dark:text-foreground text-background'>{parent.type}</div>
                                </div>
                            })}
                            <div
                                dir='rtl'
                                onClick={(event) => {
                                    event.stopPropagation();
                                    // updateSelectedParents(parent, 0);
                                }}
                                className={cn('h-auto px-4 text-xs py-1 rounded-l-full flex  flex-row items-center gap-2 w-fit bg-foreground ',)}>
                                <div
                                    dir='rtl'
                                    className={cn("rounded-full  h-5 items-center flex  ")}
                                >
                                    <LuLocateFixed className='w-3 h-3 text-background' />
                                </div>
                                <div className='h-5 flex items-center  w-full  text-background'>{'body'}</div>
                            </div>
                        </div>
                    </div>
                    {!droppable.isOver && elements.filter(el => el.page == selectedPage.id).length == 0 && <p className='text-3xl text-muted-foreground flex flex-grow justify-center items-center font-bold'>
                        Drop here
                    </p>}
                    {droppable.isOver && elements?.length == 0 && (
                        <div className='p-4 w-full'>
                            <div className='h-[120px] rounded-md bg-primary/20'></div>
                        </div>
                    )}
                    <div>
                        {elements.length > 0 && <div className='flex flex-col  w-full  '>
                            {elements.filter(el => el.page == selectedPage.id).filter(el => el.parentId == null).sort((a: FormElementInstance, b: FormElementInstance) => a.index - b.index).map((element, index) => {
                                return <DesignerElementWrapper key={element.id + index} element={element} index={index} row={false} />
                            })}
                        </div>}
                    </div>
                </div>
            </div>
            <DesignerSidebar />
        </div>
    )
}

export function DesignerElementWrapper({ element, index, row }: { element: FormElementInstance, index: number, row: boolean }) {
    const { elements, selectedElement, selectedElementParents, updateSelectedParents, removeElement, setElements, setSelectedElement } = useDesigner();
    const topHalf = useDroppable({
        id: element.id + '-top',
        data: {
            type: element.type,
            id: element.id,
            isTopHalfDesigner: true
        }
    });
    const bottomHalf = useDroppable({
        id: element.id + '-bottom',
        data: {
            type: element.type,
            id: element.id,
            isButtomHalfDesigner: true,
            extraAttributes: {
                id: element.id,
            }
        }
    });

    const draggble = useDraggable({
        id: element.id + "-drag-handler",
        data: {
            type: element.type,
            id: element.id,
            isDesignerElement: true,
            extraAttributes: {
                id: element.id,
            }
        }
    });

    if (draggble.isDragging) return null;


    const DesignerElement = FormElements[element.type].designerComponent;

    return <div
        dir='rtl'
        onClick={(event) => {
            event.stopPropagation();
            setSelectedElement(element);
            updateSelectedParents(element, 0);
        }}
        className={cn('relative w-full h-fit flex flex-col text-foreground bg-background hover:cursor-pointer rounded-md ',
            row && "flex-row"
        )}
    >
        <div key={element.id} className={cn('absolute z-[9999] left-0 right-0 w-max -top-5 hidden flex-row ',
            selectedElement?.id == element.id && "flex"
        )}>
            <div
                dir='rtl'
                className={cn('h-auto px-2   text-xs rounded-l-full  flex flex-row items-center gap-2 w-fit  bg-blue-700 ',
                    element?.type == "panel" && "bg-violet-600",
                )}>
                <div
                    dir='rtl'
                    ref={draggble.setNodeRef}
                    className={cn("rounded-full  h-5 items-center flex ")}
                    {...draggble.listeners}
                    {...draggble.attributes}
                >
                    <GoGrabber className='w-5 h-5 dark:text-foreground text-background' />
                </div>
                <div className='h-5 flex  items-center w-fit dark:text-foreground text-background '>{element.type}</div>
            </div>

        </div>
        <div
            className={cn('flex relative border-muted-foreground/10 flex-col w-full min-h-[2rem] h-auto    ',
                row && "flex-row",
                selectedElement?.id == element.id && "border border-blue-700 ",
                selectedElement?.id == element.id && element?.type == "panel" && "border-violet-600"
            )}>
            {draggble.active && <div ref={topHalf.setNodeRef} className={cn("absolute z-[10] right-0 h-full flex-grow  min-w-[2rem] max-w-[2rem] opacity-100",
                !row && "h-[10px]  min-w-full left-0 right-0 top-0 z-[99]  ",
            )} >
            </div>}
            {topHalf.isOver && <div className='ring-4 ring-foreground/70 z-[100]'></div>}
            <DesignerElement elementInstance={element} />
            {bottomHalf.isOver && <div className='ring-4 ring-foreground/70 z-[100]'></div>}
            {draggble.active && <div ref={bottomHalf.setNodeRef} className={cn(" absolute z-[10] left-0 h-full flex-grow  min-w-[2rem] max-w-[2rem] opacity-100 ",
                !row && "h-[10px]  min-w-full left-0 right-0 bottom-0 z-[99]  ",
            )}></div>}
        </div>
    </div >;
}

export default Designer