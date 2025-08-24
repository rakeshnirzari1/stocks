"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from "lucide-react"

interface DateDataset {
  date: string
  data: any[]
  metadata: any
}

interface MultiDateComparisonProps {
  datasets: DateDataset[]
  searchQuery: string
}

export function MultiDateComparison({ datasets, searchQuery }: MultiDateComparisonProps) {
  const formatReportDate = (dateStr: string) => {
    if (!dateStr || dateStr === "Unknown") return "Unknown"
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    return `${day}/${month}/${year}`
  }

  const comparisonData = useMemo(() => {
    if (!searchQuery || datasets.length < 2) return null

    const ticker = searchQuery.toUpperCase()
    const stockDataPoints: Array<{
      date: string
      formattedDate: string
      percentage: number
      shortPositions?: number
      totalIssue?: number
    }> = []

    // Find the stock data across all datasets
    datasets.forEach((dataset) => {
      const stockData = dataset.data.find((item) => item.ticker === ticker)
      if (stockData) {
        // For snapshot data, get the percentage directly
        let percentage = 0
        if (stockData.percentage !== undefined) {
          percentage = stockData.percentage
        } else {
          // For time series data, get the latest percentage
          const dateKeys = Object.keys(stockData).filter(
            (key) => key !== "name" && key !== "ticker" && key !== "isSnapshot" && key.includes("/"),
          )
          if (dateKeys.length > 0) {
            const latestDate = dateKeys.sort((a, b) => {
              const [dayA, monthA, yearA] = a.split("/").map(Number)
              const [dayB, monthB, yearB] = b.split("/").map(Number)
              return new Date(yearB, monthB - 1, dayB).getTime() - new Date(yearA, monthA - 1, dayA).getTime()
            })[0]
            percentage = Number.parseFloat(stockData[latestDate] || "0")
          }
        }

        stockDataPoints.push({
          date: dataset.date,
          formattedDate: formatReportDate(dataset.date),
          percentage: percentage,
          shortPositions: stockData.shortPositions,
          totalIssue: stockData.totalIssue,
        })
      }
    })

    // Sort by date
    stockDataPoints.sort((a, b) => a.date.localeCompare(b.date))

    if (stockDataPoints.length < 2) return null

    // Calculate changes
    const changes = []
    for (let i = 1; i < stockDataPoints.length; i++) {
      const current = stockDataPoints[i]
      const previous = stockDataPoints[i - 1]
      const change = current.percentage - previous.percentage
      const changePercent = previous.percentage !== 0 ? (change / previous.percentage) * 100 : 0

      changes.push({
        from: previous.formattedDate,
        to: current.formattedDate,
        change: change,
        changePercent: changePercent,
        fromValue: previous.percentage,
        toValue: current.percentage,
      })
    }

    return {
      ticker,
      dataPoints: stockDataPoints,
      changes,
      stockName: stockDataPoints[0]
        ? datasets.find((d) => d.data.find((s) => s.ticker === ticker))?.data.find((s) => s.ticker === ticker)?.name
        : null,
    }
  }, [datasets, searchQuery])

  const topMovers = useMemo(() => {
    if (datasets.length < 2) return []

    const tickerChanges = new Map<string, { name: string; change: number; latest: number; ticker: string }>()

    // Get all tickers that appear in multiple datasets
    const allTickers = new Set<string>()
    datasets.forEach((dataset) => {
      dataset.data.forEach((stock) => {
        if (stock.ticker) allTickers.add(stock.ticker)
      })
    })

    // Calculate changes for each ticker
    allTickers.forEach((ticker) => {
      const dataPoints: Array<{ date: string; percentage: number }> = []

      datasets.forEach((dataset) => {
        const stockData = dataset.data.find((item) => item.ticker === ticker)
        if (stockData) {
          let percentage = 0
          if (stockData.percentage !== undefined) {
            percentage = stockData.percentage
          } else {
            // For time series data, get the latest percentage
            const dateKeys = Object.keys(stockData).filter(
              (key) => key !== "name" && key !== "ticker" && key !== "isSnapshot" && key.includes("/"),
            )
            if (dateKeys.length > 0) {
              const latestDate = dateKeys.sort((a, b) => {
                const [dayA, monthA, yearA] = a.split("/").map(Number)
                const [dayB, monthB, yearB] = b.split("/").map(Number)
                return new Date(yearB, monthB - 1, dayB).getTime() - new Date(yearA, monthA - 1, dayA).getTime()
              })[0]
              percentage = Number.parseFloat(stockData[latestDate] || "0")
            }
          }

          dataPoints.push({
            date: dataset.date,
            percentage: percentage,
          })
        }
      })

      if (dataPoints.length >= 2) {
        dataPoints.sort((a, b) => a.date.localeCompare(b.date))
        const earliest = dataPoints[0]
        const latest = dataPoints[dataPoints.length - 1]
        const change = latest.percentage - earliest.percentage

        const stockName = datasets
          .find((d) => d.data.find((s) => s.ticker === ticker))
          ?.data.find((s) => s.ticker === ticker)?.name

        tickerChanges.set(ticker, {
          name: stockName || ticker,
          change: change,
          latest: latest.percentage,
          ticker: ticker,
        })
      }
    })

    // Get top 10 biggest increases and decreases
    const sortedChanges = Array.from(tickerChanges.values()).sort((a, b) => Math.abs(b.change) - Math.abs(a.change))

    return sortedChanges.slice(0, 20)
  }, [datasets])

  const chartConfig = {
    percentage: {
      label: "Short Percentage",
      color: "hsl(210, 100%, 50%)",
    },
  }

  if (datasets.length < 2) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Comparison Mode</h3>
        <p className="text-gray-600">Load at least 2 dates to enable comparison analysis.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Multi-Date Comparison</h2>
        <p className="text-gray-600">
          Comparing short positions across {datasets.length} dates:{" "}
          {datasets.map((d) => formatReportDate(d.date)).join(", ")}
        </p>
      </div>

      {/* Individual Stock Analysis */}
      {comparisonData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {comparisonData.stockName || comparisonData.ticker} ({comparisonData.ticker})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart */}
              <div>
                <h3 className="text-sm font-medium mb-3">Short Position Trend</h3>
                <div className="h-64">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={comparisonData.dataPoints}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="formattedDate" />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="percentage"
                          stroke="var(--color-percentage)"
                          strokeWidth={3}
                          dot={{ r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>

              {/* Changes Table */}
              <div>
                <h3 className="text-sm font-medium mb-3">Period Changes</h3>
                <div className="space-y-3">
                  {comparisonData.changes.map((change, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm">
                        <div className="font-medium">
                          {change.from} → {change.to}
                        </div>
                        <div className="text-gray-500">
                          {change.fromValue.toFixed(2)}% → {change.toValue.toFixed(2)}%
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {change.change > 0 ? (
                          <ArrowUp className="w-4 h-4 text-red-500" />
                        ) : change.change < 0 ? (
                          <ArrowDown className="w-4 h-4 text-green-500" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-400" />
                        )}
                        <span
                          className={`font-medium ${
                            change.change > 0 ? "text-red-600" : change.change < 0 ? "text-green-600" : "text-gray-600"
                          }`}
                        >
                          {change.change > 0 ? "+" : ""}
                          {change.change.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Movers */}
      <Card>
        <CardHeader>
          <CardTitle>Biggest Changes Across All Stocks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead className="text-right">Latest %</TableHead>
                <TableHead className="text-right">Total Change</TableHead>
                <TableHead className="text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topMovers.map((stock, index) => (
                <TableRow key={stock.ticker} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">{stock.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{stock.ticker}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{stock.latest.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-medium ${
                        stock.change > 0 ? "text-red-600" : stock.change < 0 ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      {stock.change > 0 ? "+" : ""}
                      {stock.change.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {stock.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-red-500 inline" />
                    ) : stock.change < 0 ? (
                      <TrendingDown className="w-4 h-4 text-green-500 inline" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-400 inline" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!searchQuery && (
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">💡 Pro Tip</h3>
          <p className="text-blue-700">
            Search for a specific ticker above to see detailed trend analysis with charts and period-by-period changes!
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">⚠️ Data Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-700 space-y-2">
          <p>
            <strong>Informational Use Only:</strong> This comparison analysis is provided for general information
            purposes only. Do not rely on this data for investment, trading, or financial decisions.
          </p>
          <p>
            <strong>Data Accuracy:</strong> While we process data from official sources, errors may occur in
            aggregation, calculation, or display. Always verify with official regulatory reports.
          </p>
          <p>
            <strong>Market Risk:</strong> Short position data is historical and may not reflect current market
            conditions. Past trends do not predict future performance.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
