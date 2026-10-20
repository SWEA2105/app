from typing import Optional
from pydantic import BaseModel

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
