import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  GraduationCap, 
  Mail, 
  Phone, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Calendar, 
  Clock, 
  ArrowUpRight, 
  ChevronRight, 
  FileText,
  X,
  TrendingUp,
  Percent,
  Layers,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import { 
  classifyCohortArrears, 
  CATEGORY_5_PLUS, 
  CATEGORY_10_PLUS, 
  CATEGORY_20_PLUS 
} from '../services/arrearClassification';

export default function StudentProfiles() {
  const { students, subjects, universityResults, getSubjectDetails } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | '5_plus' | '10_plus' | '20_plus' | 'distinction' | 'attendance'
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Classify all students with the unified service
  const cohort = useMemo(() => {
    return classifyCohortArrears(students, universityResults);
  }, [students, universityResults]);

  // Filter students based on search and selected filter pill
  const filteredStudents = useMemo(() => {
    return cohort.students.filter((student) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        student.name.toLowerCase().includes(q) ||
        student.regNo.includes(q) ||
        student.email.toLowerCase().includes(q) ||
        student.pendingSubjects.some((p) => p.subjectCode.toLowerCase().includes(q) || p.subjectName.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filterType === '5_plus') return student.category === '5_plus';
      if (filterType === '10_plus') return student.category === '10_plus';
      if (filterType === '20_plus') return student.category === '20_plus';
      if (filterType === 'distinction') return student.cgpa >= 8.5;
      if (filterType === 'attendance') return student.attendance < 75;
      return true;
    });
  }, [cohort.students, searchTerm, filterType]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex flex-wrap items-center gap-2">
              Student Academic Profiles & Semester History
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                {students.length} Enrolled
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive student dossiers with verified arrear count classifications, SGPA trends, and IA breakdowns.
            </p>
          </div>
        </div>

        {/* Arrear Categories Quick Stats */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
            5+: {cohort.summary.fivePlusCount}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold">
            10+: {cohort.summary.tenPlusCount}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
            20+: {cohort.summary.twentyPlusCount}
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by name, register number, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition min-h-[42px]"
          />
        </div>

        {/* Filter Pills with Specific 5+, 10+, 20+ Categories */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto touch-scroll pb-1.5 sm:pb-0 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl font-medium transition cursor-pointer shrink-0 active:scale-95 ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            All Students ({cohort.students.length})
          </button>

          {/* 5+ Arrears (Amber) */}
          <button
            onClick={() => setFilterType('5_plus')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 active:scale-95 ${
              filterType === '5_plus'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-900 text-amber-400 border border-amber-500/30 hover:border-amber-500/60'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            5+ Arrears ({cohort.summary.fivePlusCount})
          </button>

          {/* 10+ Arrears (Orange) */}
          <button
            onClick={() => setFilterType('10_plus')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 active:scale-95 ${
              filterType === '10_plus'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'bg-slate-900 text-orange-400 border border-orange-500/30 hover:border-orange-500/60'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
            10+ Arrears ({cohort.summary.tenPlusCount})
          </button>

          {/* 20+ Arrears (Red) */}
          <button
            onClick={() => setFilterType('20_plus')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 active:scale-95 ${
              filterType === '20_plus'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-900 text-rose-400 border border-rose-500/30 hover:border-rose-500/60'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            20+ Arrears ({cohort.summary.twentyPlusCount})
          </button>

          <button
            onClick={() => setFilterType('distinction')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl font-medium transition cursor-pointer shrink-0 active:scale-95 ${
              filterType === 'distinction'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Distinction (CGPA &ge; 8.5)
          </button>

          <button
            onClick={() => setFilterType('attendance')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl font-medium transition cursor-pointer shrink-0 active:scale-95 ${
              filterType === 'attendance'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Low Attendance (&lt;75%)
          </button>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full p-10 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 space-y-2">
            <div>No students found matching the selected filter.</div>
            <button
              onClick={() => { setFilterType('all'); setSearchTerm(''); }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-400 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const unclearedCount = student.totalUnclearedCount;
            const clearedCount = student.clearedCount;

            // Compute average IA mark
            const studentMarkValues = Object.values(student.marks || {});
            const avgIA = studentMarkValues.length
              ? Math.round(
                  studentMarkValues.reduce((acc, m) => acc + (m.ia1 + m.ia2) / 2, 0) /
                    studentMarkValues.length
                )
              : 0;

            return (
              <div
                key={student.studentId || student.regNo}
                onClick={() => setSelectedStudent(student)}
                className={`p-5 rounded-2xl bg-slate-900/80 border transition-all cursor-pointer group flex flex-col justify-between space-y-4 glass-panel ${
                  student.categoryMeta ? student.categoryMeta.cardBorder : 'border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition">
                        {student.name}
                      </h3>
                      <p className="text-xs font-mono text-slate-400">{student.regNo}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        CGPA {student.cgpa.toFixed(2)}
                      </span>
                      {student.categoryMeta && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${student.categoryMeta.badgeClass}`}>
                          {student.categoryMeta.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">Attendance</div>
                      <div className={`text-xs font-bold mt-0.5 ${student.attendance < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {student.attendance}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">IA Average</div>
                      <div className="text-xs font-bold text-slate-200 mt-0.5">
                        {avgIA}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">Backlogs</div>
                      <div className={`text-xs font-bold mt-0.5 ${
                        unclearedCount >= 20
                          ? 'text-rose-400'
                          : unclearedCount >= 10
                          ? 'text-orange-400'
                          : unclearedCount >= 5
                          ? 'text-amber-400'
                          : unclearedCount > 0
                          ? 'text-yellow-300'
                          : 'text-emerald-400'
                      }`}>
                        {unclearedCount > 0 ? `${unclearedCount} Active` : 'All Clear'}
                      </div>
                    </div>
                  </div>

                  {/* Pending Subjects Preview */}
                  {student.pendingSubjects.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                      <div className="text-[10px] text-slate-400 font-medium mb-1">
                        Pending Subjects ({student.pendingSubjects.length}):
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                        {student.pendingSubjects.slice(0, 4).map((sub, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[9px] text-slate-300"
                          >
                            {sub.subjectCode}
                          </span>
                        ))}
                        {student.pendingSubjects.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800/60 text-[9px] text-slate-400 font-mono">
                            +{student.pendingSubjects.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <span>Dept: {student.department}</span> • <span>Sec {student.section}</span>
                    {clearedCount > 0 && (
                      <span className="text-emerald-400 ml-1">({clearedCount} Cleared)</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-indigo-400 font-semibold text-[11px] group-hover:translate-x-1 transition">
                    View Profile
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Student Modal / Dossier */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 pb-safe pt-safe overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-3xl w-full p-4 sm:p-6 md:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto touch-scroll">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg shadow-indigo-600/30 shrink-0">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-xl font-bold text-white flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="truncate">{selectedStudent.name}</span>
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-medium">
                      {selectedStudent.regNo}
                    </span>
                    {selectedStudent.categoryMeta && (
                      <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold border ${selectedStudent.categoryMeta.badgeClass}`}>
                        {selectedStudent.categoryMeta.badge}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                    {selectedStudent.department} • Sec {selectedStudent.section} • Semester {selectedStudent.currentSemester?.replace('sem', '')} • {selectedStudent.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-white transition flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Close profile modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Cumulative GPA</div>
                <div className="text-lg sm:text-xl font-black text-indigo-400 mt-0.5">{selectedStudent.cgpa.toFixed(2)}</div>
              </div>
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Attendance Status</div>
                <div className={`text-lg sm:text-xl font-black mt-0.5 ${selectedStudent.attendance < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedStudent.attendance}%
                </div>
              </div>
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Current Uncleared Arrears</div>
                <div className={`text-lg sm:text-xl font-black mt-0.5 ${
                  selectedStudent.totalUnclearedCount >= 20
                    ? 'text-rose-400'
                    : selectedStudent.totalUnclearedCount >= 10
                    ? 'text-orange-400'
                    : selectedStudent.totalUnclearedCount >= 5
                    ? 'text-amber-400'
                    : selectedStudent.totalUnclearedCount > 0
                    ? 'text-yellow-300'
                    : 'text-emerald-400'
                }`}>
                  {selectedStudent.totalUnclearedCount}
                </div>
              </div>
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Cleared Backlogs</div>
                <div className="text-lg sm:text-xl font-black text-cyan-400 mt-0.5">
                  {selectedStudent.clearedCount}
                </div>
              </div>
            </div>

            {/* Pending Subjects Detailed Section */}
            {selectedStudent.pendingSubjects.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  Pending Uncleared Subjects ({selectedStudent.pendingSubjects.length})
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto touch-scroll pr-1">
                  {selectedStudent.pendingSubjects.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono text-cyan-300 font-bold mr-2">{sub.subjectCode}</span>
                        <span className="text-slate-200">{sub.subjectName}</span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Failed in Semester {sub.semester} • {sub.attempts} Exam Attempt{sub.attempts > 1 ? 's' : ''} • Session {sub.examSession}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 whitespace-nowrap">
                        Uncleared
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cleared Subjects Detailed Section */}
            {selectedStudent.clearedSubjects.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Cleared Backlogs ({selectedStudent.clearedSubjects.length})
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto touch-scroll pr-1">
                  {selectedStudent.clearedSubjects.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono text-emerald-300 font-bold mr-2">{sub.subjectCode}</span>
                        <span className="text-slate-300">{sub.subjectName}</span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Cleared in {sub.clearedInSession || 'Supplementary'} • Originally failed Sem {sub.semester}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                        Cleared
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SGPA Progression Chart */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                  Semester SGPA Progression
                </h4>
                <span className="text-[10px] sm:text-[11px] text-slate-400">Scale 0.0 - 10.0</span>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedStudent.semesterHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="sem" tickFormatter={(sem) => `Sem ${sem}`} stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[3, 10]} stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      labelFormatter={(sem) => `Semester ${sem}`}
                    />
                    <Line type="monotone" dataKey="sgpa" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject-Wise Current IA Breakdown */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Current Semester Internal Assessment (Sem 5)
                </h4>
                <span className="sm:hidden text-[10px] text-slate-500">Swipe table &rarr;</span>
              </div>
              <div className="overflow-x-auto touch-scroll rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Subject Code &amp; Name</th>
                      <th className="py-2.5 px-3 text-center">IA-1 (100)</th>
                      <th className="py-2.5 px-3 text-center">IA-2 (100)</th>
                      <th className="py-2.5 px-3 text-center">Average</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {subjects.map((sub) => {
                      const m = selectedStudent.marks[sub.code] || { ia1: 0, ia2: 0 };
                      const avg = (m.ia1 + m.ia2) / 2;
                      const isAtRisk = avg < 50 || m.ia2 < m.ia1 - 15;
                      return (
                        <tr key={sub.code} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-medium">
                            <span className="font-mono text-indigo-300 mr-2">{sub.code}</span>
                            {sub.name}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">{m.ia1}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{m.ia2}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-white font-mono">{avg.toFixed(1)}%</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isAtRisk 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {isAtRisk ? 'Attention' : 'On Track'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
