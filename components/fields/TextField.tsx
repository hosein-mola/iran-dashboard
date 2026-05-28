'use client'

import { forwardRef, useEffect, useRef, useState, type JSX } from 'react'

import {
  ElementType,
  FormComponentType,
  FormElement,
  FormElementInstance,
} from '../../types/element-type'
import { MdTextFields } from 'react-icons/md'
import { Label } from '@radix-ui/react-label'
import { Input } from '../ui/input'
import { z } from 'zod'
import { Controller, useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IMaskInput } from 'react-imask'
import { PlayIcon } from '@radix-ui/react-icons'
import { HelpCircle } from 'lucide-react'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Switch } from '../ui/switch'
import useDesigner from '../hooks/useDesigner'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
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
} from '../ui/alert-dialog'
import { FaTrash } from 'react-icons/fa'
import { evaluate } from 'mathjs'
import { BiMath, BiPlusCircle } from 'react-icons/bi'
import { TbTrash } from 'react-icons/tb'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { ulid } from 'ulid'
import FormSubmitComponent from '../FormSubmitComponent'
import { IoSave } from 'react-icons/io5'

const type: ElementType = 'text'

const extraAttributes = {
  name: 'test',
  type: 'number',
  title: 'متن',
  id: '',
  label: 'فیلد متنی',
  helperText: 'متن راهنمای فیلد',
  required: false,
  placeholder: 'مقدار را وارد کنید...',
  mask: '0000-0000',
  min: '1',
  max: '100',
  minLength: '1',
  maxLength: '10',
  scale: '2',
  radix: '.',
  thousandsSeparator: ',',
  padFractionalZeros: true,
  normalizeZeros: true,
  lazy: false,
  disabled: false,
}

const propertyHints = {
  name: {
    description: 'شناسه فنی فیلد برای ذخیره مقدار و استفاده در فرمول‌ها.',
    example: 'field_water_level',
  },
  label: {
    description: 'عنوانی که بالای فیلد به کاربر نمایش داده می‌شود.',
    example: 'حجم ورودی سد',
  },
  placeholder: {
    description: 'متن راهنما داخل فیلد قبل از وارد کردن مقدار.',
    example: 'مثلا ۱۲۵۰',
  },
  helperText: {
    description: 'توضیح کوتاه زیر فیلد برای راهنمایی کاربر.',
    example: 'مقدار را بر حسب متر مکعب وارد کنید.',
  },
  required: {
    description:
      'اگر فعال باشد، کاربر بدون تکمیل این فیلد نمی‌تواند فرم را ثبت کند.',
    example: 'برای فیلدهای الزامی مثل نام سد فعال کنید.',
  },
  type: {
    description: 'نوع ورودی و قالب اعتبارسنجی فیلد را مشخص می‌کند.',
    example: 'عدد برای مقدارهای قابل محاسبه، الگو برای متن ساده.',
  },
  mask: {
    description:
      'قالب ورود متن را با نشانه‌های 0 برای عدد، a برای حرف و * برای هر کاراکتر تعیین می‌کند.',
    example: '0000-0000',
  },
  padFractionalZeros: {
    description: 'صفرهای اعشار را تا تعداد رقم تعیین‌شده کامل می‌کند.',
    example: '12.5 به 12.50 تبدیل می‌شود.',
  },
  normalizeZeros: {
    description: 'صفرهای اضافه و نامعتبر را در مقدار عددی مرتب می‌کند.',
    example: '00012 به 12 تبدیل می‌شود.',
  },
  lazy: {
    description: 'نمایش قالب ورودی را تا زمان تایپ کاربر به تعویق می‌اندازد.',
    example: 'برای نمایش خلوت‌تر فیلد عددی فعال کنید.',
  },
  disabled: {
    description: 'فیلد را فقط‌خواندنی و غیرقابل ویرایش می‌کند.',
    example: 'برای مقدارهای محاسبه‌شده یا داده‌های اولیه.',
  },
  radix: {
    description: 'علامت جداکننده بخش اعشار را تعیین می‌کند.',
    example: '.',
  },
  thousandsSeparator: {
    description: 'علامت جداکننده هزارگان در عددهای بزرگ.',
    example: ',',
  },
  scale: {
    description: 'تعداد رقم مجاز بعد از اعشار.',
    example: '2',
  },
  minLength: {
    description: 'حداقل تعداد کاراکتر مجاز برای مقدار واردشده.',
    example: '1',
  },
  maxLength: {
    description: 'حداکثر تعداد کاراکتر مجاز برای مقدار واردشده.',
    example: '10',
  },
  min: {
    description: 'کمترین مقدار عددی قابل قبول.',
    example: '1',
  },
  max: {
    description: 'بیشترین مقدار عددی قابل قبول.',
    example: '100',
  },
}

