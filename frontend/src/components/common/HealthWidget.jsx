import React, { useState } from 'react';
import { 
  Server, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Database, 
  Cpu, 
  RefreshCw, 
  Code2, 
  FileCheck,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { healthApi } from '../../services/api';

export default function HealthWidget({ healthData, isLoading, onRefresh }) {
  const [testResult, setTestResult] = useState(null);
  const [testingPing, setTestingPing] = useState(false);

  const handleRunPing = async () => {
    setTestingPing(true);
    const start = performance.now();
    try {
      const res = await healthApi.ping();
      const elapsed = Math.round(performance.now() - start);
      setTestResult({
        success: true,
        endpoint: '/api/health/ping',
        latency: `${elapsed}ms`,
        payload: res,
      });
    } catch (err) {
      setTestResult({
        success: false,
        endpoint: '/api/health/ping',
        error: err.message,
      });
    } finally {
      setTestingPing(false);
    }
  };

  const isHealthy = healthData?.data?.status === 'healthy';
  const services = healthData?.data?.services || {};

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 glass-panel p-4 sm:p-6 space-y-5 sm:space-y-6">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <Server className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex flex-wrap items-center gap-2">
              Full-Stack Diagnostics & Health Monitor
              {isHealthy ? (
                <span className="flex items-center gap-1 text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="h-3 w-3" /> Live & Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <XCircle className="h-3 w-3" /> Unreachable
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time synchronization between React Vite client and FastAPI backend service
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleRunPing}
            disabled={testingPing}
            className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            {testingPing ? 'Testing...' : 'Test Ping'}
          </button>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-medium transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Grid of service cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Backend Server */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Backend Server</span>
            <span className="p-1 rounded bg-slate-800 text-slate-300">FastAPI</span>
          </div>
          <div className="text-base font-bold text-white flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            {isHealthy ? 'Operational' : 'Offline'}
          </div>
          <div className="text-[11px] text-slate-400">
            Port: <span className="font-mono text-slate-300">8000</span> | Host: <span className="font-mono text-slate-300">127.0.0.1</span>
          </div>
        </div>

        {/* Python Environment */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Python Engine</span>
            <Cpu className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">
            Python {healthData?.data?.python_version || '3.14.x'}
          </div>
          <div className="text-[11px] text-slate-400">
            Environment: <span className="capitalize text-slate-300">{healthData?.data?.environment || 'Development'}</span>
          </div>
        </div>

        {/* Analysis & PDF Stack */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Analysis & PDF Stack</span>
            <FileCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" /> Installed & Ready
          </div>
          <div className="text-[11px] text-slate-400">
            Pandas, NumPy, PyMuPDF, pdfplumber
          </div>
        </div>

        {/* Supabase Status */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Supabase Auth/DB</span>
            <Database className="h-4 w-4 text-emerald-400" />
          </div>
          <div className={`text-sm font-semibold flex items-center gap-1.5 ${
            healthData?.data?.supabase_connected ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {healthData?.data?.supabase_connected ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" /> Connected
              </>
            ) : (
              <>
                <KeyRound className="h-3.5 w-3.5" /> Standby (Phase 2)
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            {healthData?.data?.supabase_connected ? 'PostgreSQL RLS Active' : 'Configure keys in .env'}
          </div>
        </div>
      </div>

      {/* Ping test interactive console */}
      {testResult && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-cyan-400">Endpoint: {testResult.endpoint}</span>
            <span className="text-emerald-400 font-bold">{testResult.latency}</span>
          </div>
          <pre className="text-slate-300 text-[11px] overflow-x-auto p-2 bg-slate-900 rounded border border-slate-800">
            {JSON.stringify(testResult.payload || testResult.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
