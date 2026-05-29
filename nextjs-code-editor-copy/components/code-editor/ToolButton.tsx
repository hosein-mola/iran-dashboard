import React from "react";

interface ToolButtonProps {
  title: string;
  onClick: () => void;
  accent?: boolean;
  children: React.ReactNode;
}

export default function ToolButton({
  title,
  onClick,
  accent,
  children,
}: ToolButtonProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded text-[12px] ${
        accent
          ? "bg-[#f9c513] hover:bg-[#d4a810] text-black"
          : "bg-transparent hover:bg-[#3c3c3c] text-[#858585] hover:text-[#cccccc] border border-[#3c3c3c]"
      }`}
    >
      {children}
    </button>
  );
}
