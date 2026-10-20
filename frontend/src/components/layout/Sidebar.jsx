import React from 'react';
import { 
  LayoutDashboard, 
  BookOpenCheck, 
  FileSpreadsheet, 
  Users, 
  History, 
  FileText, 
  Database,
  Building2,
  Calendar,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar({ activeTab, setActiveTab, mobileMenuOpen, onCloseMobileMenu }) {
  const { 
    departments, 
    semesters, 
    selectedDepartment, 
    setSelectedDepartment, 
    selectedSemester, 
    setSelectedSemester 
  } = useApp();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Overview & KPIs'
    },
    {
      id: 'module-a',
      label: 'Internal Assessment',
      icon: BookOpenCheck,
      badge: 'Module A',
      desc: 'IA-1 & IA-2 Marks'
    },
    {
      id: 'module-b',
      label: 'University Results',
      icon: FileSpreadsheet,
      badge: 'Module B',
      desc: 'PDF Parser & Results'
    },
    {
      id: 'students',
      label: 'Student Profiles',
      icon: Users,
      badge: 'Dossiers',
      desc: 'Semester Progression'
    },
    {
      id: 'arrears',
      label: 'Arrear History',
      icon: History,
      badge: 'Backlogs',
      desc: 'Ledger & Clearances'
    },
    {
      id: 'reports',
      label: 'Reports & Exports',
      icon: FileText,
      badge: 'Excel/PDF',
      desc: 'Transcripts & NAAC'
    },
    {
      id: 'diagnostics',
      label: 'System & Health',
      icon: Database,
      badge: 'API Check',
      desc: 'Runtime Diagnostics'
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={onCloseMobileMenu}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-900/90 backdrop-blur-xl md:backdrop-blur-md flex flex-col justify-between p-4 shrink-0 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-5">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between md:hidden pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Navigation Menu</span>
            <button
              onClick={onCloseMobileMenu}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Department & Term Filter Selector */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-2.5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>Department</span>
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                <span>Semester Session</span>
              </div>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.academicYear})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Navigation
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-white/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                    <div className="truncate">
                      <div className="text-xs font-semibold leading-none mb-0.5">{item.label}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium shrink-0 ${
                      isActive 
                        ? 'bg-indigo-800 text-indigo-100 border border-indigo-400/30' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer System Status */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span>Stack</span>
              <span className="text-emerald-400 font-mono">React + FastAPI</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Database</span>
              <span className="text-indigo-400 font-mono">Supabase PG</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
