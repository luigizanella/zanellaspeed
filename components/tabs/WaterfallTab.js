import { useState } from 'react';
import { parseWaterfall, formatBytes, getFileName, getDomain } from '../../lib/utils';

const TYPE_COLORS = {
  Document: '#2E3DF0', Script: '#f59e0b', Stylesheet: '#8b5cf6',
  Image: '#10b981', Font: '#ec4899', XHR: '#06b6d4', Fetch: '#06b6d4',
  Other: '#94a3b8', Media: '#f97316',
};
const TYPE_LABELS = {
  Document: 'HTML', Script: 'JS', Stylesheet: 'CSS', Image: 'IMG',
  Font: 'Font', XHR: 'XHR', Fetch: 'Fetch', Other: 'Outro', Media: 'Media',
};

export default function WaterfallTab({ data }) {
  const [filter, setFilter] = useState('all');
  const lhr = data?.lighthouseResult;
  const items = parseWaterfall(lhr);
  if (!lhr || items.length === 0) return <Empty />;

  const types = ['all', ...new Set(items.map(i => i.resourceType))];
  const filtered = filter === 'all' ? items : items.filter(i => i.resourceType === filter);
  const maxEnd = Math.max(...items.map(i => i.endTime));
  const totalSize = items.reduce((s, i) => s + i.transferSize, 0);

  const formatT = v => v >= 1000 ? `${(v/1000).toFixed(2)}s` : `${Math.round(v)}ms`;

  return (
    <div className="tab-content space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Requests', value: items.length },
          { label: 'Filtrados', value: filtered.length },
          { label: 'Tamanho total', value: formatBytes(totalSize) },
          { label: 'Tempo total', value: formatT(maxEnd) },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map(type => (
          <button key={type} onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === type ? 'bg-[#2E3DF0] text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            style={filter !== type && type !== 'all' ? { borderLeftColor: TYPE_COLORS[type], borderLeftWidth: 3 } : {}}>
            {TYPE_LABELS[type] || type} ({type === 'all' ? items.length : items.filter(i => i.resourceType === type).length})
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="grid grid-cols-[36px_1fr_70px_70px_70px] gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          {['#', 'Recurso', 'Tipo', 'Tam.', 'Dur.'].map(h => (
            <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">{h}</span>
          ))}
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800/50 max-h-[600px] overflow-y-auto">
          {filtered.map((item, i) => {
            const duration = item.endTime - item.startTime;
            const startPct = (item.startTime / maxEnd) * 100;
            const widthPct = Math.max((duration / maxEnd) * 100, 0.5);
            const color = TYPE_COLORS[item.resourceType] || '#94a3b8';
            return (
              <div key={item.id} className="grid grid-cols-[36px_1fr_70px_70px_70px] gap-2 px-4 py-2.5 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <span className="text-xs text-gray-400 font-mono">{i + 1}</span>
                <div className="min-w-0 space-y-1">
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium truncate block hover:text-[#2E3DF0]" style={{ color }} title={item.url}>
                    {getFileName(item.url)}
                  </a>
                  <div className="relative h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="absolute top-0 h-full rounded-full" style={{ left: `${startPct}%`, width: `${widthPct}%`, background: color, opacity: 0.75 }} />
                  </div>
                  <p className="text-xs text-gray-400 truncate">{getDomain(item.url)}</p>
                </div>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded text-center"
                  style={{ background: color + '20', color }}>{TYPE_LABELS[item.resourceType] || item.resourceType}</span>
                <span className="text-xs text-gray-500 font-mono text-right">{formatBytes(item.transferSize)}</span>
                <span className="text-xs text-gray-500 font-mono text-right">{formatT(duration)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return <div className="flex items-center justify-center h-40 text-gray-400 dark:text-gray-600"><p className="text-sm">Dados de cascata indisponíveis.</p></div>;
}
