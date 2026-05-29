import type { FileSystem } from "./types";

export const LS_KEY = "vscode_files_v1";

export const DEFAULT_FS: FileSystem = {
  nodes: {
    src: { id: "src", name: "src", type: "folder", parentId: null },
    "index.ts": {
      id: "index.ts",
      name: "index.ts",
      type: "file",
      parentId: "src",
      content: `// Welcome to the editor\nconst greeting: string = "Hello, World!";\nconsole.log(greeting);\n`,
    },
    "utils.ts": {
      id: "utils.ts",
      name: "utils.ts",
      type: "file",
      parentId: "src",
      content: `export function add(a: number, b: number): number {\n  return a + b;\n}\n`,
    },
    "README.md": {
      id: "README.md",
      name: "README.md",
      type: "file",
      parentId: null,
      content: `# Project\n\nA TypeScript project.\n`,
    },
  },
  rootIds: ["src", "README.md"],
};
