'use client'
import { useCallback, useEffect, useState } from 'react'
import PreviewDialogButton from './PreviewDialogButton'
import PublishFormButton from './PublishFormButton'
import SaveFormButton from './SaveFormButton'
import RestoreFormVersionButton from './RestoreFormVersionButton'
import FormEventsEditor from './FormEventsEditor'
import FormInitialDataSourcePanel from './FormInitialDataSourcePanel'
import FormVersionsPanel from './FormVersionsPanel'
import FormSettingsButton from './FormSettingsButton'
import Designer from './Designer'
import {
  DndContext,
  MouseSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import DragOverlayWrapper from './DragOverlayWrapper'
import useDesigner from './hooks/useDesigner'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { toast } from './ui/use-toast'
import {
  VscDatabase,
  VscExtensions,
  VscHistory,
  VscInsert,
  VscJson,
  VscListTree,
  VscSettings,
} from 'react-icons/vsc'
import { Progress } from './ui/progress'
import Logo from './logo'
import { GetFormById, RenameForm } from '@/actions/form'
import { useParams } from 'next/navigation'
import { useTheme } from './providers/ThemeProvider'
import { twMerge } from 'tailwind-merge'
import { FormElementInstance } from '../types/element-type'
import { ulid } from 'ulid'
import { PageType } from './context/DesignerContext'
import { BiRename } from 'react-icons/bi'
import { useForm } from 'react-hook-form'
import { ImSpinner } from 'react-icons/im'

interface FormBuilderProps {
  form: any
  setupOptions: {
    roles: Array<{ id: number; key: string; name: string }>
    users: Array<{ id: string; name: string; email: string | null }>
    submodules: Array<{ id: number; slug: string; name: string }>
  }
}

function FormBuilder(props: FormBuilderProps) {
  const {
    isReady,
    setIsReady,
    leftView,
    setLeftView,
    setElements,
    setPages,
    setSelectedPage,
    setSelectedElement,
  } = useDesigner()
  const params = useParams()
  const [form, setForm] = useState<any | null>(props.form)
  const { theme } = useTheme()
  const [renameIsLoading, setRenameIsLoading] = useState(false)
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  })

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  })

  const sensors = useSensors(pointerSensor, mouseSensor)
  type RenameFormType = { name: string }
  const renameForm = useForm<RenameFormType>()
  const { reset } = renameForm

  const applyFormState = useCallback(
    (_form: any | null) => {
      setForm(_form)
      reset({ name: _form?.name || '' })
      setElements(
        [...(_form?.components || [])].sort(
          (a: FormElementInstance, b: FormElementInstance) => a.index - b.index
        )
      )

      const pages: Array<PageType> = _form?.page || []
      if (pages == null || pages.length == 0) {
        const initPage = { id: ulid(10), index: 1, name: 'page-1' }
        setPages([initPage])
        setSelectedPage(initPage)
      } else {
        setPages(pages)
        setSelectedPage(pages[0])
      }
      setSelectedElement(null)
    },
    [
      reset,
      setElements,
      setPages,
      setSelectedElement,
      setSelectedPage,
    ]
  )

  useEffect(() => {
    setSelectedElement(null)
    setForm(null)
    setSelectedPage({ id: '', index: 0, name: '' })
    setElements([])
    setPages([])
    setIsReady(false)
    const req = async () => {
      const _form = await GetFormById(Number(params.id))
      applyFormState(_form)
    }
    req().finally(() => {
      setIsReady(true)
    })
  }, [
    params.id,
    applyFormState,
    setElements,
    setIsReady,
    setPages,
    setSelectedElement,
    setSelectedPage,
  ])

  if (!isReady) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="flex w-2/12 flex-col items-center justify-center gap-5">
          <Logo noText className="h-32 w-32" />
          <Progress value={50} className="h-3" />
        </div>
      </div>
    )
  }

  const renameSubmit = async (data: RenameFormType) => {
    setRenameIsLoading(true)
    if (!form) {
      toast({
        title: 'خطا',
        description: 'فرم یافت نشد',
      })
      return
    }
    const renponse = await RenameForm(form.id, data.name)
    setRenameIsLoading(false)
    setForm(renponse)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin}>
      <main className="flex w-full flex-1 flex-col overflow-hidden">
        <nav
          dir="rtl"
          className="border-border flex items-center justify-between gap-3 border-b p-4"
        >
          <div className="flex items-center gap-2">
            {form && !form.published && <PublishFormButton id={form.id} />}
            {form && <SaveFormButton id={form.id} />}
            {form && (
              <RestoreFormVersionButton
                formId={form.id}
                currentVersion={form.currentVersion}
                versions={form.versions || []}
                onRestored={applyFormState}
              />
            )}
            {form && (
              <FormSettingsButton
                form={form}
                options={props.setupOptions}
                onSaved={(updatedForm) =>
                  setForm((current: any) => ({ ...current, ...updatedForm }))
                }
              />
            )}
            <PreviewDialogButton
              initialData={form?.previewInitialData || {}}
              initialDataSource={form?.initialDataSource}
            />
          </div>

          <h2
            dir="rtl"
            className="flex flex-row items-center gap-2 truncate font-medium"
          >
            <span className="text-muted-foreground ml-2 font-bold">
              نام فرم:
            </span>
            {form?.published && (
              <span className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs">
                منتشر شده - نسخه {form.currentVersion}
              </span>
            )}
            <Input
              {...renameForm.register('name')}
              defaultValue={form?.name || ''}
              disabled={renameIsLoading}
            />
            <Button
              disabled={renameIsLoading}
              onClick={renameForm.handleSubmit(renameSubmit)}
              variant={'outline'}
              className="flex min-w-[9rem] gap-2"
            >
              {renameIsLoading ? (
                <ImSpinner className="h-5 w-5 animate-spin" />
              ) : (
                <BiRename className="h-5 w-5" />
              )}
              {!renameIsLoading && 'تغییر نام'}
            </Button>
          </h2>
        </nav>
        <div
          className={twMerge(
            `bg-muted nord:bg-red-500 relative flex h-[200px] w-full flex-grow items-center justify-center overflow-y-hidden bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]`,
            theme == 'wood' && 'bg-[url(/paper-dark.svg)]'
          )}
        >
          <div className="bg-background flex h-full w-16 flex-grow flex-col items-center justify-between gap-10 border-r p-4">
            <div className="flex flex-col gap-10">
              <div
                className="flex cursor-pointer flex-row items-center gap-2"
                onClick={() => setLeftView('page')}
              >
                {leftView == 'page' ? (
                  <div className="bg-primary h-2 w-2 rounded-full"></div>
                ) : (
                  <div className="border-primary h-2 w-2 rounded-full border"></div>
                )}
                <VscInsert title="صفحات" className="h-6 w-6 cursor-pointer" />
              </div>
              <div
                className="flex cursor-pointer flex-row items-center gap-2"
                onClick={() => setLeftView('tree')}
              >
                {leftView == 'tree' ? (
                  <div className="bg-primary h-2 w-2 rounded-full"></div>
                ) : (
                  <div className="border-primary h-2 w-2 rounded-full border"></div>
                )}
                <VscListTree
                  title="اکسپلورر"
                  className="h-6 w-6 cursor-pointer"
                />
              </div>
              <div
                className="flex cursor-pointer flex-row items-center gap-2"
                onClick={() => setLeftView('ds')}
              >
                {leftView == 'ds' ? (
                  <div className="bg-primary h-2 w-2 rounded-full"></div>
                ) : (
                  <div className="border-primary h-2 w-2 rounded-full border"></div>
                )}
                <VscDatabase
                  title="منابع داده"
                  className="h-6 w-6 cursor-pointer"
                />
              </div>
              <div
                className="flex cursor-pointer flex-row items-center gap-2"
                onClick={() => setLeftView('history')}
              >
                {leftView == 'history' ? (
                  <div className="bg-primary h-2 w-2 rounded-full"></div>
                ) : (
                  <div className="border-primary h-2 w-2 rounded-full border"></div>
                )}
                <VscHistory
                  title="نسخه‌ها"
                  className="h-6 w-6 cursor-pointer"
                />
              </div>
              <div
                className="flex cursor-pointer flex-row items-center gap-2"
                onClick={() => setLeftView('expression')}
              >
                {leftView == 'expression' ? (
                  <div className="bg-primary h-2 w-2 rounded-full"></div>
                ) : (
                  <div className="border-primary h-2 w-2 rounded-full border"></div>
                )}
                <VscJson title="عبارات" className="h-6 w-6 cursor-pointer" />
              </div>
              <div className="flex flex-row items-center gap-2">
                {leftView == 'extension' ? (
                  <div className="bg-primary h-2 w-2 rounded-full"></div>
                ) : (
                  <div className="border-primary h-2 w-2 rounded-full border"></div>
                )}
                <VscExtensions
                  title="افزونه‌ها"
                  className="h-6 w-6 cursor-pointer"
                />
              </div>
            </div>
            <VscSettings className="h-6 w-6 cursor-pointer" />
          </div>
          {leftView === 'expression' && form ? (
            <FormEventsEditor
              formId={form.id}
              initialEvents={form.events || form.eventConfig || []}
            />
          ) : leftView === 'ds' && form ? (
            <FormInitialDataSourcePanel form={form} onSaved={applyFormState} />
          ) : leftView === 'history' && form ? (
            <FormVersionsPanel form={form} onRestored={applyFormState} />
          ) : (
            <Designer />
          )}
        </div>
      </main>
      <DragOverlayWrapper />
    </DndContext>
  )
}

export default FormBuilder
