import React from 'react'
import useDesigner from './hooks/useDesigner'
import FormElementSidebar from './FormElementSidebar'
import PropertiesFormSidebar from './PropertiesFormSidebar'

function DesignerSidebar() {
  const { selectedElement } = useDesigner()

  return (
    <aside className="bg-background flex h-full w-[400px] max-w-[400px] flex-grow flex-col gap-2 overflow-y-auto border-l px-4">
      {!selectedElement && <FormElementSidebar />}
      {selectedElement && <PropertiesFormSidebar />}
    </aside>
  )
}

export default DesignerSidebar
