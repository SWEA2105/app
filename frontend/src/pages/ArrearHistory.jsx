import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  FileSpreadsheet, 
  Check, 
  RefreshCw,
  BookOpen,
  Calendar,
  X,
  ChevronRight,
  BarChart3,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { downloadFile } from '../utils/mobileDownload';
import { 
  classifyCohortArrears, 
  getArrearCategory,
  CATEGORY_5_PLUS,
  CATEGORY_10_PLUS,
  CATEGORY_20_PLUS 
} from '../services/arrearClassification';

export default function ArrearHistory() {
  const { students, universityResults, clearArrear, departments, semesters } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSem, setSelectedSem] = useState('ALL');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL'); // 'ALL' | '5_plus' | '10_plus' | '20_plus' | 'under_5'
  const [activeViewMode, setActiveViewMode] = useState('students'); // 'students' | 'ledger'
  const [statusFilter, setStatusFilter] = useState('ALL'); // for ledger view: 'ALL' | 'ACTIVE' | 'CLEARED'
  const [clearingModal, setClearingModal] = useState(null);
  const [sessionInput, setSessionInput] = useState('Nov/Dec 2024');
  const [studentDetailModal, setStudentDetailModal] = useState(null);

  // Compute classified cohort data reactively
  const cohort = useMemo(() => {
    return classifyCohortArrears(students, universityResults);
  }, [students, universityResults]);

  // Handle card click to filter
  const handleCategoryCardClick = (catId) => {
    if (activeCategoryFilter === catId) {
      setActiveCategoryFilter('ALL');
    } else {
      setActiveCategoryFilter(catId);
      setActiveViewMode('students');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDept('ALL');
    setSelectedSem('ALL');
    setActiveCategoryFilter('ALL');
    setStatusFilter('ALL');
  };

  const hasActiveFilters = searchTerm !== '' || selectedDept !== 'ALL' || selectedSem !== 'ALL' || activeCategoryFilter !== 'ALL' || statusFilter !== 'ALL';

  // Filter classified students
  const filteredStudents = useMemo(() => {
    return cohort.students.filter((st) => {
      // Dept filter
      if (selectedDept !== 'ALL' && st.department.toUpperCase() !== selectedDept.toUpperCase()) {
        return false;
      }
      // Sem filter
      if (selectedSem !== 'ALL') {
        const semClean = selectedSem.toLowerCase().replace('sem', '');
        const stSemClean = (st.currentSemester || '').toLowerCase().replace('sem', '');
        if (stSemClean !== semClean) return false;
      }
      // Category filter (mutually exclusive)
      if (activeCategoryFilter === '5_plus' && st.category !== '5_plus') return false;
      if (activeCategoryFilter === '10_plus' && st.category !== '10_plus') return false;
      if (activeCategoryFilter === '20_plus' && st.category !== '20_plus') return false;
      if (activeCategoryFilter === 'under_5' && st.category !== null) return false;

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = st.studentName.toLowerCase().includes(q);
        const matchesReg = st.regNo.includes(q);
        const matchesPending = st.pendingSubjects.some(
          (p) => p.subjectCode.toLowerCase().includes(q) || p.subjectName.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesReg && !matchesPending) return false;
      }

      return true;
    });
  }, [cohort.students, selectedDept, selectedSem, activeCategoryFilter, searchTerm]);

  // Flatten all individual arrear records for the detailed ledger view
  const allArrearLedger = useMemo(() => {
    return students.flatMap((student) =>
      (student.arrears || []).map((arr) => ({
        ...arr,
        studentId: student.id,
        studentName: student.name,
        regNo: student.regNo,
        department: student.department,
        currentSem: student.semester,
      }))
    );
  }, [students]);

  // Filtered ledger entries
  const filteredLedger = useMemo(() => {
    return allArrearLedger.filter((item) => {
      if (selectedDept !== 'ALL' && item.department.toUpperCase() !== selectedDept.toUpperCase()) return false;
      if (statusFilter === 'ACTIVE' && item.status !== 'ACTIVE') return false;
      if (statusFilter === 'CLEARED' && item.status !== 'CLEARED') return false;

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          item.studentName.toLowerCase().includes(q) ||
          item.regNo.includes(q) ||
          item.subjectCode.toLowerCase().includes(q) ||
          item.subjectName.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [allArrearLedger, selectedDept, statusFilter, searchTerm]);

  const handleConfirmClear = () => {
    if (clearingModal) {
      clearArrear(clearingModal.regNo, clearingModal.subjectCode, sessionInput);
      setClearingModal(null);
    }
  };

  // Export to CSV
  const handleExportCSV = async () => {
    if (activeViewMode === 'students') {
      const headers = 'Register Number,Student Name,Department,Current Semester,Uncleared Arrears Count,Arrear Category,Cleared Arrears Count,Pending Subjects,Cleared Subjects\n';
      const rows = filteredStudents.map((s) => {
        const pendingStr = s.pendingSubjects.map((p) => `${p.subjectCode} (${p.subjectName})`).join('; ');
        const clearedStr = s.clearedSubjects.map((c) => `${c.subjectCode} (${c.subjectName})`).join('; ');
        const catStr = s.categoryBadge || 'Under 5 Arrears';
        return `"${s.regNo}","${s.studentName}","${s.department}","${s.currentSemester}",${s.totalUnclearedCount},"${catStr}",${s.clearedCount},"${pendingStr}","${clearedStr}"\n`;
      }).join('');
      const filename = `Student_Arrear_Classification_${activeCategoryFilter}_${new Date().toISOString().split('T')[0]}.csv`;
      await downloadFile(filename, headers + rows, 'text/csv');
    } else {
      const headers = 'Register Number,Student Name,Department,Subject Code,Subject Name,Failed Semester,Original Session,Attempts,Status,Cleared In Session\n';
      const rows = filteredLedger.map((a) =>
        `"${a.regNo}","${a.studentName}","${a.department}","${a.subjectCode}","${a.subjectName}","${a.semester}","${a.examSession}","${a.attempts}","${a.status}","${a.clearedInSession || 'N/A'}"\n`
      ).join('');
      const filename = `Arrear_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
      await downloadFile(filename, headers + rows, 'text/csv');
    }
  };

  // Distribution chart data
  const chartData = [
    {
      category: '5+ Arrears',
      range: '5 to 9',
      count: cohort.summary.fivePlusCount,
      color: '#f59e0b',
    },
    {
      category: '10+ Arrears',
      range: '10 to 19',
      count: cohort.summary.tenPlusCount,
      color: '#f97316',
    },
    {
      category: '20+ Arrears',
      range: '20 or more',
      count: cohort.summary.twentyPlusCount,
      color: '#ef4444',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <History className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex flex-wrap items-center gap-2">
              Student Arrear Classification & History Ledger
              <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {cohort.summary.totalStudents} Students Evaluated
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mutually exclusive backlog classification based on verified university examination history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto shrink-0"
          >
            <Download className="h-4 w-4 text-cyan-400" />
            Export Classification (CSV)
          </button>
        </div>
      </div>

      {/* THREE COLOUR-CODED SUMMARY CARDS (Clickable to Filter) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            Current Uncleared Arrear Categories (Click to filter)
          </span>
          {activeCategoryFilter !== 'ALL' && (
            <button
              onClick={() => setActiveCategoryFilter('ALL')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition font-medium"
            >
              <X className="h-3.5 w-3.5" />
              Reset Category Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* CATEGORY A — 5+ ARREARS (Amber / Yellow) */}
          <div
            onClick={() => handleCategoryCardClick('5_plus')}
            className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 relative overflow-hidden glass-panel border ${
              activeCategoryFilter === '5_plus'
                ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/20 scale-[1.01]'
                : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                5+ Arrears
              </span>
              <span className="text-[11px] font-mono text-amber-300/80">Category A</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {cohort.summary.fivePlusCount}
                </div>
                <div className="text-xs text-slate-300 font-medium mt-0.5">Students with 5–9 Arrears</div>
              </div>
              <div className="text-[11px] text-amber-400/80 text-right">
                {cohort.summary.totalStudents ? Math.round((cohort.summary.fivePlusCount / cohort.summary.totalStudents) * 100) : 0}% cohort
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Candidates with 5 to 9 uncleared subject backlogs.
            </p>
            {activeCategoryFilter === '5_plus' && (
              <div className="mt-2.5 pt-2 border-t border-amber-500/20 text-[11px] text-amber-300 font-semibold flex items-center justify-between">
                <span>Active Filter Applied</span>
                <span>Click to clear &times;</span>
              </div>
            )}
          </div>

          {/* CATEGORY B — 10+ ARREARS (Orange) */}
          <div
            onClick={() => handleCategoryCardClick('10_plus')}
            className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 relative overflow-hidden glass-panel border ${
              activeCategoryFilter === '10_plus'
                ? 'bg-orange-950/40 border-orange-500 shadow-lg shadow-orange-500/20 scale-[1.01]'
                : 'bg-slate-900/80 border-slate-800 hover:border-orange-500/50 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                10+ Arrears
              </span>
              <span className="text-[11px] font-mono text-orange-300/80">Category B</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">
                  {cohort.summary.tenPlusCount}
                </div>
                <div className="text-xs text-slate-300 font-medium mt-0.5">Students with 10–19 Arrears</div>
              </div>
              <div className="text-[11px] text-orange-400/80 text-right">
                {cohort.summary.totalStudents ? Math.round((cohort.summary.tenPlusCount / cohort.summary.totalStudents) * 100) : 0}% cohort
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Candidates with 10 to 19 uncleared subject backlogs.
            </p>
            {activeCategoryFilter === '10_plus' && (
              <div className="mt-2.5 pt-2 border-t border-orange-500/20 text-[11px] text-orange-300 font-semibold flex items-center justify-between">
                <span>Active Filter Applied</span>
                <span>Click to clear &times;</span>
              </div>
            )}
          </div>

          {/* CATEGORY C — 20+ ARREARS (Red) */}
          <div
            onClick={() => handleCategoryCardClick('20_plus')}
            className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 relative overflow-hidden glass-panel border ${
              activeCategoryFilter === '20_plus'
                ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-500/20 scale-[1.01]'
                : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/50 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                20+ Arrears
              </span>
              <span className="text-[11px] font-mono text-rose-300/80">Category C</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                  {cohort.summary.twentyPlusCount}
                </div>
                <div className="text-xs text-slate-300 font-medium mt-0.5">Students with 20+ Arrears</div>
              </div>
              <div className="text-[11px] text-rose-400/80 text-right">
                {cohort.summary.totalStudents ? Math.round((cohort.summary.twentyPlusCount / cohort.summary.totalStudents) * 100) : 0}% cohort
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Candidates with 20 or more uncleared subject backlogs.
            </p>
            {activeCategoryFilter === '20_plus' && (
              <div className="mt-2.5 pt-2 border-t border-rose-500/20 text-[11px] text-rose-300 font-semibold flex items-center justify-between">
                <span>Active Filter Applied</span>
                <span>Click to clear &times;</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Distribution Chart & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recharts Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                Student Arrear Category Distribution
              </h3>
              <p className="text-[11px] text-slate-400">
                Headcount of students classified across the three institutional arrear bands
              </p>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={11} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                          <div className="font-bold text-white">{data.category}</div>
                          <div className="text-slate-400">Backlog Range: <span className="text-white font-semibold">{data.range}</span></div>
                          <div className="text-slate-400">Student Count: <span className="text-cyan-400 font-mono font-bold">{data.count}</span></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Legend & Rules Box */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Classification Criteria</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Instituted policy rules for backlog categorization and intervention targeting:
            </p>

            <div className="mt-3.5 space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-amber-300">Category A (5–9 Arrears)</div>
                  <div className="text-[11px] text-slate-400">Moderate risk • Academic counseling &amp; re-exam coaching</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-orange-500/5 border border-orange-500/20">
                <div className="h-2.5 w-2.5 rounded-full bg-orange-400 mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-orange-300">Category B (10–19 Arrears)</div>
                  <div className="text-[11px] text-slate-400">High risk • Faculty mentorship &amp; mandatory remedial classes</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-rose-300">Category C (20+ Arrears)</div>
                  <div className="text-[11px] text-slate-400">Severe backlog risk • Dean / HOD escalation &amp; academic plan</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Note: Students with fewer than 5 arrears are excluded from these intervention categories.
          </div>
        </div>
      </div>

      {/* View Switcher, Search, and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs w-fit">
            <button
              onClick={() => setActiveViewMode('students')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeViewMode === 'students'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Student Arrear Classification ({filteredStudents.length})</span>
            </button>
            <button
              onClick={() => setActiveViewMode('ledger')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeViewMode === 'ledger'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Paper Ledger History ({filteredLedger.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by student, register no, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[42px]"
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500 min-h-[40px] cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500 min-h-[40px] cursor-pointer"
          >
            <option value="ALL">All Semesters</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          {/* Category Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll py-1">
            <button
              onClick={() => setActiveCategoryFilter('ALL')}
              className={`px-3 py-2 rounded-xl font-medium transition cursor-pointer shrink-0 ${
                activeCategoryFilter === 'ALL'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setActiveCategoryFilter('5_plus')}
              className={`px-3 py-2 rounded-xl font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeCategoryFilter === '5_plus'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-900 text-amber-400 border border-slate-800 hover:border-amber-500/50'
              }`}
            >
              5+ Arrears ({cohort.summary.fivePlusCount})
            </button>
            <button
              onClick={() => setActiveCategoryFilter('10_plus')}
              className={`px-3 py-2 rounded-xl font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeCategoryFilter === '10_plus'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-slate-900 text-orange-400 border border-slate-800 hover:border-orange-500/50'
              }`}
            >
              10+ Arrears ({cohort.summary.tenPlusCount})
            </button>
            <button
              onClick={() => setActiveCategoryFilter('20_plus')}
              className={`px-3 py-2 rounded-xl font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeCategoryFilter === '20_plus'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-900 text-rose-400 border border-slate-800 hover:border-rose-500/50'
              }`}
            >
              20+ Arrears ({cohort.summary.twentyPlusCount})
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition flex items-center gap-1 ml-auto"
            >
              <X className="h-3.5 w-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* MAIN VIEW: STUDENT CLASSIFICATION TABLE */}
      {activeViewMode === 'students' ? (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel overflow-hidden">
          <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filteredStudents.length} Students</span>
            <span className="sm:hidden text-cyan-400">Swipe table &rarr;</span>
          </div>

          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Register Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department &amp; Sem</th>
                  <th className="py-3 px-4 text-center">Uncleared Count</th>
                  <th className="py-3 px-4 text-center">Arrear Category</th>
                  <th className="py-3 px-4">Pending Subjects</th>
                  <th className="py-3 px-4 text-center">Cleared Backlogs</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-slate-500 space-y-2">
                      <div>No students found matching the selected category or filters.</div>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-400 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => (
                    <tr key={st.studentId || st.regNo} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-cyan-300 whitespace-nowrap">
                        {st.regNo}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {st.studentName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="font-medium text-slate-200">{st.department}</span>
                        <span className="text-slate-500 mx-1.5">•</span>
                        <span className="text-slate-400">Sem {st.currentSemester?.replace('sem', '')}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-sm font-black text-white">
                          {st.totalUnclearedCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {st.categoryMeta ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${st.categoryMeta.badgeClass}`}>
                            {st.categoryMeta.badge}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-medium">
                            {st.totalUnclearedCount === 0 ? 'All Clear' : '< 5 Arrears'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        {st.pendingSubjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto touch-scroll pr-1">
                            {st.pendingSubjects.map((sub, idx) => (
                              <span
                                key={idx}
                                title={`${sub.subjectName} (Failed in Sem ${sub.semester}, ${sub.attempts} attempts)`}
                                className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300 hover:text-white cursor-help"
                              >
                                {sub.subjectCode}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            No pending papers
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {st.clearedCount > 0 ? (
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                            {st.clearedCount} Cleared
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Nil</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setStudentDetailModal(st)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition cursor-pointer"
                        >
                          View Backlogs
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DETAILED ARREAR LEDGER VIEW (Paper-by-paper ledger with clearance action) */
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel overflow-hidden">
          <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Historical Arrear Records ({filteredLedger.length})</span>
            <span className="sm:hidden text-cyan-400">Swipe table &rarr;</span>
          </div>

          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Register Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Subject Code &amp; Name</th>
                  <th className="py-3 px-4 text-center">Failed Sem</th>
                  <th className="py-3 px-4 text-center">Attempts</th>
                  <th className="py-3 px-4 text-center">Original Session</th>
                  <th className="py-3 px-4 text-center">Clearance Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-500">
                      No arrear ledger records matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-medium text-cyan-300">{item.regNo}</td>
                      <td className="py-3 px-4 font-semibold text-white">{item.studentName}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-indigo-300 font-semibold mr-2">{item.subjectCode}</span>
                        <span className="text-slate-200">{item.subjectName}</span>
                      </td>
                      <td className="py-3 px-4 text-center">Sem {item.semester}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold ${item.attempts >= 2 ? 'bg-amber-500/10 text-amber-400' : 'text-slate-300'}`}>
                          {item.attempts}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-400">{item.examSession}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          item.status === 'CLEARED'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        }`}>
                          {item.status === 'CLEARED' ? `Cleared (${item.clearedInSession})` : 'Active Arrear'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.status === 'ACTIVE' ? (
                          <button
                            onClick={() => setClearingModal(item)}
                            className="min-h-[36px] px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 mx-auto"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Mark Cleared
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Audit Saved</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL DRAWER / MODAL */}
      {studentDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto touch-scroll">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{studentDetailModal.studentName}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-cyan-500/15 text-cyan-300">
                    {studentDetailModal.regNo}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {studentDetailModal.department} • Semester {studentDetailModal.currentSemester?.replace('sem', '')} • CGPA {studentDetailModal.cgpa}
                </p>
              </div>

              <button
                onClick={() => setStudentDetailModal(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Classification Badge Banner */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Verified Classification</div>
                <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-2">
                  <span>Current Uncleared Arrears: {studentDetailModal.totalUnclearedCount}</span>
                  {studentDetailModal.categoryMeta ? (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${studentDetailModal.categoryMeta.badgeClass}`}>
                      {studentDetailModal.categoryMeta.badge}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-normal">(&lt; 5 Arrears)</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Total Cleared</div>
                <div className="text-sm font-bold text-emerald-400">{studentDetailModal.clearedCount} Subjects</div>
              </div>
            </div>

            {/* Pending Subjects List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                Pending Uncleared Subjects ({studentDetailModal.pendingSubjects.length})
              </h4>
              {studentDetailModal.pendingSubjects.length === 0 ? (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs">
                  All examinations cleared! No active backlog for this student.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto touch-scroll pr-1">
                  {studentDetailModal.pendingSubjects.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono text-cyan-300 font-bold mr-2">{sub.subjectCode}</span>
                        <span className="text-slate-200">{sub.subjectName}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Failed in Sem {sub.semester} • {sub.attempts} Examination Attempt{sub.attempts > 1 ? 's' : ''}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Active Backlog
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cleared Subjects List */}
            {studentDetailModal.clearedSubjects.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Successfully Cleared Backlogs ({studentDetailModal.clearedSubjects.length})
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto touch-scroll pr-1">
                  {studentDetailModal.clearedSubjects.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono text-emerald-300 font-bold mr-2">{sub.subjectCode}</span>
                        <span className="text-slate-300">{sub.subjectName}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Cleared in {sub.clearedInSession || 'Supplementary Exam'} • {sub.attempts} Attempt{sub.attempts > 1 ? 's' : ''}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Cleared
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal to Mark Arrear as Cleared */}
      {clearingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              Confirm Arrear Clearance
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verify that <strong className="text-white">{clearingModal.studentName}</strong> ({clearingModal.regNo}) has passed the university examination for <strong className="text-cyan-300">{clearingModal.subjectCode} - {clearingModal.subjectName}</strong>.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Exam Session in which paper was cleared
              </label>
              <input
                type="text"
                value={sessionInput}
                onChange={(e) => setSessionInput(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 min-h-[42px]"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setClearingModal(null)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white text-xs font-medium cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 cursor-pointer text-center"
              >
                Confirm Clearance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
