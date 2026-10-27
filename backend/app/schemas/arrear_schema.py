from typing import Optional, Any
from pydantic import BaseModel, Field

class ArrearRecordOut(BaseModel):
    id: str
    studentId: str
    studentName: str
    regNo: str
    department: str
    currentSem: str
    subjectCode: str
    subjectName: str
    semester: int
    examSession: str
    status: str # 'ACTIVE' | 'CLEARED'
    clearedInSession: Optional[str] = None
    attempts: int = 1

class ClearArrearRequest(BaseModel):
    regNo: str
    subjectCode: str
    clearedSession: str = "Nov/Dec 2024"

class ArrearSummaryKPI(BaseModel):
    totalCount: int
    activeCount: int
    clearedCount: int
    clearanceRate: float
    criticalBacklogsCount: int # Attempts >= 2
    # Categorization KPIs
    fivePlusCount: int = 0
    tenPlusCount: int = 0
    twentyPlusCount: int = 0
    allClearCount: int = 0

class PendingSubjectOut(BaseModel):
    subjectCode: str
    subjectName: str
    semester: int
    status: str
    attempts: int = 1
    examSession: Optional[str] = None
    needsVerification: bool = False

class ClearedSubjectOut(BaseModel):
    subjectCode: str
    subjectName: str
    semester: int
    status: str = "CLEARED"
    attempts: int = 1
    clearedInSession: Optional[str] = None

class StudentArrearClassifiedOut(BaseModel):
    studentId: Optional[str] = None
    regNo: str
    studentName: str
    department: str
    currentSemester: str
    section: Optional[str] = "A"
    cgpa: float = 0.0
    attendance: float = 85.0
    totalUnclearedCount: int
    clearedCount: int
    totalHistoricalBacklogs: int
    category: Optional[str] = None # '5_plus', '10_plus', '20_plus', or None
    categoryLabel: Optional[str] = None
    categoryBadge: Optional[str] = None
    categoryColor: Optional[str] = None
    pendingSubjects: list[PendingSubjectOut] = []
    clearedSubjects: list[ClearedSubjectOut] = []
    hasIncompleteData: bool = False
    statusMessage: str = "Verified"

class ArrearDistributionItem(BaseModel):
    category: str
    range: str
    count: int
    percentage: float
    color: str

class ArrearCohortSummaryOut(BaseModel):
    totalStudents: int
    allClearCount: int
    totalWithArrears: int
    fivePlusCount: int
    tenPlusCount: int
    twentyPlusCount: int
    underFiveCount: int
    distribution: list[ArrearDistributionItem]
    students: list[StudentArrearClassifiedOut]
