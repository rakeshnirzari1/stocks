import { type NextRequest, NextResponse } from "next/server"
import { parseCSV } from "@/lib/csv-parser"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    console.log("Received file:", file.name, "Size:", file.size, "Type:", file.type)

    // Read the file content
    const csvText = await file.text()
    console.log("CSV content length:", csvText.length)
    console.log("First 200 characters:", csvText.substring(0, 200))

    // Parse the CSV data
    const parsedData = parseCSV(csvText)
    console.log("Parsed data items:", parsedData.length)

    if (parsedData.length === 0) {
      return NextResponse.json({ error: "No valid data found in the CSV file" }, { status: 400 })
    }

    // Return the parsed data
    return NextResponse.json({ data: parsedData })
  } catch (error: any) {
    console.error("Error processing CSV file:", error)
    return NextResponse.json({ error: `Failed to process CSV file: ${error.message}` }, { status: 500 })
  }
}
