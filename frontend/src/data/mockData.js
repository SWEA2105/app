// Mock Data Store for Student Academic Performance & University Result Analyzer

export const DEPARTMENTS = [
  { id: 'CSE', name: 'Computer Science & Engineering', code: 'CS', hod: 'Dr. R. Ramanathan' },
  { id: 'ECE', name: 'Electronics & Communication Eng.', code: 'EC', hod: 'Dr. S. Kanthimathi' },
  { id: 'IT', name: 'Information Technology', code: 'IT', hod: 'Dr. M. Geetha' },
  { id: 'AIDS', name: 'Artificial Intelligence & Data Science', code: 'AD', hod: 'Dr. P. Karthik' },
  { id: 'MECH', name: 'Mechanical Engineering', code: 'ME', hod: 'Dr. K. Annamalai' },
];

export const SEMESTERS = [
  { id: 'sem1', number: 1, academicYear: '2022-2023', label: 'Semester 1' },
  { id: 'sem2', number: 2, academicYear: '2022-2023', label: 'Semester 2' },
  { id: 'sem3', number: 3, academicYear: '2023-2024', label: 'Semester 3' },
  { id: 'sem4', number: 4, academicYear: '2023-2024', label: 'Semester 4' },
  { id: 'sem5', number: 5, academicYear: '2024-2025', label: 'Semester 5 (Current)' },
  { id: 'sem6', number: 6, academicYear: '2024-2025', label: 'Semester 6' },
];

export const SUBJECTS_SEM5 = [
  { code: 'CS3591', name: 'Computer Networks', credits: 4, faculty: 'Prof. A. Senthil', maxIA: 100 },
  { code: 'CS3501', name: 'Compiler Design', credits: 4, faculty: 'Dr. V. Meenakshi', maxIA: 100 },
  { code: 'CS3551', name: 'Distributed Systems', credits: 3, faculty: 'Prof. T. Rajesh', maxIA: 100 },
  { code: 'CS3511', name: 'Data Mining & Warehousing', credits: 3, faculty: 'Dr. B. Sudha', maxIA: 100 },
  { code: 'CCS334', name: 'Big Data Analytics', credits: 3, faculty: 'Prof. N. Vignesh', maxIA: 100 },
];

