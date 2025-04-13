import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { DesignerContextType, PageType } from '../context/DesignerContext'

export function pageOverPage(
  event: DragEndEvent,
  selectedPage: PageType,
  context: DesignerContextType
) {
  const { setSelectedPage } = context
  const { active, over } = event
  const { setPages } = context

  if (
    active?.id !== over?.id &&
    over?.id !== undefined &&
    active?.data?.current?.type == 'page'
  ) {
    setPages((pages: PageType[]) => {
      const oldIndex = pages.findIndex((item) => item.id === active.id)
      const newIndex = pages.findIndex((item) => item.id === over.id)
      const updatedPages = arrayMove(pages, oldIndex, newIndex)
      setSelectedPage(updatedPages[newIndex])
      return updatedPages
    })
  }
}
