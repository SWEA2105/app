import React from 'react';

export default function StatCard({ title, value, change, isPositive, icon: Icon, color = 'indigo', subtitle }) {
  const colorMap = {
    indigo: {
      bg: 'from-indigo-500/10 to-indigo-600/5',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
      badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    },
    rose: {
      bg: 'from-rose-500/10 to-rose-600/5',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    },
    amber: {
      bg: 'from-amber-500/10 to-amber-600/5',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    },
    cyan: {
      bg: 'from-cyan-500/10 to-cyan-600/5',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${scheme.bg} border ${scheme.border} glass-panel glass-panel-hover flex flex-col justify-between`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="text-2xl font-black text-white tracking-tight">{value}</div>
        </div>
        <div className={`p-2.5 rounded-xl bg-slate-900/80 border border-white/5 ${scheme.text}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(subtitle || change) && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-400">{subtitle}</span>
          {change && (
            <span className={`px-2 py-0.5 rounded-full font-medium border text-[11px] ${
              isPositive 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
