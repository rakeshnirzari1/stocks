"use client"

import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, parseAsicDate } from "@/lib/date-utils"

interface ShortPositionsTableProps {
  data: any
}

export function ShortPositionsTable({ data }: ShortPositionsTableProps) {
  const tableData = useMemo(() => {
    if (!data) return []

    // Get all date keys from the data object
    const dateKeys = Object.keys(data).filter(
      (key) => key !== "name" && key !== "ticker" && key !== "isSnapshot" && key.includes("/"),
    )

    if (dateKeys.length === 0) return []

    // For snapshot data, we only have one date
    if (data.isSnapshot) {
      return dateKeys.map((date) => ({
        date: formatDate(date),
        shortPercentage: Number.parseFloat(data[date] || 0),
      }))
    }

    // For time series data, sort and take recent dates
    dateKeys.sort((a, b) => {
      return parseAsicDate(b).getTime() - parseAsicDate(a).getTime()
    })

    const recentDates = dateKeys.slice(0, 10)
    return recentDates.map((date) => ({
      date: formatDate(date),
      shortPercentage: Number.parseFloat(data[date] || 0),
    }))
  }, [data])

  if (tableData.length === 0) {
    return <div className="text-gray-500">No data available</div>
  }

  const latestValue = tableData[0]?.shortPercentage || 0
  const isSnapshot = data?.isSnapshot

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">{isSnapshot ? "Current Short Position" : "Recent Short Positions"}</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500">Current position</div>
          <div className="text-lg font-semibold">{latestValue.toFixed(2)}%</div>
          <div className="text-sm text-gray-500">{tableData[0]?.date}</div>
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500">Data Type</div>
          <div className="text-lg font-semibold">{isSnapshot ? "Snapshot" : "Time Series"}</div>
          <div className="text-sm text-gray-500">{isSnapshot ? "Single point in time" : "Historical data"}</div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Short %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.date}</TableCell>
              <TableCell className="text-right">{row.shortPercentage.toFixed(2)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isSnapshot && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> This data represents a single point in time snapshot. For historical trends, you
            would need a time-series CSV file with multiple dates.
          </p>
        </div>
      )}
    </div>
  )
}
