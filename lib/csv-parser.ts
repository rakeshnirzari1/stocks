export function parseCSV(csvText: string) {
  try {
    // Split the CSV into lines
    const lines = csvText.split(/\r?\n/)
    console.log("CSV lines:", lines.length)

    if (lines.length === 0) {
      console.error("No lines found in CSV")
      return []
    }

    // Get the header row
    const headerRow = lines[0].split(",")
    console.log("Header row:", headerRow)

    // Check if this is the new format (single day snapshot)
    const isSnapshotFormat = headerRow.includes("Product") && headerRow.includes("Product Code")
    console.log("Is snapshot format:", isSnapshotFormat)

    if (isSnapshotFormat) {
      return parseSnapshotFormat(lines)
    } else {
      return parseTimeSeriesFormat(lines)
    }
  } catch (error) {
    console.error("Error in parseCSV:", error)
    return []
  }
}

function parseSnapshotFormat(lines: string[]) {
  const stocks: any[] = []
  const headerRow = lines[0].split(",")

  // Find column indices
  const productIndex = headerRow.findIndex(
    (col) => col.trim().toLowerCase().includes("product") && !col.trim().toLowerCase().includes("code"),
  )
  const codeIndex = headerRow.findIndex((col) => col.trim().toLowerCase().includes("product code"))
  const shortPositionsIndex = headerRow.findIndex((col) =>
    col.trim().toLowerCase().includes("reported short positions"),
  )
  const totalIssueIndex = headerRow.findIndex((col) => col.trim().toLowerCase().includes("total product in issue"))
  const percentageIndex = headerRow.findIndex((col) => col.trim().toLowerCase().includes("% of total"))

  console.log("Column indices:", { productIndex, codeIndex, shortPositionsIndex, totalIssueIndex, percentageIndex })

  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const columns = line.split(",")
    if (columns.length < 3) continue

    const productName = columns[productIndex]?.trim()
    const ticker = columns[codeIndex]?.trim()
    const shortPositions = columns[shortPositionsIndex]?.trim()
    const totalIssue = columns[totalIssueIndex]?.trim()
    const percentage = columns[percentageIndex]?.trim()

    if (!productName || !ticker || !percentage) continue

    // Create the current date string
    const today = new Date()
    const dateStr = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getFullYear()}`

    const stock = {
      name: `${productName} (${ticker})`,
      ticker: ticker,
      shortPositions: Number.parseInt(shortPositions?.replace(/,/g, "") || "0"),
      totalIssue: Number.parseInt(totalIssue?.replace(/,/g, "") || "0"),
      percentage: Number.parseFloat(percentage || "0"),
      [dateStr]: percentage,
      isSnapshot: true,
      reportDate: dateStr,
    }

    stocks.push(stock)
  }

  console.log("Parsed snapshot stocks:", stocks.length)
  if (stocks.length > 0) {
    console.log("Sample stock:", stocks[0])
  }

  return stocks
}

function parseTimeSeriesFormat(lines: string[]) {
  // Original time series parsing logic
  const headerRow = lines[0].split(",")
  const dates = headerRow.slice(2).filter(Boolean)
  const stocksMap = new Map()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const columns = line.split(",")
    if (columns.length < 3) continue

    const stockName = columns[0]
    const ticker = columns[1]

    if (!stockName || !ticker) continue

    const fullName = `${stockName} (${ticker})`
    let stock = stocksMap.get(fullName)
    if (!stock) {
      stock = {
        name: fullName,
        ticker: ticker,
        isSnapshot: false,
      }
      stocksMap.set(fullName, stock)
    }

    for (let j = 2; j < columns.length; j++) {
      if (j < headerRow.length && headerRow[j]) {
        const date = headerRow[j]
        const percentage = columns[j]
        if (percentage && !isNaN(Number.parseFloat(percentage))) {
          stock[date] = percentage
        }
      }
    }
  }

  return Array.from(stocksMap.values())
}
