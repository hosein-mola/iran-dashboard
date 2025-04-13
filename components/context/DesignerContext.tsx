"use client"
import { Active } from "@dnd-kit/core";
import { Dispatch, ReactNode, SetStateAction, createContext, useEffect, useState } from "react";
import { ulid } from "ulid";
import { FormElementInstance, FormElements } from "../FormElement";
import { reIndexed } from "../actions/elementOverElement";
import { getChildNodes } from "@/lib/tree";

export type PageType = { id: string, index: number, name: string };
export type DesignerContextType = {
    context?: DesignerContextType,
    elements: FormElementInstance[];
    selectedElement?: FormElementInstance | null,
    selectedElementParents: FormElementInstance[],
    draggedItem?: Active | null;
    active: Active | null,
    setActive: Dispatch<SetStateAction<Active | null>>,
    setElements: Dispatch<SetStateAction<FormElementInstance[]>>,
    setSelectedElement: Dispatch<SetStateAction<FormElementInstance | null>>,
    selectedPage: PageType;
    setSelectedPage: Dispatch<SetStateAction<PageType>>,
    setDraggedItem: Dispatch<SetStateAction<Active | null>>,
    setPages: Dispatch<SetStateAction<Array<PageType>>>,
    pages: Array<PageType>,
    leftView: "page" | "tree" | 'ds' | 'history' | "expression" | 'extension',
    setLeftView: Dispatch<SetStateAction<"page" | "tree">>,
    updateElement: (id: string, element: FormElementInstance) => void,
    swapElement: (fromIndex: number, toIndex: number) => void,
    updateSelectedParents: (element: FormElementInstance, level: number) => void,
    duplicatePage: (page: PageType, index: number) => void;
    newPage: (page: PageType, index: number) => void;
    deletePage: (page: PageType, index: number) => void;
    addElement: (index: number, element: FormElementInstance, parentId: string | null, page: PageType) => void
    updateParent: (element: FormElementInstance, parentId: string | null) => void
    updateIndex: (element: FormElementInstance, index: number) => void
    removeElement: (id: string) => void,
    deleteElement: (element: FormElementInstance) => void,
    isReady: boolean,
    setIsReady: Dispatch<SetStateAction<boolean>>
}

export type ContextType = DesignerContextType;
export const DesignerContext = createContext<DesignerContextType | null>(null);

