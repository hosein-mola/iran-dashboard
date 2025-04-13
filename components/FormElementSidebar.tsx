import React from 'react'
import SidebarBtnElement from './SidebarBtnElement'
import { FormElements } from './FormElement'
import { Separator } from './ui/separator'

function FormElementSidebar() {
    return (
        <div dir='rtl' className=' flex flex-col mt-2'>
            <div className='text-sm h-8 items-center flex text-foreground/70 '>Elements</div>
            <Separator className='mt-2' />
            <div dir='rtl' className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-2  place-items-center'>
                <SidebarBtnElement formElement={FormElements.text} />
                <SidebarBtnElement formElement={FormElements.panel} />
                <SidebarBtnElement formElement={FormElements.flex} />
            </div>
        </div >
    )
}

export default FormElementSidebar