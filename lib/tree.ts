export interface TreeNode {
  id: string | number
  parentId?: string | number | null
  isOpen?: boolean
  children?: TreeNode[]
  type?: string
  index?: number
  page?: string
  extraAttributes?: Record<string, string>
  created_at?: string
  updated_at?: string
  pivot?: Record<string, string>
  [key: string]: unknown
}

export const toTree = (
  data: TreeNode[],
  id?: string | number | null,
  _link?: string
): TreeNode[] => {
  const nest = (
    items: TreeNode[],
    _id = id == undefined ? null : id,
    link = _link === undefined ? 'parentId' : _link
  ): TreeNode[] => {
    // Map to store items by their id
    const itemMap: { [key: string]: TreeNode } = {}

    // Initialize the map with all items
    items.forEach((item: TreeNode) => {
      itemMap[item.id] = { ...item, isOpen: false, children: [] }
    })

    // Iterate over items to create the tree
    const result: TreeNode[] = []
    items.forEach((item: TreeNode) => {
      if (item[link] === _id || !itemMap[item[link] as string | number]) {
        // Item has no parent or the parent is missing, attach to root
        result.push(itemMap[item.id])
      } else {
        // Attach to parent
        itemMap[item[link] as string | number].children!.push(itemMap[item.id])
      }
    })

    return result
  }
  return nest(data)
}

// Ensure T has at least id and parentId properties
export function getChildNodes<
  T extends { id: string | number; parentId: string | number | null },
>(node: T, allNodes: T[]): T[] {
  const result: T[] = []

  function findChildren(currentNode: T) {
    // Find all nodes where the parentId matches the current node's id
    const children = allNodes.filter((n) => n.parentId === currentNode.id)
    result.push(...children)

    // Recursively find children of the current node
    children.forEach(findChildren)
  }

  findChildren(node)

  return result
}
