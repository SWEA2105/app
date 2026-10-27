import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Locate .env file in backend root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

class Settings(BaseModel):
    PROJECT_NAME: str = "Student Academic Performance & University Result Analyzer"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # Supabase settings
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # Storage buckets
    SUPABASE_BUCKET_RESULTS: str = os.getenv("SUPABASE_BUCKET_RESULTS", "university-results")
    SUPABASE_BUCKET_MARKS: str = os.getenv("SUPABASE_BUCKET_MARKS", "ia-marksheets")

    # JWT signing secret
    SECRET_KEY: str = os.getenv("SECRET_KEY", "institutional-super-secret-key-student-analyzer")

    # ---- Student OTP verification (register number + e-mail sign-in) ----
    STUDENT_OTP_LENGTH: int = int(os.getenv("STUDENT_OTP_LENGTH", "4"))
    STUDENT_OTP_TTL_SECONDS: int = int(os.getenv("STUDENT_OTP_TTL_SECONDS", "300"))
    STUDENT_OTP_RESEND_COOLDOWN_SECONDS: int = int(os.getenv("STUDENT_OTP_RESEND_COOLDOWN_SECONDS", "45"))
    STUDENT_OTP_MAX_ATTEMPTS: int = int(os.getenv("STUDENT_OTP_MAX_ATTEMPTS", "5"))
    # A fixed code keeps the local/demo walkthrough deterministic (1234).
    # Set to an empty string (or run in production) to issue random codes instead.
    STUDENT_OTP_FIXED: str = os.getenv(
        "STUDENT_OTP_FIXED",
        "1234" if os.getenv("ENVIRONMENT", "development") != "production" else "",
    )

    # ---- SMTP delivery of the OTP ----
    # Leave SMTP_HOST / SMTP_USER / SMTP_PASSWORD empty to run in development mode,
    # where the generated code is surfaced directly in the API response instead.
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM: str = os.getenv("SMTP_FROM", "no-reply@academic-analyzer.edu")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() == "true"

    @property
    def is_supabase_configured(self) -> bool:
        return bool(self.SUPABASE_URL and self.SUPABASE_ANON_KEY)

    @property
    def is_smtp_configured(self) -> bool:
        return bool(self.SMTP_HOST and self.SMTP_USER and self.SMTP_PASSWORD)

settings = Settings()
