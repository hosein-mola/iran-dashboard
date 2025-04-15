import { DragEndEvent } from '@dnd-kit/core'
import { FormElementInstance } from '@/types/element-type'
import { DesignerContextType, PageType } from '../context/DesignerContext'
import { getChildNodes } from '@/lib/tree'

export function elementOverDesigner(
  event: DragEndEvent,
  selectedPage: PageType,
  context: DesignerContextType
) {
  const { elements, setElements } = context
  const { active, over } = event

  const isDroppingOverDesignerArea = over?.data?.current?.isDesignerDropArea

  if (isDroppingOverDesignerArea) {
    if (elements && selectedPage) {
      const activeIndex = elements.findIndex(
        (element: FormElementInstance) =>
          element.id == active?.data?.current?.id
      )
      if (activeIndex == -1) return
      const cloneElements = [...elements]
      console.log('🚀 ~ activeIndex:', cloneElements[activeIndex])
      const clone = { ...cloneElements[activeIndex] }
      clone.page = selectedPage.id
      const cloneChilds = getChildNodes(clone, cloneElements).map(
        (child) => child.id
      )
      console.log('🚀 ~ cloneChilds:', cloneChilds)
      const updatedClone = cloneElements.map((child) => {
        if (cloneChilds.includes(child.id)) {
          child.page = selectedPage.id
        }
        return child
      })
      clone.parentId = null
      updatedClone[activeIndex] = clone
      setElements(updatedClone)
    }
  }
}
