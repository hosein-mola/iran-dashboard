// scripts/copy-wasm.cjs
const fs = require("fs");
const path = require("path");

const wasmSource = path.join(
  __dirname,
  "..",
  "node_modules",
  "esbuild-wasm",
  "esbuild.wasm",
);
const publicDir = path.join(__dirname, "..", "public");
const wasmDest = path.join(publicDir, "esbuild.wasm");

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log("✅ Created public directory");
}

// Check if source exists
if (!fs.existsSync(wasmSource)) {
  console.error(
    "❌ esbuild.wasm not found in node_modules. Make sure esbuild-wasm is installed.",
  );
  console.error("Run: npm install esbuild-wasm");
  process.exit(1);
}

// Copy the file
try {
  fs.copyFileSync(wasmSource, wasmDest);
  console.log("✅ esbuild.wasm copied to public directory");
} catch (error) {
  console.error("❌ Failed to copy esbuild.wasm:", error.message);
  process.exit(1);
}
