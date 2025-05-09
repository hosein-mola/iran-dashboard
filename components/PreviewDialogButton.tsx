'use client'

import React from 'react'
import { Button } from './ui/button'
import { MdPreview } from 'react-icons/md'
import useDesigner from './hooks/useDesigner'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog'
import { FormElementInstance } from '../types/element-type'
import FormSubmitComponent from './FormSubmitComponent'

const PreviewDialogButton = () => {
  const { elements, pages, setSelectedPage, selectedPage } = useDesigner()

  // Deep clone to avoid mutations
  const clonedElements = structuredClone(elements)
  const clonedPages = structuredClone(pages)
  // Filter elements that belong to the selected page
  const pageElements = clonedElements.filter(
    (el) => el.page === selectedPage.id
  )

  // Extend FormElementInstance to include full page info and components
  type ExtendedFormElementInstance = Omit<FormElementInstance, 'page'> & {
    page: {
      id: string
      extraAttributes: string
    }
    components: FormElementInstance[]
  }

  // Create the form structure based on selected page
  const form: ExtendedFormElementInstance = {
    id: '-1',
    index: -1,
    type: 'flex',
    parentId: null,
    components: pageElements,
    extraAttributes: {},
    page: {
      id: selectedPage?.id || '-1',
      extraAttributes: JSON.stringify(selectedPage),
    },
  }

  // Track the current page index for multi-step navigation
  const [currentPageIndex, setCurrentPageIndex] = React.useState(
    pages.findIndex((page) => page.id === selectedPage.id)
  )

  // Handle next and previous page navigation
  const handleNext = () => {
    if (currentPageIndex < clonedPages.length - 1) {
      const nextPage = clonedPages[currentPageIndex + 1]
      setCurrentPageIndex(currentPageIndex + 1)
      setSelectedPage(nextPage)
    }
  }

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      const previousPage = clonedPages[currentPageIndex - 1]
      setCurrentPageIndex(currentPageIndex - 1)
      setSelectedPage(previousPage)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'outline'} className="gap-2">
          <MdPreview className="h-6 w-6" />
          پیش‌نمایش
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[80vh] w-full flex-col items-start justify-start overflow-scroll lg:max-h-full lg:max-w-8/12">
        <DialogTitle className="w-full border-b px-4 py-2">
          <p className="text-lg font-bold text-black">پیش‌نمایش فرم</p>
          <p className="text-muted-foreground text-sm">
            پیش‌نمایش فرم با داده های
          </p>
        </DialogTitle>
        {/* Page navigation */}
        <div className="flex w-full items-center justify-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentPageIndex === 0}
            className="ml-6 h-10"
          >
            قبلی
          </Button>

          <div className="flex gap-4">
            {clonedPages.map((page, index) => (
              <div
                className="flex flex-col items-center justify-center gap-2"
                key={page.id}
              >
                <Button
                  variant={page.id === selectedPage.id ? 'default' : 'outline'}
                  key={page.id}
                  className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-center text-sm font-semibold`} // Explicit width and height for a circle
                  onClick={() => {
                    setCurrentPageIndex(index)
                    setSelectedPage(page)
                  }}
                >
                  {index + 1}
                </Button>
                <span className="mt-2 w-full text-xs">{page.name}</span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentPageIndex === clonedPages.length - 1}
            className="mr-6 h-10"
          >
            بعدی
          </Button>
        </div>

        {/* Render selected page preview */}
        <FormSubmitComponent formId={0} form={form} type={'preview'} />
      </DialogContent>
    </Dialog>
  )
}

export default PreviewDialogButton
