"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Search, Crown } from "lucide-react"

interface TopShortedStocksProps {
  data: any[]
  onStockClick: (ticker: string) => void
}

export function TopShortedStocks({ data, onStockClick }: TopShortedStocksProps) {
  const topShortedStocks = useMemo(() => {
    if (!data || data.length === 0) return []

    // Sort stocks by short percentage (highest first) and take top 50
    const sortedStocks = data
      .filter((stock) => stock.percentage > 0 && stock.ticker) // Only include stocks with short positions and valid tickers
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 50)

    return sortedStocks.map((stock, index) => ({
      rank: index + 1,
      ticker: stock.ticker,
      name: stock.name,
      percentage: stock.percentage,
      shortPositions: stock.shortPositions || 0,
      totalIssue: stock.totalIssue || 0,
      isHighShort: stock.percentage > 10,
      isVeryHighShort: stock.percentage > 20,
    }))
  }, [data])

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  const getShortLevelColor = (percentage: number) => {
    if (percentage > 20) return "text-red-700 bg-red-100"
    if (percentage > 10) return "text-orange-700 bg-orange-100"
    if (percentage > 5) return "text-yellow-700 bg-yellow-100"
    return "text-blue-700 bg-blue-100"
  }

  const getShortLevelIcon = (percentage: number) => {
    if (percentage > 10) return <TrendingUp className="w-4 h-4 text-red-500" />
    return <TrendingDown className="w-4 h-4 text-blue-500" />
  }

  if (topShortedStocks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No short position data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm text-gray-500 truncate">Highest Shorted</div>
                <div className="text-sm sm:text-lg font-bold">{topShortedStocks[0]?.percentage.toFixed(2)}%</div>
                <div className="text-xs text-gray-500 truncate">{topShortedStocks[0]?.ticker}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-red-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm text-gray-500 truncate">Very High (&gt;20%)</div>
                <div className="text-sm sm:text-lg font-bold">
                  {topShortedStocks.filter((s) => s.percentage > 20).length}
                </div>
                <div className="text-xs text-gray-500">stocks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-orange-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm text-gray-500 truncate">High (10-20%)</div>
                <div className="text-sm sm:text-lg font-bold">
                  {topShortedStocks.filter((s) => s.percentage > 10 && s.percentage <= 20).length}
                </div>
                <div className="text-xs text-gray-500">stocks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm text-gray-500 truncate">Total Tracked</div>
                <div className="text-sm sm:text-lg font-bold">{data.length}</div>
                <div className="text-xs text-gray-500">stocks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 50 Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="w-5 h-5" />
            Top 50 Most Shorted Stocks
          </CardTitle>
          <p className="text-xs sm:text-sm text-gray-600">
            Click on any stock to view detailed information. Data sorted by short position percentage.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            <div className="space-y-2 p-4">
              {topShortedStocks.slice(0, 20).map((stock) => (
                <div
                  key={stock.ticker}
                  className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onStockClick(stock.ticker)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {stock.rank <= 3 && <Crown className="w-3 h-3 text-yellow-500" />}
                        <span className="text-xs text-gray-500">#{stock.rank}</span>
                        <Badge variant="outline" className="text-xs">
                          {stock.ticker}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium truncate">{stock.name}</div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-lg font-bold">{stock.percentage.toFixed(2)}%</span>
                        {getShortLevelIcon(stock.percentage)}
                      </div>
                      <Badge className={`text-xs ${getShortLevelColor(stock.percentage)}`}>
                        {stock.percentage > 20
                          ? "Very High"
                          : stock.percentage > 10
                            ? "High"
                            : stock.percentage > 5
                              ? "Moderate"
                              : "Low"}
                      </Badge>
                    </div>
                  </div>
                  {(stock.shortPositions > 0 || stock.totalIssue > 0) && (
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      {stock.shortPositions > 0 && <span>Short: {formatNumber(stock.shortPositions)}</span>}
                      {stock.totalIssue > 0 && <span>Total: {formatNumber(stock.totalIssue)}</span>}
                    </div>
                  )}
                </div>
              ))}
              <div className="text-center text-sm text-gray-500 pt-4">
                Showing top 20 on mobile. Switch to desktop for full top 50 list.
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead className="min-w-48">Stock</TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead className="text-right">Short %</TableHead>
                    <TableHead className="text-right hidden lg:table-cell">Short Positions</TableHead>
                    <TableHead className="text-right hidden lg:table-cell">Total Shares</TableHead>
                    <TableHead className="text-center">Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topShortedStocks.map((stock) => (
                    <TableRow
                      key={stock.ticker}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => onStockClick(stock.ticker)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {stock.rank <= 3 && <Crown className="w-4 h-4 text-yellow-500" />}#{stock.rank}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-xs truncate" title={stock.name}>
                          {stock.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {stock.ticker}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-lg">{stock.percentage.toFixed(2)}%</span>
                          {getShortLevelIcon(stock.percentage)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell">
                        {stock.shortPositions > 0 ? formatNumber(stock.shortPositions) : "N/A"}
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell">
                        {stock.totalIssue > 0 ? formatNumber(stock.totalIssue) : "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-xs ${getShortLevelColor(stock.percentage)}`}>
                          {stock.percentage > 20
                            ? "Very High"
                            : stock.percentage > 10
                              ? "High"
                              : stock.percentage > 5
                                ? "Moderate"
                                : "Low"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="p-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Short Interest Levels:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 rounded flex-shrink-0"></div>
                  <span>Very High: &gt;20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-100 rounded flex-shrink-0"></div>
                  <span>High: 10-20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-100 rounded flex-shrink-0"></div>
                  <span>Moderate: 5-10%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 rounded flex-shrink-0"></div>
                  <span>Low: &lt;5%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> Click on any stock row to view detailed analysis including charts, external
                links, and comprehensive short position information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="text-sm text-yellow-700 space-y-1">
            <p>
              <strong>⚠️ Important:</strong> This ranking is for informational purposes only. High short interest may
              indicate bearish sentiment but does not constitute investment advice.
            </p>
            <p>
              <strong>Data Delay:</strong> Short position data may be delayed by 4+ trading days. Always verify with
              official sources before making decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
