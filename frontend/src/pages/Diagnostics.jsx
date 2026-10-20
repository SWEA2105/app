import React from 'react';
import { 
  Database, 
  Server, 
  Cpu, 
  Terminal, 
  ShieldAlert, 
  CheckCircle, 
  KeyRound,
  FileCode2,
  FolderTree
} from 'lucide-react';
import HealthWidget from '../components/common/HealthWidget';

export default function Diagnostics({ healthData, isLoadingHealth, onRefreshHealth }) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Terminal className="h-5 w-5 text-indigo-400" />
          Full-Stack Architecture & Diagnostics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed runtime verification for Python FastAPI, React Vite, Supabase connectivity, and system libraries.
        </p>
      </div>

      {/* Main Health Monitor */}
      <HealthWidget
        healthData={healthData}
        isLoading={isLoadingHealth}
        onRefresh={onRefreshHealth}
      />

      {/* Architecture & Next Steps Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
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
              <span className="font-medium">Analysis Engines</span>
              <span className="font-mono text-indigo-400">Pandas 3.0 & NumPy 2.5</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-medium">PDF Extraction Engines</span>
              <span className="font-mono text-purple-400">PyMuPDF 2.0 & pdfplumber 0.11</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-medium">Charts & Visuals</span>
              <span className="font-mono text-amber-400">Recharts & Lucide Icons</span>
            </li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-400" />
            Supabase Setup Guidance (For Phase 2)
          </h3>
          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              The system is designed with strict security standards. When you are ready to connect your Supabase project:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
              <li>Log in to your <span className="text-white">Supabase Dashboard</span> and create a new project.</li>
              <li>Navigate to <span className="text-white">Project Settings &rarr; API</span>.</li>
              <li>Copy your <span className="text-indigo-400 font-mono">Project URL</span> and <span className="text-indigo-400 font-mono">anon public key</span>.</li>
              <li>Paste them into <span className="text-cyan-400 font-mono">backend/.env</span> and <span className="text-cyan-400 font-mono">frontend/.env</span>.</li>
            </ol>
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px]">
              Tip: In Phase 2, we will provide the complete SQL script with tables, Row-Level Security (RLS), and sample seeds to execute in your Supabase SQL editor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
