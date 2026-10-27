from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query, status
from app.schemas.arrear_schema import (
    ArrearRecordOut, 
    ClearArrearRequest, 
    ArrearSummaryKPI,
    ArrearCohortSummaryOut,
    StudentArrearClassifiedOut
)
from app.schemas.common import ApiResponse
from app.schemas.auth_schema import UserProfile
from app.core.database import db
from app.core.security import get_current_user, verify_department_access
from app.services.arrear_service import (
    get_cohort_arrear_classification,
    classify_student_arrears
)

router = APIRouter(prefix="/arrears", tags=["Arrear Ledger & History"])

@router.get("", response_model=ApiResponse[list[ArrearRecordOut]])
async def list_arrears(
    department: str = Query(default="CSE"),
    status: Optional[str] = Query(default=None, description="'ACTIVE' or 'CLEARED'"),
    search: Optional[str] = Query(default=None),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    List historical and active student arrears across all semesters.
    """
    verify_department_access(department, current_user)
    students = db.get_all_students(department=department)

    records: list[ArrearRecordOut] = []
    idx = 1
    for s in students:
        for arr in s.get("arrears", []):
            if status and arr["status"].upper() != status.upper():
                continue
            
            # Search filter
            if search:
                s_lower = search.lower()
                matches = (
                    s_lower in s["name"].lower() or 
                    s_lower in s["regNo"] or 
                    s_lower in arr["subjectCode"].lower() or 
                    s_lower in arr["subjectName"].lower()
                )
                if not matches:
                    continue

            records.append(
                ArrearRecordOut(
                    id=f"arr_{idx}",
                    studentId=s["id"],
                    studentName=s["name"],
                    regNo=s["regNo"],
                    department=s["department"],
                    currentSem=s["semester"],
                    subjectCode=arr["subjectCode"],
                    subjectName=arr["subjectName"],
                    semester=arr["semester"],
                    examSession=arr["examSession"],
                    status=arr["status"],
                    clearedInSession=arr.get("clearedInSession"),
                    attempts=arr.get("attempts", 1)
                )
            )
            idx += 1

    return ApiResponse(
        success=True,
        message=f"Retrieved {len(records)} arrear records",
        data=records
    )

@router.get("/kpis", response_model=ApiResponse[ArrearSummaryKPI])
async def get_arrear_kpis(
    department: str = Query(default="CSE"),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Get aggregated arrear metrics for the cohort, including category distributions.
    """
    verify_department_access(department, current_user)
    students = db.get_all_students(department=department)
    uni_results = db.get_all_university_results()

    all_arrears = [arr for s in students for arr in s.get("arrears", [])]
    total = len(all_arrears)
    active = len([a for a in all_arrears if a["status"] == "ACTIVE"])
    cleared = len([a for a in all_arrears if a["status"] == "CLEARED"])
    critical = len([a for a in all_arrears if a["status"] == "ACTIVE" and a.get("attempts", 1) >= 2])
    clearance_rate = round((cleared / total) * 100.0, 1) if total else 0.0

    cohort_classification = get_cohort_arrear_classification(students, uni_results)
    summary = cohort_classification["summary"]

    kpis = ArrearSummaryKPI(
        totalCount=total,
        activeCount=active,
        clearedCount=cleared,
        clearanceRate=clearance_rate,
        criticalBacklogsCount=critical,
        fivePlusCount=summary["fivePlusCount"],
        tenPlusCount=summary["tenPlusCount"],
        twentyPlusCount=summary["twentyPlusCount"],
        allClearCount=summary["allClearCount"]
    )

    return ApiResponse(success=True, message="Arrear KPIs generated", data=kpis)

@router.get("/classified-students", response_model=ApiResponse[ArrearCohortSummaryOut])
async def list_classified_students(
    department: str = Query(default="CSE"),
    semester: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None, description="'5_plus', '10_plus', '20_plus', or 'all'"),
    search: Optional[str] = Query(default=None),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Get all students classified by their verified current uncleared arrear count.
    Supports filtering by mutually exclusive category ('5_plus', '10_plus', '20_plus'),
    department, semester, and search query.
    """
    verify_department_access(department, current_user)
    students = db.get_all_students(department=department, semester=semester)
    uni_results = db.get_all_university_results()

    cohort = get_cohort_arrear_classification(students, uni_results)
    filtered_students = cohort["students"]

    # Filter by category if requested
    if category and category.lower() != "all":
        cat_lower = category.lower()
        if cat_lower in ("5_plus", "10_plus", "20_plus"):
            filtered_students = [s for s in filtered_students if s["category"] == cat_lower]
        elif cat_lower == "under_5":
            filtered_students = [s for s in filtered_students if s["category"] is None]

    # Filter by search
    if search:
        search_lower = search.lower()
        filtered_students = [
            s for s in filtered_students
            if (
                search_lower in s["studentName"].lower() or
                search_lower in s["regNo"] or
                any(search_lower in p["subjectCode"].lower() or search_lower in p["subjectName"].lower() for p in s["pendingSubjects"])
            )
        ]

    result = ArrearCohortSummaryOut(
        totalStudents=cohort["summary"]["totalStudents"],
        allClearCount=cohort["summary"]["allClearCount"],
        totalWithArrears=cohort["summary"]["totalWithArrears"],
        fivePlusCount=cohort["summary"]["fivePlusCount"],
        tenPlusCount=cohort["summary"]["tenPlusCount"],
        twentyPlusCount=cohort["summary"]["twentyPlusCount"],
        underFiveCount=cohort["summary"]["underFiveCount"],
        distribution=cohort["distribution"],
        students=[StudentArrearClassifiedOut(**s) for s in filtered_students]
    )

    return ApiResponse(
        success=True,
        message=f"Retrieved {len(filtered_students)} classified students",
        data=result
    )

@router.post("/clear", response_model=ApiResponse[dict])
async def mark_arrear_cleared(
    payload: ClearArrearRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Mark an active arrear as cleared after verification of supplementary exam results.
    """
    success = db.clear_arrear(
        reg_no=payload.regNo,
        subject_code=payload.subjectCode,
        cleared_session=payload.clearedSession
    )

    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"Active arrear record for student '{payload.regNo}' in subject '{payload.subjectCode}' not found."
        )

    return ApiResponse(
        success=True,
        message=f"Arrear for {payload.regNo} in {payload.subjectCode} marked as CLEARED in {payload.clearedSession}.",
        data={"regNo": payload.regNo, "subjectCode": payload.subjectCode, "status": "CLEARED"}
    )
