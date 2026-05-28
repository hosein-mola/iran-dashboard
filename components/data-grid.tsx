'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise'
import { AG_GRID_LOCALE_IR } from '@ag-grid-community/locale'
import { ColGroupDef, themeQuartz } from 'ag-grid-community'
import { colorSchemeDarkBlue } from 'ag-grid-community'

import {
  ClientSideRowModelModule,
  ColDef,
  LocaleModule,
  ModuleRegistry,
  CellStyleModule,
  ValidationModule,
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
  IntegratedChartsModule,
  ContextMenuModule,
  PinnedRowModule,
  FiltersToolPanelModule,
  CsvExportModule,
  TextFilterModule,
  ExcelExportModule,
  PivotModule,
  ClipboardModule,
  RichSelectModule,
  RowNumbersModule,
  RangeSelectionModule,
  RowGroupingPanelModule,
  FindModule,
  MultiFilterModule,
  StatusBarModule,
} from 'ag-grid-enterprise'

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
  oddRowBackgroundColor: '#231b14',
  headerCellHoverBackgroundColor: '#352a21',
  rowHoverColor: '#352a21',
  accentColor: '#c1a47d',
  borderColor: '#352a21',
  rowBorder: '#352a21',
})

const localeText = AG_GRID_LOCALE_IR

type DamRow = {
  dam: string
  river: string
  province: string
  level: number
  volume: number
  inflow: number
  outflow: number
  status: string
  updatedAt: string
}

type DataGridProps<TData extends Record<string, any> = DamRow> = {
  rowData?: TData[]
  columnDefs?: (ColDef<TData> | ColGroupDef<TData>)[]
  loading?: boolean
  pinnedBottomRowData?: Partial<TData>[]
  height?: string
  onCellValueChanged?: (event: any) => void
}

ModuleRegistry.registerModules([
  FindModule,
  AdvancedFilterModule,
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  PinnedRowModule,
  MultiFilterModule,
  StatusBarModule,
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
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
  PivotModule,
  FiltersToolPanelModule,
  CellSelectionModule,
  RangeSelectionModule,
  NumberEditorModule,
  CsvExportModule,
  ExcelExportModule,
  RowGroupingPanelModule,
  ValidationModule,
])
import { useTheme } from './providers/ThemeProvider'
import { Switch } from '@/components/ui/switch'

const ButtonRenderer = (params) => {
  if (params.node.parent?.id !== 'ROOT_NODE_ID') return null
  return (
    <div dir="ltr" className="flex h-full w-full items-center justify-center">
      <Switch className="cursor-pointer" />
    </div>
  )
}

