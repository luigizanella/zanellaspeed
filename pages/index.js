import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/ui/Navbar';
import { generateId, getScoreColor } from '../lib/utils';

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('zs_apikey');
    if (saved) setApiKey(saved);
    const dark = localStorage.getItem('zs_dark');
    if (dark === 'true') setDarkMode(true);
    const hist = localStorage.getItem('zs_history');
    if (hist) setHistory(JSON.parse(hist));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('zs_dark', darkMode);
  }, [darkMode]);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('zs_apikey', key);
  };

  const handleAnalyze = async () => {
    if (!url.trim()) { setError('Digite uma URL para analisar.'); return; }
    if (!apiKey) { setError('Configure sua API Key clicando em ⚙️'); setShowSettings(true); return; }

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;

    setLoading(true);
    setError('');
    setLoadingStep('Iniciando análise mobile...');

    try {
      const id = generateId();

      const fetchStrategy = async (strategy) => {
        const res = await fetch(`/api/pagespeed?url=${encodeURIComponent(cleanUrl)}&strategy=${strategy}&apiKey=${encodeURIComponent(apiKey)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro na API');
        return data;
      };

      setLoadingStep('Analisando versão mobile...');
      const mobileData = await fetchStrategy('mobile');
      setLoadingStep('Analisando versão desktop...');
      const desktopData = await fetchStrategy('desktop');

      const getScore = (data, cat) => {
        const c = data?.lighthouseResult?.categories?.[cat];
        return c ? Math.round(c.score * 100) : null;
      };

      const entry = {
        id,
        url: cleanUrl,
        date: new Date().toISOString(),
        mobile: {
          performance: getScore(mobileData, 'performance'),
          seo: getScore(mobileData, 'seo'),
        },
        desktop: {
          performance: getScore(desktopData, 'performance'),
          seo: getScore(desktopData, 'seo'),
        },
      };

      // Save data to sessionStorage (for the report page)
      sessionStorage.setItem(`zs_report_${id}`, JSON.stringify({ mobileData, desktopData, url: cleanUrl }));

      // Save to history
      const newHistory = [entry, ...history].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('zs_history', JSON.stringify(newHistory));

      router.push(`/report/${id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleAnalyze(); };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('zs_history');
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const ScoreBadge = ({ score }) => (
    <span className="text-sm font-bold" style={{ color: getScoreColor(score) }}>{score ?? '–'}</span>
  );

  return (
    <>
      <Head>
        <title>ZanellaSpeed — Análise de Performance Web</title>
        <meta name="description" content="Dashboard profissional de análise de performance web" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sora transition-colors">
        <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)}
          showSettings={showSettings} onToggleSettings={() => setShowSettings(!showSettings)}
          apiKey={apiKey} onSaveApiKey={saveApiKey} />

        <main>
          {/* Hero */}
          <div className="relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0" />
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#2E3DF0]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
              {/* Icon */}
              <div className="inline-flex w-16 h-16 rounded-2xl bg-[#2E3DF0] items-center justify-center mb-6 shadow-xl shadow-[#2E3DF0]/30">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                Analise a performance<br />
                <span className="text-[#2E3DF0]">do seu site</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                Diagnóstico completo com métricas, requisições e oportunidades reais de melhoria para o seu site.
              </p>

              {/* URL Input */}
              <div className="flex gap-2 max-w-xl mx-auto">
                <div className="flex-1 relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <input type="url" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder="Digite a URL do site"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-sora placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E3DF0]/30 focus:border-[#2E3DF0] shadow-sm transition-all" />
                </div>
                <button onClick={handleAnalyze} disabled={loading}
                  className="flex items-center gap-2 px-6 py-3.5 bg-[#2E3DF0] hover:bg-[#1e2dd4] disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-lg shadow-[#2E3DF0]/30 transition-all active:scale-95 flex-shrink-0">
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {loading ? 'Analisando...' : 'Analisar'}
                </button>
              </div>

              {/* Loading step */}
              {loading && loadingStep && (
                <p className="text-sm text-[#2E3DF0] mt-3 animate-pulse-dot">{loadingStep}</p>
              )}

              {/* Error */}
              {error && (
                <div className="mt-3 flex items-center gap-2 justify-center text-sm text-red-500">
                  <span>⚠</span> {error}
                  <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-1">✕</button>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-3">
                Os testes de Mobile e Desktop serão executados simultaneamente.
              </p>
            </div>
          </div>

          {/* History */}
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
            {history.length > 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#2E3DF0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="font-bold text-gray-900 dark:text-white">Histórico de Análises</h2>
                  </div>
                  <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Limpar histórico
                  </button>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-[1fr_160px_80px_80px_80px_80px] gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  {['URL', 'DATA', 'MOBILE', 'DESKTOP', 'SEO M', 'SEO D'].map(h => (
                    <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
                  ))}
                </div>

                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {history.map(entry => (
                    <button key={entry.id} onClick={() => router.push(`/report/${entry.id}`)}
                      className="w-full grid grid-cols-[1fr_160px_80px_80px_80px_80px] gap-4 px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#2E3DF0] truncate transition-colors">
                        {entry.url}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(entry.date)}</span>
                      <ScoreBadge score={entry.mobile?.performance} />
                      <ScoreBadge score={entry.desktop?.performance} />
                      <ScoreBadge score={entry.mobile?.seo} />
                      <ScoreBadge score={entry.desktop?.seo} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">Seu histórico de análises aparecerá aqui</p>
              </div>
            )}
          </div>
        </main>

        <footer className="py-3 border-t border-gray-200 dark:border-gray-800 text-center mt-2">
          <p className="text-xs text-gray-400">ZanellaSpeed · Powered by Google PageSpeed Insights · Feito por Luigi Zanella</p>
        </footer>
      </div>
    </>
  );
}
