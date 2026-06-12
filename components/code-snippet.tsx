'use client'

import { Copy, Check } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Language =
  | 'text'
  | 'json'
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'python'
  | 'bash'
  | 'csharp'

type Token = {
  text: string
  kind:
    | 'plain'
    | 'comment'
    | 'string'
    | 'number'
    | 'keyword'
    | 'type'
    | 'property'
    | 'constant'
    | 'punctuation'
}

const JS_TS_KEYWORDS = new Set([
  'as',
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'from',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'of',
  'package',
  'private',
  'protected',
  'public',
  'readonly',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'type',
  'typeof',
  'undefined',
  'var',
  'void',
  'while',
  'with',
  'yield',
])

const PYTHON_KEYWORDS = new Set([
  'and',
  'as',
  'assert',
  'async',
  'await',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'False',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'None',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'True',
  'try',
  'while',
  'with',
  'yield',
])

const CSHARP_KEYWORDS = new Set([
  'abstract',
  'as',
  'base',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'default',
  'delegate',
  'do',
  'else',
  'enum',
  'event',
  'explicit',
  'extern',
  'false',
  'finally',
  'fixed',
  'for',
  'foreach',
  'goto',
  'if',
  'implicit',
  'in',
  'interface',
  'internal',
  'is',
  'lock',
  'namespace',
  'new',
  'null',
  'operator',
  'out',
  'override',
  'params',
  'private',
  'protected',
  'public',
  'readonly',
  'ref',
  'return',
  'sealed',
  'sizeof',
  'stackalloc',
  'static',
  'struct',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'unchecked',
  'unsafe',
  'using',
  'virtual',
  'void',
  'volatile',
  'while',
])

const BASH_KEYWORDS = new Set([
  'cat',
  'cd',
  'curl',
  'echo',
  'export',
  'git',
  'http',
  'https',
  'jq',
  'npm',
  'npx',
  'node',
  'pnpm',
  'python',
  'sh',
  'sudo',
  'wget',
])

function isAlpha(char: string) {
  return /[A-Za-z_]/.test(char)
}

function isAlphaNumeric(char: string) {
  return /[A-Za-z0-9_]/.test(char)
}

function isDigit(char: string) {
  return /[0-9]/.test(char)
}

function classifyKeyword(language: Language, value: string): Token['kind'] {
  if (language === 'python' && PYTHON_KEYWORDS.has(value)) return 'keyword'
  if (language === 'csharp' && CSHARP_KEYWORDS.has(value)) return 'keyword'
  if (language === 'bash' && BASH_KEYWORDS.has(value)) return 'keyword'
  if (
    (language === 'javascript' ||
      language === 'typescript' ||
      language === 'jsx' ||
      language === 'tsx') &&
    JS_TS_KEYWORDS.has(value)
  ) {
    if (
      value === 'true' ||
      value === 'false' ||
      value === 'null' ||
      value === 'undefined'
    ) {
      return 'constant'
    }
    return 'keyword'
  }

  return 'plain'
}

