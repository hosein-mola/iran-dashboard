'use client'
import React, { useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { AG_GRID_LOCALE_IR } from '@ag-grid-community/locale'
import { themeQuartz } from 'ag-grid-community'
import { colorSchemeDarkBlue } from 'ag-grid-community'
import { useTheme } from './providers/ThemeProvider'

import {
  ClientSideRowModelModule,
  ColDef,
  LocaleModule,
  ModuleRegistry,
  CellStyleModule,
  NumberFilterModule,
  TooltipModule,
  PaginationModule,
  RowSelectionModule,
  NumberEditorModule,
} from 'ag-grid-community'
import {
  AdvancedFilterModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  CellSelectionModule,
  ContextMenuModule,
  CsvExportModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  MultiFilterModule,
  RowNumbersModule,
  ClipboardModule,
  RangeSelectionModule,
  ValidationModule,
  TextFilterModule,
  RichSelectModule,
  FindModule,
} from 'ag-grid-enterprise'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

// Theme setup
const lightTheme = themeQuartz.withParams({
  backgroundColor: 'oklch(1 0.012 258)',
  accentColor: 'oklch(0.16546762589928057 0.13333333333333336 258)',
  borderColor:
    'oklch(0.9447590760599487 0.026183672181971585 262.70494790451886)',
})

const darkTheme = themeQuartz.withPart(colorSchemeDarkBlue).withParams({
  backgroundColor: '#000000',
  accentColor: 'oklch(0.414 0.121 273.2)',
})

const woodTheme = themeQuartz.withParams({
  backgroundColor: '#1f1812',
  foregroundColor: '#f4ecdf',
  headerBackgroundColor: '#2b2119',
  headerForegroundColor: '#f4ecdf',
  oddRowBackgroundColor: '#231b14',
  headerCellHoverBackgroundColor: '#352a21',
  rowHoverColor: '#352a21',
  accentColor: '#c1a47d',
  borderColor: '#352a21',
  rowBorder: '#352a21',
})

// Register modules
ModuleRegistry.registerModules([
  FindModule,
  AdvancedFilterModule,
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  MultiFilterModule,
  PaginationModule,
  ClipboardModule,
  TooltipModule,
  RowSelectionModule,
  RowNumbersModule,
  ContextMenuModule,
  CellStyleModule,
  TextFilterModule,
  RichSelectModule,
  NumberFilterModule,
  LocaleModule,
  FiltersToolPanelModule,
  CellSelectionModule,
  RangeSelectionModule,
  NumberEditorModule,
  CsvExportModule,
  ExcelExportModule,
  ValidationModule,
])

// Generate Fake Persian Data
const generateFakeData = (count: number) => {
  const formTypes = ['ساعتلی', 'روزانه', 'دوره ای']
  const titles = ['درخواست عضویت', 'فرم بازخورد', 'تماس با ما', 'سفارش جدید']
  const descriptions = [
    'این فرم برای ورود کاربران است.',
    'لطفاً بازخورد خود را وارد کنید.',
    'جهت ارتباط با پشتیبانی استفاده می‌شود.',
    'برای ثبت سفارش کالا.',
  ]

  return Array.from({ length: count }, (_, i) => ({
    formTitle: titles[i % titles.length],
    description: descriptions[i % descriptions.length],
    formType: formTypes[i % formTypes.length],
    creationDate: new Date(Date.now() - i * 86400000).toLocaleString('fa-IR'),
  }))
}

const SimpleGrid = () => {
  const router = useRouter()
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), [])
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), [])
  const themeState = useTheme()

  const [rowData] = useState(generateFakeData(50))

  const [columnDefs] = useState<ColDef[]>([
    { field: 'formTitle', headerName: 'عنوان فرم' },
    { field: 'description', headerName: 'توضیحات' },
    { field: 'formType', headerName: 'نوع فرم' },
    { field: 'creationDate', headerName: 'تاریخ ایجاد' },
      {
        headerName: 'عملیات',
        field: 'actions',
        cellRenderer: () => {
          return (
            <Button
              onClick={() => router.push('/dashboard/resources/dashboard')}
              variant="outline"
              className="px-3 py-1 text-xs"
            >
              ورود به داشبورد
            </Button>
          )
        },
        width: 120,
        sortable: false,
        filter: false,
      },
  ])

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div dir="rtl" style={gridStyle}>
          <AgGridReact
            localeText={AG_GRID_LOCALE_IR}
            rowData={rowData}
            enableRtl={true}
            columnDefs={columnDefs}
            theme={
              themeState.theme === 'dark'
                ? darkTheme
                : themeState.theme === 'wood'
                  ? woodTheme
                  : lightTheme
            }
            pagination={true}
            paginationPageSize={20}
            rowSelection="multiple"
            animateRows={true}
          />
        </div>
      </div>
    </div>
  )
}

export default SimpleGrid
