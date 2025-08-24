export function formatDate(dateStr: string): string {
  // Convert from DD/MM/YYYY to a more readable format
  const parts = dateStr.split("/")
  if (parts.length !== 3) return dateStr

  const day = parts[0]
  const month = parts[1]
  const year = parts[2]

  // Get month name
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const monthIndex = Number.parseInt(month, 10) - 1
  const monthName = monthNames[monthIndex] || month

  return `${day}-${monthName}-${year}`
}

export function getTimeRangeDates(timeRange: string): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  const startDate = new Date()

  switch (timeRange) {
    case "1 month":
      startDate.setMonth(endDate.getMonth() - 1)
      break
    case "3 months":
      startDate.setMonth(endDate.getMonth() - 3)
      break
    case "12 months":
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
    case "3 years":
      startDate.setFullYear(endDate.getFullYear() - 3)
      break
    default:
      startDate.setMonth(endDate.getMonth() - 1)
  }

  return { startDate, endDate }
}

export function parseAsicDate(dateStr: string): Date {
  // Convert from DD/MM/YYYY to a Date object
  const parts = dateStr.split("/")
  if (parts.length !== 3) return new Date()

  const day = Number.parseInt(parts[0], 10)
  const month = Number.parseInt(parts[1], 10) - 1 // Months are 0-indexed in JavaScript
  const year = Number.parseInt(parts[2], 10)

  return new Date(year, month, day)
}
