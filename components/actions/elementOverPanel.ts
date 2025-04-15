import { DragEndEvent } from '@dnd-kit/core'
import { ulid } from 'ulid'
import { ElementType, FormElements } from '@/types/element-type'
import { ContextType, PageType } from '../context/DesignerContext'

export function elementOverPanel(
  event: DragEndEvent,
  selectedPage: PageType,
  context: ContextType
) {
  const { elements, addElement, updateParent } = context
  const { active, over } = event

  const isDesignerBtnElement = active?.data?.current?.isDesignerBtnElement
  const overType = over?.data?.current?.type
  const isDroppingOverTopHalf = over?.data?.current?.isTopHalfDesigner ?? false
  const isDroppingOverBottomHalf =
    over?.data?.current?.isButtomHalfDesigner ?? false
  const isDroppingOverDesignerElement =
    isDroppingOverTopHalf || isDroppingOverBottomHalf

  const isDroppingOverPanelOrFlex = overType === 'panel' || overType === 'flex'

  if (!isDroppingOverPanelOrFlex) {
    return
  }

  if (isDesignerBtnElement && !isDroppingOverDesignerElement) {
    const type = active?.data?.current?.type
    const newElement = FormElements[type as ElementType].construct(
      ulid(10),
      0,
      null,
      selectedPage.id,
      {}
    )
    addElement(
      elements.length,
      newElement,
      over?.data?.current?.extraAttributes.id,
      selectedPage
    )
    return
  }

  if (!isDroppingOverDesignerElement) {
    const elementIndex = elements.findIndex(
      (el) => el.id === active?.data?.current?.id
    )

    if (elementIndex !== -1) {
      elements[elementIndex].page = selectedPage.id
      updateParent(
        elements[elementIndex],
        over?.data?.current?.extraAttributes?.id
      )
    }
  }
}
