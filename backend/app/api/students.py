from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query, status
from app.schemas.student_schema import StudentOut, StudentCreate, StudentUpdate, StudentDossierOut
from app.schemas.common import ApiResponse
from app.schemas.auth_schema import UserProfile, UserRole
from app.core.database import db
from app.core.security import get_current_user, verify_department_access, ensure_student_owns_record
from app.services.arrear_service import classify_student_arrears

router = APIRouter(prefix="/students", tags=["Student Records"])

def _enrich_student_out(student: dict, uni_results: list[dict]) -> StudentOut:
    cl = classify_student_arrears(student, uni_results)
    st_dict = dict(student)
    st_dict["currentArrearCount"] = cl["totalUnclearedCount"]
    st_dict["arrearCategory"] = cl["category"]
    st_dict["arrearCategoryBadge"] = cl["categoryBadge"]
    return StudentOut(**st_dict)

@router.get("", response_model=ApiResponse[list[StudentOut]])
async def list_students(
    department: Optional[str] = Query(default="CSE", description="Department code (e.g. CSE, ECE)"),
    semester: Optional[str] = Query(default=None, description="Semester code (e.g. sem5)"),
    search: Optional[str] = Query(default=None, description="Search term for name or register number"),
    category: Optional[str] = Query(default=None, description="Filter by arrear category ('5_plus', '10_plus', '20_plus')"),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    List student records with verified current arrear classifications.
    Enforces Row-Level Security: Faculty members can only query students in their authorized department.
    Student sessions are scoped to their own record only.
    """
    uni_results = db.get_all_university_results()

    # Student sessions are restricted to their own dossier
    if current_user.role == UserRole.STUDENT:
        own_record = db.get_student_by_id(current_user.id)
        students = [own_record] if own_record else []
        enriched = [_enrich_student_out(s, uni_results) for s in students]
        return ApiResponse(
            success=True,
            message=f"Retrieved {len(students)} student record",
            data=enriched,
            meta={"total": len(students), "scope": "own-record", "authorized_user": current_user.name}
        )

    # Enforce department access
    verify_department_access(department, current_user)

    students = db.get_all_students(department=department, semester=semester)

    if search:
        search_lower = search.lower()
        students = [
            s for s in students
            if search_lower in s["name"].lower() or search_lower in s["regNo"] or search_lower in s["email"].lower()
        ]

    enriched = [_enrich_student_out(s, uni_results) for s in students]

    if category and category.lower() != "all":
        cat_lower = category.lower()
        if cat_lower in ("5_plus", "10_plus", "20_plus"):
            enriched = [s for s in enriched if s.arrearCategory == cat_lower]
        elif cat_lower == "under_5":
            enriched = [s for s in enriched if s.arrearCategory is None]

    return ApiResponse(
        success=True,
        message=f"Retrieved {len(enriched)} student records",
        data=enriched,
        meta={"total": len(enriched), "department": department, "authorized_user": current_user.name}
    )

@router.get("/{student_id}", response_model=ApiResponse[StudentOut])
async def get_student(student_id: str, current_user: UserProfile = Depends(get_current_user)):
    """
    Retrieve single student record by ID.
    """
    student = db.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with ID '{student_id}' not found")
    
    ensure_student_owns_record(current_user, student)
    verify_department_access(student["department"], current_user)
    uni_results = db.get_all_university_results()
    enriched = _enrich_student_out(student, uni_results)
    return ApiResponse(success=True, message="Student retrieved successfully", data=enriched)

@router.get("/{student_id}/dossier", response_model=ApiResponse[StudentDossierOut])
async def get_student_dossier(student_id: str, current_user: UserProfile = Depends(get_current_user)):
    """
    Retrieve comprehensive student dossier including SGPA history, verified arrear categories, and risk factors.
    """
    student = db.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with ID '{student_id}' not found")

    ensure_student_owns_record(current_user, student)
    verify_department_access(student["department"], current_user)

    uni_results = db.get_all_university_results()
    cl = classify_student_arrears(student, uni_results)
    enriched_student = _enrich_student_out(student, uni_results)

    # Calculate average IA score
    marks = student.get("marks", {})
    ia_averages = [(m.get("ia1", 0) + m.get("ia2", 0)) / 2 for m in marks.values()]
    current_avg = sum(ia_averages) / len(ia_averages) if ia_averages else 0.0

    risk_factors = []
    if student.get("attendance", 100) < 75:
        risk_factors.append(f"Low Attendance ({student.get('attendance')}%)")
    if student.get("cgpa", 10) < 6.5:
        risk_factors.append(f"Low CGPA ({student.get('cgpa')})")
    if cl["totalUnclearedCount"] > 0:
        risk_factors.append(f"{cl['totalUnclearedCount']} Active University Arrear(s) ({cl['categoryBadge'] or 'Under 5'})")
    if current_avg < 50:
        risk_factors.append(f"Current Semester IA Average < 50% ({round(current_avg, 1)}%)")

    dossier = StudentDossierOut(
        student=enriched_student,
        totalArrears=cl["totalHistoricalBacklogs"],
        activeArrears=cl["totalUnclearedCount"],
        clearedArrears=cl["clearedCount"],
        currentSemesterAverage=round(current_avg, 1),
        isAtRisk=bool(risk_factors),
        riskFactors=risk_factors,
        arrearCategory=cl["category"],
        arrearCategoryBadge=cl["categoryBadge"],
        arrearCategoryColor=cl["categoryColor"]
    )

    return ApiResponse(success=True, message="Student dossier generated successfully", data=dossier)


@router.post("", response_model=ApiResponse[StudentOut], status_code=status.HTTP_201_CREATED)
async def create_student(student_in: StudentCreate, current_user: UserProfile = Depends(get_current_user)):
    """
    Create a new student enrollment record.
    """
    if current_user.role == UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Student sessions cannot create enrollment records."
        )

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

    if current_user.role == UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Student sessions cannot modify academic records."
        )

    verify_department_access(student["department"], current_user)
    updated = db.update_student(student_id, student_update.model_dump(exclude_unset=True))
    return ApiResponse(success=True, message="Student updated successfully", data=StudentOut(**updated))
