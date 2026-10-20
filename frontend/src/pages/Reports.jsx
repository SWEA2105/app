import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  Printer, 
  Eye, 
  X, 
  Award, 
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Reports() {
  const { students, subjects, universityResults, selectedDepartment } = useApp();
  const [previewModal, setPreviewModal] = useState(null);

  // Generate real downloads based on report type
  const handleDownload = (reportKey, format = 'csv') => {
    let content = '';
    let filename = '';

    if (reportKey === 'ia_roster') {
      const headers = 'Register Number,Student Name,Department,CS3591 (IA1/IA2),CS3501 (IA1/IA2),CS3551 (IA1/IA2),CGPA\n';
      const rows = students.map((s) => {
        const m1 = `${s.marks?.CS3591?.ia1 || 0}/${s.marks?.CS3591?.ia2 || 0}`;
        const m2 = `${s.marks?.CS3501?.ia1 || 0}/${s.marks?.CS3501?.ia2 || 0}`;
        const m3 = `${s.marks?.CS3551?.ia1 || 0}/${s.marks?.CS3551?.ia2 || 0}`;
        return `"${s.regNo}","${s.name}","${s.department}","${m1}","${m2}","${m3}","${s.cgpa}"\n`;
      }).join('');
      content = headers + rows;
      filename = `Consolidated_IA_Roster_${selectedDepartment}.csv`;
    } else if (reportKey === 'attention') {
      const headers = 'Register Number,Student Name,Department,Attendance,CGPA,Active Arrears,Remediation Action Required\n';
      const rows = students
        .filter((s) => s.attendance < 75 || s.cgpa < 6.5 || (s.arrears || []).some((a) => a.status === 'ACTIVE'))
        .map((s) => {
          const activeArr = (s.arrears || []).filter((a) => a.status === 'ACTIVE').length;
          return `"${s.regNo}","${s.name}","${s.department}","${s.attendance}%","${s.cgpa}","${activeArr}","Mandatory Tutorial & Mentorship Counseling"\n`;
        }).join('');
      content = headers + rows;
      filename = `Academic_Attention_Remediation_List_${selectedDepartment}.csv`;
    } else if (reportKey === 'university') {
      const headers = 'Register Number,Student Name,Subject Code,Subject Name,Grade,Result\n';
      const rows = universityResults.map((r) =>
        `"${r.regNo}","${r.name}","${r.subjectCode}","${r.subjectName}","${r.grade}","${r.result}"\n`
      ).join('');
      content = headers + rows;
      filename = `University_Results_Arrear_Ledger_${selectedDepartment}.csv`;
    } else {
      // NAAC summary
      const headers = 'Metric,Value,Benchmark,Status\n';
      const rows = [
        '"Total Cohort Strength","184","180","Target Exceeded"\n',
        '"University Exam Pass Percentage","89.4%","85.0%","Attained"\n',
        '"Average Attendance Rate","84.6%","75.0%","Compliant"\n',
        '"Placement & Higher Ed Attainment","82.1%","80.0%","Attained"\n',
      ].join('');
      content = headers + rows;
      filename = `NAAC_NBA_Accreditation_Summary_${selectedDepartment}.csv`;
    }

    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handleOpenPrintPreview = (rep) => {
    setPreviewModal(rep);
  };

  const reportsList = [
    {
      id: 'ia_roster',
      title: 'Consolidated Internal Assessment Roster',
      desc: 'Complete student mark sheet with IA-1, IA-2, continuous evaluation averages, and cohort rankings.',
      formats: ['Excel', 'PDF'],
      type: 'Module A: IA',
      tag: 'Continuous Evaluation',
    },
    {
      id: 'attention',
      title: 'Academic Attention & Remediation Plan',
      desc: 'Filtered list of students scoring under 50% or declining by >15%, with remediation action notes.',
      formats: ['Excel', 'PDF'],
      type: 'Early Warning',
      tag: 'Remediation',
    },
    {
      id: 'university',
      title: 'University Examination Pass Rate & Arrear Ledger',
      desc: 'Subject-wise pass percentages, failure counts, historical arrears, and cleared arrear records.',
      formats: ['Excel', 'PDF'],
      type: 'Module B: University',
      tag: 'Examination',
    },
    {
      id: 'naac',
      title: 'Institutional NAAC / NBA Accreditation Summary',
      desc: 'Executive performance metrics, course outcome (CO) attainment levels, and multi-semester trend charts.',
      formats: ['Excel', 'PDF'],
      type: 'Institutional',
      tag: 'Accreditation',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Analytics & Report Generator Hub</h2>
            <p className="text-xs text-slate-400">
              Generate institutionally formatted Excel spreadsheets and printable PDF academic transcripts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Building2 className="h-4 w-4 text-indigo-400" />
          <span>Active Scope: <strong className="text-white">{selectedDepartment} Department</strong></span>
        </div>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportsList.map((rep) => (
          <div key={rep.id} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4 flex flex-col justify-between hover:border-purple-500/30 transition">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {rep.type}
                </span>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Ready to Export
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{rep.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{rep.desc}</p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
              <button
                onClick={() => handleDownload(rep.id, 'excel')}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Export Excel (.csv)
              </button>
              <button
                onClick={() => handleOpenPrintPreview(rep)}
                className="flex-1 py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Preview PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Printable Report Modal Preview */}
      {previewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Institutional Document Preview
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{previewModal.title}</h3>
                <p className="text-xs text-slate-400">Department of {selectedDepartment} • Academic Year 2024-2025</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Now
                </button>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-sans text-xs space-y-4">
              <div className="text-center pb-4 border-b border-slate-800 space-y-1">
                <h2 className="text-base font-black text-white uppercase tracking-wider">
                  Anna University Affiliated Autonomous Engineering College
                </h2>
                <p className="text-xs text-slate-400">Office of the Controller of Examinations & Academic Monitoring Cell</p>
                <div className="text-xs font-semibold text-purple-400 pt-1">{previewModal.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-400">
                <div>
                  <strong>Department:</strong> {selectedDepartment}
                </div>
                <div className="text-right">
                  <strong>Date of Generation:</strong> {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Sample Document Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Reg No</th>
                      <th className="py-2 px-3">Student Name</th>
                      <th className="py-2 px-3 text-center">IA-1</th>
                      <th className="py-2 px-3 text-center">IA-2</th>
                      <th className="py-2 px-3 text-center">Average</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {students.slice(0, 6).map((s) => {
                      const m = s.marks?.CS3591 || { ia1: 0, ia2: 0 };
                      const avg = (m.ia1 + m.ia2) / 2;
                      return (
                        <tr key={s.id}>
                          <td className="py-2 px-3 font-mono text-cyan-400">{s.regNo}</td>
                          <td className="py-2 px-3 text-white">{s.name}</td>
                          <td className="py-2 px-3 text-center">{m.ia1}</td>
                          <td className="py-2 px-3 text-center">{m.ia2}</td>
                          <td className="py-2 px-3 text-center font-bold text-white">{avg.toFixed(1)}%</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${avg >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {avg >= 50 ? 'PASS' : 'REMEDIATION'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-800">
                <span>Verified by Academic Cell</span>
                <span>Authorized Faculty Signature: Dr. V. Meenakshi</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
