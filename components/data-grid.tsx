// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client'
import React, { useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise'
import { AG_GRID_LOCALE_IR } from '@ag-grid-community/locale'
import { themeQuartz } from 'ag-grid-community'
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
  // We prefer red to blue. Because the built in color schemes
  // derive all colors from foreground, background and
  // accent colors, changing these two values is sufficient.
  backgroundColor: 'oklch(1 0.012 258)',
  accentColor: 'oklch(0.16546762589928057 0.13333333333333336 258)',
  borderColor:
    'oklch(0.9447590760599487 0.026183672181971585 262.70494790451886)',
})

const darkTheme = themeQuartz.withPart(colorSchemeDarkBlue).withParams({
  // We prefer red to blue. Because the built in color schemes
  // derive all colors from foreground, background and
  // accent colors, changing these two values is sufficient.
  backgroundColor: '#000000',
  accentColor: 'oklch(0.414 0.121 273.2)',
})

const localeText = AG_GRID_LOCALE_IR

import { IOlympicData } from '../types/tablae-type'
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
import { useFetchJson } from '../hooks/use-fetch-json'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'

const ButtonRenderer = (params) => {
  if (params.node.parent?.id !== 'ROOT_NODE_ID') return null
  return (
    <div dir="ltr" className="flex h-full w-full items-center justify-center">
      <Switch className="cursor-pointer" />
    </div>
  )
}

const DataGrid = () => {
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), [])
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), [])
  const themeState = useTheme()
  // @ts-nocheck
  const [columnDefs] = useState<(ColDef | ColGroupDef)[]>([
    {
      enableRowGroup: true,
      field: 'date',
      valueFormatter: (params) => {
        if (!params.value) return ''
        // Parse the date from DD/MM/YYYY format
        const [day, month, year] = params.value.split('/').map(Number)
        const date = new Date(year, month - 1, day) // Month is 0-based in JS
        return date.toLocaleString('fa-IR-u-ca-persian', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      },
    },
    {
      field: 'button',
      headerName: 'تایید نهایی',
      valueFormatter: '',
      width: 100,
      valueParser: '',
      cellRenderer: ButtonRenderer,
      cellStyle: { textAlign: 'center' },
    },
    {
      field: 'country',
      enableRowGroup: true,
      filter: 'agTextColumnFilter',
      tooltipField: 'country',
      headerTooltip: 'Tooltip for Athlete Column Header',

      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'طلا',
      field: 'gold',
      headerClass: 'text-center',
      width: 100,
      pinned: 'right',
      width: '200',
      valueGetter: (params) => {
        return params.data.gold + 'test'
      },
      cellStyle: { textAlign: 'center' },
      enableValue: true,
    },
    {
      field: 'sport',
      enableRowGroup: true,
      cellStyle: { textAlign: 'center' },
    },
    {
      field: 'age',
      aggFunc: 'sum',
      width: 100,
      enableRowGroup: true,
      editable: true,
      enableValue: true,
      cellStyle: { textAlign: 'center' },
    },
    {
      field: 'year',
      enableValue: true,
      cellStyle: { textAlign: 'center' },
      width: 100,
    },
    { field: 'total' },
    { field: 'sport' },
  ])

  const { data, loading } = useFetchJson<IOlympicData>(
    'https://www.ag-grid.com/example-assets/olympic-winners.json'
  )

  interface RowData {
    gold: string | number
  }

  const pinnedBottomRowData = useMemo<RowData[]>(() => {
    if (
      loading ||
      !data ||
      !data.every(
        (item) => typeof item.gold === 'number' || item.gold === undefined
      )
    ) {
      return []
    }

    const totalGold = data.reduce(
      (sum, item) => sum + (item.gold || 0) + 0.1,
      0
    )

    return [
      {
        sport: `test`,
        gold: `${totalGold.toFixed(2)} test`,
      },
    ]
  }, [data, loading])

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
          <AgGridReact<IOlympicData>
            rowNumbers={{
              headerComponent: () => <h1>ردیف</h1>,
              width: 100,
              resizable: true,
              suppressCellSelectionIntegration: true,
              valueFormatter: (params) => {
                if (params.node?.sticky) {
                  return ''
                } else {
                  return params.value
                }
              },
            }}
            localeText={localeText}
            rowData={data?.slice(100)}
            enableRtl={true}
            singleClickEdit={true}
            loading={loading}
            onCellValueChanged={(a) => {
              if (a.newValue == 11) {
                alert('wrong')
                const rowNode = a.node
                rowNode.setDataValue(a.column.getColId(), a.oldValue)
              }
              return
            }}
            rowSelection={{
              mode: 'singleRow',
              headerCheckbox: false,
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
            columnDefs={columnDefs}
            sideBar={'columns'}
            alwaysAggregateAtRootLevel={false}
            pivotPanelShow={false}
            pinnedBottomRowData={pinnedBottomRowData}
            pivotMode={false}
            theme={themeState.theme === 'dark' ? darkTheme : lightTheme}
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
