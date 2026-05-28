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
  title: 'Text',
  id: '',
  label: 'TextFiel',
  helperText: 'HelperText',
  required: false,
  placeholder: 'Value here...',
  mask: 'Number',
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
    label: 'Text Field',
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

function getFieldErrorMessage(formController: UseFormReturn<any>, name: string) {
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
    required:
      required && !disabled ? `${fieldLabel} الزامی است.` : undefined,
    validate: {
      min: (value: unknown) => {
        if (type !== 'number' || value === undefined || value === null || value === '') {
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
        if (type !== 'number' || value === undefined || value === null || value === '') {
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
          'bg-background flex min-w-full flex-col gap-2 p-2 hover:!cursor-pointer'
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
    <div className={cn('flex w-full flex-col gap-2', '')}>
      <Label className={cn(hasError && 'text-red-500')}>
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
        <p className="mt-1 text-[0.8rem] text-red-500">{errorMessage}</p>
      )}
      {helperText && (
        <p
          className={cn(
            'text-muted-foreground mt-2 text-[0.8rem]',
            hasError && 'text-red-500'
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
      <form onBlur={form.handleSubmit(applyChanges)} className="space-y-3">
        <div className="flex h-12 w-full flex-wrap items-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={'outline'}
                className="text-muted-foreground gap-2"
              >
                <FaTrash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. After deleting you will not be
                  able to edit this form. <br />
                  <br />
                  <span className="font-medium">
                    By Deleting this item all items children would be deleted as
                    well.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={false}
                  onClick={(e) => {
                    e.preventDefault()
                    deleteElement(element)
                  }}
                >
                  Delete Item
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={'outline'} className="gap-2">
                <BiMath className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-accent z-[99999] flex h-screen max-h-screen w-screen max-w-full flex-grow flex-col items-center gap-0 p-8">
              <DialogTitle className="bg-background m-0 w-full border-b px-4 py-2">
                <p className="text-lg font-bold">Formula Editor</p>
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
                    (formula: { id: string; data: string }, index: number) => {
                      return (
                        <div
                          key={formula.id}
                          className="flex h-12 w-full flex-row items-center justify-between gap-2 border-b px-4 py-2"
                        >
                          <div className="flex h-12 w-8/12 flex-row items-center gap-2">
                            <Button
                              onClick={() =>
                                setFormulaList((prev) =>
                                  prev.filter((item) => item.id !== formula.id)
                                )
                              }
                              variant={'outline'}
                              className="w-auto rounded-full"
                            >
                              <TbTrash className="h-3 w-3" />
                            </Button>
                            <span className="w-2/12 text-center">
                              {'STEP' + ' ' + Number(index) + 1}
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
        <FormField
          control={form.control}
          name={'name'}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input onChange={field.onChange} value={field.value} />
                </FormControl>
                <FormDescription className="flex flex-col" dir="ltr">
                  <span>
                    {' '}
                    {element?.parentId == null ? 'body' : element.parentId}
                  </span>
                  <span>{element?.id}</span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={form.control}
          name={'label'}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>label</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  label of the field <br />
                  will be displayed above the filed
                </FormDescription>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={form.control}
          name={'placeholder'}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>placeHolder</FormLabel>
                <FormControl>
                  <Input onChange={field.onChange} value={field.value} />
                </FormControl>
                <FormDescription>the placeHolder of the field</FormDescription>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={form.control}
          name={'helperText'}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>helper text</FormLabel>
                <FormControl>
                  <Input onChange={field.onChange} value={field.value} />
                </FormControl>
                <FormDescription>helper text</FormDescription>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={form.control}
          name={'required'}
          render={({ field }) => {
            return (
              <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Required</FormLabel>
                  <FormDescription>Required</FormDescription>
                </div>
                <FormControl dir="ltr">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={form.control}
          name={'type'}
          render={({ field }) => {
            return (
              <FormItem className="flex flex-row items-center justify-between gap-2">
                <FormLabel>type</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={element.extraAttributes.type}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="number">number</SelectItem>
                      <SelectItem value="pattern">pattern</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        {updatedtype == 'number' && (
          <div>
            <FormField
              control={form.control}
              name={'padFractionalZeros'}
              render={({ field }) => {
                return (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>padFractionalZeros</FormLabel>
                      <FormDescription>padFractionalZeros</FormDescription>
                    </div>
                    <FormControl dir="ltr">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'normalizeZeros'}
              render={({ field }) => {
                return (
                  <FormItem className="mt-2 flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>normalizeZeros</FormLabel>
                      <FormDescription>normalizeZeros</FormDescription>
                    </div>
                    <FormControl dir="ltr">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'lazy'}
              render={({ field }) => {
                return (
                  <FormItem className="mt-2 flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>lazy</FormLabel>
                      <FormDescription>lazy</FormDescription>
                    </div>
                    <FormControl dir="ltr">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'disabled'}
              render={({ field }) => {
                return (
                  <FormItem className="mt-2 flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>disabled</FormLabel>
                      <FormDescription>disabled</FormDescription>
                    </div>
                    <FormControl dir="ltr">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'radix'}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>redix</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'thousandsSeparator'}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>thousandsSeparator</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name={'scale'}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>scale</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'minLength'}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>minLength</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'maxLength'}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>MaxLength</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'min'}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>min</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name={'max'}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>max</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>
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
              'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-none border bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500 text-red-500'
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
        render={({ field }) => (
          <Input
            {...field}
            ref={ref}
            aria-invalid={error}
            disabled={element.extraAttributes.disabled}
            placeholder={element.extraAttributes.placeholder}
            className={cn(error && 'border-red-500 text-red-500')}
            value={field.value ?? ''}
          />
        )}
      />
    )
  }

  return null
})

// Add a display name to the component
MaskInputGenerator.displayName = 'MaskInputGenerator'
