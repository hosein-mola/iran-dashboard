'use client'
import { useEffect, useState } from 'react'
import PreviewDialogButton from './PreviewDialogButton'
import PublishFormButton from './PublishFormButton'
import SaveFormButton from './SaveFormButton'
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
import Link from 'next/link'
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs'
import Confetti from 'react-confetti'
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
import { useTheme } from 'next-themes'
import { twMerge } from 'tailwind-merge'
import { FormElementInstance } from './FormElement'
import { ulid } from 'ulid'
import { PageType } from './context/DesignerContext'
import { BiRename } from 'react-icons/bi'
import { useForm } from 'react-hook-form'
import { ImSpinner } from 'react-icons/im'

interface FormBuilderProps {
  form: {
    formId: string
    id: number
    name: string
    published: boolean
    components: FormElementInstance[]
    page: {
      extraAttributes: string
    }
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
  const [form, setForm] = useState<{
    formId: string
    id: number
    name: string
    published: boolean
    components: FormElementInstance[]
    page: { extraAttributes: string }
  } | null>(props.form)
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

  useEffect(() => {
    setSelectedElement(null)
    setForm(null)
    setSelectedPage({ id: '', index: 0, name: '' })
    setElements([])
    setPages([])
    setIsReady(false)
    const req = async () => {
      const _form = await GetFormById(Number(params.id))
      setForm(_form)
      setElements(
        _form.components.sort(
          (a: FormElementInstance, b: FormElementInstance) => a.index - b.index
        )
      )
      const pages: Array<PageType> = JSON.parse(_form.page.extraAttributes)
      if (pages.length == 0 || pages == null) {
        const initPage = { id: ulid(10), index: 1, name: 'صفحه-1' }
        setPages([initPage])
        setSelectedPage(initPage)
      } else {
        setPages(pages)
        setSelectedPage(pages[0])
      }
    }
    req().finally(() => {
      setIsReady(true)
    })
  }, [
    params.id,
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

  if (form && form.published) {
    return (
      <>
        <Confetti recycle={false} numberOfPieces={1000} />
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="max-w-xl">
            <h1 className="text-primary mb-10 border-b pb-2 text-center text-4xl font-bold">
              🎊🎊 فرم منتشر شد 🎊🎊
            </h1>
            <h2 className="text-2xl">اشتراک‌گذاری این فرم</h2>
            <h3 className="text-muted-foreground border-b pb-10 text-xl">
              هر کسی با این لینک می‌تواند فرم را مشاهده و ارسال کند
            </h3>
            <div className="my-4 flex w-full flex-col items-center gap-2 border-b pb-4">
              <Input
                className="w-full"
                readOnly
                value={`${origin}/submit/${params.id}`}
              />
              <Button
                className="mt-2 w-full"
                onClick={() => {
                  navigator.clipboard.writeText(`${origin}/submit/${params.id}`)
                  toast({
                    title: 'کپی شد!',
                    description: 'لینک در کلیپ‌بورد کپی شد',
                  })
                }}
              >
                کپی لینک
              </Button>
            </div>
            <div className="flex justify-between">
              <Button variant={'link'} asChild>
                <Link href={'/'} className="gap-2">
                  <BsArrowLeft />
                  بازگشت به خانه
                </Link>
              </Button>
              <Button variant={'link'} asChild>
                <Link href={`/forms/${params.id}`} className="gap-2">
                  جزئیات فرم
                  <BsArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin}>
      <main className="flex w-full flex-1 flex-col overflow-hidden">
        <nav
          dir="rtl"
          className="border-border flex items-center justify-between gap-3 border-b p-4"
        >
          <div className="flex items-center gap-2">
            {form && !form.published && (
              <>
                <PublishFormButton id={form.id} />
                <SaveFormButton id={form.id} />
              </>
            )}
            <PreviewDialogButton />
          </div>

          <h2
            dir="rtl"
            className="flex flex-row items-center gap-2 truncate font-medium"
          >
            <span className="text-muted-foreground ml-2 font-bold">
              نام فرم:
            </span>
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
            theme == 'nord' && 'bg-[url(/paper-dark.svg)]'
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
              <div className="flex flex-row items-center gap-2">
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
              <div className="flex flex-row items-center gap-2">
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
              <div className="flex flex-row items-center gap-2">
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
          <Designer />
        </div>
      </main>
      <DragOverlayWrapper />
    </DndContext>
  )
}

export default FormBuilder
