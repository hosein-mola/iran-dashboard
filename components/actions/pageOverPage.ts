import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { DesignerContextType, PageType } from "../context/DesignerContext";
import { FormElementInstance } from "../FormElement";


export function pageOverPage(event: DragEndEvent, selectedPage: PageType, context: DesignerContextType) {
    const { elements, pages, setElements, setSelectedPage } = context;
    const { active, over } = event;
    const { setPages } = context;

    if (active?.id !== over?.id && over?.id !== undefined && active?.data?.current?.type == 'page') {
        setPages((pages: PageType[]) => {
            const oldIndex = pages.findIndex(item => item.id === active.id);
            const newIndex = pages.findIndex(item => item.id === over.id);
            return arrayMove(pages, oldIndex, newIndex);
        });
        const findPage = pages.find(page => page.id == active.id);
        if (findPage !== undefined) {
            setSelectedPage(findPage);
        }
        // const cloneElements = JSON.parse(JSON.stringify(elements));
        // const clonePages = JSON.parse(JSON.stringify(pages)).sort((a: number, b: number) => a - b);;
        // const updatedElements = cloneElements.map((element: any) => {
        //     const pageIndex = clonePages.indexOf(element.page);
        //     if (pageIndex !== -1) {
        //         return { ...element, page: pageIndex + 1 };
        //     } else {
        //         return element;
        //     }
        // });
        // setElements(updatedElements);
    }
}