'use server'

import { revalidatePath } from 'next/cache'

import prisma from '@/lib/prisma'
import { formSchemaType } from '@/schemas/form'
import { PageType } from '@/components/context/DesignerContext'
import { FormElementInstance } from '@/types/element-type'

const DEFAULT_USER_ID = '1'
const DEFAULT_ROLE_KEY = 'user'
const DEFAULT_SUBMODULE_SLUG = 'resources'
const USAGE_SUBMODULE_SLUG = 'usage'

type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export type FormEventRuleInput = {
  id?: number
  name?: string
  sourceField?: string | null
  targetField: string
  expression: string
  trigger?: string
  enabled?: boolean
}

export type FormSettingsInput = {
  scheduleType: 'hourly' | 'weekly' | 'monthly'
  scheduleInterval: number
  submoduleId?: number | null
  roleId?: number | null
  assignedUserId?: string | null
}

export type FormInitialDataSourceInput = {
  enabled: boolean
  url: string
  method: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string
  dataPath?: string
  mapping?: Record<string, string>
}

type FormRuntimeContext = {
  initialDataSource?: FormInitialDataSourceInput
  [key: string]: unknown
}

export type SubmoduleInput = {
  slug: string
  name: string
  description?: string
  icon?: string
  metadata?: string
}

export type TemplateFromFormInput = {
  formId: number
  slug?: string
  name?: string
  description?: string
  icon?: string
  metadata?: string
}

export type TemplateCatalogInput = {
  slug: string
  name: string
  description?: string
  icon?: string
  metadata?: string
}

type TemplateSeedInput = {
  slug: string
  name: string
  description: string
  icon: string
  metadata?: Record<string, unknown>
  scheduleType: 'hourly' | 'weekly' | 'monthly'
  scheduleInterval: number
  components: FormElementInstance[]
  events: FormEventRuleInput[]
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function stringifyJson(value: unknown) {
  return JSON.stringify(value ?? [])
}

function parseFormRuntimeContext(value: string | null | undefined) {
  const parsed = parseJson<FormRuntimeContext | unknown[]>(value, {})

  if (Array.isArray(parsed)) {
    return { items: parsed } as FormRuntimeContext
  }

  return parsed ?? {}
}

function normalizeInitialDataSource(
  input?: FormInitialDataSourceInput | null
): FormInitialDataSourceInput | undefined {
  if (!input) return undefined

  return {
    enabled: Boolean(input.enabled),
    url: String(input.url || '').trim(),
    method: input.method === 'POST' ? 'POST' : 'GET',
    headers: input.headers && typeof input.headers === 'object'
      ? input.headers
      : {},
    body: input.body || '',
    dataPath: input.dataPath || '',
    mapping: input.mapping && typeof input.mapping === 'object'
      ? input.mapping
      : {},
  }
}

function replaceTemplateParams(
  value: string,
  params: Record<string, string | string[] | undefined>
) {
  return value.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const param = params[key.trim()]
    return encodeURIComponent(Array.isArray(param) ? param[0] ?? '' : param ?? '')
  })
}

function resolveRuntimeUrl(value: string) {
  if (value.startsWith('/')) {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
      'http://localhost:3000'

    return new URL(value, baseUrl)
  }

  return new URL(value)
}

function getValueByPath(source: unknown, path: string) {
  if (!path.trim()) return source

  return path.split('.').reduce<unknown>((current, segment) => {
    if (current == null) return undefined
    if (Array.isArray(current)) return current[Number(segment)]
    if (typeof current !== 'object') return undefined

    return (current as Record<string, unknown>)[segment]
  }, source)
}

function defaultPages(): PageType[] {
  return [{ id: 'page-1', index: 1, name: 'Page-1' }]
}

function numberField(
  id: string,
  index: number,
  name: string,
  label: string,
  placeholder = '0',
  extraAttributes: Record<string, unknown> = {}
): FormElementInstance {
  return {
    id,
    index,
    type: 'text',
    parentId: null,
    page: 'page-1',
    extraAttributes: {
      id,
      name,
      type: 'number',
      title: label,
      label,
      helperText: '',
      required: false,
      placeholder,
      mask: 'Number',
      min: '0',
      max: '999999999',
      minLength: '0',
      maxLength: '16',
      scale: '2',
      radix: '.',
      thousandsSeparator: ',',
      padFractionalZeros: false,
      normalizeZeros: true,
      lazy: false,
      disabled: false,
      span: '1',
      ...extraAttributes,
    },
  }
}

const sampleResourceForm = {
  slug: 'dam-resource-entry',
  name: 'فرم ورود داده منابع سد',
  description: 'ثبت اطلاعات سطح، حجم، ورودی و خروجی مخزن سد.',
  scheduleType: 'hourly' as const,
  scheduleInterval: 1,
  components: [
    numberField('resource_dam_code', 0, 'damCode', 'کد سد', '1001', {
      required: true,
      scale: '0',
    }),
    numberField(
      'resource_reservoir_level',
      1,
      'reservoirLevel',
      'تراز مخزن',
      '1250.5'
    ),
    numberField(
      'resource_reservoir_volume',
      2,
      'reservoirVolume',
      'حجم فعلی مخزن',
      '850'
    ),
    numberField(
      'resource_reservoir_capacity',
      3,
      'reservoirCapacity',
      'ظرفیت کل مخزن',
      '1200'
    ),
    numberField('resource_inflow', 4, 'inflow', 'دبی ورودی', '35'),
    numberField('resource_outflow', 5, 'outflow', 'دبی خروجی', '28'),
    numberField(
      'resource_fill_percent',
      6,
      'fillPercent',
      'درصد پرشدگی',
      '70',
      { disabled: true }
    ),
  ],
  events: [
    {
      name: 'محاسبه درصد پرشدگی',
      sourceField: 'reservoirVolume',
      targetField: 'fillPercent',
      expression:
        'reservoirCapacity == 0 ? 0 : round(reservoirVolume / reservoirCapacity * 100, 2)',
      trigger: 'change',
      enabled: true,
    },
  ],
}

const sampleUsageForm = {
  slug: 'dam-usage-entry',
  name: 'فرم ورود داده مصارف سد',
  description: 'ثبت اطلاعات مصارف شرب، کشاورزی، صنعت و رهاسازی زیست‌محیطی.',
  scheduleType: 'weekly' as const,
  scheduleInterval: 1,
  components: [
    numberField('usage_dam_code', 0, 'damCode', 'کد سد', '1001', {
      required: true,
      scale: '0',
    }),
    numberField('usage_drinking', 1, 'drinkingUsage', 'مصرف شرب', '12'),
    numberField(
      'usage_agriculture',
      2,
      'agricultureUsage',
      'مصرف کشاورزی',
      '42'
    ),
    numberField('usage_industry', 3, 'industryUsage', 'مصرف صنعت', '8'),
    numberField(
      'usage_environment',
      4,
      'environmentalRelease',
      'رهاسازی زیست‌محیطی',
      '5'
    ),
    numberField('usage_total', 5, 'totalUsage', 'جمع کل مصرف', '67', {
      disabled: true,
    }),
  ],
  events: [
    {
      name: 'محاسبه جمع کل مصرف',
      sourceField: 'drinkingUsage',
      targetField: 'totalUsage',
      expression:
        'drinkingUsage + agricultureUsage + industryUsage + environmentalRelease',
      trigger: 'change',
      enabled: true,
    },
  ],
}

