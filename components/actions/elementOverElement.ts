import { DragEndEvent } from '@dnd-kit/core'
import { FormElementInstance } from '@/types/element-type'
import { ContextType, PageType } from '../context/DesignerContext'
import { getChildNodes } from '@/lib/tree'

function calculateNewIndex(
  draggedIndex: number,
  droppedIndex: number,
  isAbove: boolean
): number {
  if (draggedIndex === droppedIndex) {
    return draggedIndex // If the dragged and dropped indices are the same, return the same index
  }
  if (isAbove) {
    if (draggedIndex < droppedIndex) {
      return droppedIndex - 1 // If dropped above and dragged index is less than dropped index, adjust by -1
    } else {
      return droppedIndex // If dropped above and dragged index is greater than dropped index, no change needed
    }
  } else {
    if (draggedIndex < droppedIndex) {
      return droppedIndex // If dropped below and dragged index is less than dropped index, no change needed
    } else {
      return droppedIndex + 1 // If dropped below and dragged index is greater than dropped index, adjust by +1
    }
  }
}

function reindexItems(
  items: FormElementInstance[],
  dragIndex: number,
  dropIndex: number,
  isAbove: boolean,
  selectedPage: string
): FormElementInstance[] | null {
  const updatedItems = [...items]
  const targetIndex = calculateNewIndex(dragIndex, dropIndex, isAbove)

  if (
    !isValidIndex(dragIndex, updatedItems) ||
    !isValidIndex(targetIndex, updatedItems)
  ) {
    console.error('Invalid indices provided')
    return null
  }

  const draggedItem = { ...updatedItems[dragIndex] }
  const dropItem = updatedItems[dropIndex]

  // Update dragged item metadata
  draggedItem.page = selectedPage
  draggedItem.parentId = dropItem.parentId

  // Replace original extraAttributes only if exists
  draggedItem.extraAttributes = structuredClone(draggedItem.extraAttributes)

  // Remove and insert the item in the new position
  updatedItems.splice(dragIndex, 1)
  updatedItems.splice(targetIndex, 0, draggedItem)

  // Update all child pages
  const childrens: FormElementInstance[] = getChildNodes(
    draggedItem,
    updatedItems
  )
  for (const child of childrens) {
    child.page = selectedPage
  }

  // Reindex all items
  return updatedItems.map((item, index) => ({ ...item, index }))
}

// Helper: Validate index bounds
function isValidIndex(index: number, arr: unknown[]): boolean {
  return index >= 0 && index < arr.length
}

export const reIndexed = (items: FormElementInstance[]) =>
  items.map((item, index) => {
    item.index = index
    return item
  })

export function elementOverElement(
  event: DragEndEvent,
  selectedPage: PageType,
  context: ContextType
) {
  const { elements, setElements } = context
  const { active, over } = event
  const isDraggingDesignerElement = active?.data?.current?.isDesignerElement
  const isDroppingOverDesignerElementTopHalf =
    over?.data?.current?.isTopHalfDesigner ?? false
  const isDroppingOverDesignerElementBottomHalf =
    over?.data?.current?.isButtomHalfDesigner ?? false
  const isDroppingOverDesignerElement =
    isDroppingOverDesignerElementTopHalf ||
    isDroppingOverDesignerElementBottomHalf
  const draggingDesignerElementOverAnotherDesignerElement =
    isDroppingOverDesignerElement && isDraggingDesignerElement
  if (draggingDesignerElementOverAnotherDesignerElement) {
    const activeId = active.data.current?.id
    const overId = over?.data.current?.id
    const activeElementIndex = elements.findIndex((el) => el.id == activeId)
    const overElementIndex = elements.findIndex((el) => el.id == overId)
    if (activeElementIndex == -1 || overElementIndex == -1) {
      throw new Error('element not found')
    }
    const newIndexForActiveElement = reindexItems(
      elements,
      activeElementIndex,
      overElementIndex,
      isDroppingOverDesignerElementTopHalf,
      selectedPage.id
    )
    if (newIndexForActiveElement != null) setElements(newIndexForActiveElement)
  }
}
