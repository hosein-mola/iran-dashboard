import React from 'react'
import SidebarBtnElement from './SidebarBtnElement'
import { FormElements } from '../types/element-type'
import { Separator } from './ui/separator'

function FormElementSidebar() {
  return (
    <div dir="rtl" className="mt-2 flex flex-col">
      <div className="text-foreground/70 flex h-8 items-center text-sm">
        Elements
      </div>
      <Separator className="mt-2" />
      <div
        dir="rtl"
        className="mt-2 grid grid-cols-1 place-items-center gap-2 md:grid-cols-2"
      >
        <SidebarBtnElement formElement={FormElements.text} />
        <SidebarBtnElement formElement={FormElements.panel} />
        <SidebarBtnElement formElement={FormElements.flex} />
      </div>
    </div>
  )
}

export default FormElementSidebar
