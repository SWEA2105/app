from typing import Optional, Literal
from pydantic import BaseModel, Field

class IAMarkUpdate(BaseModel):
    studentId: str
    subjectCode: str
    iaType: Literal["ia1", "ia2"]
    mark: float = Field(ge=0.0, le=100.0)

class StudentIARow(BaseModel):
    id: str
    regNo: str
    name: str
    department: str
    attendance: float
    ia1: float
    ia2: float
    avg: float
    delta: float
    trajectory: Literal["improving", "declining", "steady"]
    rank: int
    needsAttention: bool
    flagReason: Optional[str] = None

class SubjectAnalyticsOut(BaseModel):
    subjectCode: str
    subjectName: str
    totalStudents: int
    subjectAverage: float
    highestMark: float
    lowestMark: float
    passRate: float
    improvingCount: int
    decliningCount: int
    atRiskCount: int
    students: list[StudentIARow]

class UploadedMarkItem(BaseModel):
    regNo: str
    ia1: Optional[float] = None
    ia2: Optional[float] = None

class BatchMarksUploadRequest(BaseModel):
    subjectCode: str
    marks: list[UploadedMarkItem]
