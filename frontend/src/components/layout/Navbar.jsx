import React from 'react';
import { 
  GraduationCap, 
  RefreshCw, 
  User, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ healthState, onRefreshHealth, isRefreshing, mobileMenuOpen, setMobileMenuOpen }) {
  const { user, logout, switchRole } = useAuth();
  const isHealthy = healthState?.status === 'healthy';
  const isOffline = healthState?.isError;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Brand Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 shrink-0">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            Academic Performance & Result Analyzer
            <span className="hidden sm:inline text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              v1.0
            </span>
          </h1>
          <p className="hidden sm:block text-xs text-slate-400">Institutional Analytics & University Examination Intelligence</p>
        </div>
      </div>

      {/* Right controls: Health status + User profile + Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real-time Backend Health Indicator */}
        <div 
          className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isHealthy 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : isOffline
              ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}
          title="Backend API Connection Health"
        >
          <span className="relative flex h-2 w-2">
            {isHealthy && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isHealthy ? 'bg-emerald-500' : isOffline ? 'bg-rose-500' : 'bg-amber-500'
            }`}></span>
          </span>

          <span className="hidden md:inline text-[11px]">
            {isHealthy ? 'Backend Online' : isOffline ? 'Backend Offline' : 'Connecting...'}
          </span>

          {healthState?.latency && (
            <span className="text-[10px] text-slate-400 bg-slate-800/60 px-1 py-0.5 rounded hidden sm:inline">
              {healthState.latency}ms
            </span>
          )}

          <button 
            onClick={onRefreshHealth}
            disabled={isRefreshing}
            className="hover:text-white transition-colors ml-0.5 p-0.5 rounded hover:bg-slate-800 disabled:opacity-50"
            title="Check Health Now"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* User / Faculty Pill */}
        {user && (
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-900 border border-indigo-500/30 flex items-center justify-center text-indigo-200 font-bold text-xs shrink-0">
              {user.avatar || 'FA'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                {user.name}
                {user.role === 'admin' ? (
                  <ShieldCheck className="h-3 w-3 text-cyan-400" />
                ) : (
                  <UserCheck className="h-3 w-3 text-indigo-400" />
                )}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                {user.role} • Dept of {user.department}
              </div>
            </div>

            {/* Role switch toggle pill */}
            <button
              onClick={() => switchRole(user.role === 'admin' ? 'faculty' : 'admin')}
              className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hidden sm:block"
              title="Toggle Role Simulation"
            >
              Switch to {user.role === 'admin' ? 'Faculty' : 'Admin'}
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
