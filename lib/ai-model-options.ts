export const AI_MODEL_OPTION_IDS = [
  'parspack:gpt-oss-20b',
  'parspack:gpt-4o',
] as const

export type AiModelOptionId = (typeof AI_MODEL_OPTION_IDS)[number]
export type AiModelProvider = 'parspack'

export type AiModelOption = {
  id: AiModelOptionId
  provider: AiModelProvider
  model: string
  label: string
  description: string
}

export const DEFAULT_AI_MODEL_OPTION_ID: AiModelOptionId =
  'parspack:gpt-oss-20b'

export const AI_MODEL_SELECTION_COOKIE = 'iran-dashboard-ai-model'
export const AI_MODEL_SELECTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export const AI_MODEL_OPTIONS: readonly AiModelOption[] = [
  {
    id: 'parspack:gpt-oss-20b',
    provider: 'parspack',
    model: 'openai/gpt-oss-20b',
    label: 'ParsPack OSS 20B',
    description: 'مدل OpenAI OSS 20B از سرویس هوش مصنوعی پارس‌پک',
  },
  {
    id: 'parspack:gpt-4o',
    provider: 'parspack',
    model: 'openai/gpt-4o-2024-11-20',
    label: 'ChatGPT GPT-4o',
    description: 'مدل ChatGPT GPT-4o از سرویس هوش مصنوعی پارس‌پک',
  },
]

export function getAiModelOption(id?: string | null) {
  return (
    AI_MODEL_OPTIONS.find((option) => option.id === id) ??
    AI_MODEL_OPTIONS.find(
      (option) => option.id === DEFAULT_AI_MODEL_OPTION_ID
    ) ??
    AI_MODEL_OPTIONS[0]
  )
}

export function normalizeAiModelOptionId(id?: string | null): AiModelOptionId {
  return getAiModelOption(id).id
}

export function getAiModelSelectOptions() {
  return AI_MODEL_OPTIONS.map(({ id, label, description }) => ({
    id,
    label,
    description,
  }))
}
