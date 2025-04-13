import { DragOverEvent } from "@dnd-kit/core";
import { DesignerContextType, PageType } from "../context/DesignerContext";

export function sidebarOrElementOverPage(event: DragOverEvent, selectedPage: PageType, context: DesignerContextType) {
    const { setSelectedPage, pages, setActive } = context;
    const { active, over } = event;
    const isPage = over?.data?.current?.isPage;
    const pageId = over?.data?.current?.id;

    const overPage: PageType | undefined = pages.find(page => page.id == pageId);

    if (isPage && overPage !== undefined) {
        setSelectedPage(overPage);
    }
}