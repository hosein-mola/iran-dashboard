'use server'
import { PageType } from '@/components/context/DesignerContext'
import { FormElementInstance } from '../types/element-type'

import api from '@/api/apiConfig'
import prisma from '@/lib/prisma'
import { formSchemaType } from '@/schemas/form'
import { Form } from '@/prisma/client'

export async function GetFormStats() {
  const data = await api.v1.get('/forms/stats')

  const { visits, submissions, submissionsRate, bounceRate } =
    data.data.collection

  return {
    visits,
    submissions,
    submissionsRate,
    bounceRate,
  }
}

export async function CreateForm(data: formSchemaType) {
  const model = {
    name: data.name,
    description: data.description,
  }

  try {
    // Create a new Form in the database
    const newForm = await prisma.form.create({
      data: {
        userId: '1', // Required field (replace with user-specific input)
        name: model.name,
        description: model.description,
        context: '[]', // Default value from schema
      },
    })

    console.log('Form Created:', newForm)
    return newForm.id
  } catch (error) {
    console.error('Error creating form:', error)
  } finally {
    await prisma.$disconnect()
  }
}

export async function GetForms() {
  try {
    const forms: Form[] | undefined = await prisma.form.findMany() // Fetch all records from the `Form` table
    return forms
  } catch (error) {
    console.error('Error fetching forms:', error)
  } finally {
    await prisma.$disconnect() // Disconnect Prisma client
  }
}

export async function GetFormById(id: number) {
  try {
    const form = await prisma.form.findFirst({
      where: {
        id: id,
      },
    })

    if (form) {
      form.components = form?.components ? JSON.parse(form?.components) : []
      form.page = form?.page ? JSON.parse(form?.page) : []
    }

    return form
    const response = await api.v1.get(`/forms/${id}`)
    const { collection } = response.data
    console.log('🚀 ~ GetFormById ~ response:', response.data)
    return collection.form
  } catch (error) {}
}

export async function UpdateFormContent(
  id: number,
  components: FormElementInstance[], // Corrected spelling of 'components'
  pages: Array<PageType>
) {
  try {
    const updatedForm = await prisma.form.update({
      where: { id: id },
      data: {
        components: JSON.stringify(components), // Stringify components before updating
        page: JSON.stringify(pages), // Stringify pages before updating
        updatedAt: new Date(), // Optional: Update the timestamp
      },
    })

    return updatedForm
  } catch (error) {
    console.error('Error updating form:', error)
    throw new Error('Failed to update form')
  }
}

export async function PublishForm(formId: number) {
  try {
    const response = await api.v1.patch(`/forms/${String(formId)}/publish`, {
      method: 'PATCH',
    })
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export async function RenameForm(formId: number, name: string) {
  try {
    const response = await api.v1.patch(`/forms/${String(formId)}/rename`, {
      name,
    })
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export async function GetFormContentByUrl(formUrl: string) {
  return await prisma.form.update({
    select: {
      context: true,
    },
    data: {
      visit: {
        increment: 1,
      },
    },
    where: {
      sharedURL: formUrl,
    },
  })
}

export async function SubmitForm(formId: string, content: string) {
  const response = await api.v1.post(`/forms/submit`, {
    form_id: formId,
    data: content,
  })
  console.log('test', response.data)
  return response.data
}

export async function GetFormWithSubmissions(id: number) {
  const response = await api.v1.get(`/forms/${String(id)}/submissions`, {
    method: 'GET',
  })
  return response.data
}