const patternExamples = [
  {
    title: 'شماره موبایل ایران',
    mask: '0000-000-0000',
    example: '0912-345-6789',
    useCase: 'ثبت شماره تماس کاربر یا مسئول بهره‌برداری',
  },
  {
    title: 'کد ملی',
    mask: '000-000000-0',
    example: '123-456789-0',
    useCase: 'شناسه ملی اشخاص حقیقی',
  },
  {
    title: 'کد پستی',
    mask: '00000-00000',
    example: '12345-67890',
    useCase: 'آدرس تاسیسات، ایستگاه یا دفتر',
  },
  {
    title: 'کد تجهیز',
    mask: 'aa-0000',
    example: 'AB-2048',
    useCase: 'کدگذاری پمپ، دریچه، سنسور یا تابلو برق',
  },
  {
    title: 'شماره پرونده',
    mask: '****/0000',
    example: 'DAM7/1403',
    useCase: 'پرونده‌های عملیاتی یا مکاتبات داخلی',
  },
  {
    title: 'پلاک یا شناسه ترکیبی',
    mask: '00-a-000',
    example: '12-B-345',
    useCase: 'شناسه خودرو، دستگاه یا نمونه آزمایشگاهی',
  },
]

const propertiesSchema = z.object({
  name: z.string(),
  title: z.string(),
  label: z.string().min(2).max(50),
  helperText: z.string().max(200),
  required: z.boolean(),
  placeholder: z.string().max(50),
  type: z.any(),
  min: z.string(),
  max: z.string(),
  minLength: z.string(),
  maxLength: z.string(),
  scale: z.string(),
  thousandsSeparator: z.string(),
  padFractionalZeros: z.boolean(),
  normalizeZeros: z.boolean(),
  radix: z.string(),
  mask: z.string(),
  lazy: z.boolean(),
  disabled: z.boolean(),
})

