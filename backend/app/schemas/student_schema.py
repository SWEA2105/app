from typing import Optional, Any
from pydantic import BaseModel, Field

class SemesterHistoryItem(BaseModel):
    sem: int
    sgpa: float = Field(ge=0.0, le=10.0)
    passCount: int = Field(ge=0)
    failCount: int = Field(ge=0)

class ArrearItem(BaseModel):
    subjectCode: str
    subjectName: str
    semester: int
    examSession: str
    status: str # 'ACTIVE' | 'CLEARED'
    clearedInSession: Optional[str] = None
    attempts: int = 1

class SubjectMarkDetail(BaseModel):
    ia1: float = Field(default=0.0, ge=0.0, le=100.0)
    ia2: float = Field(default=0.0, ge=0.0, le=100.0)

class StudentBase(BaseModel):
    regNo: str
    name: str
    email: str
    department: str
    semester: str
    section: str = "A"
    gender: str = "Unspecified"
    attendance: float = Field(default=85.0, ge=0.0, le=100.0)
    cgpa: float = Field(default=7.5, ge=0.0, le=10.0)

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    attendance: Optional[float] = None
    cgpa: Optional[float] = None
    section: Optional[str] = None

class StudentOut(StudentBase):
    id: str
    marks: dict[str, SubjectMarkDetail] = {}
    arrears: list[ArrearItem] = []
    semesterHistory: list[SemesterHistoryItem] = []
    currentArrearCount: Optional[int] = 0
    arrearCategory: Optional[str] = None
    arrearCategoryBadge: Optional[str] = None

class StudentDossierOut(BaseModel):
    student: StudentOut
    totalArrears: int
    activeArrears: int
    clearedArrears: int
    currentSemesterAverage: float
    isAtRisk: bool
    riskFactors: list[str] = []
    arrearCategory: Optional[str] = None
    arrearCategoryBadge: Optional[str] = None
    arrearCategoryColor: Optional[str] = None

