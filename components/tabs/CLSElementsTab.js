export default function CLSElementsTab({ data }) {
  const lhr = data?.lighthouseResult;
  if (!lhr) return <Empty />;

  const clsAudit = lhr.audits?.['cumulative-layout-shift'];
  const clsElements = lhr.audits?.['layout-shift-elements'];
  const clsValue = clsAudit?.numericValue;
  const clsDisplay = clsAudit?.displayValue || '–';
  const items = clsElements?.details?.items || [];

  const clsColor = clsValue <= 0.1 ? '#0cce6b' : clsValue <= 0.25 ? '#ffa400' : '#ff4e42';
  const clsStatus = clsValue <= 0.1 ? 'Bom' : clsValue <= 0.25 ? 'Melhorar' : 'Ruim';

  return (
    <div className="tab-content space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Elementos CLS</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Elementos que se movem durante o carregamento e causam instabilidade visual.
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-3xl font-bold" style={{ color: clsColor }}>{clsDisplay}</p>
            <p className="text-xs" style={{ color: clsColor }}>{clsStatus}</p>
          </div>
        </div>

        {/* CLS scale */}
        <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400" />
          <span className="text-emerald-500">≤0.1 Bom</span>
          <span className="text-amber-500">≤0.25 Melhorar</span>
          <span className="text-red-500">&gt;0.25 Ruim</span>
        </div>
      </div>

      {/* Elements */}
      {items.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
              Elementos causando layout shift ({items.length})
            </h4>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {items.map((item, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    {item.node?.nodeLabel && (
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">{item.node.nodeLabel}</p>
                    )}
                    {item.node?.snippet && (
                      <code className="text-xs text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded block truncate">
                        {item.node.snippet}
                      </code>
                    )}
                    {item.score !== undefined && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                        Score de shift: {item.score?.toFixed ? item.score.toFixed(4) : item.score}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : clsValue <= 0.1 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <svg className="w-12 h-12 mb-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium text-emerald-600 dark:text-emerald-400">Nenhum layout shift significativo</p>
          <p className="text-sm text-gray-400 mt-1">A página está visualmente estável</p>
        </div>
      ) : (
        <div className="flex items-center justify-center h-24 text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <p className="text-sm">Elementos CLS não identificados nesta análise.</p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <p className="text-xs font-bold text-[#2E3DF0] uppercase tracking-wider mb-3">💡 Como reduzir o CLS</p>
        <ul className="space-y-2">
          {[
            'Defina largura e altura explícitos em todas as imagens e vídeos',
            'Use altura mínima nas seções para reservar espaço',
            'Revise scripts que manipulam o tamanho dos elementos via JavaScript no carregamento',
            'Reserve espaço para anúncios e embeds antes de carregarem',
            'Use font-display: swap e pré-carregue fontes para evitar saltos de texto',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-[#2E3DF0] font-bold flex-shrink-0">{i + 1}.</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
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
