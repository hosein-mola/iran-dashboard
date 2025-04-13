"use client"

import React, { forwardRef, useEffect, useRef, useState, type JSX } from 'react';

import { ElementType, FormComponentType, FormElement, FormElementInstance, SubmitFunction } from '../FormElement'
import { MdTextFields } from 'react-icons/md';
import { Label } from '@radix-ui/react-label';
import { Input } from '../ui/input';
import { boolean, z } from 'zod';
import { Controller, FieldValues, useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IMaskInput, IMask } from 'react-imask';
import { CaretSortIcon, CheckIcon, PlayIcon } from "@radix-ui/react-icons"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '../ui/form';
import { Switch } from '../ui/switch';
import useDesigner from '../hooks/useDesigner';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { InputMask } from 'imask';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { FaTrash } from 'react-icons/fa';
import { PageType } from '../context/DesignerContext';
import { evaluate, log } from 'mathjs';
import { BiMath, BiPlusCircle } from 'react-icons/bi';
import { VscJson } from 'react-icons/vsc';
import { TbMath, TbTrash } from 'react-icons/tb';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ulid } from 'ulid';
import { LuDelete } from 'react-icons/lu';
import FormSubmitComponent from '../FormSubmitComponent';
import { IoSave } from 'react-icons/io5';

const type: ElementType = "text";

const extraAttributes = {
    type: "number",
    title: 'Text',
    id: '',
    label: "TextFiel",
    helperText: "HelperText",
    required: false,
    placeholder: "Value here...",
    mask: "Number",
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
    formula: "",
    destination: ""
}

const propertiesSchema = z.object({
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
    formula: z.string(),
    destination: z.string()
});

export const TextFieldFormElement: FormElement = {
    type,
    construct: (id: string, index: number, parentId: string | null, page: string) => {
        extraAttributes.id = id;
        return ({
            id,
            index,
            type,
            page,
            parentId,
            extraAttributes,
        })
    },
    designerBtnElement: {
        icon: MdTextFields,
        label: 'Text Field'
    },
    designerComponent: DesignerComponent,
    formComponent: FormComponent,
    propertiesComponent: PropertiesComponent,
    validate: (formInstance: FormElementInstance, current: string): boolean => {
        const element = formInstance as CustomInstance;
        if (element.extraAttributes.require) {
            return current.length > 0;
        }
        return true;
    }
}

