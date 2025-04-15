import React from 'react'
import useDesigner from './hooks/useDesigner'
import { FormElements } from '../types/element-type'
import { Button } from './ui/button'
import { AiOutlineClose } from 'react-icons/ai'
import { Separator } from './ui/separator'

function PropertiesFormSidebar() {
  const { selectedElement, setSelectedElement } = useDesigner()
  if (!selectedElement) return null
  const PropertiesForm = FormElements[selectedElement?.type].propertiesComponent
  return (
    <div dir="rtl" className="mt-2 flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-foreground/70 flex h-8 items-center text-sm">
          Properties
        </p>
        <Button
          size={'icon'}
          variant={'ghost'}
          onClick={() => {
            setSelectedElement(null)
          }}
        >
          <AiOutlineClose />
        </Button>
      </div>
      <Separator className="mt-2 mb-2" />
      <PropertiesForm elementInstance={selectedElement} />
    </div>
  )
}

export default PropertiesFormSidebar
