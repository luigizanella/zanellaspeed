import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../../components/ui/Navbar';
import ReportView from '../../components/ui/ReportView';

export default function ReportPage() {
  const router = useRouter();
  const { id } = router.query;
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('zs_apikey');
    if (saved) setApiKey(saved);
    const dark = localStorage.getItem('zs_dark');
    if (dark === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('zs_dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!id) return;
    const stored = sessionStorage.getItem(`zs_report_${id}`);
    if (stored) {
      setReportData(JSON.parse(stored));
      setLoading(false);
    } else {
      // Try from history
      const hist = localStorage.getItem('zs_history');
      if (hist) {
        const history = JSON.parse(hist);
        const entry = history.find(e => e.id === id);
        if (entry) {
          setError('Os dados detalhados desta análise não estão mais disponíveis. Faça uma nova análise.');
        } else {
          setError('Análise não encontrada.');
        }
      } else {
        setError('Análise não encontrada.');
      }
      setLoading(false);
    }
  }, [id]);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('zs_apikey', key);
  };

  const handleReanalyze = async () => {
    if (!reportData?.url || !apiKey) {
      setShowSettings(true);
      return;
    }
    setReanalyzing(true);
    try {
      const fetchStrategy = async (strategy) => {
        const res = await fetch(`/api/pagespeed?url=${encodeURIComponent(reportData.url)}&strategy=${strategy}&apiKey=${encodeURIComponent(apiKey)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro na API');
        return data;
      };
      const [mobileData, desktopData] = await Promise.all([
        fetchStrategy('mobile'),
        fetchStrategy('desktop'),
      ]);
      const newData = { ...reportData, mobileData, desktopData };
      sessionStorage.setItem(`zs_report_${id}`, JSON.stringify(newData));
      setReportData(newData);
    } catch (err) {
      setError(err.message);
    }
    setReanalyzing(false);
  };

  const pageTitle = reportData?.url ? `${reportData.url} — ZanellaSpeed` : 'ZanellaSpeed';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sora transition-colors">
        <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)}
          showSettings={showSettings} onToggleSettings={() => setShowSettings(!showSettings)}
          apiKey={apiKey} onSaveApiKey={saveApiKey} />

        <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
          {/* Back button */}
          <button onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#2E3DF0] mb-6 transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
              <span className="text-red-500">⚠</span>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              <button onClick={() => router.push('/')} className="ml-auto text-sm text-[#2E3DF0] hover:underline">
                Nova análise →
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <svg className="w-8 h-8 animate-spin-slow text-[#2E3DF0]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Carregando relatório...</p>
            </div>
          )}

          {/* Reanalyzing overlay */}
          {reanalyzing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
                <svg className="w-8 h-8 animate-spin-slow text-[#2E3DF0]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="font-semibold text-gray-900 dark:text-white">Reanalisando...</p>
                <p className="text-sm text-gray-400">Isso pode levar até 60 segundos</p>
              </div>
            </div>
          )}

          {/* Report */}
          {!loading && reportData && !error && (
            <ReportView
              mobileData={reportData.mobileData}
              desktopData={reportData.desktopData}
              url={reportData.url}
              onReanalyze={handleReanalyze}
            />
          )}
        </main>

        <footer className="py-6 border-t border-gray-200 dark:border-gray-800 text-center mt-8">
          <p className="text-xs text-gray-400">ZanellaSpeed · Powered by Google PageSpeed Insights · Feito por Luigi Zanella</p>
        </footer>
      </div>
    </>
  );
}
