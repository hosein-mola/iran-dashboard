import DesignerContextProvider from '@/components/context/DesignerContext'
import React, { ReactNode } from 'react'

function layout({ children }: { children: ReactNode }) {
  return (
    <DesignerContextProvider>
      <div className="mx-auto flex h-full w-full flex-grow" dir="ltr">
        {children}
      </div>
    </DesignerContextProvider>
  )
}

export default layout
