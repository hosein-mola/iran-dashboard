import React from "react";
import { Icon } from "./icons";

interface ActivityBtnProps {
  active: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}

function ActivityBtn({ active, title, onClick, children }: ActivityBtnProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`relative w-12 h-12 flex items-center justify-center text-[#858585] hover:text-[#cccccc] transition-colors ${active ? "text-white" : ""}`}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-white rounded-r" />
      )}
      {children}
    </button>
  );
}

interface ActivityBarProps {
  explorerOpen: boolean;
  onToggleExplorer: () => void;
}

export default function ActivityBar({
  explorerOpen,
  onToggleExplorer,
}: ActivityBarProps) {
  return (
    <div className="flex flex-col items-center w-12 bg-[#333333] border-r border-[#252526] shrink-0">
      <ActivityBtn
        active={explorerOpen}
        title="Explorer"
        onClick={onToggleExplorer}
      >
        <Icon.Explorer />
      </ActivityBtn>
    </div>
  );
}
