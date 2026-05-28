import { GetFormById, RegisterFormVisit } from '@/actions/form'
import FormSubmitComponent from '@/components/FormSubmitComponent'
import React from 'react'

async function SubmitPage(props: {
  params: Promise<{
    formId: string
  }>
}) {
  const params = await props.params
  const form = await GetFormById(Number(params.formId))

  if (!form) {
    throw new Error('Form Not Found')
  }
  await RegisterFormVisit(params.formId)
  form.components = form.components.sort((a, b) => a.index - b.index)

  return (
    <FormSubmitComponent
      formId={Number(params.formId)}
      form={form}
      type={'submit'}
    />
  )
}

export default SubmitPage
