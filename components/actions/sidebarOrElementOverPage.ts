import { DragOverEvent } from '@dnd-kit/core'
import { DesignerContextType, PageType } from '../context/DesignerContext'

export function sidebarOrElementOverPage(
  event: DragOverEvent,
  selectedPage: PageType,
  context: DesignerContextType
) {
  const { setSelectedPage, pages } = context
  const { over, active } = event
  const pageId = over?.id
  const isOverPageType = over?.data?.current?.type == 'page'
  const isPageTypeDragged = active.data.current?.type == 'page'
  const overPage: PageType | undefined = pages.find((page) => page.id == pageId)

  if (isOverPageType && overPage !== undefined && isPageTypeDragged == false) {
    setSelectedPage(overPage)
  }
}
