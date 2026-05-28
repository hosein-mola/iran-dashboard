import {
  GetFormById,
  RegisterFormVisit,
  ResolveFormInitialData,
} from '@/actions/form'
import FormSubmitComponent from '@/components/FormSubmitComponent'
import React from 'react'

async function SubmitPage(props: {
  params: Promise<{
    formId: string
  }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await props.params
  const searchParams = (await props.searchParams) ?? {}
  const form = await GetFormById(Number(params.formId))

  if (!form) {
    throw new Error('Form Not Found')
  }
  await RegisterFormVisit(params.formId)
  const initialData = await ResolveFormInitialData(
    Number(params.formId),
    searchParams
  )
  form.components = form.components.sort((a, b) => a.index - b.index)

  return (
    <FormSubmitComponent
      formId={Number(params.formId)}
      form={form}
      type={'submit'}
      initialData={initialData}
    />
  )
}

export default SubmitPage
