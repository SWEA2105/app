from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.auth_schema import LoginRequest, TokenResponse, UserProfile, UserRole
from app.schemas.common import ApiResponse
from app.core.security import MOCK_USERS, create_access_token, get_current_user

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
