import { useState } from 'react';
import ScoreCircle from '../ui/ScoreCircle';
import QuickDiagTab from '../tabs/QuickDiagTab';
import WaterfallTab from '../tabs/WaterfallTab';
import FilmstripTab from '../tabs/FilmstripTab';
import CLSElementsTab from '../tabs/CLSElementsTab';
import LCPElementTab from '../tabs/LCPElementTab';
import OpportunitiesTab from '../tabs/OpportunitiesTab';
import { formatBytes, formatMs, getScoreColor, parseResources } from '../../lib/utils';

const TABS = [
  { id: 'quickdiag', label: 'Diagnóstico Rápido', icon: '🚀' },
  { id: 'waterfall', label: 'Waterfall', icon: '≋' },
  { id: 'filmstrip', label: 'Carregamento Visual', icon: '🎬' },
  { id: 'cls', label: 'Elementos CLS', icon: '⚡' },
  { id: 'lcp', label: 'Elemento LCP', icon: '🎯' },
  { id: 'opportunities', label: 'Oportunidades', icon: '💡' },
];

const CATEGORIES = [
  { id: 'performance', label: 'Performance' },
  { id: 'seo', label: 'SEO' },
  { id: 'best-practices', label: 'Boas Práticas' },
  { id: 'accessibility', label: 'Acessibilidade' },
];

const RES_COLORS = {
  script: '#f59e0b', stylesheet: '#8b5cf6', image: '#10b981',
  font: '#ec4899', document: '#2E3DF0', other: '#94a3b8', media: '#f97316',
};

