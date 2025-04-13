import { Active, DragEndEvent, Over } from "@dnd-kit/core";
import { ulid } from "ulid";
import { ElementType, FormElementInstance, FormElements } from '@/components/FormElement';
import useDesigner from "../hooks/useDesigner";
import { DesignerContextType, PageType } from "../context/DesignerContext";
import { getChildNodes } from "@/lib/tree";


export function elementOverDesigner(event: DragEndEvent, selectedPage: PageType, context: DesignerContextType) {
    const { elements, setElements, addElement, removeElement, updateParent } = context;
    const { active, over } = event;

    const isDroppingOverDesignerArea = over?.data?.current?.isDesignerDropArea;
    const isDesignerBtnElement = active?.data?.current?.isDesignerBtnElement;
    if (isDroppingOverDesignerArea) {
        const type = active?.data?.current?.type;
        if (elements && selectedPage) {
            const activeIndex = elements.findIndex((element: FormElementInstance) => element.id == active?.data?.current?.id);
            if (activeIndex == -1) return;
            const cloneElements = [...elements];
            const clone = { ...cloneElements[activeIndex] };
            clone.page = selectedPage.id;
            const cloneChilds = getChildNodes(clone, cloneElements).map(child => child.id);
            const updatedClone = cloneElements.map(child => {
                if (cloneChilds.includes(child.id)) {
                    child.page = selectedPage.id;
                }
                return child;
            })
            clone.parentId = null;
            updatedClone[activeIndex] = clone;
            setElements(updatedClone);
        }
    }
}