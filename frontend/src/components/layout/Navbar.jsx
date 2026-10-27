import React from 'react';
import { 
  RefreshCw, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CollegeBrand from '../common/CollegeBrand';

export default function Navbar({ healthState, onRefreshHealth, isRefreshing, mobileMenuOpen, setMobileMenuOpen, onStudentLogin }) {
  const { user, logout, switchRole } = useAuth();
  const isHealthy = healthState?.status === 'healthy';
  const isOffline = healthState?.isError;
  const isStudent = user?.role === 'student';

  return (
    <header 
      className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl px-2.5 sm:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0 transition-all"
      style={{ 
        minHeight: 'calc(3.75rem + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 0.75rem)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 0.75rem)'
      }}
    >
      {/* Brand Title & Mobile Toggle: Logo on Left, College Name on Right */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
          style={{ minHeight: '44px', minWidth: '44px' }}
          aria-label={mobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <CollegeBrand variant="navbar" className="flex-1" />
      </div>

      {/* Right controls: Health status + Student login + User profile + Logout */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Real-time Backend Health Indicator */}
        <div 
          onClick={onRefreshHealth}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer select-none active:scale-95 min-h-[38px] ${
            isHealthy 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : isOffline
              ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}
          title="Backend API Connection Health (Tap to refresh)"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onRefreshHealth(); }}
        >
          <span className="relative flex h-2 w-2">
            {isHealthy && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isHealthy ? 'bg-emerald-500' : isOffline ? 'bg-rose-500' : 'bg-amber-500'
            }`}></span>
          </span>

          <span className="hidden sm:inline text-[11px]">
            {isHealthy ? 'Online' : isOffline ? 'Offline' : 'Connecting...'}
          </span>

          {healthState?.latency && (
            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1 py-0.5 rounded font-mono hidden md:inline">
              {healthState.latency}ms
            </span>
          )}

          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onRefreshHealth(); }}
            disabled={isRefreshing}
            className="hover:text-white transition-colors p-0.5 rounded hover:bg-slate-800 disabled:opacity-50"
            aria-label="Refresh backend health"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Student sign-in shortcut */}
        {onStudentLogin && (
          <button
            onClick={onStudentLogin}
            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300 transition cursor-pointer active:scale-95"
            style={{ minHeight: '38px' }}
            title="Sign in as a student"
          >
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Student Portal</span>
            <span className="sm:hidden text-[10px]">Portal</span>
          </button>
        )}


        {/* User / Faculty Pill */}
        {user && (
          <div className="flex items-center gap-2 pl-1 sm:pl-2.5 border-l border-slate-800">
            <div 
              className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-900 border border-indigo-500/30 flex items-center justify-center text-indigo-200 font-bold text-xs shrink-0 select-none shadow-sm"
              title={`${user.name} (${user.role})`}
            >
              {user.avatar || 'FA'}
            </div>
            
            <div className="hidden lg:block text-left max-w-[130px] truncate">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1 truncate">
                <span className="truncate">{user.name}</span>
                {isStudent ? (
                  <GraduationCap className="h-3 w-3 text-emerald-400 shrink-0" />
                ) : user.role === 'admin' ? (
                  <ShieldCheck className="h-3 w-3 text-cyan-400 shrink-0" />
                ) : (
                  <UserCheck className="h-3 w-3 text-indigo-400 shrink-0" />
                )}
              </div>
              <div className="text-[10px] text-slate-400 capitalize truncate">
                {isStudent
                  ? `Student • ${user.department || 'CSE'}`
                  : `${user.role} • Dept of ${user.department}`}
              </div>
            </div>

            {/* Role switch toggle pill (staff only) */}
            {!isStudent && (
              <button
                onClick={() => switchRole(user.role === 'admin' ? 'faculty' : 'admin')}
                className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hidden sm:block transition cursor-pointer active:scale-95"
                title="Toggle Role Simulation"
              >
                {user.role === 'admin' ? 'Faculty Mode' : 'Admin Mode'}
              </button>
            )}

            {/* Logout button with comfortable touch target */}
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition cursor-pointer active:scale-95 flex items-center justify-center"
              style={{ minHeight: '38px', minWidth: '38px' }}
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
