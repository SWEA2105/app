import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Award,
  Percent,
  BookOpenCheck,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { studentsApi, universityApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

/** Subject code -> display name lookup for the IA breakdown table. */
const SUBJECT_NAMES = {
  CS3591: 'Computer Networks',
  CS3501: 'Compiler Design',
  CS3551: 'Distributed Systems',
  CS3511: 'Data Mining & Warehousing',
  CCS334: 'Big Data Analytics',
  MA3354: 'Discrete Mathematics',
  CS3401: 'Algorithms',
  CS3491: 'Artificial Intelligence & ML',
  CS3452: 'Theory of Computation',
  MA3151: 'Matrices and Calculus',
  CS3352: 'Foundations of Data Science',
};

const TONE_CLASSES = {
  indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
};

function MetricCard({ icon: Icon, label, value, tone = 'indigo' }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel flex items-center gap-3">
      <div className={`p-2.5 rounded-xl border ${TONE_CLASSES[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider truncate">{label}</div>
        <div className="text-lg font-black text-white mt-0.5">{value}</div>
      </div>
    </div>
  );
}

/**
 * Student self-service view.
 *
 * Rendered after a successful register-number + OTP sign-in. A student session
 * is scoped by the backend to its own record, so every panel here is the
 * student's own academic data.
 */
export default function StudentPortal({ onExitToStaff }) {
  const { user, logout } = useAuth();
  const studentId = user?.student?.id || user?.id;

  const [dossier, setDossier] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!studentId) {
      setIsLoading(false);
      setError('This session is not linked to a student record.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const [dossierRes, resultsRes] = await Promise.all([
        studentsApi.getStudentDossier(studentId),
        universityApi.listResults({ semester: 5 }),
      ]);
      setDossier(dossierRes?.data || null);
      setResults(resultsRes?.data || []);
    } catch (err) {
      setError(err?.message || 'Unable to load your academic records.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const student = dossier?.student;
  const identity = user?.student || {};

  const metrics = useMemo(() => {
    const marks = Object.values(student?.marks || {});
    const iaAverage = marks.length
      ? marks.reduce((sum, m) => sum + (m.ia1 + m.ia2) / 2, 0) / marks.length
      : 0;
    const activeArrears = (student?.arrears || []).filter((a) => a.status === 'ACTIVE').length;
    const clearedArrears = (student?.arrears || []).filter((a) => a.status === 'CLEARED').length;
    return {
      iaAverage: iaAverage.toFixed(1),
      activeArrears,
      clearedArrears,
      subjects: marks.length,
    };
  }, [student]);

  const subjectRows = useMemo(() => {
    return Object.entries(student?.marks || {}).map(([code, marks]) => {
      const average = (marks.ia1 + marks.ia2) / 2;
      return {
        code,
        name: SUBJECT_NAMES[code] || code,
        ia1: marks.ia1,
        ia2: marks.ia2,
        average: average.toFixed(1),
        status: average >= 50 ? 'On Track' : 'Attention',
        tone: average >= 50 ? 'emerald' : 'rose',
      };
    });
  }, [student]);

  const handleSignOut = () => {
    logout();
    if (onExitToStaff) onExitToStaff();
  };

  return (
    <div className="min-h-full min-h-[100dvh] bg-slate-950 text-slate-100 font-sans pb-12 overflow-x-hidden">
      {/* Header */}
      <header 
        className="border-b border-slate-800 bg-slate-900/85 backdrop-blur-xl px-2.5 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between gap-2.5 sticky top-0 z-30 transition-all"
        style={{
          minHeight: 'calc(3.75rem + env(safe-area-inset-top, 0px))',
          paddingTop: 'max(env(safe-area-inset-top, 0px), 0.75rem)',
          paddingLeft: 'max(env(safe-area-inset-left, 0px), 0.75rem)',
          paddingRight: 'max(env(safe-area-inset-right, 0px), 0.75rem)'
        }}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Official Emblem in clean white badge */}
          <div 
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shadow-black/20 ring-1 ring-sky-500/30 border border-slate-200/90 shrink-0"
            style={{ aspectRatio: '1 / 1' }}
          >
            <img
              src="/branding/college_emblem.png"
              alt="INFO Institute of Engineering Emblem"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
              <h1 className="font-display text-xs sm:text-sm md:text-base font-extrabold text-white tracking-tight truncate">
                INFO Institute of Engineering
              </h1>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                {identity.regNo ? `Student • ${identity.regNo}` : 'Autonomous'}
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400 font-medium truncate mt-0.5">
              Autonomous Institution • Academic Performance &amp; Result Analyzer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50 active:scale-95 cursor-pointer"
            style={{ minHeight: '38px', minWidth: '38px' }}
            title="Refresh records"
            aria-label="Refresh records"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 border-l border-slate-800">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-900 border border-emerald-500/30 flex items-center justify-center text-emerald-200 font-bold text-xs shrink-0 select-none">
              {user?.avatar || 'ST'}
            </div>
            <div className="hidden lg:block text-left max-w-[130px] truncate">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1 truncate">
                <span className="truncate">{user?.name}</span>
                <UserCheck className="h-3 w-3 text-emerald-400 shrink-0" />
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {identity.department || student?.department} • {student?.semester || identity.semester}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-[10px] px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer active:scale-95 font-medium"
              style={{ minHeight: '36px' }}
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-3.5 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
        {error && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {isLoading && !dossier ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400 text-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your academic records...
          </div>
        ) : (
          <>
            {/* Identity banner */}
            <section className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg shadow-indigo-600/30 shrink-0">
                  {(student?.name || 'S').charAt(0)}
                </div>
                <div className="min-w-0 truncate">
                  <h2 className="text-base sm:text-xl font-bold text-white truncate">{student?.name || user?.name}</h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-mono truncate">
                    {student?.regNo || identity.regNo} • {student?.department} • Sec {student?.section} • {student?.semester}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer active:scale-95 self-start sm:self-auto"
                style={{ minHeight: '40px' }}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                <span>Faculty / Staff Portal</span>
              </button>
            </section>

            {/* KPI strip */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <MetricCard
                icon={Award}
                label="Cumulative GPA"
                value={student?.cgpa?.toFixed(2) ?? '—'}
                tone="indigo"
              />
              <MetricCard
                icon={Percent}
                label="Attendance"
                value={student ? `${student.attendance}%` : '—'}
                tone={student && student.attendance < 75 ? 'rose' : 'emerald'}
              />
              <MetricCard
                icon={BookOpenCheck}
                label="IA Average"
                value={`${metrics.iaAverage}%`}
                tone="cyan"
              />
              <MetricCard
                icon={AlertTriangle}
                label="Active Backlogs"
                value={metrics.activeArrears}
                tone={metrics.activeArrears > 0 ? 'rose' : 'emerald'}
              />
            </section>

            {/* SGPA progression */}
            <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                  Semester SGPA Progression
                </h3>
                <span className="text-[11px] text-slate-400">Scale 0.0 - 10.0</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={student?.semesterHistory || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="sem" tickFormatter={(sem) => `Sem ${sem}`} stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[4, 10]} stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      labelFormatter={(sem) => `Semester ${sem}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="sgpa"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#6366f1' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* IA marks */}
            <section className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpenCheck className="h-4 w-4 text-cyan-400" />
                  Internal Assessment Marks
                </h3>
                <span className="sm:hidden text-[10px] text-cyan-400/80 font-medium">Swipe &rarr;</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800 touch-scroll">
                <table className="w-full text-left text-xs min-w-[480px]">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3 text-center">IA-1</th>
                      <th className="py-2.5 px-3 text-center">IA-2</th>
                      <th className="py-2.5 px-3 text-center">Average</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {subjectRows.map((row) => (
                      <tr key={row.code} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-medium">
                          <span className="font-mono text-indigo-300 mr-2">{row.code}</span>
                          {row.name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{row.ia1}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{row.ia2}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-white font-mono">{row.average}%</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              row.tone === 'emerald'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* University results */}
            <section className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-indigo-400" />
                  University Results
                </h3>
                <span className="sm:hidden text-[10px] text-indigo-400/80 font-medium">Swipe &rarr;</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800 touch-scroll">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Subject Code</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      <th className="py-2.5 px-3 text-center">Credits</th>
                      <th className="py-2.5 px-3 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {results.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono text-indigo-300">{r.subjectCode}</td>
                        <td className="py-2.5 px-3">{r.subjectName}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-white font-mono">{r.grade}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{r.credits}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              r.result === 'PASS'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {r.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {results.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 px-3 text-center text-slate-500">
                          No university results have been published yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Arrears */}
            <section className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Arrear Ledger
              </h3>
              {(student?.arrears || []).length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                  <CheckCircle2 className="h-4 w-4" />
                  No arrears on record. Keep it up.
                </div>
              ) : (
                <div className="space-y-2">
                  {student.arrears.map((arr, idx) => (
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
                          Failed in Semester {arr.semester} ({arr.examSession}) • {arr.attempts} attempt(s)
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          arr.status === 'CLEARED'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {arr.status === 'CLEARED' ? `Cleared (${arr.clearedInSession})` : 'Active Arrear'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
