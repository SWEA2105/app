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

    @property
    def is_supabase_configured(self) -> bool:
        return bool(self.SUPABASE_URL and self.SUPABASE_ANON_KEY)

settings = Settings()
