from fastapi import APIRouter, HTTPException, Depends, Query, Response
from app.schemas.common import ApiResponse
from app.schemas.auth_schema import UserProfile
from app.core.security import get_current_user, verify_department_access
from app.services.export_service import export_service

router = APIRouter(prefix="/reports", tags=["Reports & Institutional Exports"])

@router.get("/download/{report_type}")
async def download_report_csv(
    report_type: str,
    department: str = Query(default="CSE"),
    subject_code: str = Query(default="CS3591"),
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Download official institutional CSV reports:
    - ia-roster: Consolidated internal assessment marks
    - arrear-ledger: Multi-semester arrear audit ledger
    """
    verify_department_access(department, current_user)

    if report_type.lower() == "ia-roster":
        content = export_service.generate_ia_roster_csv(department=department, subject_code=subject_code)
        filename = f"IA_Roster_{department}_{subject_code}.csv"
    elif report_type.lower() == "arrear-ledger":
        content = export_service.generate_arrear_ledger_csv(department=department)
        filename = f"Arrear_Ledger_{department}.csv"
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown report type '{report_type}'. Available types: 'ia-roster', 'arrear-ledger'."
        )

    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/catalog", response_model=ApiResponse[list[dict]])
async def get_reports_catalog(current_user: UserProfile = Depends(get_current_user)):
    """
    Returns list of available institutional reports and their export formats.
    """
    catalog = [
        {
            "id": "ia-roster",
            "name": "Consolidated Internal Assessment Roster",
            "description": "IA-1, IA-2, weighted averages, and cohort rankings.",
            "formats": ["CSV", "Excel", "PDF"]
        },
        {
            "id": "arrear-ledger",
            "name": "University Examination Arrear Ledger",
            "description": "Historical arrear records, clearance statuses, and supplementary exam logs.",
            "formats": ["CSV", "Excel", "PDF"]
        },
        {
            "id": "remediation-list",
            "name": "Academic Attention & Remediation Roster",
            "description": "Early warning list of students scoring <50% or declining sharply.",
            "formats": ["CSV", "PDF"]
        },
        {
            "id": "naac-summary",
            "name": "NAAC / NBA Accreditation Attainment Summary",
            "description": "Course outcome attainment, cohort pass percentages, and compliance levels.",
            "formats": ["PDF", "Excel"]
        }
    ]
    return ApiResponse(success=True, message="Reports catalog retrieved", data=catalog)
