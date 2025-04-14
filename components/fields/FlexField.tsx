'use client'
import React, { useCallback, useEffect } from 'react'
import {
  ElementType,
  FormElement,
  FormElementInstance,
  FormElements,
  SubmitFunction,
} from '../FormElement'
import { Input } from '../ui/input'
import { useForm, useWatch } from 'react-hook-form'
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
import { z } from 'zod'

const type: ElementType = 'flex'

const extraAttributes = {
  id: '',
  title: 'title field',
  flex: 1,
  minHeight: '5',
  alignSelf: 'stretch',
  flexWrap: 'no-wrap',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'stretch',
  alignContent: 'stretch',
  state: [],
  border: '0.05rem solid hsl(var(--border)',
  padding: '0.5',
  paddingUnit: 'rem',
  gap: '0',
}

const propertiesSchema = z.record(z.string(), z.string().optional())

export const FlexFieldElement: FormElement = {
  type,
  construct: (
    id: string,
    index: number,
    parentId: string | null,
    page: string,
    _extraAttributes?: Record<string, any>
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
    label: 'Flex field',
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
  const { elements } = useDesigner()
  const droppble = useDroppable({
    id: elementInstance.id + '-flex',
    data: {
      type: 'flex',
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
      className={cn('flex')}
      style={{
        ...elementInstance.extraAttributes,
        gap: elementInstance.extraAttributes['gap'] + 'rem',
        minHeight: elementInstance.extraAttributes['minHeight'] + 'rem',
        padding:
          elementInstance.extraAttributes['padding'] +
          elementInstance.extraAttributes['paddingUnit'],
      }}
    >
      {elements
        .filter((el) => el.parentId == element.id)
        .sort(
          (a: FormElementInstance, b: FormElementInstance) => a.index - b.index
        )
        .map((_element, index) => {
          return (
            <DesignerElementWrapper
              key={element.id}
              element={_element}
              index={index}
              row={
                element.extraAttributes['flexDirection'] == 'row' ? true : false
              }
            />
          )
        })}
    </div>
  )
}

function FormComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance
  isInvalid?: boolean
  submitValue?: SubmitFunction
  defaultValue?: string
}) {
  const { elements } = useDesigner()

  const element = elementInstance as CustomInstance

  return (
    <div
      dir="rtl"
      className={cn('flex')}
      style={{
        ...elementInstance.extraAttributes,
        gap: elementInstance.extraAttributes['gap'] + 'rem',
        minHeight: elementInstance.extraAttributes['minHeight'] + 'rem',
        padding:
          elementInstance.extraAttributes['padding'] +
          elementInstance.extraAttributes['paddingUnit'],
      }}
    >
      {elements
        .filter((el) => el.parentId == element.id)
        .sort(
          (a: FormElementInstance, b: FormElementInstance) => a.index - b.index
        )
        .map((element: FormElementInstance, index) => {
          const FormElementInstance: any =
            FormElements[element.type].formComponent
          return (
            <>
              {
                <FormElementInstance
                  key={element.id}
                  elementInstance={element}
                />
              }
            </>
          )
        })}
    </div>
  )
}

function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance
}) {
  const { updateElement } = useDesigner()
  const element = elementInstance as CustomInstance

  const form = useForm<any>({
    mode: 'all',
    defaultValues: {
      ...element.extraAttributes,
    },
  })

  useEffect(() => {
    if (element) {
      form.reset(element.extraAttributes)
    }
  }, [element, form, element.extraAttributes])

  const formData = useWatch({ control: form.control })
  const applyChanges = useCallback(
    (values: any) => {
      values.id = element.id
      updateElement(element.id, {
        ...element,
        extraAttributes: { ...values },
      })
    },
    [element, updateElement]
  )

  React.useEffect(() => {
    formData.id = element.id
    applyChanges(formData)
  }, [formData, element.id, applyChanges])

  return (
    <Form {...form}>
      <form className="flex flex-col gap-2 space-y-3">
        <Accordion
          type="multiple"
          defaultValue={['item-1', 'item-2']}
          className=""
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Info</AccordionTrigger>
            <AccordionContent data-state={'open'}>
              <FormField
                control={form.control}
                name={'title'}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>test</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onKeyDown={(e) => {
                            if (e.key == 'Enter') e.currentTarget.blur()
                          }}
                        />
                      </FormControl>
                      <FormDescription>id: {element.id}</FormDescription>
                      <FormDescription></FormDescription>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="flex flex-col gap-2">
            <AccordionTrigger>Layout</AccordionTrigger>
            <AccordionContent className="">
              <div className="mt-2 flex flex-row gap-1 p-1">
                <FormField
                  control={form.control}
                  name={'flex'}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="font-bold">flex</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="rounded-none"
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
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={'gap'}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Gap</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
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
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={'minHeight'}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>minHeight</FormLabel>
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
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={'minHeight'}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>minHeight</FormLabel>
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
              <div className="mt-2 flex flex-row gap-1 p-1">
                <FormField
                  control={form.control}
                  name={'padding'}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="font-bold">Padding</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="rounded-none"
                            onChange={field.onChange}
                            value={field.value}
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
                        <FormLabel className="font-bold">Unit</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rem">rem</SelectItem>
                            <SelectItem value="%">precent</SelectItem>
                            <SelectItem value="px">pixel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </div>
              <FormField
                control={form.control}
                name={'flexDirection'}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="font-bold">direction</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="column">col</SelectItem>
                          <SelectItem value="row">row</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name={'flexWrap'}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="font-bold">flexWrap</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-wrap">no wrap</SelectItem>
                          <SelectItem value="wrap">wrap</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name={'justifyContent'}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="font-bold">
                        justifyContent
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flex-start">start</SelectItem>
                          <SelectItem value="flex-end">end</SelectItem>
                          <SelectItem value="center">center</SelectItem>
                          <SelectItem value="space-around">
                            space-around
                          </SelectItem>
                          <SelectItem value="space-between">
                            space-between
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name={'alignItems'}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="font-bold">alignItems</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="alignItems" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flex-start">start</SelectItem>
                          <SelectItem value="flex-end">end</SelectItem>
                          <SelectItem value="center">center</SelectItem>
                          <SelectItem value="stretch">stretch</SelectItem>
                          <SelectItem value="baseline">baseline</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name={'alignContent'}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="font-bold">alignContent</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flex-start">start</SelectItem>
                          <SelectItem value="flex-end">end</SelectItem>
                          <SelectItem value="center">center</SelectItem>
                          <SelectItem value="stretch">stretch</SelectItem>
                          <SelectItem value="baseline">baseline</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name={'flexGrow'}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="font-bold">grow</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">grow</SelectItem>
                          <SelectItem value="0">not-grow</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormField
                control={form.control}
                name={'alignSelf'}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="font-bold">alignSelf</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="alignSelf" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flex-start">start</SelectItem>
                          <SelectItem value="flex-end">end</SelectItem>
                          <SelectItem value="center">center</SelectItem>
                          <SelectItem value="stretch">stretch</SelectItem>
                          <SelectItem value="baseline">baseline</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </Form>
  )
}
