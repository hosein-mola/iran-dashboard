import { useState } from 'react'
import { ChevronRightIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import { Separator } from './ui/separator'
import useDesigner from './hooks/useDesigner'
import { toTree, type TreeNode } from '@/lib/tree'
import { FormElementInstance } from '../types/element-type'

const DesignerNestedTree = () => {
  const { elements, setSelectedPage, pages, selectedPage } = useDesigner()

  return (
    <aside className="bg-background overflowx-y-auto flex h-full w-[300px] max-w-[300px] flex-grow flex-col items-center gap-2 overflow-auto border-r px-2">
      <div dir="rtl" className="flex h-full w-full flex-grow flex-col py-2">
        <div className="flex flex-row items-center justify-between">
          <div className="text-foreground/70 flex h-8 items-center text-sm">
            Explorer
          </div>
          <div className="flex flex-row-reverse items-center gap-4 text-sm">
            <label>Page</label>
            <select
              value={selectedPage.id}
              onChange={(event) => {
                const findPage = pages.find(
                  (page) => page.id == event.target.value
                )
                if (findPage !== undefined) {
                  setSelectedPage(findPage)
                }
              }}
              title="page"
              className="flex h-8 w-24 items-center justify-end border text-center"
            >
              {pages.map((page) => {
                return (
                  <option key={'o' + page.id} className="" value={page.id}>
                    {page.name}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
        <Separator className="mt-2" orientation="horizontal" />
        <Explorer
          tree={toTree(elements as TreeNode[], null, 'parentId')}
          expande={false}
        />
      </div>
    </aside>
  )
}

const TreeNode = ({
  ancestor,
  expande,
}: {
  ancestor: TreeNode
  expande: boolean
}) => {
  const [isOpen, setIsOpen] = useState(expande)
  const { setSelectedElement, updateSelectedParents } = useDesigner()

  return (
    <div className="flex h-auto w-full cursor-pointer flex-col justify-center divide-x divide-y text-base select-none">
      <div
        onClick={() => {
          setSelectedElement(ancestor as FormElementInstance)
          updateSelectedParents(ancestor as FormElementInstance, 0)
        }}
        className="hover:bg-foreground/10 flex h-10 flex-col justify-center"
      >
        <div
          onClick={() => setIsOpen((prev: boolean) => !prev)}
          className="flex flex-row items-center justify-between gap-4 overflow-clip border px-2 py-2"
        >
          <div className="flex flex-row justify-between gap-4">
            <span
              className={`${
                ancestor.type === 'panel'
                  ? 'bg-purple-200 dark:bg-purple-800'
                  : ancestor.type === 'text'
                    ? 'bg-blue-200 dark:bg-blue-800'
                    : 'bg-primary'
              } text-foreground rounded-md px-2 py-1 text-xs font-bold`}
            >
              {ancestor.type}
            </span>
            <span className="flex truncate">
              {ancestor.extraAttributes?.name || 'Untitled'}
            </span>
          </div>
          <div>
            {(ancestor?.children ?? []).length > 0 &&
              (isOpen ? (
                <ChevronUpIcon className="hover:text-accent-foreground/60 h-6 w-5" />
              ) : (
                <ChevronRightIcon className="hover:text-accent-foreground/60 h-6 w-5" />
              ))}
          </div>
        </div>
      </div>
      <div
        dir="ltr"
        className="flex h-auto cursor-pointer flex-col justify-center"
      >
        {isOpen && (ancestor?.children ?? []).length > 0 && (
          <Explorer tree={ancestor.children ?? []} expande={expande} />
        )}
      </div>
    </div>
  )
}

const Explorer = ({
  tree,
  expande,
}: {
  tree: TreeNode[]
  expande: boolean
}) => {
  const { selectedPage } = useDesigner()
  return tree
    .filter((item: TreeNode) => item.page == selectedPage.id)
    .map((item: TreeNode) => {
      return (
        <div
          key={item.id}
          dir="ltr"
          className="flex h-auto cursor-pointer flex-col justify-center pl-2"
        >
          {<TreeNode ancestor={item} expande={expande} />}
        </div>
      )
    })
}

export default DesignerNestedTree
