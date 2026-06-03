export function getScoreColor(score) {
  if (score === null || score === undefined) return '#94a3b8';
  if (score >= 90) return '#0cce6b';
  if (score >= 50) return '#ffa400';
  return '#ff4e42';
}

export function getScoreLabel(score) {
  if (score === null || score === undefined) return '–';
  if (score >= 90) return 'Bom';
  if (score >= 50) return 'Melhorar';
  return 'Ruim';
}

export function formatMs(value) {
  if (value === undefined || value === null) return '–';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '–';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export function getMetricStatus(id, value) {
  const t = {
    'first-contentful-paint': { good: 1800, poor: 3000 },
    'largest-contentful-paint': { good: 2500, poor: 4000 },
    'total-blocking-time': { good: 200, poor: 600 },
    'cumulative-layout-shift': { good: 0.1, poor: 0.25 },
    'speed-index': { good: 3400, poor: 5800 },
    'interactive': { good: 3800, poor: 7300 },
    'server-response-time': { good: 200, poor: 600 },
    'dom-size': { good: 800, poor: 1500 },
  }[id];
  if (!t) return 'neutral';
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs';
  return 'poor';
}

export function statusColors(status) {
  return {
    good: { text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800' },
    needs: { text: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800' },
    poor: { text: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800' },
    neutral: { text: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-200 dark:border-gray-700' },
  }[status] || { text: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-200 dark:border-gray-700' };
}

export function getDirectAdvice(auditId) {
  const advice = {
    'render-blocking-resources': 'Adicione defer ou async nos scripts e inline o CSS crítico.',
    'unused-css-rules': 'Use PurgeCSS ou remova manualmente as classes CSS não utilizadas.',
    'unused-javascript': 'Remova, divida em chunks ou use lazy loading para JS não usado.',
    'uses-optimized-images': 'Converta para WebP/AVIF e comprima antes de fazer upload.',
    'uses-responsive-images': 'Use srcset para servir tamanhos corretos por dispositivo.',
    'offscreen-images': 'Adicione loading="lazy" em imagens abaixo da dobra.',
    'uses-text-compression': 'Ative Gzip ou Brotli no servidor.',
    'uses-long-cache-ttl': 'Defina Cache-Control com max-age longo para assets estáticos.',
    'efficient-animated-content': 'Converta GIFs animados para MP4 ou WebM.',
    'dom-size': 'Reduza elementos desnecessários, use virtualização para listas longas.',
    'uses-rel-preconnect': 'Adicione <link rel="preconnect"> para domínios externos críticos.',
    'font-display': 'Adicione font-display: swap no CSS das fontes.',
    'third-party-summary': 'Avalie scripts de terceiros e adie os não críticos.',
    'bootup-time': 'Profile e otimize o código JavaScript mais pesado.',
    'server-response-time': 'TTFB alto — otimize servidor, use CDN ou revise queries.',
    'total-byte-weight': 'Página pesada. Meta: abaixo de 1.6MB. Comprima e remova recursos.',
    'redirects': 'Aponte direto para a URL final, eliminando redirecionamentos.',
    'no-document-write': 'Substitua document.write() por métodos DOM modernos.',
    'uses-passive-event-listeners': 'Adicione { passive: true } em scroll/touch listeners.',
    'critical-request-chains': 'Reduza dependências encadeadas e priorize recursos essenciais.',
    'legacy-javascript': 'Configure Babel apenas para os browsers que realmente precisa suportar.',
    'duplicated-javascript': 'Revise dependências e use tree shaking para eliminar duplicatas.',
  };
  return advice[auditId] || null;
}

export function parseWaterfall(lhr) {
  const items = lhr?.audits?.['network-requests']?.details?.items || [];
  return items.map((item, i) => ({
    id: i,
    url: item.url || '',
    resourceType: item.resourceType || 'Other',
    startTime: item.startTime || 0,
    endTime: item.endTime || 0,
    transferSize: item.transferSize || 0,
    statusCode: item.statusCode || 200,
  })).sort((a, b) => a.startTime - b.startTime);
}

export function parseResources(lhr) {
  return lhr?.audits?.['resource-summary']?.details?.items || [];
}

export function parseFilmstrip(lhr) {
  return lhr?.audits?.['screenshot-thumbnails']?.details?.items || [];
}

export function parseLCPElement(lhr) {
  return lhr?.audits?.['largest-contentful-paint-element'];
}

export function parseCLSElements(lhr) {
  return lhr?.audits?.['layout-shift-elements'];
}

export function parseOpportunities(lhr) {
  if (!lhr?.audits) return [];
  return Object.values(lhr.audits).filter(a =>
    a.details?.type === 'opportunity' && a.score !== null && a.score < 1
  ).sort((a, b) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0));
}

export function parseDiagnostics(lhr) {
  if (!lhr?.audits) return [];
  const skip = ['first-contentful-paint','largest-contentful-paint','total-blocking-time',
    'cumulative-layout-shift','speed-index','interactive','performance-budget','timing-budget',
    'screenshot-thumbnails','final-screenshot','full-page-screenshot'];
  return Object.values(lhr.audits).filter(a =>
    a.score !== null && a.score < 1 &&
    a.details?.type !== 'opportunity' &&
    a.details?.type !== 'screenshot' &&
    a.details?.type !== 'filmstrip' &&
    !skip.includes(a.id)
  ).sort((a, b) => (a.score || 0) - (b.score || 0));
}

// Group network requests by resource type for diagnostics
export function groupRequestsByType(lhr) {
  const items = lhr?.audits?.['network-requests']?.details?.items || [];
  const groups = {};
  items.forEach(item => {
    const type = item.resourceType || 'Other';
    if (!groups[type]) groups[type] = [];
    groups[type].push(item);
  });
  return groups;
}

export function getFileName(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    return parts[parts.length - 1] || u.hostname;
  } catch { return url.slice(0, 50); }
}

export function getDomain(url) {
  try { return new URL(url).hostname; }
  catch { return url; }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
