"""
Verion AI - Main FastAPI Application
"""
import os
from pathlib import Path
from typing import Dict, Any, List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.config import DEFAULT_USERS
from backend.auth import (
    authenticate_user,
    create_access_token,
    get_current_user
)

app = FastAPI(
    title="Verion AI API",
    version="1.0.0",
    description="Multi-Source Ingestion & Incident Verification Engine"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Models -----------------
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    platform: str
    version: str
    local_inference_ready: bool

# ----------------- Routes -----------------
@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "healthy",
        "platform": "Verion AI On-Prem",
        "version": "1.0.0",
        "local_inference_ready": True
    }

@app.post("/api/auth/login", response_model=LoginResponse)
def login(creds: LoginRequest):
    user = authenticate_user(creds.username, creds.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Verify your username and password."
        )
    
    token = create_access_token(user)
    
    # Safe user payload (exclude raw password)
    safe_user = {
        "username": user["username"],
        "full_name": user["full_name"],
        "title": user["title"],
        "role": user["role"],
        "clearance": user["clearance"],
        "can_upload": user["can_upload"],
        "badge_color": user["badge_color"]
    }
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": safe_user
    }

@app.get("/api/auth/me")
def get_current_user_profile(user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "username": user["username"],
        "full_name": user["full_name"],
        "title": user["title"],
        "role": user["role"],
        "clearance": user["clearance"],
        "can_upload": user["can_upload"],
        "badge_color": user["badge_color"]
    }

@app.get("/api/benchmark/files")
def list_benchmark_files(user: Dict[str, Any] = Depends(get_current_user)):
    """List bundled benchmark files with sizes and classification markers."""
    benchmark_dir = Path(__file__).resolve().parent.parent / "data" / "benchmark_case"
    files = []
    
    if benchmark_dir.exists():
        for f in benchmark_dir.iterdir():
            if f.is_file() and not f.name.endswith(".py"):
                # Determine classification of benchmark files
                classification = "LEVEL_2" if "auth_firewall" in f.name else "LEVEL_1"
                files.append({
                    "filename": f.name,
                    "size_bytes": f.stat().st_size,
                    "classification": classification,
                    "extension": f.suffix
                })
                
    return {
        "case_id": "CASE-2026-ALPHA",
        "title": "Unauthorized Relational Cluster Exfiltration",
        "files": files
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
