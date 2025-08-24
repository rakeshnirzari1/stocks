import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch the ASIC page to get the latest CSV link
    const response = await fetch(
      "https://asic.gov.au/regulatory-resources/markets/short-selling/short-position-reports-table/",
      {
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch ASIC page")
    }

    const html = await response.text()

    // Extract the CSV link using regex
    const csvLinkRegex =
      /href="(https:\/\/download\.asic\.gov\.au\/short-selling\/[^"]+\.csv)">Year To Date $$CSV$$<\/a>/
    const match = html.match(csvLinkRegex)

    if (!match || !match[1]) {
      throw new Error("Could not find CSV link on ASIC page")
    }

    const csvUrl = match[1]

    // Fetch the CSV data
    const csvResponse = await fetch(csvUrl, {
      cache: "no-store",
    })

    if (!csvResponse.ok) {
      throw new Error("Failed to fetch CSV data")
    }

    const csvText = await csvResponse.text()

    // Parse the CSV data
    const parsedData = parseCSV(csvText)

    // Return the parsed data
    return NextResponse.json({ data: parsedData })
  } catch (error) {
    console.error("Error fetching short positions data:", error)
    return NextResponse.json({ error: "Failed to fetch short positions data" }, { status: 500 })
  }
}

function parseCSV(csvText: string) {
  // Split the CSV into lines
  const lines = csvText.split("\n")

  // Initialize variables to track the current stock
  let currentStock: any = null
  const stocks: any[] = []

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines
    if (!line) continue

    // Check if this is a header line (contains a stock name)
    if (!line.includes(",")) {
      // If we have a current stock, add it to the stocks array
      if (currentStock) {
        stocks.push(currentStock)
      }

      // Start a new stock
      currentStock = {
        name: line,
      }
    }
    // Otherwise, this is a data line
    else {
      // Skip if we don't have a current stock
      if (!currentStock) continue

      // Parse the CSV line
      const parts = line.split(",")

      // The first part is the ticker, the rest are dates and percentages
      if (parts.length >= 2) {
        const ticker = parts[0]

        // Process each date and percentage
        for (let j = 1; j < parts.length; j++) {
          // Get the date from the header row (assuming it's the same position)
          const headerParts = lines[0].split(",")
          if (j < headerParts.length) {
            const date = headerParts[j]
            const percentage = parts[j]

            // Add to the current stock
            if (date && percentage) {
              currentStock[date] = percentage
            }
          }
        }
      }
    }
  }

  // Add the last stock if there is one
  if (currentStock) {
    stocks.push(currentStock)
  }

  return stocks
}
