"use client"

interface StockInfoProps {
  data: any
}

export function StockInfo({ data }: StockInfoProps) {
  if (!data) return null

  // Use the ticker property directly if available, otherwise extract from name
  const ticker =
    data.ticker ||
    (() => {
      const stockName = data.name || ""
      const stockCode = stockName.match(/$$([^)]+)$$/)
      return stockCode ? stockCode[1] : ""
    })()

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Stock Information</h3>
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="mb-2">
          <div className="text-sm text-gray-500">ASX</div>
          <div>
            <a
              href={`https://www2.asx.com.au/markets/company/${ticker}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {ticker}
            </a>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Yahoo Finance</div>
          <div>
            <a
              href={`https://au.finance.yahoo.com/quote/${ticker}.AX`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {ticker}.AX
            </a>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>*Official regulatory data delayed by 4+ trading days</p>
        <p className="mt-1 text-yellow-600">
          <strong>Disclaimer:</strong> For informational purposes only. Verify with official sources before making
          decisions.
        </p>
      </div>
    </div>
  )
}
