import { getReservoirPage, RESERVOIR_COLUMNS } from '@/lib/reservoir-data'

import { ReservoirDataClient } from './ReservoirDataClient'

export const dynamic = 'force-dynamic'

export default async function ReservoirDataPage() {
  const initialData = await getReservoirPage({ page: 1, pageSize: 25 })

  return (
    <ReservoirDataClient
      initialData={initialData}
      columns={RESERVOIR_COLUMNS.map(({ name, label }) => ({ name, label }))}
    />
  )
}
