"use client"
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';

function VisitBtn({ formId }: { formId: string }) {
    const [mounted, setMounted] = useState(false);
    const shareLink = `/form-builder/submit/${formId}`;

    useEffect(() => {
        setMounted(true);
    }, [])

    if (!mounted) return null;
    return <Button className='w-[200px]' onClick={() => {
        window?.open(shareLink, '_blank');
    }}>
        Visit Link
    </Button>
}

export default VisitBtn
