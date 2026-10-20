import React, { useMemo } from 'react';
import { 
  Users, 
  BookOpenCheck, 
  FileSpreadsheet, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  Award,
  Layers,
  Sparkles,
  ChevronRight,
  History,
  Activity,
  CheckCircle2,
  Clock,
  UserCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../components/common/StatCard';
import HealthWidget from '../components/common/HealthWidget';
import { useApp } from '../context/AppContext';
import { AUDIT_LOGS } from '../data/mockData';

export default function Dashboard({ healthData, isLoadingHealth, onRefreshHealth, onNavigateTab }) {
  const { students, subjects, universityResults, selectedDepartment } = useApp();

  // Aggregate metrics
  const dashboardStats = useMemo(() => {
    const totalStudents = students.length;

    // IA performance
    let totalIaSum = 0;
    let totalIaCount = 0;
    let atRiskList = [];

    students.forEach((s) => {
      Object.entries(s.marks || {}).forEach(([subCode, m]) => {
        const ia1 = m.ia1 || 0;
        const ia2 = m.ia2 || 0;
        const avg = (ia1 + ia2) / 2;
        const drop = ia1 - ia2;
        totalIaSum += avg;
        totalIaCount += 1;

        if (avg < 50 || drop >= 15) {
          atRiskList.push({
            studentName: s.name,
            regNo: s.regNo,
            subjectCode: subCode,
            ia1,
            ia2,
            avg: avg.toFixed(1),
            reason: avg < 50 ? 'Mark < 50%' : `Dropped by ${drop} marks`,
          });
        }
      });
    });

    const overallIaAverage = totalIaCount ? (totalIaSum / totalIaCount).toFixed(1) : 0;

    // University performance
    const totalUniv = universityResults.length;
    const passedUniv = universityResults.filter((r) => r.result === 'PASS' || r.grade !== 'RA').length;
    const univPassRate = totalUniv ? Math.round((passedUniv / totalUniv) * 100) : 0;

    // Arrears
    const activeArrearsCount = students.reduce(
      (acc, s) => acc + (s.arrears || []).filter((a) => a.status === 'ACTIVE').length,
      0
    );

    return {
      totalStudents,
      overallIaAverage,
      univPassRate,
      activeArrearsCount,
      atRiskList: atRiskList.slice(0, 4),
    };
  }, [students, universityResults]);

  // Subject average comparison chart data
  const subjectAveragesData = useMemo(() => {
    return subjects.map((sub) => {
      let sum = 0;
      let count = 0;
      students.forEach((s) => {
        if (s.marks[sub.code]) {
          sum += (s.marks[sub.code].ia1 + s.marks[sub.code].ia2) / 2;
          count += 1;
        }
      });
      const avg = count ? Math.round(sum / count) : 0;
      return {
        subject: sub.code,
        name: sub.name,
        Average: avg,
        Target: 80,
      };
    });
  }, [students, subjects]);

  // Grade breakdown for pie chart
  const gradeDistribution = [
    { name: 'O (Outstanding)', value: 8, color: '#6366f1' },
    { name: 'A+ (Excellent)', value: 12, color: '#06b6d4' },
    { name: 'A (Very Good)', value: 10, color: '#10b981' },
    { name: 'B+ / B (Good)', value: 6, color: '#f59e0b' },
    { name: 'RA (Re-Appear)', value: 4, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 p-8 glass-panel shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Institutional Academic Intelligence Portal
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Executive Academic Dashboard
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Monitor real-time cohort statistics, evaluate continuous assessment performance (IA-1 & IA-2), track Anna University examination arrears, and flag at-risk candidates for targeted academic intervention.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('module-a')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <BookOpenCheck className="h-4 w-4" />
              Open IA Analyzer (Module A)
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('module-b')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
              University Result Analyzer (Module B)
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient glows */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 -bottom-16 w-60 h-60 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Cohort"
          value={dashboardStats.totalStudents}
          subtitle={`Department of ${selectedDepartment}`}
          change="Sem 5 Active"
          isPositive={true}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="IA Overall Average"
          value={`${dashboardStats.overallIaAverage}%`}
          subtitle="IA-1 & IA-2 Continuous Score"
          change="+4.2% vs Sem 4"
          isPositive={true}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="University Pass Rate"
          value={`${dashboardStats.univPassRate}%`}
          subtitle="Previous Semester Examination"
          change="85% Benchmark"
          isPositive={true}
          icon={Award}
          color="cyan"
        />
        <StatCard
          title="Active Arrears"
          value={dashboardStats.activeArrearsCount}
          subtitle="Students Requiring Re-Exam"
          change="Action Required"
          isPositive={false}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Recharts Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Average Comparison */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                Subject-Wise Internal Assessment Averages
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Average score per subject compared against institutional benchmark (80%)</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">Sem 5</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAveragesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val, name, item) => [`${val}%`, `${name} (${item.payload.name})`]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Average" fill="#6366f1" radius={[4, 4, 0, 0]} name="Cohort Average" />
                <Bar dataKey="Target" fill="#334155" radius={[4, 4, 0, 0]} name="Benchmark (80%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* University Grade Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-cyan-400" />
              University Grade Spread
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across university grade bands</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
            {gradeDistribution.map((g) => (
              <div key={g.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: g.color }}></span>
                <span className="truncate">{g.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Early Warning Alerts & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Attention Priority Feed */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Priority Academic Attention Alerts</h3>
            </div>
            <button
              onClick={() => onNavigateTab('module-a')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View All Flags &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {dashboardStats.atRiskList.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    {item.studentName}
                    <span className="text-[11px] font-mono text-cyan-400">({item.regNo})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.subjectCode} • IA-1: {item.ia1} &rarr; IA-2: {item.ia2}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    {item.reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log & Activity */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Institutional Activity & Audit Log</h3>
            </div>
            <span className="text-[11px] text-slate-500">Live system audit</span>
          </div>

          <div className="space-y-2.5">
            {AUDIT_LOGS.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{log.action}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {log.user} • {log.subject}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span className="text-indigo-400 block font-medium">{log.status}</span>
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System & API Diagnostics Status Bar */}
      <HealthWidget
        healthData={healthData}
        isLoading={isLoadingHealth}
        onRefresh={onRefreshHealth}
      />
    </div>
  );
}
