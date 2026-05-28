"use client"
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImShare } from 'react-icons/im';
import { toast } from './ui/use-toast';
import { useOrigin } from '@/lib/utils';

function FormLinkShare({ formId }: { formId: string }) {
    const [mounted, setMounted] = useState(false);
    const origin = useOrigin();
    const shareUrl = `${origin}/form-builder/submit/${formId}`;
    useEffect(() => {
        setMounted(true);
    }, [mounted])

    if (!mounted) return null;
    return <div className='flex flex-grow  gap-4 items-center'>
        <Input readOnly value={shareUrl} />
        <Button className='max-w-[250px]' onClick={() => {
            navigator.clipboard.writeText(shareUrl);
            toast({
                title: "Copied",
                description: "copied to clipboard"
            })
        }}>
            <ImShare className='mr-2 h-4 w-4' />
            Share Link
        </Button>
    </div>
}

export default FormLinkShare
