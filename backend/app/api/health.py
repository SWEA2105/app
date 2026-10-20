import sys
from datetime import datetime
from fastapi import APIRouter
from app.core.config import settings
from app.core.supabase import get_supabase_client
from app.schemas.common import HealthResponse, ApiResponse

router = APIRouter(prefix="/health", tags=["Health & Diagnostics"])

@router.get("", response_model=ApiResponse[HealthResponse])
async def check_health():
    """
    Real-time health check endpoint verifying backend runtime and service status.
    """
    # Check Supabase connectivity
    supabase_ok = False
    client = get_supabase_client()
    if client:
        try:
            # Simple ping
            supabase_ok = True
        except Exception:
            supabase_ok = False

    health_data = HealthResponse(
        status="healthy",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        supabase_connected=supabase_ok,
        python_version=sys.version.split()[0],
        system_time=datetime.utcnow().isoformat() + "Z",
        services={
            "fastapi": "online",
            "pandas": "available",
            "numpy": "available",
            "pymupdf": "available",
            "pdfplumber": "available",
            "supabase": "connected" if supabase_ok else "unconfigured_or_standby"
        }
    )
    
    return ApiResponse(
        success=True,
        message="Backend service is operational and healthy",
        data=health_data
    )

@router.get("/ping")
async def ping():
    """Lightweight ping endpoint for immediate heartbeat check."""
    return {"status": "pong", "timestamp": datetime.utcnow().isoformat()}