function normalizeEvents(events: FormEventRuleInput[]) {
  return events
    .filter((event) => event.targetField?.trim() && event.expression?.trim())
    .map((event, index) => ({
      name: event.name?.trim() || `محاسبه ${index + 1}`,
      sourceField: event.sourceField?.trim() || null,
      targetField: event.targetField.trim(),
      expression: event.expression.trim(),
      trigger: event.trigger || 'change',
      enabled: event.enabled !== false,
    }))
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeJsonText(value: string | undefined, fallback = '{}') {
  if (!value?.trim()) return fallback

  try {
    JSON.parse(value)
    return value
  } catch {
    return fallback
  }
}

function normalizeJsonObjectText(value: string | undefined, fieldName: string) {
  if (!value?.trim()) return '{}'

  try {
    const parsed = JSON.parse(value)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(`${fieldName} باید یک آبجکت JSON باشد.`)
    }

    return JSON.stringify(parsed)
  } catch (error) {
    if (error instanceof Error && error.message.includes(fieldName)) {
      throw error
    }

    throw new Error(`${fieldName} معتبر نیست.`)
  }
}

function buildUsageList(usages: Array<[string, number]>) {
  return usages
    .filter(([, count]) => count > 0)
    .map(([label, count]) => `${count.toLocaleString('fa-IR')} ${label}`)
    .join('، ')
}

function collectFieldElements(elements: FormElementInstance[]) {
  return elements
    .filter((element) => element.type === 'text')
    .map((element) => ({
      elementId: element.id,
      pageId: element.page,
      parentId: element.parentId,
      fieldKey: String(element.extraAttributes?.name || element.id),
      fieldLabel: String(
        element.extraAttributes?.label ||
          element.extraAttributes?.title ||
          element.extraAttributes?.name ||
          element.id
      ),
      valueType: String(element.extraAttributes?.type || 'text'),
    }))
}

function serializeRawValue(value: unknown) {
  if (value === undefined || value === null) return null
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

function buildSubmissionValues({
  content,
  components,
  submissionId,
  formId,
  formVersionId,
}: {
  content: Record<string, unknown>
  components: FormElementInstance[]
  submissionId: number
  formId: number
  formVersionId?: number | null
}) {
  const fields = collectFieldElements(components)

  return fields
    .filter((field) =>
      Object.prototype.hasOwnProperty.call(content, field.fieldKey)
    )
    .map((field) => {
      const value = content[field.fieldKey]
      const rawValue = serializeRawValue(value)
      const numericValue =
        typeof value === 'number'
          ? value
          : typeof value === 'string'
            ? Number(value.replaceAll(',', ''))
            : Number.NaN
      const booleanValue =
        typeof value === 'boolean'
          ? value
          : typeof value === 'string' && ['true', 'false'].includes(value)
            ? value === 'true'
            : null
      const dateValue =
        typeof value === 'string' && !Number.isFinite(numericValue)
          ? new Date(value)
          : null
      const isDateValid =
        dateValue instanceof Date && !Number.isNaN(dateValue.getTime())
      const isObjectValue =
        value !== null && typeof value === 'object' && !Array.isArray(value)

      return {
        submissionId,
        formId,
        formVersionId,
        fieldKey: field.fieldKey,
        fieldLabel: field.fieldLabel,
        elementId: field.elementId,
        pageId: field.pageId,
        parentId: field.parentId,
        valueType: field.valueType,
        stringValue:
          typeof value === 'string' || typeof value === 'number'
            ? String(value)
            : null,
        numberValue: Number.isFinite(numericValue) ? numericValue : null,
        booleanValue,
        dateValue: isDateValid ? dateValue : null,
        jsonValue:
          isObjectValue || Array.isArray(value) ? JSON.stringify(value) : null,
        rawValue,
      }
    })
}

function getTypedSubmissionValue(value: any) {
  if (value.jsonValue) return parseJson(value.jsonValue, null)
  if (value.numberValue !== null && value.numberValue !== undefined) {
    return value.numberValue
  }
  if (value.booleanValue !== null && value.booleanValue !== undefined) {
    return value.booleanValue
  }
  if (value.dateValue) return value.dateValue
  if (value.stringValue !== null && value.stringValue !== undefined) {
    return value.stringValue
  }
  return value.rawValue
}

async function ensureTemplate(input: TemplateSeedInput) {
  const existingTemplate = await prisma.formTemplate.findUnique({
    where: { slug: input.slug },
  })

  if (existingTemplate) return existingTemplate

  const template = await prisma.formTemplate.create({
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      icon: input.icon,
      metadata: JSON.stringify(input.metadata ?? {}),
      page: stringifyJson(defaultPages()),
      components: stringifyJson(input.components),
      context: '[]',
      eventConfig: stringifyJson(input.events),
      scheduleType: input.scheduleType,
      scheduleInterval: input.scheduleInterval,
      scheduleConfig: '{}',
      active: true,
    },
  })

  await prisma.formTemplateVersion.create({
    data: {
      templateId: template.id,
      version: template.currentVersion,
      name: template.name,
      description: template.description,
      icon: template.icon,
      metadata: template.metadata,
      page: template.page,
      components: template.components,
      context: template.context,
      eventConfig: template.eventConfig,
      scheduleType: template.scheduleType,
      scheduleInterval: template.scheduleInterval,
      scheduleConfig: template.scheduleConfig,
    },
  })

  return template
}

