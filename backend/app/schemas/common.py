from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[T] = None
    meta: Optional[dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    supabase_connected: bool
    python_version: str
    system_time: str
    services: dict[str, str]
