import { NextResponse } from "next/server"
import { parseCSV } from "@/lib/csv-parser"

export async function GET() {
  try {
    console.log("Fetching latest CSV from official source...")

    // Fetch the main page to get the CSV links
    const response = await fetch(
      "https://asic.gov.au/regulatory-resources/markets/short-selling/short-position-reports-table/",
      {
        cache: "no-store",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch the official page")
    }

    const html = await response.text()
    console.log("HTML fetched, length:", html.length)

    // Look for CSV links in the HTML - try multiple patterns
    const csvLinkPatterns = [
      // Pattern 1: Direct CSV links
      /href="(https:\/\/download\.asic\.gov\.au\/short-selling\/[^"]*\.csv)"/gi,
      // Pattern 2: Relative CSV links
      /href="(\/short-selling\/[^"]*\.csv)"/gi,
      // Pattern 3: Any CSV link
      /href="([^"]*\.csv)"/gi,
    ]

    const csvLinks: string[] = []

    for (const pattern of csvLinkPatterns) {
      const matches = Array.from(html.matchAll(pattern))
      console.log(`Pattern ${pattern} found ${matches.length} matches`)

      for (const match of matches) {
        let link = match[1]
        // Convert relative URLs to absolute
        if (link.startsWith("/")) {
          link = "https://download.asic.gov.au" + link
        }
        if (link.includes("SSDailyAggShortPos.csv") || link.includes("short-selling")) {
          csvLinks.push(link)
        }
      }

      if (csvLinks.length > 0) break
    }

    console.log("Found CSV links:", csvLinks)

    if (csvLinks.length === 0) {
      // Fallback: try to construct URL from recent dates
      console.log("No CSV links found in HTML, trying fallback method...")
      const today = new Date()

      for (let i = 0; i < 10; i++) {
        const testDate = new Date(today)
        testDate.setDate(today.getDate() - i)

        // Skip weekends
        if (testDate.getDay() === 0 || testDate.getDay() === 6) continue

        const dateStr = testDate.toISOString().slice(0, 10).replace(/-/g, "")
        const testUrl = `https://download.asic.gov.au/short-selling/RR${dateStr}-001-SSDailyAggShortPos.csv`

        try {
          const testResponse = await fetch(testUrl, { method: "HEAD" })
          if (testResponse.ok) {
            csvLinks.push(testUrl)
            console.log("Found working fallback URL:", testUrl)
            break
          }
        } catch (e) {
          // Continue trying other dates
        }
      }
    }

    if (csvLinks.length === 0) {
      throw new Error("Could not find any CSV links on the official page")
    }

    // Use the first (most recent) CSV link
    const csvUrl = csvLinks[0]
    console.log("Using CSV URL:", csvUrl)

    // Fetch the CSV data
    const csvResponse = await fetch(csvUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/csv,text/plain,*/*",
      },
    })

    if (!csvResponse.ok) {
      throw new Error(`Failed to fetch CSV data: ${csvResponse.status} ${csvResponse.statusText}`)
    }

    const csvText = await csvResponse.text()
    console.log("CSV data downloaded, length:", csvText.length)

    if (csvText.length < 100) {
      throw new Error("CSV file appears to be empty or too small")
    }

    // Parse the CSV data
    const parsedData = parseCSV(csvText)
    console.log("Parsed data items:", parsedData.length)

    if (parsedData.length === 0) {
      throw new Error("No valid data found in the CSV file")
    }

    // Extract the date from the URL for display
    const dateMatch = csvUrl.match(/RR(\d{8})-001/)
    const reportDate = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10).replace(/-/g, "")

    // Return the parsed data with metadata
    return NextResponse.json({
      data: parsedData,
      metadata: {
        reportDate: reportDate,
        csvUrl: csvUrl,
        totalStocks: parsedData.length,
        fetchedAt: new Date().toISOString(),
        autoFetched: true,
      },
    })
  } catch (error: any) {
    console.error("Error auto-fetching latest data:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to auto-fetch latest data",
      },
      { status: 500 },
    )
  }
}
