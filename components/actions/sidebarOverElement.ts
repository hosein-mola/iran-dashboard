import { Active, DragEndEvent, Over } from "@dnd-kit/core";
import { ulid } from "ulid";
import { ElementType, FormElementInstance, FormElements } from '@/components/FormElement';
import useDesigner from "../hooks/useDesigner";
import { ContextType, PageType } from "../context/DesignerContext";

export function sidebarOverElement(event: DragEndEvent, selectedPage: PageType, context: ContextType) {
    const { elements, addElement, removeElement } = context;
    const { active, over } = event;

    const isDroppingOverDesignerElementTopHalf = over?.data?.current?.isTopHalfDesigner ?? false;
    const isDroppingOverDesignerElementBottomHalf = over?.data?.current?.isButtomHalfDesigner ?? false;
    const isDroppingOverDesignerElement = isDroppingOverDesignerElementTopHalf || isDroppingOverDesignerElementBottomHalf;
    const isDesignerBtnElement = active?.data?.current?.isDesignerBtnElement;
    const droppingSidebarButtonOverDesingerElement = isDesignerBtnElement && isDroppingOverDesignerElement;
    if (elements == undefined) return;
    if (droppingSidebarButtonOverDesingerElement) {
        const overType = over?.data?.current?.type;
        const overId = over?.data?.current?.id;
        const type = active?.data?.current?.type;
        const overIndex = over?.data?.current?.index;
        const overElementIndex = elements?.findIndex(el => el.id == overId);
        if (overElementIndex === -1) {
            throw new Error('Element not found');
        }
        let indexForNewElement = overElementIndex;
        if (isDroppingOverDesignerElementBottomHalf) {
            indexForNewElement = overElementIndex + 1;
        }
        const newElement = FormElements[type as ElementType].construct(ulid(10), indexForNewElement, null, selectedPage.id, {});
        addElement(indexForNewElement, newElement, elements[overElementIndex].parentId, selectedPage);
    }
}