async function ensureBaseCatalog() {
  const adminRole = await prisma.role.upsert({
    where: { key: 'admin' },
    update: {},
    create: { key: 'admin', name: 'مدیر سیستم' },
  })

  const userRole = await prisma.role.upsert({
    where: { key: DEFAULT_ROLE_KEY },
    update: {},
    create: { key: DEFAULT_ROLE_KEY, name: 'کاربر' },
  })

  await prisma.appUser.upsert({
    where: { id: DEFAULT_USER_ID },
    update: { roleId: userRole.id },
    create: {
      id: DEFAULT_USER_ID,
      email: 'user@example.local',
      name: 'کاربر نمونه',
      roleId: userRole.id,
    },
  })

  await prisma.appUser.upsert({
    where: { id: 'admin' },
    update: { roleId: adminRole.id },
    create: {
      id: 'admin',
      email: 'admin@example.local',
      name: 'مدیر سامانه',
      roleId: adminRole.id,
    },
  })

  const resources = await prisma.submodule.upsert({
    where: { slug: DEFAULT_SUBMODULE_SLUG },
    update: {
      name: 'منابع',
      description: 'فرم‌ها و داشبوردهای مرتبط با زیرسیستم منابع سد.',
      icon: 'dam',
      metadata: JSON.stringify({ color: 'blue', domain: 'dam-resources' }),
      active: true,
    },
    create: {
      slug: DEFAULT_SUBMODULE_SLUG,
      name: 'منابع',
      description: 'فرم‌ها و داشبوردهای مرتبط با زیرسیستم منابع سد.',
      icon: 'dam',
      metadata: JSON.stringify({ color: 'blue', domain: 'dam-resources' }),
      baseTables: JSON.stringify([
        { key: 'dams', title: 'جدول پایه سدها' },
        { key: 'rivers', title: 'جدول پایه رودخانه‌ها' },
      ]),
    },
  })

  const usage = await prisma.submodule.upsert({
    where: { slug: USAGE_SUBMODULE_SLUG },
    update: {
      name: 'مصارف',
      description: 'فرم‌ها و داشبوردهای مرتبط با زیرسیستم مصارف سد.',
      icon: 'waves',
      metadata: JSON.stringify({ color: 'cyan', domain: 'dam-usage' }),
      active: true,
    },
    create: {
      slug: USAGE_SUBMODULE_SLUG,
      name: 'مصارف',
      description: 'فرم‌ها و داشبوردهای مرتبط با زیرسیستم مصارف سد.',
      icon: 'waves',
      metadata: JSON.stringify({ color: 'cyan', domain: 'dam-usage' }),
      baseTables: JSON.stringify([
        { key: 'usageTypes', title: 'جدول پایه انواع مصرف' },
        { key: 'beneficiaries', title: 'جدول پایه بهره‌برداران' },
      ]),
    },
  })

  await prisma.submodule.upsert({
    where: { slug: 'operations' },
    update: { active: false },
    create: {
      slug: 'operations',
      name: 'بهره‌برداری',
      description: 'فرم‌ها و داده‌های بهره‌برداری که بعدا تکمیل می‌شوند.',
      icon: 'activity',
      metadata: '{}',
      active: false,
      baseTables: JSON.stringify([
        { key: 'operators', title: 'جدول پایه بهره‌برداران' },
      ]),
    },
  })

  const resourceTemplate = await ensureTemplate({
    ...sampleResourceForm,
    icon: 'dam',
    metadata: { submodule: 'resources' },
  })
  const usageTemplate = await ensureTemplate({
    ...sampleUsageForm,
    icon: 'waves',
    metadata: { submodule: 'usage' },
  })

  await ensureSeedForm({
    ...sampleResourceForm,
    submoduleId: resources.id,
    roleId: userRole.id,
    templateId: resourceTemplate.id,
    templateVersion: resourceTemplate.currentVersion,
  })
  await ensureSeedForm({
    ...sampleUsageForm,
    submoduleId: usage.id,
    roleId: userRole.id,
    templateId: usageTemplate.id,
    templateVersion: usageTemplate.currentVersion,
  })

  return { adminRole, userRole, defaultSubmodule: resources }
}

async function ensureSeedForm(input: {
  name: string
  description: string
  scheduleType: 'hourly' | 'weekly' | 'monthly'
  scheduleInterval: number
  components: FormElementInstance[]
  events: FormEventRuleInput[]
  submoduleId: number
  roleId: number
  templateId?: number
  templateVersion?: number
}) {
  const existingForm = await prisma.form.findFirst({
    where: {
      userId: DEFAULT_USER_ID,
      name: input.name,
    },
  })

  if (existingForm) {
    await ensureVersionForForm(existingForm.id)

    const existingAssignment = await prisma.formAssignment.findFirst({
      where: {
        formId: existingForm.id,
        submoduleId: input.submoduleId,
      },
    })

    if (!existingAssignment) {
      await prisma.formAssignment.create({
        data: {
          formId: existingForm.id,
          userId: DEFAULT_USER_ID,
          roleId: input.roleId,
          submoduleId: input.submoduleId,
        },
      })
    }

    if (!existingForm.templateId && input.templateId) {
      await prisma.form.update({
        where: { id: existingForm.id },
        data: {
          templateId: input.templateId,
          templateVersion: input.templateVersion,
        },
      })
    }

    return existingForm
  }

  return prisma.$transaction(async (tx) => {
    const form = await tx.form.create({
      data: {
        userId: DEFAULT_USER_ID,
        assignedUserId: DEFAULT_USER_ID,
        roleId: input.roleId,
        submoduleId: input.submoduleId,
        templateId: input.templateId,
        templateVersion: input.templateVersion,
        name: input.name,
        description: input.description,
        page: stringifyJson(defaultPages()),
        components: stringifyJson(input.components),
        context: '[]',
        eventConfig: stringifyJson(input.events),
        scheduleType: input.scheduleType,
        scheduleInterval: input.scheduleInterval,
        scheduleConfig: '{}',
        published: true,
      },
    })

    const version = await createInitialVersion(tx, form)

    if (input.events.length > 0) {
      await tx.formEvent.createMany({
        data: input.events.map((event) => ({
          ...event,
          formId: form.id,
          version: version.version,
        })),
      })
    }

    await tx.formAssignment.create({
      data: {
        formId: form.id,
        userId: DEFAULT_USER_ID,
        roleId: input.roleId,
        submoduleId: input.submoduleId,
      },
    })

    return form
  })
}

async function createInitialVersion(
  tx: TransactionClient,
  form: Awaited<ReturnType<typeof prisma.form.create>>
) {
  return tx.formVersion.create({
    data: {
      formId: form.id,
      version: form.currentVersion,
      name: form.name,
      description: form.description,
      page: form.page,
      components: form.components,
      context: form.context,
      eventConfig: form.eventConfig,
      scheduleType: form.scheduleType,
      scheduleInterval: form.scheduleInterval,
      scheduleConfig: form.scheduleConfig,
      published: form.published,
    },
  })
}

async function updateFormAndVersion(
  tx: TransactionClient,
  formId: number,
  data: Record<string, unknown>
) {
  const currentForm = await tx.form.findUnique({
    where: { id: formId },
  })

  if (!currentForm) {
    throw new Error('Form not found')
  }

  const latestVersion = await tx.formVersion.findFirst({
    where: { formId },
    orderBy: { version: 'desc' },
  })
  const nextVersion =
    Math.max(latestVersion?.version ?? 0, currentForm.currentVersion ?? 0) + 1

  const form = await tx.form.update({
    where: { id: formId },
    data: {
      ...data,
      currentVersion: nextVersion,
    },
  })

  const version = await tx.formVersion.create({
    data: {
      formId: form.id,
      version: nextVersion,
      name: form.name,
      description: form.description,
      page: form.page,
      components: form.components,
      context: form.context,
      eventConfig: form.eventConfig,
      scheduleType: form.scheduleType,
      scheduleInterval: form.scheduleInterval,
      scheduleConfig: form.scheduleConfig,
      published: form.published,
    },
  })

  return { form, version }
}

async function ensureVersionForForm(formId: number) {
  const form = await prisma.form.findUnique({ where: { id: formId } })
  if (!form) return null

  const latestVersion = await prisma.formVersion.findFirst({
    where: { formId },
    orderBy: { version: 'desc' },
  })

  if (latestVersion) return latestVersion

  return prisma.formVersion.create({
    data: {
      formId: form.id,
      version: form.currentVersion,
      name: form.name,
      description: form.description,
      page: form.page,
      components: form.components,
      context: form.context,
      eventConfig: form.eventConfig,
      scheduleType: form.scheduleType,
      scheduleInterval: form.scheduleInterval,
      scheduleConfig: form.scheduleConfig,
      published: form.published,
    },
  })
}

