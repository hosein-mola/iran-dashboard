'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  BarChart3,
  ClipboardList,
  Database,
  Droplets,
  Pencil,
  FileText,
  Layers3,
  Save,
  Trash2,
  Waves,
  X,
  type LucideIcon,
} from 'lucide-react'
import { ImSpinner } from 'react-icons/im'

import {
  CreateSubmodule,
  CreateTemplateFromForm,
  DeleteSubmodule,
  DeleteTemplate,
  UpdateSubmodule,
  UpdateTemplate,
  UpdateTemplateFromForm,
} from '@/actions/form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

type Catalog = {
  submodules: Array<{
    id: number
    slug: string
    name: string
    description: string
    icon: string
    metadata: Record<string, any>
    baseTables: unknown[]
    active: boolean
    _count: {
      forms: number
      assignments: number
      submissions: number
    }
  }>
  templates: Array<{
    id: number
    slug: string
    name: string
    description: string
    icon: string
    metadata: Record<string, any>
    currentVersion: number
    scheduleType: string
    scheduleInterval: number
    active: boolean
    _count: {
      forms: number
      versions: number
    }
  }>
  forms: Array<{
    id: number
    name: string
    description: string
    currentVersion: number
    templateId: number | null
    templateVersion: number | null
    submoduleName: string
    templateName: string
  }>
}

const iconOptions: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: 'layers', label: 'لایه‌ها', icon: Layers3 },
  { value: 'dam', label: 'سد', icon: Droplets },
  { value: 'waves', label: 'امواج', icon: Waves },
  { value: 'database', label: 'داده', icon: Database },
  { value: 'file-text', label: 'فرم', icon: FileText },
  { value: 'activity', label: 'فعالیت', icon: Activity },
  { value: 'chart', label: 'نمودار', icon: BarChart3 },
  { value: 'clipboard', label: 'لیست', icon: ClipboardList },
]

const iconMap = iconOptions.reduce<Record<string, LucideIcon>>(
  (items, item) => ({ ...items, [item.value]: item.icon }),
  {}
)

const defaultSubmodule = {
  slug: '',
  name: '',
  description: '',
  icon: 'layers',
  metadata: '{}',
}

const defaultTemplate = {
  formId: '',
  slug: '',
  name: '',
  description: '',
  icon: 'file-text',
  metadata: '{}',
}

function validateJsonObject(value: string) {
  try {
    const parsed = JSON.parse(value || '{}')
    return Boolean(parsed && typeof parsed === 'object' && !Array.isArray(parsed))
  } catch {
    return false
  }
}

function metadataToText(metadata: Record<string, any>) {
  return JSON.stringify(metadata ?? {}, null, 2)
}

