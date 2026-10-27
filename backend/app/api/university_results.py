from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query, status
from app.schemas.university_schema import (
    UniversityResultOut, 
    UniversityAnalyticsOut, 
    SubjectPassAnalytics, 
    PDFExtractionResponse,
    CommitResultsRequest,
    CategoryStudentSummary
)
from app.schemas.common import ApiResponse
from app.schemas.auth_schema import UserProfile, UserRole
from app.core.database import db
from app.core.security import get_current_user, require_admin
from app.services.pdf_extractor import pdf_extractor

router = APIRouter(prefix="/university-results", tags=["Module B: University Result Analyzer"])

@router.get("", response_model=ApiResponse[list[UniversityResultOut]])
async def list_university_results(
    semester: Optional[int] = Query(default=None, description="Semester number e.g. 5"),
    subject_code: Optional[str] = Query(default=None, description="Filter by subject code"),
    status: Optional[str] = Query(default=None, description="Filter by PASS or FAIL"),
    reg_no: Optional[str] = Query(default=None, description="Filter by register number"),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    List verified university examination results.
    """
    results = db.get_all_university_results(semester=semester)

    if current_user.role == UserRole.STUDENT:
        # Student sessions may only ever read their own result statements
        own_record = db.get_student_by_id(current_user.id)
        own_reg_no = own_record.get("regNo") if own_record else None
        results = [r for r in results if r["regNo"] == own_reg_no]
    elif reg_no:
        results = [r for r in results if r["regNo"].upper() == reg_no.upper()]

    if subject_code:
        results = [r for r in results if r["subjectCode"].upper() == subject_code.upper()]
    if status:
        results = [r for r in results if r["result"].upper() == status.upper()]

    return ApiResponse(
        success=True,
        message=f"Retrieved {len(results)} university result records",
        data=[UniversityResultOut(**r) for r in results]
    )

@router.get("/analytics", response_model=ApiResponse[UniversityAnalyticsOut])
async def get_university_analytics(
    semester: Optional[int] = Query(default=5),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Compute university pass percentage, failure counts, subject-wise pass distribution,
    and student arrear category classification.
    """
    results = db.get_all_university_results(semester=semester)
    all_results = db.get_all_university_results()
    students = db.get_all_students()
    
    from app.services.arrear_service import get_cohort_arrear_classification
    cohort = get_cohort_arrear_classification(students, all_results)

    category_students = [
        CategoryStudentSummary(
            regNo=s["regNo"],
            name=s["studentName"],
            department=s.get("department", "CSE"),
            currentSemester=s.get("currentSemester", "sem5"),
            arrearCount=s["totalUnclearedCount"],
            category=s["category"],
            categoryBadge=s["categoryBadge"],
            categoryColor=s["categoryColor"],
            pendingSubjects=[f"{p['subjectCode']} - {p['subjectName']}" for p in s["pendingSubjects"]]
        )
        for s in cohort["students"]
        if s["totalUnclearedCount"] > 0
    ]

    if not results:
        return ApiResponse(
            success=True,
            message="No results available for specified semester",
            data=UniversityAnalyticsOut(
                totalEvaluatedEntries=0,
                distinctStudents=0,
                allClearStudents=0,
                studentsWithArrears=0,
                overallPassRate=0.0,
                totalFailures=0,
                subjectAnalytics=[],
                fivePlusCount=cohort["summary"]["fivePlusCount"],
                tenPlusCount=cohort["summary"]["tenPlusCount"],
                twentyPlusCount=cohort["summary"]["twentyPlusCount"],
                categoryStudents=category_students
            )
        )

    distinct_regnos = set(r["regNo"] for r in results)
    failed_regnos = set(r["regNo"] for r in results if r["result"] == "FAIL" or r["grade"] == "RA")
    all_clear_count = len(distinct_regnos) - len(failed_regnos)
    overall_pass_rate = round((all_clear_count / len(distinct_regnos)) * 100.0, 1) if distinct_regnos else 0.0
    total_failures = len([r for r in results if r["result"] == "FAIL" or r["grade"] == "RA"])

    # Subject-wise pass calculations
    subjects_map = {}
    for r in results:
        code = r["subjectCode"]
        if code not in subjects_map:
            subjects_map[code] = {
                "subjectCode": code,
                "subjectName": r.get("subjectName", code),
                "total": 0,
                "passed": 0,
                "failed": 0
            }
        subjects_map[code]["total"] += 1
        if r["result"] == "PASS" and r["grade"] != "RA":
            subjects_map[code]["passed"] += 1
        else:
            subjects_map[code]["failed"] += 1

    subject_analytics = [
        SubjectPassAnalytics(
            subjectCode=s["subjectCode"],
            subjectName=s["subjectName"],
            totalAppeared=s["total"],
            passed=s["passed"],
            failed=s["failed"],
            passPercentage=round((s["passed"] / s["total"]) * 100.0, 1) if s["total"] else 0.0
        )
        for s in subjects_map.values()
    ]

    analytics = UniversityAnalyticsOut(
        totalEvaluatedEntries=len(results),
        distinctStudents=len(distinct_regnos),
        allClearStudents=all_clear_count,
        studentsWithArrears=len(failed_regnos),
        overallPassRate=overall_pass_rate,
        totalFailures=total_failures,
        subjectAnalytics=subject_analytics,
        fivePlusCount=cohort["summary"]["fivePlusCount"],
        tenPlusCount=cohort["summary"]["tenPlusCount"],
        twentyPlusCount=cohort["summary"]["twentyPlusCount"],
        categoryStudents=category_students
    )

    return ApiResponse(success=True, message="University examination analytics generated", data=analytics)


@router.post("/extract-pdf", response_model=ApiResponse[PDFExtractionResponse])
async def extract_university_pdf(
    file: UploadFile = File(..., description="University Result PDF file"),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Upload official university examination PDF.
    Extracts register numbers, subject codes, grades, and marks using PyMuPDF and pdfplumber.
    Returns preview data for faculty verification before committing to database.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for examination mark sheet extraction.")

    extracted = pdf_extractor.extract_from_pdf_stream(file.file, filename=file.filename)

    return ApiResponse(
        success=True,
        message=f"Successfully extracted {len(extracted)} candidate subject records from '{file.filename}' via PyMuPDF + pdfplumber.",
        data=PDFExtractionResponse(
            filename=file.filename,
            extractedCount=len(extracted),
            previewRecords=extracted
        )
    )

@router.post("/commit", response_model=ApiResponse[dict])
async def commit_verified_results(
    payload: CommitResultsRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Faculty verification confirmation endpoint.
    Commits the verified results into the permanent database and updates the student arrear ledger.
    """
    if not payload.records:
        raise HTTPException(status_code=400, detail="No records provided to commit.")

    added_count = db.add_university_results([r.model_dump() for r in payload.records])

    return ApiResponse(
        success=True,
        message=f"Faculty verification complete: Successfully committed {added_count} examination records to the institutional database.",
        data={"committedCount": added_count}
    )