function serializeForm(form: any) {
  const eventConfig = parseJson<FormEventRuleInput[]>(form.eventConfig, [])
  const context = parseFormRuntimeContext(form.context)

  return {
    ...form,
    page: parseJson<PageType[]>(form.page, defaultPages()),
    components: parseJson<FormElementInstance[]>(form.components, []),
    context,
    initialDataSource: normalizeInitialDataSource(context.initialDataSource),
    eventConfig,
    events:
      form.eventRules?.map((event: any) => ({
        id: event.id,
        name: event.name,
        sourceField: event.sourceField,
        targetField: event.targetField,
        expression: event.expression,
        trigger: event.trigger,
        enabled: event.enabled,
      })) ?? eventConfig,
  }
}

function serializeSubmission(submission: any) {
  const content = parseJson<Record<string, unknown>>(submission.content, {})
  const computedContent = parseJson<Record<string, unknown>>(
    submission.computedContent,
    {}
  )
  const values =
    submission.values?.map((value: any) => ({
      ...value,
      value: getTypedSubmissionValue(value),
    })) ?? []
  const typedPayload = Object.fromEntries(
    values.map((value: any) => [value.fieldKey, value.value])
  )

  return {
    ...submission,
    content,
    computedContent,
    values,
    typedPayload,
    data: content,
    row: {
      id: submission.id,
      submittedAt: submission.submittedAt,
      version: submission.version,
      ...typedPayload,
      ...content,
      ...computedContent,
    },
  }
}

export async function GetFormStats() {
  await ensureBaseCatalog()

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const visibleFormsWhere = {
    submoduleId: {
      not: null,
    },
  }

  const [forms, totals, allSubmissions, todaySubmissions, monthSubmissions] =
    await Promise.all([
      prisma.form.count({ where: visibleFormsWhere }),
      prisma.form.aggregate({
        where: visibleFormsWhere,
        _sum: {
          visit: true,
          submission: true,
        },
      }),
      prisma.formSubmission.count(),
      prisma.formSubmission.count({
        where: { submittedAt: { gte: startOfToday } },
      }),
      prisma.formSubmission.count({
        where: { submittedAt: { gte: startOfMonth } },
      }),
    ])

  return {
    forms,
    visits: totals._sum.visit ?? 0,
    submissions: totals._sum.submission ?? allSubmissions,
    submissionsRate: todaySubmissions,
    bounceRate: monthSubmissions,
  }
}

export async function GetFormSetupOptions() {
  await ensureBaseCatalog()

  const [roles, users, submodules, templates] = await Promise.all([
    prisma.role.findMany({ orderBy: { name: 'asc' } }),
    prisma.appUser.findMany({ orderBy: { name: 'asc' } }),
    prisma.submodule.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    }),
    prisma.formTemplate.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return {
    roles,
    users,
    submodules: submodules.map((submodule) => ({
      ...submodule,
      baseTables: parseJson(submodule.baseTables, []),
      metadata: parseJson(submodule.metadata, {}),
    })),
    templates: templates.map((template) => ({
      ...template,
      metadata: parseJson(template.metadata, {}),
    })),
  }
}

