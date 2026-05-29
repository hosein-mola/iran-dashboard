import React, { useEffect, useRef, type KeyboardEvent, useState } from "react";
import { type FileNode, type FileSystem, type FileId } from "./types";
import { childrenOf } from "./helpers";
import { Icon, ActionBtn } from "./icons";
import InlineCreate from "./InlineCreate";

interface TreeNodeProps {
  node: FileNode;
  fs: FileSystem;
  depth: number;
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
}

export default function TreeNode({
  node,
  fs,
  depth,
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
}: TreeNodeProps) {
  const isFolder = node.type === "folder";
  const isOpen = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const isEditing = editingId === node.id;
  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState<"above" | "inside" | "below" | null>(
    null,
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const dot = node.name.lastIndexOf(".");
      inputRef.current.setSelectionRange(0, dot > 0 ? dot : node.name.length);
    }
  }, [isEditing, node.name]);

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter")
      onRenameCommit(node.id, e.currentTarget.value.trim());
    if (e.key === "Escape") onRenameCancel();
  }

  const children = isFolder && isOpen ? childrenOf(fs, node.id) : [];
  const isCreatingHere = creating?.parentId === node.id && isOpen;

  // Drag handlers
  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ type: node.type, id: node.id }),
    );
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  }

  function handleDragEnd() {
    setIsDragging(false);
    setDragOver(null);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!isFolder) return;

    e.dataTransfer.dropEffect = "move";
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (y < height * 0.25) {
      setDragOver("above");
    } else if (y > height * 0.75) {
      setDragOver("below");
    } else {
      setDragOver("inside");
    }
  }

  function handleDragLeave() {
    setDragOver(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.id === node.id) return; // Can't drop on itself

      if (isFolder) {
        if (dragOver === "inside") {
          onMove(data.id, node.id);
        } else if (dragOver === "above" || dragOver === "below") {
          onMove(data.id, node.parentId);
        }
      }
    } catch {}
  }

  return (
    <>
      <div
        ref={nodeRef}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={isFolder ? handleDragOver : undefined}
        onDragLeave={isFolder ? handleDragLeave : undefined}
        onDrop={isFolder ? handleDrop : undefined}
        className={`group flex items-center h-[22px] cursor-pointer select-none hover:bg-[#2a2d2e] transition-colors
          ${isSelected ? "bg-[#37373d]" : ""}
          ${isDragging ? "opacity-50" : ""}
          ${dragOver === "inside" ? "bg-[#094771]" : ""}
          ${dragOver === "above" ? "border-t-2 border-[#007fd4]" : ""}
          ${dragOver === "below" ? "border-b-2 border-[#007fd4]" : ""}
        `}
        style={{ paddingLeft: depth * 12 + 4 }}
        onClick={() => {
          if (isFolder) onToggle(node.id);
          else onSelect(node.id);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu(e, node.id);
        }}
      >
        {/* Drag handle */}
        <span className="hidden  items-center mr-1 cursor-grab active:cursor-grabbing text-[#858585]">
          <Icon.DragHandle />
        </span>

        <span className="w-4 flex items-center justify-center text-[#858585] mr-0.5">
          {isFolder ? (
            isOpen ? (
              <Icon.ChevronDown />
            ) : (
              <Icon.ChevronRight />
            )
          ) : (
            <span className="w-3" />
          )}
        </span>

        <span className="mr-1.5 flex items-center">
          {isFolder ? (
            <Icon.Folder open={isOpen} />
          ) : (
            <Icon.File name={node.name} />
          )}
        </span>

        {isEditing ? (
          <input
            ref={inputRef}
            defaultValue={node.name}
            onBlur={(e) => onRenameCommit(node.id, e.target.value.trim())}
            onKeyDown={handleKey}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-[#3c3c3c] text-[#cccccc] text-[12px] px-1  outline-1 outline-[#007fd4] rounded-sm min-w-0"
          />
        ) : (
          <span className="text-[14px] mt-1 text-[#cccccc] truncate leading-none">
            {node.name}
          </span>
        )}

        {!isEditing && (
          <span className="ml-auto hidden group-hover:flex items-center gap-0.5 pr-1">
            {isFolder && (
              <>
                <ActionBtn
                  title="New File"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!expanded.has(node.id)) {
                      onToggle(node.id);
                    }
                    onContextMenu(e, node.id);
                  }}
                >
                  <Icon.NewFile />
                </ActionBtn>
                <ActionBtn
                  title="New Folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!expanded.has(node.id)) {
                      onToggle(node.id);
                    }
                    onContextMenu(e, node.id);
                  }}
                >
                  <Icon.NewFolder />
                </ActionBtn>
              </>
            )}
          </span>
        )}
      </div>

      {children.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          fs={fs}
          depth={depth + 1}
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

      {isCreatingHere && (
        <InlineCreate
          parentId={node.id}
          type={creating!.type}
          depth={depth + 1}
          onCommit={onCommitCreate}
          onCancel={onCancelCreate}
        />
      )}
    </>
  );
}
