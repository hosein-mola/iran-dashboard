export const toTree = (data: Array<any>, id?: string | number | null, _link?: string) => {
    const nest = (items: any, _id = id == undefined ? null : id, link = _link === undefined ? "parentId" : _link) => {
        // Map to store items by their id
        const itemMap: { [key: string]: any } = {};

        // Initialize the map with all items
        items.forEach((item: any) => {
            itemMap[item.id] = { ...item, isOpen: false, children: [] };
        });

        // Iterate over items to create the tree
        const result: any[] = [];
        items.forEach((item: any) => {
            if (item[link] === _id || !itemMap[item[link]]) {
                // Item has no parent or the parent is missing, attach to root
                result.push(itemMap[item.id]);
            } else {
                // Attach to parent
                itemMap[item[link]].children.push(itemMap[item.id]);
            }
        });

        return result;
    };
    return nest(data);
};


// Ensure T has at least id and parentId properties
export function getChildNodes<T extends { id: string; parentId: string | null }>(node: T, allNodes: T[]): T[] {
    const result: T[] = [];

    function findChildren(currentNode: T) {
        // Find all nodes where the parentId matches the current node's id
        const children = allNodes.filter(n => n.parentId === currentNode.id);
        result.push(...children);

        // Recursively find children of the current node
        children.forEach(findChildren);
    }

    // If a node is missing, check if it has descendants that can be connected to the root node
    function findDescendantsForMissingParent(parentId: string | null) {
        const orphans = allNodes.filter(n => n.parentId === parentId);
        result.push(...orphans);
        orphans.forEach(child => findDescendantsForMissingParent(child.id));
    }

    findChildren(node);

    // If there are missing nodes, link their children to the closest available ancestor
    const missingNodes = allNodes.filter(n => !result.includes(n) && n.parentId !== null);
    missingNodes.forEach(missingNode => findDescendantsForMissingParent(missingNode.parentId));

    return result;
}
