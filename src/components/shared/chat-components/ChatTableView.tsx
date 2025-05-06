import React from 'react'

interface ChatTableViewProps {
  tableColumns: string[]
  tableRows: any[][]
}

export function ChatTableView({ tableColumns, tableRows }: ChatTableViewProps) {
  return (
    <div className="overflow-auto max-h-40">
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr>
            {tableColumns.map(col => (
              <th key={col} className="px-2 py-1 border-b">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-2 py-1 border-b">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 