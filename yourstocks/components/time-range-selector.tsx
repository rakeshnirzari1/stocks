"use client"

interface TimeRangeSelectorProps {
  selectedRange: string
  onRangeChange: (range: string) => void
  isSnapshot?: boolean
}

export function TimeRangeSelector({ selectedRange, onRangeChange, isSnapshot = false }: TimeRangeSelectorProps) {
  const ranges = ["1 month", "3 months", "12 months", "3 years"]

  if (isSnapshot) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500">Data Type: Current Snapshot</span>
        <div className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md">Current Position</div>
      </div>
    )
  }

  return (
    <div className="flex space-x-4">
      {ranges.map((range) => (
        <button
          key={range}
          className={`px-3 py-1 text-sm rounded-md ${
            selectedRange === range ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => onRangeChange(range)}
        >
          {range}
        </button>
      ))}
    </div>
  )
}
