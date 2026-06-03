import { parseFilmstrip } from '../../lib/utils';

const METRIC_COLORS = {
  ttfb: { color: '#ef4444', label: 'TTFB' },
  fcp: { color: '#f97316', label: 'FCP' },
  lcp: { color: '#8b5cf6', label: 'LCP' },
  tti: { color: '#06b6d4', label: 'TTI' },
  total: { color: '#10b981', label: 'Total' },
};

export default function FilmstripTab({ data }) {
  const lhr = data?.lighthouseResult;
  const frames = parseFilmstrip(lhr);

  if (!lhr || frames.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 dark:text-gray-600">
        <p className="text-sm">Dados de filmstrip não disponíveis para esta análise.</p>
      </div>
    );
  }

  const audits = lhr.audits;
  const metrics = [
    { key: 'ttfb', value: audits?.['server-response-time']?.numericValue, ...METRIC_COLORS.ttfb },
    { key: 'fcp', value: audits?.['first-contentful-paint']?.numericValue, ...METRIC_COLORS.fcp },
    { key: 'lcp', value: audits?.['largest-contentful-paint']?.numericValue, ...METRIC_COLORS.lcp },
    { key: 'tti', value: audits?.['interactive']?.numericValue, ...METRIC_COLORS.tti },
  ].filter(m => m.value !== undefined);

  const lastFrame = frames[frames.length - 1];
  const totalTime = lastFrame?.timing || 0;

  const formatT = (ms) => ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;

  return (
    <div className="tab-content space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Visualização do Carregamento</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Filmstrip mostrando a evolução visual da página durante o carregamento.</p>
      </div>

      {/* Filmstrip */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 overflow-x-auto">
        <div className="flex gap-3 min-w-max pb-2">
          {frames.map((frame, i) => {
            const timing = frame.timing;
            // Find metric markers near this frame
            const nearMetrics = metrics.filter(m => {
              const next = frames[i + 1];
              return m.value >= (frames[i - 1]?.timing || 0) && m.value < (next?.timing || Infinity);
            });

            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">{formatT(timing)}</span>
                <div className={`filmstrip-thumb rounded-lg overflow-hidden border-2 cursor-pointer ${
                  nearMetrics.length > 0 ? 'border-[#2E3DF0]' : 'border-gray-200 dark:border-gray-700'
                }`} style={{ width: 120, height: 80 }}>
                  {frame.data ? (
                    <img src={frame.data} alt={`Frame ${formatT(timing)}`}
                      className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-xs text-gray-400">–</span>
                    </div>
                  )}
                </div>
                {/* Metric badges */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {nearMetrics.map(m => (
                    <span key={m.key} className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ background: m.color }}>
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric legend + timeline bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Linha do tempo</h4>

        {/* Timeline bar */}
        <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
          {metrics.map(m => {
            const pct = totalTime > 0 ? (m.value / totalTime) * 100 : 0;
            return (
              <div key={m.key} className="absolute top-0 h-full w-0.5 flex items-center"
                style={{ left: `${Math.min(pct, 99)}%`, background: m.color }}>
                <span className="absolute -top-5 text-[10px] font-bold whitespace-nowrap"
                  style={{ color: m.color, transform: 'translateX(-50%)' }}>
                  {m.label}
                </span>
              </div>
            );
          })}
          {/* Fill */}
          <div className="h-full bg-gradient-to-r from-[#2E3DF0]/20 to-[#2E3DF0]/5 rounded-full" />
        </div>

        {/* Metric pills */}
        <div className="flex flex-wrap gap-3">
          {metrics.map(m => (
            <div key={m.key} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: m.color }} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {m.label} <span className="font-bold" style={{ color: m.color }}>{formatT(m.value)}</span>
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total <span className="font-bold text-emerald-500">{formatT(totalTime)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
