/**
 * Reusable Student Arrear Classification Service (Frontend)
 * =========================================================
 * Provides centralized calculation of current uncleared arrear counts,
 * category classification, deduplication, and badge styling across all modules:
 * - Module A: Arrear History
 * - Module B: Student Profiles
 * - Module C: University Results
 *
 * Classification Rules:
 * - CATEGORY A (5+ Arrears):  5 to 9 uncleared subjects  -> Amber / Yellow
 * - CATEGORY B (10+ Arrears): 10 to 19 uncleared subjects -> Orange
 * - CATEGORY C (20+ Arrears): 20 or more uncleared subjects -> Red
 * - < 5 arrears: No badge, excluded from 5+, 10+, 20+ category filters.
 * - Categories are strictly mutually exclusive.
 */

export const PASS_GRADES = new Set(['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'PASS']);
export const CONFIRMED_FAIL_GRADES = new Set(['RA', 'U', 'FAIL']);
export const SPECIAL_NON_FAIL_GRADES = new Set(['AB', 'ABSENT', 'WH', 'WITHHELD', 'I', 'INCOMPLETE', 'UNKNOWN']);

export const CATEGORY_5_PLUS = {
  id: '5_plus',
  name: '5+ Arrears',
  label: '5+ Arrears',
  badge: '5+ Arrears',
  min: 5,
  max: 9,
  color: 'amber',
  hex: '#f59e0b',
  badgeClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  cardBorder: 'border-amber-500/40',
  cardGlow: 'shadow-amber-500/10',
  textClass: 'text-amber-400',
  bgPill: 'bg-amber-500/10',
};

export const CATEGORY_10_PLUS = {
  id: '10_plus',
  name: '10+ Arrears',
  label: '10+ Arrears',
  badge: '10+ Arrears',
  min: 10,
  max: 19,
  color: 'orange',
  hex: '#f97316',
  badgeClass: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  cardBorder: 'border-orange-500/40',
  cardGlow: 'shadow-orange-500/10',
  textClass: 'text-orange-400',
  bgPill: 'bg-orange-500/10',
};

export const CATEGORY_20_PLUS = {
  id: '20_plus',
  name: '20+ Arrears',
  label: '20+ Arrears',
  badge: '20+ Arrears',
  min: 20,
  max: 9999,
  color: 'red',
  hex: '#ef4444',
  badgeClass: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  cardBorder: 'border-rose-500/40',
  cardGlow: 'shadow-rose-500/10',
  textClass: 'text-rose-400',
  bgPill: 'bg-rose-500/10',
};

export const ARREAR_CATEGORIES = [CATEGORY_5_PLUS, CATEGORY_10_PLUS, CATEGORY_20_PLUS];

/**
 * Returns the mutually exclusive category config or null if < 5 arrears.
 * @param {number} arrearCount
 * @returns {object|null}
 */
export function getArrearCategory(arrearCount) {
  const count = Number(arrearCount) || 0;
  if (count >= 20) return CATEGORY_20_PLUS;
  if (count >= 10) return CATEGORY_10_PLUS;
  if (count >= 5) return CATEGORY_5_PLUS;
  return null;
}

/**
 * Calculates a student's current uncleared arrear count with strict deduplication
 * and verified status tracking.
 *
 * @param {object} student
 * @param {Array} [universityResults] optional global or scoped university examination results
 * @returns {object} enriched classification summary
 */
export function classifyStudentArrears(student, universityResults = []) {
  if (!student) return null;

  const regNo = student.regNo;
  const arrears = student.arrears || [];
  const subjectMap = new Map();
  let dataIncomplete = false;

  // 1. Ingest from student's ledger
  arrears.forEach((arr) => {
    const code = (arr.subjectCode || '').trim().toUpperCase();
    if (!code) {
      dataIncomplete = true;
      return;
    }
    const name = arr.subjectName || code;
    const sem = arr.semester || 0;
    const status = (arr.status || 'ACTIVE').toUpperCase();
    const attempts = arr.attempts || 1;
    const clearedSession = arr.clearedInSession || null;

    if (!subjectMap.has(code)) {
      subjectMap.set(code, {
        subjectCode: code,
        subjectName: name,
        semester: sem,
        status,
        attempts,
        clearedInSession: clearedSession,
        examSession: arr.examSession || 'N/A',
        needsVerification: false,
      });
    } else {
      const existing = subjectMap.get(code);
      existing.attempts = Math.max(existing.attempts, attempts);
      if (status === 'CLEARED') {
        existing.status = 'CLEARED';
        if (clearedSession) existing.clearedInSession = clearedSession;
      }
    }
  });

  // 2. Cross-reference with verified university results if present
  if (Array.isArray(universityResults) && regNo) {
    const studentExams = universityResults.filter((r) => r.regNo === regNo);
    studentExams.forEach((exam) => {
      const code = (exam.subjectCode || '').trim().toUpperCase();
      if (!code) return;

      const name = exam.subjectName || code;
      const grade = (exam.grade || '').trim().toUpperCase();
      const result = (exam.result || '').trim().toUpperCase();
      const sem = exam.semester || 5;
      const session = exam.examSession || 'Nov/Dec 2024';

      const isPass = PASS_GRADES.has(grade) || result === 'PASS';
      const isFail = CONFIRMED_FAIL_GRADES.has(grade) || result === 'FAIL';
      const isSpecial = SPECIAL_NON_FAIL_GRADES.has(grade) || SPECIAL_NON_FAIL_GRADES.has(result);

      if (!subjectMap.has(code)) {
        if (isFail) {
          subjectMap.set(code, {
            subjectCode: code,
            subjectName: name,
            semester: sem,
            status: 'ACTIVE',
            attempts: 1,
            clearedInSession: null,
            examSession: session,
            needsVerification: false,
          });
        } else if (isSpecial) {
          subjectMap.set(code, {
            subjectCode: code,
            subjectName: name,
            semester: sem,
            status: 'VERIFICATION_REQUIRED',
            attempts: 1,
            clearedInSession: null,
            examSession: session,
            needsVerification: true,
          });
        }
      } else {
        const existing = subjectMap.get(code);
        if (isPass) {
          existing.status = 'CLEARED';
          existing.clearedInSession = session;
        } else if (isFail && existing.status !== 'CLEARED') {
          existing.status = 'ACTIVE';
          existing.attempts = (existing.attempts || 1) + 1;
        }
      }
    });
  }

  const pendingSubjects = [];
  const clearedSubjects = [];
  const verificationNeeded = [];

  subjectMap.forEach((sub) => {
    if (sub.status === 'CLEARED') {
      clearedSubjects.push(sub);
    } else if (sub.status === 'ACTIVE') {
      pendingSubjects.push(sub);
    } else if (sub.needsVerification || sub.status === 'VERIFICATION_REQUIRED') {
      verificationNeeded.push(sub);
    }
  });

  // Sort by semester then code
  pendingSubjects.sort((a, b) => a.semester - b.semester || a.subjectCode.localeCompare(b.subjectCode));
  clearedSubjects.sort((a, b) => a.semester - b.semester || a.subjectCode.localeCompare(b.subjectCode));

  const totalUnclearedCount = pendingSubjects.length;
  const clearedCount = clearedSubjects.length;
  const category = getArrearCategory(totalUnclearedCount);

  return {
    studentId: student.id,
    regNo: student.regNo,
    studentName: student.name,
    name: student.name,
    email: student.email,
    department: student.department,
    currentSemester: student.semester,
    semester: student.semester,
    section: student.section || 'A',
    gender: student.gender || 'Unspecified',
    attendance: student.attendance ?? 85,
    cgpa: student.cgpa ?? 0.0,
    marks: student.marks || {},
    semesterHistory: student.semesterHistory || [],
    totalUnclearedCount,
    clearedCount,
    totalHistoricalBacklogs: totalUnclearedCount + clearedCount,
    category: category ? category.id : null,
    categoryLabel: category ? category.label : null,
    categoryBadge: category ? category.badge : null,
    categoryColor: category ? category.color : null,
    categoryMeta: category,
    pendingSubjects,
    clearedSubjects,
    verificationRequiredSubjects: verificationNeeded,
    hasIncompleteData: dataIncomplete || verificationNeeded.length > 0,
    statusMessage: (dataIncomplete || verificationNeeded.length > 0) ? 'Needs verification' : 'Verified',
  };
}

/**
 * Classifies an entire cohort of students and computes category aggregates.
 * @param {Array} students
 * @param {Array} [universityResults]
 * @returns {object}
 */
export function classifyCohortArrears(students = [], universityResults = []) {
  const classified = (students || []).map((s) => classifyStudentArrears(s, universityResults));

  const cat5Plus = classified.filter((s) => s.category === '5_plus');
  const cat10Plus = classified.filter((s) => s.category === '10_plus');
  const cat20Plus = classified.filter((s) => s.category === '20_plus');
  const under5 = classified.filter((s) => s.category === null);

  const totalStudents = classified.length;
  const totalWithArrears = classified.filter((s) => s.totalUnclearedCount > 0).length;
  const allClearCount = classified.filter((s) => s.totalUnclearedCount === 0).length;

  const distribution = [
    {
      category: '5+ Arrears',
      range: '5 - 9 subjects',
      count: cat5Plus.length,
      percentage: totalStudents ? Math.round((cat5Plus.length / totalStudents) * 100) : 0,
      color: '#f59e0b',
    },
    {
      category: '10+ Arrears',
      range: '10 - 19 subjects',
      count: cat10Plus.length,
      percentage: totalStudents ? Math.round((cat10Plus.length / totalStudents) * 100) : 0,
      color: '#f97316',
    },
    {
      category: '20+ Arrears',
      range: '20+ subjects',
      count: cat20Plus.length,
      percentage: totalStudents ? Math.round((cat20Plus.length / totalStudents) * 100) : 0,
      color: '#ef4444',
    },
  ];

  return {
    summary: {
      totalStudents,
      allClearCount,
      totalWithArrears,
      fivePlusCount: cat5Plus.length,
      tenPlusCount: cat10Plus.length,
      twentyPlusCount: cat20Plus.length,
      underFiveCount: under5.length,
    },
    distribution,
    students: classified,
    categories: {
      fivePlus: cat5Plus,
      tenPlus: cat10Plus,
      twentyPlus: cat20Plus,
      underFive: under5,
    },
  };
}