export default function DesignerContextProvider({
    children
}: {
    children: ReactNode
}) {
    const [elements, setElements] = useState<FormElementInstance[]>([]);
    const [leftView, setLeftView] = useState<"page" | "tree">('page');
    const [pages, setPages] = useState<Array<PageType>>([{ id: ulid(10), name: 'Page-1', index: 1 }]);
    const [active, setActive] = useState<Active | null>(null);
    const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);
    const [selectedElementParents, setSelectedElementParents] = useState<FormElementInstance[]>([]);
    const [selectedPage, setSelectedPage] = useState<PageType>({ id: ulid(10), name: 'Page-1', index: 1 });
    const [draggedItem, setDraggedItem] = useState<Active | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        console.log("🚀 ~ elements:", elements)
        console.log("🚀 ~ pages:", pages)
        console.log("🚀 ~ selectedPage:", selectedPage)
    }, [elements, pages, selectedPage])

    useEffect(() => {
    }, [])

    const swapElement = (fromIndex: number, toIndex: number) => {
        setElements(prev => {
            let copy = [...prev];
            copy[fromIndex].index = toIndex;
            copy[toIndex].index = fromIndex;
            [copy[fromIndex], copy[toIndex]] = [copy[toIndex], copy[fromIndex]];
            return copy;
        })
    }
    const updateParent = (element: FormElementInstance, parentId: string | null) => {
        setElements(prev => {
            const newElement = [...prev];
            element.parentId = parentId;
            const elementIndex = newElement.findIndex(el => el.id == element.id);
            newElement[elementIndex] = element;
            return newElement;
        })
    }
    const updateIndex = (element: FormElementInstance, index: number) => {
        setElements(prev => {
            const newElement = [...prev];
            element.index = index;
            const elementIndex = newElement.findIndex(el => el.id == element.id);
            newElement[elementIndex] = element;
            return newElement;
        })
    }
    const addElement = (index: number, element: FormElementInstance, parentId: string | null, page: PageType) => {
        setElements(prev => {
            const newElement = [...prev];
            element.parentId = parentId;
            element.page = page.id;
            newElement.splice(index, 0, element);
            const indexded = reIndexed(newElement);
            return indexded;
        })
    }
    const updateSelectedParents = (element: FormElementInstance, level: number) => {
        const newBroadCumb = [element, ...findParentsRecursiveWithLevel(element, elements, 0)];
        setSelectedElementParents(newBroadCumb);
    }
    const removeElement = (id: string) => {
        setElements(prev => prev.filter(element => element.id != id))
    }
    const updateElement = (id: string, element: FormElementInstance) => {
        setElements((prev) => {
            const newElement = [...prev];
            const index = newElement.findIndex(el => el.id == id);
            newElement[index] = element;
            return newElement;
        })
    }
    function findParentsRecursiveWithLevel(node: FormElementInstance, array: FormElementInstance[], level: number): FormElementInstance[] {
        const parent = array.find(obj => obj.id === node.parentId);
        const parents = [];

        // If parent is found, recursively find its parent
        if (parent) {
            // If parent has a non-null parentId, continue recursion
            if (parent.parentId !== null) {
                const parentWithLevel = { ...parent, level };
                parents.push(parentWithLevel);
                parents.push(...findParentsRecursiveWithLevel(parent, array, level + 1));
            } else {
                // If parent has a null parentId, this is the top level
                const parentWithLevel = { ...parent, level };
                parents.push(parentWithLevel);
            }
        }

        return parents;
    }

    function duplicateItems(originalArray: FormElementInstance[], targetPage: PageType, newPage: PageType): FormElementInstance[] {
        const duplicateMap: Record<string, string> = {};
        let duplicatedArray: FormElementInstance[] = [];
        [...originalArray].filter((item: FormElementInstance) => item.page == targetPage.id).forEach((item: FormElementInstance) => {
            const duplicatedItem = FormElements[item.type].construct(ulid(10), item.index, item.parentId, newPage.id, item.extraAttributes);
            duplicatedArray.push(duplicatedItem);
            duplicateMap[item.id] = duplicatedItem.id;
        });
        duplicatedArray.forEach((item: FormElementInstance) => {
            item.parentId = item.parentId ? duplicateMap[item.parentId] : null;
        });
        return duplicatedArray;
    }

    function duplicatePage(page: PageType, index: number) {
        const cloneELements = [...elements];
        const clonePages = [...pages];
        let getAllStatsWith: Array<PageType> = [];
        pages.forEach((page: PageType) => {
            if (Number(String(page.index).startsWith(String(Math.floor(pages[index].index))))) {
                getAllStatsWith.push(page);
            }
        });
        const newIndex = Number((Math.max(...getAllStatsWith.map(page => page.index)) + 0.001).toFixed(3));
        const newPage: any = { id: ulid(), index: newIndex, name: `Duplicate-${newIndex}` };
        const getAllItemsInPage: FormElementInstance[] = duplicateItems(cloneELements, page, newPage)
        clonePages.splice(index + 1, 0, newPage);
        if (!getAllItemsInPage) { return }
        setPages([...clonePages]);
        setElements((prev: Array<FormElementInstance>) => [...prev, ...getAllItemsInPage]);
        setSelectedPage(newPage);
    }

    function newPage(page: PageType, index: number) {
        const clonePages: Array<PageType> = [...pages];
        const pageNumber = Math.floor(Math.max(...clonePages.map(page => page.index))) + 1;
        const newPage = { id: ulid(10), index: pageNumber, name: `Page-${pageNumber}` };
        clonePages.splice(index + 1, 0, newPage);
        setPages([...clonePages]);
        setSelectedPage(newPage);
    }

    function deletePage(page: PageType, index: number) {
        const clonePages = [...pages];
        clonePages.splice(index, 1);
        setElements((prev: FormElementInstance[]) => prev.filter((item: FormElementInstance) => item.page != page.id));
        if (clonePages.length == 0) {
            const initPage = { id: ulid(10), index: 1, name: "Page-1" };
            setPages([initPage]);
            setSelectedPage(initPage);
        } else {
            setPages([...clonePages]);
            setSelectedPage(clonePages[0]);
        }
    }

    function deleteElement(element: FormElementInstance) {
        setElements(prev => {
            const cloneElements = [...prev];
            const allchildsId: Array<String> = getChildNodes(element, cloneElements).map(child => child.id);
            const deleteItemFromCloneElements = cloneElements.filter(el => el.id !== element.id && !allchildsId.includes(el.id));
            return deleteItemFromCloneElements;
        });
        setSelectedElement(null);
    }

    const context = {
        elements,
        pages,
        active,
        selectedElement,
        selectedElementParents,
        selectedPage,
        draggedItem,
        setPages,
        duplicatePage,
        newPage,
        deletePage,
        setActive,
        addElement,
        updateSelectedParents,
        updateParent,
        updateIndex,
        swapElement,
        removeElement,
        setElements,
        setSelectedElement,
        updateElement,
        setSelectedPage,
        setDraggedItem,
        isReady,
        setIsReady,
        leftView,
        setLeftView,
        deleteElement
    }
    return <DesignerContext.Provider value={{ ...context, context: context }}>{children}</DesignerContext.Provider>
}

