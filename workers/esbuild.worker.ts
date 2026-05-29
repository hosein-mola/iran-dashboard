import * as esbuild from 'esbuild-wasm'

type BuildRequest = {
  requestId: string
  entryPath: string
  files: Record<string, string>
}

type BuildResponse =
  | {
      requestId: string
      ok: true
      entryPath: string
      output: string
      warnings: string[]
    }
  | {
      requestId: string
      ok: false
      entryPath: string
      error: string
      warnings: string[]
    }

let initPromise: Promise<void> | null = null

function normalizePath(path: string): string {
  const trimmed = path.trim().replace(/\\+/g, '/')
  if (!trimmed) return '/'

  const withPrefix = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const parts = withPrefix
    .split('/')
    .filter(Boolean)
    .reduce<string[]>((acc, part) => {
      if (part === '.') return acc
      if (part === '..') {
        acc.pop()
        return acc
      }
      acc.push(part)
      return acc
    }, [])

  return `/${parts.join('/')}`
}

function dirname(path: string): string {
  const normalized = normalizePath(path)
  const index = normalized.lastIndexOf('/')
  if (index <= 0) return '/'
  return normalized.slice(0, index)
}

function extension(path: string) {
  const index = path.lastIndexOf('.')
  return index === -1 ? '' : path.slice(index).toLowerCase()
}

function formatError(value: unknown): string {
  if (typeof value === 'string') return value
  if (value instanceof Error) return value.message

  if (value && typeof value === 'object') {
    const maybeErrors = (value as { errors?: Array<{ text?: string; location?: { file?: string; line?: number; column?: number } }> }).errors
    if (Array.isArray(maybeErrors) && maybeErrors.length > 0) {
      return maybeErrors
        .map((error) => {
          const loc = error.location
          if (!loc) return error.text ?? 'Build failed'
          const file = loc.file ? `${loc.file}:` : ''
          const line = typeof loc.line === 'number' ? loc.line : 0
          const column = typeof loc.column === 'number' ? loc.column + 1 : 0
          return `${file}${line}:${column} ${error.text ?? 'Build failed'}`
        })
        .join('\n')
    }
  }

  return 'Build failed'
}

function formatWarnings(
  messages: Array<{
    text?: string
    location?: { file?: string; line?: number; column?: number } | null
  }>
) {
  return messages.map((warning) => {
    const location = warning.location
    if (!location) return warning.text ?? 'Warning'

    const line = typeof location.line === 'number' ? location.line : 0
    const column = typeof location.column === 'number' ? location.column + 1 : 0
    const file = location.file ? `${location.file}:` : ''
    return `${file}${line}:${column} ${warning.text ?? 'Warning'}`
  })
}

function resolveFileFromVfs(
  specifier: string,
  importer: string,
  files: Record<string, string>
): string | null {
  const fromPath = specifier.startsWith('/')
    ? normalizePath(specifier)
    : normalizePath(`${dirname(importer)}/${specifier}`)

  const candidates = [
    fromPath,
    `${fromPath}.ts`,
    `${fromPath}.tsx`,
    `${fromPath}.js`,
    `${fromPath}.jsx`,
    `${fromPath}.json`,
    `${fromPath}/index.ts`,
    `${fromPath}/index.tsx`,
    `${fromPath}/index.js`,
    `${fromPath}/index.jsx`,
    `${fromPath}/index.json`,
  ]

  for (const candidate of candidates) {
    if (candidate in files) return candidate
  }

  return null
}

function resolveLoader(path: string): esbuild.Loader {
  const ext = extension(path)
  switch (ext) {
    case '.ts':
      return 'ts'
    case '.tsx':
      return 'tsx'
    case '.js':
      return 'js'
    case '.jsx':
      return 'jsx'
    case '.json':
      return 'json'
    case '.md':
    case '.mdx':
      return 'text'
    default:
      return 'text'
  }
}

async function ensureEsbuildReady() {
  if (!initPromise) {
    initPromise = esbuild.initialize({
      wasmURL: '/esbuild.wasm',
      worker: false,
    })
  }

  await initPromise
}

async function buildBundle(payload: BuildRequest): Promise<BuildResponse> {
  const entryPath = normalizePath(payload.entryPath)
  const files: Record<string, string> = {}

  for (const [path, content] of Object.entries(payload.files ?? {})) {
    files[normalizePath(path)] = String(content)
  }

  if (!(entryPath in files)) {
    return {
      requestId: payload.requestId,
      ok: false,
      entryPath,
      error: `Entry file not found: ${entryPath}`,
      warnings: [],
    }
  }

  await ensureEsbuildReady()

  try {
    const result = await esbuild.build({
      entryPoints: [entryPath],
      bundle: true,
      write: false,
      format: 'cjs',
      platform: 'node',
      target: 'es2020',
      sourcemap: 'inline',
      logLevel: 'silent',
      plugins: [
        {
          name: 'vfs-loader',
          setup(build) {
            build.onResolve({ filter: /.*/ }, (args) => {
              if (args.kind === 'entry-point') {
                return {
                  path: normalizePath(args.path),
                  namespace: 'vfs',
                }
              }

              const request = args.path.trim()
              if (request.startsWith('.') || request.startsWith('/')) {
                const importer = args.importer || '/'
                const resolved = resolveFileFromVfs(request, importer, files)
                if (resolved) {
                  return {
                    path: resolved,
                    namespace: 'vfs',
                  }
                }

                return {
                  errors: [
                    {
                      text: `Cannot resolve "${args.path}" from "${args.importer || entryPath}"`,
                    },
                  ],
                }
              }

              return {
                path: request,
                external: true,
              }
            })

            build.onLoad({ filter: /.*/, namespace: 'vfs' }, (args) => {
              const normalized = normalizePath(args.path)
              const source = files[normalized]
              if (typeof source !== 'string') {
                return {
                  errors: [{ text: `Missing file in VFS: ${normalized}` }],
                }
              }

              return {
                contents: source,
                loader: resolveLoader(normalized),
                resolveDir: dirname(normalized),
              }
            })
          },
        },
      ],
    })

    const output = result.outputFiles?.[0]?.text ?? ''
    return {
      requestId: payload.requestId,
      ok: true,
      entryPath,
      output,
      warnings: formatWarnings(result.warnings),
    }
  } catch (error) {
    return {
      requestId: payload.requestId,
      ok: false,
      entryPath,
      error: formatError(error),
      warnings: [],
    }
  }
}

self.onmessage = async (event: MessageEvent<BuildRequest>) => {
  const payload = event.data
  if (!payload || typeof payload !== 'object') return

  const response = await buildBundle(payload)
  self.postMessage(response)
}
