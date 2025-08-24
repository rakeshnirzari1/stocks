export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      <span className="ml-2 text-gray-600">Loading data...</span>
    </div>
  )
}
