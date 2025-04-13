"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from './ui/form'
import { BsFileEarmarkPlus } from 'react-icons/bs';
import { ImSpinner } from 'react-icons/im';
import { Button } from './ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from './ui/use-toast';
import { formSchemaType, formSchemea } from '@/schemas/form';
import { CreateForm } from '@/actions/form';
import { cn } from '@/lib/utils';
import { ToastAction } from '@radix-ui/react-toast';
import { useRouter } from 'next/navigation';


function CreateFormButton() {
    const router = useRouter();

    const form = useForm<formSchemaType>({
        resolver: zodResolver(formSchemea)
    });
    async function onSubmit(values: formSchemaType) {
        try {
            const formId = await CreateForm(values);
            router.push(`builder/${formId}`);
            toast({
                className: cn(
                    'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
                ),
                title: "Success",
                description: "Form created successfully"
            })
        } catch (error) {
            toast({
                title: "Error",
                className: cn(
                    'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
                ),
                variant: 'destructive',
                description: 'There was a problem with your request.',
                action: <ToastAction altText="Try again">Try again</ToastAction>
            })
        }
    }

    return <Dialog >
        <DialogTrigger asChild>
            <Button variant={'outline'} className='group   border bg-background border-primary/20 h-auto items-center justify-center flex flex-col hover:border-primary hover:cursor-pointer border-dashed gap-4'>
                <BsFileEarmarkPlus className='w-8 h-8 text-muted-foreground group-hover:text-primary' />
                <p className='font-bold text-muted-foreground group-hover:text-primary'>Create new form</p>
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Create form
                </DialogTitle>
                <DialogDescription>
                    Create a new form to start collecting
                </DialogDescription>
            </DialogHeader>
            <Form {...form} >
                <form onSubmit={form.handleSubmit(onSubmit)} className={'space-y-2'}>
                    <FormField
                        control={form.control}
                        name={'name'}
                        render={({ field }) => {
                            return <FormItem >
                                <FormLabel>Name:</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        }}
                    />
                    <FormField
                        control={form.control}
                        name={'description'}
                        render={({ field }) => {
                            return <FormItem >
                                <FormLabel>Description:</FormLabel>
                                <FormControl>
                                    <Textarea rows={5} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        }}
                    />
                </form>
            </Form>
            <DialogFooter>
                <Button
                    onClick={
                        form.handleSubmit(onSubmit)
                    }
                    disabled={form.formState.isSubmitting} className='w-full mt-4' >
                    {!form.formState.isSubmitting && <span>Save</span>}
                    {form.formState.isSubmitting && <ImSpinner className='animate-spin' />}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

export default CreateFormButton