import { Worker } from 'node:worker_threads'

export type ExecuteSavedCodeInput = {
  code: string
  functionName: string
  args?: unknown[]
  data?: unknown
  timeoutMs?: number
}

export type ExecuteSavedCodeResult =
  | { success: true; result: unknown; logs: string[]; durationMs: number }
  | { success: false; error: string; logs: string[]; durationMs: number }

const WORKER_SOURCE = `
const { parentPort } = require('worker_threads');
const vm = require('vm');

function safeStringify(value) {
  try {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.stack || value.message || String(value);
    return JSON.stringify(value);
  } catch {
    try { return String(value); } catch { return '[unstringifiable]'; }
  }
}

function prepareExecutableCode(code) {
  const exportsToAssign = [];
  let executableCode = String(code || '').replace(/export\\s*\\{([\\s\\S]*?)\\}\\s*;?/g, (_, specifiers) => {
    for (const rawSpecifier of specifiers.split(',')) {
      const specifier = rawSpecifier.trim();
      if (!specifier) continue;
      const parts = specifier.split(/\\s+as\\s+/);
      const localName = parts[0]?.trim();
      const exportedName = (parts[1] || parts[0])?.trim();
      if (localName && exportedName) exportsToAssign.push([localName, exportedName]);
    }
    return '';
  });

  if (exportsToAssign.length > 0) {
    executableCode += '\\n' + exportsToAssign.map(([localName, exportedName]) =>
      'module.exports[' + JSON.stringify(exportedName) + '] = ' + localName + ';'
    ).join('\\n');
  }

  return executableCode;
}

parentPort.on('message', async (msg) => {
  const startedAt = Date.now();
  const timeoutMs = Math.max(50, Math.min(30000, Number(msg.timeoutMs || 2000)));
  const logs = [];

  const capturedConsole = {
    log: (...args) => logs.push(args.map(safeStringify).join(' ')),
    info: (...args) => logs.push(args.map(safeStringify).join(' ')),
    warn: (...args) => logs.push(args.map(safeStringify).join(' ')),
    error: (...args) => logs.push(args.map(safeStringify).join(' ')),
  };

  const sandbox = {
    console: capturedConsole,
    data: msg.data,
    module: { exports: {} },
    exports: {},
  };
  sandbox.exports = sandbox.module.exports;

  try {
    const context = vm.createContext(sandbox, {
      codeGeneration: { strings: false, wasm: false },
    });

    const script = new vm.Script(prepareExecutableCode(msg.code), { filename: 'workspace.js' });
    script.runInContext(context, { timeout: timeoutMs });

    const exported = sandbox.module.exports;
    const fn =
      (exported && typeof exported === 'object' && typeof exported[msg.functionName] === 'function'
        ? exported[msg.functionName]
        : context.workspaceBundle &&
            typeof context.workspaceBundle === 'object' &&
            typeof context.workspaceBundle[msg.functionName] === 'function'
          ? context.workspaceBundle[msg.functionName]
          : context.default &&
              typeof context.default === 'object' &&
              typeof context.default[msg.functionName] === 'function'
            ? context.default[msg.functionName]
        : typeof context[msg.functionName] === 'function'
          ? context[msg.functionName]
          : null);

    if (!fn) {
      throw new Error('Function not found: ' + String(msg.functionName));
    }

    const args = Array.isArray(msg.args) ? msg.args : [];
    let result = fn(...args, msg.data);

    if (result && typeof result.then === 'function') {
      result = await Promise.race([
        result,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Execution timed out')), timeoutMs)
        ),
      ]);
    }

    parentPort.postMessage({
      success: true,
      result,
      logs,
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    parentPort.postMessage({
      success: false,
      error: (err && err.message) ? String(err.message) : String(err),
      logs,
      durationMs: Date.now() - startedAt,
    });
  }
});
`

export async function executeSavedCode(
  input: ExecuteSavedCodeInput
): Promise<ExecuteSavedCodeResult> {
  const startedAt = Date.now()
  const timeoutMs = Math.max(50, Math.min(30_000, Number(input.timeoutMs ?? 2000)))

  return await new Promise<ExecuteSavedCodeResult>((resolve) => {
    const worker = new Worker(WORKER_SOURCE, { eval: true })
    let settled = false

    const finish = (result: ExecuteSavedCodeResult) => {
      if (settled) return
      settled = true
      resolve(result)
      worker.terminate().catch(() => null)
    }

    const killTimer = setTimeout(() => {
      finish({
        success: false,
        error: 'Execution timed out',
        logs: [],
        durationMs: Date.now() - startedAt,
      })
    }, timeoutMs + 250)

    worker.once('message', (msg: any) => {
      clearTimeout(killTimer)
      if (!msg || typeof msg !== 'object') {
        return finish({
          success: false,
          error: 'Invalid worker response',
          logs: [],
          durationMs: Date.now() - startedAt,
        })
      }
      return finish({
        success: Boolean(msg.success),
        ...(msg.success
          ? { result: msg.result }
          : { error: typeof msg.error === 'string' ? msg.error : 'Execution failed' }),
        logs: Array.isArray(msg.logs) ? msg.logs.map(String) : [],
        durationMs:
          typeof msg.durationMs === 'number' ? msg.durationMs : Date.now() - startedAt,
      } as ExecuteSavedCodeResult)
    })

    worker.once('error', (err) => {
      clearTimeout(killTimer)
      finish({
        success: false,
        error: err?.message || 'Worker error',
        logs: [],
        durationMs: Date.now() - startedAt,
      })
    })

    worker.postMessage({
      code: input.code,
      functionName: input.functionName,
      args: input.args ?? [],
      data: input.data,
      timeoutMs,
    })
  })
}
