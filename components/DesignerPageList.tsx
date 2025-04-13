import React, { MouseEvent, useState } from 'react'
import SidebarBtnElement from './SidebarBtnElement'
import { FormElementInstance, FormElements } from './FormElement'
import useDesigner from './hooks/useDesigner'
import FormElementSidebar from './FormElementSidebar';
import PropertiesFormSidebar from './PropertiesFormSidebar';
import { Separator } from './ui/separator';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    Active,
    Over,
    DragEndEvent,
    DragStartEvent,
    useDroppable,
    useDndMonitor,
} from '@dnd-kit/core';
import { IoDuplicateOutline, IoEyeOffOutline, IoTrailSign, IoTrashBin, IoTrashBinOutline } from "react-icons/io5";
import { MdDisabledVisible } from "react-icons/md";
import { ulid } from 'ulid';

import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { useSortable } from '@dnd-kit/sortable';
import { DragHandleDots1Icon, PlusCircledIcon } from '@radix-ui/react-icons';
import { CSS } from "@dnd-kit/utilities";
import { cn } from '@/lib/utils';
import { BiPlus } from 'react-icons/bi';

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function DesignerPageList() {
    const { pages, active, selectedPage, draggedItem, setSelectedPage, setPages, newPage, duplicatePage, deletePage } = useDesigner();
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteData, setDeleteData] = useState({
        id: -1,
        index: -1,
    });

    return (
        <aside className='w-[400px] max-w-[400px]  flex flex-col items-center gap-2 h-full flex-grow  border-l border-muted px-2 bg-background overflowx-y-auto '>
            <div dir='ltr' className='flex flex-col  h-full p-2 w-full flex-grow '>
                <div className='flex flex-row justify-between items-center'>
                    <div className='text-sm h-8 items-center flex text-foreground/70  '>Pages</div>
                    <div className='w-full h-5 flex items-center  justify-end'>
                        <BiPlus className='w-6 h-6 text-foreground/70 cursor-pointer' onClick={() => {
                            newPage({ id: ulid(10), index: 1, name: "Page-1" }, pages.length - 1);
                        }} />
                    </div>
                </div>
                <Separator className='mt-2' />
                <SortableContext
                    items={pages}
                    strategy={verticalListSortingStrategy}
                >
                    <div
                        className='w-full h-full mt-4 flex flex-grow flex-col gap-2 overflow-x-hidden pointer'
                    >
                        {pages.map((page, index) => {
                            return <ContextMenu key={page.id} >
                                <ContextMenuTrigger>
                                    <SortableItem onClick={() => setSelectedPage(page)} key={page.id} id={page.id} index={page.index} page={page} active={active} draggedItem={draggedItem} selectedPage={selectedPage} setSelectedPage={setSelectedPage} />
                                </ContextMenuTrigger>
                                <ContextMenuContent className='divide-y'>
                                    <ContextMenuItem onClick={() => newPage(page, index)} className='flex flex-row gap-2 items-center justify-start w-full py-2 cursor-pointer'>
                                        <PlusCircledIcon className='w-4 h-4' />
                                        <span className='font-light'>New Page</span>
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => duplicatePage(page, index)} className='flex flex-row gap-2 items-center justify-start w-full py-2 cursor-pointer'>
                                        <IoDuplicateOutline className='w-4 h-4' />
                                        <span className='font-light'>Duplicate</span>
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => {
                                        setDeleteData({ id: page.index, index });
                                        setDeleteConfirm(true);
                                    }} className='flex flex-row gap-2 items-center justify-start w-full py-2 cursor-pointer'>
                                        <IoTrashBinOutline className='w-4 h-4' />
                                        <span className='font-light'>Delete</span>
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        })}
                    </div>
                </SortableContext>
                {/* </DndContext> */}

            </div >
            <AlertDialog open={deleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            // deletePage(deleteData.id, deleteData.index);
                            setDeleteConfirm(false);
                            setDeleteData({ id: -1, index: -1 })
                        }}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </aside>
    )
}

export default DesignerPageList



function SortableItem(props: any) {
    const { setSelectedPage } = useDesigner();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: props.id,
        data: {
            type: "page"
        }
    })

    const droppble = useDroppable({
        id: "page-" + props.id,
        data: {
            id: props.id,
            isPage: true
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const switchPage = (event: MouseEvent) => {
        event.stopPropagation();
        props.setSelectedPage(props.page)
    }

    const type = props?.draggedItem?.data?.current?.type;
    const isPage = type == "page";

    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={{ ...style, zIndex: props?.active?.id == props.id ? 9999999 : 9 }} className='w-full flex flex-row gap-2' onContextMenu={() => setSelectedPage(props.page)}>
            <div className={cn('flex relative flex-row gap-2 bg-background p-1 min-w-full h-auto ',
                props.draggedItem?.id == props.id && "opacity-0"
            )} >
                <div
                    onClick={switchPage}
                    className={cn('flex flex-row gap-2 bg-background p-1 w-full')}
                >
                    {!isPage && type !== undefined && <div ref={droppble.setNodeRef} className={cn('w-full bg-red- absolute flex items-center     h-32 rounded-xl',
                    )}></div>}
                    <div className={cn('w-full flex items-center select-none justify-center text-md text-foreground/50 px-2 border cursor-pointer active:ring-2 ring-foreground h-32 rounded-xl',
                        props.selectedPage.id == props.id && "ring ring-foreground/90"
                    )}>{props.page.name}</div>
                </div>
            </div>
        </div>
    )
}
