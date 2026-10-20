import React, { useState } from 'react';
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
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ArrearHistory() {
  const { students, clearArrear } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [clearingModal, setClearingModal] = useState(null);
  const [sessionInput, setSessionInput] = useState('Nov/Dec 2024');

  // Flatten all arrears from students with parent student context
  const allArrears = students.flatMap((student) =>
    (student.arrears || []).map((arr) => ({
      ...arr,
      studentId: student.id,
      studentName: student.name,
      regNo: student.regNo,
      department: student.department,
      currentSem: student.semester,
    }))
  );

  // Filtered arrears
  const filteredArrears = allArrears.filter((item) => {
    const matchesSearch =
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.regNo.includes(searchTerm) ||
      item.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ACTIVE') return item.status === 'ACTIVE';
    if (statusFilter === 'CLEARED') return item.status === 'CLEARED';
    if (statusFilter === 'CRITICAL') return item.attempts >= 2 && item.status === 'ACTIVE';
    return true;
  });

  // Calculate statistics
  const totalCount = allArrears.length;
  const activeCount = allArrears.filter((a) => a.status === 'ACTIVE').length;
  const clearedCount = allArrears.filter((a) => a.status === 'CLEARED').length;
  const clearanceRate = totalCount ? Math.round((clearedCount / totalCount) * 100) : 0;

  const handleConfirmClear = () => {
    if (clearingModal) {
      clearArrear(clearingModal.regNo, clearingModal.subjectCode, sessionInput);
      setClearingModal(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Register Number,Student Name,Department,Subject Code,Subject Name,Failed Semester,Original Session,Attempts,Status,Cleared In Session\n'];
    const rows = filteredArrears.map((a) =>
      `"${a.regNo}","${a.studentName}","${a.department}","${a.subjectCode}","${a.subjectName}","${a.semester}","${a.examSession}","${a.attempts}","${a.status}","${a.clearedInSession || 'N/A'}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Arrear_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              University Examination Arrear Ledger & History Tracker
            </h2>
            <p className="text-xs text-slate-400">
              Track multi-semester backlogs, identify recurring failures, and update clearance audit records.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4 text-cyan-400" />
          Export Ledger (CSV)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-xs text-slate-400 font-medium">Total Arrears Logged</div>
          <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across all semesters</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-xs text-slate-400 font-medium">Active / Outstanding</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{activeCount}</div>
          <div className="text-[11px] text-rose-400/80 mt-1">Pending university re-exam</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-xs text-slate-400 font-medium">Successfully Cleared</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{clearedCount}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Cleared in supplementary</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-xs text-slate-400 font-medium">Cohort Clearance Rate</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{clearanceRate}%</div>
          <div className="text-[11px] text-cyan-400/80 mt-1">Recovery efficiency</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search register number, student, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            All Backlogs ({allArrears.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'ACTIVE'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <XCircle className="h-3 w-3" />
            Active Arrears ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('CLEARED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'CLEARED'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            Cleared Arrears ({clearedCount})
          </button>
          <button
            onClick={() => setStatusFilter('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'CRITICAL'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            Multiple Attempts (&ge;2)
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Register Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Subject Code & Name</th>
                <th className="py-3 px-4 text-center">Failed Sem</th>
                <th className="py-3 px-4 text-center">Attempts</th>
                <th className="py-3 px-4 text-center">Original Session</th>
                <th className="py-3 px-4 text-center">Clearance Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredArrears.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No arrear records matching the active filters.
                  </td>
                </tr>
              ) : (
                filteredArrears.map((item, idx) => (
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
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Check className="h-3 w-3" />
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

      {/* Confirmation Modal to Mark Arrear as Cleared */}
      {clearingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
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
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setClearingModal(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30"
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
