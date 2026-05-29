import React, { useEffect, useRef, type KeyboardEvent } from "react";
import { type FileId } from "./types";
import { Icon } from "./icons";

interface InlineCreateProps {
  parentId: FileId | null;
  type: "file" | "folder";
  depth: number;
  onCommit: (name: string) => void;
  onCancel: () => void;
}

export default function InlineCreate({
  type,
  depth,
  onCommit,
  onCancel,
}: InlineCreateProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  const indent = depth * 12 + 4 + 16 + 6;

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const v = e.currentTarget.value.trim();
      if (v) onCommit(v);
      else onCancel();
    }
    if (e.key === "Escape") onCancel();
  }

  return (
    <div className="flex items-center h-[22px]" style={{ paddingLeft: indent }}>
      <span className="mr-1.5 flex items-center">
        {type === "folder" ? (
          <Icon.Folder open={false} />
        ) : (
          <Icon.File name={`new.${type === "file" ? "ts" : ""}`} />
        )}
      </span>
      <input
        ref={ref}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v) onCommit(v);
          else onCancel();
        }}
        onKeyDown={handleKey}
        placeholder={type === "file" ? "filename.ts" : "foldername"}
        className="flex-1 bg-[#3c3c3c] text-[#cccccc] text-[12px] px-1 outline outline-1 outline-[#007fd4] rounded-sm"
      />
    </div>
  );
}