export const INITIAL_STUDENTS = [
  {
    id: 's01',
    regNo: '710022104001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'A',
    gender: 'Male',
    attendance: 94,
    cgpa: 8.85,
    marks: {
      CS3591: { ia1: 88, ia2: 94 },
      CS3501: { ia1: 82, ia2: 90 },
      CS3551: { ia1: 85, ia2: 92 },
      CS3511: { ia1: 90, ia2: 95 },
      CCS334: { ia1: 86, ia2: 91 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 8.6, passCount: 6, failCount: 0 },
      { sem: 2, sgpa: 8.75, passCount: 6, failCount: 0 },
      { sem: 3, sgpa: 8.9, passCount: 6, failCount: 0 },
      { sem: 4, sgpa: 8.85, passCount: 6, failCount: 0 },
    ],
    arrears: []
  },
  {
    id: 's02',
    regNo: '710022104002',
    name: 'Bhavya Nair',
    email: 'bhavya.nair@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'A',
    gender: 'Female',
    attendance: 88,
    cgpa: 8.12,
    marks: {
      CS3591: { ia1: 72, ia2: 84 },
      CS3501: { ia1: 76, ia2: 82 },
      CS3551: { ia1: 70, ia2: 78 },
      CS3511: { ia1: 82, ia2: 88 },
      CCS334: { ia1: 75, ia2: 80 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 8.0, passCount: 6, failCount: 0 },
      { sem: 2, sgpa: 8.1, passCount: 6, failCount: 0 },
      { sem: 3, sgpa: 7.9, passCount: 6, failCount: 0 },
      { sem: 4, sgpa: 8.2, passCount: 6, failCount: 0 },
    ],
    arrears: []
  },
  {
    id: 's03',
    regNo: '710022104003',
    name: 'Deepak Kumar',
    email: 'deepak.kumar@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'A',
    gender: 'Male',
    attendance: 72,
    cgpa: 6.45,
    marks: {
      CS3591: { ia1: 65, ia2: 44 }, // Declining by 21 marks!
      CS3501: { ia1: 58, ia2: 38 }, // Declining by 20 marks!
      CS3551: { ia1: 60, ia2: 42 },
      CS3511: { ia1: 70, ia2: 52 },
      CCS334: { ia1: 62, ia2: 46 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 7.1, passCount: 6, failCount: 0 },
      { sem: 2, sgpa: 6.8, passCount: 5, failCount: 1 },
      { sem: 3, sgpa: 6.2, passCount: 5, failCount: 1 },
      { sem: 4, sgpa: 6.4, passCount: 6, failCount: 0 },
    ],
    arrears: [
      {
        subjectCode: 'CS3352',
        subjectName: 'Foundations of Data Science',
        semester: 3,
        examSession: 'Nov/Dec 2023',
        status: 'CLEARED',
        clearedInSession: 'Apr/May 2024',
        attempts: 2
      },
      {
        subjectCode: 'MA3354',
        subjectName: 'Discrete Mathematics',
        semester: 2,
        examSession: 'Apr/May 2023',
        status: 'ACTIVE',
        clearedInSession: null,
        attempts: 3
      }
    ]
  },
  {
    id: 's04',
    regNo: '710022104004',
    name: 'Divya R',
    email: 'divya.r@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'A',
    gender: 'Female',
    attendance: 98,
    cgpa: 9.65,
    marks: {
      CS3591: { ia1: 96, ia2: 98 },
      CS3501: { ia1: 94, ia2: 97 },
      CS3551: { ia1: 92, ia2: 95 },
      CS3511: { ia1: 98, ia2: 99 },
      CCS334: { ia1: 95, ia2: 98 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 9.5, passCount: 6, failCount: 0 },
      { sem: 2, sgpa: 9.7, passCount: 6, failCount: 0 },
      { sem: 3, sgpa: 9.6, passCount: 6, failCount: 0 },
      { sem: 4, sgpa: 9.8, passCount: 6, failCount: 0 },
    ],
    arrears: []
  },
  {
    id: 's05',
    regNo: '710022104005',
    name: 'Gokul S',
    email: 'gokul.s@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'A',
    gender: 'Male',
    attendance: 64, // Low attendance
    cgpa: 5.75,
    marks: {
      CS3591: { ia1: 42, ia2: 36 }, // Under 50%
      CS3501: { ia1: 38, ia2: 32 }, // Under 50%
      CS3551: { ia1: 45, ia2: 40 }, // Under 50%
      CS3511: { ia1: 52, ia2: 44 }, // Under 50%
      CCS334: { ia1: 46, ia2: 39 }, // Under 50%
    },
    semesterHistory: [
      { sem: 1, sgpa: 6.2, passCount: 5, failCount: 1 },
      { sem: 2, sgpa: 5.8, passCount: 4, failCount: 2 },
      { sem: 3, sgpa: 5.5, passCount: 4, failCount: 2 },
      { sem: 4, sgpa: 5.4, passCount: 5, failCount: 1 },
    ],
    arrears: [
      {
        subjectCode: 'MA3151',
        subjectName: 'Matrices and Calculus',
        semester: 1,
        examSession: 'Jan/Feb 2023',
        status: 'CLEARED',
        clearedInSession: 'Nov/Dec 2023',
        attempts: 2
      },
      {
        subjectCode: 'CS3491',
        subjectName: 'Artificial Intelligence & Machine Learning',
        semester: 4,
        examSession: 'Apr/May 2024',
        status: 'ACTIVE',
        clearedInSession: null,
        attempts: 2
      },
      {
        subjectCode: 'CS3452',
        subjectName: 'Theory of Computation',
        semester: 4,
        examSession: 'Apr/May 2024',
        status: 'ACTIVE',
        clearedInSession: null,
        attempts: 1
      }
    ]
  },
  {
    id: 's06',
    regNo: '710022104006',
    name: 'Harini K',
    email: 'harini.k@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'A',
    gender: 'Female',
    attendance: 92,
    cgpa: 8.52,
    marks: {
      CS3591: { ia1: 84, ia2: 89 },
      CS3501: { ia1: 80, ia2: 86 },
      CS3551: { ia1: 82, ia2: 87 },
      CS3511: { ia1: 85, ia2: 90 },
      CCS334: { ia1: 81, ia2: 85 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 8.4, passCount: 6, failCount: 0 },
      { sem: 2, sgpa: 8.5, passCount: 6, failCount: 0 },
      { sem: 3, sgpa: 8.6, passCount: 6, failCount: 0 },
      { sem: 4, sgpa: 8.5, passCount: 6, failCount: 0 },
    ],
    arrears: []
  },
  {
    id: 's07',
    regNo: '710022104007',
    name: 'Imran Khan',
    email: 'imran.khan@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'B',
    gender: 'Male',
    attendance: 84,
    cgpa: 7.68,
    marks: {
      CS3591: { ia1: 68, ia2: 78 }, // Improving
      CS3501: { ia1: 64, ia2: 76 }, // Improving
      CS3551: { ia1: 72, ia2: 80 },
      CS3511: { ia1: 75, ia2: 82 },
      CCS334: { ia1: 70, ia2: 79 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 7.5, passCount: 6, failCount: 0 },
      { sem: 2, sgpa: 7.6, passCount: 6, failCount: 0 },
      { sem: 3, sgpa: 7.7, passCount: 6, failCount: 0 },
      { sem: 4, sgpa: 7.9, passCount: 6, failCount: 0 },
    ],
    arrears: []
  },
  {
    id: 's08',
    regNo: '710022104008',
    name: 'Janani V',
    email: 'janani.v@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'B',
    gender: 'Female',
    attendance: 90,
    cgpa: 8.95,
    marks: {
      CS3591: { ia1: 91, ia2: 95 },
      CS3501: { ia1: 89, ia2: 92 },
      CS3551: { ia1: 88, ia2: 94 },
      CS3511: { ia1: 92, ia2: 96 },
      CCS334: { ia1: 87, ia2: 93 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 8.8, passCount: 6, failCount: 0 },
      { sem: 2, sgpa: 9.0, passCount: 6, failCount: 0 },
      { sem: 3, sgpa: 8.9, passCount: 6, failCount: 0 },
      { sem: 4, sgpa: 9.1, passCount: 6, failCount: 0 },
    ],
    arrears: []
  },
  {
    id: 's09',
    regNo: '710022104009',
    name: 'Kavin Raj',
    email: 'kavin.raj@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'B',
    gender: 'Male',
    attendance: 78,
    cgpa: 6.92,
    marks: {
      CS3591: { ia1: 62, ia2: 58 },
      CS3501: { ia1: 55, ia2: 50 },
      CS3551: { ia1: 64, ia2: 60 },
      CS3511: { ia1: 68, ia2: 66 },
      CCS334: { ia1: 60, ia2: 54 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 7.0, passCount: 6, failCount: 0 },
      { sem: 2, sgpa: 6.8, passCount: 6, failCount: 0 },
      { sem: 3, sgpa: 6.6, passCount: 5, failCount: 1 },
      { sem: 4, sgpa: 7.1, passCount: 6, failCount: 0 },
    ],
    arrears: [
      {
        subjectCode: 'CS3391',
        subjectName: 'Object Oriented Programming',
        semester: 3,
        examSession: 'Nov/Dec 2023',
        status: 'CLEARED',
        clearedInSession: 'Apr/May 2024',
        attempts: 2
      }
    ]
  },
  {
    id: 's10',
    regNo: '710022104010',
    name: 'Lavanya M',
    email: 'lavanya.m@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'B',
    gender: 'Female',
    attendance: 86,
    cgpa: 7.95,
    marks: {
      CS3591: { ia1: 78, ia2: 85 },
      CS3501: { ia1: 74, ia2: 80 },
      CS3551: { ia1: 76, ia2: 82 },
      CS3511: { ia1: 80, ia2: 86 },
      CCS334: { ia1: 73, ia2: 81 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 7.8, passCount: 6, failCount: 0 },
      { sem: 2, sgpa: 8.0, passCount: 6, failCount: 0 },
      { sem: 3, sgpa: 7.9, passCount: 6, failCount: 0 },
      { sem: 4, sgpa: 8.1, passCount: 6, failCount: 0 },
    ],
    arrears: []
  },
  {
    id: 's11',
    regNo: '710022104011',
    name: 'Manoj Kumar P',
    email: 'manoj.kumar@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'A',
    gender: 'Male',
    attendance: 68,
    cgpa: 5.92,
    marks: {
      CS3591: { ia1: 50, ia2: 42 }, // Declining under 50%
      CS3501: { ia1: 45, ia2: 38 }, // Under 50%
      CS3551: { ia1: 52, ia2: 46 },
      CS3511: { ia1: 55, ia2: 48 },
      CCS334: { ia1: 48, ia2: 41 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 6.4, passCount: 5, failCount: 1 },
      { sem: 2, sgpa: 6.0, passCount: 5, failCount: 1 },
      { sem: 3, sgpa: 5.7, passCount: 4, failCount: 2 },
      { sem: 4, sgpa: 5.6, passCount: 4, failCount: 2 },
    ],
    arrears: [
      {
        subjectCode: 'CS3401',
        subjectName: 'Algorithms',
        semester: 4,
        examSession: 'Apr/May 2024',
        status: 'ACTIVE',
        clearedInSession: null,
        attempts: 1
      },
      {
        subjectCode: 'MA3354',
        subjectName: 'Discrete Mathematics',
        semester: 3,
        examSession: 'Nov/Dec 2023',
        status: 'ACTIVE',
        clearedInSession: null,
        attempts: 2
      }
    ]
  },
  {
    id: 's12',
    regNo: '710022104012',
    name: 'Nandhini E',
    email: 'nandhini.e@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'B',
    gender: 'Female',
    attendance: 95,
    cgpa: 9.18,
    marks: {
      CS3591: { ia1: 92, ia2: 96 },
      CS3501: { ia1: 90, ia2: 94 },
      CS3551: { ia1: 89, ia2: 93 },
      CS3511: { ia1: 94, ia2: 97 },
      CCS334: { ia1: 88, ia2: 95 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 9.0, passCount: 6, failCount: 0 },
      { sem: 2, sgpa: 9.2, passCount: 6, failCount: 0 },
      { sem: 3, sgpa: 9.1, passCount: 6, failCount: 0 },
      { sem: 4, sgpa: 9.4, passCount: 6, failCount: 0 },
    ],
    arrears: []
  },
  {
    id: 's13',
    regNo: '710022104013',
    name: 'Praveen V',
    email: 'praveen.v@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'A',
    gender: 'Male',
    attendance: 66,
    cgpa: 5.40,
    marks: {
      CS3591: { ia1: 48, ia2: 42 },
      CS3501: { ia1: 44, ia2: 40 },
      CS3551: { ia1: 50, ia2: 45 },
      CS3511: { ia1: 52, ia2: 48 },
      CCS334: { ia1: 46, ia2: 42 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 6.2, passCount: 5, failCount: 1 },
      { sem: 2, sgpa: 5.8, passCount: 4, failCount: 2 },
      { sem: 3, sgpa: 5.2, passCount: 3, failCount: 3 },
      { sem: 4, sgpa: 5.0, passCount: 3, failCount: 3 },
    ],
    arrears: [
      { subjectCode: 'CS3351', subjectName: 'Digital Principles & Computer Org', semester: 3, examSession: 'Nov/Dec 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CS3391', subjectName: 'Object Oriented Programming', semester: 3, examSession: 'Nov/Dec 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'MA3354', subjectName: 'Discrete Mathematics', semester: 3, examSession: 'Nov/Dec 2023', status: 'ACTIVE', clearedInSession: null, attempts: 3 },
      { subjectCode: 'CS3452', subjectName: 'Theory of Computation', semester: 4, examSession: 'Apr/May 2024', status: 'ACTIVE', clearedInSession: null, attempts: 1 },
      { subjectCode: 'CS3491', subjectName: 'Artificial Intelligence & ML', semester: 4, examSession: 'Apr/May 2024', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CS3401', subjectName: 'Algorithms', semester: 4, examSession: 'Apr/May 2024', status: 'ACTIVE', clearedInSession: null, attempts: 1 },
      { subjectCode: 'MA3151', subjectName: 'Matrices and Calculus', semester: 1, examSession: 'Jan/Feb 2023', status: 'CLEARED', clearedInSession: 'Apr/May 2024', attempts: 3 },
    ]
  },
  {
    id: 's14',
    regNo: '710022104014',
    name: 'Suresh Kumar',
    email: 'suresh.kumar@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'B',
    gender: 'Male',
    attendance: 61,
    cgpa: 4.85,
    marks: {
      CS3591: { ia1: 38, ia2: 35 },
      CS3501: { ia1: 42, ia2: 38 },
      CS3551: { ia1: 40, ia2: 36 },
      CS3511: { ia1: 45, ia2: 42 },
      CCS334: { ia1: 40, ia2: 38 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 5.4, passCount: 3, failCount: 3 },
      { sem: 2, sgpa: 5.0, passCount: 3, failCount: 3 },
      { sem: 3, sgpa: 4.8, passCount: 3, failCount: 3 },
      { sem: 4, sgpa: 4.6, passCount: 3, failCount: 3 },
    ],
    arrears: [
      { subjectCode: 'MA3151', subjectName: 'Matrices and Calculus', semester: 1, examSession: 'Jan/Feb 2023', status: 'ACTIVE', clearedInSession: null, attempts: 3 },
      { subjectCode: 'PH3151', subjectName: 'Engineering Physics', semester: 1, examSession: 'Jan/Feb 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CY3151', subjectName: 'Engineering Chemistry', semester: 1, examSession: 'Jan/Feb 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'GE3151', subjectName: 'Problem Solving and Python', semester: 1, examSession: 'Jan/Feb 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'MA3251', subjectName: 'Statistics and Numerical Methods', semester: 2, examSession: 'Apr/May 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CS3251', subjectName: 'Programming in C', semester: 2, examSession: 'Apr/May 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CS3351', subjectName: 'Digital Principles & Computer Org', semester: 3, examSession: 'Nov/Dec 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CS3352', subjectName: 'Foundations of Data Science', semester: 3, examSession: 'Nov/Dec 2023', status: 'ACTIVE', clearedInSession: null, attempts: 1 },
      { subjectCode: 'CS3391', subjectName: 'Object Oriented Programming', semester: 3, examSession: 'Nov/Dec 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'MA3354', subjectName: 'Discrete Mathematics', semester: 3, examSession: 'Nov/Dec 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CS3401', subjectName: 'Algorithms', semester: 4, examSession: 'Apr/May 2024', status: 'ACTIVE', clearedInSession: null, attempts: 1 },
      { subjectCode: 'CS3452', subjectName: 'Theory of Computation', semester: 4, examSession: 'Apr/May 2024', status: 'ACTIVE', clearedInSession: null, attempts: 1 },
      { subjectCode: 'GE3251', subjectName: 'Engineering Graphics', semester: 2, examSession: 'Apr/May 2023', status: 'CLEARED', clearedInSession: 'Nov/Dec 2023', attempts: 2 },
    ]
  },
  {
    id: 's15',
    regNo: '710022104015',
    name: 'Vigneshwaran M',
    email: 'vigneshwaran.m@college.edu',
    department: 'CSE',
    semester: 'sem5',
    section: 'A',
    gender: 'Male',
    attendance: 55,
    cgpa: 3.90,
    marks: {
      CS3591: { ia1: 32, ia2: 28 },
      CS3501: { ia1: 30, ia2: 26 },
      CS3551: { ia1: 35, ia2: 30 },
      CS3511: { ia1: 38, ia2: 34 },
      CCS334: { ia1: 34, ia2: 30 },
    },
    semesterHistory: [
      { sem: 1, sgpa: 4.5, passCount: 1, failCount: 5 },
      { sem: 2, sgpa: 4.0, passCount: 1, failCount: 5 },
      { sem: 3, sgpa: 3.8, passCount: 0, failCount: 6 },
      { sem: 4, sgpa: 3.6, passCount: 0, failCount: 6 },
    ],
    arrears: [
      { subjectCode: 'HS3151', subjectName: 'Professional English - I', semester: 1, examSession: 'Jan/Feb 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'MA3151', subjectName: 'Matrices and Calculus', semester: 1, examSession: 'Jan/Feb 2023', status: 'ACTIVE', clearedInSession: null, attempts: 4 },
      { subjectCode: 'PH3151', subjectName: 'Engineering Physics', semester: 1, examSession: 'Jan/Feb 2023', status: 'ACTIVE', clearedInSession: null, attempts: 3 },
      { subjectCode: 'CY3151', subjectName: 'Engineering Chemistry', semester: 1, examSession: 'Jan/Feb 2023', status: 'ACTIVE', clearedInSession: null, attempts: 3 },
      { subjectCode: 'GE3151', subjectName: 'Problem Solving and Python', semester: 1, examSession: 'Jan/Feb 2023', status: 'ACTIVE', clearedInSession: null, attempts: 3 },
      { subjectCode: 'HS3251', subjectName: 'Professional English - II', semester: 2, examSession: 'Apr/May 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'MA3251', subjectName: 'Statistics and Numerical Methods', semester: 2, examSession: 'Apr/May 2023', status: 'ACTIVE', clearedInSession: null, attempts: 3 },
      { subjectCode: 'PH3256', subjectName: 'Physics for Information Science', semester: 2, examSession: 'Apr/May 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'BE3251', subjectName: 'Basic Electrical and Electronics', semester: 2, examSession: 'Apr/May 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'GE3251', subjectName: 'Engineering Graphics', semester: 2, examSession: 'Apr/May 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CS3251', subjectName: 'Programming in C', semester: 2, examSession: 'Apr/May 2023', status: 'ACTIVE', clearedInSession: null, attempts: 3 },
      { subjectCode: 'MA3354', subjectName: 'Discrete Mathematics', semester: 3, examSession: 'Nov/Dec 2023', status: 'ACTIVE', clearedInSession: null, attempts: 3 },
      { subjectCode: 'CS3351', subjectName: 'Digital Principles & Computer Org', semester: 3, examSession: 'Nov/Dec 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CS3352', subjectName: 'Foundations of Data Science', semester: 3, examSession: 'Nov/Dec 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CS3301', subjectName: 'Data Structures', semester: 3, examSession: 'Nov/Dec 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CS3391', subjectName: 'Object Oriented Programming', semester: 3, examSession: 'Nov/Dec 2023', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'GE3361', subjectName: 'Professional Development', semester: 3, examSession: 'Nov/Dec 2023', status: 'ACTIVE', clearedInSession: null, attempts: 1 },
      { subjectCode: 'CS3452', subjectName: 'Theory of Computation', semester: 4, examSession: 'Apr/May 2024', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CS3491', subjectName: 'Artificial Intelligence & ML', semester: 4, examSession: 'Apr/May 2024', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CS3492', subjectName: 'Database Management Systems', semester: 4, examSession: 'Apr/May 2024', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'CS3401', subjectName: 'Algorithms', semester: 4, examSession: 'Apr/May 2024', status: 'ACTIVE', clearedInSession: null, attempts: 2 },
      { subjectCode: 'GE3451', subjectName: 'Environmental Sciences', semester: 4, examSession: 'Apr/May 2024', status: 'ACTIVE', clearedInSession: null, attempts: 1 },
      { subjectCode: 'GE3171', subjectName: 'Problem Solving Lab', semester: 1, examSession: 'Jan/Feb 2023', status: 'CLEARED', clearedInSession: 'Apr/May 2024', attempts: 2 },
    ]
  }
];

export const SAMPLE_EXTRACTED_UNIVERSITY_RESULTS = [
  { regNo: '710022104001', name: 'Aarav Sharma', subjectCode: 'CS3591', subjectName: 'Computer Networks', grade: 'O', credits: 4, result: 'PASS' },
  { regNo: '710022104001', name: 'Aarav Sharma', subjectCode: 'CS3501', subjectName: 'Compiler Design', grade: 'A+', credits: 4, result: 'PASS' },
  { regNo: '710022104001', name: 'Aarav Sharma', subjectCode: 'CS3551', subjectName: 'Distributed Systems', grade: 'A+', credits: 3, result: 'PASS' },
  { regNo: '710022104001', name: 'Aarav Sharma', subjectCode: 'CS3511', subjectName: 'Data Mining', grade: 'O', credits: 3, result: 'PASS' },
  { regNo: '710022104001', name: 'Aarav Sharma', subjectCode: 'CCS334', subjectName: 'Big Data Analytics', grade: 'A', credits: 3, result: 'PASS' },

  { regNo: '710022104002', name: 'Bhavya Nair', subjectCode: 'CS3591', subjectName: 'Computer Networks', grade: 'A', credits: 4, result: 'PASS' },
  { regNo: '710022104002', name: 'Bhavya Nair', subjectCode: 'CS3501', subjectName: 'Compiler Design', grade: 'A', credits: 4, result: 'PASS' },
  { regNo: '710022104002', name: 'Bhavya Nair', subjectCode: 'CS3551', subjectName: 'Distributed Systems', grade: 'B+', credits: 3, result: 'PASS' },
  { regNo: '710022104002', name: 'Bhavya Nair', subjectCode: 'CS3511', subjectName: 'Data Mining', grade: 'A', credits: 3, result: 'PASS' },
  { regNo: '710022104002', name: 'Bhavya Nair', subjectCode: 'CCS334', subjectName: 'Big Data Analytics', grade: 'B+', credits: 3, result: 'PASS' },

  { regNo: '710022104003', name: 'Deepak Kumar', subjectCode: 'CS3591', subjectName: 'Computer Networks', grade: 'RA', credits: 4, result: 'FAIL' },
  { regNo: '710022104003', name: 'Deepak Kumar', subjectCode: 'CS3501', subjectName: 'Compiler Design', grade: 'RA', credits: 4, result: 'FAIL' },
  { regNo: '710022104003', name: 'Deepak Kumar', subjectCode: 'CS3551', subjectName: 'Distributed Systems', grade: 'B', credits: 3, result: 'PASS' },
  { regNo: '710022104003', name: 'Deepak Kumar', subjectCode: 'CS3511', subjectName: 'Data Mining', grade: 'B+', credits: 3, result: 'PASS' },
  { regNo: '710022104003', name: 'Deepak Kumar', subjectCode: 'CCS334', subjectName: 'Big Data Analytics', grade: 'B', credits: 3, result: 'PASS' },

  { regNo: '710022104004', name: 'Divya R', subjectCode: 'CS3591', subjectName: 'Computer Networks', grade: 'O', credits: 4, result: 'PASS' },
  { regNo: '710022104004', name: 'Divya R', subjectCode: 'CS3501', subjectName: 'Compiler Design', grade: 'O', credits: 4, result: 'PASS' },
  { regNo: '710022104004', name: 'Divya R', subjectCode: 'CS3551', subjectName: 'Distributed Systems', grade: 'O', credits: 3, result: 'PASS' },
  { regNo: '710022104004', name: 'Divya R', subjectCode: 'CS3511', subjectName: 'Data Mining', grade: 'O', credits: 3, result: 'PASS' },
  { regNo: '710022104004', name: 'Divya R', subjectCode: 'CCS334', subjectName: 'Big Data Analytics', grade: 'O', credits: 3, result: 'PASS' },

  { regNo: '710022104005', name: 'Gokul S', subjectCode: 'CS3591', subjectName: 'Computer Networks', grade: 'RA', credits: 4, result: 'FAIL' },
  { regNo: '710022104005', name: 'Gokul S', subjectCode: 'CS3501', subjectName: 'Compiler Design', grade: 'RA', credits: 4, result: 'FAIL' },
  { regNo: '710022104005', name: 'Gokul S', subjectCode: 'CS3551', subjectName: 'Distributed Systems', grade: 'RA', credits: 3, result: 'FAIL' },
  { regNo: '710022104005', name: 'Gokul S', subjectCode: 'CS3511', subjectName: 'Data Mining', grade: 'B', credits: 3, result: 'PASS' },
  { regNo: '710022104005', name: 'Gokul S', subjectCode: 'CCS334', subjectName: 'Big Data Analytics', grade: 'RA', credits: 3, result: 'FAIL' },

  { regNo: '710022104006', name: 'Harini K', subjectCode: 'CS3591', subjectName: 'Computer Networks', grade: 'A+', credits: 4, result: 'PASS' },
  { regNo: '710022104006', name: 'Harini K', subjectCode: 'CS3501', subjectName: 'Compiler Design', grade: 'A', credits: 4, result: 'PASS' },
  { regNo: '710022104006', name: 'Harini K', subjectCode: 'CS3551', subjectName: 'Distributed Systems', grade: 'A', credits: 3, result: 'PASS' },
  { regNo: '710022104006', name: 'Harini K', subjectCode: 'CS3511', subjectName: 'Data Mining', grade: 'A+', credits: 3, result: 'PASS' },
  { regNo: '710022104006', name: 'Harini K', subjectCode: 'CCS334', subjectName: 'Big Data Analytics', grade: 'A', credits: 3, result: 'PASS' },

  { regNo: '710022104007', name: 'Imran Khan', subjectCode: 'CS3591', subjectName: 'Computer Networks', grade: 'B+', credits: 4, result: 'PASS' },
  { regNo: '710022104007', name: 'Imran Khan', subjectCode: 'CS3501', subjectName: 'Compiler Design', grade: 'B+', credits: 4, result: 'PASS' },
  { regNo: '710022104007', name: 'Imran Khan', subjectCode: 'CS3551', subjectName: 'Distributed Systems', grade: 'A', credits: 3, result: 'PASS' },
  { regNo: '710022104007', name: 'Imran Khan', subjectCode: 'CS3511', subjectName: 'Data Mining', grade: 'A', credits: 3, result: 'PASS' },
  { regNo: '710022104007', name: 'Imran Khan', subjectCode: 'CCS334', subjectName: 'Big Data Analytics', grade: 'B+', credits: 3, result: 'PASS' },

  { regNo: '710022104011', name: 'Manoj Kumar P', subjectCode: 'CS3591', subjectName: 'Computer Networks', grade: 'RA', credits: 4, result: 'FAIL' },
  { regNo: '710022104011', name: 'Manoj Kumar P', subjectCode: 'CS3501', subjectName: 'Compiler Design', grade: 'RA', credits: 4, result: 'FAIL' },
  { regNo: '710022104011', name: 'Manoj Kumar P', subjectCode: 'CS3551', subjectName: 'Distributed Systems', grade: 'B', credits: 3, result: 'PASS' },
  { regNo: '710022104011', name: 'Manoj Kumar P', subjectCode: 'CS3511', subjectName: 'Data Mining', grade: 'B', credits: 3, result: 'PASS' },
  { regNo: '710022104011', name: 'Manoj Kumar P', subjectCode: 'CCS334', subjectName: 'Big Data Analytics', grade: 'RA', credits: 3, result: 'FAIL' },
];

export const AUDIT_LOGS = [
  { id: 1, action: 'IA-1 Marks Upload', user: 'Dr. V. Meenakshi (Faculty)', subject: 'CS3501 Compiler Design', time: '10 mins ago', status: 'Success' },
  { id: 2, action: 'University Result Extraction', user: 'Admin User', subject: 'Nov/Dec 2024 Exam PDF', time: '1 hour ago', status: 'Verified' },
  { id: 3, action: 'Arrear Status Updated', user: 'Prof. A. Senthil', subject: '710022104003 (CS3352 Cleared)', time: '3 hours ago', status: 'Updated' },
  { id: 4, action: 'Report Exported (Excel)', user: 'HOD - Dr. R. Ramanathan', subject: 'Cohort Academic Attention Report', time: 'Yesterday', status: 'Downloaded' },
];
