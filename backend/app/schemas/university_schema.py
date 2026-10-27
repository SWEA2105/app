from typing import Optional, Literal
from pydantic import BaseModel, Field

class UniversityResultBase(BaseModel):
    regNo: str
    name: str
    subjectCode: str
    subjectName: str
    grade: str # 'O', 'A+', 'A', 'B+', 'B', 'RA', 'SA', 'W'
    credits: int = 3
    result: Literal["PASS", "FAIL", "ABSENT", "CLEARED"] = "PASS"

class UniversityResultCreate(UniversityResultBase):
    semester: int = 5
    examSession: str = "Nov/Dec 2024"

class UniversityResultOut(UniversityResultBase):
    id: str
    semester: int
    examSession: str

class SubjectPassAnalytics(BaseModel):
    subjectCode: str
    subjectName: str
    totalAppeared: int
    passed: int
    failed: int
    passPercentage: float

class CategoryStudentSummary(BaseModel):
    regNo: str
    name: str
    department: str = "CSE"
    currentSemester: str = "sem5"
    arrearCount: int
    category: Optional[str] = None
    categoryBadge: Optional[str] = None
    categoryColor: Optional[str] = None
    pendingSubjects: list[str] = []

class UniversityAnalyticsOut(BaseModel):
    totalEvaluatedEntries: int
    distinctStudents: int
    allClearStudents: int
    studentsWithArrears: int
    overallPassRate: float
    totalFailures: int
    subjectAnalytics: list[SubjectPassAnalytics]
    fivePlusCount: int = 0
    tenPlusCount: int = 0
    twentyPlusCount: int = 0
    categoryStudents: list[CategoryStudentSummary] = []

class PDFExtractionResponse(BaseModel):
    filename: str
    extractedCount: int
    status: str = "staged_for_faculty_verification"
    previewRecords: list[UniversityResultBase]

class CommitResultsRequest(BaseModel):
    records: list[UniversityResultCreate]
