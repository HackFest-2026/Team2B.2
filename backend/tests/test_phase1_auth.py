"""
Phase 1 Verification Test Suite: Authentication, Roles, and Ground Truth Dataset
"""
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

from backend.main import app
from backend.config import DEFAULT_USERS

client = TestClient(app)

def test_health_endpoint():
    """Verify system health endpoint operates normally."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["local_inference_ready"] is True

def test_login_officer_lead():
    """Verify Evidence Officer login, permissions, and clearance level."""
    payload = {
        "username": "officer_lead",
        "password": DEFAULT_USERS["officer_lead"]["password"]
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "OFFICER"
    assert data["user"]["clearance"] == "LEVEL_2"
    assert data["user"]["can_upload"] is True

def test_login_investigator_l2():
    """Verify Senior Forensic Investigator login."""
    payload = {
        "username": "investigator_l2",
        "password": DEFAULT_USERS["investigator_l2"]["password"]
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "INVESTIGATOR"
    assert data["user"]["clearance"] == "LEVEL_2"
    assert data["user"]["can_upload"] is False

def test_login_auditor_l1():
    """Verify Public Compliance Auditor login."""
    payload = {
        "username": "auditor_l1",
        "password": DEFAULT_USERS["auditor_l1"]["password"]
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "AUDITOR"
    assert data["user"]["clearance"] == "LEVEL_1"
    assert data["user"]["can_upload"] is False

def test_login_invalid_credentials():
    """Verify that bad credentials return 401 Unauthorized."""
    # Wrong password
    bad_pw = client.post("/api/auth/login", json={"username": "officer_lead", "password": "WrongPassword!"})
    assert bad_pw.status_code == 401
    
    # Non-existent user
    bad_user = client.post("/api/auth/login", json={"username": "unknown_actor", "password": "AnyPassword!"})
    assert bad_user.status_code == 401

def test_auth_me_with_valid_and_invalid_tokens():
    """Verify token resolution in /api/auth/me."""
    # 1. Login to get token
    login_res = client.post("/api/auth/login", json={
        "username": "officer_lead",
        "password": DEFAULT_USERS["officer_lead"]["password"]
    })
    token = login_res.json()["access_token"]
    
    # 2. Call /api/auth/me with valid Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["username"] == "officer_lead"
    
    # 3. Call without token
    no_token_res = client.get("/api/auth/me")
    assert no_token_res.status_code == 401
    
    # 4. Call with forged token
    forged_res = client.get("/api/auth/me", headers={"Authorization": "Bearer fake.token.signature"})
    assert forged_res.status_code == 401

def test_benchmark_files_existence_and_integrity():
    """Verify that all 3 benchmark ground-truth evidence files exist with non-zero size."""
    benchmark_dir = Path(__file__).resolve().parent.parent.parent / "data" / "benchmark_case"
    
    expected_files = [
        "incident_report.pdf",
        "witness_interview.txt",
        "auth_firewall.log"
    ]
    
    for filename in expected_files:
        filepath = benchmark_dir / filename
        assert filepath.exists(), f"Missing required benchmark file: {filename}"
        assert filepath.stat().st_size > 50, f"File {filename} is suspiciously small or empty"
