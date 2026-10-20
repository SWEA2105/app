import io
from typing import Optional
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query, status
from app.schemas.ia_schema import (
    IAMarkUpdate, 
    SubjectAnalyticsOut, 
    BatchMarksUploadRequest
)
from app.schemas.common import ApiResponse
from app.schemas.auth_schema import UserProfile
from app.core.database import db, SUBJECTS_CATALOG
from app.core.security import get_current_user, verify_department_access
from app.services.ia_service import ia_service

router = APIRouter(prefix="/ia-marks", tags=["Module A: Internal Assessment Analyzer"])

@router.get("/analytics/{subject_code}", response_model=ApiResponse[SubjectAnalyticsOut])
async def get_ia_subject_analytics(
    subject_code: str,
    department: str = Query(default="CSE", description="Department code"),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Get comprehensive statistical analysis, student rankings, delta trajectory, 
    and academic attention flags for a given subject via Pandas.
    """
    verify_department_access(department, current_user)
    analytics = ia_service.get_subject_analytics(subject_code=subject_code, department=department)
    return ApiResponse(
        success=True,
        message=f"Analytics computed successfully for {subject_code}",
        data=analytics
    )

@router.post("/update", response_model=ApiResponse[dict])
async def update_single_mark(
    update_data: IAMarkUpdate,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Inline marks editor endpoint. Updates a single IA-1 or IA-2 mark for a student.
    """
    student = db.get_student_by_id(update_data.studentId)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student ID '{update_data.studentId}' not found")

    verify_department_access(student["department"], current_user)

    updated_student = db.update_ia_mark(
        student_id=update_data.studentId,
        subject_code=update_data.subjectCode,
        ia_type=update_data.iaType,
        mark=update_data.mark
    )

    current_marks = updated_student["marks"][update_data.subjectCode]
    avg = (current_marks["ia1"] + current_marks["ia2"]) / 2.0

    return ApiResponse(
        success=True,
        message=f"Successfully updated {update_data.iaType.upper()} mark for {student['name']} to {update_data.mark}",
        data={
            "studentId": update_data.studentId,
            "subjectCode": update_data.subjectCode,
            "ia1": current_marks["ia1"],
            "ia2": current_marks["ia2"],
            "average": round(avg, 1)
        }
    )

@router.post("/upload-batch", response_model=ApiResponse[dict])
async def upload_marks_batch(
    payload: BatchMarksUploadRequest,
    department: str = Query(default="CSE"),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Batch update marks for multiple students in a subject.
    """
    verify_department_access(department, current_user)
    updated_count = 0

    for item in payload.marks:
        student = db.get_student_by_reg_no(item.regNo)
        if student:
            if item.ia1 is not None:
                db.update_ia_mark(student["id"], payload.subjectCode, "ia1", item.ia1)
            if item.ia2 is not None:
                db.update_ia_mark(student["id"], payload.subjectCode, "ia2", item.ia2)
            updated_count += 1

    return ApiResponse(
        success=True,
        message=f"Batch processed successfully: {updated_count} students updated for {payload.subjectCode}",
        data={"updatedStudents": updated_count, "subjectCode": payload.subjectCode}
    )

@router.post("/upload-file", response_model=ApiResponse[dict])
async def upload_marks_file(
    subject_code: str = Query(..., description="Subject code e.g. CS3591"),
    department: str = Query(default="CSE"),
    file: UploadFile = File(..., description="Excel (.xlsx) or CSV (.csv) mark sheet"),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Upload and parse Excel (.xlsx) or CSV mark sheets using Pandas.
    Extracts register numbers, IA-1 marks, and IA-2 marks automatically.
    """
    verify_department_access(department, current_user)

    filename = file.filename.lower()
    content = await file.read()

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload a valid .csv or .xlsx file."
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse uploaded spreadsheet: {str(e)}")

    # Standardize column headers
    df.columns = [str(c).strip().lower().replace(" ", "").replace("-", "").replace("_", "") for c in df.columns]

    reg_col = next((c for c in df.columns if "reg" in c or "roll" in c), None)
    ia1_col = next((c for c in df.columns if "ia1" in c or "internal1" in c or "test1" in c), None)
    ia2_col = next((c for c in df.columns if "ia2" in c or "internal2" in c or "test2" in c), None)

    if not reg_col:
        raise HTTPException(
            status_code=400,
            detail="Spreadsheet must contain a 'Register Number' or 'RegNo' column header."
        )

    updated_count = 0
    for _, row in df.iterrows():
        reg_val = str(row[reg_col]).strip().split(".")[0]
        student = db.get_student_by_reg_no(reg_val)
        if student:
            if ia1_col and pd.notna(row[ia1_col]):
                try:
                    mark1 = min(100.0, max(0.0, float(row[ia1_col])))
                    db.update_ia_mark(student["id"], subject_code, "ia1", mark1)
                except ValueError:
                    pass
            if ia2_col and pd.notna(row[ia2_col]):
                try:
                    mark2 = min(100.0, max(0.0, float(row[ia2_col])))
                    db.update_ia_mark(student["id"], subject_code, "ia2", mark2)
                except ValueError:
                    pass
            updated_count += 1

    return ApiResponse(
        success=True,
        message=f"Spreadsheet '{file.filename}' processed successfully: Updated marks for {updated_count} students in {subject_code}.",
        data={"filename": file.filename, "recordsUpdated": updated_count, "subjectCode": subject_code}
    )
