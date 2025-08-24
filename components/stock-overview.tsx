"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, TrendingUp, TrendingDown, Calendar, Building2, RefreshCw } from "lucide-react"

interface StockOverviewProps {
  data: any
}

export function StockOverview({ data }: StockOverviewProps) {
  if (!data) return null

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

  const shortPositionValue = (data.shortPositions / data.totalIssue) * 100
  const isHighShortPosition = shortPositionValue > 5

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{data.name}</h1>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {data.ticker}
              </Badge>
              <div className="flex items-center text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 mr-1" />
                Latest Official Data
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {data.reportDate}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://www2.asx.com.au/markets/company/${data.ticker}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            >
              ASX <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={`https://au.finance.yahoo.com/quote/${data.ticker}.AX`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
            >
              Yahoo <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Short Position %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{data.percentage.toFixed(2)}%</span>
              {isHighShortPosition ? (
                <TrendingUp className="w-5 h-5 text-red-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isHighShortPosition ? "High short interest" : "Moderate short interest"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Short Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(data.shortPositions)}</div>
            <p className="text-xs text-gray-500 mt-1">Shares shorted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(data.totalIssue)}</div>
            <p className="text-xs text-gray-500 mt-1">Shares outstanding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Market Cap Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(data.shortPositions)}</div>
            <p className="text-xs text-gray-500 mt-1">Shares at risk</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Representation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Short Position Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Short Positions</span>
                <span>{data.percentage.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${isHighShortPosition ? "bg-red-500" : "bg-blue-500"}`}
                  style={{ width: `${Math.min(data.percentage, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">{formatNumber(data.shortPositions)}</div>
                <div className="text-sm text-gray-600">Shares Shorted</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {formatNumber(data.totalIssue - data.shortPositions)}
                </div>
                <div className="text-sm text-gray-600">Shares Not Shorted</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Important Disclaimers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <p className="text-sm text-gray-600">
              <strong>Information Only:</strong> This data is for informational purposes only and should not be used for
              investment decisions.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <p className="text-sm text-gray-600">
              <strong>Delayed Data:</strong> Short position data may be delayed by up to 4 trading days or more as per
              regulatory requirements.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <p className="text-sm text-gray-600">
              <strong>Verify Independently:</strong> Always confirm data with official regulatory sources before making
              any decisions.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <p className="text-sm text-gray-600">
              <strong>No Investment Advice:</strong> High short interest analysis does not constitute investment advice
              or recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
