import React, { useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { type FileSystem, type Tab, type FileId } from "./types";
import { Icon } from "./icons";
import ToolButton from "./ToolButton";

interface DraggableTabBarProps {
  tabs: Tab[];
  activeTabId: FileId | null;
  fs: FileSystem;
  onSelectTab: (fileId: FileId) => void;
  onCloseTab: (fileId: FileId, e: React.MouseEvent) => void;
  onReorderTabs: (tabs: Tab[]) => void;
  onSave: () => void;
  onRun: () => void;
  onToggleConsole: () => void;
}

export default function DraggableTabBar({
  tabs,
  activeTabId,
  fs,
  onSelectTab,
  onCloseTab,
  onReorderTabs,
  onSave,
  onRun,
  onToggleConsole,
}: DraggableTabBarProps) {
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const newTabs = Array.from(tabs);
      const [reorderedItem] = newTabs.splice(result.source.index, 1);
      newTabs.splice(result.destination.index, 0, reorderedItem);

      onReorderTabs(newTabs);
    },
    [tabs, onReorderTabs],
  );

  return (
    <div className="flex items-center bg-[#252526] border-b border-[#1e1e1e] overflow-hidden shrink-0">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tabs" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex items-center overflow-x-auto scrollbar-none flex-1"
            >
              {tabs.map((tab, index) => {
                const node = fs.nodes[tab.fileId];
                const isActive = tab.fileId === activeTabId;

                return (
                  <Draggable
                    key={tab.fileId}
                    draggableId={tab.fileId}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => onSelectTab(tab.fileId)}
                        className={`group flex items-center gap-1.5 px-3 h-9 text-[12px] cursor-pointer border-r border-[#1e1e1e] shrink-0 relative select-none
                          ${
                            isActive
                              ? "bg-[#1e1e1e] text-[#cccccc] border-t-[1.5px] border-t-[#007fd4]"
                              : "bg-[#2d2d2d] text-[#858585] hover:bg-[#2a2a2a]"
                          }
                          ${snapshot.isDragging ? "opacity-70 shadow-lg" : ""}
                        `}
                      >
                        {node && (
                          <span className="flex items-center">
                            <Icon.File name={node.name} />
                          </span>
                        )}
                        <span className="max-w-[120px] truncate">
                          {node?.name ?? tab.fileId}
                        </span>
                        {tab.dirty && (
                          <span className="w-2 h-2 rounded-full bg-[#cccccc] opacity-70 group-hover:hidden" />
                        )}
                        <button
                          onClick={(e) => onCloseTab(tab.fileId, e)}
                          className={`ml-1 rounded p-0.5 hover:bg-[#4a4a4a] text-[#858585] hover:text-[#cccccc] z-10
                            ${tab.dirty ? "group-hover:flex hidden" : ""} flex
                            ${snapshot.isDragging ? "hidden" : ""}
                          `}
                        >
                          <Icon.Close />
                        </button>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="ml-auto flex items-center gap-1 px-2 shrink-0">
        <ToolButton title="Save (Ctrl+S)" onClick={onSave}>
          <Icon.Save />
        </ToolButton>
        <ToolButton title="Run" onClick={onRun} accent>
          <Icon.Play />
        </ToolButton>
        <ToolButton title="Toggle Console" onClick={onToggleConsole}>
          <Icon.Terminal />
        </ToolButton>
      </div>
    </div>
  );
}
