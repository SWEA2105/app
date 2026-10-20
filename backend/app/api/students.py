from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query, status
from app.schemas.student_schema import StudentOut, StudentCreate, StudentUpdate, StudentDossierOut
from app.schemas.common import ApiResponse
from app.schemas.auth_schema import UserProfile
from app.core.database import db
from app.core.security import get_current_user, verify_department_access

router = APIRouter(prefix="/students", tags=["Student Records"])

@router.get("", response_model=ApiResponse[list[StudentOut]])
async def list_students(
    department: Optional[str] = Query(default="CSE", description="Department code (e.g. CSE, ECE)"),
    semester: Optional[str] = Query(default=None, description="Semester code (e.g. sem5)"),
    search: Optional[str] = Query(default=None, description="Search term for name or register number"),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    List student records.
    Enforces Row-Level Security: Faculty members can only query students in their authorized department.
    """
    # Enforce department access
    verify_department_access(department, current_user)

    students = db.get_all_students(department=department, semester=semester)

    if search:
        search_lower = search.lower()
        students = [
            s for s in students
            if search_lower in s["name"].lower() or search_lower in s["regNo"] or search_lower in s["email"].lower()
        ]

    return ApiResponse(
        success=True,
        message=f"Retrieved {len(students)} student records",
        data=[StudentOut(**s) for s in students],
        meta={"total": len(students), "department": department, "authorized_user": current_user.name}
    )

@router.get("/{student_id}", response_model=ApiResponse[StudentOut])
async def get_student(student_id: str, current_user: UserProfile = Depends(get_current_user)):
    """
    Retrieve single student record by ID.
    """
    student = db.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with ID '{student_id}' not found")
    
    verify_department_access(student["department"], current_user)
    return ApiResponse(success=True, message="Student retrieved successfully", data=StudentOut(**student))

@router.get("/{student_id}/dossier", response_model=ApiResponse[StudentDossierOut])
async def get_student_dossier(student_id: str, current_user: UserProfile = Depends(get_current_user)):
    """
    Retrieve comprehensive student dossier including SGPA history, active and cleared arrears, and risk factors.
    """
    student = db.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with ID '{student_id}' not found")

    verify_department_access(student["department"], current_user)

    arrears = student.get("arrears", [])
    active_arrears = [a for a in arrears if a["status"] == "ACTIVE"]
    cleared_arrears = [a for a in arrears if a["status"] == "CLEARED"]

    # Calculate average IA score
    marks = student.get("marks", {})
    ia_averages = [(m.get("ia1", 0) + m.get("ia2", 0)) / 2 for m in marks.values()]
    current_avg = sum(ia_averages) / len(ia_averages) if ia_averages else 0.0

    risk_factors = []
    if student.get("attendance", 100) < 75:
        risk_factors.append(f"Low Attendance ({student.get('attendance')}%)")
    if student.get("cgpa", 10) < 6.5:
        risk_factors.append(f"Low CGPA ({student.get('cgpa')})")
    if active_arrears:
        risk_factors.append(f"{len(active_arrears)} Active University Arrear(s)")
    if current_avg < 50:
        risk_factors.append(f"Current Semester IA Average < 50% ({round(current_avg, 1)}%)")

    dossier = StudentDossierOut(
        student=StudentOut(**student),
        totalArrears=len(arrears),
        activeArrears=len(active_arrears),
        clearedArrears=len(cleared_arrears),
        currentSemesterAverage=round(current_avg, 1),
        isAtRisk=bool(risk_factors),
        riskFactors=risk_factors
    )

    return ApiResponse(success=True, message="Student dossier generated successfully", data=dossier)

@router.post("", response_model=ApiResponse[StudentOut], status_code=status.HTTP_201_CREATED)
async def create_student(student_in: StudentCreate, current_user: UserProfile = Depends(get_current_user)):
    """
    Create a new student enrollment record.
    """
    verify_department_access(student_in.department, current_user)

    existing = db.get_student_by_reg_no(student_in.regNo)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Student with Register Number '{student_in.regNo}' already exists."
        )

    new_student = db.add_student(student_in.model_dump())
    return ApiResponse(success=True, message="Student enrolled successfully", data=StudentOut(**new_student))

@router.put("/{student_id}", response_model=ApiResponse[StudentOut])
async def update_student(
    student_id: str,
    student_update: StudentUpdate,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Update student attributes.
    """
    student = db.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    verify_department_access(student["department"], current_user)
    updated = db.update_student(student_id, student_update.model_dump(exclude_unset=True))
    return ApiResponse(success=True, message="Student updated successfully", data=StudentOut(**updated))