function tokenizeLine(line: string, language: Language): Token[] {
  if (language === 'text') return [{ text: line, kind: 'plain' }]

  const tokens: Token[] = []
  let index = 0

  while (index < line.length) {
    const char = line[index]

    if (/\s/.test(char)) {
      let end = index + 1
      while (end < line.length && /\s/.test(line[end])) end += 1
      tokens.push({ text: line.slice(index, end), kind: 'plain' })
      index = end
      continue
    }

    if (language === 'bash' && char === '#') {
      tokens.push({ text: line.slice(index), kind: 'comment' })
      break
    }

    if (
      (language === 'javascript' ||
        language === 'typescript' ||
        language === 'jsx' ||
        language === 'tsx' ||
        language === 'csharp') &&
      char === '/' &&
      line[index + 1] === '/'
    ) {
      tokens.push({ text: line.slice(index), kind: 'comment' })
      break
    }

    if (char === '"' || char === '\'' || char === '`') {
      const quote = char
      let end = index + 1
      while (end < line.length) {
        if (line[end] === '\\') {
          end += 2
          continue
        }
        if (line[end] === quote) {
          end += 1
          break
        }
        end += 1
      }

      const text = line.slice(index, end)
      let kind: Token['kind'] = 'string'

      if (language === 'json') {
        let lookAhead = end
        while (lookAhead < line.length && /\s/.test(line[lookAhead])) {
          lookAhead += 1
        }
        if (line[lookAhead] === ':') {
          kind = 'property'
        }
      }

      tokens.push({ text, kind })
      index = end
      continue
    }

    if (
      isDigit(char) ||
      (char === '-' && isDigit(line[index + 1] ?? ''))
    ) {
      let end = index + 1
      while (
        end < line.length &&
        /[0-9a-fA-FxX_.eE+-]/.test(line[end])
      ) {
        end += 1
      }
      tokens.push({ text: line.slice(index, end), kind: 'number' })
      index = end
      continue
    }

    if (isAlpha(char)) {
      let end = index + 1
      while (end < line.length && isAlphaNumeric(line[end])) end += 1
      const value = line.slice(index, end)
      let kind = classifyKeyword(language, value)

      if (kind === 'plain') {
        if (language === 'typescript' || language === 'tsx') {
          const nextChar = line[end]
          if (nextChar === '<' || nextChar === ':' || value[0] === value[0]?.toUpperCase()) {
            kind = 'type'
          }
        } else if (language === 'json') {
          if (value === 'true' || value === 'false' || value === 'null') {
            kind = 'constant'
          }
        } else if (language === 'csharp') {
          if (value[0] === value[0]?.toUpperCase()) kind = 'type'
        }
      }

      tokens.push({ text: value, kind })
      index = end
      continue
    }

    tokens.push({
      text: char,
      kind:
        char === '{' ||
        char === '}' ||
        char === '[' ||
        char === ']' ||
        char === '(' ||
        char === ')' ||
        char === ',' ||
        char === ':' ||
        char === ';'
          ? 'punctuation'
          : 'plain',
    })
    index += 1
  }

  return tokens
}

function kindClass(kind: Token['kind']) {
  switch (kind) {
    case 'comment':
      return 'text-muted-foreground'
    case 'string':
      return 'text-emerald-700 dark:text-emerald-400'
    case 'number':
      return 'text-amber-700 dark:text-amber-400'
    case 'keyword':
      return 'text-sky-700 dark:text-sky-400'
    case 'type':
      return 'text-violet-700 dark:text-violet-400'
    case 'property':
      return 'text-cyan-700 dark:text-cyan-400'
    case 'constant':
      return 'text-orange-700 dark:text-orange-400'
    case 'punctuation':
    case 'plain':
    default:
      return 'text-foreground'
  }
}

export function CodeSnippet({
  code,
  language = 'text',
  className,
  showLineNumbers = true,
}: {
  code: string
  language?: Language
  className?: string
  showLineNumbers?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const lines = code.replace(/\r\n/g, '\n').split('\n')

  useEffect(() => {
    if (!copied) return

    const timer = window.setTimeout(() => {
      setCopied(false)
    }, 1500)

    return () => window.clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div
      dir="ltr"
      className={cn(
        'bg-muted/40 text-foreground overflow-auto rounded-md border',
        className
      )}
      style={{
        fontFamily:
          'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
      }}
    >
      <div className="sticky top-0 z-10 flex items-center justify-end border-b bg-inherit px-2 py-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 px-2 text-xs"
          onClick={() => void handleCopy()}
          aria-label="Copy code"
          title="Copy code"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <div className="overflow-x-auto px-3 py-3 text-[13px] leading-6">
        {lines.map((line, lineIndex) => {
          const tokens = tokenizeLine(line, language)
          return (
            <div
              key={`${lineIndex}-${line}`}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-3"
            >
              {showLineNumbers ? (
                <span className="text-muted-foreground select-none text-right text-[12px] tabular-nums">
                  {lineIndex + 1}
                </span>
              ) : null}
              <span className="whitespace-pre">
                {tokens.map((token, tokenIndex) => (
                  <span
                    key={`${tokenIndex}-${token.text}`}
                    className={kindClass(token.kind)}
                  >
                    {token.text}
                  </span>
                ))}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