function IconPreview({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? Layers3
  return <Icon className={className ?? 'size-4'} />
}

function IconSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {iconOptions.map((item) => {
          const Icon = item.icon

          return (
            <SelectItem key={item.value} value={item.value}>
              <span className="flex items-center gap-2">
                <Icon className="size-4" />
                {item.label}
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

export default function FormModuleCatalogManager({
  catalog,
}: {
  catalog: Catalog
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [submodule, setSubmodule] = useState(defaultSubmodule)
  const [template, setTemplate] = useState({
    ...defaultTemplate,
    formId: catalog.forms[0]?.id ? String(catalog.forms[0].id) : '',
  })
  const [updateSources, setUpdateSources] = useState<Record<number, string>>({})
  const [editingSubmodules, setEditingSubmodules] = useState<
    Record<number, typeof defaultSubmodule>
  >({})
  const [editingTemplates, setEditingTemplates] = useState<
    Record<number, Omit<typeof defaultTemplate, 'formId'>>
  >({})

  const inheritedDefaults = useMemo(() => {
    return Object.fromEntries(
      catalog.templates.map((item) => {
        const inheritedForm = catalog.forms.find(
          (form) => form.templateId === item.id
        )
        return [item.id, String(inheritedForm?.id ?? catalog.forms[0]?.id ?? '')]
      })
    )
  }, [catalog.forms, catalog.templates])

  const showJsonError = () => {
    toast({
      title: 'متادیتا معتبر نیست',
      description: 'متادیتا باید آبجکت JSON باشد.',
      variant: 'destructive',
    })
  }

  const createSubmodule = () => {
    if (!validateJsonObject(submodule.metadata)) {
      showJsonError()
      return
    }

    setPendingAction('submodule')
    startTransition(async () => {
      try {
        await CreateSubmodule(submodule)
        setSubmodule(defaultSubmodule)
        router.refresh()
        toast({
          title: 'زیرماژول ذخیره شد',
          description: 'کاتالوگ فرم به‌روزرسانی شد.',
        })
      } catch (error) {
        toast({
          title: 'خطا',
          description:
            error instanceof Error ? error.message : 'زیرماژول ذخیره نشد.',
          variant: 'destructive',
        })
      } finally {
        setPendingAction(null)
      }
    })
  }

  const createTemplate = () => {
    if (!template.formId) return

    if (!validateJsonObject(template.metadata)) {
      showJsonError()
      return
    }

    setPendingAction('template')
    startTransition(async () => {
      try {
        await CreateTemplateFromForm({
          ...template,
          formId: Number(template.formId),
        })
        setTemplate({
          ...defaultTemplate,
          formId: catalog.forms[0]?.id ? String(catalog.forms[0].id) : '',
        })
        router.refresh()
        toast({
          title: 'قالب ساخته شد',
          description: 'قالب در ساخت فرم جدید قابل انتخاب است.',
        })
      } catch (error) {
        toast({
          title: 'خطا',
          description:
            error instanceof Error ? error.message : 'قالب ساخته نشد.',
          variant: 'destructive',
        })
      } finally {
        setPendingAction(null)
      }
    })
  }

  const updateTemplate = (templateId: number) => {
    const sourceFormId = updateSources[templateId] ?? inheritedDefaults[templateId]
    if (!sourceFormId) return

    setPendingAction(`update-${templateId}`)
    startTransition(async () => {
      try {
        const result = await UpdateTemplateFromForm(
          templateId,
          Number(sourceFormId)
        )
        router.refresh()
        toast({
          title: 'قالب به‌روزرسانی شد',
          description: `${result.propagatedForms.toLocaleString(
            'fa-IR'
          )} فرم ارث‌بری شده به‌روزرسانی شد.`,
        })
      } catch (error) {
        toast({
          title: 'خطا',
          description:
            error instanceof Error ? error.message : 'قالب به‌روزرسانی نشد.',
          variant: 'destructive',
        })
      } finally {
        setPendingAction(null)
      }
    })
  }

  const startSubmoduleEdit = (item: Catalog['submodules'][number]) => {
    setEditingSubmodules((current) => ({
      ...current,
      [item.id]: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        icon: item.icon,
        metadata: metadataToText(item.metadata),
      },
    }))
  }

  const cancelSubmoduleEdit = (id: number) => {
    setEditingSubmodules((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const saveSubmodule = (id: number) => {
    const edit = editingSubmodules[id]
    if (!edit) return

    if (!validateJsonObject(edit.metadata)) {
      showJsonError()
      return
    }

    setPendingAction(`save-submodule-${id}`)
    startTransition(async () => {
      try {
        await UpdateSubmodule(id, edit)
        cancelSubmoduleEdit(id)
        router.refresh()
        toast({
          title: 'زیرماژول ویرایش شد',
          description: 'مشخصات زیرماژول ذخیره شد.',
        })
      } catch (error) {
        toast({
          title: 'خطا',
          description:
            error instanceof Error ? error.message : 'زیرماژول ویرایش نشد.',
          variant: 'destructive',
        })
      } finally {
        setPendingAction(null)
      }
    })
  }

  const removeSubmodule = (id: number) => {
    setPendingAction(`delete-submodule-${id}`)
    startTransition(async () => {
      try {
        await DeleteSubmodule(id)
        router.refresh()
        toast({
          title: 'زیرماژول حذف شد',
          description: 'زیرماژول بدون وابستگی از کاتالوگ حذف شد.',
        })
      } catch (error) {
        toast({
          title: 'حذف انجام نشد',
          description:
            error instanceof Error ? error.message : 'زیرماژول حذف نشد.',
          variant: 'destructive',
        })
      } finally {
        setPendingAction(null)
      }
    })
  }

  const startTemplateEdit = (item: Catalog['templates'][number]) => {
    setEditingTemplates((current) => ({
      ...current,
      [item.id]: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        icon: item.icon,
        metadata: metadataToText(item.metadata),
      },
    }))
  }

  const cancelTemplateEdit = (id: number) => {
    setEditingTemplates((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const saveTemplate = (id: number) => {
    const edit = editingTemplates[id]
    if (!edit) return

    if (!validateJsonObject(edit.metadata)) {
      showJsonError()
      return
    }

    setPendingAction(`save-template-${id}`)
    startTransition(async () => {
      try {
        await UpdateTemplate(id, edit)
        cancelTemplateEdit(id)
        router.refresh()
        toast({
          title: 'قالب ویرایش شد',
          description: 'مشخصات قالب ذخیره شد.',
        })
      } catch (error) {
        toast({
          title: 'خطا',
          description:
            error instanceof Error ? error.message : 'قالب ویرایش نشد.',
          variant: 'destructive',
        })
      } finally {
        setPendingAction(null)
      }
    })
  }

  const removeTemplate = (id: number) => {
    setPendingAction(`delete-template-${id}`)
    startTransition(async () => {
      try {
        await DeleteTemplate(id)
        router.refresh()
        toast({
          title: 'قالب حذف شد',
          description: 'قالب بدون فرم وابسته حذف شد.',
        })
      } catch (error) {
        toast({
          title: 'حذف انجام نشد',
          description:
            error instanceof Error ? error.message : 'قالب حذف نشد.',
          variant: 'destructive',
        })
      } finally {
        setPendingAction(null)
      }
    })
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>زیرماژول جدید</CardTitle>
            <CardDescription>آیکن و متادیتا در کاتالوگ فرم ذخیره می‌شود.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>شناسه</Label>
              <Input
                dir="ltr"
                value={submodule.slug}
                onChange={(event) =>
                  setSubmodule((current) => ({
                    ...current,
                    slug: event.target.value,
                  }))
                }
                placeholder="water-quality"
              />
            </div>
            <div className="grid gap-2">
              <Label>نام</Label>
              <Input
                value={submodule.name}
                onChange={(event) =>
                  setSubmodule((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>توضیح</Label>
              <Textarea
                rows={3}
                value={submodule.description}
                onChange={(event) =>
                  setSubmodule((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>آیکن</Label>
              <IconSelect
                value={submodule.icon}
                onChange={(value) =>
                  setSubmodule((current) => ({ ...current, icon: value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>متادیتا</Label>
              <Textarea
                dir="ltr"
                rows={4}
                value={submodule.metadata}
                onChange={(event) =>
                  setSubmodule((current) => ({
                    ...current,
                    metadata: event.target.value,
                  }))
                }
              />
            </div>
            <Button
              onClick={createSubmodule}
              disabled={pending && pendingAction === 'submodule'}
            >
              ذخیره زیرماژول
              {pending && pendingAction === 'submodule' && (
                <ImSpinner className="mr-2 size-4 animate-spin" />
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>زیرماژول‌ها</CardTitle>
            <CardDescription>لیست فعلی کاتالوگ فرم</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {catalog.submodules.map((item) => {
              const edit = editingSubmodules[item.id]
              const isSaving = pendingAction === `save-submodule-${item.id}`
              const isDeleting = pendingAction === `delete-submodule-${item.id}`

              return (
                <div key={item.id} className="rounded-lg border p-3">
                  {edit ? (
                    <div className="grid gap-3">
                      <div className="grid gap-2">
                        <Label>شناسه</Label>
                        <Input
                          dir="ltr"
                          value={edit.slug}
                          onChange={(event) =>
                            setEditingSubmodules((current) => ({
                              ...current,
                              [item.id]: {
                                ...edit,
                                slug: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>نام</Label>
                        <Input
                          value={edit.name}
                          onChange={(event) =>
                            setEditingSubmodules((current) => ({
                              ...current,
                              [item.id]: {
                                ...edit,
                                name: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>توضیح</Label>
                        <Textarea
                          rows={3}
                          value={edit.description}
                          onChange={(event) =>
                            setEditingSubmodules((current) => ({
                              ...current,
                              [item.id]: {
                                ...edit,
                                description: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>آیکن</Label>
                        <IconSelect
                          value={edit.icon}
                          onChange={(value) =>
                            setEditingSubmodules((current) => ({
                              ...current,
                              [item.id]: {
                                ...edit,
                                icon: value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>متادیتا</Label>
                        <Textarea
                          dir="ltr"
                          rows={4}
                          value={edit.metadata}
                          onChange={(event) =>
                            setEditingSubmodules((current) => ({
                              ...current,
                              [item.id]: {
                                ...edit,
                                metadata: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveSubmodule(item.id)}
                          disabled={pending && isSaving}
                        >
                          <Save className="size-4" />
                          ذخیره
                          {pending && isSaving && (
                            <ImSpinner className="mr-1 size-4 animate-spin" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelSubmoduleEdit(item.id)}
                        >
                          <X className="size-4" />
                          انصراف
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="flex items-center gap-2 font-semibold">
                            <IconPreview name={item.icon} className="size-4" />
                            {item.name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {item.slug}
                          </p>
                        </div>
                        <Badge variant={item.active ? 'default' : 'outline'}>
                          {item.active ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-3 line-clamp-2 text-sm">
                        {item.description || 'بدون توضیح'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {item._count.forms.toLocaleString('fa-IR')} فرم
                        </Badge>
                        <Badge variant="outline">
                          {item._count.submissions.toLocaleString('fa-IR')} داده
                        </Badge>
                        <Badge variant="outline">
                          {item.baseTables.length.toLocaleString('fa-IR')} جدول پایه
                        </Badge>
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <Badge key={key} variant="outline">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startSubmoduleEdit(item)}
                        >
                          <Pencil className="size-4" />
                          ویرایش
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              disabled={pending && isDeleting}
                            >
                              <Trash2 className="size-4" />
                              حذف
                              {pending && isDeleting && (
                                <ImSpinner className="mr-1 size-4 animate-spin" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف زیرماژول</AlertDialogTitle>
                              <AlertDialogDescription>
                                اگر این زیرماژول به فرم، تخصیص یا داده ثبت‌شده متصل باشد حذف نمی‌شود.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeSubmodule(item.id)}
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>قالب جدید</CardTitle>
            <CardDescription>ساخت قالب از ساختار یک فرم موجود</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>فرم مبدا</Label>
              <Select
                value={template.formId}
                onValueChange={(value) =>
                  setTemplate((current) => ({ ...current, formId: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="انتخاب فرم" />
                </SelectTrigger>
                <SelectContent>
                  {catalog.forms.map((form) => (
                    <SelectItem key={form.id} value={String(form.id)}>
                      {form.name} - نسخه {form.currentVersion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>شناسه قالب</Label>
              <Input
                dir="ltr"
                value={template.slug}
                onChange={(event) =>
                  setTemplate((current) => ({
                    ...current,
                    slug: event.target.value,
                  }))
                }
                placeholder="dam-resource-template"
              />
            </div>
            <div className="grid gap-2">
              <Label>نام قالب</Label>
              <Input
                value={template.name}
                onChange={(event) =>
                  setTemplate((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>توضیح</Label>
              <Textarea
                rows={3}
                value={template.description}
                onChange={(event) =>
                  setTemplate((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>آیکن</Label>
              <IconSelect
                value={template.icon}
                onChange={(value) =>
                  setTemplate((current) => ({ ...current, icon: value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>متادیتا</Label>
              <Textarea
                dir="ltr"
                rows={4}
                value={template.metadata}
                onChange={(event) =>
                  setTemplate((current) => ({
                    ...current,
                    metadata: event.target.value,
                  }))
                }
              />
            </div>
            <Button
              onClick={createTemplate}
              disabled={
                !template.formId || (pending && pendingAction === 'template')
              }
            >
              ساخت قالب
              {pending && pendingAction === 'template' && (
                <ImSpinner className="mr-2 size-4 animate-spin" />
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>قالب‌ها</CardTitle>
            <CardDescription>به‌روزرسانی قالب، فرم‌های ارث‌بری شده را تغییر می‌دهد.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {catalog.templates.map((item) => {
              const edit = editingTemplates[item.id]
              const isSaving = pendingAction === `save-template-${item.id}`
              const isDeleting = pendingAction === `delete-template-${item.id}`
              const isPublishing = pendingAction === `update-${item.id}`

              return (
                <div key={item.id} className="rounded-lg border p-3">
                  {edit ? (
                    <div className="grid gap-3">
                      <div className="grid gap-2">
                        <Label>شناسه قالب</Label>
                        <Input
                          dir="ltr"
                          value={edit.slug}
                          onChange={(event) =>
                            setEditingTemplates((current) => ({
                              ...current,
                              [item.id]: {
                                ...edit,
                                slug: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>نام قالب</Label>
                        <Input
                          value={edit.name}
                          onChange={(event) =>
                            setEditingTemplates((current) => ({
                              ...current,
                              [item.id]: {
                                ...edit,
                                name: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>توضیح</Label>
                        <Textarea
                          rows={3}
                          value={edit.description}
                          onChange={(event) =>
                            setEditingTemplates((current) => ({
                              ...current,
                              [item.id]: {
                                ...edit,
                                description: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>آیکن</Label>
                        <IconSelect
                          value={edit.icon}
                          onChange={(value) =>
                            setEditingTemplates((current) => ({
                              ...current,
                              [item.id]: {
                                ...edit,
                                icon: value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>متادیتا</Label>
                        <Textarea
                          dir="ltr"
                          rows={4}
                          value={edit.metadata}
                          onChange={(event) =>
                            setEditingTemplates((current) => ({
                              ...current,
                              [item.id]: {
                                ...edit,
                                metadata: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveTemplate(item.id)}
                          disabled={pending && isSaving}
                        >
                          <Save className="size-4" />
                          ذخیره
                          {pending && isSaving && (
                            <ImSpinner className="mr-1 size-4 animate-spin" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelTemplateEdit(item.id)}
                        >
                          <X className="size-4" />
                          انصراف
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="flex items-center gap-2 font-semibold">
                            <IconPreview name={item.icon} className="size-4" />
                            {item.name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {item.slug}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge>
                            نسخه {item.currentVersion.toLocaleString('fa-IR')}
                          </Badge>
                          <Badge variant="outline">
                            {item._count.forms.toLocaleString('fa-IR')} فرم
                          </Badge>
                          <Badge variant="outline">
                            {item._count.versions.toLocaleString('fa-IR')} نسخه
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-3 text-sm">
                        {item.description || 'بدون توضیح'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <Badge key={key} variant="outline">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startTemplateEdit(item)}
                        >
                          <Pencil className="size-4" />
                          ویرایش
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              disabled={pending && isDeleting}
                            >
                              <Trash2 className="size-4" />
                              حذف
                              {pending && isDeleting && (
                                <ImSpinner className="mr-1 size-4 animate-spin" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف قالب</AlertDialogTitle>
                              <AlertDialogDescription>
                                اگر فرمی از این قالب ارث‌بری کرده باشد حذف نمی‌شود.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeTemplate(item.id)}
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
                        <Select
                          value={
                            updateSources[item.id] ?? inheritedDefaults[item.id]
                          }
                          onValueChange={(value) =>
                            setUpdateSources((current) => ({
                              ...current,
                              [item.id]: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="فرم مبدا" />
                          </SelectTrigger>
                          <SelectContent>
                            {catalog.forms.map((form) => (
                              <SelectItem key={form.id} value={String(form.id)}>
                                {form.name} - نسخه {form.currentVersion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          onClick={() => updateTemplate(item.id)}
                          disabled={pending && isPublishing}
                        >
                          انتشار نسخه قالب
                          {pending && isPublishing && (
                            <ImSpinner className="mr-2 size-4 animate-spin" />
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
