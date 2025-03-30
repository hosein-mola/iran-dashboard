import React from 'react'

export default function ScrollableTable() {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex-grow overflow-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              {Array.from({ length: 10 }, (_, i) => (
                <th
                  key={i}
                  className="border-b border-gray-200 bg-blue-100 px-4 py-2 text-left text-sm font-semibold text-gray-700"
                >
                  Header {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 50 }, (_, row) => (
              <tr key={row} className="odd:bg-white even:bg-gray-50">
                {Array.from({ length: 10 }, (_, col) => (
                  <td
                    key={col}
                    className="border-b border-gray-200 px-4 py-2 text-sm whitespace-nowrap text-gray-800"
                  >
                    Row {row + 1}, Col {col + 1}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 z-10 bg-white">
            <tr>
              <td
                colSpan={10}
                className="border-t border-gray-300 bg-blue-100 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Table Footer
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
