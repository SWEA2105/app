from enum import Enum
from typing import Optional
from pydantic import BaseModel

class UserRole(str, Enum):
    FACULTY = "faculty"
    ADMIN = "admin"

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[UserRole] = UserRole.FACULTY

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    department: str
    designation: str
    avatar: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