export default function ReportView({ mobileData, desktopData, url, onReanalyze }) {
  const [device, setDevice] = useState('mobile');
  const [activeTab, setActiveTab] = useState('quickdiag');

  const data = device === 'mobile' ? mobileData : desktopData;
  const lhr = data?.lighthouseResult;

  const getScore = (catId) => {
    const cat = lhr?.categories?.[catId];
    return cat ? Math.round(cat.score * 100) : null;
  };

  const screenshot = lhr?.audits?.['final-screenshot']?.details?.data;
  const fetchTime = lhr?.fetchTime ? new Date(lhr.fetchTime).toLocaleString('pt-BR') : '';
  const finalUrl = lhr?.finalUrl || url;

  // Page details
  const resources = parseResources(lhr);
  const totalRow = resources.find(r => r.resourceType === 'total');
  const otherRes = resources.filter(r => r.resourceType !== 'total');
  const totalSize = totalRow?.transferSize || 0;
  const totalReqs = totalRow?.requestCount || 0;
  const loadTime = lhr?.audits?.['interactive']?.numericValue || 0;

  // Key metrics
  const metrics = [
    { id: 'first-contentful-paint', label: 'FCP' },
    { id: 'largest-contentful-paint', label: 'LCP' },
    { id: 'total-blocking-time', label: 'TBT' },
    { id: 'cumulative-layout-shift', label: 'CLS' },
    { id: 'speed-index', label: 'Speed Index' },
    { id: 'interactive', label: 'TTI' },
    { id: 'server-response-time', label: 'TTFB' },
    { id: 'dom-size', label: 'DOM' },
  ].map(m => ({ ...m, audit: lhr?.audits?.[m.id] }));

  // Domain breakdown
  const networkItems = lhr?.audits?.['network-requests']?.details?.items || [];
  const domainMap = {};
  networkItems.forEach(item => {
    try {
      const domain = new URL(item.url).hostname;
      if (!domainMap[domain]) domainMap[domain] = { count: 0, size: 0 };
      domainMap[domain].count++;
      domainMap[domain].size += item.transferSize || 0;
    } catch {}
  });
  const domains = Object.entries(domainMap).sort((a, b) => b[1].size - a[1].size).slice(0, 6);
  const totalDomainSize = domains.reduce((s, [, d]) => s + d.size, 0);

  // Apontamentos (top issues)
  const apontamentos = Object.values(lhr?.audits || {})
    .filter(a => a.score !== null && a.score < 0.9 && a.details?.type !== 'screenshot' && a.details?.type !== 'filmstrip')
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, 5);

  const apontColors = { Script: '#f59e0b', Stylesheet: '#8b5cf6', Image: '#10b981', Font: '#ec4899' };

  return (
    <div className="animate-fadeIn">
      {/* Top: Device switcher */}
      <div className="flex justify-center mb-6">
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {['mobile', 'desktop'].map(d => (
            <button key={d} onClick={() => setDevice(d)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all ${
                device === d ? 'bg-[#2E3DF0] text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              {d === 'mobile' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="7" y="2" width="10" height="20" rx="2" strokeWidth="2"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="2" y="4" width="20" height="14" rx="2" strokeWidth="2"/>
                  <line x1="8" y1="22" x2="16" y2="22" strokeWidth="2"/>
                  <line x1="12" y1="18" x2="12" y2="22" strokeWidth="2"/>
                </svg>
              )}
              {d === 'mobile' ? 'Mobile' : 'Desktop'}
            </button>
          ))}
        </div>
      </div>

      {/* Hero: Screenshot + Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Screenshot */}
        <div className="flex justify-center lg:justify-end">
          {screenshot ? (
            <div className={`${device === 'mobile' ? 'w-48' : 'w-full max-w-md'}`}>
              <div className={`border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl ${
                device === 'mobile' ? 'rounded-2xl border-[6px]' : 'rounded-xl'
              }`}>
                <img src={screenshot} alt="Screenshot" className="w-full h-auto block" />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md h-48 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <p className="text-sm text-gray-400">Screenshot indisponível</p>
            </div>
          )}
        </div>

        {/* Scores + Info */}
        <div className="flex flex-col justify-center space-y-5">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Relatório de performance:</h2>
            <div className="flex items-center gap-3">
              <a href={finalUrl} target="_blank" rel="noopener noreferrer"
                className="text-[#2E3DF0] hover:underline text-sm font-medium truncate max-w-xs">
                {finalUrl}
              </a>
              <button onClick={onReanalyze}
                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-[#2E3DF0] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 transition-colors flex-shrink-0">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Testar novamente
              </button>
            </div>
            {fetchTime && <p className="text-xs text-gray-400 mt-1">📅 {fetchTime}</p>}
          </div>

          {/* Score circles */}
          <div className="grid grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <ScoreCircle key={cat.id} score={getScore(cat.id)} label={cat.label} size={90} />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium flex-shrink-0 transition-all ${
              activeTab === tab.id
                ? 'bg-[#2E3DF0] text-white shadow-md shadow-[#2E3DF0]/20'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-[#2E3DF0]/40'
            }`}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mb-8">
        {activeTab === 'quickdiag' && <QuickDiagTab data={data} />}
        {activeTab === 'waterfall' && <WaterfallTab data={data} />}
        {activeTab === 'filmstrip' && <FilmstripTab data={data} />}
        {activeTab === 'cls' && <CLSElementsTab data={data} />}
        {activeTab === 'lcp' && <LCPElementTab data={data} />}
        {activeTab === 'opportunities' && <OpportunitiesTab data={data} />}
      </div>

      {/* Bottom: Metrics + Page Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métricas Principais */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white">Métricas Principais</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {metrics.map(m => {
              const v = m.audit?.numericValue;
              const display = m.audit?.displayValue || '–';
              const isCLS = m.id === 'cumulative-layout-shift';
              const isDom = m.id === 'dom-size';
              const status = v !== undefined ? (
                isCLS ? (v <= 0.1 ? 'good' : v <= 0.25 ? 'needs' : 'poor') :
                isDom ? (v <= 800 ? 'good' : v <= 1500 ? 'needs' : 'poor') :
                (v <= { 'first-contentful-paint': 1800, 'largest-contentful-paint': 2500, 'total-blocking-time': 200, 'speed-index': 3400, 'interactive': 3800, 'server-response-time': 200 }[m.id] ? 'good' :
                 v <= { 'first-contentful-paint': 3000, 'largest-contentful-paint': 4000, 'total-blocking-time': 600, 'speed-index': 5800, 'interactive': 7300, 'server-response-time': 600 }[m.id] ? 'needs' : 'poor')
              ) : 'neutral';
              const color = { good: 'text-emerald-500', needs: 'text-amber-500', poor: 'text-red-500', neutral: 'text-gray-400' }[status];
              return (
                <div key={m.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{m.label}</p>
                  <p className={`text-xl font-bold ${color}`}>{display}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{m.audit?.description?.slice(0, 60) || ''}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalhes da Página */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white">Detalhes da Página</h3>
          </div>
          <div className="p-5 space-y-5">
            {/* Load time hero */}
            <div className="text-center py-2">
              <p className="text-5xl font-bold text-gray-900 dark:text-white">
                {loadTime >= 1000 ? `${(loadTime/1000).toFixed(1)}s` : `${Math.round(loadTime)}ms`}
              </p>
              <p className="text-sm text-gray-400 mt-1">Tempo de Carregamento Completo</p>
            </div>

            {/* Size bar */}
            {totalSize > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tamanho Total — {formatBytes(totalSize)}</p>
                </div>
                <div className="flex h-6 rounded-lg overflow-hidden">
                  {otherRes.filter(r => r.transferSize > 0).sort((a, b) => b.transferSize - a.transferSize).map((r, i) => {
                    const pct = (r.transferSize / totalSize) * 100;
                    const color = RES_COLORS[r.resourceType] || '#94a3b8';
                    const label = { script: 'JS', stylesheet: 'CSS', image: 'IMG', font: 'Font', document: 'HTML', other: 'Outro' }[r.resourceType] || r.resourceType;
                    return pct > 2 ? (
                      <div key={i} className="flex items-center justify-center text-white text-[10px] font-bold overflow-hidden"
                        style={{ width: `${pct}%`, background: color }} title={`${label}: ${formatBytes(r.transferSize)}`}>
                        {pct > 8 ? label : ''}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Requests bar */}
            {totalReqs > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Total de Requisições — {totalReqs}</p>
                <div className="flex h-6 rounded-lg overflow-hidden">
                  {otherRes.filter(r => r.requestCount > 0).sort((a, b) => b.requestCount - a.requestCount).map((r, i) => {
                    const pct = (r.requestCount / totalReqs) * 100;
                    const color = RES_COLORS[r.resourceType] || '#94a3b8';
                    const label = { script: 'JS', stylesheet: 'CSS', image: 'IMG', font: 'Font', document: 'HTML' }[r.resourceType] || r.resourceType;
                    return pct > 2 ? (
                      <div key={i} className="flex flex-col items-center justify-center text-white text-[10px] font-bold overflow-hidden"
                        style={{ width: `${pct}%`, background: color }} title={`${label}: ${r.requestCount} req`}>
                        {pct > 8 ? <span>{label}</span> : null}
                        {pct > 12 ? <span className="opacity-75">{pct.toFixed(1)}%</span> : null}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Domains */}
            {domains.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Domínios — {domains.length}</p>
                <div className="flex h-6 rounded-lg overflow-hidden">
                  {domains.map(([domain, info], i) => {
                    const pct = totalDomainSize > 0 ? (info.size / totalDomainSize) * 100 : 0;
                    const colors = ['#2E3DF0', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#94a3b8'];
                    return pct > 1 ? (
                      <div key={i} className="flex items-center justify-center text-white text-[10px] font-bold overflow-hidden px-1"
                        style={{ width: `${pct}%`, background: colors[i % colors.length] }}
                        title={`${domain}: ${formatBytes(info.size)}`}>
                        {pct > 15 ? <span className="truncate">{domain.replace('www.', '')}</span> : ''}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Apontamentos */}
            {apontamentos.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Principais apontamentos — {apontamentos.length}</p>
                <div className="space-y-1.5">
                  {apontamentos.slice(0, 4).map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getScoreColor(a.score ? a.score * 100 : 0) }} />
                      <span className="truncate">{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
