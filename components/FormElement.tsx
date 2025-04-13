import React from 'react'
import { TextFieldFormElement } from './fields/TextField';
import { IconType } from 'react-icons/lib';
import { PanelFieldElement } from './fields/PanelField';
import { UseDraggableArguments, useDraggable } from '@dnd-kit/core';
import { FlexFieldElement } from './fields/FlexField';
import { PageType } from './context/DesignerContext';
import { FieldValues, UseFormReturn } from 'react-hook-form';

export type ElementType = "panel" | "flex" | "text";


export type FormComponentType = {
    elementInstance: FormElementInstance,
    formController: UseFormReturn<any, any, undefined>,
    isInvalid?: boolean,
    defaultValue?: string
};

export type FormComponentTypeProps = React.FC<FormComponentType>;
export type SubmitFunction = (element: any, value: string) => void;
export type FormElement = {
    construct: (id: string, index: number, parentId: string | null, page: string, _extraAttributes: Record<string, any>) => FormElementInstance;
    type: ElementType;
    designerBtnElement: {
        icon: IconType;
        label: string;
    },
    designerComponent: React.FC<{
        elementInstance: FormElementInstance,
    }>;
    formComponent: FormComponentTypeProps;
    propertiesComponent: React.FC<{
        elementInstance: FormElementInstance
    }>;
    validate: (formElement: FormElementInstance, current: string) => boolean
}

export type FormElementInstance = {
    id: string;
    index: number,
    type: ElementType;
    parentId: string | null;
    page: string;
    extraAttributes: Record<string, any>;
}

type FormElementsType = {
    [key in ElementType]: FormElement
}
export const FormElements: FormElementsType = {
    text: TextFieldFormElement,
    panel: PanelFieldElement,
    flex: FlexFieldElement
};