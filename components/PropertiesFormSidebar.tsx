import React from 'react'
import useDesigner from './hooks/useDesigner'
import { FormElements } from './FormElement';
import { Button } from './ui/button';
import { AiOutlineClose } from 'react-icons/ai';
import { Separator } from './ui/separator';

function PropertiesFormSidebar() {
    const { selectedElement, setSelectedElement } = useDesigner();
    if (!selectedElement) return null;
    const PropertiesForm = FormElements[selectedElement?.type].propertiesComponent;
    return (
        <div dir='rtl' className='flex flex-col mt-2'>
            <div className='flex justify-between items-center'>
                <p className='text-sm h-8 items-center flex text-foreground/70'>Properties</p>
                <Button size={'icon'} variant={'ghost'} onClick={() => {
                    setSelectedElement(null);
                }}>
                    <AiOutlineClose />
                </Button>
            </div>
            <Separator className='mt-2 mb-2' />
            <PropertiesForm elementInstance={selectedElement} />
        </div>
    )
}

export default PropertiesFormSidebar