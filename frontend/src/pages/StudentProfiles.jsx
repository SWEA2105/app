import React, { useState } from 'react';
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
  Percent
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';

export default function StudentProfiles() {
  const { students, subjects, getSubjectDetails } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Filter students based on search and selected filter pill
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.regNo.includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const activeArrears = (student.arrears || []).filter((a) => a.status === 'ACTIVE').length;

    if (!matchesSearch) return false;
    if (filterType === 'distinction') return student.cgpa >= 8.5;
    if (filterType === 'arrears') return activeArrears > 0;
    if (filterType === 'attendance') return student.attendance < 75;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Student Academic Profiles & Semester History
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                {students.length} Enrolled
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Comprehensive student dossiers with semester-wise SGPA trends, IA breakdowns, and arrear lifecycles.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name or register number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            All Students ({students.length})
          </button>
          <button
            onClick={() => setFilterType('distinction')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
              filterType === 'distinction'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Distinction (CGPA &ge; 8.5)
          </button>
          <button
            onClick={() => setFilterType('arrears')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              filterType === 'arrears'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            With Active Arrears
          </button>
          <button
            onClick={() => setFilterType('attendance')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
              filterType === 'attendance'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Low Attendance (&lt;75%)
          </button>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((student) => {
          const activeArrears = (student.arrears || []).filter((a) => a.status === 'ACTIVE').length;
          const clearedArrears = (student.arrears || []).filter((a) => a.status === 'CLEARED').length;

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
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition">
                      {student.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">{student.regNo}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      CGPA {student.cgpa.toFixed(2)}
                    </span>
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
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Current IA Avg</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">
                      {avgIA}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Backlogs</div>
                    <div className={`text-xs font-bold mt-0.5 ${activeArrears > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {activeArrears > 0 ? `${activeArrears} Active` : 'Nil'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <span>Dept: {student.department}</span> • <span>Sec {student.section}</span>
                </span>
                <span className="flex items-center gap-1 text-indigo-400 font-semibold text-[11px] group-hover:translate-x-1 transition">
                  View Full Profile
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Student Modal / Dossier */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/30">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedStudent.name}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-medium">
                      {selectedStudent.regNo}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedStudent.department} • Section {selectedStudent.section} • Semester 5 • {selectedStudent.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-medium">Cumulative GPA</div>
                <div className="text-xl font-black text-indigo-400 mt-0.5">{selectedStudent.cgpa.toFixed(2)}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-medium">Attendance Status</div>
                <div className={`text-xl font-black mt-0.5 ${selectedStudent.attendance < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedStudent.attendance}%
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-medium">Active Backlogs</div>
                <div className="text-xl font-black text-rose-400 mt-0.5">
                  {(selectedStudent.arrears || []).filter((a) => a.status === 'ACTIVE').length}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-medium">Cleared Backlogs</div>
                <div className="text-xl font-black text-cyan-400 mt-0.5">
                  {(selectedStudent.arrears || []).filter((a) => a.status === 'CLEARED').length}
                </div>
              </div>
            </div>

            {/* SGPA Progression Chart */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                  Semester SGPA Progression
                </h4>
                <span className="text-[11px] text-slate-400">Scale 0.0 - 10.0</span>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedStudent.semesterHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="sem" tickFormatter={(sem) => `Sem ${sem}`} stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[4, 10]} stroke="#94a3b8" fontSize={11} />
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
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Current Semester Internal Assessment Marks (Sem 5)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Subject Code & Name</th>
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

            {/* Arrear Ledger for this student */}
            {(selectedStudent.arrears || []).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Historical Arrear Records
                </h4>
                <div className="space-y-2">
                  {selectedStudent.arrears.map((arr, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">
                          <span className="font-mono text-cyan-400 mr-2">{arr.subjectCode}</span>
                          {arr.subjectName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Originally failed in Semester {arr.semester} ({arr.examSession}) • {arr.attempts} Attempts
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        arr.status === 'CLEARED'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}>
                        {arr.status === 'CLEARED' ? `Cleared (${arr.clearedInSession})` : 'Active Arrear'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
