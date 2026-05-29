import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConsoleProps {
  show: boolean;
  logs: string[];
  onClear: () => void;
}

export default function Console({ show, logs, onClear }: ConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLogsLength = useRef(logs.length);

  // Auto-scroll to top when new logs come in (since newest is at top)
  useEffect(() => {
    if (scrollRef.current && logs.length > prevLogsLength.current) {
      scrollRef.current.scrollTop = 0;
    }
    prevLogsLength.current = logs.length;
  }, [logs]);

  // Calculate the width needed for line numbers based on total count
  const lineNumberWidth = React.useMemo(() => {
    const maxNumber = logs.length || 1;
    const digitCount = maxNumber.toString().length;
    // Ensure at least 4 digits
    return Math.max(4, digitCount);
  }, [logs.length]);

  // Format line number with zero padding
  const formatLineNumber = (num: number): string => {
    return num.toString().padStart(lineNumberWidth, "0");
  };

  // Group logs by run sessions (detected by "▶️ Running" or "Run" prefix)
  const groupedLogs = React.useMemo(() => {
    const groups: { entries: string[]; isNewRun: boolean }[] = [];
    let currentGroup: string[] = [];

    // Reverse for display (newest first), but we need to process in original order
    const reversedLogs = [...logs];

    reversedLogs.forEach((log, index) => {
      // Detect new run session
      if (log.startsWith("▶️ Running") || log.startsWith("Run:")) {
        if (currentGroup.length > 0) {
          groups.push({ entries: currentGroup, isNewRun: false });
        }
        currentGroup = [log];
        if (index > 0) {
          groups.push({ entries: [], isNewRun: true }); // Add separator before new run
        }
      } else {
        currentGroup.push(log);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ entries: currentGroup, isNewRun: false });
    }

    return groups;
  }, [logs]);

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "50%", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-0 left-0 right-0 bg-[#1e1e1e] border-t border-[#3c3c3c] flex flex-col z-30"
        >
          <div className="flex items-center justify-between px-3 py-1 border-b border-[#3c3c3c] bg-[#252526] shrink-0">
            <span className="text-[11px] text-[#858585] uppercase tracking-widest">
              Output
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#666]">
                {logs.length} {logs.length === 1 ? "entry" : "entries"}
              </span>
              <button
                onClick={onClear}
                className="text-[11px] text-[#858585] hover:text-[#cccccc] px-2 py-0.5 rounded hover:bg-[#3c3c3c] transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <div
            ref={scrollRef}
            className="flex-1 overflow-auto px-3 py-2 font-mono text-[12px] leading-5"
          >
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-[#3c3c3c]">No output yet...</span>
              </div>
            ) : (
              groupedLogs.flatMap((group, groupIndex) => {
                if (group.isNewRun) {
                  // Separator between run sessions
                  return [
                    <div
                      key={`separator-${groupIndex}`}
                      className="flex items-center my-2"
                    >
                      <div className="flex-1 border-t border-[#3c3c3c]" />
                      <span className="mx-3 text-[10px] text-[#666] uppercase tracking-wider">
                        New Run
                      </span>
                      <div className="flex-1 border-t border-[#3c3c3c]" />
                    </div>,
                  ];
                }

                // Regular log entries
                return group.entries.map((line, lineIndex) => {
                  const originalIndex =
                    logs.length -
                    1 -
                    (groupIndex * group.entries.length + lineIndex);
                  return (
                    <div
                      key={`log-${groupIndex}-${lineIndex}`}
                      className="text-[#cccccc] whitespace-pre-wrap hover:bg-[#2a2a2a] px-1 rounded transition-colors group flex text-lg mt-1"
                      style={{
                        animation: "slideDown 0.2s ease-out",
                      }}
                    >
                      <span
                        className="text-[#666] mr-4  select-none opacity-50 group-hover:opacity-100 transition-opacity shrink-0 text-center border border-gray-500 rounded-md"
                        style={{
                          minWidth: `${lineNumberWidth + 2}ch`,
                          width: `${lineNumberWidth + 2}ch`,
                        }}
                      >
                        {formatLineNumber(originalIndex + 1)}
                      </span>
                      <span className="flex-1 ">{line}</span>
                    </div>
                  );
                });
              })
            )}
          </div>

          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            /* Custom scrollbar */
            .overflow-auto::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            
            .overflow-auto::-webkit-scrollbar-track {
              background: #1e1e1e;
            }
            
            .overflow-auto::-webkit-scrollbar-thumb {
              background: #3c3c3c;
              border-radius: 4px;
            }
            
            .overflow-auto::-webkit-scrollbar-thumb:hover {
              background: #555;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
