import { Active, DragEndEvent, Over } from '@dnd-kit/core'
import { ulid } from 'ulid'
import {
  ElementType,
  FormElementInstance,
  FormElements,
} from '@/types/element-type'
import useDesigner from '../hooks/useDesigner'
import { ContextType, PageType } from '../context/DesignerContext'

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
// Function to reindex items
function reindexItems(
  items: any,
  dragIndex: number,
  dropIndex: number,
  isAbove: boolean,
  selectedPage: string
): any {
  let cloneItems = [...items]
  const newDropItem = calculateNewIndex(dragIndex, dropIndex, isAbove)
  function moveItem<T>(
    arr: any,
    sourceIndex: number,
    destinationIndex: number,
    prevDropIndex: number
  ): any {
    // Check if the indices are valid
    if (
      sourceIndex < 0 ||
      sourceIndex >= arr.length ||
      destinationIndex < 0 ||
      destinationIndex >= arr.length
    ) {
      console.error('Invalid indices provided')
      return
    }
    console.log('sourceIndex', arr[sourceIndex])
    console.log('prevDropIndex', arr[prevDropIndex])
    console.log('destinationIndex', arr[destinationIndex])
    arr[sourceIndex].page = selectedPage
    arr[sourceIndex].parentId = arr[prevDropIndex].parentId
    const arrTemp = structuredClone(arr[sourceIndex])
    // Remove the item from the source position
    const itemToMove = arr.splice(sourceIndex, 1)[0]
    itemToMove.extraAttributes = arrTemp.extraAttributes
    // Insert the item into the destination position
    arr.splice(destinationIndex, 0, itemToMove)
    return arr
  }

  cloneItems = moveItem(cloneItems, dragIndex, newDropItem, dropIndex)

  const reIndexed = cloneItems.map((item, index) => {
    item.index = index
    return item
  })
  return reIndexed
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
  const {
    elements,
    addElement,
    setElements,
    setSelectedElement,
    updateIndex,
    removeElement,
  } = context
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
    let newIndexForActiveElement = reindexItems(
      elements,
      activeElementIndex,
      overElementIndex,
      isDroppingOverDesignerElementTopHalf,
      selectedPage.id
    )
    setElements(newIndexForActiveElement)
    setSelectedElement(null)
  } else {
  }
}
