'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { AG_GRID_LOCALE_IR } from '@ag-grid-community/locale'
import { themeQuartz } from 'ag-grid-community'
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
  backgroundColor: 'oklch(1 0 0)',
  foregroundColor: 'oklch(0.2 0.018 245)',
  headerBackgroundColor: 'oklch(0.94 0.012 245)',
  oddRowBackgroundColor: 'oklch(0.975 0.006 245)',
  rowHoverColor: 'oklch(0.91 0.034 245)',
  accentColor: 'oklch(0.48 0.18 245)',
  borderColor: 'oklch(0.86 0.018 245)',
  rowBorder: 'oklch(0.86 0.018 245)',
})

const darkTheme = themeQuartz.withParams({
  backgroundColor: 'oklch(0.255 0.006 255)',
  foregroundColor: 'oklch(0.94 0.004 255)',
  headerBackgroundColor: 'oklch(0.305 0.006 255)',
  oddRowBackgroundColor: 'oklch(0.285 0.006 255)',
  rowHoverColor: 'oklch(0.36 0.018 245)',
  accentColor: 'oklch(0.64 0.11 215)',
  borderColor: 'oklch(0.405 0.006 255)',
  rowBorder: 'oklch(0.405 0.006 255)',
})

const woodTheme = themeQuartz.withParams({
  backgroundColor: '#1d1711',
  foregroundColor: '#f5ecdf',
  headerBackgroundColor: '#30261c',
  oddRowBackgroundColor: '#241b14',
  headerCellHoverBackgroundColor: '#3b2e22',
  rowHoverColor: '#4a3828',
  accentColor: '#c6a36e',
  borderColor: '#4a382a',
  rowBorder: '#4a382a',
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

// Generate Fake Persian Dam Data
const generateFakeData = (count: number) => {
  const dams = [
    'کارون ۳',
    'کرخه',
    'دز',
    'گتوند',
    'زاینده‌رود',
    'لار',
    'طالقان',
    'سیمره',
  ]
  const provinces = ['خوزستان', 'اصفهان', 'تهران', 'البرز', 'ایلام', 'فارس']
  const basins = ['کارون', 'کرخه', 'زاینده‌رود', 'لار', 'سیروان']
  const statuses = ['عادی', 'محدودیت', 'کمبود ورودی', 'نیاز به بررسی']

  return Array.from({ length: count }, (_, i) => ({
    damName: dams[i % dams.length],
    province: provinces[i % provinces.length],
    basin: basins[i % basins.length],
    status: statuses[i % statuses.length],
    inflow: Math.floor(50 + Math.random() * 200),
    outflow: Math.floor(40 + Math.random() * 180),
    updatedAt: new Date(Date.now() - i * 3600 * 1000).toLocaleString('fa-IR'),
  }))
}

const SimpleGrid = () => {
  const router = useRouter()
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), [])
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), [])
  const themeState = useTheme()

  const [rowData, setRowData] = useState(generateFakeData(0))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setRowData(generateFakeData(50))
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const [columnDefs] = useState<ColDef[]>([
    { field: 'damName', headerName: 'نام سد' },
    { field: 'province', headerName: 'استان' },
    { field: 'basin', headerName: 'حوضه' },
    { field: 'status', headerName: 'وضعیت' },
    {
      field: 'inflow',
      headerName: 'ورودی (m³/s)',
      valueFormatter: (p) => (p.value ? p.value.toLocaleString('fa-IR') : ''),
    },
    {
      field: 'outflow',
      headerName: 'خروجی (m³/s)',
      valueFormatter: (p) => (p.value ? p.value.toLocaleString('fa-IR') : ''),
    },
    { field: 'updatedAt', headerName: 'به‌روزرسانی' },
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
            مشاهده داشبورد
          </Button>
        )
      },
      width: 140,
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
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export default SimpleGrid
