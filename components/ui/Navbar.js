import Link from 'next/link';

export default function Navbar({ darkMode, onToggleDark, showSettings, onToggleSettings, apiKey, onSaveApiKey }) {
  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2E3DF0] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight">
            Zanella<span className="text-[#2E3DF0]">Speed</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button onClick={onToggleDark}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={onToggleSettings}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-colors ${
              showSettings
                ? 'bg-[#2E3DF0] border-[#2E3DF0] text-white'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}>
            ⚙️
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex flex-wrap items-center gap-3 max-w-2xl">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex-shrink-0">
                🔑 API Key PageSpeed Insights
              </label>
              <input type="password" value={apiKey} onChange={e => onSaveApiKey(e.target.value)}
                placeholder="AIza..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-mono text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E3DF0]/30 focus:border-[#2E3DF0]" />
              <a href="https://developers.google.com/speed/docs/insights/v5/get-started" target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#2E3DF0] hover:underline flex-shrink-0">
                Como obter →
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
