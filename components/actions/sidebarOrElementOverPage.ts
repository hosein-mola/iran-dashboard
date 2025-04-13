import { DragOverEvent } from '@dnd-kit/core'
import { DesignerContextType, PageType } from '../context/DesignerContext'

export function sidebarOrElementOverPage(
  event: DragOverEvent,
  selectedPage: PageType,
  context: DesignerContextType
) {
  const { setSelectedPage, pages } = context
  const { over, active } = event
  const isOverPage = over?.data?.current?.type == 'page'
  const pageId = over?.id
  const isPanelDragged = active.data.current?.type == 'panel'
  const overPage: PageType | undefined = pages.find((page) => page.id == pageId)

  if (isOverPage && isPanelDragged && overPage !== undefined) {
    setSelectedPage(overPage)
  }
}
