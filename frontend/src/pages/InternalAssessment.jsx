import React, { useState, useMemo } from 'react';
import { 
  BookOpenCheck, 
  Upload, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Award, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  Edit3,
  Download,
  Sparkles,
  BarChart3,
  HelpCircle,
  FileText
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import { downloadFile } from '../utils/mobileDownload';

export default function InternalAssessment() {
  const { students, subjects, selectedSubject, setSelectedSubject, updateStudentMark, batchUpdateMarks } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('roster'); // 'roster', 'attention', 'rankings', 'upload'
  const [editingCell, setEditingCell] = useState(null); // { studentId, field: 'ia1' | 'ia2' }
  const [uploadFeedback, setUploadFeedback] = useState(null);

  // Compute student data for currently selected subject
  const studentRows = useMemo(() => {
    return students.map((student) => {
      const marks = student.marks[selectedSubject] || { ia1: 0, ia2: 0 };
      const ia1 = Number(marks.ia1) || 0;
      const ia2 = Number(marks.ia2) || 0;
      const avg = (ia1 + ia2) / 2;
      const delta = ia2 - ia1;
      
      let trajectory = 'steady';
      if (delta >= 5) trajectory = 'improving';
      else if (delta <= -5) trajectory = 'declining';

      // Academic attention criteria:
      // 1. Average < 50%
      // 2. IA-2 fell by > 15 marks compared to IA-1 (sharp decline)
      // 3. Attendance < 75% with IA < 60%
      const isCritical = avg < 50;
      const isDecliningAlert = delta <= -15;
      const needsAttention = isCritical || isDecliningAlert || (student.attendance < 75 && avg < 60);

      let flagReason = null;
      if (isCritical) flagReason = 'Scoring < 50% (Failing IA criteria)';
      else if (isDecliningAlert) flagReason = `Sharp Decline (-${Math.abs(delta)} marks drop in IA-2)`;
      else if (needsAttention) flagReason = 'Low Attendance (<75%) & At-Risk Marks';

      return {
        ...student,
        ia1,
        ia2,
        avg,
        delta,
        trajectory,
        needsAttention,
        flagReason,
      };
    });
  }, [students, selectedSubject]);

  // Ranked students for this subject
  const rankedStudents = useMemo(() => {
    return [...studentRows].sort((a, b) => b.avg - a.avg);
  }, [studentRows]);

  // Statistics for selected subject
  const subjectStats = useMemo(() => {
    if (!studentRows.length) return { avg: 0, highest: 0, passRate: 0, improvingCount: 0, decliningCount: 0, atRiskCount: 0 };
    const totalAvg = studentRows.reduce((acc, s) => acc + s.avg, 0) / studentRows.length;
    const highest = Math.max(...studentRows.map((s) => s.avg));
    const passed = studentRows.filter((s) => s.avg >= 50).length;
    const passRate = Math.round((passed / studentRows.length) * 100);
    const improvingCount = studentRows.filter((s) => s.trajectory === 'improving').length;
    const decliningCount = studentRows.filter((s) => s.trajectory === 'declining').length;
    const atRiskCount = studentRows.filter((s) => s.needsAttention).length;

    return {
      avg: totalAvg.toFixed(1),
      highest: highest.toFixed(1),
      passRate,
      improvingCount,
      decliningCount,
      atRiskCount,
    };
  }, [studentRows]);

  // Filtered rows for current view
  const displayedRows = useMemo(() => {
    return studentRows.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.regNo.includes(searchTerm);
      if (!matchSearch) return false;

      if (activeTab === 'attention') return s.needsAttention;
      if (activeTab === 'improving') return s.trajectory === 'improving';
      if (activeTab === 'declining') return s.trajectory === 'declining';
      return true;
    });
  }, [studentRows, searchTerm, activeTab]);

  // Chart data for comparing IA1 vs IA2 across the cohort
  const chartData = useMemo(() => {
    return studentRows.slice(0, 10).map((s) => ({
      name: s.name.split(' ')[0],
      IA1: s.ia1,
      IA2: s.ia2,
      Average: Math.round(s.avg),
    }));
  }, [studentRows]);

  // Simulation: Load sample CSV data
  const handleLoadSampleMarks = () => {
    const mockUpload = [
      { regNo: '710022104001', ia1: 92, ia2: 96 },
      { regNo: '710022104002', ia1: 78, ia2: 86 },
      { regNo: '710022104003', ia1: 70, ia2: 55 },
      { regNo: '710022104004', ia1: 98, ia2: 99 },
      { regNo: '710022104005', ia1: 45, ia2: 42 },
      { regNo: '710022104007', ia1: 75, ia2: 82 },
    ];
    batchUpdateMarks(selectedSubject, mockUpload);
    setUploadFeedback({
      success: true,
      message: `Successfully imported mark updates for ${mockUpload.length} students in ${selectedSubject}!`,
    });
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  const handleExportCSV = async () => {
    const headers = 'Register Number,Student Name,Department,Subject,IA-1 Marks,IA-2 Marks,Average,Trajectory,Status\n';
    const rows = studentRows.map((s) =>
      `"${s.regNo}","${s.name}","${s.department}","${selectedSubject}","${s.ia1}","${s.ia2}","${s.avg.toFixed(1)}","${s.trajectory}","${s.needsAttention ? 'Academic Attention Required' : 'On Track'}"\n`
    ).join('');
    const filename = `IA_Marks_${selectedSubject}_${new Date().toISOString().split('T')[0]}.csv`;
    await downloadFile(filename, headers + rows);
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <BookOpenCheck className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
              Module A: Internal Assessment Analyzer
              <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-medium">
                IA-1 &amp; IA-2
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Calculate weighted averages, compare continuous assessment trends, and flag at-risk candidates.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={handleLoadSampleMarks}
            className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            style={{ minHeight: '38px' }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Quick Simulate Import
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            style={{ minHeight: '38px' }}
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            Export CSV
          </button>
        </div>
      </div>

      {uploadFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{uploadFeedback.message}</span>
        </div>
      )}

      {/* Subject Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto touch-scroll scrollbar-none pb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Active Subject:
        </span>
        {subjects.map((sub) => (
          <button
            key={sub.code}
            onClick={() => setSelectedSubject(sub.code)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 flex items-center gap-2 ${
              selectedSubject === sub.code
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 ring-1 ring-white/10'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span className="font-mono font-bold">{sub.code}</span>
            <span className="hidden md:inline">{sub.name}</span>
          </button>
        ))}
      </div>

      {/* Summary KPI Strip for Current Subject */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Subject Average</div>
          <div className="text-xl font-black text-white mt-0.5">{subjectStats.avg}%</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Top Mark</div>
          <div className="text-xl font-black text-indigo-400 mt-0.5">{subjectStats.highest}%</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Pass Rate (&ge;50%)</div>
          <div className="text-xl font-black text-emerald-400 mt-0.5">{subjectStats.passRate}%</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Improving Students</div>
          <div className="text-xl font-black text-cyan-400 mt-0.5">{subjectStats.improvingCount}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Declining Students</div>
          <div className="text-xl font-black text-amber-400 mt-0.5">{subjectStats.decliningCount}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Action Flags</div>
          <div className="text-xl font-black text-rose-400 mt-0.5">{subjectStats.atRiskCount}</div>
        </div>
      </div>

      {/* Recharts Visualization: IA-1 vs IA-2 Top Sample Comparison */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              IA-1 vs IA-2 Score Progression Chart ({selectedSubject})
            </h3>
            <p className="text-[11px] text-slate-400">Visual comparison of student marks between first and second internal assessments</p>
          </div>
          <div className="text-[11px] text-slate-400 hidden sm:block">Max Score: 100</div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="IA1" fill="#6366f1" radius={[4, 4, 0, 0]} name="IA-1 (Out of 100)" />
              <Bar dataKey="IA2" fill="#06b6d4" radius={[4, 4, 0, 0]} name="IA-2 (Out of 100)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto overflow-x-auto touch-scroll pb-1 sm:pb-1">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-2 rounded-lg font-medium transition cursor-pointer shrink-0 text-center ${
              activeTab === 'roster'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ minHeight: '38px' }}
          >
            All Students ({studentRows.length})
          </button>
          <button
            onClick={() => setActiveTab('attention')}
            className={`px-3 py-2 rounded-lg font-medium transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5 ${
              activeTab === 'attention'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ minHeight: '38px' }}
          >
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>Needs Attention ({subjectStats.atRiskCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('improving')}
            className={`px-3 py-2 rounded-lg font-medium transition cursor-pointer shrink-0 text-center ${
              activeTab === 'improving'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ minHeight: '38px' }}
          >
            Improving ({subjectStats.improvingCount})
          </button>
          <button
            onClick={() => setActiveTab('declining')}
            className={`px-3 py-2 rounded-lg font-medium transition cursor-pointer shrink-0 text-center ${
              activeTab === 'declining'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ minHeight: '38px' }}
          >
            Declining ({subjectStats.decliningCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student or register number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[38px]"
          />
        </div>
      </div>

      {/* Main Interactive Marks Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel overflow-hidden">
        <div className="p-3.5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Edit3 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span>Tap any mark to edit inline • Real-time recalculation</span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] text-slate-500">
            <span className="sm:hidden text-indigo-400 font-medium">Swipe table &rarr;</span>
            <span>Showing {displayedRows.length} candidates</span>
          </div>
        </div>

        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 sm:px-4">Rank</th>
                <th className="py-3 px-3 sm:px-4">Register Number</th>
                <th className="py-3 px-3 sm:px-4">Student Name</th>
                <th className="py-3 px-3 sm:px-4 text-center">IA-1 (100)</th>
                <th className="py-3 px-3 sm:px-4 text-center">IA-2 (100)</th>
                <th className="py-3 px-3 sm:px-4 text-center">Average</th>
                <th className="py-3 px-3 sm:px-4 text-center">Delta / Trajectory</th>
                <th className="py-3 px-3 sm:px-4 text-center">Academic Attention Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No students match the current filter.
                  </td>
                </tr>
              ) : (
                displayedRows.map((student) => {
                  const rank = rankedStudents.findIndex((s) => s.id === student.id) + 1;

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                        <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-bold ${
                          rank === 1
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : rank === 2
                            ? 'bg-slate-400/20 text-slate-200 border border-slate-400/30'
                            : rank === 3
                            ? 'bg-amber-700/20 text-amber-400 border border-amber-700/30'
                            : 'text-slate-500'
                        }`}>
                          {rank}
                        </span>
                      </td>

                      <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono font-medium text-indigo-300">
                        {student.regNo}
                      </td>

                      <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-white whitespace-nowrap">
                        {student.name}
                      </td>

                      {/* Editable IA-1 */}
                      <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="0"
                          max="100"
                          value={student.ia1}
                          onChange={(e) => updateStudentMark(student.id, selectedSubject, 'ia1', e.target.value)}
                          className="w-16 text-center py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:outline-none font-mono text-white text-xs min-h-[38px]"
                        />
                      </td>

                      {/* Editable IA-2 */}
                      <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="0"
                          max="100"
                          value={student.ia2}
                          onChange={(e) => updateStudentMark(student.id, selectedSubject, 'ia2', e.target.value)}
                          className="w-16 text-center py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:outline-none font-mono text-white text-xs min-h-[38px]"
                        />
                      </td>

                      {/* Calculated Average */}
                      <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">
                        <span className={`font-mono font-bold text-xs ${student.avg < 50 ? 'text-rose-400' : 'text-white'}`}>
                          {student.avg.toFixed(1)}%
                        </span>
                      </td>

                      {/* Trajectory */}
                      <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          student.trajectory === 'improving'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : student.trajectory === 'declining'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {student.trajectory === 'improving' ? (
                            <>
                              <TrendingUp className="h-3 w-3" />
                              +{student.delta}
                            </>
                          ) : student.trajectory === 'declining' ? (
                            <>
                              <TrendingDown className="h-3 w-3" />
                              {student.delta}
                            </>
                          ) : (
                            '0'
                          )}
                        </span>
                      </td>

                      {/* Attention Flag */}
                      <td className="py-3 px-4 text-center">
                        {student.needsAttention ? (
                          <span
                            title={student.flagReason}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-help"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Needs Attention
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Satisfactory
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
