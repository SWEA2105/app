from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.auth_schema import (
    LoginRequest,
    TokenResponse,
    UserProfile,
    UserRole,
    StudentOtpRequest,
    StudentOtpVerify,
    StudentOtpIssued,
    StudentLoginResponse,
    StudentIdentity,
)
from app.schemas.common import ApiResponse
from app.core.config import settings
from app.core.database import db
from app.core.otp_service import otp_store, send_otp_email, mask_email
from app.core.security import MOCK_USERS, create_access_token, get_current_user, build_student_profile

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(credentials: LoginRequest):
    """
    Authenticate faculty or administrator and issue signed JWT access token.
    """
    email = credentials.email.lower()
    user_profile = MOCK_USERS.get(email)

    if not user_profile:
        # Check if role match can provision demo user
        if credentials.role == UserRole.ADMIN:
            user_profile = MOCK_USERS["hod.cse@college.edu"]
        else:
            user_profile = MOCK_USERS["meenakshi.v@college.edu"]

    token = create_access_token(
        data={
            "sub": user_profile.email,
            "id": user_profile.id,
            "name": user_profile.name,
            "role": user_profile.role.value,
            "department": user_profile.department,
        }
    )

    return ApiResponse(
        success=True,
        message=f"Welcome {user_profile.name}! Signed in as {user_profile.role.value}.",
        data=TokenResponse(access_token=token, user=user_profile)
    )

@router.get("/me", response_model=ApiResponse[UserProfile])
async def get_my_profile(current_user: UserProfile = Depends(get_current_user)):
    """
    Returns the authenticated user's profile and active permissions.
    """
    return ApiResponse(
        success=True,
        message="User profile retrieved successfully",
        data=current_user
    )

@router.post("/demo-login/{role}", response_model=ApiResponse[TokenResponse])
async def demo_login(role: str):
    """
    Quick simulation login endpoint for testing Faculty and Admin permissions.
    """
    if role.lower() == "admin":
        user_profile = MOCK_USERS["hod.cse@college.edu"]
    else:
        user_profile = MOCK_USERS["meenakshi.v@college.edu"]

    token = create_access_token(
        data={
            "sub": user_profile.email,
            "id": user_profile.id,
            "name": user_profile.name,
            "role": user_profile.role.value,
            "department": user_profile.department,
        }
    )

    return ApiResponse(
        success=True,
        message=f"Demo login successful as {user_profile.role.value}",
        data=TokenResponse(access_token=token, user=user_profile)
    )

# ---------------------------------------------------------------------------
# Student sign-in: register number + e-mail ID -> OTP -> signed JWT session
# ---------------------------------------------------------------------------

def _find_student(reg_no: str, email: str) -> dict:
    """
    Resolve a student record from a register number + e-mail pair.

    Raises a 404 when the register number is unknown and a 401 when the e-mail
    does not belong to that register number.
    """
    student = db.get_student_by_reg_no(reg_no)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No student record was found for the supplied register number."
        )

    registered_email = (student.get("email") or "").strip().lower()
    if registered_email != email.strip().lower():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The e-mail ID does not match the register number on record."
        )

    return student

@router.post("/student/otp/request", response_model=ApiResponse[StudentOtpIssued])
async def request_student_otp(payload: StudentOtpRequest):
    """
    Issue a one-time password for a student and dispatch it to their e-mail ID.

    The register number and e-mail ID must match an enrolled student record.
    """
    student = _find_student(payload.regNo, payload.email)

    cooldown = otp_store.cooldown_remaining(payload.regNo, payload.email)
    if cooldown > 0:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {cooldown} second(s) before requesting a new verification code."
        )

    code, _record = otp_store.issue(payload.regNo, payload.email)
    delivered = send_otp_email(
        to_email=payload.email,
        otp=code,
        reg_no=student["regNo"],
        student_name=student.get("name", "Student")
    )

    return ApiResponse(
        success=True,
        message=(
            f"Verification code sent to {mask_email(payload.email)}. It expires in "
            f"{settings.STUDENT_OTP_TTL_SECONDS // 60} minute(s)."
            if delivered
            else f"Verification code generated for {mask_email(payload.email)} - e-mail delivery is not configured on this server."
        ),
        data=StudentOtpIssued(
            regNo=student["regNo"],
            email=payload.email,
            maskedEmail=mask_email(payload.email),
            otpLength=settings.STUDENT_OTP_LENGTH,
            expiresInSeconds=settings.STUDENT_OTP_TTL_SECONDS,
            resendAfterSeconds=settings.STUDENT_OTP_RESEND_COOLDOWN_SECONDS,
            delivery="email" if delivered else "development",
            # Surfaced only when the code could not be mailed so the student is never locked out.
            devOtp=None if delivered else code
        )
    )

@router.post("/student/otp/verify", response_model=ApiResponse[StudentLoginResponse])
async def verify_student_otp(payload: StudentOtpVerify):
    """
    Redeem the OTP mailed to the student and issue a signed JWT access token.
    """
    student = _find_student(payload.regNo, payload.email)

    success, otp_status = otp_store.verify(payload.regNo, payload.email, payload.otp)
    if not success:
        messages = {
            "not_found": "No verification code was requested for this account. Please request a new code.",
            "expired": "The verification code has expired. Please request a new one.",
            "locked": "Too many incorrect attempts. Please request a new verification code.",
            "mismatch": "Incorrect verification code. Please check and try again.",
        }
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=messages.get(otp_status, "Invalid verification code.")
        )

    profile = build_student_profile(student)
    token = create_access_token(
        data={
            "sub": profile.email,
            "id": profile.id,
            "name": profile.name,
            "role": profile.role.value,
            "department": profile.department,
            "designation": profile.designation,
            "avatar": profile.avatar,
            "regNo": student.get("regNo", ""),
        }
    )

    return ApiResponse(
        success=True,
        message=f"Welcome {profile.name}! Verification successful.",
        data=StudentLoginResponse(
            access_token=token,
            user=profile,
            student=StudentIdentity(
                id=student["id"],
                regNo=student["regNo"],
                name=student["name"],
                email=student["email"],
                department=student["department"],
                semester=student["semester"],
                section=student.get("section", "A")
            )
        )
    )
