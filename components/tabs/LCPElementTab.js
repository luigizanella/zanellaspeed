import { formatMs } from '../../lib/utils';

export default function LCPElementTab({ data }) {
  const lhr = data?.lighthouseResult;
  if (!lhr) return <Empty />;

  const lcpAudit = lhr.audits?.['largest-contentful-paint'];
  const lcpElement = lhr.audits?.['largest-contentful-paint-element'];
  const lcpPhases = lhr.audits?.['lcp-lazy-loaded'];
  const screenshot = lhr.audits?.['final-screenshot']?.details?.data;

  const lcpValue = lcpAudit?.numericValue;
  const lcpDisplay = lcpAudit?.displayValue || '–';

  const elementItems = lcpElement?.details?.items || [];
  const element = elementItems[0]?.node;

  // LCP phases from audit
  const phasesAudit = lhr.audits?.['largest-contentful-paint-element'];

  const phases = [
    { label: 'Tempo até Primeiro Byte (TTFB)', key: 'ttfb', value: lhr.audits?.['server-response-time']?.numericValue },
    { label: 'Atraso de Carregamento do Recurso', key: 'resourceDelay', value: null },
    { label: 'Duração do Carregamento do Recurso', key: 'resourceLoad', value: null },
    { label: 'Atraso de Renderização do Elemento', key: 'renderDelay', value: null },
  ];

  const lcpColor = lcpValue <= 2500 ? '#0cce6b' : lcpValue <= 4000 ? '#ffa400' : '#ff4e42';

  return (
    <div className="tab-content space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
              Elemento LCP (Largest Contentful Paint)
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              O maior elemento visível na viewport durante o carregamento.
              {lcpDisplay && <span className="font-semibold" style={{ color: lcpColor }}> Tempo: {lcpDisplay}</span>}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-3xl font-bold" style={{ color: lcpColor }}>{lcpDisplay}</p>
            <p className="text-xs text-gray-400">LCP</p>
          </div>
        </div>
      </div>

      {/* Element details */}
      {element ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-5">
            <div className="flex gap-5">
              {/* Thumbnail */}
              {screenshot && (
                <div className="flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                  <img src={screenshot} alt="LCP element area" className="w-full h-full object-cover object-top" />
                </div>
              )}

              <div className="flex-1 space-y-3">
                {element.type && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo:</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#2E3DF0]/10 text-[#2E3DF0] border border-[#2E3DF0]/20">
                      {element.type}
                    </span>
                  </div>
                )}

                {element.nodeLabel && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Conteúdo do elemento:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                      {element.nodeLabel}
                    </p>
                  </div>
                )}

                {element.snippet && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">HTML do elemento:</p>
                    <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg block overflow-x-auto whitespace-pre-wrap break-all">
                      {element.snippet}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advice */}
          <div className="mx-5 mb-5 p-4 bg-[#2E3DF0]/5 border border-[#2E3DF0]/20 rounded-xl">
            <p className="text-xs font-bold text-[#2E3DF0] uppercase tracking-wider mb-2">💡 Como melhorar o LCP</p>
            <ul className="space-y-1.5">
              {[
                'Pré-carregue o recurso LCP com <link rel="preload">',
                'Se for imagem CSS de fundo, troque para uma tag <img> para melhor descoberta',
                'Otimize o TTFB — melhore o tempo de resposta do servidor',
                'Elimine recursos que bloqueiam renderização antes do elemento LCP',
                'Comprima e otimize a imagem LCP',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="text-[#2E3DF0] font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <p className="text-sm text-gray-400">Elemento LCP não identificado nesta análise.</p>
        </div>
      )}

      {/* LCP lazy loaded warning */}
      {lhr.audits?.['lcp-lazy-loaded']?.score === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">⚠ Imagem LCP com lazy loading</p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            O elemento LCP usa loading="lazy", o que atrasa o carregamento. Remova o lazy loading deste elemento específico.
          </p>
        </div>
      )}
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
