import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  BookOpenCheck, 
  FileSpreadsheet,
  Building,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onLoginSuccess }) {
  const { login } = useAuth();
  const [role, setRole] = useState('faculty');
  const [email, setEmail] = useState('meenakshi.v@college.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleTabChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'faculty') {
      setEmail('meenakshi.v@college.edu');
    } else {
      setEmail('hod.cse@college.edu');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(role, { email });
      setIsLoading(false);
      if (onLoginSuccess) onLoginSuccess();
    }, 400);
  };

  const handleQuickLogin = (selectedRole) => {
    setIsLoading(true);
    setTimeout(() => {
      login(selectedRole);
      setIsLoading(false);
      if (onLoginSuccess) onLoginSuccess();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 items-center justify-center shadow-xl shadow-indigo-600/30 ring-1 ring-white/20 mx-auto">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
          Academic Performance & University Result Analyzer
        </h1>
        <p className="text-xs text-slate-400">
          Institutional Educational Intelligence & Examination Analytics Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 glass-panel space-y-6">
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleRoleTabChange('faculty')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                role === 'faculty'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              Faculty Login
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('admin')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin / HOD
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Official Institutional Email
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="name@college.edu"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <a href="#demo" onClick={(e) => { e.preventDefault(); handleQuickLogin(role); }} className="text-[11px] text-indigo-400 hover:text-indigo-300">
                  Auto-fill demo credentials
                </a>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0" />
                <span>Keep me signed in</span>
              </label>
              <span className="text-slate-500 text-[11px]">Protected by Supabase Auth</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In to Academic Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Fast-Pills */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
              Instant Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('faculty')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition group cursor-pointer"
              >
                <div className="text-[11px] font-semibold text-indigo-400 group-hover:text-indigo-300">
                  Demo Faculty
                </div>
                <div className="text-[10px] text-slate-400 truncate">Dr. V. Meenakshi (CSE)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition group cursor-pointer"
              >
                <div className="text-[11px] font-semibold text-cyan-400 group-hover:text-cyan-300">
                  Demo Admin / HOD
                </div>
                <div className="text-[10px] text-slate-400 truncate">Dr. R. Ramanathan</div>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights beneath Card */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <BookOpenCheck className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span>IA-1 & IA-2 Continuous Evaluation</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>University PDF Result & Arrear Tracker</span>
          </div>
        </div>
      </div>
    </div>
  );
}
