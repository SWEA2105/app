import logging
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("app.core.supabase")

_supabase_client: Optional[Client] = None
_supabase_admin_client: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    """
    Returns standard Supabase client with public anon key.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
    
    if settings.is_supabase_configured:
        try:
            _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
            return _supabase_client
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            return None
    return None

def get_supabase_admin() -> Optional[Client]:
    """
    Returns Supabase client with service role key for backend elevated operations.
    """
    global _supabase_admin_client
    if _supabase_admin_client is not None:
        return _supabase_admin_client

    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        try:
            _supabase_admin_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            return _supabase_admin_client
        except Exception as e:
            logger.error(f"Failed to initialize Supabase admin client: {e}")
            return None
    return None
