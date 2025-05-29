'use client'
import {
  ElementType,
  FormElement,
  FormElementInstance,
  FormElements,
  SubmitFunction,
} from '../../types/element-type'
import { Input } from '../ui/input'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { VscLayoutSidebarRightOff } from 'react-icons/vsc'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import useDesigner from '../hooks/useDesigner'
import { cn } from '@/lib/utils'
import { useDroppable } from '@dnd-kit/core'
import { DesignerElementWrapper } from '../Designer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Button } from '../ui/button'
import { FaTrash } from 'react-icons/fa'

const type: ElementType = 'panel'

const extraAttributes = {
  id: '',
  name: 'test',
  title: 'عنوان فیلد',
  state: [],
  cols: '2',
  span: '1',
  padding: '0.5',
  paddingUnit: 'rem',
  minHeight: '5',
  gap: '1',
}

const propertiesSchema = z.record(z.string(), z.string().optional())

export const PanelFieldElement: FormElement = {
  type,
  construct: (
    id: string,
    index: number,
    parentId: string | null,
    page: string,
    _extraAttributes?: Record<string, unknown>
  ) => {
    return {
      id,
      index,
      type,
      parentId,
      page,
      extraAttributes: {
        ...extraAttributes,
        ..._extraAttributes,
      },
    }
  },
  designerBtnElement: {
    icon: VscLayoutSidebarRightOff,
    label: 'فیلد پنل',
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: () => true,
}

type CustomInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>
function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance
}) {
  const { elements } =
    useDesigner()
  const droppble = useDroppable({
    id: elementInstance.id + '-panel',
    data: {
      type: 'panel',
      extraAttributes: {
        id: elementInstance.id,
      },
    },
  })

  const element = elementInstance as CustomInstance
  return (
    <div
      dir="rtl"
      ref={droppble.setNodeRef}
      className={cn(
        'grid h-full min-h-[5rem] grow grid-cols-2 gap-x-1 gap-y-1 border p-5',
        String(element.extraAttributes.cols) == '1' && 'grid-cols-1',
        String(element.extraAttributes.cols) == '2' && 'grid-cols-2',
        String(element.extraAttributes.cols) == '3' && 'grid-cols-3',
        String(element.extraAttributes.cols) == '4' && 'grid-cols-4',
        String(element.extraAttributes.cols) == '5' && 'grid-cols-5',
        String(element.extraAttributes.cols) == '6' && 'grid-cols-6',
        String(element.extraAttributes.cols) == '7' && 'grid-cols-7',
        String(element.extraAttributes.cols) == '8' && 'grid-cols-8',
        String(element.extraAttributes.cols) == '9' && 'grid-cols-9',
        String(element.extraAttributes.cols) == '10' && 'grid-cols-10',
        String(element.extraAttributes.cols) == '11' && 'grid-cols-11',
        String(element.extraAttributes.cols) == '12' && 'grid-cols-12'
      )}
      style={{
        ...element.extraAttributes,
        gap: element.extraAttributes['gap'] + 'rem',
        padding:
          element.extraAttributes['padding'] +
          element.extraAttributes['paddingUnit'],
        minHeight: element.extraAttributes['minHeight'] + 'rem',
      }}
    >
      {elements
        .filter((el) => el.parentId == element.id)
        .sort(
          (a: FormElementInstance, b: FormElementInstance) => a.index - b.index
        )
        .map((element, index) => {
          return (
            <div
              className={cn(
                'grid h-full w-full align-top',
                String(element.extraAttributes.span) == '1' && 'col-span-1',
                String(element.extraAttributes.span) == '2' && 'col-span-2',
                String(element.extraAttributes.span) == '3' && 'col-span-3',
                String(element.extraAttributes.span) == '4' && 'col-span-4',
                String(element.extraAttributes.span) == '5' && 'col-span-5',
                String(element.extraAttributes.span) == '6' && 'col-span-6',
                String(element.extraAttributes.span) == '7' && 'col-span-7',
                String(element.extraAttributes.span) == '8' && 'col-span-8',
                String(element.extraAttributes.span) == '9' && 'col-span-9',
                String(element.extraAttributes.span) == '10' && 'col-span-10',
                String(element.extraAttributes.span) == '11' && 'col-span-11',
                String(element.extraAttributes.span) == '12' && 'col-span-12',
                String(element.extraAttributes.span) == 'full' &&
                'col-span-full'
              )}
              key={element.id}
            >
              <DesignerElementWrapper
                element={element}
                index={index}
                row={true}
              />
            </div>
          )
        })}
    </div>
  )
}