type CustomInstance = FormElementInstance & {
    extraAttributes: typeof extraAttributes
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;
function DesignerComponent({ elementInstance, }: { elementInstance: FormElementInstance }) {
    const { elements, selectedElement, setSelectedElement } = useDesigner();
    const element = elementInstance as CustomInstance;
    const { label, require, placeholder, helperText } = element.extraAttributes;

    return <>
        <div
            key={element.id + "id"}
            className={cn("flex hover:!cursor-pointer p-2 flex-col gap-2 min-w-full bg-background")}
        >
            <Label className='hover:!cursor-pointer '>
                {label}
                {require && '*'}
            </Label>
            <Input className='mt-2 hover:!cursor-pointer  ' readOnly placeholder={placeholder} />
            {helperText && <p className='text-muted-foreground hover:!cursor-pointer text-[0.8rem] mt-2'>{helperText}</p>}
        </div>
    </>
}
function FormComponent({
    elementInstance,
    defaultValue,
    formController,
    isInvalid }: FormComponentType): JSX.Element {
    const element = elementInstance as CustomInstance;
    const { label, require, placeholder, helperText } = element.extraAttributes;
    const [value, setValue] = useState(defaultValue || "");
    const [error, setError] = useState(false);
    const ref = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setError(isInvalid == true);
    }, [isInvalid])

    return <div className={cn('flex flex-col gap-2 w-full', "")}>
        <Label className={cn(error && "text-red-500")}>
            {label}
            {require && '*'}
        </Label>
        <MaskInputGenerator element={element} formController={formController} ref={ref} inputRef={inputRef} error={error} />
        {helperText && <p className={cn('text-muted-foreground text-[0.8rem] mt-2', error && "text-red-500")}>{helperText}</p>}
    </div>
}
function PropertiesComponent({
    elementInstance
}: { elementInstance: FormElementInstance }) {
    const { updateElement, deleteElement, elements, pages } = useDesigner();
    const element = elementInstance as CustomInstance;
    const form = useForm<propertiesFormSchemaType>({
        resolver: zodResolver(propertiesSchema),
        mode: "all",
        defaultValues: { ...element.extraAttributes }
    });

    const [formulaList, setFormulaList] = useState<Array<{ id: string, data: string }>>([]);
    const [evaluateResultArray, setEvaluateResultArray] = useState<Array<any>>([]);
    const [data, setData] = useState<any>({});
    const updatedtype = form.watch('type');

    useEffect(() => {
        if (element) {
            form.reset(element.extraAttributes);
        }
    }, [element, form])

    function applyChanges(values: propertiesFormSchemaType) {
        updateElement(element.id, {
            ...element,
            extraAttributes: { ...values }
        });
    }

    let form_sample: FormElementInstance & { page: { id: string; extraAttributes: string }, components: FormElementInstance[] } = {
        id: '-1',
        index: -1,
        parentId: null,
        extraAttributes: {},
        type: "text",
        page: '{ "id": "-1", "extraAttributes": ' + JSON.stringify(pages) + ' }' as string & { id: string; extraAttributes: string },
        components: elements.sort((a, b) => a.index - b.index),
    };

    return <Form  {...form}>
        <form onChange={form.handleSubmit(applyChanges)} className='space-y-3'>
            <div className='flex flex-wrap w-full h-12 items-center'>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant={'outline'} className="gap-2  text-muted-foreground">
                            <FaTrash className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. After deleting you will not be able to edit this form. <br />
                                <br />
                                <span className="font-medium">
                                    By Deleting this item all items children would be deleted as well.
                                </span>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                disabled={false}
                                onClick={(e) => {
                                    e.preventDefault();
                                    deleteElement(element);
                                }}
                            >
                                Delete Item
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant={'outline'} className='gap-2'>
                            <BiMath className='h-6 w-6' />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className=' w-screen h-screen p-8 z-[99999] bg-accent max-h-screen max-w-full  flex flex-col items-center  flex-grow  gap-0'>
                        <DialogTitle className='px-4 py-2 m-0 border-b w-full bg-background'>
                            <p className='text-lg font-bold '>
                                Formula Editor
                            </p>
                            <div className='flex h-12 items-center gap-2'>
                                <Button className='text-sm ' onClick={() => setFormulaList(prev => [...prev, { id: ulid(4), data: '' }])}>
                                    <BiPlusCircle className='h-6 w-6' />
                                </Button>
                                <Button variant={'secondary'} className='text-sm ' onClick={() => {
                                    console.log(data.getValues());
                                    const result = evaluate(formulaList.map(f => f.data), data.getValues());
                                    setEvaluateResultArray(result);
                                }}>
                                    <PlayIcon className='h-6 w-6' />
                                </Button>
                                <Button variant={'secondary'} className='text-sm ' onClick={() => {
                                    console.log(data.getValues());
                                    const result = evaluate(formulaList.map(f => f.data), data.getValues());
                                    setEvaluateResultArray(result);
                                }}>
                                    <IoSave className='h-6 w-6' />
                                </Button>
                            </div>
                        </DialogTitle>
                        <div className='flex  overflow-auto flex-grow w-full flex-row mt-2 px-4 py-2 shadow-2xl items-start bg-background'>
                            <div className='w-6/12 flex flex-col'>
                                {formulaList.map((formula: { id: string, data: string }, index: number) => {
                                    return <div key={formula.id} className='h-12 px-4 py-2 border-b gap-2 flex flex-row w-full items-center justify-between'>
                                        <div className='flex flex-row items-center gap-2 w-8/12 h-12'>
                                            <Button
                                                onClick={() => setFormulaList((prev) =>
                                                    prev.filter((item) => item.id !== formula.id)
                                                )}
                                                variant={"outline"}
                                                className='w-auto rounded-full'>
                                                <TbTrash className='w-3 h-3' />
                                            </Button>
                                            <span className='w-2/12 text-center'>{'STEP' + ' ' + Number(index) + 1}</span>
                                            <Input
                                                className='w-8/12'
                                                onChange={(e) => {
                                                    setFormulaList((prev) =>
                                                        prev.map((item: { id: string, data: string }) =>
                                                            item.id === formula.id ? { ...item, data: e?.target.value } : item
                                                        )
                                                    )
                                                }} key={formula.id} />
                                        </div>
                                        <div className='w-2/12 text-foreground/70'>{'//' + ' ' + (evaluateResultArray[index] == undefined ? '?' : evaluateResultArray[index])}</div>
                                    </div>
                                })}
                            </div>
                            <div className='w-6/12 border'>
                                <FormSubmitComponent formId={0} form={form_sample} type={"preview"} setData={setData} />
                            </div>
                        </div>
                    </DialogContent >
                </Dialog >
            </div>
            <FormField control={form.control} name={'title'} render={({ field }) => {
                return <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input
                            onChange={field.onChange}
                            value={field.value}
                        />
                    </FormControl>
                    <FormDescription className='flex flex-col' dir='ltr'>
                        <span> {element?.parentId == null ? 'body' : element.parentId}</span>
                        <span>{element?.id}</span>
                    </FormDescription>
                    <FormMessage />
                </FormItem>;
            }} />
            <FormField control={form.control} name={'label'} render={({ field }) => {
                return <FormItem>
                    <FormLabel>label</FormLabel>
                    <FormControl>
                        <Input
                            value={field.value}
                            onChange={field.onChange}
                        />
                    </FormControl>
                    <FormDescription>
                        label of the field <br />will be displayed above the filed
                    </FormDescription>
                    <FormDescription>
                    </FormDescription>
                    <FormMessage />
                </FormItem>;
            }} />
            <FormField control={form.control} name={'placeholder'} render={({ field }) => {
                return <FormItem>
                    <FormLabel>placeHolder</FormLabel>
                    <FormControl>
                        <Input
                            onChange={field.onChange}
                            value={field.value}
                        />
                    </FormControl>
                    <FormDescription>
                        the placeHolder of the field
                    </FormDescription>
                    <FormMessage />
                </FormItem>;
            }} />
            <FormField control={form.control} name={'helperText'} render={({ field }) => {
                return <FormItem>
                    <FormLabel>helper text</FormLabel>
                    <FormControl>
                        <Input
                            onChange={field.onChange}
                            value={field.value}
                        />
                    </FormControl>
                    <FormDescription>
                        helper text
                    </FormDescription>
                    <FormMessage />
                </FormItem>;
            }} />
            <FormField control={form.control} name={'required'} render={({ field }) => {
                return <FormItem className='flex items-center justify-between rounded-lg border p-3 shadow-sm'>
                    <div className='space-y-0.5'>
                        <FormLabel>Required</FormLabel>
                        <FormDescription>
                            Required
                        </FormDescription>
                    </div>
                    <FormControl dir='ltr'>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                </FormItem>;
            }} />
            <FormField control={form.control} name={'type'} render={({ field }) => {
                return <FormItem className='flex flex-row justify-between gap-2 items-center '>
                    <FormLabel>type</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={element.extraAttributes.type} value={field.value}>
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
                </FormItem>;
            }} />

            {updatedtype == "number" && <div>
                <FormField control={form.control} name={'padFractionalZeros'} render={({ field }) => {
                    return <FormItem className='flex items-center justify-between rounded-lg border p-3 shadow-sm'>
                        <div className='space-y-0.5'>
                            <FormLabel>padFractionalZeros</FormLabel>
                            <FormDescription>
                                padFractionalZeros
                            </FormDescription>
                        </div>
                        <FormControl dir='ltr'>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>;
                }} />
                <FormField control={form.control} name={'normalizeZeros'} render={({ field }) => {
                    return <FormItem className='flex items-center justify-between mt-2 rounded-lg border p-3 shadow-sm'>
                        <div className='space-y-0.5'>
                            <FormLabel>normalizeZeros</FormLabel>
                            <FormDescription>
                                normalizeZeros
                            </FormDescription>
                        </div>
                        <FormControl dir='ltr'>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>;
                }} />
                <FormField control={form.control} name={'lazy'} render={({ field }) => {
                    return <FormItem className='flex items-center mt-2 justify-between rounded-lg border p-3 shadow-sm'>
                        <div className='space-y-0.5'>
                            <FormLabel>lazy</FormLabel>
                            <FormDescription>
                                lazy
                            </FormDescription>
                        </div>
                        <FormControl dir='ltr'>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>;
                }} />
                <FormField control={form.control} name={'disabled'} render={({ field }) => {
                    return <FormItem className='flex items-center mt-2 justify-between rounded-lg border p-3 shadow-sm'>
                        <div className='space-y-0.5'>
                            <FormLabel>disabled</FormLabel>
                            <FormDescription>
                                disabled
                            </FormDescription>
                        </div>
                        <FormControl dir='ltr'>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>;
                }} />
                <FormField control={form.control} name={'radix'} render={({ field }) => {
                    return <FormItem>
                        <FormLabel>redix</FormLabel>
                        <FormControl>
                            <Input
                                dir='ltr'
                                value={field.value}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>;
                }} />
                <FormField control={form.control} name={'thousandsSeparator'} render={({ field }) => {
                    return <FormItem>
                        <FormLabel>thousandsSeparator</FormLabel>
                        <FormControl>
                            <Input
                                dir='ltr'
                                value={field.value}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>;
                }} />

                <FormField control={form.control} name={'scale'} render={({ field }) => {
                    return <FormItem>
                        <FormLabel>scale</FormLabel>
                        <FormControl>
                            <Input
                                dir='ltr'
                                value={field.value}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>;
                }} />
                <FormField control={form.control} name={'minLength'} render={({ field }) => {
                    return <FormItem>
                        <FormLabel>minLength</FormLabel>
                        <FormControl>
                            <Input
                                dir='ltr'
                                value={field.value}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>;
                }} />
                <FormField control={form.control} name={'maxLength'} render={({ field }) => {
                    return <FormItem>
                        <FormLabel>MaxLength</FormLabel>
                        <FormControl>
                            <Input
                                dir='ltr'
                                value={field.value}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>;
                }} />
                <FormField control={form.control} name={'min'} render={({ field }) => {
                    return <FormItem>
                        <FormLabel>min</FormLabel>
                        <FormControl>
                            <Input
                                dir='ltr'
                                value={field.value}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>;
                }} />
                <FormField control={form.control} name={'max'} render={({ field }) => {
                    return <FormItem>
                        <FormLabel>max</FormLabel>
                        <FormControl>
                            <Input
                                dir='ltr'
                                value={field.value}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>;
                }} />
                <FormField control={form.control} name={'formula'} render={({ field }) => {
                    return <FormItem>
                        <FormLabel>formula</FormLabel>
                        <FormControl>
                            <Input
                                dir='ltr'
                                value={field.value}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>;
                }} />
                <FormField control={form.control} name={'destination'} render={({ field }) => {
                    return <FormItem>
                        <FormLabel>destination</FormLabel>
                        <FormControl>
                            <Input
                                dir='ltr'
                                value={field.value}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>;
                }} />
            </div>}
        </form>
    </Form>
}
export const MaskInputGenerator = forwardRef((props: any, ref) => {
    const { element, formController, inputRef, error } = props;

    if (element.extraAttributes.type === 'number') {
        return (
            <Controller
                key={element.extraAttributes.title}
                control={formController.control}
                name={element.extraAttributes.title}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <IMaskInput
                        autoFocus={false}
                        inputRef={inputRef}
                        value={String(value)}
                        dir='ltr'
                        className={cn(
                            "flex h-9 w-full rounded-none border border-input bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                            error && "text-red-500 border-red-500"
                        )}
                        mask={Number}
                        thousandsSeparator={element.extraAttributes.thousandsSeparator}
                        min={Number(element.extraAttributes.min)}
                        minLength={Number(element.extraAttributes.minLength)}
                        max={Number(element.extraAttributes.max)}
                        maxLength={Number(element.extraAttributes.maxLength)}
                        scale={Number(element.extraAttributes.scale)}
                        radix={String(element.extraAttributes.radix)}
                        padFractionalZeros={Boolean(element.extraAttributes.padFractionalZeros)}
                        normalizeZeros={Boolean(element.extraAttributes.normalizeZeros)}
                        disabled={element.extraAttributes.disabled}
                        lazy={Boolean(element.extraAttributes.lazy)}
                        overwrite={'shift'}
                        placeholder={element.extraAttributes.placeholder}
                        placeholderChar={'#'}
                        mapToRadix={['.', '-']}
                        onAccept={(value, mask) => {
                            if (value === undefined) {
                                console.warn('Value is undefined');
                            }
                            console.log('run', element.extraAttributes.title);

                            onChange(value);
                        }}
                        data-id={element.id}
                    />
                )}
            />
        );
    }
    if (element.extraAttributes.type === 'pattern') {
        return 'format';
    }
});

// Add a display name to the component
MaskInputGenerator.displayName = 'MaskInputGenerator';