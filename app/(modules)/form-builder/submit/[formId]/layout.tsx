import DesignerContextProvider from '@/components/context/DesignerContext'
import React, { ReactNode } from 'react'

function layout({ children }: { children: ReactNode }) {
  return (
    <DesignerContextProvider>
      <main className="flex w-full flex-grow">{children}</main>
    </DesignerContextProvider>
  )
}

export default layout
