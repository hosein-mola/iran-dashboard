import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '@radix-ui/react-alert-dialog';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '@radix-ui/react-context-menu';
import { pages } from 'next/dist/build/templates/app-page';
import React, { useEffect, useState } from 'react';
import { BiPlus } from 'react-icons/bi';
import { IoDuplicateOutline, IoTrashBinOutline } from 'react-icons/io5';
import { AlertDialogHeader, AlertDialogFooter } from './ui/alert-dialog';
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronUpIcon, CircleIcon, Component2Icon, InfoCircledIcon } from '@radix-ui/react-icons';
import { LuCircleDivide } from 'react-icons/lu';
import { Separator } from './ui/separator';
import useDesigner from './hooks/useDesigner';
import { toTree } from '@/lib/tree';
import { FormElementInstance } from './FormElement';
import { TbCircleChevronDown, TbCircleChevronUp } from 'react-icons/tb';

const DesignerNestedTree = () => {
    const { elements, setSelectedPage, pages, selectedPage } = useDesigner();

    return (
        <aside className='w-[400px] max-w-[400px] overflow-auto flex flex-col items-center gap-2 h-full flex-grow border-r px-2 bg-background overflowx-y-auto'>
            <div dir='rtl' className='flex flex-col h-full py-2 w-full flex-grow'>
                <div className='flex flex-row justify-between items-center'>
                    <div className='text-sm h-8 items-center flex text-foreground/70'>Explorer</div>
                    <div className='flex flex-row-reverse gap-4 items-center text-sm'>
                        <label>Page</label>
                        <select
                            defaultValue={selectedPage.id}
                            value={selectedPage.id}
                            onChange={(event) => {
                                const findPage = pages.find((page) => page.id == event.target.value);
                                if (findPage !== undefined) {
                                    setSelectedPage(findPage);
                                }
                            }}
                            title='page'
                            className='w-24 h-8 flex items-center border text-center justify-end'
                        >
                            {pages.map((page) => {
                                return (
                                    <option key={'o' + page.id} className='' value={page.id}>
                                        {page.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
                <Separator className='mt-2' orientation='horizontal' />
                <Explorer tree={toTree(elements, null, 'parentId')} expande={false} />
            </div>
        </aside>
    );
};

const TreeNode = ({ ancestor, expande }: any) => {
    const [isOpen, setIsOpen] = useState(expande);
    const { setSelectedElement, updateSelectedParents } = useDesigner();

    return (
        <div className='w-full flex flex-col h-auto select-none text-base divide-x divide-y justify-center cursor-pointer'>
            <div
                onClick={() => {
                    setSelectedElement(ancestor);
                    updateSelectedParents(ancestor, 0);
                }}
                className='h-10 flex flex-col justify-center hover:bg-foreground/10'
            >
                <div
                    onClick={() => setIsOpen((prev: boolean) => !prev)}
                    className='flex flex-row gap-4 items-center justify-between px-2 overflow-clip border py-2'
                >
                    <div className='flex justify-between flex-row gap-4'>
                        <span className='bg-primary text-background rounded-md px-2 py-1 font-bold text-xs'>
                            {ancestor.type}
                        </span>
                        <span className='flex truncate'>{ancestor.extraAttributes.title}</span>
                    </div>
                    <div>
                        {ancestor.ancestor.length > 0 &&
                            (isOpen ? (
                                <ChevronUpIcon className='w-5 h-6 hover:text-accent-foreground/60' />
                            ) : (
                                <ChevronDownIcon className='w-5 h-6 hover:text-accent-foreground/60' />
                            ))}
                    </div>
                </div>
            </div>
            <div dir='ltr' className='flex flex-col justify-center h-auto cursor-pointer px-4'>
                {isOpen && ancestor.ancestor.length > 0 && <Explorer tree={ancestor.ancestor} expande={expande} />}
            </div>
        </div>
    );
};

const Explorer = ({ tree, expande }: any) => {
    const { selectedPage } = useDesigner();

    return tree
        .filter((item: FormElementInstance) => item.page == selectedPage.id)
        .map((item: FormElementInstance) => {
            return (
                <div key={item.id} dir='ltr' className='flex flex-col justify-center h-auto cursor-pointer'>
                    {<TreeNode ancestor={item} expande={expande} />}
                </div>
            );
        });
};

export default DesignerNestedTree;
