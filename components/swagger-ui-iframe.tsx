'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { cn } from '@/lib/utils'

type SwaggerUiIframeProps = {
  title: string
  openApiUrl: string
  proxyBasePath?: string
  className?: string
}

type SwaggerThemeTokens = {
  background: string
  foreground: string
  card: string
  muted: string
  mutedForeground: string
  primary: string
  primaryForeground: string
  border: string
  input: string
  accent: string
}

const lightFallbacks = {
  background: '#ffffff',
  foreground: '#18181b',
  card: '#ffffff',
  muted: '#f4f4f5',
  mutedForeground: '#71717a',
  primary: '#2563eb',
  primaryForeground: '#ffffff',
  border: '#e4e4e7',
  input: '#f8fafc',
  accent: '#eff6ff',
}

const darkFallbacks = {
  background: '#111827',
  foreground: '#f8fafc',
  card: '#172033',
  muted: '#0f172a',
  mutedForeground: '#cbd5e1',
  primary: '#7cc2ff',
  primaryForeground: '#111827',
  border: '#2a3950',
  input: '#020617',
  accent: '#1e293b',
}

function readThemeToken(
  styles: CSSStyleDeclaration,
  token: string,
  fallback: string
) {
  return styles.getPropertyValue(`--${token}`).trim() || fallback
}

function readSwaggerThemeTokens(resolvedTheme: 'light' | 'dark') {
  const fallbacks = resolvedTheme === 'dark' ? darkFallbacks : lightFallbacks
  const styles =
    typeof window === 'undefined'
      ? null
      : window.getComputedStyle(document.documentElement)
  const token = (name: string, fallback: string) =>
    styles ? readThemeToken(styles, name, fallback) : fallback

  return {
    background: token('background', fallbacks.background),
    foreground: token('foreground', fallbacks.foreground),
    card: token('card', fallbacks.card),
    muted: token('muted', fallbacks.muted),
    mutedForeground: token('muted-foreground', fallbacks.mutedForeground),
    primary: token('primary', fallbacks.primary),
    primaryForeground: token(
      'primary-foreground',
      fallbacks.primaryForeground
    ),
    border: token('border', fallbacks.border),
    input: token('input', fallbacks.input),
    accent: token('accent', fallbacks.accent),
  }
}

