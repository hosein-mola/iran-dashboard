import React from "react";

export const Icon = {
  ChevronRight: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path
        d="M4 2l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path
        d="M2 4l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Folder: ({ open }: { open: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d={
          open
            ? "M1 4.5A1.5 1.5 0 012.5 3h3.086a1.5 1.5 0 011.06.44l.915.914H13.5A1.5 1.5 0 0115 5.854V12.5A1.5 1.5 0 0113.5 14h-11A1.5 1.5 0 011 12.5V4.5z"
            : "M1 4.5A1.5 1.5 0 012.5 3h3.086a1.5 1.5 0 011.06.44l.915.914H13.5A1.5 1.5 0 0115 5.5v7A1.5 1.5 0 0113.5 14h-11A1.5 1.5 0 011 12.5V4.5z"
        }
        fill={open ? "#dcad65" : "#c8933a"}
      />
    </svg>
  ),
  File: ({ name }: { name: string }) => {
    const ext = name.split(".").pop() ?? "";
    const colors: Record<string, string> = {
      ts: "#3178c6",
      tsx: "#3178c6",
      js: "#f0db4f",
      jsx: "#f0db4f",
      json: "#98c379",
      md: "#89b4e8",
      css: "#61afef",
      html: "#e06c75",
    };
    const color = colors[ext] ?? "#abb2bf";
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="1"
          width="9"
          height="14"
          rx="1.5"
          fill={color}
          opacity="0.2"
        />
        <path
          d="M2 1h7l4 4v10a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z"
          stroke={color}
          strokeWidth="1.2"
          fill="none"
        />
        <path d="M9 1v4h4" stroke={color} strokeWidth="1.2" fill="none" />
      </svg>
    );
  },
  Play: () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2.5l10 5.5-10 5.5V2.5z" />
    </svg>
  ),
  Save: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M13 13H3a1 1 0 01-1-1V4l3-3h7.5L14 3.5V12a1 1 0 01-1 1z" />
      <rect x="5" y="9" width="6" height="4" />
      <rect x="5" y="1" width="5" height="3" />
    </svg>
  ),
  History: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8a5 5 0 1 0 2-4" />
      <path d="M3 3v3h3" />
      <path d="M8 5.5V8l2 1" />
    </svg>
  ),
  Terminal: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="1" y="2" width="14" height="12" rx="1.5" />
      <path
        d="M4 6l3 2-3 2M8 10h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  NewFile: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M9 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V5L9 1z" />
      <path d="M9 1v4h4" strokeLinejoin="round" />
      <path d="M8 8v4M6 10h4" strokeLinecap="round" />
    </svg>
  ),
  NewFolder: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M1 4.5A1.5 1.5 0 012.5 3h3.086a1.5 1.5 0 011.06.44l.915.914H13.5A1.5 1.5 0 0115 5.5v7A1.5 1.5 0 0113.5 14h-11A1.5 1.5 0 011 12.5V4.5z" />
      <path d="M8 8v4M6 10h4" strokeLinecap="round" />
    </svg>
  ),
  Rename: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M11 2l3 3-8 8H3v-3L11 2z" strokeLinejoin="round" />
    </svg>
  ),
  Delete: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path
        d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Close: () => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2 2l6 6M8 2l-6 6" strokeLinecap="round" />
    </svg>
  ),
  CollapseAll: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M2 5h12M2 8h8M2 11h5" strokeLinecap="round" />
    </svg>
  ),
  DragHandle: () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="6" cy="3" r="1.5" />
      <circle cx="10" cy="3" r="1.5" />
      <circle cx="6" cy="8" r="1.5" />
      <circle cx="10" cy="8" r="1.5" />
      <circle cx="6" cy="13" r="1.5" />
      <circle cx="10" cy="13" r="1.5" />
    </svg>
  ),
  Explorer: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  ),
};

export function ActionBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-0.5 rounded hover:bg-[#4a4a4a] text-[#858585] hover:text-[#cccccc]"
    >
      {children}
    </button>
  );
}
