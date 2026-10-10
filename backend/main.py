"""
Verion AI - Main FastAPI Application
"""
import os
import shutil
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.config import DEFAULT_USERS, CLEARANCE_LEVEL_1, CLEARANCE_LEVEL_2
from backend.auth import (
    authenticate_user,
    create_access_token,
    get_current_user
)
from backend.ingestion.manifest import manifest_store

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

# ----------------- Lifecycle & Pre-seeding -----------------
@app.on_event("startup")
def startup_event():
    """Auto-ingest benchmark files on startup so system is immediately functional."""
    manifest_store.load_benchmark_dataset(ingested_by="officer_lead")

# ----------------- Auth Routes -----------------
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
                classification = CLEARANCE_LEVEL_2 if "auth_firewall" in f.name else CLEARANCE_LEVEL_1
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

# ----------------- Phase 2 Ingestion Endpoints -----------------
@app.post("/api/ingest/benchmark")
def ingest_benchmark_dataset(user: Dict[str, Any] = Depends(get_current_user)):
    """Manually trigger or reset the benchmark dataset ingestion."""
    result = manifest_store.load_benchmark_dataset(ingested_by=user["username"])
    return result

@app.get("/api/ingest/manifest")
def get_manifest(user: Dict[str, Any] = Depends(get_current_user)):
    """Returns ingestion registry summary."""
    return manifest_store.get_manifest_summary()

@app.get("/api/ingest/chunks")
def get_chunks(
    simulate_clearance: Optional[str] = Query(None),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns extracted chunks filtered by clearance.
    SECURITY RULE 2: If the authenticated user has Level 1, they CANNOT request Level 2.
    """
    effective_clearance = user["clearance"]
    
    # If Level 2 user chooses to simulate Level 1 view, allow it
    if effective_clearance == CLEARANCE_LEVEL_2 and simulate_clearance == CLEARANCE_LEVEL_1:
        effective_clearance = CLEARANCE_LEVEL_1
        
    filtered = manifest_store.get_chunks_for_clearance(effective_clearance)
    return {
        "effective_clearance": effective_clearance,
        "total_chunks_returned": len(filtered),
        "chunks": filtered
    }

@app.post("/api/ingest/upload")
async def upload_evidence_file(
    file: UploadFile = File(...),
    classification: str = Form("LEVEL_1"),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Upload and ingest an evidence file.
    Only users with can_upload (Evidence Officer) are authorized.
    """
    if not user.get("can_upload", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only an Evidence Custodian & Lead Officer can ingest new evidence."
        )

    if classification not in [CLEARANCE_LEVEL_1, CLEARANCE_LEVEL_2]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid classification: must be {CLEARANCE_LEVEL_1} or {CLEARANCE_LEVEL_2}"
        )

    # Save uploaded file to incoming storage
    upload_dir = Path(__file__).resolve().parent.parent / "data" / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    destination = upload_dir / file.filename

    with open(destination, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process and record in manifest
    result = manifest_store.ingest_file(
        destination,
        classification_level=classification,
        ingested_by=user["username"]
    )

    return {
        "status": "success",
        "message": f"File '{file.filename}' processed into {result['chunk_count']} sealed chunks.",
        "file_details": result
    }

# ----------------- Phase 3 AI Intelligence & Conflict Radar -----------------
from backend.ai.entity_extractor import extract_entities_from_chunks
from backend.ai.timeline_builder import build_unified_timeline
from backend.ai.conflict_detector import detect_cross_source_conflicts
from backend.ai.ollama_client import local_ai

@app.get("/api/analysis/entities")
def get_entities(
    simulate_clearance: Optional[str] = Query(None),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Returns resolved entities, with internal Level 2 assets masked for Level 1 users."""
    effective_clearance = user["clearance"]
    if effective_clearance == CLEARANCE_LEVEL_2 and simulate_clearance == CLEARANCE_LEVEL_1:
        effective_clearance = CLEARANCE_LEVEL_1

    chunks = manifest_store.get_chunks_for_clearance(effective_clearance)
    return extract_entities_from_chunks(chunks, user_clearance=effective_clearance)

@app.get("/api/analysis/timeline")
def get_timeline(
    simulate_clearance: Optional[str] = Query(None),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Returns unified chronological incident events with source citations."""
    effective_clearance = user["clearance"]
    if effective_clearance == CLEARANCE_LEVEL_2 and simulate_clearance == CLEARANCE_LEVEL_1:
        effective_clearance = CLEARANCE_LEVEL_1

    chunks = manifest_store.get_chunks_for_clearance(effective_clearance)
    events = build_unified_timeline(chunks, user_clearance=effective_clearance)
    return {
        "effective_clearance": effective_clearance,
        "total_events": len(events),
        "events": events
    }

@app.get("/api/analysis/conflicts")
def get_conflicts(
    simulate_clearance: Optional[str] = Query(None),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns detected cross-source contradictions.
    Level 1 callers see restricted evidence masked with zero data spillage.
    """
    effective_clearance = user["clearance"]
    if effective_clearance == CLEARANCE_LEVEL_2 and simulate_clearance == CLEARANCE_LEVEL_1:
        effective_clearance = CLEARANCE_LEVEL_1

    chunks = manifest_store.get_chunks_for_clearance(effective_clearance)
    conflicts = detect_cross_source_conflicts(chunks, user_clearance=effective_clearance)
    return {
        "effective_clearance": effective_clearance,
        "total_conflicts": len(conflicts),
        "conflicts": conflicts
    }

@app.post("/api/analysis/run")
def trigger_analysis(
    simulate_clearance: Optional[str] = Query(None),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Executes full on-prem AI analysis across all ingested sources."""
    effective_clearance = user["clearance"]
    if effective_clearance == CLEARANCE_LEVEL_2 and simulate_clearance == CLEARANCE_LEVEL_1:
        effective_clearance = CLEARANCE_LEVEL_1

    chunks = manifest_store.get_chunks_for_clearance(effective_clearance)
    entities = extract_entities_from_chunks(chunks, user_clearance=effective_clearance)
    timeline = build_unified_timeline(chunks, user_clearance=effective_clearance)
    conflicts = detect_cross_source_conflicts(chunks, user_clearance=effective_clearance)

    return {
        "status": "success",
        "case_id": "IR-2026-0914-ALPHA",
        "gpu_inference_mode": "Ollama / On-Prem Native",
        "clearance_applied": effective_clearance,
        "summary": {
            "entities_resolved": entities["total_actors"] + entities["total_systems"] + entities["total_ips"],
            "timeline_events": len(timeline),
            "conflicts_detected": len(conflicts)
        },
        "entities": entities,
        "timeline": timeline,
        "conflicts": conflicts
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
