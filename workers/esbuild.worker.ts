// esbuild.worker.ts
import * as esbuild from "esbuild-wasm";
import * as acorn from "acorn";

let isInitialized = false;

interface BuildData {
  entryPoint: string;
  files: Record<string, string>;
}

interface ResolveArgs {
  path: string;
  importer?: string;
}

interface LoadArgs {
  path: string;
  namespace: string;
}

interface DependencyNode {
  path: string;
  dependencies: string[];
  resolvedPath: string;
  depth: number;
  imports: ImportInfo[];
}

interface ImportInfo {
  type: "import" | "require" | "dynamic-import" | "export";
  source: string;
  specifiers: string[];
  isTypeOnly: boolean;
}

// Check if import is local (not a node_module)
function isLocalImport(path: string): boolean {
  return (
    path.startsWith("./") || path.startsWith("../") || path.startsWith("/")
  );
}

// Simple AST walker
function walkAST(node: any, callback: (node: any) => void) {
  if (!node || typeof node !== "object") return;

  callback(node);

  for (const key in node) {
    if (
      key === "type" ||
      key === "loc" ||
      key === "range" ||
      key === "start" ||
      key === "end"
    )
      continue;

    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item.type === "string") {
          walkAST(item, callback);
        }
      }
    } else if (child && typeof child.type === "string") {
      walkAST(child, callback);
    }
  }
}

