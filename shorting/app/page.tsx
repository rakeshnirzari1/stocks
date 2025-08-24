import { ShortPositionsDashboard } from "@/components/short-positions-dashboard"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">ASX Short Positions Dashboard</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Live Data from Official Reports
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Real-Time Short Position Data</h2>
          <p className="text-gray-600 mb-4">
            This dashboard displays short position data from official regulatory reports. The data is updated daily and
            shows current short positions for ASX-listed companies.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Daily data updates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Official regulatory data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Real-time search and analysis</span>
            </div>
          </div>
        </div>

        <ShortPositionsDashboard />
      </main>
      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Important Disclaimer</h3>
              <div className="text-xs text-yellow-700 space-y-2">
                <p>
                  <strong>General Information Only:</strong> This dashboard is provided for general informational
                  purposes only. The information displayed should not be relied upon for making investment, trading, or
                  financial decisions.
                </p>
                <p>
                  <strong>Data Accuracy:</strong> While we strive to provide accurate information, data may contain
                  errors, omissions, or delays. Always verify information with official regulatory sources before making
                  any decisions.
                </p>
                <p>
                  <strong>Delayed Data:</strong> Short position data may be delayed by up to 4 trading days or more as
                  per regulatory reporting requirements. Real-time positions may differ significantly.
                </p>
                <p>
                  <strong>No Investment Advice:</strong> This tool does not provide investment advice, recommendations,
                  or endorsements. Consult with qualified financial professionals before making investment decisions.
                </p>
                <p>
                  <strong>Data Source:</strong> Data is sourced from publicly available regulatory reports. Users should
                  independently verify all information with official sources.
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">
                Data source: Official Australian regulatory short position reports
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <strong>Copyright Notice:</strong> This dashboard aggregates publicly available data for informational
                purposes. All data remains the property of the respective regulatory authorities and data providers.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <strong>Limitation of Liability:</strong> We accept no responsibility for any losses, damages, or
                consequences arising from the use of this information. Use at your own risk.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
