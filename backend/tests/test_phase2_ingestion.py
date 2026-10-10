"""
Phase 2 Verification Test Suite: Multi-Source Ingestion, SHA-256 Hashing & Zero-Spillage Gating
"""
import io
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

from backend.main import app
from backend.config import DEFAULT_USERS
from backend.ingestion.pdf_parser import parse_pdf_file
from backend.ingestion.log_parser import parse_log_file
from backend.ingestion.chat_parser import parse_transcript_file
from backend.ingestion.chunker import process_file_into_chunks, compute_file_sha256

client = TestClient(app)

BENCHMARK_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "benchmark_case"

def get_auth_header(username: str) -> dict:
    """Helper to authenticate and generate Bearer header."""
    res = client.post("/api/auth/login", json={
        "username": username,
        "password": DEFAULT_USERS[username]["password"]
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_pdf_parser_extraction():
    """Verify PDF parser extracts valid page numbers, text, and character offsets."""
    pdf_path = BENCHMARK_DIR / "incident_report.pdf"
    sections = parse_pdf_file(pdf_path)
    assert len(sections) > 0
    assert sections[0]["source_type"] == "PDF"
    assert sections[0]["page_number"] == 1
    assert any("EXECUTIVE SUMMARY" in s["text"] for s in sections)
    assert any("containment" in s["text"].lower() or "incident" in s["text"].lower() for s in sections)

def test_log_parser_extraction():
    """Verify system log parser structures syslogs with timestamps and IPs."""
    log_path = BENCHMARK_DIR / "auth_firewall.log"
    entries = parse_log_file(log_path)
    assert len(entries) >= 5
    assert entries[0]["source_type"] == "SYSLOG"
    assert any("alice_admin" in e["text"] for e in entries)
    # Verify IP extraction
    all_ips = [ip for e in entries for ip in e.get("ips_found", [])]
    assert "10.240.1.45" in all_ips

def test_transcript_parser_extraction():
    """Verify interview transcript parser extracts speaker tags and time anchors."""
    transcript_path = BENCHMARK_DIR / "witness_interview.txt"
    statements = parse_transcript_file(transcript_path)
    assert len(statements) > 0
    speakers = [s["speaker"] for s in statements if s["speaker"]]
    assert "ALICE CHEN" in speakers
    assert "AGENT VANCE" in speakers

def test_sha256_cryptographic_fingerprinting():
    """Verify every extracted chunk is stamped with an immutable 64-character SHA-256 hash."""
    pdf_path = BENCHMARK_DIR / "incident_report.pdf"
    res = process_file_into_chunks(pdf_path, classification_level="LEVEL_1", ingested_by="officer_lead")
    assert len(res["file_sha256"]) == 64
    assert res["chunk_count"] > 0
    
    for chunk in res["chunks"]:
        assert len(chunk["sha256"]) == 64
        assert chunk["classification"] == "LEVEL_1"
        assert chunk["source_file"] == "incident_report.pdf"

def test_pre_retrieval_clearance_zero_spillage():
    """
    CRITICAL KPI TEST (Zero Data Spillage):
    A Level 1 Auditor querying chunks MUST receive ZERO Level 2 chunks.
    """
    # 1. Ensure benchmark is ingested
    officer_headers = get_auth_header("officer_lead")
    client.post("/api/ingest/benchmark", headers=officer_headers)
    
    # 2. Query as Level 1 Auditor
    auditor_headers = get_auth_header("auditor_l1")
    res = client.get("/api/ingest/chunks", headers=auditor_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["effective_clearance"] == "LEVEL_1"
    
    # MATHEMATICAL ZERO-SPILLAGE VERIFICATION
    level2_leaks = [c for c in data["chunks"] if c["classification"] == "LEVEL_2"]
    assert len(level2_leaks) == 0, f"DATA SPILLAGE DETECTED! Found {len(level2_leaks)} Level 2 chunks in Level 1 response."

def test_level2_investigator_receives_all_chunks():
    """Verify a Level 2 Investigator receives both Level 1 and Level 2 evidence."""
    investigator_headers = get_auth_header("investigator_l2")
    res = client.get("/api/ingest/chunks", headers=investigator_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["effective_clearance"] == "LEVEL_2"
    
    has_level1 = any(c["classification"] == "LEVEL_1" for c in data["chunks"])
    has_level2 = any(c["classification"] == "LEVEL_2" for c in data["chunks"])
    assert has_level1 and has_level2

def test_upload_role_authorization_enforced():
    """Verify that only the Evidence Custodian can upload new files."""
    test_file_content = b"Simulated incident field notes for testing upload."
    file_payload = ("test_note.txt", io.BytesIO(test_file_content), "text/plain")

    # Auditor upload MUST FAIL with 403 Forbidden
    auditor_headers = get_auth_header("auditor_l1")
    bad_upload = client.post(
        "/api/ingest/upload",
        files={"file": file_payload},
        data={"classification": "LEVEL_1"},
        headers=auditor_headers
    )
    assert bad_upload.status_code == 403

    # Officer upload MUST SUCCEED
    officer_headers = get_auth_header("officer_lead")
    file_payload_ok = ("test_note.txt", io.BytesIO(test_file_content), "text/plain")
    good_upload = client.post(
        "/api/ingest/upload",
        files={"file": file_payload_ok},
        data={"classification": "LEVEL_1"},
        headers=officer_headers
    )
    assert good_upload.status_code == 200
    assert good_upload.json()["status"] == "success"

def test_create_new_case_authorization():
    """Verify that only Lead Officer can initialize a new case, while others are rejected."""
    # Auditor cannot create a new case (403 Forbidden)
    auditor_headers = get_auth_header("auditor_l1")
    bad_res = client.post(
        "/api/case/new",
        json={"case_id": "CASE-TEST-001", "title": "Unauthorized Test Case"},
        headers=auditor_headers
    )
    assert bad_res.status_code == 403

    # Officer can create a new case (200 OK)
    officer_headers = get_auth_header("officer_lead")
    ok_res = client.post(
        "/api/case/new",
        json={"case_id": "CASE-TEST-001", "title": "Authorized Investigation"},
        headers=officer_headers
    )
    assert ok_res.status_code == 200
    assert ok_res.json()["case_id"] == "CASE-TEST-001"
