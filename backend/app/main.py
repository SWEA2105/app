from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings

# Import API routers
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.students import router as students_router
from app.api.ia_analyzer import router as ia_router
from app.api.university_results import router as university_router
from app.api.arrears import router as arrears_router
from app.api.reports import router as reports_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-performance academic intelligence portal backend: Student records, IA mark analysis with Pandas, university result extraction with PyMuPDF/pdfplumber, arrear history tracking, and downloadable reports.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware setup to allow Vite frontend communications
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    settings.FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(students_router, prefix="/api")
app.include_router(ia_router, prefix="/api")
app.include_router(university_router, prefix="/api")
app.include_router(arrears_router, prefix="/api")
app.include_router(reports_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/api/health",
        "status": "online"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": f"Internal Server Error: {str(exc)}",
            "data": None
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