export const TextFieldFormElement: FormElement = {
  type,
  construct: (
    id: string,
    index: number,
    parentId: string | null,
    page: string
  ) => {
    return {
      id,
      index,
      type,
      page,
      parentId,
      extraAttributes: {
        ...extraAttributes,
        id,
        name: `field_${id}`,
      },
    }
  },
  designerBtnElement: {
    icon: MdTextFields,
    label: 'فیلد متنی',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (formInstance: FormElementInstance, current: string): boolean => {
    const element = formInstance as CustomInstance
    if (element.extraAttributes.require) {
      return current.length > 0
    }
    return true
  },
}

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>

const runtimeInputClassName =
  'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50'

const runtimeInputErrorClassName =
  'border-destructive text-destructive focus-visible:border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40'

function PropertyHelp({
  description,
  example,
  dir = 'rtl',
}: {
  description: string
  example: string
  dir?: 'rtl' | 'ltr'
}) {
  return (
    <FormDescription className="text-muted-foreground flex flex-col gap-1 text-xs leading-5">
      <span>{description}</span>
      <span className="text-muted-foreground/70">
        نمونه: <span dir={dir}>{example}</span>
      </span>
    </FormDescription>
  )
}

function PropertySection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-border/60 bg-card/60 space-y-4 rounded-lg border p-3">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-xs leading-5">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function PropertyFieldShell({ children }: { children: React.ReactNode }) {
  return <FormItem className="space-y-2">{children}</FormItem>
}

function PropertySwitchShell({ children }: { children: React.ReactNode }) {
  return (
    <FormItem className="border-border/60 bg-background/40 flex items-start justify-between gap-4 rounded-lg border p-3">
      {children}
    </FormItem>
  )
}

function SwitchControl({
  checked,
  onCheckedChange,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="pt-1" dir="ltr">
      <FormControl>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </FormControl>
    </div>
  )
}

function PatternExamplesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit gap-2"
        >
          <HelpCircle className="size-4" />
          راهنمای الگوها
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle>نمونه‌ها و راهنمای الگوی متنی</DialogTitle>
        <div className="space-y-4">
          <div className="text-muted-foreground space-y-2 text-sm leading-6">
            <p>
              در الگوی متنی، <span dir="ltr">0</span> برای عدد،
              <span dir="ltr"> a</span> برای حرف و<span dir="ltr"> *</span> برای
              هر نوع کاراکتر استفاده می‌شود. کاراکترهایی مثل خط تیره، اسلش و
              فاصله به همان شکل در فیلد نمایش داده می‌شوند.
            </p>
            <p>
              برای فیلدهایی که ساختار مشخص دارند، الگو باعث می‌شود داده‌ها یکدست
              و قابل پردازش ثبت شوند.
            </p>
          </div>
          <div className="grid gap-3">
            {patternExamples.map((item) => (
              <div
                key={item.title}
                className="border-border/60 bg-card/60 rounded-lg border p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{item.title}</h4>
                    <p className="text-muted-foreground text-xs leading-5">
                      {item.useCase}
                    </p>
                  </div>
                  <code
                    dir="ltr"
                    className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs"
                  >
                    {item.mask}
                  </code>
                </div>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  <div className="border-border/50 rounded-md border p-2">
                    <span className="text-muted-foreground">الگو: </span>
                    <span dir="ltr">{item.mask}</span>
                  </div>
                  <div className="border-border/50 rounded-md border p-2">
                    <span className="text-muted-foreground">نمونه: </span>
                    <span dir="ltr">{item.example}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getFieldName(element: CustomInstance) {
  return String(element.extraAttributes.name || element.id)
}

function parseNumericInput(value: unknown) {
  if (value === undefined || value === null || value === '') return null

  const parsed =
    typeof value === 'number'
      ? value
      : Number(String(value).replaceAll(',', '').trim())

  return Number.isFinite(parsed) ? parsed : null
}

function getFieldErrorMessage(
  formController: UseFormReturn<any>,
  name: string
) {
  const error = formController.formState.errors?.[name]
  if (!error) return null

  const message = error.message
  return typeof message === 'string' ? message : 'مقدار وارد شده معتبر نیست.'
}

function buildValidationRules(element: CustomInstance) {
  const { label, required, disabled, min, max, minLength, maxLength, type } =
    element.extraAttributes
  const fieldLabel = label || element.extraAttributes.name || 'این فیلد'

  return {
    required: required && !disabled ? `${fieldLabel} الزامی است.` : undefined,
    validate: {
      min: (value: unknown) => {
        if (
          type !== 'number' ||
          value === undefined ||
          value === null ||
          value === ''
        ) {
          return true
        }

        const minValue = parseNumericInput(min)
        const currentValue = parseNumericInput(value)

        if (minValue === null || currentValue === null) return true

        return (
          currentValue >= minValue ||
          `${fieldLabel} نباید کمتر از ${minValue} باشد.`
        )
      },
      max: (value: unknown) => {
        if (
          type !== 'number' ||
          value === undefined ||
          value === null ||
          value === ''
        ) {
          return true
        }

        const maxValue = parseNumericInput(max)
        const currentValue = parseNumericInput(value)

        if (maxValue === null || currentValue === null) return true

        return (
          currentValue <= maxValue ||
          `${fieldLabel} نباید بیشتر از ${maxValue} باشد.`
        )
      },
      minLength: (value: unknown) => {
        if (value === undefined || value === null || value === '') return true

        const minLengthValue = Number(minLength)
        if (!Number.isFinite(minLengthValue) || minLengthValue <= 0) return true

        return (
          String(value).length >= minLengthValue ||
          `${fieldLabel} باید حداقل ${minLengthValue} کاراکتر باشد.`
        )
      },
      maxLength: (value: unknown) => {
        if (value === undefined || value === null || value === '') return true

        const maxLengthValue = Number(maxLength)
        if (!Number.isFinite(maxLengthValue) || maxLengthValue <= 0) return true

        return (
          String(value).length <= maxLengthValue ||
          `${fieldLabel} باید حداکثر ${maxLengthValue} کاراکتر باشد.`
        )
      },
    },
  }
}

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance
}) {
  const element = elementInstance as CustomInstance
  const { label, required, placeholder, helperText } = element.extraAttributes

  return (
    <>
      <div
        key={element.id + 'id'}
        className={cn(
          'border-border/60 bg-card/60 flex min-w-full flex-col gap-3 rounded-lg border p-3 shadow-sm hover:!cursor-pointer'
        )}
      >
        <Label className="hover:!cursor-pointer">
          {label}
          {required && '*'}
        </Label>
        <Input
          className="mt-2 hover:!cursor-pointer"
          readOnly
          placeholder={placeholder}
        />
        {helperText && (
          <p className="text-muted-foreground mt-2 text-[0.8rem] hover:!cursor-pointer">
            {helperText}
          </p>
        )}
      </div>
    </>
  )
}
function FormComponent({
  elementInstance,
  formController,
  isInvalid,
}: FormComponentType): JSX.Element {
  const element = elementInstance as CustomInstance
  const { label, required, helperText } = element.extraAttributes
  const ref = useRef(null)
  const inputRef = useRef(null)
  const fieldName = getFieldName(element)
  const errorMessage = getFieldErrorMessage(formController, fieldName)
  const hasError = isInvalid === true || Boolean(errorMessage)

  return (
    <div
      className={cn(
        'border-border/60 bg-background/40 flex w-full flex-col gap-3 rounded-lg border p-3',
        hasError && 'border-destructive/50 bg-destructive/5'
      )}
    >
      <Label className={cn(hasError && 'text-destructive')}>
        {label}
        {required && '*'}
      </Label>
      <MaskInputGenerator
        element={element}
        formController={formController}
        ref={ref}
        inputRef={inputRef}
        error={hasError}
      />
      {errorMessage && (
        <p className="text-destructive mt-1 text-[0.8rem]">{errorMessage}</p>
      )}
      {helperText && (
        <p
          className={cn(
            'text-muted-foreground mt-2 text-[0.8rem]',
            hasError && 'text-destructive'
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  )
}
function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance
}) {
  const { updateElement, deleteElement, elements, pages } = useDesigner()
  const element = elementInstance as CustomInstance
  const form = useForm({
    resolver: zodResolver(propertiesSchema),
    mode: 'onBlur',
    defaultValues: { ...extraAttributes, ...element.extraAttributes },
  })

  const [formulaList, setFormulaList] = useState<
    Array<{ id: string; data: string }>
  >([])
  const [evaluateResultArray, setEvaluateResultArray] = useState<
    Array<number | string>
  >([])
  const [data, setData] = useState<{
    getValues: () => Record<string, unknown>
  }>({ getValues: () => ({}) })
  const updatedtype = form.watch('type')

  useEffect(() => {
    if (element) {
      form.reset(element.extraAttributes)
    }
  }, [element, form])

  function applyChanges(values: propertiesFormSchemaType) {
    console.log('🚀 ~ applyChanges ~ values:', values)
    updateElement(element.id, {
      ...element,
      extraAttributes: { ...values },
    })
  }

  const form_sample: FormElementInstance & {
    page: { id: string; extraAttributes: string }
    components: FormElementInstance[]
  } = {
    id: '-1',
    index: -1,
    parentId: null,
    extraAttributes: {},
    type: 'text',
    page: ('{ "id": "-1", "extraAttributes": ' +
      JSON.stringify(pages) +
      ' }') as string & { id: string; extraAttributes: string },
    components: [...elements].sort((a, b) => a.index - b.index),
  }

  console.log('err', form.formState.errors)

  return (
    <Form {...form}>
      <form onBlur={form.handleSubmit(applyChanges)} className="space-y-5">
        <div className="border-border/60 bg-card/60 flex w-full items-center justify-between rounded-lg border p-2">
          <div className="space-y-0.5 px-1">
            <p className="text-sm font-semibold">تنظیمات فیلد متنی</p>
            <p className="text-muted-foreground text-xs">
              مشخصات، نمایش و اعتبارسنجی این فیلد را تنظیم کنید.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={'outline'}
                  className="text-muted-foreground"
                >
                  <FaTrash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف فیلد متنی</AlertDialogTitle>
                  <AlertDialogDescription>
                    این عملیات قابل بازگشت نیست و بعد از حذف، این فیلد از فرم
                    پاک می‌شود. <br />
                    <br />
                    <span className="font-medium">
                      اگر این فیلد شامل زیرمجموعه باشد، زیرمجموعه‌ها هم حذف
                      می‌شوند.
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>انصراف</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={false}
                    onClick={(e) => {
                      e.preventDefault()
                      deleteElement(element)
                    }}
                  >
                    حذف فیلد
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" size="icon" variant={'outline'}>
                  <BiMath className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-accent z-[99999] flex h-screen max-h-screen w-screen max-w-full flex-grow flex-col items-center gap-0 p-8">
                <DialogTitle className="bg-background m-0 w-full border-b px-4 py-2">
                  <p className="text-lg font-bold">ویرایشگر فرمول</p>
                  <div className="flex h-12 items-center gap-2">
                    <Button
                      className="text-sm"
                      onClick={() =>
                        setFormulaList((prev) => [
                          ...prev,
                          { id: ulid(4), data: '' },
                        ])
                      }
                    >
                      <BiPlusCircle className="h-6 w-6" />
                    </Button>
                    <Button
                      variant={'secondary'}
                      className="text-sm"
                      onClick={() => {
                        const result = evaluate(
                          formulaList.map((f) => f.data),
                          data.getValues()
                        )
                        setEvaluateResultArray(result)
                      }}
                    >
                      <PlayIcon className="h-6 w-6" />
                    </Button>
                    <Button
                      variant={'secondary'}
                      className="text-sm"
                      onClick={() => {
                        const result = evaluate(
                          formulaList.map((f) => f.data),
                          data.getValues()
                        )
                        setEvaluateResultArray(result)
                      }}
                    >
                      <IoSave className="h-6 w-6" />
                    </Button>
                  </div>
                </DialogTitle>
                <div className="bg-background mt-2 flex w-full flex-grow flex-row items-start overflow-auto px-4 py-2 shadow-2xl">
                  <div className="flex w-6/12 flex-col">
                    {formulaList.map(
                      (
                        formula: { id: string; data: string },
                        index: number
                      ) => {
                        return (
                          <div
                            key={formula.id}
                            className="flex h-12 w-full flex-row items-center justify-between gap-2 border-b px-4 py-2"
                          >
                            <div className="flex h-12 w-8/12 flex-row items-center gap-2">
                              <Button
                                onClick={() =>
                                  setFormulaList((prev) =>
                                    prev.filter(
                                      (item) => item.id !== formula.id
                                    )
                                  )
                                }
                                variant={'outline'}
                                className="w-auto rounded-full"
                              >
                                <TbTrash className="h-3 w-3" />
                              </Button>
                              <span className="w-2/12 text-center">
                                {'مرحله' + ' ' + Number(index + 1)}
                              </span>
                              <Input
                                className="w-8/12"
                                onChange={(e) => {
                                  setFormulaList((prev) =>
                                    prev.map(
                                      (item: { id: string; data: string }) =>
                                        item.id === formula.id
                                          ? { ...item, data: e?.target.value }
                                          : item
                                    )
                                  )
                                }}
                                key={formula.id}
                              />
                            </div>
                            <div className="text-foreground/70 w-2/12">
                              {'//' +
                                ' ' +
                                (evaluateResultArray[index] == undefined
                                  ? '?'
                                  : evaluateResultArray[index])}
                            </div>
                          </div>
                        )
                      }
                    )}
                  </div>
                  <div className="w-6/12 border">
                    <FormSubmitComponent
                      formId={0}
                      form={form_sample}
                      type={'preview'}
                      setData={setData}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <PropertySection
          title="شناسه و نمایش"
          description="این بخش تعیین می‌کند فیلد با چه نامی ذخیره و با چه متنی به کاربر نمایش داده شود."
        >
          <FormField
            control={form.control}
            name={'name'}
            render={({ field }) => {
              return (
                <PropertyFieldShell>
                  <FormLabel>نام فنی فیلد</FormLabel>
                  <FormControl>
                    <Input onChange={field.onChange} value={field.value} />
                  </FormControl>
                  <PropertyHelp
                    description={propertyHints.name.description}
                    example={propertyHints.name.example}
                    dir="ltr"
                  />
                  <FormDescription
                    className="text-muted-foreground/60 flex flex-col text-xs"
                    dir="ltr"
                  >
                    <span>
                      {' '}
                      {element?.parentId == null ? 'body' : element.parentId}
                    </span>
                    <span>{element?.id}</span>
                  </FormDescription>
                  <FormMessage />
                </PropertyFieldShell>
              )
            }}
          />
          <FormField
            control={form.control}
            name={'label'}
            render={({ field }) => {
              return (
                <PropertyFieldShell>
                  <FormLabel>برچسب نمایشی</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <PropertyHelp {...propertyHints.label} />
                  <FormMessage />
                </PropertyFieldShell>
              )
            }}
          />
          <FormField
            control={form.control}
            name={'placeholder'}
            render={({ field }) => {
              return (
                <PropertyFieldShell>
                  <FormLabel>متن جایگزین</FormLabel>
                  <FormControl>
                    <Input onChange={field.onChange} value={field.value} />
                  </FormControl>
                  <PropertyHelp {...propertyHints.placeholder} />
                  <FormMessage />
                </PropertyFieldShell>
              )
            }}
          />
          <FormField
            control={form.control}
            name={'helperText'}
            render={({ field }) => {
              return (
                <PropertyFieldShell>
                  <FormLabel>متن راهنما</FormLabel>
                  <FormControl>
                    <Input onChange={field.onChange} value={field.value} />
                  </FormControl>
                  <PropertyHelp {...propertyHints.helperText} />
                  <FormMessage />
                </PropertyFieldShell>
              )
            }}
          />
        </PropertySection>

        <PropertySection
          title="رفتار فیلد"
          description="نوع ورودی و وضعیت‌های اصلی فیلد را مشخص کنید."
        >
          <FormField
            control={form.control}
            name={'required'}
            render={({ field }) => {
              return (
                <PropertySwitchShell>
                  <div className="min-w-0 flex-1 space-y-1">
                    <FormLabel>الزامی باشد</FormLabel>
                    <PropertyHelp {...propertyHints.required} />
                  </div>
                  <SwitchControl
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FormMessage />
                </PropertySwitchShell>
              )
            }}
          />
          <FormField
            control={form.control}
            name={'type'}
            render={({ field }) => {
              return (
                <PropertyFieldShell>
                  <div className="space-y-1">
                    <FormLabel>نوع ورودی</FormLabel>
                    <PropertyHelp {...propertyHints.type} />
                  </div>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={element.extraAttributes.type}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="نوع ورودی را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="number">عدد</SelectItem>
                        <SelectItem value="pattern">الگو / متن</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </PropertyFieldShell>
              )
            }}
          />
          <FormField
            control={form.control}
            name={'disabled'}
            render={({ field }) => {
              return (
                <PropertySwitchShell>
                  <div className="min-w-0 flex-1 space-y-1">
                    <FormLabel>غیرفعال باشد</FormLabel>
                    <PropertyHelp {...propertyHints.disabled} />
                  </div>
                  <SwitchControl
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FormMessage />
                </PropertySwitchShell>
              )
            }}
          />
        </PropertySection>

        {updatedtype == 'number' && (
          <PropertySection
            title="قالب و اعتبارسنجی عدد"
            description="تنظیمات نمایش عدد، طول مقدار، بازه مجاز و کنترل صفرها."
          >
            <FormField
              control={form.control}
              name={'padFractionalZeros'}
              render={({ field }) => {
                return (
                  <PropertySwitchShell>
                    <div className="min-w-0 flex-1 space-y-1">
                      <FormLabel>تکمیل صفرهای اعشار</FormLabel>
                      <PropertyHelp {...propertyHints.padFractionalZeros} />
                    </div>
                    <SwitchControl
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormMessage />
                  </PropertySwitchShell>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'normalizeZeros'}
              render={({ field }) => {
                return (
                  <PropertySwitchShell>
                    <div className="min-w-0 flex-1 space-y-1">
                      <FormLabel>مرتب‌سازی صفرها</FormLabel>
                      <PropertyHelp {...propertyHints.normalizeZeros} />
                    </div>
                    <SwitchControl
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormMessage />
                  </PropertySwitchShell>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'lazy'}
              render={({ field }) => {
                return (
                  <PropertySwitchShell>
                    <div className="min-w-0 flex-1 space-y-1">
                      <FormLabel>نمایش تنبل قالب</FormLabel>
                      <PropertyHelp {...propertyHints.lazy} />
                    </div>
                    <SwitchControl
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormMessage />
                  </PropertySwitchShell>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'radix'}
              render={({ field }) => {
                return (
                  <PropertyFieldShell>
                    <FormLabel>جداکننده اعشار</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <PropertyHelp {...propertyHints.radix} dir="ltr" />
                    <FormMessage />
                  </PropertyFieldShell>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'thousandsSeparator'}
              render={({ field }) => {
                return (
                  <PropertyFieldShell>
                    <FormLabel>جداکننده هزارگان</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <PropertyHelp
                      {...propertyHints.thousandsSeparator}
                      dir="ltr"
                    />
                    <FormMessage />
                  </PropertyFieldShell>
                )
              }}
            />

            <FormField
              control={form.control}
              name={'scale'}
              render={({ field }) => {
                return (
                  <PropertyFieldShell>
                    <FormLabel>تعداد رقم اعشار</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <PropertyHelp {...propertyHints.scale} dir="ltr" />
                    <FormMessage />
                  </PropertyFieldShell>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'minLength'}
              render={({ field }) => {
                return (
                  <PropertyFieldShell>
                    <FormLabel>حداقل طول</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <PropertyHelp {...propertyHints.minLength} dir="ltr" />
                    <FormMessage />
                  </PropertyFieldShell>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'maxLength'}
              render={({ field }) => {
                return (
                  <PropertyFieldShell>
                    <FormLabel>حداکثر طول</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <PropertyHelp {...propertyHints.maxLength} dir="ltr" />
                    <FormMessage />
                  </PropertyFieldShell>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'min'}
              render={({ field }) => {
                return (
                  <PropertyFieldShell>
                    <FormLabel>حداقل مقدار</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <PropertyHelp {...propertyHints.min} dir="ltr" />
                    <FormMessage />
                  </PropertyFieldShell>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'max'}
              render={({ field }) => {
                return (
                  <PropertyFieldShell>
                    <FormLabel>حداکثر مقدار</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <PropertyHelp {...propertyHints.max} dir="ltr" />
                    <FormMessage />
                  </PropertyFieldShell>
                )
              }}
            />
          </PropertySection>
        )}

        {updatedtype == 'pattern' && (
          <PropertySection
            title="قالب متنی"
            description="برای متن‌های ساختاریافته مثل کد، پلاک، شماره پرونده یا شناسه از الگو استفاده کنید."
          >
            <FormField
              control={form.control}
              name={'mask'}
              render={({ field }) => {
                return (
                  <PropertyFieldShell>
                    <FormLabel>الگوی ورود</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <PropertyHelp {...propertyHints.mask} dir="ltr" />
                    <PatternExamplesDialog />
                    <FormMessage />
                  </PropertyFieldShell>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'lazy'}
              render={({ field }) => {
                return (
                  <PropertySwitchShell>
                    <div className="min-w-0 flex-1 space-y-1">
                      <FormLabel>نمایش تنبل قالب</FormLabel>
                      <PropertyHelp {...propertyHints.lazy} />
                    </div>
                    <SwitchControl
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormMessage />
                  </PropertySwitchShell>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'minLength'}
              render={({ field }) => {
                return (
                  <PropertyFieldShell>
                    <FormLabel>حداقل طول</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <PropertyHelp {...propertyHints.minLength} dir="ltr" />
                    <FormMessage />
                  </PropertyFieldShell>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'maxLength'}
              render={({ field }) => {
                return (
                  <PropertyFieldShell>
                    <FormLabel>حداکثر طول</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <PropertyHelp {...propertyHints.maxLength} dir="ltr" />
                    <FormMessage />
                  </PropertyFieldShell>
                )
              }}
            />
          </PropertySection>
        )}
      </form>
    </Form>
  )
}
interface MaskInputGeneratorProps {
  element: CustomInstance // Replace 'any' with the actual type if known
  formController: UseFormReturn<any> // Replace 'any' with the actual type if known
  inputRef?: React.Ref<HTMLInputElement> // Assuming inputRef is a reference to an HTML input element
  error?: boolean // Assuming error is a string, adjust if needed
}

const MaskInputGenerator = forwardRef<
  HTMLInputElement,
  MaskInputGeneratorProps
>((props, ref) => {
  const { element, formController, inputRef, error } = props
  const fieldName = getFieldName(element)
  const rules = buildValidationRules(element)

  if (element.extraAttributes.type === 'number') {
    return (
      <Controller
        key={element.extraAttributes.title}
        control={formController.control}
        name={fieldName}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <IMaskInput
            autoFocus={false}
            inputRef={inputRef}
            value={value === undefined || value === null ? '' : String(value)}
            dir="ltr"
            aria-invalid={error}
            className={cn(
              runtimeInputClassName,
              error && runtimeInputErrorClassName
            )}
            mask={Number}
            thousandsSeparator={element.extraAttributes.thousandsSeparator}
            min={Number(element.extraAttributes.min)}
            minLength={Number(element.extraAttributes.minLength)}
            max={Number(element.extraAttributes.max)}
            maxLength={Number(element.extraAttributes.maxLength)}
            scale={Number(element.extraAttributes.scale)}
            radix={String(element.extraAttributes.radix)}
            padFractionalZeros={Boolean(
              element.extraAttributes.padFractionalZeros
            )}
            normalizeZeros={Boolean(element.extraAttributes.normalizeZeros)}
            disabled={element.extraAttributes.disabled}
            lazy={Boolean(element.extraAttributes.lazy)}
            overwrite={'shift'}
            placeholder={element.extraAttributes.placeholder}
            placeholderChar={'#'}
            mapToRadix={['.', '-']}
            onAccept={(value) => {
              onChange(value)
            }}
            onBlur={onBlur}
            data-id={element.id}
          />
        )}
      />
    )
  }
  if (element.extraAttributes.type === 'pattern') {
    return (
      <Controller
        key={element.extraAttributes.title}
        control={formController.control}
        name={fieldName}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <IMaskInput
            ref={ref}
            inputRef={inputRef}
            value={value === undefined || value === null ? '' : String(value)}
            dir="ltr"
            aria-invalid={error}
            disabled={element.extraAttributes.disabled}
            placeholder={element.extraAttributes.placeholder}
            className={cn(
              runtimeInputClassName,
              error && runtimeInputErrorClassName
            )}
            mask={element.extraAttributes.mask || '********************'}
            lazy={Boolean(element.extraAttributes.lazy)}
            overwrite={'shift'}
            placeholderChar={'#'}
            onAccept={(value) => {
              onChange(value)
            }}
            onBlur={onBlur}
            data-id={element.id}
          />
        )}
      />
    )
  }

  return null
})

// Add a display name to the component
MaskInputGenerator.displayName = 'MaskInputGenerator'
