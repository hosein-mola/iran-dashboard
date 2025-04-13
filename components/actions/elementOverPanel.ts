import { Active, DragEndEvent, Over } from "@dnd-kit/core";
import { ulid } from "ulid";
import { ElementType, FormElementInstance, FormElements } from '@/components/FormElement';
import useDesigner from "../hooks/useDesigner";
import { ContextType, PageType } from "../context/DesignerContext";
import { reIndexed } from "./elementOverElement";
export function elementOverPanel(event: DragEndEvent, selectedPage: PageType, context: ContextType) {
    const { elements, setElements, addElement, updateParent, removeElement } = context;
    const { active, over } = event;
    const isDesignerBtnElement = active?.data?.current?.isDesignerBtnElement;
    const overType = over?.data?.current?.type;
    const activeId = active.data.current?.id;
    const overId = over?.data.current?.id;
    const isDroppingOverDesignerElementTopHalf = over?.data?.current?.isTopHalfDesigner ?? false;
    const isDroppingOverDesignerElementBottomHalf = over?.data?.current?.isButtomHalfDesigner ?? false;
    const isDroppingOverDesignerElement = isDroppingOverDesignerElementTopHalf || isDroppingOverDesignerElementBottomHalf;
    const activeElementIndex = elements.findIndex(el => el.id == activeId);
    const overElementIndex = elements.findIndex(el => el.id == overId);
    if (overType == "panel" || overType == 'flex') {
        if (isDesignerBtnElement && !isDroppingOverDesignerElement) {
            const type = active?.data?.current?.type;
            const newElement = FormElements[type as ElementType].construct(ulid(10), 0, null, selectedPage.id, {});
            addElement(elements.length, newElement, over?.data?.current?.extraAttributes.id, selectedPage);
        }
        if (!isDroppingOverDesignerElement) {
            const elementIndex = elements.findIndex(el => el.id == active?.data?.current?.id);
            if (elementIndex !== -1) {
                updateParent(elements[elementIndex], over?.data?.current?.extraAttributes?.id);
            }
        }
    }
}