import React from 'react'
import SidebarBtnElement from './SidebarBtnElement'
import { FormElements } from './FormElement'
import useDesigner from './hooks/useDesigner'
import FormElementSidebar from './FormElementSidebar';
import PropertiesFormSidebar from './PropertiesFormSidebar';

function DesignerSidebar() {
    const { selectedElement } = useDesigner();

    return (
        <aside className='w-[400px] max-w-[400px] flex flex-col flex-grow gap-2  border-l  px-4 bg-background h-full overflow-y-auto'>
            {!selectedElement && <FormElementSidebar />}
            {selectedElement && <PropertiesFormSidebar />}
        </aside>
    )
}

export default DesignerSidebar