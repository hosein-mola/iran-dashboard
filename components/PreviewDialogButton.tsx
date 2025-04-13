import React from 'react'
import { Button } from './ui/button'
import { MdPreview } from 'react-icons/md';
import useDesigner from './hooks/useDesigner';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog';
import { FormElementInstance } from './FormElement';
import { useTheme } from 'next-themes';
import FormSubmitComponent from './FormSubmitComponent';
import { string } from 'zod';

const PreviewDialogButton = () => {
    const { elements, pages } = useDesigner();
    const { theme, setTheme } = useTheme();

    type ExtendedFormElementInstance = Omit<FormElementInstance, 'page'> & {
        page: {
            id: string;
            extraAttributes: string;
        };
        components: FormElementInstance[];
    };

    const form: ExtendedFormElementInstance = {
        "id": "-1",
        "index": -1,
        "type": 'flex',
        "parentId": null,
        "components": elements,
        "extraAttributes": {},
        "page": {
            "id": "-1",
            "extraAttributes": JSON.stringify(pages),
        }
    };


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'outline'} className='gap-2'>
                    <MdPreview className='h-6 w-6' />
                    Preview
                </Button>
            </DialogTrigger>
            <DialogContent className=' w-screen h-screen z-[99999] max-h-screen max-w-full  flex flex-col  flex-grow p-0 gap-0'>
                <DialogTitle className='px-4 py-2 border-b'>
                    <p className='text-lg font-bold text-black'>
                        Form Preview
                    </p>
                    <p className='text-sm text-muted-foreground'>
                        this is will look liek to your users
                    </p>
                </DialogTitle>
                <FormSubmitComponent formId={0} form={form} type={"preview"} />

                {/* <div className={cn('bg-muted  bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)] nord:bg-[url(/paper-nord.svg)] flex flex-col flex-grow items-center justify-start p-4  overflow-y-auto', theme == 'nord' && 'bg-[url(/paper-dark.svg)]')}>
                    < div className='bg-background  h-screen max-w-[960px] w-full p-2 overflow-y-auto' >
                        {
                            elements.filter(_element => _element.parentId == null && _element.page == selectedPage.id).map(element => {
                                const FormComponent = FormElements[element.type].formComponent;
                                return <FormComponent key={element.id + element.parentId} elementInstance={element} />
                            })
                        }
                    </div>
                </div> */}
            </DialogContent >
        </Dialog >
    )
}

export default PreviewDialogButton