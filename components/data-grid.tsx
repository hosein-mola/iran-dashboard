'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise'
import { AG_GRID_LOCALE_IR } from '@ag-grid-community/locale'
import { ColGroupDef, themeQuartz } from 'ag-grid-community'

import {
  ClientSideRowModelModule,
  ColDef,
  LocaleModule,
  ModuleRegistry,
  CellStyleModule,
  ValidationModule,
  NumberFilterModule,
  DateFilterModule,
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
  RowGroupingModule,
  SetFilterModule,
  FindModule,
  MultiFilterModule,
  StatusBarModule,
} from 'ag-grid-enterprise'
import { useTheme } from './providers/ThemeProvider'
import { Switch } from '@/components/ui/switch'

const appTheme = themeQuartz.withParams({
  backgroundColor: 'var(--card)',
  foregroundColor: 'var(--card-foreground)',
  headerBackgroundColor: 'var(--muted)',
  headerTextColor: 'var(--foreground)',
  oddRowBackgroundColor: 'color-mix(in oklch, var(--muted) 38%, var(--card))',
  rowHoverColor: 'var(--accent)',
  selectedRowBackgroundColor:
    'color-mix(in oklch, var(--primary) 18%, transparent)',
  accentColor: 'var(--primary)',
  borderColor: 'var(--border)',
  rowBorder: 'var(--border)',
  chromeBackgroundColor: 'var(--popover)',
  menuBackgroundColor: 'var(--popover)',
  menuTextColor: 'var(--popover-foreground)',
  inputBackgroundColor: 'var(--background)',
  inputBorder: '1px solid var(--input)',
  inputTextColor: 'var(--foreground)',
  rangeSelectionBorderColor: 'var(--primary)',
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
  rowGroupPanelShow?: 'always' | 'onlyWhenGrouping' | 'never'
  compact?: boolean
  enableCharts?: boolean
  paginationPageSize?: number
  paginationPageSizeSelector?: number[] | false
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
  SetFilterModule,
  RichSelectModule,
  NumberFilterModule,
  DateFilterModule,
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
  RowGroupingModule,
  ValidationModule,
])

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
  rowGroupPanelShow = 'always',
  compact = false,
  enableCharts = !compact,
  paginationPageSize,
  paginationPageSizeSelector,
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
  const defaultColDef = useMemo<ColDef<TData>>(
    () => ({
      sortable: true,
      filter: true,
      floatingFilter: !compact,
      resizable: true,
      editable: false,
      enableRowGroup: false,
      enablePivot: false,
      enableValue: false,
      minWidth: 120,
    }),
    [compact]
  )
  const sideBar = useMemo<any>(
    () => ({
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressRowGroups: false,
            suppressValues: false,
            suppressPivots: false,
            suppressPivotMode: false,
            suppressColumnFilter: false,
            suppressColumnSelectAll: false,
            suppressColumnExpandAll: false,
          },
        },
        {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
        },
      ],
      position: 'left',
    }),
    []
  )
  const statusBar = useMemo<any>(
    () => ({
      statusPanels: [
        { statusPanel: 'agTotalAndFilteredRowCountComponent' },
        { statusPanel: 'agSelectedRowCountComponent' },
        { statusPanel: 'agAggregationComponent' },
      ],
    }),
    []
  )

  return (
    <div className="dashboard-ag-grid" style={containerStyle}>
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
            key={themeState.theme}
            rowNumbers={
              compact
                ? false
                : {
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
                  }
            }
            localeText={localeText}
            rowData={activeRowData}
            enableRtl={true}
            defaultColDef={defaultColDef}
            autoGroupColumnDef={{
              minWidth: 220,
              pinned: 'right',
              headerName: 'گروه',
            }}
            singleClickEdit={true}
            loading={
              loading ?? (rowData !== undefined ? false : internalLoading)
            }
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
              checkboxes: false,
              hideDisabledCheckboxes: false,
              copySelectedRows: true,
            }}
            rowGroupPanelShow={compact ? 'never' : rowGroupPanelShow}
            cellSelection={true}
            ensureDomOrder={true}
            animateRows={true}
            enableCellTextSelection={false}
            onSelectionChanged={compact ? undefined : (row) => console.log(row)}
            columnDefs={activeColumnDefs}
            sideBar={compact ? false : sideBar}
            statusBar={compact ? undefined : statusBar}
            alwaysAggregateAtRootLevel={false}
            groupTotalRow={compact ? undefined : 'bottom'}
            grandTotalRow={compact ? undefined : 'bottom'}
            pivotPanelShow={compact ? 'never' : 'always'}
            pinnedBottomRowData={activePinnedBottomRowData as TData[]}
            pivotMode={false}
            processUnpinnedColumns={() => []}
            theme={appTheme}
            enableCharts={enableCharts}
            pagination={true}
            paginationPageSize={paginationPageSize ?? (compact ? 8 : 20)}
            paginationPageSizeSelector={
              paginationPageSizeSelector ??
              (compact ? false : [20, 50, 100, 200])
            }
            suppressAggFuncInHeader={false}
          />
        </div>
      </div>
    </div>
  )
}

export default DataGrid
