import { GetFormById, GetFormSetupOptions } from '@/actions/form'
import FormBuilder from '@/components/FormBuilder'
import React from 'react'

async function BuilderPage(
    props: {
        params: Promise<{ id: string }>
    }
) {
    const params = await props.params;
    const [form, setupOptions] = await Promise.all([
        GetFormById(Number(params.id)),
        GetFormSetupOptions(),
    ]);

    if (!form) {
        throw new Error('form not found');
    }

    return <FormBuilder form={form} setupOptions={setupOptions} />
}

export default BuilderPage
