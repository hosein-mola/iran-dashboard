import Logo from '@/components/Logo'
import { Progress } from '@/components/ui/progress'
import React from 'react'
import { ImSpinner } from 'react-icons/im'

function Loading() {
    return (
        <div className='flex flex-col items-center justify-center w-full h-full'>
            <div className='w-2/12 flex flex-col justify-center items-center gap-5'>
                <Logo noText className="w-32 h-32" />
                <Progress value={100} className='h-3' />
            </div>
        </div>
    )
}

export default Loading