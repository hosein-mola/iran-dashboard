import { PageType } from '@/components/context/DesignerContext';
import { FormElementInstance } from './../components/FormElement';
"use server"

import api from '@/api/apiConfig';
import prisma from '@/lib/prisma'
import { formSchemaType, formSchemea } from '@/schemas/form';
import { userAgent } from 'next/server';

const user = {
    id: '1',
    username: 'test',
    email: 'test@mail.com',
    name: 'test',
};
export async function GetFormStats() {
    const data = await api.v1.get('/forms/stats');

    const {
        visits, submissions, submissionsRate, bounceRate
    } = data.data.collection;

    return {
        visits, submissions, submissionsRate, bounceRate
    }
}

export async function CreateForm(data: formSchemaType) {
    const model = {
        name: data.name,
        description: data.description
    }
    const response = await api.v1.post('/forms', { ...model });
    return response.data.collection.id
}

export async function GetForms() {
    const response = await api.v1.get('/forms');
    const { collection } = response.data;
    return collection.forms;
}

export async function GetFormById(id: number) {
    try {

        const response = await api.v1.get(`/forms/${id}`);
        const { collection } = response.data;
        return collection.form;
    } catch (error) {
    }

}

export async function UpdateFormContent(id: number, componenets: FormElementInstance[], pages: Array<PageType>) {
    const response = await api.v1.put(`/forms/${String(id)}`, { componenets: componenets, pages: pages }, { method: 'PUT' });
}

export async function PublishForm(formId: number) {
    try {
        const response = await api.v1.patch(`/forms/${String(formId)}/publish`, { method: 'PATCH' });
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export async function RenameForm(formId: number, name: string) {
    try {
        const response = await api.v1.patch(`/forms/${String(formId)}/rename`, { name });
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export async function GetFormContentByUrl(formUrl: string) {

    return await prisma.form.update({
        select: {
            context: true
        },
        data: {
            visit: {
                increment: 1
            }
        },
        where: {
            sharedURL: formUrl
        }
    })
}

export async function SubmitForm(formId: string, content: string) {
    const response = await api.v1.post(`/forms/submit`, {
        form_id: formId,
        data: content
    });
    console.log('test', response.data);
    return response.data;
}

export async function GetFormWithSubmissions(id: number) {
    const response = await api.v1.get(`/forms/${String(id)}/submissions`, { method: 'GET' });
    return response.data;
}