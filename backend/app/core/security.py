from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.auth_schema import UserProfile, UserRole

SECRET_KEY = "institutional-super-secret-key-student-analyzer"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

security_bearer = HTTPBearer(auto_error=False)

# Seed user accounts
MOCK_USERS = {
    "meenakshi.v@college.edu": UserProfile(
        id="fac_01",
        name="Dr. V. Meenakshi",
        email="meenakshi.v@college.edu",
        role=UserRole.FACULTY,
        department="CSE",
        designation="Associate Professor",
        avatar="VM"
    ),
    "kanthimathi.s@college.edu": UserProfile(
        id="fac_02",
        name="Dr. S. Kanthimathi",
        email="kanthimathi.s@college.edu",
        role=UserRole.FACULTY,
        department="ECE",
        designation="Professor & Faculty Head",
        avatar="SK"
    ),
    "hod.cse@college.edu": UserProfile(
        id="adm_01",
        name="Dr. R. Ramanathan",
        email="hod.cse@college.edu",
        role=UserRole.ADMIN,
        department="CSE",
        designation="Head of Department / Dean",
        avatar="RR"
    )
}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return None

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> UserProfile:
    """
    Validates bearer token or falls back to standard faculty demo user if no header provided.
    """
    if credentials:
        payload = decode_token(credentials.credentials)
        if payload and "sub" in payload:
            email = payload["sub"]
            if email in MOCK_USERS:
                return MOCK_USERS[email]
            # Construct profile from payload if custom user
            return UserProfile(
                id=payload.get("id", "user_custom"),
                name=payload.get("name", "Faculty User"),
                email=email,
                role=payload.get("role", UserRole.FACULTY),
                department=payload.get("department", "CSE"),
                designation=payload.get("designation", "Faculty Member"),
                avatar="FA"
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Default development fallback to Dr. V. Meenakshi (CSE Faculty)
    return MOCK_USERS["meenakshi.v@college.edu"]

def require_admin(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
    """
    Ensures only administrators (HOD, Deans) can perform administrative operations.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This operation requires Administrator / HOD privileges."
        )
    return current_user

def verify_department_access(requested_department: str, user: UserProfile):
    """
    Row-Level Security (RLS) enforcement at the API level:
    A faculty member can ONLY query and modify records for their own department.
    Administrators have global institutional access across all departments.
    """
    if user.role == UserRole.ADMIN:
        return True
    if requested_department.upper() != user.department.upper():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: Faculty {user.name} ({user.department}) is not authorized to access records belonging to the {requested_department.upper()} department."
        )
    return True
