from enum import Enum
from typing import Optional
import re
from pydantic import BaseModel, Field, field_validator

class UserRole(str, Enum):
    FACULTY = "faculty"
    ADMIN = "admin"
    STUDENT = "student"

EMAIL_PATTERN = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"

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

class StudentIdentity(BaseModel):
    """Minimal student identity embedded in the student sign-in response."""
    id: str
    regNo: str
    name: str
    email: str
    department: str
    semester: str
    section: str

class StudentOtpRequest(BaseModel):
    """Step 1 of student sign-in: register number + e-mail ID."""
    regNo: str = Field(..., min_length=3, max_length=32)
    email: str = Field(..., max_length=254)

    @field_validator("regNo")
    @classmethod
    def _clean_reg_no(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Register number is required")
        return cleaned

    @field_validator("email")
    @classmethod
    def _clean_email(cls, value: str) -> str:
        cleaned = value.strip().lower()
        if not re.fullmatch(EMAIL_PATTERN, cleaned):
            raise ValueError("Enter a valid e-mail address")
        return cleaned

class StudentOtpVerify(BaseModel):
    """Step 2 of student sign-in: the OTP that was mailed to the student."""
    regNo: str = Field(..., min_length=3, max_length=32)
    email: str = Field(..., max_length=254)
    otp: str = Field(..., min_length=4, max_length=8)

    @field_validator("regNo")
    @classmethod
    def _clean_reg_no(cls, value: str) -> str:
        return value.strip()

    @field_validator("email")
    @classmethod
    def _clean_email(cls, value: str) -> str:
        return value.strip().lower()

    @field_validator("otp")
    @classmethod
    def _clean_otp(cls, value: str) -> str:
        return value.strip()

class StudentOtpIssued(BaseModel):
    """Delivery details for a freshly issued OTP."""
    regNo: str
    email: str
    maskedEmail: str
    otpLength: int
    expiresInSeconds: int
    resendAfterSeconds: int
    delivery: str = Field(default="email", description="'email' when dispatched via SMTP, 'development' otherwise")
    devOtp: Optional[str] = Field(default=None, description="Only populated when e-mail delivery is unavailable")

class StudentLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
    student: StudentIdentity
