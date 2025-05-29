'use client'
import { GetFormById } from '@/actions/form'
import {  FormElementInstance } from '@/types/element-type'
import FormSubmitComponent from '@/components/FormSubmitComponent'
import React from 'react'

async function SubmitPage(props: {
  params: Promise<{
    formId: number
  }>
}) {
  const params = await props.params
  let form: FormElementInstance & {
    page: { id: string; extraAttributes: string }
    components: FormElementInstance[]
  } = await GetFormById(params.formId)

  form = {
    ...form,
    components: form.components.sort((a, b) => a.index - b.index),
  }
  if (!form) {
    throw new Error('Form Not Found')
  }
  return (
    <FormSubmitComponent formId={params.formId} form={form} type={'submit'} />
  )
}

export default SubmitPage
