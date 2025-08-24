"use client"

import { useMemo } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatDate, getTimeRangeDates } from "@/lib/date-utils"

interface ShortPositionsChartProps {
  data: any
  timeRange: string
}

export function ShortPositionsChart({ data, timeRange }: ShortPositionsChartProps) {
  const chartData = useMemo(() => {
    if (!data) return []

    // Check if this is snapshot data (single point in time)
    if (data.isSnapshot) {
      // For snapshot data, create a single bar chart point
      const dateKeys = Object.keys(data).filter((key) => key !== "name" && key !== "ticker" && key !== "isSnapshot")

      if (dateKeys.length === 0) return []

      return dateKeys.map((date) => ({
        date: formatDate(date),
        shortPercentage: Number.parseFloat(data[date] || 0),
      }))
    }

    // Original time series logic
    const { startDate } = getTimeRangeDates(timeRange)
    const dateKeys = Object.keys(data).filter((key) => {
      return (
        key !== "name" && key !== "ticker" && key !== "isSnapshot" && key.includes("/") && new Date(key) >= startDate
      )
    })

    dateKeys.sort((a, b) => {
      const [dayA, monthA, yearA] = a.split("/").map(Number)
      const [dayB, monthB, yearB] = b.split("/").map(Number)
      return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime()
    })

    return dateKeys.map((date) => ({
      date: formatDate(date),
      shortPercentage: Number.parseFloat(data[date] || 0),
    }))
  }, [data, timeRange])

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available for the selected time range
      </div>
    )
  }

  // Use bar chart for snapshot data, line chart for time series
  const isSnapshot = data?.isSnapshot
  const chartConfig = {
    shortPercentage: {
      label: "Short Percentage",
      color: "hsl(210, 100%, 50%)",
    },
  }

  return (
    <div className="h-64">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          {isSnapshot ? (
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={["auto", "auto"]} tickFormatter={(value) => `${value}%`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="shortPercentage" fill="var(--color-shortPercentage)" />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => value} minTickGap={30} />
              <YAxis domain={["auto", "auto"]} tickFormatter={(value) => `${value}%`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="shortPercentage"
                stroke="var(--color-shortPercentage)"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
