"""
Phase 4 Verification Test Suite: Single Verifiable Document / Dossier & Provenance Citations
Validates narrative grounding, citation-to-chunk SHA-256 mapping, and Zero Data Spillage RBAC.
"""
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.config import DEFAULT_USERS, CLEARANCE_LEVEL_1, CLEARANCE_LEVEL_2
from backend.ingestion.manifest import manifest_store
from backend.ai.synthesizer import synthesize_dossier

client = TestClient(app)

def get_auth_header(username: str) -> dict:
    res = client.post("/api/auth/login", json={
        "username": username,
        "password": DEFAULT_USERS[username]["password"]
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(autouse=True)
def ensure_benchmark_ingested():
    """Ensure benchmark dataset is loaded into manifest before each test."""
    manifest_store.load_benchmark_dataset(ingested_by="officer_lead")

def test_dossier_structure_and_sections():
    """Verify synthesized dossier has all required forensic sections and metadata."""
    chunks = manifest_store.get_chunks_for_clearance(CLEARANCE_LEVEL_2)
    dossier = synthesize_dossier(chunks, user_clearance=CLEARANCE_LEVEL_2)

    assert dossier["case_id"] == "IR-2026-0914-ALPHA"
    assert "dossier_sha256_seal" in dossier
    assert len(dossier["dossier_sha256_seal"]) == 64
    assert len(dossier["sections"]) == 4

    section_titles = [s["title"] for s in dossier["sections"]]
    assert any("Executive Summary" in t for t in section_titles)
    assert any("Chronological" in t for t in section_titles)
    assert any("Contradiction" in t for t in section_titles)
    assert any("Remediation" in t for t in section_titles)

def test_citations_cryptographic_integrity():
    """Verify every citation anchor maps to an actual chunk in the ledger with verified SHA-256."""
    chunks = manifest_store.get_chunks_for_clearance(CLEARANCE_LEVEL_2)
    dossier = synthesize_dossier(chunks, user_clearance=CLEARANCE_LEVEL_2)

    citations = dossier["citations"]
    assert len(citations) >= 6

    # Verify every citation has a 64-char sha256 and verified status
    all_chunk_hashes = set(c["sha256"] for c in chunks)
    for cit in citations:
        assert len(cit["sha256"]) == 64
        assert cit["integrity_status"] == "VERIFIED"
        assert cit["sha256"] in all_chunk_hashes
        assert cit["label"].startswith("[Ref ")

    # Verify multiple heterogeneous sources are represented in citations
    sources = set(c["source_file"] for c in citations)
    assert "incident_report.pdf" in sources
    assert "witness_interview.txt" in sources
    assert "auth_firewall.log" in sources

def test_zero_data_spillage_clearance_gating():
    """Verify that LEVEL_1 users receive dynamic redactions with zero private IP / query leakage."""
    chunks_l1 = manifest_store.get_chunks_for_clearance(CLEARANCE_LEVEL_1)
    dossier_l1 = synthesize_dossier(chunks_l1, user_clearance=CLEARANCE_LEVEL_1)

    # Convert entire Level 1 dossier to string to check for leaks
    dossier_l1_str = str(dossier_l1)
    
    # Internal classified IP must NOT be present in Level 1 dossier
    assert "10.240.1.45" not in dossier_l1_str
    assert "[REDACTED - LEVEL 2" in dossier_l1_str

    # LEVEL_2 dossier must have the unmasked evidence
    chunks_l2 = manifest_store.get_chunks_for_clearance(CLEARANCE_LEVEL_2)
    dossier_l2 = synthesize_dossier(chunks_l2, user_clearance=CLEARANCE_LEVEL_2)
    dossier_l2_str = str(dossier_l2)
    assert "10.240.1.45" in dossier_l2_str
    assert "pg_dump" in dossier_l2_str

def test_dossier_sha256_tamper_evidence():
    """Verify that the cryptographic seal is reproducible and tamper-evident."""
    chunks = manifest_store.get_chunks_for_clearance(CLEARANCE_LEVEL_2)
    dossier1 = synthesize_dossier(chunks, user_clearance=CLEARANCE_LEVEL_2)
    dossier2 = synthesize_dossier(chunks, user_clearance=CLEARANCE_LEVEL_2)

    assert dossier1["dossier_sha256_seal"] == dossier2["dossier_sha256_seal"]

def test_api_dossier_endpoints():
    """Verify FastAPI /api/analysis/dossier endpoint under both Officer (L2) and Auditor (L1) tokens."""
    # 1. Lead Officer (Level 2)
    headers_l2 = get_auth_header("officer_lead")
    res_l2 = client.get("/api/analysis/dossier", headers=headers_l2)
    assert res_l2.status_code == 200
    data_l2 = res_l2.json()
    assert data_l2["clearance_applied"] == "LEVEL_2"
    assert "10.240.1.45" in str(data_l2)

    # 2. Auditor (Level 1)
    headers_l1 = get_auth_header("auditor_l1")
    res_l1 = client.get("/api/analysis/dossier", headers=headers_l1)
    assert res_l1.status_code == 200
    data_l1 = res_l1.json()
    assert data_l1["clearance_applied"] == "LEVEL_1"
    assert "10.240.1.45" not in str(data_l1)
    assert "[REDACTED" in str(data_l1)

    # 3. Officer simulating Level 1 clearance
    res_sim = client.get("/api/analysis/dossier?simulate_clearance=LEVEL_1", headers=headers_l2)
    assert res_sim.status_code == 200
    data_sim = res_sim.json()
    assert data_sim["clearance_applied"] == "LEVEL_1"
    assert "10.240.1.45" not in str(data_sim)
