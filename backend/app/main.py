from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import os

# --------------------------------------------------
# API MODULES
# --------------------------------------------------

from app.api.company import router as company_router
from app.api.drives import router as drives_router
from app.api.applications import router as applications_router
from app.api.candidates import router as candidates_router
from app.api.interview import router as interview_router
from app.api.reports import router as reports_router
from app.api.analytics import router as analytics_router
from app.api.settings import router as settings_router
from app.api.profiles import router as profiles_router


# --------------------------------------------------
# APP
# --------------------------------------------------

app = FastAPI(
    title="HireLoop API",
    description="AI-powered recruitment and interview platform",
    version="1.0.0",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "HireLoop API is running",
        "status": "healthy",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
    }


# --------------------------------------------------
# FEATURE MODULES
# --------------------------------------------------

app.include_router(company_router)
app.include_router(drives_router)
app.include_router(applications_router)
app.include_router(candidates_router)
app.include_router(profiles_router)

# --------------------------------------------------
# AI INTERVIEW
# --------------------------------------------------
#
# app/api/interview.py contains:
#
# @router.post("/interview")
#
# Adding prefix="/api" produces:
#
# POST /api/interview
#
# --------------------------------------------------

app.include_router(
    interview_router,
    prefix="/api",
)

app.include_router(reports_router)
app.include_router(analytics_router)
app.include_router(settings_router)