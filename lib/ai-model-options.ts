export const AI_MODEL_OPTION_IDS = [
  'openai:gpt-4',
  'openai:gpt-5',
  'arvan:gpt-oss-20b',
] as const

export type AiModelOptionId = (typeof AI_MODEL_OPTION_IDS)[number]
export type AiModelProvider = 'openai' | 'arvan'

export type AiModelOption = {
  id: AiModelOptionId
  provider: AiModelProvider
  model: string
  label: string
  description: string
}

export const DEFAULT_AI_MODEL_OPTION_ID: AiModelOptionId = 'arvan:gpt-oss-20b'

export const AI_MODEL_OPTIONS: readonly AiModelOption[] = [
  {
    id: 'openai:gpt-4',
    provider: 'openai',
    model: 'gpt-4o-mini',
    label: 'OpenAI GPT-4',
    description: 'مدل GPT-4 از OpenAI',
  },
  {
    id: 'openai:gpt-5',
    provider: 'openai',
    model: 'gpt-5.4-mini',
    label: 'OpenAI GPT-5',
    description: 'مدل GPT-5 از OpenAI',
  },
  {
    id: 'arvan:gpt-oss-20b',
    provider: 'arvan',
    model: 'gpt-oss-20b',
    label: 'Arvan OSS 20B',
    description: 'مدل OSS 20B از Arvan',
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