function buildSwaggerHtml({
  openApiUrl,
  proxyBasePath,
  resolvedTheme,
  tokens,
}: {
  openApiUrl: string
  proxyBasePath?: string
  resolvedTheme: 'light' | 'dark'
  tokens: SwaggerThemeTokens
}) {
  const optionalRequestInterceptor = proxyBasePath
    ? `,
        requestInterceptor: (request) => {
          try {
            const requestUrl = new URL(request.url, window.location.origin);
            if (requestUrl.origin !== window.location.origin) {
              request.url = ${JSON.stringify(proxyBasePath)} + requestUrl.pathname + requestUrl.search;
            }
          } catch {
            return request;
          }
          return request;
        }`
    : ''

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="${resolvedTheme}">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
    <style>
      :root {
        --sw-bg: ${tokens.background};
        --sw-fg: ${tokens.foreground};
        --sw-schema-fg: ${resolvedTheme === 'dark' ? '#f8fafc' : tokens.foreground};
        --sw-schema-muted-fg: ${resolvedTheme === 'dark' ? '#e2e8f0' : tokens.mutedForeground};
        --sw-card: ${tokens.card};
        --sw-muted: ${tokens.muted};
        --sw-muted-fg: ${tokens.mutedForeground};
        --sw-primary: ${tokens.primary};
        --sw-primary-fg: ${tokens.primaryForeground};
        --sw-border: ${tokens.border};
        --sw-input: ${tokens.input};
        --sw-accent: ${tokens.accent};
      }

      html,
      body {
        margin: 0;
        min-height: 100%;
        background: var(--sw-bg);
        color: var(--sw-fg);
        color-scheme: ${resolvedTheme};
      }

      .swagger-ui {
        color: var(--sw-fg);
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      }

      .swagger-ui .topbar { display: none; }
      .swagger-ui .scheme-container,
      .swagger-ui section.models,
      .swagger-ui article,
      .swagger-ui article *,
      .swagger-ui .model-box,
      .swagger-ui .opblock,
      .swagger-ui .dialog-ux .modal-ux,
      .swagger-ui .auth-container,
      .swagger-ui .responses-inner,
      .swagger-ui .parameters-container {
        background: var(--sw-card);
        border-color: var(--sw-border);
        box-shadow: none;
      }

      .swagger-ui .info,
      .swagger-ui .wrapper,
      .swagger-ui .opblock-tag-section,
      .swagger-ui .model-container,
      .swagger-ui .models,
      .swagger-ui article {
        background: var(--sw-bg);
      }

      .swagger-ui svg,
      .swagger-ui .model-toggle,
      .swagger-ui .model-toggle::after,
      .swagger-ui .expand-methods svg,
      .swagger-ui .expand-operation svg {
        color: var(--sw-fg);
        fill: currentColor;
      }

      .swagger-ui .info .title,
      .swagger-ui .info li,
      .swagger-ui .info p,
      .swagger-ui .info table,
      .swagger-ui .opblock-tag,
      .swagger-ui .opblock .opblock-summary-description,
      .swagger-ui .opblock .opblock-summary-path,
      .swagger-ui .opblock .opblock-summary-path__deprecated,
      .swagger-ui .opblock-description-wrapper p,
      .swagger-ui .response-col_status,
      .swagger-ui .response-col_description,
      .swagger-ui .parameter__name,
      .swagger-ui .parameter__type,
      .swagger-ui .parameter__deprecated,
      .swagger-ui .parameter__in,
      .swagger-ui table thead tr td,
      .swagger-ui table thead tr th,
      .swagger-ui label,
      .swagger-ui .model-title,
      .swagger-ui .model,
      .swagger-ui article,
      .swagger-ui article *,
      .swagger-ui .model span,
      .swagger-ui .model .property,
      .swagger-ui .model .property.primitive,
      .swagger-ui .model .property-row,
      .swagger-ui .model .renderedMarkdown,
      .swagger-ui .model .renderedMarkdown p,
      .swagger-ui .prop-type,
      .swagger-ui .prop-format,
      .swagger-ui .property-row td,
      .swagger-ui .property-row th,
      .swagger-ui .tab li,
      .swagger-ui .renderedMarkdown,
      .swagger-ui .renderedMarkdown p,
      .swagger-ui .renderedMarkdown code,
      .swagger-ui .markdown p,
      .swagger-ui .markdown code,
      .swagger-ui .microlight,
      .swagger-ui code,
      .swagger-ui pre,
      .swagger-ui pre *,
      .swagger-ui .highlight-code,
      .swagger-ui .highlight-code *,
      .swagger-ui .responses-table,
      .swagger-ui .responses-table * {
        color: var(--sw-fg);
      }

      .swagger-ui .opblock .opblock-section-header,
      .swagger-ui .opblock-body pre,
      .swagger-ui article,
      .swagger-ui .highlight-code,
      .swagger-ui .highlight-code .microlight,
      .swagger-ui .model-example,
      .swagger-ui .model-example *,
      .swagger-ui .example,
      .swagger-ui .example *,
      .swagger-ui textarea,
      .swagger-ui input,
      .swagger-ui select {
        background: var(--sw-input);
        color: var(--sw-fg);
        border-color: var(--sw-border);
        box-shadow: none;
      }

      .swagger-ui .opblock .opblock-section-header {
        background: var(--sw-muted);
      }

      .swagger-ui table,
      .swagger-ui tr,
      .swagger-ui td,
      .swagger-ui th,
      .swagger-ui article table,
      .swagger-ui article tr,
      .swagger-ui article td,
      .swagger-ui article th {
        background: transparent;
        border-color: var(--sw-border);
      }

      .swagger-ui article,
      .swagger-ui article .model,
      .swagger-ui article .model-box,
      .swagger-ui article .model-container,
      .swagger-ui article .property-row,
      .swagger-ui article .model-title {
        background: var(--sw-card) !important;
        color: var(--sw-schema-fg) !important;
        border-color: var(--sw-border) !important;
      }

      .swagger-ui article code,
      .swagger-ui article pre,
      .swagger-ui article .microlight,
      .swagger-ui article .renderedMarkdown,
      .swagger-ui article .renderedMarkdown *,
      .swagger-ui article .markdown,
      .swagger-ui article .markdown *,
      .swagger-ui article .prop-type,
      .swagger-ui article .prop-format,
      .swagger-ui article .prop-enum,
      .swagger-ui article .prop-default,
      .swagger-ui article .property,
      .swagger-ui article .property *,
      .swagger-ui article span {
        color: var(--sw-schema-fg) !important;
      }

      .swagger-ui article .prop-format,
      .swagger-ui article .prop-enum,
      .swagger-ui article .prop-default,
      .swagger-ui article .parameter__in,
      .swagger-ui article .parameter__extension,
      .swagger-ui article .parameter__default,
      .swagger-ui article .parameter__enum {
        color: var(--sw-schema-muted-fg) !important;
      }

      .swagger-ui [class^="json-schema-2020-12"],
      .swagger-ui [class*=" json-schema-2020-12"],
      .swagger-ui [class^="json-schema-2020-12"] *,
      .swagger-ui [class*=" json-schema-2020-12"] * {
        background: transparent !important;
        color: var(--sw-schema-fg) !important;
        border-color: var(--sw-border) !important;
      }

      .swagger-ui [class^="json-schema-2020-12__title"],
      .swagger-ui [class*=" json-schema-2020-12__title"],
      .swagger-ui [class^="json-schema-2020-12__title"] *,
      .swagger-ui [class*=" json-schema-2020-12__title"] *,
      .swagger-ui [class^="json-schema-2020-12"] code,
      .swagger-ui [class*=" json-schema-2020-12"] code {
        background: var(--sw-input) !important;
        color: var(--sw-schema-fg) !important;
        border-color: var(--sw-border) !important;
      }

      .swagger-ui [class^="json-schema-2020-12__attribute"],
      .swagger-ui [class*=" json-schema-2020-12__attribute"],
      .swagger-ui [class^="json-schema-2020-12__constraint"],
      .swagger-ui [class*=" json-schema-2020-12__constraint"],
      .swagger-ui [class^="json-schema-2020-12__description"],
      .swagger-ui [class*=" json-schema-2020-12__description"] {
        color: var(--sw-schema-muted-fg) !important;
      }

      .swagger-ui .opblock .opblock-summary {
        border-color: var(--sw-border);
      }

      .swagger-ui .btn,
      .swagger-ui .btn.authorize,
      .swagger-ui .try-out__btn,
      .swagger-ui .execute-wrapper .btn {
        border-color: var(--sw-primary);
        color: var(--sw-primary);
        box-shadow: none;
      }

      .swagger-ui .btn.execute {
        background: var(--sw-primary);
        border-color: var(--sw-primary);
        color: var(--sw-primary-fg);
      }

      .swagger-ui .servers > label,
      .swagger-ui small,
      .swagger-ui .response-control-media-type__accept-message,
      .swagger-ui .model-toggle::after,
      .swagger-ui .parameter__extension,
      .swagger-ui .parameter__default,
      .swagger-ui .parameter__enum,
      .swagger-ui .prop-format,
      .swagger-ui .prop-enum,
      .swagger-ui .prop-default {
        color: var(--sw-muted-fg);
      }

      .swagger-ui .opblock.opblock-get,
      .swagger-ui .opblock.opblock-post,
      .swagger-ui .opblock.opblock-put,
      .swagger-ui .opblock.opblock-delete,
      .swagger-ui .opblock.opblock-patch {
        background: var(--sw-card);
        border-color: var(--sw-border);
      }

      .swagger-ui .opblock-summary-method {
        color: var(--sw-primary-fg);
        text-shadow: none;
      }

      .swagger-ui .opblock.opblock-get .opblock-summary-method,
      .swagger-ui .opblock.opblock-post .opblock-summary-method,
      .swagger-ui .opblock.opblock-put .opblock-summary-method,
      .swagger-ui .opblock.opblock-delete .opblock-summary-method,
      .swagger-ui .opblock.opblock-patch .opblock-summary-method {
        background: var(--sw-primary);
      }

      .swagger-ui .tab li.active,
      .swagger-ui .tab li.active button,
      .swagger-ui .opblock-tag:hover,
      .swagger-ui .opblock-summary:hover {
        background: var(--sw-accent);
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: ${JSON.stringify(openApiUrl)},
        dom_id: "#swagger-ui",
        deepLinking: true,
        persistAuthorization: true,
        tryItOutEnabled: true${optionalRequestInterceptor}
      });
    </script>
  </body>
</html>`
}

export function SwaggerUiIframe({
  title,
  openApiUrl,
  proxyBasePath,
  className,
}: SwaggerUiIframeProps) {
  const { theme, resolvedTheme } = useTheme()
  const [html, setHtml] = useState('')
  const [frameKey, setFrameKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    let firstFrame = 0
    let secondFrame = 0
    let fallbackTimer = 0
    let observer: MutationObserver | null = null

    const rebuild = () => {
      if (cancelled) return
      const tokens = readSwaggerThemeTokens(resolvedTheme)
      setHtml(
        buildSwaggerHtml({ openApiUrl, proxyBasePath, resolvedTheme, tokens })
      )
      setFrameKey((value) => value + 1)
    }

    const scheduleRebuild = () => {
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(rebuild)
      })
    }

    scheduleRebuild()
    fallbackTimer = window.setTimeout(scheduleRebuild, 150)

    observer = new MutationObserver(scheduleRebuild)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme'],
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
      window.clearTimeout(fallbackTimer)
      observer?.disconnect()
    }
  }, [openApiUrl, proxyBasePath, resolvedTheme, theme])

  return (
    <iframe
      key={frameKey}
      title={title}
      className={cn('border-0', className)}
      srcDoc={html}
    />
  )
}
