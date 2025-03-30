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
} from 'ag-grid-community'
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  CellSelectionModule,
  IntegratedChartsModule,
  ContextMenuModule,
  FiltersToolPanelModule,
  CsvExportModule,
  TextFilterModule,
  ExcelExportModule,
  PivotModule,
} from 'ag-grid-enterprise'

const lightTheme = themeQuartz.withParams({
  // We prefer red to blue. Because the built in color schemes
  // derive all colors from foreground, background and
  // accent colors, changing these two values is sufficient.
  backgroundColor: 'oklch(1 0.012 258)',
  accentColor: 'oklch(0.16546762589928057 0.13333333333333336 258)',
})

const darkTheme = themeQuartz.withPart(colorSchemeDarkBlue).withParams({
  // We prefer red to blue. Because the built in color schemes
  // derive all colors from foreground, background and
  // accent colors, changing these two values is sufficient.
  backgroundColor: '#000000',
  accentColor: 'oklch(0.414 0.121 273.2)',
})

const localeText = AG_GRID_LOCALE_IR

import { IOlympicData } from './interfaces'
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  CellStyleModule,
  TextFilterModule,
  NumberFilterModule,
  LocaleModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
  PivotModule,
  FiltersToolPanelModule,
  CellSelectionModule,
  CsvExportModule,
  ExcelExportModule,
  ValidationModule,
])
import { useFetchJson } from './useFetchJson'
import { useTheme } from 'next-themes'
export const columnCentered = {
  headerClass: 'text-center',
  cellStyle: {
    textAlign: 'center',
    // Add the following if you are using .ag-header-cell-menu-button
    // and column borders are set to none.
    // marginLeft: '-16px'
  },
}

const ScrollTable = () => {
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), [])
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), [])
  const themeState = useTheme()
  // @ts-nocheck
  const [columnDefs] = useState<(ColDef | ColGroupDef)[]>([
    {
      field: 'country',
      enableRowGroup: true,
      filter: 'agTextColumnFilter',
      cellStyle: { textAlign: 'center' },
    },
    {
      field: 'gold',
      aggFunc: 'sum',
      pinned: 'left',
      enableValue: true,
    },
    {
      field: 'sport',
      enableRowGroup: true,
      cellStyle: { textAlign: 'center' },
    },
    {
      field: 'age',
      enableValue: true,
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'center' },
      headerClass: 'text-center',
    },
    {
      field: 'year',
      enableValue: true,
      cellStyle: { textAlign: 'center' },
    },
  ])

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  }, [])

  const autoGroupColumnDef = useMemo<ColDef>(() => {
    return {
      minWidth: 200,
    }
  }, [])

  const { data, loading } = useFetchJson<IOlympicData>(
    'https://www.ag-grid.com/example-assets/olympic-winners.json'
  )

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={gridStyle}>
          <AgGridReact<IOlympicData>
            localeText={localeText}
            rowData={data}
            enableRtl={true}
            loading={loading}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            autoGroupColumnDef={autoGroupColumnDef}
            sideBar={'columns'}
            theme={themeState.theme === 'dark' ? darkTheme : lightTheme}
            pivotMode={false}
            cellSelection={true}
            enableCharts={true}
          />
        </div>
      </div>
    </div>
  )
}

export default ScrollTable
