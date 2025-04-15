'use client'
import { useRef } from 'react'
import DesignerSidebar from './DesignerSidebar'
import {
  DragStartEvent,
  useDndMonitor,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { FormElementInstance, FormElements } from '../types/element-type'
import useDesigner from './hooks/useDesigner'
import DesignerPageList from './DesignerPageList'
import { GoGrabber } from 'react-icons/go'
import { LuLocateFixed } from 'react-icons/lu'
import { sidebarOverDesigner } from './actions/sidebarOverDesigner'
import { elementOverPanel } from './actions/elementOverPanel'
import { sidebarOverElement } from './actions/sidebarOverElement'
import { elementOverElement } from './actions/elementOverElement'
import { pageOverPage } from './actions/pageOverPage'
import { sidebarOrElementOverPage } from './actions/sidebarOrElementOverPage'
import { elementOverDesigner } from './actions/elementOverDesinger'
import DesignerNestedTree from './DesignerNestedTree'
import { Tabs, TabsContent } from './ui/tabs'
import { SidebarViewType } from './context/DesignerContext'

function Designer() {
  const activeRef = useRef<{
    data?: { current?: DragStartEvent['active']['data']['current'] }
  } | null>(null)

  const red = [
    'bg-violet-900',
    'bg-violet-800',
    'bg-violet-700',
    'bg-violet-600',
    'bg-violet-500',
    'bg-violet-400',
    'bg-violet-300',
    'bg-violet-200',
  ]

  const {
    context,
    elements,
    selectedPage,
    selectedElement,
    selectedElementParents,
    setSelectedElement,
    leftView,
    setLeftView,
  } = useDesigner()

  const droppable = useDroppable({
    id: 'designer-drop-area',
    data: {
      type: 'designer',
      isDesignerDropArea: true,
    },
  })

  useDndMonitor({
    onDragOver: (event) => {
      if (!context) return
      sidebarOrElementOverPage(event, selectedPage, context)
    },
    onDragEnd: (event) => {
      const { active, over } = event
      if (!active || !over || !context) return
      active.data.current = activeRef?.current?.data?.current
      sidebarOverDesigner(event, selectedPage, context)
      elementOverDesigner(event, selectedPage, context)
      sidebarOverElement(event, selectedPage, context)
      elementOverElement(event, selectedPage, context)
      elementOverPanel(event, selectedPage, context)
      pageOverPage(event, selectedPage, context)
      activeRef.current = null
    },
    onDragStart: (event: DragStartEvent) => {
      activeRef.current = event?.active
    },
  })

  return (
    <div className="flex h-full w-full flex-grow">
      <Tabs
        defaultValue="page"
        value={leftView}
        onValueChange={(value) => setLeftView(value as SidebarViewType)}
      >
        <TabsContent
          value="page"
          forceMount={true}
          hidden={leftView !== 'page'}
        >
          <DesignerPageList />
        </TabsContent>
        <TabsContent
          value="tree"
          forceMount={true}
          hidden={leftView !== 'tree'}
        >
          <DesignerNestedTree />
        </TabsContent>
      </Tabs>
      <div
        className="w-full pt-4 pb-8"
        onClick={() => selectedElement && setSelectedElement(null)}
      >
        <div
          ref={droppable.setNodeRef}
          autoFocus={false}
          className={cn(
            'bg-background item-center m-auto flex h-full max-w-[90%] flex-1 flex-grow flex-col justify-start overflow-y-auto rounded-xl shadow-2xl',
            droppable.isOver && 'ring-foreground ring-4'
          )}
        >
          <div className="flex min-h-12 w-full items-center justify-between border-b px-4">
            <div className="bg-foreground text-background flex min-h-6 w-auto min-w-6 items-center justify-center rounded-sm px-2 text-center text-base font-black">
              {selectedPage.name}
            </div>
            <div
              key={selectedElement?.id}
              className={cn(
                '-top-5 hidden w-max cursor-pointer flex-row',
                selectedElement && 'flex'
              )}
            >
              {selectedElementParents.map(
                (parent: FormElementInstance, index: number) => {
                  return (
                    <div
                      dir="rtl"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedElement(parent)
                        // updateSelectedParents(parent, 0);
                      }}
                      key={parent.id + 'nested'}
                      className={cn(
                        'flex h-auto w-fit flex-row items-center gap-2 rounded-l-full bg-blue-700 px-4 py-1 text-xs',
                        parent?.type == 'panel' &&
                          red[selectedElementParents.length - index - 1]
                      )}
                    >
                      <div
                        dir="rtl"
                        className={cn('flex h-5 items-center rounded-full')}
                      >
                        <LuLocateFixed className="dark:text-foreground text-background h-3 w-3" />
                      </div>
                      <div className="dark:text-foreground text-background flex h-5 w-full items-center">
                        {parent.type}
                      </div>
                    </div>
                  )
                }
              )}
              <div
                dir="rtl"
                onClick={(event) => {
                  event.stopPropagation()
                  // updateSelectedParents(parent, 0);
                }}
                className={cn(
                  'bg-foreground flex h-auto w-fit flex-row items-center gap-2 rounded-l-full px-4 py-1 text-xs'
                )}
              >
                <div
                  dir="rtl"
                  className={cn('flex h-5 items-center rounded-full')}
                >
                  <LuLocateFixed className="text-background h-3 w-3" />
                </div>
                <div className="text-background flex h-5 w-full items-center">
                  {'body'}
                </div>
              </div>
            </div>
          </div>
          {!droppable.isOver &&
            elements.filter((el) => el.page == selectedPage.id).length == 0 && (
              <p className="text-muted-foreground flex flex-grow items-center justify-center text-3xl font-bold">
                Drop here
              </p>
            )}
          {droppable.isOver && elements?.length == 0 && (
            <div className="w-full p-4">
              <div className="bg-primary/20 h-[120px] rounded-md"></div>
            </div>
          )}
          <div>
            {elements.length > 0 && (
              <div className="flex w-full flex-col">
                {elements
                  .filter((el) => el.page == selectedPage.id)
                  .filter((el) => el.parentId == null)
                  .sort(
                    (a: FormElementInstance, b: FormElementInstance) =>
                      a.index - b.index
                  )
                  .map((element, index) => {
                    return (
                      <DesignerElementWrapper
                        key={element.id + index}
                        element={element}
                        index={index}
                        row={false}
                      />
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
      <DesignerSidebar />
    </div>
  )
}

export function DesignerElementWrapper({
  element,
  row,
}: {
  element: FormElementInstance
  index: number
  row: boolean
}) {
  const { selectedElement, updateSelectedParents, setSelectedElement } =
    useDesigner()
  const topHalf = useDroppable({
    id: element.id + '-top',
    data: {
      type: element.type,
      id: element.id,
      isTopHalfDesigner: true,
    },
  })
  const bottomHalf = useDroppable({
    id: element.id + '-bottom',
    data: {
      type: element.type,
      id: element.id,
      isButtomHalfDesigner: true,
      extraAttributes: {
        id: element.id,
      },
    },
  })

  const draggble = useDraggable({
    id: element.id + '-drag-handler',
    data: {
      type: element.type,
      id: element.id,
      isDesignerElement: true,
      extraAttributes: {
        id: element.id,
      },
    },
  })

  if (draggble.isDragging) return null

  const DesignerElement = FormElements[element.type].designerComponent

  return (
    <div
      dir="rtl"
      onClick={(event) => {
        event.stopPropagation()
        setSelectedElement(element)
        updateSelectedParents(element, 0)
      }}
      className={cn(
        'text-foreground bg-background relative flex h-fit w-full flex-col rounded-md hover:cursor-pointer',
        row && 'flex-row'
      )}
    >
      <div
        key={element.id}
        className={cn(
          'absolute -top-5 right-0 left-0 z-[9999] hidden w-max flex-row',
          selectedElement?.id == element.id && 'flex'
        )}
      >
        <div
          dir="rtl"
          className={cn(
            'flex h-auto w-fit flex-row items-center gap-2 rounded-l-full bg-blue-700 px-2 text-xs',
            element?.type == 'panel' && 'bg-violet-600'
          )}
        >
          <div
            dir="rtl"
            ref={draggble.setNodeRef}
            className={cn('flex h-5 items-center rounded-full')}
            {...draggble.listeners}
            {...draggble.attributes}
          >
            <GoGrabber className="dark:text-foreground text-background h-5 w-5" />
          </div>
          <div className="dark:text-foreground text-background flex h-5 w-fit items-center">
            {element.type}
          </div>
        </div>
      </div>
      <div
        className={cn(
          'border-muted-foreground/10 relative flex h-auto min-h-[2rem] w-full flex-col',
          row && 'flex-row',
          selectedElement?.id == element.id && 'border border-blue-700',
          selectedElement?.id == element.id &&
            element?.type == 'panel' &&
            'border-violet-600'
        )}
      >
        {draggble.active && (
          <div
            ref={topHalf.setNodeRef}
            className={cn(
              'absolute right-0 z-[10] h-full max-w-[2rem] min-w-[2rem] flex-grow opacity-100',
              !row && 'top-0 right-0 left-0 z-[99] h-[10px] min-w-full'
            )}
          ></div>
        )}
        {topHalf.isOver && (
          <div className="ring-foreground/70 z-[100] ring-4"></div>
        )}
        <DesignerElement elementInstance={element} />
        {bottomHalf.isOver && (
          <div className="ring-foreground/70 z-[100] ring-4"></div>
        )}
        {draggble.active && (
          <div
            ref={bottomHalf.setNodeRef}
            className={cn(
              'absolute left-0 z-[10] h-full max-w-[2rem] min-w-[2rem] flex-grow opacity-100',
              !row && 'right-0 bottom-0 left-0 z-[99] h-[10px] min-w-full'
            )}
          ></div>
        )}
      </div>
    </div>
  )
}

export default Designer
