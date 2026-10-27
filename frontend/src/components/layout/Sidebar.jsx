import React, { useEffect } from 'react';
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
import CollegeBrand from '../common/CollegeBrand';

export default function Sidebar({ activeTab, setActiveTab, mobileMenuOpen, onCloseMobileMenu }) {
  const { 
    departments, 
    semesters, 
    selectedDepartment, 
    setSelectedDepartment, 
    selectedSemester, 
    setSelectedSemester 
  } = useApp();

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen && onCloseMobileMenu) {
        onCloseMobileMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, onCloseMobileMenu]);

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
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 cursor-pointer"
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 border-r border-slate-800 bg-slate-900/95 md:bg-slate-900/90 backdrop-blur-2xl md:backdrop-blur-md flex flex-col justify-between p-4 shrink-0 transition-transform duration-300 ease-in-out overflow-y-auto touch-scroll ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 1rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)',
          paddingLeft: 'max(env(safe-area-inset-left, 0px), 1rem)'
        }}
        aria-label="Sidebar Navigation"
      >
        <div className="space-y-4">
          {/* Mobile Drawer Header with Branding & Close Button */}
          <div className="flex items-center justify-between md:hidden pb-3 border-b border-slate-800 gap-2">
            <CollegeBrand variant="sidebar" className="flex-1" />
            <button
              onClick={onCloseMobileMenu}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop Sidebar Institutional Header */}
          <div className="hidden md:block pb-1">
            <CollegeBrand variant="sidebar" />
          </div>

          {/* Department & Term Filter Selector */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 space-y-2.5 shadow-inner">
            <div className="space-y-1">
              <label htmlFor="mobile-dept-select" className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                <Building2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span>Department</span>
              </label>
              <select
                id="mobile-dept-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer min-h-[42px]"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 pt-1">
              <label htmlFor="mobile-semester-select" className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                <Calendar className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>Semester Session</span>
              </label>
              <select
                id="mobile-semester-select"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer min-h-[42px]"
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
          <nav className="space-y-1" aria-label="Main navigation items">
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Navigation Modules
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer active:scale-[0.98] ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-white/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                  style={{ minHeight: '44px' }}
                  aria-current={isActive ? 'page' : undefined}
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
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium shrink-0 ml-1 ${
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
              <span>Mobile-Ready</span>
              <span className="text-indigo-400 font-mono">Capacitor Ready</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
