import { NextResponse } from "next/server"
import { parseCSV } from "@/lib/csv-parser"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      throw new Error("No URL provided")
    }

    console.log("Fetching CSV from URL:", url)

    // Validate URL format
    if (!url.includes("download.asic.gov.au") || !url.includes("SSDailyAggShortPos.csv")) {
      throw new Error("Invalid official regulatory CSV URL format")
    }

    // Fetch the CSV data directly
    const csvResponse = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/csv,text/plain,*/*",
      },
    })

    if (!csvResponse.ok) {
      if (csvResponse.status === 404) {
        throw new Error(
          "CSV file not found. This date may not have data available from official sources, or the file may not exist yet.",
        )
      }
      throw new Error(`Failed to fetch CSV data from official source: ${csvResponse.status} ${csvResponse.statusText}`)
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
      throw new Error("No valid data found in the CSV file. The file format may have changed.")
    }

    // Extract the date from the URL for display
    const dateMatch = url.match(/RR(\d{8})-001/)
    const reportDate = dateMatch ? dateMatch[1] : "Unknown"

    // Return the parsed data with metadata
    return NextResponse.json({
      data: parsedData,
      metadata: {
        reportDate: reportDate,
        csvUrl: url,
        totalStocks: parsedData.length,
        fetchedAt: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Error fetching CSV data:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch data",
      },
      { status: 500 },
    )
  }
}
