import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Search, 
  Filter, 
  Eye, 
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Check,
  RefreshCw,
  Download
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';

export default function UniversityResults() {
  const { universityResults, commitUniversityResults } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(null); // 'reading', 'extracting', 'verifying', 'ready'
  const [stagingData, setStagingData] = useState(null);
  const [commitSuccess, setCommitSuccess] = useState(false);

  // Calculate overall and subject-wise statistics
  const stats = useMemo(() => {
    const totalRecords = universityResults.length;
    const passedRecords = universityResults.filter((r) => r.result === 'PASS' || r.grade !== 'RA');
    const failedRecords = universityResults.filter((r) => r.result === 'FAIL' || r.grade === 'RA');

    // Distinct candidates
    const distinctStudents = new Set(universityResults.map((r) => r.regNo)).size;
    const studentsWithArrears = new Set(failedRecords.map((r) => r.regNo)).size;
    const allClearStudents = distinctStudents - studentsWithArrears;

    const overallPassRate = distinctStudents ? Math.round((allClearStudents / distinctStudents) * 100) : 0;

    // Subject-wise pass percentage calculations
    const subjectMap = {};
    universityResults.forEach((r) => {
      if (!subjectMap[r.subjectCode]) {
        subjectMap[r.subjectCode] = { code: r.subjectCode, name: r.subjectName, total: 0, passed: 0 };
      }
      subjectMap[r.subjectCode].total += 1;
      if (r.result === 'PASS' || r.grade !== 'RA') {
        subjectMap[r.subjectCode].passed += 1;
      }
    });

    const subjectAnalytics = Object.values(subjectMap).map((s) => ({
      name: s.code,
      fullName: s.name,
      PassRate: Math.round((s.passed / s.total) * 100),
      Failures: s.total - s.passed,
      Total: s.total,
    }));

    return {
      distinctStudents,
      allClearStudents,
      studentsWithArrears,
      overallPassRate,
      totalFailures: failedRecords.length,
      subjectAnalytics,
    };
  }, [universityResults]);

  // Filtered list
  const filteredList = useMemo(() => {
    return universityResults.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.regNo.includes(searchTerm) ||
        item.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subjectName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter === 'PASS') return item.result === 'PASS';
      if (statusFilter === 'FAIL') return item.result === 'FAIL' || item.grade === 'RA';
      return true;
    });
  }, [universityResults, searchTerm, statusFilter]);

  // Simulate PDF Upload and PyMuPDF + pdfplumber tabular extraction
  const handleSimulatePdfUpload = () => {
    setIsUploading(true);
    setUploadStep('Reading PDF via PyMuPDF (fitz)...');

    setTimeout(() => {
      setUploadStep('Parsing university examination tables via pdfplumber...');
      setTimeout(() => {
        setUploadStep('Extracting Register Numbers, Subject Codes, Grades...');
        setTimeout(() => {
          // Staged results from PDF waiting for faculty confirmation
          const parsedSample = [
            { regNo: '710022104008', name: 'Janani V', subjectCode: 'CS3591', subjectName: 'Computer Networks', grade: 'O', credits: 4, result: 'PASS' },
            { regNo: '710022104008', name: 'Janani V', subjectCode: 'CS3501', subjectName: 'Compiler Design', grade: 'A+', credits: 4, result: 'PASS' },
            { regNo: '710022104009', name: 'Kavin Raj', subjectCode: 'CS3591', subjectName: 'Computer Networks', grade: 'B+', credits: 4, result: 'PASS' },
            { regNo: '710022104009', name: 'Kavin Raj', subjectCode: 'CS3501', subjectName: 'Compiler Design', grade: 'RA', credits: 4, result: 'FAIL' },
            { regNo: '710022104010', name: 'Lavanya M', subjectCode: 'CS3591', subjectName: 'Computer Networks', grade: 'A', credits: 4, result: 'PASS' },
            { regNo: '710022104010', name: 'Lavanya M', subjectCode: 'CS3501', subjectName: 'Compiler Design', grade: 'A', credits: 4, result: 'PASS' },
          ];
          setStagingData(parsedSample);
          setIsUploading(false);
          setUploadStep(null);
        }, 800);
      }, 700);
    }, 600);
  };

  const handleCommitStaging = () => {
    if (stagingData) {
      commitUniversityResults(stagingData);
      setStagingData(null);
      setCommitSuccess(true);
      setTimeout(() => setCommitSuccess(false), 4000);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Register Number,Student Name,Subject Code,Subject Name,Grade,Credits,Result Status\n'];
    const rows = filteredList.map((r) =>
      `"${r.regNo}","${r.name}","${r.subjectCode}","${r.subjectName}","${r.grade}","${r.credits}","${r.result}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `University_Results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Module B: University Result Analyzer
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-medium">
                PyMuPDF & pdfplumber
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Extract official university examination PDF sheets, verify in preview mode, and track student backlogs.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulatePdfUpload}
            disabled={isUploading}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Extracting PDF...' : 'Upload University PDF'}
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4 text-cyan-400" />
            Export Results
          </button>
        </div>
      </div>

      {/* PDF Processing Progress Modal or Notification */}
      {isUploading && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-3 animate-pulse">
          <RefreshCw className="h-5 w-5 animate-spin text-cyan-400 shrink-0" />
          <div>
            <div className="font-bold text-white">Extracting University Mark Sheet PDF</div>
            <div className="text-[11px] text-cyan-300/80">{uploadStep}</div>
          </div>
        </div>
      )}

      {commitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>Extracted university marks verified and successfully saved to the institutional database!</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-xs text-slate-400 font-medium">Cohort Pass Rate</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{stats.overallPassRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">{stats.allClearStudents} All Clear of {stats.distinctStudents} Students</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-xs text-slate-400 font-medium">Total Paper Failures / RA</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{stats.totalFailures}</div>
          <div className="text-[11px] text-rose-400/80 mt-1">Requiring supplementary exam</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-xs text-slate-400 font-medium">Students with Backlogs</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats.studentsWithArrears}</div>
          <div className="text-[11px] text-slate-400 mt-1">Candidates with &ge;1 arrear</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-xs text-slate-400 font-medium">Total Evaluated Entries</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{universityResults.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Validated subject records</div>
        </div>
      </div>

      {/* Subject-Wise Pass Rate Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              Subject-Wise University Examination Pass Percentage
            </h3>
            <p className="text-[11px] text-slate-400">Institutional pass percentages and failure distribution across core subject codes</p>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.subjectAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val}%`} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="PassRate" fill="#10b981" radius={[4, 4, 0, 0]} name="Pass Rate (%)" />
              <Bar dataKey="Failures" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Failure Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Faculty Verification Preview Staging Area */}
      {stagingData && (
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                Faculty Verification Staging Area ({stagingData.length} Extracted Records)
              </h3>
              <p className="text-xs text-indigo-200">
                Data extracted from uploaded PDF via PyMuPDF + pdfplumber. Verify before committing to permanent storage.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStagingData(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Discard
              </button>
              <button
                onClick={handleCommitStaging}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                Confirm & Commit to Database
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-indigo-500/20 bg-slate-950/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-semibold border-b border-indigo-500/20">
                <tr>
                  <th className="py-2.5 px-3">Register Number</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Subject Code & Title</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {stagingData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-indigo-900/20">
                    <td className="py-2.5 px-3 font-mono text-cyan-300">{row.regNo}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{row.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-indigo-300 mr-2">{row.subjectCode}</span>
                      {row.subjectName}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono">{row.grade}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.result === 'PASS'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      }`}>
                        {row.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Results Table & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Results ({universityResults.length})
          </button>
          <button
            onClick={() => setStatusFilter('PASS')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'PASS'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            Passed
          </button>
          <button
            onClick={() => setStatusFilter('FAIL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'FAIL'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            Arrears / RA
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search register no, name, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Database Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Register Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Subject Code & Name</th>
                <th className="py-3 px-4 text-center">Credits</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-center">Result Status</th>
                <th className="py-3 px-4 text-center">Arrear Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-medium text-cyan-300">{item.regNo}</td>
                  <td className="py-3 px-4 font-semibold text-white">{item.name}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-indigo-300 mr-2">{item.subjectCode}</span>
                    <span className="text-slate-200">{item.subjectName}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">{item.credits}</td>
                  <td className="py-3 px-4 text-center font-bold text-white font-mono">{item.grade}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.result === 'PASS'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                    }`}>
                      {item.result}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.grade === 'RA' || item.result === 'FAIL' ? (
                      <span className="text-rose-400 text-[11px] font-semibold">Active Backlog</span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Regular Pass</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
