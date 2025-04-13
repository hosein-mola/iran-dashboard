import { MouseEvent, useState } from 'react'
import useDesigner from './hooks/useDesigner'
import { Separator } from './ui/separator'
import { useDroppable } from '@dnd-kit/core'
import { IoDuplicateOutline, IoTrashBinOutline } from 'react-icons/io5'
import { ulid } from 'ulid'

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { useSortable } from '@dnd-kit/sortable'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { BiPlus } from 'react-icons/bi'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

function DesignerPageList() {
  const {
    pages,
    active,
    selectedPage,
    draggedItem,
    setSelectedPage,
    newPage,
    duplicatePage,
  } = useDesigner()

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [, setDeleteData] = useState({
    id: -1,
    index: -1,
  })

  return (
    <aside className="border-muted bg-background overflowx-y-auto flex h-full w-[400px] max-w-[400px] flex-grow flex-col items-center gap-2 border-l px-2">
      <div dir="ltr" className="flex h-full w-full flex-grow flex-col p-2">
        <div className="flex flex-row items-center justify-between">
          <div className="text-foreground/70 flex h-8 items-center text-sm">
            Pages
          </div>
          <div className="flex h-5 w-full items-center justify-end">
            <BiPlus
              className="text-foreground/70 h-6 w-6 cursor-pointer"
              onClick={() => {
                newPage(
                  { id: ulid(10), index: 1, name: 'Page-1' },
                  pages.length - 1
                )
              }}
            />
          </div>
        </div>
        <Separator className="mt-2" />
        <SortableContext items={pages} strategy={verticalListSortingStrategy}>
          <div className="pointer mt-4 flex h-full w-full flex-grow flex-col gap-2 overflow-x-hidden">
            {pages.map((page, index) => {
              return (
                <ContextMenu key={page.id}>
                  <ContextMenuTrigger>
                    <SortableItem
                      onClick={() => setSelectedPage(page)}
                      key={page.id}
                      id={page.id}
                      index={page.index}
                      page={page}
                      selectedPage={selectedPage}
                      setSelectedPage={setSelectedPage}
                      active={active ? { id: String(active.id) } : null}
                      draggedItem={
                        draggedItem as
                          | {
                              id: string | number
                              data: { current: { type: string } }
                            }
                          | null
                          | undefined
                      }
                    />
                  </ContextMenuTrigger>
                  <ContextMenuContent className="divide-y">
                    <ContextMenuItem
                      onClick={() => newPage(page, index)}
                      className="flex w-full cursor-pointer flex-row items-center justify-start gap-2 py-2"
                    >
                      <PlusCircledIcon className="h-4 w-4" />
                      <span className="font-light">New Page</span>
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => duplicatePage(page, index)}
                      className="flex w-full cursor-pointer flex-row items-center justify-start gap-2 py-2"
                    >
                      <IoDuplicateOutline className="h-4 w-4" />
                      <span className="font-light">Duplicate</span>
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        setDeleteData({ id: page.index, index })
                        setDeleteConfirm(true)
                      }}
                      className="flex w-full cursor-pointer flex-row items-center justify-start gap-2 py-2"
                    >
                      <IoTrashBinOutline className="h-4 w-4" />
                      <span className="font-light">Delete</span>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              )
            })}
          </div>
        </SortableContext>
        {/* </DndContext> */}
      </div>
      <AlertDialog open={deleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // deletePage(deleteData.id, deleteData.index);
                setDeleteConfirm(false)
                setDeleteData({ id: -1, index: -1 })
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  )
}

export default DesignerPageList

interface SortableItemProps {
  id: string
  index: number
  page: { id: string; name: string; index: number }
  active: { id: string } | null
  draggedItem:
    | { id: string | number; data: { current: { type: string } } }
    | null
    | undefined
  selectedPage: { id: string }
  setSelectedPage: (page: { id: string; name: string; index: number }) => void
  onClick?: () => void
}

function SortableItem(props: SortableItemProps) {
  const { setSelectedPage, selectedPage, draggedItem } = useDesigner()
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props.id,
      data: {
        type: 'page',
      },
      transition: {
        duration: 150, // milliseconds
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    })

  useDroppable({
    id: 'page-' + props.id,
    data: {
      id: props.id,
      isPage: true,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const switchPage = (event: MouseEvent) => {
    event.stopPropagation()
    props.setSelectedPage(props.page)
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, zIndex: props?.active?.id == props.id ? 9999999 : 9 }}
      {...attributes}
      {...listeners}
      className={cn(
        'text-md text-foreground/50 ring-foreground flex h-32 w-full cursor-pointer flex-row items-center justify-center gap-2 rounded-xl border p-2 px-2 select-none',
        draggedItem != null && draggedItem?.id === props.id
          ? 'opacity-0'
          : 'opacity-100',
        selectedPage.id === props.id && 'border-foreground/90 border'
      )}
      onClick={switchPage}
      onContextMenu={() => setSelectedPage(props.page)}
    >
      {props.page.name}
    </div>
  )
}
