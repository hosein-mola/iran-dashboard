import React from "react";
import { type FileSystem, type FileId } from "./types";
import { childrenOf } from "./helpers";
import TreeNode from "./TreeNode";
import InlineCreate from "./InlineCreate";

interface FileTreeProps {
  fs: FileSystem;
  expanded: Set<FileId>;
  selectedId: FileId | null;
  editingId: FileId | null;
  creating: {
    parentId: FileId | null;
    type: "file" | "folder";
    depth: number;
  } | null;
  onToggle: (id: FileId) => void;
  onSelect: (id: FileId) => void;
  onContextMenu: (e: React.MouseEvent, id: FileId) => void;
  onRenameCommit: (id: FileId, name: string) => void;
  onRenameCancel: () => void;
  onCommitCreate: (name: string) => void;
  onCancelCreate: () => void;
  onMove: (nodeId: FileId, newParentId: FileId | null) => void;
  onCollapseAll: () => void;
}

export default function FileTree({
  fs,
  expanded,
  selectedId,
  editingId,
  creating,
  onToggle,
  onSelect,
  onContextMenu,
  onRenameCommit,
  onRenameCancel,
  onCommitCreate,
  onCancelCreate,
  onMove,
}: FileTreeProps) {
  const rootNodes = childrenOf(fs, null);

  return (
    <div className="explorer-tree flex-1 overflow-y-auto overflow-x-hidden">
      {rootNodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          fs={fs}
          depth={0}
          expanded={expanded}
          selectedId={selectedId}
          editingId={editingId}
          creating={creating}
          onToggle={onToggle}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
          onRenameCommit={onRenameCommit}
          onRenameCancel={onRenameCancel}
          onCommitCreate={onCommitCreate}
          onCancelCreate={onCancelCreate}
          onMove={onMove}
        />
      ))}
      {creating && creating.parentId === null && (
        <InlineCreate
          parentId={null}
          type={creating.type}
          depth={0}
          onCommit={onCommitCreate}
          onCancel={onCancelCreate}
        />
      )}
    </div>
  );
}
