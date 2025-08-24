"use client"

import type React from "react"
import { TopShortedStocks } from "./top-shorted-stocks"
import { useState, useEffect } from "react"
import { SearchBar } from "./search-bar"
import { StockOverview } from "./stock-overview"
import { MultiDateComparison } from "./multi-date-comparison"
import { LoadingSpinner } from "./ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Calendar, Download, Link, X, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface DateDataset {
  date: string
  data: any[]
  metadata: any
}

export function ShortPositionsDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [datasets, setDatasets] = useState<DateDataset[]>([])
  const [filteredData, setFilteredData] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [availableTickers, setAvailableTickers] = useState<string[]>([])
  const [manualUrl, setManualUrl] = useState(
    "https://download.asic.gov.au/short-selling/RR20250818-001-SSDailyAggShortPos.csv",
  )
  const [selectedDate, setSelectedDate] = useState("20250818")
  const [viewMode, setViewMode] = useState<"single" | "comparison">("single")

  const fetchSpecificUrl = async (url: string, dateStr: string) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching CSV from URL:", url)

      if (!url.includes("download.asic.gov.au") || !url.includes("SSDailyAggShortPos.csv")) {
        throw new Error("Invalid official CSV URL format")
      }

      const response = await fetch("/api/fetch-specific-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to fetch data from URL")
      }

      const newDataset: DateDataset = {
        date: dateStr,
        data: responseData.data,
        metadata: responseData.metadata,
      }

      // Add or update dataset
      setDatasets((prev) => {
        const existingIndex = prev.findIndex((d) => d.date === dateStr)
        if (existingIndex >= 0) {
          // Update existing
          const updated = [...prev]
          updated[existingIndex] = newDataset
          return updated
        } else {
          // Add new (max 3)
          const updated = [...prev, newDataset].slice(-3)
          return updated.sort((a, b) => a.date.localeCompare(b.date))
        }
      })

      // Update available tickers from all datasets
      const allTickers = new Set<string>()
      datasets.forEach((dataset) => {
        dataset.data.forEach((stock) => {
          if (stock.ticker) allTickers.add(stock.ticker)
        })
      })
      responseData.data.forEach((stock: any) => {
        if (stock.ticker) allTickers.add(stock.ticker)
      })
      setAvailableTickers(Array.from(allTickers).sort())

      setIsLoading(false)
    } catch (err: any) {
      console.error("Error fetching specific data:", err)
      setError(err.message || "Failed to fetch data from the provided URL.")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (datasets.length > 0 && searchQuery) {
      const ticker = searchQuery.toUpperCase()

      if (viewMode === "single" && datasets.length > 0) {
        // Show data from the most recent dataset
        const latestDataset = datasets[datasets.length - 1]
        const stockData = latestDataset.data.find((item) => item.ticker === ticker)
        setFilteredData(stockData || null)
      } else {
        // For comparison mode, we'll handle this in the MultiDateComparison component
        setFilteredData(null)
      }
    } else {
      setFilteredData(null)
    }
  }, [searchQuery, datasets, viewMode])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const formatReportDate = (dateStr: string) => {
    if (!dateStr || dateStr === "Unknown") return "Unknown"
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    return `${day}/${month}/${year}`
  }

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualUrl.trim()) {
      const dateMatch = manualUrl.match(/RR(\d{8})-001/)
      const dateStr = dateMatch ? dateMatch[1] : selectedDate
      fetchSpecificUrl(manualUrl.trim(), dateStr)
    }
  }

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate)
    const newUrl = `https://download.asic.gov.au/short-selling/RR${newDate}-001-SSDailyAggShortPos.csv`
    setManualUrl(newUrl)
  }

  const handleLoadDate = () => {
    fetchSpecificUrl(manualUrl, selectedDate)
  }

  const formatDateForInput = (dateStr: string) => {
    if (dateStr.length === 8) {
      return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
    }
    return ""
  }

  const formatDateFromInput = (dateStr: string) => {
    return dateStr.replace(/-/g, "")
  }

  const removeDataset = (dateToRemove: string) => {
    setDatasets((prev) => prev.filter((d) => d.date !== dateToRemove))
  }

  const clearAllDatasets = () => {
    setDatasets([])
    setViewMode("single")
  }

  const getRecentBusinessDates = () => {
    const dates = []
    const today = new Date()
    const currentDate = new Date(today)

    for (let i = 0; i < 10; i++) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, "")
        dates.push({
          date: dateStr,
          formatted: formatReportDate(dateStr),
          url: `https://download.asic.gov.au/short-selling/RR${dateStr}-001-SSDailyAggShortPos.csv`,
        })
      }
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return dates
  }

  const recentDates = getRecentBusinessDates()

  return (
    <div>
      {/* Data Input Header */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Load ASX Short Positions Data</h2>
            <p className="text-sm text-gray-600">
              Select up to 3 dates to compare short position changes over time. Data is typically available 4 trading
              days after the report date from official regulatory sources.
            </p>
          </div>
          {datasets.length > 0 && (
            <Button onClick={clearAllDatasets} variant="outline" size="sm" className="text-red-600 bg-transparent">
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Loaded Datasets Display */}
        {datasets.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-900">Loaded Dates ({datasets.length}/3)</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setViewMode("single")}
                  variant={viewMode === "single" ? "default" : "outline"}
                  size="sm"
                >
                  Single View
                </Button>
                <Button
                  onClick={() => setViewMode("comparison")}
                  variant={viewMode === "comparison" ? "default" : "outline"}
                  size="sm"
                  disabled={datasets.length < 2}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Compare ({datasets.length})
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {datasets.map((dataset) => (
                <Badge key={dataset.date} variant="secondary" className="flex items-center gap-2">
                  {formatReportDate(dataset.date)}
                  <span className="text-xs">({dataset.data.length} stocks)</span>
                  <button onClick={() => removeDataset(dataset.date)} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Date Picker Method */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Quick Date Selection
          </h3>
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm text-gray-600">Select Date:</label>
            <input
              type="date"
              value={formatDateForInput(selectedDate)}
              onChange={(e) => handleDateChange(formatDateFromInput(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <Button
              onClick={handleLoadDate}
              disabled={isLoading || datasets.length >= 3}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isLoading ? "Loading..." : "Add Date"}
            </Button>
            {datasets.length >= 3 && <span className="text-xs text-amber-600">Maximum 3 dates reached</span>}
          </div>

          <div className="text-xs text-gray-500 mb-3">
            <p>Recent business days (click to add):</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {recentDates.slice(0, 7).map((dateInfo, index) => {
                const isLoaded = datasets.some((d) => d.date === dateInfo.date)
                return (
                  <button
                    key={index}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      isLoaded
                        ? "bg-green-100 text-green-700 cursor-default"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                    onClick={() => {
                      if (!isLoaded && datasets.length < 3) {
                        setSelectedDate(dateInfo.date)
                        setManualUrl(dateInfo.url)
                        fetchSpecificUrl(dateInfo.url, dateInfo.date)
                      }
                    }}
                    disabled={isLoaded || datasets.length >= 3}
                  >
                    {dateInfo.formatted} {isLoaded && "✓"}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Manual URL Method */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Link className="w-4 h-4" />
            Manual CSV URL Input
          </h3>
          <form onSubmit={handleManualUrlSubmit} className="flex gap-2 mb-3">
            <Input
              type="url"
              placeholder="https://download.asic.gov.au/short-selling/RR20250818-001-SSDailyAggShortPos.csv"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="flex-1 font-mono text-sm"
            />
            <Button type="submit" disabled={isLoading || datasets.length >= 3}>
              {isLoading ? "Loading..." : "Add Date"}
            </Button>
          </form>
          <div className="text-xs text-gray-500">
            <p className="mb-1">
              <strong>URL Format:</strong> https://download.asic.gov.au/short-selling/RR
              <span className="bg-yellow-100 px-1">YYYYMMDD</span>-001-SSDailyAggShortPos.csv
            </p>
            <p>
              <strong>Example:</strong> RR20250818 = 18th August 2025
            </p>
            <p className="text-yellow-600 mt-1">
              <strong>Note:</strong> URLs are from official regulatory sources. Verify data independently.
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-4 mt-4">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && !error && datasets.length > 0 && (
          <Alert className="bg-green-50 border-green-200 mt-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              {datasets.length === 1
                ? `Data loaded! ${datasets[0].data.length} stocks from ${formatReportDate(datasets[0].date)}`
                : `${datasets.length} datasets loaded! Ready for comparison analysis.`}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <br />
              <span className="text-xs mt-1 block">
                Try a different date - data may not be available for weekends, holidays, or very recent dates.
              </span>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {datasets.length > 0 && (
        <>
          <div className="mb-6">
            <SearchBar onSearch={handleSearch} />
            {availableTickers.length > 0 && !searchQuery && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Quick search - Popular tickers:</p>
                <div className="flex flex-wrap gap-2">
                  {availableTickers.slice(0, 10).map((ticker, index) => (
                    <button
                      key={index}
                      className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      onClick={() => setSearchQuery(ticker)}
                    >
                      {ticker}
                    </button>
                  ))}
                  {availableTickers.length > 10 && (
                    <span className="text-sm text-gray-500 px-3 py-1">+{availableTickers.length - 10} more</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {viewMode === "comparison" && datasets.length >= 2 ? (
            <MultiDateComparison datasets={datasets} searchQuery={searchQuery} />
          ) : filteredData ? (
            <StockOverview data={filteredData} />
          ) : searchQuery ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-4">No results found for "{searchQuery}". Please try another ticker.</p>
              <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-2">
                Clear Search
              </Button>
            </div>
          ) : (
            <TopShortedStocks
              data={datasets.length > 0 ? datasets[datasets.length - 1].data : []}
              onStockClick={(ticker) => setSearchQuery(ticker)}
            />
          )}
        </>
      )}
    </div>
  )
}