function FormComponent({
  elementInstance,
  formController,
}: {
  elementInstance: FormElementInstance
  isInvalid?: boolean
  submitValue?: SubmitFunction
  defaultValue?: string
  formController: any
}) {
  const { elements } = useDesigner()

  const element = elementInstance as CustomInstance
  return (
    <div
      dir="rtl"
      className={cn('bg-background flex w-full cursor-default flex-col')}
    >
      <div
        className={cn(
          'grid min-h-[5rem] grid-cols-2 gap-x-1 gap-y-1 border p-5',
          String(element.extraAttributes.cols) == '1' && 'grid-cols-1',
          String(element.extraAttributes.cols) == '2' && 'grid-cols-2',
          String(element.extraAttributes.cols) == '3' && 'grid-cols-3',
          String(element.extraAttributes.cols) == '4' && 'grid-cols-4',
          String(element.extraAttributes.cols) == '5' && 'grid-cols-5',
          String(element.extraAttributes.cols) == '6' && 'grid-cols-6',
          String(element.extraAttributes.cols) == '7' && 'grid-cols-7',
          String(element.extraAttributes.cols) == '8' && 'grid-cols-8',
          String(element.extraAttributes.cols) == '9' && 'grid-cols-9',
          String(element.extraAttributes.cols) == '10' && 'grid-cols-10',
          String(element.extraAttributes.cols) == '11' && 'grid-cols-11',
          String(element.extraAttributes.cols) == '12' && 'grid-cols-12'
        )}
        style={{
          ...element.extraAttributes,
          gap: element.extraAttributes['gap'] + 'rem',
          padding:
            element.extraAttributes['padding'] +
            element.extraAttributes['paddingUnit'],
          minHeight: element.extraAttributes['minHeight'] + 'rem',
        }}
      >
        {elements
          .filter((el) => el.parentId == element.id)
          .sort(
            (a: FormElementInstance, b: FormElementInstance) =>
              a.index - b.index
          )
          .map((element: FormElementInstance) => {
            const FormComponent = FormElements[element.type].formComponent
            return (
              <div
                className={cn(
                  'grid w-full',
                  String(element.extraAttributes.span) == '1' && 'col-span-1',
                  String(element.extraAttributes.span) == '2' && 'col-span-2',
                  String(element.extraAttributes.span) == '3' && 'col-span-3',
                  String(element.extraAttributes.span) == '4' && 'col-span-4',
                  String(element.extraAttributes.span) == '5' && 'col-span-5',
                  String(element.extraAttributes.span) == '6' && 'col-span-6',
                  String(element.extraAttributes.span) == '7' && 'col-span-7',
                  String(element.extraAttributes.span) == '8' && 'col-span-8',
                  String(element.extraAttributes.span) == '9' && 'col-span-9',
                  String(element.extraAttributes.span) == '10' && 'col-span-10',
                  String(element.extraAttributes.span) == '11' && 'col-span-11',
                  String(element.extraAttributes.span) == '12' && 'col-span-12',
                  String(element.extraAttributes.span) == 'full' &&
                  'col-span-full'
                )}
                key={element.id}
              >
                <FormComponent
                  key={element.id + element.parentId}
                  formController={formController}
                  elementInstance={element}
                />
                {/* <DesignerElementWrapper element={element} index={index} row={true} /> */}
              </div>
            )
          })}
      </div>
    </div>
  )
}

function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance
}) {
  const { elements, deleteElement, updateElement } = useDesigner()

  const element = elements.find(
    (el) => el.id == elementInstance.id
  ) as CustomInstance

  const mergedAttributes: any = {
    ...extraAttributes,
    ...Object.fromEntries(
      Object.entries(element.extraAttributes || {}).filter(
        ([key]: [string, unknown]) =>
          !(key in extraAttributes) || extraAttributes[key] === null
      )
    ),
  }

  const form = useForm<propertiesFormSchemaType>({
    mode: 'all',
    defaultValues: mergedAttributes,
  })

  console.log('lets see', { ...element.extraAttributes })

  // useEffect(() => {
  //   if (element) {
  //     form.reset(element.extraAttributes)
  //   }
  // }, [form, element])

  function applyChanges(values: any) {
    updateElement(element.id, {
      ...element,
      extraAttributes: { ...values },
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
        onChange={form.handleSubmit(applyChanges)}
        className="flex flex-col gap-2 space-y-3"
      >
        <Accordion
          type="multiple"
          defaultValue={['item-1', 'item-2']}
          className=""
        >
          <AccordionItem value="item-1">
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
                  <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    این عملیات قابل بازگشت نیست. پس از حذف، امکان ویرایش این فرم
                    وجود نخواهد داشت. <br />
                    <br />
                    <span className="font-medium">
                      با حذف این آیتم، تمام آیتم‌های فرزند آن نیز حذف خواهند شد.
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>لغو</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={false}
                    onClick={(e) => {
                      e.preventDefault()
                      deleteElement(element)
                    }}
                  >
                    حذف آیتم
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AccordionTrigger>اطلاعات</AccordionTrigger>
            <AccordionContent data-state={'open'}>
              <FormField
                control={form.control}
                name={'name'}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>نام</FormLabel>
                      <FormControl>
                        <Input value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription dir="ltr">
                        <span>{element?.id}</span>
                        <span> {element?.parentId}</span>
                      </FormDescription>
                      <FormDescription></FormDescription>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name={'title'}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>عنوان</FormLabel>
                      <FormControl>
                        <Input value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription dir="ltr">
                        <span>{element?.id}</span>
                        <span> {element?.parentId}</span>
                      </FormDescription>
                      <FormDescription></FormDescription>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="flex flex-col gap-2">
            <AccordionTrigger>چیدمان</AccordionTrigger>
            <AccordionContent className="">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name={'minHeight'}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>حداقل ارتفاع</FormLabel>
                        <FormControl>
                          <Input
                            onChange={field.onChange}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={'cols'}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>تعداد ستون‌ها</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
                <FormField
                  control={form.control}
                  name={'span'}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>گسترش</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
                <FormField
                  control={form.control}
                  name={'gap'}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>فاصله</FormLabel>
                        <FormControl>
                          <Input step={0.5} {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </div>
              <div className="mt-2 flex flex-row gap-1 p-1">
                <FormField
                  control={form.control}
                  name={'padding'}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="font-bold">پدینگ</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="rounded-none"
                            {...field}
                            onKeyDown={(e) => {
                              if (e.key == 'Enter') e.currentTarget.blur()
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
                <FormField
                  control={form.control}
                  name={'paddingUnit'}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="font-bold">واحد</FormLabel>
                        <Select
                          {...field}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="واحد" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rem">rem</SelectItem>
                            <SelectItem value="%">درصد</SelectItem>
                            <SelectItem value="px">پیکسل</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </Form>
  )
}
