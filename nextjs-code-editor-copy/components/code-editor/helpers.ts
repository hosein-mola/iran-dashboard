import { type FileId, type FileNode, type FileSystem } from "./types";
import { LS_KEY, DEFAULT_FS } from "./constants";

export function uid(): FileId {
  return Math.random().toString(36).slice(2, 10);
}

export function loadFS(): FileSystem {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.log(err);
  }
  return DEFAULT_FS;
}

export function saveFS(fs: FileSystem) {
  localStorage.setItem(LS_KEY, JSON.stringify(fs));
}

export function childrenOf(
  fs: FileSystem,
  parentId: FileId | null,
): FileNode[] {
  const ids =
    parentId === null
      ? fs.rootIds
      : Object.values(fs.nodes)
          .filter((n) => n.parentId === parentId)
          .map((n) => n.id);
  return ids
    .map((id) => fs.nodes[id])
    .filter(Boolean)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function langFromName(name: string): string {
  const ext = name.split(".").pop() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    md: "markdown",
    css: "css",
    html: "html",
    py: "python",
    go: "go",
  };
  return map[ext] ?? "plaintext";
}

export function getDepth(fs: FileSystem, id: FileId): number {
  let depth = 0;
  let cur = fs.nodes[id];
  while (cur?.parentId) {
    depth++;
    cur = fs.nodes[cur.parentId];
  }
  return depth;
}

export function deleteNode(prev: FileSystem, id: FileId): FileSystem {
  const node = prev.nodes[id];
  if (!node) return prev;
  const nodes = { ...prev.nodes };
  const rootIds = prev.rootIds.filter((r) => r !== id);
  const queue = [id];
  while (queue.length) {
    const cur = queue.shift()!;
    Object.values(nodes).forEach((n) => {
      if (n.parentId === cur) queue.push(n.id);
    });
    delete nodes[cur];
  }
  return { nodes, rootIds };
}

// Move a node to a new parent
export function moveNode(
  fs: FileSystem,
  nodeId: FileId,
  newParentId: FileId | null,
): FileSystem {
  const node = fs.nodes[nodeId];
  if (!node) return fs;

  // Prevent circular moves
  if (newParentId) {
    let current: FileNode | undefined = fs.nodes[newParentId];
    while (current) {
      if (current.id === nodeId) return fs;
      current = current.parentId ? fs.nodes[current.parentId] : undefined;
    }
  }

  const nodes = { ...fs.nodes };
  let rootIds = [...fs.rootIds];

  // Remove from old parent's children or rootIds
  if (node.parentId === null) {
    rootIds = rootIds.filter((id) => id !== nodeId);
  }

  // Update the node's parent
  nodes[nodeId] = { ...node, parentId: newParentId };

  // Add to rootIds if new parent is null
  if (newParentId === null && !rootIds.includes(nodeId)) {
    rootIds.push(nodeId);
  }

  return { ...fs, nodes, rootIds };
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Check if a node is a descendant of another node
export function isDescendant(
  fs: FileSystem,
  nodeId: FileId,
  ancestorId: FileId,
): boolean {
  let current = fs.nodes[nodeId];
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    current = fs.nodes[current.parentId];
  }
  return false;
}

// Get all file IDs in a folder recursively
export function getAllFileIds(fs: FileSystem, folderId: FileId): FileId[] {
  const result: FileId[] = [];
  const queue = [folderId];
  while (queue.length) {
    const current = queue.shift()!;
    const children = childrenOf(fs, current);
    children.forEach((child) => {
      if (child.type === "file") {
        result.push(child.id);
      } else {
        queue.push(child.id);
      }
    });
  }
  return result;
}
