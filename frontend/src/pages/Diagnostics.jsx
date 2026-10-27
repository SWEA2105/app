import React, { useState } from 'react';
import { 
  Terminal, 
  KeyRound,
  FolderTree,
  Smartphone,
  Wifi,
  Save,
  RotateCcw,
  Check
} from 'lucide-react';
import HealthWidget from '../components/common/HealthWidget';
import { getActiveApiBaseUrl, setCustomApiBaseUrl } from '../services/api';

export default function Diagnostics({ healthData, isLoadingHealth, onRefreshHealth }) {
  const [currentApiUrl, setCurrentApiUrl] = useState(() => getActiveApiBaseUrl());
  const [customInput, setCustomInput] = useState(() => getActiveApiBaseUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isNativeCapacitor = typeof window !== 'undefined' && Boolean(
    window.Capacitor?.isNativePlatform?.() ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'ionic:'
  );

  const platformName = isNativeCapacitor 
    ? (window.Capacitor?.getPlatform?.() || (/android/i.test(navigator.userAgent) ? 'Android (Native)' : 'iOS (Native)'))
    : 'Web Browser (Responsive)';

  const handleSaveApiUrl = (urlToSave) => {
    const updated = setCustomApiBaseUrl(urlToSave);
    setCurrentApiUrl(updated);
    setCustomInput(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    onRefreshHealth();
  };

  const handleResetDefault = () => {
    const reset = setCustomApiBaseUrl('');
    setCurrentApiUrl(reset);
    setCustomInput(reset);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    onRefreshHealth();
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
        <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
          <Terminal className="h-5 w-5 text-indigo-400 shrink-0" />
          Full-Stack Architecture &amp; Mobile Diagnostics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed runtime verification for Python FastAPI, React Vite, Capacitor Android/iOS bridging, and API connectivity.
        </p>
      </div>

      {/* Main Health Monitor */}
      <HealthWidget
        healthData={healthData}
        isLoading={isLoadingHealth}
        onRefresh={onRefreshHealth}
      />

      {/* Mobile App & Capacitor Runtime Configuration Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Mobile &amp; Capacitor Network Configuration
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                  isNativeCapacitor
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                }`}>
                  {platformName}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Active Target: <span className="text-cyan-400 font-mono font-medium">{currentApiUrl}</span> • Configure backend host without rebuilding the app.
              </p>
            </div>
          </div>

          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 shrink-0 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              <Check className="h-3.5 w-3.5" /> API Host Updated!
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Wifi className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. http://192.168.1.100:8000 or http://10.0.2.2:8000"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-xs font-mono text-white focus:outline-none focus:border-cyan-500 min-h-[44px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveApiUrl(customInput)}
                className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save &amp; Test</span>
              </button>
              <button
                type="button"
                onClick={handleResetDefault}
                className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                title="Reset to default environment resolution"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
            <span className="text-slate-500 font-medium">Quick Presets:</span>
            <button
              type="button"
              onClick={() => handleSaveApiUrl('http://10.0.2.2:8000')}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 font-mono text-slate-300 active:scale-95 cursor-pointer"
            >
              Android Emulator (10.0.2.2:8000)
            </button>
            <button
              type="button"
              onClick={() => handleSaveApiUrl('http://127.0.0.1:8000')}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 font-mono text-slate-300 active:scale-95 cursor-pointer"
            >
              Desktop / iOS Simulator (127.0.0.1:8000)
            </button>
          </div>
        </div>
      </div>

      {/* Architecture & Next Steps Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-cyan-400" />
            Verified Environment Stack
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-medium">Frontend Framework</span>
              <span className="font-mono text-cyan-400">React 19 + Vite + Tailwind v4</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-medium">Backend REST Framework</span>
              <span className="font-mono text-emerald-400">Python 3.14 + FastAPI + Pydantic v2</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-medium">Mobile Native Bridge</span>
              <span className="font-mono text-indigo-400">Capacitor v8 (Android &amp; iOS)</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-medium">Analysis Engines</span>
              <span className="font-mono text-indigo-400">Pandas 3.0 &amp; NumPy 2.5</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-medium">PDF Extraction Engines</span>
              <span className="font-mono text-purple-400">PyMuPDF 2.0 &amp; pdfplumber 0.11</span>
            </li>
          </ul>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-400" />
            Capacitor Build &amp; Deployment Notes
          </h3>
          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              When preparing builds for physical test devices or app store submission:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
              <li>Run <span className="text-cyan-400 font-mono">npm run build</span> to generate the web bundle into <span className="text-white font-mono">dist</span>.</li>
              <li>Sync changes to Android with <span className="text-cyan-400 font-mono">npx cap sync android</span>.</li>
              <li>For iOS, run <span className="text-cyan-400 font-mono">npx cap sync ios</span>.</li>
              <li>Open Android Studio with <span className="text-indigo-400 font-mono">npx cap open android</span> or Xcode with <span className="text-indigo-400 font-mono">npx cap open ios</span>.</li>
            </ol>
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px]">
              Note: Network security config allows cleartext traffic for local testing in development. For production deployment, configure your HTTPS production domain.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