export async function GetFormModuleCatalog() {
  await ensureBaseCatalog()

  const [submodules, templates, forms] = await Promise.all([
    prisma.submodule.findMany({
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            forms: true,
            assignments: true,
            submissions: true,
          },
        },
      },
    }),
    prisma.formTemplate.findMany({
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            forms: true,
            versions: true,
          },
        },
      },
    }),
    prisma.form.findMany({
      where: {
        submoduleId: {
          not: null,
        },
      },
      include: {
        submodule: true,
        template: true,
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  return {
    submodules: submodules.map((submodule) => ({
      ...submodule,
      metadata: parseJson(submodule.metadata, {}),
      baseTables: parseJson(submodule.baseTables, []),
    })),
    templates: templates.map((template) => ({
      ...template,
      metadata: parseJson(template.metadata, {}),
    })),
    forms: forms.map((form) => ({
      id: form.id,
      name: form.name,
      description: form.description,
      currentVersion: form.currentVersion,
      published: form.published,
      visit: form.visit,
      submission: form.submission,
      scheduleType: form.scheduleType,
      scheduleInterval: form.scheduleInterval,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      submoduleId: form.submoduleId,
      templateId: form.templateId,
      templateVersion: form.templateVersion,
      submoduleSlug: form.submodule?.slug ?? '',
      submoduleName: form.submodule?.name ?? '',
      templateSlug: form.template?.slug ?? '',
      templateName: form.template?.name ?? '',
    })),
  }
}

export async function CreateSubmodule(input: SubmoduleInput) {
  const slug = normalizeSlug(input.slug)
  const name = input.name.trim()

  if (!slug) {
    throw new Error('شناسه زیرماژول معتبر نیست.')
  }

  if (!name) {
    throw new Error('نام زیرماژول الزامی است.')
  }

  const submodule = await prisma.submodule.upsert({
    where: { slug },
    update: {
      name,
      description: input.description?.trim() ?? '',
      icon: input.icon || 'layers',
      metadata: normalizeJsonObjectText(input.metadata, 'متادیتا'),
      active: true,
    },
    create: {
      slug,
      name,
      description: input.description?.trim() ?? '',
      icon: input.icon || 'layers',
      metadata: normalizeJsonObjectText(input.metadata, 'متادیتا'),
      baseTables: '[]',
      active: true,
    },
  })

  revalidatePath('/form-builder')
  revalidatePath('/form-builder/modules')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/submodule')

  return {
    ...submodule,
    metadata: parseJson(submodule.metadata, {}),
    baseTables: parseJson(submodule.baseTables, []),
  }
}

export async function UpdateSubmodule(id: number, input: SubmoduleInput) {
  const submoduleId = Number(id)
  const slug = normalizeSlug(input.slug)
  const name = input.name.trim()

  if (!submoduleId) {
    throw new Error('زیرماژول معتبر نیست.')
  }

  if (!slug) {
    throw new Error('شناسه زیرماژول معتبر نیست.')
  }

  if (!name) {
    throw new Error('نام زیرماژول الزامی است.')
  }

  const current = await prisma.submodule.findUnique({
    where: { id: submoduleId },
  })

  if (!current) {
    throw new Error('زیرماژول پیدا نشد.')
  }

  const conflictingSlug = await prisma.submodule.findUnique({
    where: { slug },
  })

  if (conflictingSlug && conflictingSlug.id !== current.id) {
    throw new Error('زیرماژولی با این شناسه وجود دارد.')
  }

  const submodule = await prisma.submodule.update({
    where: { id: current.id },
    data: {
      slug,
      name,
      description: input.description?.trim() ?? '',
      icon: input.icon || 'layers',
      metadata: normalizeJsonObjectText(input.metadata, 'متادیتا'),
    },
  })

  revalidatePath('/form-builder')
  revalidatePath('/form-builder/modules')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/submodule')
  revalidatePath(`/dashboard/submodule/${current.slug}`)
  revalidatePath(`/dashboard/submodule/${submodule.slug}`)

  return {
    ...submodule,
    metadata: parseJson(submodule.metadata, {}),
    baseTables: parseJson(submodule.baseTables, []),
  }
}

export async function DeleteSubmodule(id: number) {
  const submoduleId = Number(id)

  if (!submoduleId) {
    throw new Error('زیرماژول معتبر نیست.')
  }

  const submodule = await prisma.submodule.findUnique({
    where: { id: submoduleId },
    include: {
      _count: {
        select: {
          forms: true,
          assignments: true,
          submissions: true,
        },
      },
    },
  })

  if (!submodule) {
    throw new Error('زیرماژول پیدا نشد.')
  }

  const usage = buildUsageList([
    ['فرم', submodule._count.forms],
    ['تخصیص', submodule._count.assignments],
    ['داده ثبت‌شده', submodule._count.submissions],
  ])

  if (usage) {
    throw new Error(
      `این زیرماژول قابل حذف نیست چون به ${usage} متصل است. ابتدا وابستگی‌ها را منتقل یا حذف کنید.`
    )
  }

  await prisma.submodule.delete({ where: { id: submodule.id } })

  revalidatePath('/form-builder')
  revalidatePath('/form-builder/modules')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/submodule')
  revalidatePath(`/dashboard/submodule/${submodule.slug}`)

  return { id: submodule.id }
}

export async function CreateTemplateFromForm(input: TemplateFromFormInput) {
  const form = await prisma.form.findUnique({
    where: { id: Number(input.formId) },
  })

  if (!form) {
    throw new Error('فرم مبدا پیدا نشد.')
  }

  const name = input.name?.trim() || `${form.name} - قالب`
  const slug = normalizeSlug(input.slug || name)

  if (!slug) {
    throw new Error('شناسه قالب معتبر نیست.')
  }

  const existingTemplate = await prisma.formTemplate.findUnique({
    where: { slug },
  })

  if (existingTemplate) {
    throw new Error('قالبی با این شناسه وجود دارد.')
  }

  const template = await prisma.$transaction(async (tx) => {
    const createdTemplate = await tx.formTemplate.create({
      data: {
        slug,
        name,
        description: input.description?.trim() || form.description,
        icon: input.icon || 'file-text',
        metadata: normalizeJsonObjectText(input.metadata, 'متادیتا'),
        page: form.page,
        components: form.components,
        context: form.context,
        eventConfig: form.eventConfig,
        scheduleType: form.scheduleType,
        scheduleInterval: form.scheduleInterval,
        scheduleConfig: form.scheduleConfig,
        active: true,
      },
    })

    await tx.formTemplateVersion.create({
      data: {
        templateId: createdTemplate.id,
        version: createdTemplate.currentVersion,
        name: createdTemplate.name,
        description: createdTemplate.description,
        icon: createdTemplate.icon,
        metadata: createdTemplate.metadata,
        page: createdTemplate.page,
        components: createdTemplate.components,
        context: createdTemplate.context,
        eventConfig: createdTemplate.eventConfig,
        scheduleType: createdTemplate.scheduleType,
        scheduleInterval: createdTemplate.scheduleInterval,
        scheduleConfig: createdTemplate.scheduleConfig,
      },
    })

    return createdTemplate
  })

  revalidatePath('/form-builder')
  revalidatePath('/form-builder/modules')

  return {
    ...template,
    metadata: parseJson(template.metadata, {}),
  }
}

export async function UpdateTemplate(
  templateId: number,
  input: TemplateCatalogInput
) {
  const id = Number(templateId)
  const slug = normalizeSlug(input.slug)
  const name = input.name.trim()

  if (!id) {
    throw new Error('قالب معتبر نیست.')
  }

  if (!slug) {
    throw new Error('شناسه قالب معتبر نیست.')
  }

  if (!name) {
    throw new Error('نام قالب الزامی است.')
  }

  const template = await prisma.formTemplate.findUnique({
    where: { id },
  })

  if (!template) {
    throw new Error('قالب پیدا نشد.')
  }

  const conflictingSlug = await prisma.formTemplate.findUnique({
    where: { slug },
  })

  if (conflictingSlug && conflictingSlug.id !== template.id) {
    throw new Error('قالبی با این شناسه وجود دارد.')
  }

  const updatedTemplate = await prisma.formTemplate.update({
    where: { id: template.id },
    data: {
      slug,
      name,
      description: input.description?.trim() ?? '',
      icon: input.icon || 'file-text',
      metadata: normalizeJsonObjectText(input.metadata, 'متادیتا'),
    },
  })

  revalidatePath('/form-builder')
  revalidatePath('/form-builder/modules')

  return {
    ...updatedTemplate,
    metadata: parseJson(updatedTemplate.metadata, {}),
  }
}

export async function DeleteTemplate(templateId: number) {
  const id = Number(templateId)

  if (!id) {
    throw new Error('قالب معتبر نیست.')
  }

  const template = await prisma.formTemplate.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          forms: true,
          versions: true,
        },
      },
    },
  })

  if (!template) {
    throw new Error('قالب پیدا نشد.')
  }

  if (template._count.forms > 0) {
    throw new Error(
      `Cannot delete template: ${template._count.forms} forms depend on it.`
    )
  }

  await prisma.formTemplate.delete({ where: { id: template.id } })

  revalidatePath('/form-builder')
  revalidatePath('/form-builder/modules')

  return { id: template.id }
}

export async function UpdateTemplateFromForm(
  templateId: number,
  sourceFormId: number
) {
  const [template, sourceForm] = await Promise.all([
    prisma.formTemplate.findUnique({
      where: { id: Number(templateId) },
    }),
    prisma.form.findUnique({
      where: { id: Number(sourceFormId) },
    }),
  ])

  if (!template) {
    throw new Error('قالب پیدا نشد.')
  }

  if (!sourceForm) {
    throw new Error('فرم مبدا پیدا نشد.')
  }

  const nextTemplateVersion = template.currentVersion + 1
  const eventConfig = sourceForm.eventConfig
  const templateSnapshot = {
    page: sourceForm.page,
    components: sourceForm.components,
    context: sourceForm.context,
    eventConfig,
    scheduleType: sourceForm.scheduleType,
    scheduleInterval: sourceForm.scheduleInterval,
    scheduleConfig: sourceForm.scheduleConfig,
  }
  const sanitizedEvents = normalizeEvents(
    parseJson<FormEventRuleInput[]>(eventConfig, [])
  )

  const result = await prisma.$transaction(async (tx) => {
    const updatedTemplate = await tx.formTemplate.update({
      where: { id: template.id },
      data: {
        ...templateSnapshot,
        currentVersion: nextTemplateVersion,
      },
    })

    await tx.formTemplateVersion.create({
      data: {
        templateId: updatedTemplate.id,
        version: nextTemplateVersion,
        name: updatedTemplate.name,
        description: updatedTemplate.description,
        icon: updatedTemplate.icon,
        metadata: updatedTemplate.metadata,
        page: updatedTemplate.page,
        components: updatedTemplate.components,
        context: updatedTemplate.context,
        eventConfig: updatedTemplate.eventConfig,
        scheduleType: updatedTemplate.scheduleType,
        scheduleInterval: updatedTemplate.scheduleInterval,
        scheduleConfig: updatedTemplate.scheduleConfig,
      },
    })

    const inheritedForms = await tx.form.findMany({
      where: {
        templateId: template.id,
      },
      orderBy: { id: 'asc' },
    })

    for (const inheritedForm of inheritedForms) {
      const { form, version } = await updateFormAndVersion(
        tx,
        inheritedForm.id,
        {
          ...templateSnapshot,
          templateVersion: nextTemplateVersion,
          updatedAt: new Date(),
        }
      )

      await tx.formEvent.deleteMany({ where: { formId: form.id } })

      if (sanitizedEvents.length > 0) {
        await tx.formEvent.createMany({
          data: sanitizedEvents.map((event) => ({
            ...event,
            formId: form.id,
            version: version.version,
          })),
        })
      }
    }

    return {
      template: updatedTemplate,
      propagatedForms: inheritedForms.length,
    }
  })

  revalidatePath('/form-builder')
  revalidatePath('/form-builder/modules')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/submodule')

  return result
}

