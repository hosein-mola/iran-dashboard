export type FileId = string;

export interface FileNode {
  id: FileId;
  name: string;
  type: "file" | "folder";
  parentId: FileId | null;
  content?: string;
}

export interface FileSystem {
  nodes: Record<FileId, FileNode>;
  rootIds: FileId[];
}

export interface Tab {
  fileId: FileId;
  dirty: boolean;
}

export interface CtxMenu {
  x: number;
  y: number;
  nodeId: FileId | null;
}

export interface DragItem {
  type: "file" | "folder";
  id: FileId;
}
