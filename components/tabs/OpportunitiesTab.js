import { useState } from 'react';
import { getScoreColor, formatMs, formatBytes, getDirectAdvice } from '../../lib/utils';

function AuditItem({ audit, catColor }) {
  const [open, setOpen] = useState(false);
  const savings = audit.details?.overallSavingsMs;
  const savingsBytes = audit.details?.overallSavingsBytes;
  const advice = getDirectAdvice(audit.id);
  const score = audit.score;
  const dotColor = score === 0 ? '#ff4e42' : score < 0.5 ? '#ffa400' : '#2E3DF0';

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${open ? 'border-[#2E3DF0]/30 shadow-sm' : 'border-gray-100 dark:border-gray-800'}`}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor }} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 dark:text-white">{audit.title}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {savings > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              −{formatMs(savings)}
            </span>
          )}
          {savingsBytes > 0 && !savings && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              −{formatBytes(savingsBytes)}
            </span>
          )}
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 space-y-3">
          {audit.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
              {audit.description.replace(/\[.*?\]\(.*?\)/g, '')}
            </p>
          )}

          {advice && (
            <div className="p-3 bg-[#2E3DF0]/5 border border-[#2E3DF0]/20 rounded-xl">
              <p className="text-xs font-bold text-[#2E3DF0] uppercase tracking-wider mb-1.5">⚡ Como resolver</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{advice}</p>
            </div>
          )}

          {audit.details?.items?.length > 0 && (
            <div className="overflow-x-auto">
              <div className="space-y-1">
                {audit.details.items.slice(0, 8).map((item, i) => {
                  const urlKey = Object.keys(item).find(k => k === 'url' || String(item[k] || '').startsWith('http'));
                  const url = urlKey ? String(item[urlKey]) : null;
                  const name = url ? url.replace(/^https?:\/\/[^/]+/, '').slice(0, 70) || url.slice(0, 70) : null;
                  return (
                    <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs text-gray-400 font-mono w-4 flex-shrink-0">{i + 1}</span>
                      {name && (
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-mono text-gray-600 dark:text-gray-400 hover:text-[#2E3DF0] truncate flex-1"
                          title={url}>{name}</a>
                      )}
                      {item.totalBytes > 0 && (
                        <span className="text-xs font-semibold text-gray-500 flex-shrink-0">{formatBytes(item.totalBytes)}</span>
                      )}
                      {item.wastedBytes > 0 && (
                        <span className="text-xs font-semibold text-red-500 flex-shrink-0">−{formatBytes(item.wastedBytes)}</span>
                      )}
                      {item.wastedMs > 0 && (
                        <span className="text-xs font-semibold text-amber-500 flex-shrink-0">−{formatMs(item.wastedMs)}</span>
                      )}
                    </div>
                  );
                })}
                {audit.details.items.length > 8 && (
                  <p className="text-xs text-gray-400 px-2">+{audit.details.items.length - 8} itens adicionais</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CategorySection({ title, score, audits, failed, passed }) {
  const [showPassed, setShowPassed] = useState(false);
  const color = getScoreColor(score);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Category header */}
      <div className="flex items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ background: color }}>
          {score ?? '–'}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {failed.length} problema{failed.length !== 1 ? 's' : ''} · {passed.length} aprovado{passed.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-bold text-2xl" style={{ color }}>{score ?? '–'}<span className="text-sm text-gray-400 font-normal">/100</span></p>
        </div>
      </div>

      {/* Failed audits */}
      {failed.length > 0 ? (
        <div className="p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {failed.length} oportunidade{failed.length !== 1 ? 's' : ''} de melhoria
          </p>
          {failed.map(audit => (
            <AuditItem key={audit.id} audit={audit} catColor={color} />
          ))}
        </div>
      ) : (
        <div className="p-5 text-center">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">✓ Nenhum problema encontrado nesta categoria</p>
        </div>
      )}

      {/* Passed toggle */}
      {passed.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          <button onClick={() => setShowPassed(!showPassed)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <span>✓ {passed.length} auditorias aprovadas</span>
            <svg className={`w-4 h-4 transition-transform ${showPassed ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showPassed && (
            <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-1">
              {passed.map(a => (
                <div key={a.id} className="flex items-center gap-2 text-xs text-gray-400 py-1">
                  <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  {a.title}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OpportunitiesTab({ data }) {
  const lhr = data?.lighthouseResult;
  if (!lhr) return <Empty />;

  const categories = [
    { id: 'performance', title: 'Performance' },
    { id: 'seo', title: 'SEO' },
    { id: 'accessibility', title: 'Acessibilidade' },
    { id: 'best-practices', title: 'Boas Práticas' },
  ];

  return (
    <div className="tab-content space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Oportunidades de Melhoria</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Organizado por categoria. Clique em cada item para ver o problema detalhado e como resolver.
        </p>
      </div>

      {categories.map(cat => {
        const category = lhr.categories?.[cat.id];
        if (!category) return null;
        const score = Math.round(category.score * 100);
        const auditIds = category.auditRefs?.map(r => r.id) || [];
        const audits = auditIds.map(id => lhr.audits?.[id]).filter(Boolean);
        const failed = audits.filter(a => a.score !== null && a.score < 1);
        const passed = audits.filter(a => a.score === 1);
        return (
          <CategorySection key={cat.id} title={cat.title} score={score}
            audits={audits} failed={failed} passed={passed} />
        );
      })}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex items-center justify-center h-40 text-gray-400 dark:text-gray-600">
      <p className="text-sm">Nenhum dado disponível. Execute uma análise primeiro.</p>
    </div>
  );
}
