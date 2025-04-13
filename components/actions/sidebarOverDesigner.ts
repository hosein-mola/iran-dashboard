import { Active, DragEndEvent, Over } from "@dnd-kit/core";
import { ulid } from "ulid";
import { ElementType, FormElementInstance, FormElements } from '@/components/FormElement';
import useDesigner from "../hooks/useDesigner";
import { ContextType, PageType } from "../context/DesignerContext";


export function sidebarOverDesigner(event: DragEndEvent, selectedPage: PageType | undefined, context: ContextType) {
    const { elements, addElement, removeElement } = context;
    const { active, over } = event;
    const overType = over?.data?.current?.type;
    const overId = over?.data?.current?.id;
    const isDroppingOverDesignerArea = over?.data?.current?.isDesignerDropArea;
    const isDesignerBtnElement = active?.data?.current?.isDesignerBtnElement;
    const droppingSidebarButtonOverDesignerArea = isDesignerBtnElement && isDroppingOverDesignerArea;
    if (droppingSidebarButtonOverDesignerArea) {
        const type = active?.data?.current?.type;
        if (elements && selectedPage) {
            const newElement = FormElements[type as ElementType].construct(ulid(10), 0, null, selectedPage.id, {});
            addElement(elements.length, newElement, null, selectedPage);
        }
    }
}