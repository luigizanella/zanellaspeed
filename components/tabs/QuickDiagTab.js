import { formatBytes, getFileName } from '../../lib/utils';

const TYPE_CONFIG = {
  Script: { label: 'JS', color: '#f59e0b', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', icon: '⚡', title: 'JavaScript', advice: 'Há diversos arquivos Javascript sendo requisitados. Adie a execução de scripts não críticos usando defer ou async, e considere unificar arquivos menores.' },
  Stylesheet: { label: 'CSS', color: '#8b5cf6', bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', icon: '🎨', title: 'CSS', advice: 'Arquivos CSS bloqueiam a renderização. Inline o CSS crítico e adie o restante. Remova regras não utilizadas com PurgeCSS.' },
  Image: { label: 'IMG', color: '#10b981', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', icon: '🖼️', title: 'Imagens', advice: 'Otimize as imagens para ficarem abaixo de 100KB. Converta para WebP ou AVIF. Use srcset para servir tamanhos adequados por dispositivo.' },
  Font: { label: 'Font', color: '#ec4899', bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300', icon: '🔤', title: 'Fontes', advice: 'Suba as fontes localmente no seu domínio para evitar requisições externas e faça o pré-carregamento com <link rel="preload">.' },
  Document: { label: 'HTML', color: '#2E3DF0', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', icon: '📄', title: 'HTML', advice: 'Reduza o tamanho do HTML removendo comentários, espaços desnecessários e inline scripts/styles.' },
  XHR: { label: 'XHR', color: '#06b6d4', bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-300', icon: '🔗', title: 'Requisições', advice: 'Há requisições externas nessa página. Se possível, concentre todas as requisições para o seu próprio domínio.' },
  Fetch: { label: 'Fetch', color: '#06b6d4', bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-300', icon: '🔗', title: 'Fetch', advice: 'Reduza requisições externas. Cada requisição adiciona latência ao carregamento.' },
  Media: { label: 'Media', color: '#f97316', bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', icon: '🎬', title: 'Mídia', advice: 'Arquivos de mídia pesados. Otimize vídeos com compressão adequada e use formatos modernos.' },
  Other: { label: 'Outro', color: '#94a3b8', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: '📦', title: 'Outros', advice: 'Recursos não classificados. Verifique se todos são necessários.' },
};

const SIZE_THRESHOLD = 100 * 1024; // 100KB

function ResourceItem({ item }) {
  const name = getFileName(item.url);
  const isHeavy = item.transferSize > SIZE_THRESHOLD;
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
      <a href={item.url} target="_blank" rel="noopener noreferrer"
        className="flex-1 text-xs font-mono text-gray-600 dark:text-gray-400 hover:text-[#2E3DF0] truncate"
        title={item.url}>
        {name || item.url.slice(0, 60)}
      </a>
      {item.transferSize > 0 && (
        <span className={`text-xs font-semibold flex-shrink-0 ${isHeavy ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
          {formatBytes(item.transferSize)}
        </span>
      )}
      {item.statusCode >= 400 && (
        <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
          {item.statusCode}
        </span>
      )}
    </div>
  );
}

function ResourceGroup({ type, items }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.Other;
  const totalSize = items.reduce((s, i) => s + (i.transferSize || 0), 0);
  const heavyItems = items.filter(i => i.transferSize > SIZE_THRESHOLD);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex items-start gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${config.bg} ${config.text}`}>
          {config.label}
        </span>
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">{config.title}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">{config.advice}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{items.length} arquivo{items.length !== 1 ? 's' : ''}</p>
          <p className="text-xs text-gray-400">{formatBytes(totalSize)}</p>
        </div>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
        {items.map((item, i) => <ResourceItem key={i} item={item} />)}
      </div>
      {heavyItems.length > 0 && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950/20 border-t border-red-100 dark:border-red-900/30">
          <p className="text-xs text-red-600 dark:text-red-400">
            ⚠ {heavyItems.length} arquivo{heavyItems.length !== 1 ? 's' : ''} acima de 100KB — otimize para melhorar a performance
          </p>
        </div>
      )}
    </div>
  );
}

export default function QuickDiagTab({ data }) {
  const lhr = data?.lighthouseResult;
  if (!lhr) return <EmptyState />;

  const items = lhr?.audits?.['network-requests']?.details?.items || [];
  if (items.length === 0) return <EmptyState msg="Dados de requisições não disponíveis." />;

  // Group by type
  const groups = {};
  items.forEach(item => {
    const type = item.resourceType || 'Other';
    if (!groups[type]) groups[type] = [];
    groups[type].push(item);
  });

  // Order: Script, Stylesheet, Image, Font, Document, then rest
  const order = ['Script', 'Stylesheet', 'Image', 'Font', 'Document', 'XHR', 'Fetch', 'Media', 'Other'];
  const sorted = order.filter(t => groups[t]).concat(Object.keys(groups).filter(t => !order.includes(t)));

  const totalRequests = items.length;
  const totalSize = items.reduce((s, i) => s + (i.transferSize || 0), 0);
  const heavyCount = items.filter(i => i.transferSize > SIZE_THRESHOLD).length;

  return (
    <div className="tab-content space-y-4">
      {/* Summary */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Veja o que pode melhorar</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Verificações práticas baseadas nas requisições da página</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRequests}</p>
            <p className="text-xs text-gray-400">Total de requisições</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatBytes(totalSize)}</p>
            <p className="text-xs text-gray-400">Tamanho total</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${heavyCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{heavyCount}</p>
            <p className="text-xs text-gray-400">Arquivos pesados (+100KB)</p>
          </div>
        </div>
      </div>

      {sorted.map(type => (
        <ResourceGroup key={type} type={type} items={groups[type]} />
      ))}
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div className="flex items-center justify-center h-40 text-gray-400 dark:text-gray-600">
      <p className="text-sm">{msg || 'Nenhum dado disponível. Execute uma análise primeiro.'}</p>
    </div>
  );
}