// Strip TypeScript syntax to make it parseable by acorn
function stripTypeScript(content: string, filePath: string): string {
  const isTS = filePath.endsWith(".ts") || filePath.endsWith(".tsx");
  if (!isTS) return content;

  let result = content;

  // Remove type annotations (simplified)
  result = result.replace(/:\s*[A-Za-z0-9_<>\[\],\s|&'"]+(?=[,;\)\s=])/g, "");

  // Remove type declarations
  result = result.replace(/interface\s+\w+\s*\{[^}]*\}/g, "");
  result = result.replace(/type\s+\w+\s*=\s*[^;]+;/g, "");

  // Remove type assertions
  result = result.replace(/\bas\s+[A-Za-z0-9_<>\[\],\s|&]+/g, "");

  // Remove implements
  result = result.replace(/\bimplements\s+[^{]+/g, "");

  // Remove generics from function calls (simplified)
  result = result.replace(/<[A-Za-z0-9_]+>/g, "");

  return result;
}

// AST-based import parser using acorn
function parseImportsWithAST(content: string, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = [];

  try {
    // Strip TypeScript if needed
    const cleanContent = stripTypeScript(content, filePath);

    // Parse with acorn
    const ast = acorn.parse(cleanContent, {
      ecmaVersion: "latest",
      sourceType: "module",
      locations: false,
      ranges: false,
      allowReserved: true,
      allowReturnOutsideFunction: true,
      allowImportExportEverywhere: true,
      allowAwaitOutsideFunction: true,
      allowSuperOutsideMethod: true,
      allowHashBang: true,
    });

    // Walk the AST to find imports
    walkAST(ast, (node: any) => {
      // ES6 import declarations: import ... from '...'
      if (node.type === "ImportDeclaration") {
        const source = node.source?.value;
        if (source && isLocalImport(source)) {
          const specifiers: string[] = [];

          if (node.specifiers) {
            for (const spec of node.specifiers) {
              if (spec.type === "ImportDefaultSpecifier") {
                specifiers.push(spec.local?.name || "default");
              } else if (spec.type === "ImportSpecifier") {
                const name =
                  spec.imported?.name ||
                  spec.imported?.value ||
                  spec.local?.name ||
                  "";
                if (name) specifiers.push(name);
              } else if (spec.type === "ImportNamespaceSpecifier") {
                specifiers.push(`* as ${spec.local?.name || ""}`);
              }
            }
          }

          imports.push({
            type: "import",
            source: source,
            specifiers: specifiers,
            isTypeOnly: node.importKind === "type",
          });
        }
      }

      // Export declarations (re-exports): export { ... } from '...'
      if (node.type === "ExportNamedDeclaration" && node.source?.value) {
        const source = node.source.value;
        if (isLocalImport(source)) {
          const specifiers: string[] = [];

          if (node.specifiers) {
            for (const spec of node.specifiers) {
              if (spec.type === "ExportSpecifier") {
                const name = spec.exported?.name || spec.exported?.value || "";
                if (name) specifiers.push(name);
              }
            }
          }

          imports.push({
            type: "export",
            source: source,
            specifiers: specifiers,
            isTypeOnly: node.exportKind === "type",
          });
        }
      }

      // Export all: export * from '...'
      if (node.type === "ExportAllDeclaration" && node.source?.value) {
        const source = node.source.value;
        if (isLocalImport(source)) {
          imports.push({
            type: "export",
            source: source,
            specifiers: ["*"],
            isTypeOnly: node.exportKind === "type",
          });
        }
      }

      // Dynamic imports: import('...')
      if (node.type === "ImportExpression") {
        if (node.source?.type === "Literal" && node.source?.value) {
          const source = node.source.value;
          if (isLocalImport(source)) {
            imports.push({
              type: "dynamic-import",
              source: source,
              specifiers: [],
              isTypeOnly: false,
            });
          }
        }
      }

      // CommonJS require: require('...')
      if (node.type === "CallExpression") {
        if (
          node.callee?.type === "Identifier" &&
          node.callee?.name === "require" &&
          node.arguments?.length === 1 &&
          node.arguments[0]?.type === "Literal" &&
          node.arguments[0]?.value
        ) {
          const source = node.arguments[0].value;
          if (isLocalImport(source)) {
            imports.push({
              type: "require",
              source: source,
              specifiers: [],
              isTypeOnly: false,
            });
          }
        }
      }
    });
  } catch (error: any) {
    console.warn(`AST parsing failed for ${filePath}:`, error.message);
    console.warn("Falling back to regex parser");
    return parseImportsFallback(content);
  }

  // Remove duplicates (same source)
  const seen = new Set<string>();
  const uniqueImports = imports.filter((imp) => {
    if (seen.has(imp.source)) return false;
    seen.add(imp.source);
    return true;
  });

  return uniqueImports;
}

// Fallback regex parser if AST fails
function parseImportsFallback(content: string): ImportInfo[] {
  const imports: ImportInfo[] = [];
  const seen = new Set<string>();

  // Remove comments
  const cleanContent = content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "");

  const patterns = [
    {
      regex: /import\s+(?:type\s+)?(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g,
      type: "import" as const,
    },
    {
      regex: /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      type: "dynamic-import" as const,
    },
    {
      regex: /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      type: "require" as const,
    },
    {
      regex: /export\s+(?:\{[^}]*\}|\*)\s+from\s+['"]([^'"]+)['"]/g,
      type: "export" as const,
    },
  ];

  for (const { regex, type } of patterns) {
    let match;
    while ((match = regex.exec(cleanContent)) !== null) {
      const source = match[1];
      if (isLocalImport(source) && !seen.has(source)) {
        seen.add(source);
        imports.push({
          type,
          source,
          specifiers: [],
          isTypeOnly: false,
        });
      }
    }
  }

  return imports;
}

// Resolve import path to actual file path
function resolveImportPath(importPath: string, fromFile: string): string {
  let resolvedPath = importPath;

  if (importPath.startsWith("./") || importPath.startsWith("../")) {
    const baseDir = fromFile.substring(0, fromFile.lastIndexOf("/") + 1);
    resolvedPath = (baseDir + importPath)
      .replace(/\/\.\//g, "/")
      .replace(/\/[^\/]+\/\.\.\//g, "/");
  }

  if (resolvedPath.startsWith("/")) {
    resolvedPath = resolvedPath.substring(1);
  }

  return resolvedPath;
}

// Find actual file with extensions
function findActualFile(
  resolvedPath: string,
  files: Record<string, string>,
): string | null {
  // Exact match
  if (files[resolvedPath] !== undefined) {
    return resolvedPath;
  }

  // Try extensions
  const extensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    "/index.ts",
    "/index.tsx",
    "/index.js",
    "/index.jsx",
    "/index.mjs",
    "/index.cjs",
  ];

  for (const ext of extensions) {
    const pathWithExt = resolvedPath + ext;
    if (files[pathWithExt] !== undefined) {
      return pathWithExt;
    }
  }

  // Try without extension
  if (!resolvedPath.includes(".")) {
    for (const ext of [".ts", ".tsx", ".js", ".jsx"]) {
      const pathWithExt = resolvedPath + ext;
      if (files[pathWithExt] !== undefined) {
        return pathWithExt;
      }
    }
  }

  return null;
}

// Build dependency tree using AST
function buildDependencyTree(
  filePath: string,
  files: Record<string, string>,
  visited: Set<string> = new Set(),
  tree: Map<string, DependencyNode> = new Map(),
  depth: number = 0,
): Map<string, DependencyNode> {
  if (visited.has(filePath)) {
    return tree;
  }

  visited.add(filePath);

  const content = files[filePath];
  if (!content) {
    console.warn(`File not found: ${filePath}`);
    return tree;
  }

  // Parse imports using AST
  const imports = parseImportsWithAST(content, filePath);

  const node: DependencyNode = {
    path: filePath,
    dependencies: [],
    resolvedPath: filePath,
    depth: depth,
    imports: imports,
  };

  // Resolve each import to actual files
  for (const imp of imports) {
    // Skip type-only imports as they don't affect runtime
    if (imp.isTypeOnly) {
      console.log(
        `  Skipping type-only import: ${imp.source} from ${filePath}`,
      );
      continue;
    }

    const resolvedPath = resolveImportPath(imp.source, filePath);
    const actualFile = findActualFile(resolvedPath, files);

    if (actualFile) {
      node.dependencies.push(actualFile);

      // Recursively build dependencies
      if (!visited.has(actualFile)) {
        buildDependencyTree(actualFile, files, visited, tree, depth + 1);
      }
    } else {
      console.warn(`Could not resolve: ${imp.source} from ${filePath}`);
    }
  }

  tree.set(filePath, node);
  return tree;
}

// Get build order (bottom-up: deepest first)
function getBuildOrder(
  tree: Map<string, DependencyNode>,
  rootPath: string,
): string[] {
  const buildOrder: string[] = [];
  const visited = new Set<string>();

  function traverse(path: string) {
    if (visited.has(path)) return;
    visited.add(path);

    const node = tree.get(path);
    if (node) {
      // Process dependencies first (bottom-up)
      node.dependencies.forEach((dep) => traverse(dep));
      buildOrder.push(path);
    }
  }

  traverse(rootPath);
  return buildOrder;
}

// Print dependency tree
function printDependencyTree(
  tree: Map<string, DependencyNode>,
  rootPath: string,
  indent: string = "",
  isLast: boolean = true,
): string[] {
  const lines: string[] = [];
  const node = tree.get(rootPath);

  if (!node) return lines;

  const connector = indent ? (isLast ? "└── " : "├── ") : "";
  const importCount = node.imports.length;
  const runtimeImports = node.imports.filter((i) => !i.isTypeOnly).length;
  const typeOnlyImports = node.imports.filter((i) => i.isTypeOnly).length;

  let nodeInfo = `📄 ${rootPath}`;
  if (importCount > 0) {
    nodeInfo += ` (${runtimeImports} imports`;
    if (typeOnlyImports > 0) nodeInfo += `, ${typeOnlyImports} type-only`;
    nodeInfo += ")";
  }

  lines.push(`${indent}${connector}${nodeInfo}`);

  // Show imports
  for (let i = 0; i < node.imports.length; i++) {
    const imp = node.imports[i];
    const isLastImport =
      i === node.imports.length - 1 && node.dependencies.length === 0;
    const importConnector =
      indent + (isLast ? "    " : "│   ") + (isLastImport ? "└── " : "├── ");
    const typeLabel = imp.isTypeOnly ? " [type-only]" : "";
    const specifiersStr =
      imp.specifiers.length > 0 ? `{ ${imp.specifiers.join(", ")} } from ` : "";

    lines.push(`${importConnector}↳ ${specifiersStr}${imp.source}${typeLabel}`);
  }

  // Process dependencies
  for (let i = 0; i < node.dependencies.length; i++) {
    const dep = node.dependencies[i];
    const isLastDep = i === node.dependencies.length - 1;
    const newIndent = indent + (isLast ? "    " : "│   ");

    if (tree.has(dep)) {
      lines.push(...printDependencyTree(tree, dep, newIndent, isLastDep));
    } else {
      lines.push(
        `${newIndent}${isLastDep ? "└── " : "├── "}📄 ${dep} (external)`,
      );
    }
  }

  return lines;
}

// Get all files in dependency tree
function getAllDependencies(
  tree: Map<string, DependencyNode>,
  rootPath: string,
): string[] {
  const allFiles: string[] = [];
  const visited = new Set<string>();

  function traverse(path: string) {
    if (visited.has(path)) return;
    visited.add(path);

    const node = tree.get(path);
    if (node) {
      allFiles.push(path);
      node.dependencies.forEach((dep) => traverse(dep));
    }
  }

  traverse(rootPath);
  return allFiles;
}

// Main worker message handler
self.onmessage = async (e: MessageEvent) => {
  const { type, data } = e.data;

  if (type === "initialize") {
    try {
      const wasmURL = new URL("/esbuild.wasm", self.location.origin).href;
      console.log("Initializing esbuild with WASM from:", wasmURL);

      try {
        const response = await fetch(wasmURL, { method: "HEAD" });
        if (!response.ok) {
          throw new Error(`WASM file not found (status: ${response.status})`);
        }
        console.log("✅ WASM file found");
      } catch (fetchError: any) {
        console.error("Failed to verify WASM file:", fetchError);
        const cdnURL = "https://unpkg.com/esbuild-wasm@0.19.0/esbuild.wasm";
        console.log("Trying CDN fallback:", cdnURL);

        await esbuild.initialize({
          wasmURL: cdnURL,
          worker: false,
        });

        isInitialized = true;
        console.log("esbuild initialized from CDN");
        self.postMessage({ type: "initialized" });
        return;
      }

      await esbuild.initialize({
        wasmURL: wasmURL,
        worker: false,
      });

      isInitialized = true;
      console.log("esbuild initialized successfully");
      self.postMessage({ type: "initialized" });
    } catch (error: any) {
      console.error("Failed to initialize esbuild:", error);
      self.postMessage({
        type: "error",
        error: `Failed to initialize: ${error.message}`,
      });
    }
  } else if (type === "build") {
    if (!isInitialized) {
      self.postMessage({
        type: "error",
        error: "Build system not initialized yet.",
      });
      return;
    }

    // Normalize entry point
    let entryPoint = data.entryPoint;
    if (entryPoint.startsWith("/")) {
      entryPoint = entryPoint.substring(1);
    }

    // Normalize all file paths
    const files: Record<string, string> = {};
    Object.entries(data.files).forEach(([path, content]) => {
      let normalizedPath = path;
      if (normalizedPath.startsWith("/")) {
        normalizedPath = normalizedPath.substring(1);
      }
      files[normalizedPath] = content as string;
    });

    console.log("Building entry point:", entryPoint);

    self.postMessage({
      type: "build-start",
      entryPoint,
      fileCount: Object.keys(files).length,
      files: [entryPoint],
    });

    const startTime = Date.now();

    try {
      // Build dependency tree using AST
      self.postMessage({
        type: "progress",
        currentFile: "🔍 Analyzing dependencies with AST...",
      });

      const dependencyTree = buildDependencyTree(entryPoint, files);
      const buildOrder = getBuildOrder(dependencyTree, entryPoint);

      console.log("Build order (bottom-up):", buildOrder);

      const treeLines = printDependencyTree(dependencyTree, entryPoint);
      console.log("=== Dependency Tree (AST-based) ===");
      treeLines.forEach((line) => console.log(line));
      console.log("====================================");

      const allDependencies = getAllDependencies(dependencyTree, entryPoint);

      self.postMessage({
        type: "dependency-tree",
        entryPoint,
        tree: treeLines,
        dependencies: allDependencies,
        buildOrder: buildOrder,
        totalFiles: allDependencies.length,
      });

      // Build dependencies bottom-up
      self.postMessage({
        type: "progress",
        currentFile: `🔄 Building ${buildOrder.length} files from bottom-up...`,
      });

      for (const filePath of buildOrder) {
        self.postMessage({
          type: "progress",
          currentFile: `⚙️ Building dependency: ${filePath}`,
        });
      }

      const usedFiles: Set<string> = new Set();

      self.postMessage({
        type: "progress",
        currentFile: `📦 Final bundle with entry: ${entryPoint}`,
      });

      const result = await esbuild.build({
        entryPoints: [entryPoint],
        bundle: true,
        write: false,
        format: "esm",
        platform: "browser",
        target: "es2020",
        plugins: [
          {
            name: "virtual-fs",
            setup(build) {
              build.onResolve({ filter: /.*/ }, (args: ResolveArgs) => {
                const isEntryPoint = !args.importer;

                if (
                  !isEntryPoint &&
                  (args.path.startsWith("node:") ||
                    (!args.path.startsWith(".") && !args.path.startsWith("/")))
                ) {
                  return { path: args.path, external: true };
                }

                let resolvedPath = args.path;

                if (args.path.startsWith("./") || args.path.startsWith("../")) {
                  const base = args.importer || entryPoint;
                  const baseDir = base.substring(0, base.lastIndexOf("/") + 1);
                  resolvedPath = (baseDir + args.path)
                    .replace(/\/\.\//g, "/")
                    .replace(/\/[^\/]+\/\.\.\//g, "/");
                }

                if (resolvedPath.startsWith("/")) {
                  resolvedPath = resolvedPath.substring(1);
                }

                const actualFile = findActualFile(resolvedPath, files);

                if (actualFile && allDependencies.includes(actualFile)) {
                  usedFiles.add(actualFile);
                  return { path: actualFile, namespace: "virtual" };
                }

                if (isEntryPoint) {
                  usedFiles.add(resolvedPath);
                  return { path: resolvedPath, namespace: "virtual" };
                }

                return {
                  path: resolvedPath,
                  namespace: "virtual",
                  external: true,
                };
              });

              build.onLoad(
                { filter: /.*/, namespace: "virtual" },
                (args: LoadArgs) => {
                  const content = files[args.path];
                  if (content !== undefined) {
                    let loader: esbuild.Loader = "default";
                    if (args.path.endsWith(".tsx")) loader = "tsx";
                    else if (args.path.endsWith(".ts")) loader = "ts";
                    else if (args.path.endsWith(".jsx")) loader = "jsx";
                    else if (
                      args.path.endsWith(".js") ||
                      args.path.endsWith(".mjs") ||
                      args.path.endsWith(".cjs")
                    )
                      loader = "js";
                    else if (args.path.endsWith(".css")) loader = "css";
                    else if (args.path.endsWith(".json")) loader = "json";

                    self.postMessage({
                      type: "progress",
                      currentFile: `✅ Bundled: ${args.path}`,
                    });

                    return { contents: content, loader: loader };
                  }

                  if (usedFiles.has(args.path) || args.path === entryPoint) {
                    return { contents: "", loader: "default" };
                  }

                  return null;
                },
              );
            },
          },
        ],
      });

      const buildTime = Date.now() - startTime;
      const actualUsedFiles = Array.from(usedFiles);
      const unusedFiles = Object.keys(files).filter(
        (f) => !allDependencies.includes(f),
      );

      const compiledCode = result.outputFiles?.[0]?.text || "";
      const warnings = result.warnings?.map((w) => w.text) || [];

      self.postMessage({
        type: "build-result",
        code: compiledCode,
        entryPoint,
        buildTime,
        builtFiles: actualUsedFiles,
        dependencies: allDependencies,
        buildOrder: buildOrder,
        warnings: warnings,
        unusedFiles: unusedFiles,
        outputSize: compiledCode.length,
        dependencyTree: treeLines,
      });
    } catch (error: any) {
      const buildTime = Date.now() - startTime;

      console.error("Build failed:", error);

      self.postMessage({
        type: "build-error",
        error: error.message,
        location: error.location || null,
        file: error.location?.file || entryPoint,
        entryPoint,
        buildTime,
        stack: error.stack,
      });
    }
  }
};

export {};