function DataGrid<TData extends Record<string, any> = DamRow>({
  rowData,
  columnDefs,
  loading,
  pinnedBottomRowData,
  height = '100%',
  onCellValueChanged,
}: DataGridProps<TData>) {
  const containerStyle = useMemo(() => ({ width: '100%', height }), [height])
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), [])
  const themeState = useTheme()
  // @ts-nocheck
  const [defaultColumnDefs] = useState<(ColDef | ColGroupDef)[]>([
    {
      headerName: 'مشخصات سد',
      marryChildren: true,
      children: [
        { field: 'dam', headerName: 'نام سد', filter: 'agTextColumnFilter' },
        {
          field: 'river',
          headerName: 'حوضه آبریز',
          filter: 'agTextColumnFilter',
        },
        {
          field: 'province',
          headerName: 'استان',
          filter: 'agTextColumnFilter',
        },
      ],
    },
    {
      headerName: 'تراز و حجم',
      children: [
        {
          field: 'level',
          headerName: 'تراز (متر)',
          valueFormatter: (p) =>
            p.value ? `${p.value.toLocaleString('fa-IR')}` : '',
          type: 'numericColumn',
        },
        {
          field: 'volume',
          headerName: 'حجم مخزن (MCM)',
          valueFormatter: (p) =>
            p.value ? `${p.value.toLocaleString('fa-IR')}` : '',
          type: 'numericColumn',
        },
      ],
    },
    {
      headerName: 'ورودی / خروجی',
      children: [
        {
          field: 'inflow',
          headerName: 'ورودی (m³/s)',
          valueFormatter: (p) =>
            p.value ? `${p.value.toLocaleString('fa-IR')}` : '',
        },
        {
          field: 'outflow',
          headerName: 'خروجی (m³/s)',
          valueFormatter: (p) =>
            p.value ? `${p.value.toLocaleString('fa-IR')}` : '',
        },
      ],
    },
    {
      field: 'status',
      headerName: 'وضعیت بهره‌برداری',
      cellStyle: { textAlign: 'center' },
    },
    {
      field: 'updatedAt',
      headerName: 'به‌روزرسانی',
      valueFormatter: (p) =>
        p.value
          ? new Date(p.value).toLocaleString('fa-IR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '',
    },
    {
      headerName: 'عملیات',
      field: 'actions',
      cellRenderer: ButtonRenderer,
      width: 120,
      sortable: false,
      filter: false,
    },
  ])

  const [data, setData] = useState<DamRow[]>([])
  const [internalLoading, setInternalLoading] = useState(true)

  useEffect(() => {
    if (rowData !== undefined) {
      setInternalLoading(false)
      return
    }

    const timer = setTimeout(() => {
      import('../data/dam-stats.json').then((module) => {
        setData(module.default as DamRow[])
      })
      setInternalLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [rowData])

  interface RowData extends Partial<DamRow> {}

  const defaultPinnedBottomRowData = useMemo<RowData[]>(() => {
    if (!data || !data.length) return []
    const totalVolume = data.reduce(
      (sum, item) => sum + Number(item.volume || 0),
      0
    )
    const totalInflow = data.reduce(
      (sum, item) => sum + Number(item.inflow || 0),
      0
    )
    const totalOutflow = data.reduce(
      (sum, item) => sum + Number(item.outflow || 0),
      0
    )
    return [
      {
        dam: 'جمع',
        volume: totalVolume,
        inflow: totalInflow,
        outflow: totalOutflow,
        status: '—',
        updatedAt: '',
      },
    ]
  }, [data])

  const activeRowData = (rowData ?? data) as TData[]
  const activeColumnDefs = (columnDefs ?? defaultColumnDefs) as (
    | ColDef<TData>
    | ColGroupDef<TData>
  )[]
  const activePinnedBottomRowData =
    pinnedBottomRowData !== undefined
      ? pinnedBottomRowData
      : rowData !== undefined
        ? []
        : defaultPinnedBottomRowData

  return (
    <div style={containerStyle}>
      <div
        dir="ltr"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div dir="ltr" style={gridStyle}>
          <AgGridReact<TData>
            rowNumbers={{
              headerComponent: () => <h1>ردیف</h1>,
              width: 100,
              resizable: true,
              suppressCellSelectionIntegration: true,
              valueFormatter: (params) => {
                if ((params.node as any)?.sticky) {
                  return ''
                } else {
                  return params.value
                }
              },
            }}
            localeText={localeText}
            rowData={activeRowData}
            enableRtl={true}
            singleClickEdit={true}
            loading={loading ?? internalLoading}
            onCellValueChanged={(a) => {
              if (onCellValueChanged) {
                onCellValueChanged(a)
                return
              }
              if (rowData === undefined) {
                if (a.newValue == 11) {
                  alert('wrong')
                  const rowNode = a.node
                  rowNode.setDataValue(a.column.getColId(), a.oldValue)
                }
                return
              }
            }}
            rowSelection={{
              mode: 'singleRow',
              checkboxes: true,
              checkboxLocation: 'selectionColumn',
              hideDisabledCheckboxes: false,
              copySelectedRows: true,
            }}
            rowGroupPanelShow={'never'}
            cellSelection={true}
            ensureDomOrder={true}
            animateRows={true}
            enableCellTextSelection={false}
            onSelectionChanged={(row) => console.log(row)}
            columnDefs={activeColumnDefs}
            sideBar={'columns'}
            alwaysAggregateAtRootLevel={false}
            pivotPanelShow={'never'}
            pinnedBottomRowData={activePinnedBottomRowData as TData[]}
            pivotMode={false}
            theme={
              themeState.theme === 'dark'
                ? darkTheme
                : themeState.theme === 'wood'
                  ? woodTheme
                  : lightTheme
            }
            enableCharts={true}
            pagination={true}
            paginationPageSize={20}
          />
        </div>
      </div>
    </div>
  )
}

export default DataGrid
