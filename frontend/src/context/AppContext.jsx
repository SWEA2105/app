import React, { createContext, useContext, useState } from 'react';
import { 
  DEPARTMENTS, 
  SEMESTERS, 
  SUBJECTS_SEM5, 
  INITIAL_STUDENTS,
  SAMPLE_EXTRACTED_UNIVERSITY_RESULTS
} from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [departments] = useState(DEPARTMENTS);
  const [semesters] = useState(SEMESTERS);
  const [subjects] = useState(SUBJECTS_SEM5);
  
  const [selectedDepartment, setSelectedDepartment] = useState('CSE');
  const [selectedSemester, setSelectedSemester] = useState('sem5');
  const [selectedSubject, setSelectedSubject] = useState('CS3591');

  // Reactive state of students with IA marks and arrears
  const [students, setStudents] = useState(INITIAL_STUDENTS);

  // University Results staged and committed
  const [universityResults, setUniversityResults] = useState(SAMPLE_EXTRACTED_UNIVERSITY_RESULTS);

  // Update a single mark for a student inline
  const updateStudentMark = (studentId, subjectCode, iaType, newMark) => {
    const numericMark = Math.min(100, Math.max(0, Number(newMark) || 0));
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          const currentSubjectMarks = student.marks[subjectCode] || { ia1: 0, ia2: 0 };
          return {
            ...student,
            marks: {
              ...student.marks,
              [subjectCode]: {
                ...currentSubjectMarks,
                [iaType]: numericMark,
              },
            },
          };
        }
        return student;
      })
    );
  };

  // Batch update marks (e.g. from Excel/CSV upload)
  const batchUpdateMarks = (subjectCode, uploadedRows) => {
    setStudents((prev) =>
      prev.map((student) => {
        const match = uploadedRows.find(
          (r) => r.regNo === student.regNo || r.name?.toLowerCase() === student.name.toLowerCase()
        );
        if (match) {
          return {
            ...student,
            marks: {
              ...student.marks,
              [subjectCode]: {
                ia1: match.ia1 !== undefined ? Number(match.ia1) : student.marks[subjectCode]?.ia1 || 0,
                ia2: match.ia2 !== undefined ? Number(match.ia2) : student.marks[subjectCode]?.ia2 || 0,
              },
            },
          };
        }
        return student;
      })
    );
  };

  // Mark an arrear as cleared
  const clearArrear = (regNo, subjectCode, clearedSession = 'Nov/Dec 2024') => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.regNo === regNo) {
          const updatedArrears = (student.arrears || []).map((arr) => {
            if (arr.subjectCode === subjectCode) {
              return {
                ...arr,
                status: 'CLEARED',
                clearedInSession: clearedSession,
              };
            }
            return arr;
          });
          return { ...student, arrears: updatedArrears };
        }
        return student;
      })
    );
  };

  // Commit verified university results into the ledger
  const commitUniversityResults = (newResults) => {
    setUniversityResults((prev) => [...prev, ...newResults]);
  };

  // Helper: Get subject details by code
  const getSubjectDetails = (code) => {
    return subjects.find((s) => s.code === code) || { code, name: code, credits: 3 };
  };

  return (
    <AppContext.Provider
      value={{
        departments,
        semesters,
        subjects,
        selectedDepartment,
        setSelectedDepartment,
        selectedSemester,
        setSelectedSemester,
        selectedSubject,
        setSelectedSubject,
        students,
        updateStudentMark,
        batchUpdateMarks,
        clearArrear,
        universityResults,
        commitUniversityResults,
        getSubjectDetails,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