export async function GetDashboardSubmoduleCards() {
  await ensureBaseCatalog()

  const submodules = await prisma.submodule.findMany({
    where: { active: true },
    include: {
      assignments: {
        where: {
          active: true,
          form: {
            published: true,
          },
        },
        include: {
          form: {
            include: {
              _count: {
                select: {
                  submissions: true,
                  versions: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { id: 'asc' },
  })

  return submodules.map((submodule) => {
    const forms = submodule.assignments.map((assignment) => assignment.form)
    const submissions = forms.reduce(
      (total, form) => total + form._count.submissions,
      0
    )

    return {
      id: submodule.id,
      slug: submodule.slug,
      name: submodule.name,
      description: submodule.description,
      icon: submodule.icon,
      metadata: parseJson(submodule.metadata, {}),
      formsCount: forms.length,
      submissionsCount: submissions,
      baseTablesCount: parseJson<unknown[]>(submodule.baseTables, []).length,
      href: `/dashboard/submodule/${submodule.slug}`,
    }
  })
}

export async function CreateForm(data: formSchemaType) {
  const { userRole, defaultSubmodule } = await ensureBaseCatalog()
  const assignedUserId = data.assignedUserId || DEFAULT_USER_ID
  const roleId = data.roleId ?? userRole.id
  const submoduleId = data.submoduleId ?? defaultSubmodule.id
  const template = data.templateId
    ? await prisma.formTemplate.findUnique({ where: { id: data.templateId } })
    : null
  const pages = template?.page ?? stringifyJson(defaultPages())
  const components = template?.components ?? '[]'
  const context = template?.context ?? '[]'
  const eventConfig = template?.eventConfig ?? '[]'
  const scheduleType = data.scheduleType ?? template?.scheduleType ?? 'monthly'
  const scheduleInterval =
    data.scheduleInterval ?? template?.scheduleInterval ?? 1

  const form = await prisma.$transaction(async (tx) => {
    const createdForm = await tx.form.create({
      data: {
        userId: assignedUserId,
        assignedUserId,
        roleId,
        submoduleId,
        templateId: template?.id,
        templateVersion: template?.currentVersion,
        name: data.name,
        description: data.description ?? '',
        page: pages,
        components,
        context,
        eventConfig,
        scheduleType,
        scheduleInterval,
        scheduleConfig: template?.scheduleConfig ?? '{}',
      },
    })

    await createInitialVersion(tx, createdForm)

    const events = normalizeEvents(
      parseJson<FormEventRuleInput[]>(eventConfig, [])
    )

    if (events.length > 0) {
      await tx.formEvent.createMany({
        data: events.map((event) => ({
          ...event,
          formId: createdForm.id,
          version: createdForm.currentVersion,
        })),
      })
    }

    await tx.formAssignment.create({
      data: {
        formId: createdForm.id,
        userId: assignedUserId,
        roleId,
        submoduleId,
      },
    })

    return createdForm
  })

  revalidatePath('/form-builder')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/submodule')

  return form.id
}

export async function GetForms() {
  await ensureBaseCatalog()

  const forms = await prisma.form.findMany({
    where: {
      submoduleId: {
        not: null,
      },
    },
    include: {
      role: true,
      submodule: true,
      template: true,
      _count: {
        select: {
          submissions: true,
          versions: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return forms
}

export async function DeleteForm(formId: number) {
  const id = Number(formId)

  if (!id) {
    throw new Error('فرم معتبر نیست.')
  }

  const form = await prisma.form.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
    },
  })

  if (!form) {
    throw new Error('فرم پیدا نشد.')
  }

  await prisma.form.delete({
    where: { id: form.id },
  })

  revalidatePath('/form-builder')
  revalidatePath('/form-builder/forms')
  revalidatePath(`/form-builder/forms/${form.id}`)
  revalidatePath('/form-builder/builder')
  revalidatePath(`/form-builder/builder/${form.id}`)
  revalidatePath('/form-builder/submit')
  revalidatePath(`/form-builder/submit/${form.id}`)
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/submodule')

  return { id: form.id, name: form.name }
}

export async function GetFormById(id: number) {
  await ensureBaseCatalog()
  await ensureVersionForForm(Number(id))

  const form = await prisma.form.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      role: true,
      submodule: true,
      template: true,
      eventRules: {
        orderBy: { id: 'asc' },
      },
      versions: {
        orderBy: { version: 'desc' },
        take: 50,
      },
    },
  })

  if (!form) return null

  return serializeForm(form)
}

export async function RestoreFormVersion(formId: number, version: number) {
  const id = Number(formId)
  const targetVersion = Number(version)

  if (!id || !targetVersion) {
    throw new Error('نسخه فرم معتبر نیست.')
  }

  await prisma.$transaction(async (tx) => {
    const snapshot = await tx.formVersion.findUnique({
      where: {
        formId_version: {
          formId: id,
          version: targetVersion,
        },
      },
    })

    if (!snapshot) {
      throw new Error('نسخه انتخاب‌شده پیدا نشد.')
    }

    const { form, version: restoredVersion } = await updateFormAndVersion(
      tx,
      id,
      {
        name: snapshot.name,
        description: snapshot.description,
        page: snapshot.page,
        components: snapshot.components,
        context: snapshot.context,
        eventConfig: snapshot.eventConfig,
        scheduleType: snapshot.scheduleType,
        scheduleInterval: snapshot.scheduleInterval,
        scheduleConfig: snapshot.scheduleConfig,
        published: snapshot.published,
        updatedAt: new Date(),
      }
    )

    const events = normalizeEvents(
      parseJson<FormEventRuleInput[]>(snapshot.eventConfig, [])
    )

    await tx.formEvent.deleteMany({ where: { formId: form.id } })

    if (events.length > 0) {
      await tx.formEvent.createMany({
        data: events.map((event) => ({
          ...event,
          formId: form.id,
          version: restoredVersion.version,
        })),
      })
    }

    return form
  })

  revalidatePath('/form-builder')
  revalidatePath(`/form-builder/builder/${id}`)
  revalidatePath(`/form-builder/forms/${id}`)
  revalidatePath('/dashboard/submodule')

  return GetFormById(id)
}

export async function SaveFormInitialDataSource(
  formId: number,
  input: FormInitialDataSourceInput
) {
  const id = Number(formId)

  if (!id) {
    throw new Error('فرم معتبر نیست.')
  }

  const existingForm = await prisma.form.findUnique({
    where: { id },
    select: { context: true },
  })

  if (!existingForm) {
    throw new Error('فرم پیدا نشد.')
  }

  const currentContext = parseFormRuntimeContext(existingForm.context)
  const nextContext: FormRuntimeContext = {
    ...currentContext,
    initialDataSource: normalizeInitialDataSource(input),
  }

  await prisma.$transaction(async (tx) => {
    await updateFormAndVersion(tx, id, {
      context: stringifyJson(nextContext),
      updatedAt: new Date(),
    })
  })

  revalidatePath('/form-builder')
  revalidatePath(`/form-builder/builder/${id}`)
  revalidatePath(`/form-builder/submit/${id}`)

  return GetFormById(id)
}

export async function ResolveFormInitialData(
  formId: number,
  params: Record<string, string | string[] | undefined> = {}
) {
  const form = await prisma.form.findUnique({
    where: { id: Number(formId) },
    select: { context: true },
  })

  if (!form) return {}

  const context = parseFormRuntimeContext(form.context)
  const config = normalizeInitialDataSource(context.initialDataSource)

  if (!config?.enabled || !config.url) return {}

  try {
    const url = replaceTemplateParams(config.url, params)
    const parsedUrl = resolveRuntimeUrl(url)

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {}
    }

    const response = await fetch(parsedUrl, {
      method: config.method,
      headers: config.headers,
      body:
        config.method === 'POST' && config.body
          ? replaceTemplateParams(config.body, params)
          : undefined,
      cache: 'no-store',
    })

    if (!response.ok) return {}

    const payload = await response.json()
    const source = getValueByPath(payload, config.dataPath || '')
    const mapping = config.mapping ?? {}

    if (Object.keys(mapping).length === 0) {
      return source && typeof source === 'object' && !Array.isArray(source)
        ? source
        : {}
    }

    return Object.fromEntries(
      Object.entries(mapping)
        .map(([fieldName, sourcePath]) => [
          fieldName,
          getValueByPath(source, sourcePath),
        ])
        .filter(([, value]) => value !== undefined)
    )
  } catch {
    return {}
  }
}

export async function TestFormInitialDataSource(
  input: FormInitialDataSourceInput,
  params: Record<string, string | string[] | undefined> = {}
) {
  const config = normalizeInitialDataSource(input)

  if (!config?.url) {
    return {
      ok: false,
      error: 'آدرس منبع داده وارد نشده است.',
      data: {},
      raw: null,
    }
  }

  try {
    const url = replaceTemplateParams(config.url, params)
    const parsedUrl = resolveRuntimeUrl(url)

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        ok: false,
        error: 'فقط آدرس‌های http و https پشتیبانی می‌شوند.',
        data: {},
        raw: null,
      }
    }

    const response = await fetch(parsedUrl, {
      method: config.method,
      headers: config.headers,
      body:
        config.method === 'POST' && config.body
          ? replaceTemplateParams(config.body, params)
          : undefined,
      cache: 'no-store',
    })

    const text = await response.text()
    const contentType = response.headers.get('content-type') || ''
    let payload: unknown = null

    try {
      payload = text ? JSON.parse(text) : null
    } catch {
      return {
        ok: false,
        error: contentType.includes('text/html')
          ? 'این آدرس صفحه HTML برگرداند. آدرس باید endpoint JSON باشد، نه صفحه فرم یا صفحه داشبورد.'
          : 'پاسخ منبع داده JSON معتبر نیست.',
        status: response.status,
        data: {},
        raw: text.slice(0, 1000),
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        error: `درخواست با وضعیت ${response.status} برگشت.`,
        status: response.status,
        data: {},
        raw: payload,
      }
    }

    const source = getValueByPath(payload, config.dataPath || '')
    const mapping = config.mapping ?? {}
    const data =
      Object.keys(mapping).length === 0
        ? source && typeof source === 'object' && !Array.isArray(source)
          ? source
          : {}
        : Object.fromEntries(
            Object.entries(mapping)
              .map(([fieldName, sourcePath]) => [
                fieldName,
                getValueByPath(source, sourcePath),
              ])
              .filter(([, value]) => value !== undefined)
          )

    return {
      ok: true,
      error: '',
      status: response.status,
      data,
      raw: payload,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'تست منبع داده ناموفق بود.',
      data: {},
      raw: null,
    }
  }
}

export async function UpdateFormContent(
  id: number,
  components: FormElementInstance[],
  pages: Array<PageType>
) {
  const updated = await prisma.$transaction(async (tx) => {
    const { form } = await updateFormAndVersion(tx, Number(id), {
      components: stringifyJson(components),
      page: stringifyJson(pages),
      updatedAt: new Date(),
    })

    return form
  })

  revalidatePath('/form-builder')
  revalidatePath(`/form-builder/builder/${id}`)
  revalidatePath('/dashboard/submodule')

  return updated
}

export async function UpdateFormSettings(
  formId: number,
  input: FormSettingsInput
) {
  const updated = await prisma.$transaction(async (tx) => {
    const { form } = await updateFormAndVersion(tx, Number(formId), {
      scheduleType: input.scheduleType,
      scheduleInterval: Number(input.scheduleInterval || 1),
      assignedUserId: input.assignedUserId || DEFAULT_USER_ID,
      userId: input.assignedUserId || DEFAULT_USER_ID,
      roleId: input.roleId ?? null,
      submoduleId: input.submoduleId ?? null,
      updatedAt: new Date(),
    })

    await tx.formAssignment.deleteMany({ where: { formId: form.id } })

    if (form.submoduleId) {
      await tx.formAssignment.create({
        data: {
          formId: form.id,
          userId: form.assignedUserId || form.userId,
          roleId: form.roleId,
          submoduleId: form.submoduleId,
        },
      })
    }

    return form
  })

  revalidatePath('/form-builder')
  revalidatePath(`/form-builder/builder/${formId}`)
  revalidatePath('/dashboard/submodule')

  return updated
}

export async function PublishForm(formId: number) {
  const updated = await prisma.$transaction(async (tx) => {
    const { form } = await updateFormAndVersion(tx, Number(formId), {
      published: true,
      updatedAt: new Date(),
    })

    if (form.submoduleId) {
      const existingAssignment = await tx.formAssignment.findFirst({
        where: { formId: form.id, submoduleId: form.submoduleId },
      })

      if (!existingAssignment) {
        await tx.formAssignment.create({
          data: {
            formId: form.id,
            userId: form.assignedUserId || form.userId,
            roleId: form.roleId,
            submoduleId: form.submoduleId,
          },
        })
      }
    }

    return form
  })

  revalidatePath('/form-builder')
  revalidatePath(`/form-builder/builder/${formId}`)
  revalidatePath('/dashboard/submodule')

  return updated
}

export async function RenameForm(formId: number, name: string) {
  await prisma.$transaction(async (tx) => {
    await updateFormAndVersion(tx, Number(formId), {
      name,
      updatedAt: new Date(),
    })
  })

  revalidatePath('/form-builder')
  revalidatePath(`/form-builder/builder/${formId}`)

  return GetFormById(Number(formId))
}

export async function SaveFormEvents(
  formId: number,
  events: FormEventRuleInput[]
) {
  const sanitizedEvents = normalizeEvents(events)

  const result = await prisma.$transaction(async (tx) => {
    const { form, version } = await updateFormAndVersion(tx, Number(formId), {
      eventConfig: stringifyJson(sanitizedEvents),
      updatedAt: new Date(),
    })

    await tx.formEvent.deleteMany({ where: { formId: form.id } })

    if (sanitizedEvents.length > 0) {
      await tx.formEvent.createMany({
        data: sanitizedEvents.map((event) => ({
          ...event,
          formId: form.id,
          version: version.version,
        })),
      })
    }

    return { form, events: sanitizedEvents }
  })

  revalidatePath(`/form-builder/builder/${formId}`)

  return result
}

export async function GetFormContentByUrl(formUrl: string) {
  const form = await prisma.form.update({
    data: {
      visit: {
        increment: 1,
      },
    },
    where: {
      sharedURL: formUrl,
    },
    include: {
      eventRules: true,
    },
  })

  return serializeForm(form)
}

export async function RegisterFormVisit(formId: string | number) {
  return prisma.form.update({
    where: { id: Number(formId) },
    data: {
      visit: {
        increment: 1,
      },
    },
  })
}

export async function SubmitForm(
  formId: string | number,
  content: string | Record<string, unknown>
) {
  const id = Number(formId)
  const parsedContent =
    typeof content === 'string'
      ? parseJson<Record<string, unknown>>(content, {})
      : content

  const form = await prisma.form.findUnique({
    where: { id },
  })

  if (!form) {
    throw new Error('Form not found')
  }

  const formVersion = await ensureVersionForForm(id)
  const formComponents = parseJson<FormElementInstance[]>(form.components, [])

  const submission = await prisma.$transaction(async (tx) => {
    const createdSubmission = await tx.formSubmission.create({
      data: {
        formId: id,
        formVersionId: formVersion?.id,
        version: formVersion?.version ?? form.currentVersion,
        userId: form.assignedUserId || form.userId,
        roleId: form.roleId,
        submoduleId: form.submoduleId,
        content: stringifyJson(parsedContent),
        computedContent: '{}',
        published: form.published,
      },
    })

    const submissionValues = buildSubmissionValues({
      content: parsedContent,
      components: formComponents,
      submissionId: createdSubmission.id,
      formId: id,
      formVersionId: formVersion?.id,
    })

    if (submissionValues.length > 0) {
      await tx.formSubmissionValue.createMany({
        data: submissionValues,
      })
    }

    await tx.form.update({
      where: { id },
      data: {
        submission: {
          increment: 1,
        },
      },
    })

    return createdSubmission
  })

  revalidatePath(`/form-builder/forms/${id}`)
  revalidatePath('/dashboard/submodule')

  return serializeSubmission(submission)
}

export async function GetFormWithSubmissions(id: number) {
  await ensureBaseCatalog()
  await ensureVersionForForm(Number(id))

  const form = await prisma.form.findUnique({
    where: { id: Number(id) },
    include: {
      role: true,
      submodule: true,
      template: true,
      versions: {
        orderBy: { version: 'desc' },
      },
      submissions: {
        orderBy: { submittedAt: 'desc' },
        include: {
          formVersion: true,
          role: true,
          submodule: true,
          values: {
            orderBy: { id: 'asc' },
          },
        },
      },
    },
  })

  if (!form) return null

  return {
    ...serializeForm(form),
    versions: form.versions,
    submissions: form.submissions.map(serializeSubmission),
    submissionRows: form.submissions.map(
      (submission) => serializeSubmission(submission).row
    ),
  }
}

export async function GetUserSubmodules(userId = DEFAULT_USER_ID) {
  const { userRole } = await ensureBaseCatalog()

  const assignments = await prisma.formAssignment.findMany({
    where: {
      active: true,
      form: {
        published: true,
      },
      OR: [{ userId }, { userId: null }, { roleId: userRole.id }],
    },
    include: {
      role: true,
      submodule: true,
      form: {
        include: {
          _count: {
            select: {
              submissions: true,
              versions: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const grouped = new Map<number, any>()

  assignments.forEach((assignment) => {
    const submodule = assignment.submodule
    const existing = grouped.get(submodule.id)

    const form = {
      ...assignment.form,
      role: assignment.role,
    }

    if (!existing) {
      grouped.set(submodule.id, {
        ...submodule,
        baseTables: parseJson(submodule.baseTables, []),
        forms: [form],
      })
      return
    }

    existing.forms.push(form)
  })

  return Array.from(grouped.values())
}

export async function GetSubmoduleDashboard(slug: string) {
  await ensureBaseCatalog()

  const submodule = await prisma.submodule.findUnique({
    where: { slug },
    include: {
      assignments: {
        where: {
          active: true,
          form: {
            published: true,
          },
        },
        include: {
          role: true,
          form: {
            include: {
              _count: {
                select: {
                  submissions: true,
                  versions: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!submodule) return null

  const [submissionCount, latestSubmissions] = await Promise.all([
    prisma.formSubmission.count({
      where: { submoduleId: submodule.id },
    }),
    prisma.formSubmission.findMany({
      where: { submoduleId: submodule.id },
      orderBy: { submittedAt: 'desc' },
      take: 8,
      include: {
        form: true,
        formVersion: true,
        values: {
          orderBy: { id: 'asc' },
        },
      },
    }),
  ])

  return {
    ...submodule,
    baseTables: parseJson(submodule.baseTables, []),
    forms: submodule.assignments.map((assignment) => ({
      ...assignment.form,
      role: assignment.role,
    })),
    submissionCount,
    latestSubmissions: latestSubmissions.map(serializeSubmission),
  }
}

export async function GetSubmoduleFormSubmissions(
  slug: string,
  formId: number
) {
  await ensureBaseCatalog()

  const submodule = await prisma.submodule.findUnique({
    where: { slug },
  })

  if (!submodule) return null

  const form = await prisma.form.findFirst({
    where: {
      id: Number(formId),
      submoduleId: submodule.id,
    },
    include: {
      role: true,
      submodule: true,
      versions: {
        orderBy: { version: 'desc' },
      },
      submissions: {
        where: {
          submoduleId: submodule.id,
        },
        orderBy: { submittedAt: 'desc' },
        include: {
          formVersion: true,
          role: true,
          submodule: true,
          values: {
            orderBy: { id: 'asc' },
          },
        },
      },
    },
  })

  if (!form) return null

  return {
    ...serializeForm(form),
    versions: form.versions,
    submissions: form.submissions.map(serializeSubmission),
    submissionRows: form.submissions.map(
      (submission) => serializeSubmission(submission).row
    ),
  }
}
