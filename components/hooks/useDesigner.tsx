"use client"

import React, { useContext } from 'react'
import { DesignerContext } from '../context/DesignerContext'

function useDesigner() {
    const context = useContext(DesignerContext);
    if (!context) {
        throw new Error('useDesigner most be used within a Designer Context')
    }
    return context;
}

export default useDesigner