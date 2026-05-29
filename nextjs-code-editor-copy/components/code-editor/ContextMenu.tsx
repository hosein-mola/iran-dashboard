import React, { useEffect } from "react";
import { type CtxMenu } from "./types";
import { Icon } from "./icons";

interface ContextMenuProps {
  menu: CtxMenu;
  nodeType: "file" | "folder" | "root";
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function ContextMenu({
  menu,
  nodeType,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}: ContextMenuProps) {
  useEffect(() => {
    const h = () => onClose();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const items: Array<
    | {
        label: string;
        icon: React.ReactNode;
        action: () => void;
        danger?: boolean;
      }
    | "sep"
  > = [];

  if (nodeType === "folder" || nodeType === "root") {
    items.push({
      label: "New File",
      icon: <Icon.NewFile />,
      action: onNewFile,
    });
    items.push({
      label: "New Folder",
      icon: <Icon.NewFolder />,
      action: onNewFolder,
    });
  }
  if (nodeType !== "root") {
    if (items.length) items.push("sep");
    items.push({ label: "Rename", icon: <Icon.Rename />, action: onRename });
    items.push({
      label: "Delete",
      icon: <Icon.Delete />,
      action: onDelete,
      danger: true,
    });
  }

  return (
    <div
      className="fixed z-[9999] bg-[#252526] border border-[#3c3c3c] rounded shadow-xl py-1 min-w-[160px]"
      style={{ left: menu.x, top: menu.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item === "sep" ? (
          <div key={i} className="my-1 border-t border-[#3c3c3c]" />
        ) : (
          <button
            key={item.label}
            onClick={() => {
              item.action();
              onClose();
            }}
            className={`flex items-center gap-2 w-full px-3 py-[5px] text-[12px] hover:bg-[#04395e] text-left ${item.danger ? "text-[#f48771]" : "text-[#cccccc]"}`}
          >
            {item.icon} {item.label}
          </button>
        ),
      )}
    </div>
  );
}
