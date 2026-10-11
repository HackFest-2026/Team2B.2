"""
Phase 5 Verification Test Suite: Verified Cryptographic PDF Export, Audit Ledger & Benchmark KPIs
Validates tamper-evident PDF generation, Zero Data Spillage in exported binaries,
and Problem Statement (2B) Hackathon Benchmark KPIs.
"""
import json
import pytest
import pymupdf
from fastapi.testclient import TestClient

from backend.main import app
from backend.config import DEFAULT_USERS, CLEARANCE_LEVEL_1, CLEARANCE_LEVEL_2
from backend.ingestion.manifest import manifest_store
from backend.ai.synthesizer import synthesize_dossier
from backend.export.pdf_generator import generate_dossier_pdf

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

def test_pdf_export_generation_and_structure():
    """Verify PyMuPDF generates a valid multi-page PDF with cryptographic stamps."""
    chunks = manifest_store.get_chunks_for_clearance(CLEARANCE_LEVEL_2)
    dossier = synthesize_dossier(chunks, user_clearance=CLEARANCE_LEVEL_2)
    pdf_bytes = generate_dossier_pdf(dossier)

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 5000
    assert pdf_bytes[:5] == b"%PDF-"

    # Inspect rendered PDF pages
    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    assert len(doc) >= 2

    page1_text = doc[0].get_text()
    assert "Single Verifiable Document" in page1_text
    assert dossier["case_id"] in page1_text
    assert dossier["dossier_sha256_seal"] in page1_text

    page2_text = doc[1].get_text()
    assert "Citation Registry" in page2_text or "Ref" in page2_text

def test_pdf_export_zero_data_spillage():
    """Verify that Level 1 Auditor PDF exports contain ZERO internal IP / query leaks."""
    # 1. Auditor L1 PDF
    chunks_l1 = manifest_store.get_chunks_for_clearance(CLEARANCE_LEVEL_1)
    dossier_l1 = synthesize_dossier(chunks_l1, user_clearance=CLEARANCE_LEVEL_1)
    pdf_l1_bytes = generate_dossier_pdf(dossier_l1)

    doc_l1 = pymupdf.open(stream=pdf_l1_bytes, filetype="pdf")
    full_text_l1 = "\n".join([page.get_text() for page in doc_l1])

    assert "10.240.1.45" not in full_text_l1
    assert "[REDACTED" in full_text_l1

    # 2. Officer L2 PDF
    chunks_l2 = manifest_store.get_chunks_for_clearance(CLEARANCE_LEVEL_2)
    dossier_l2 = synthesize_dossier(chunks_l2, user_clearance=CLEARANCE_LEVEL_2)
    pdf_l2_bytes = generate_dossier_pdf(dossier_l2)

    doc_l2 = pymupdf.open(stream=pdf_l2_bytes, filetype="pdf")
    full_text_l2 = "\n".join([page.get_text() for page in doc_l2])

    assert "10.240.1.45" in full_text_l2

def test_api_pdf_export_endpoint():
    """Verify FastAPI /api/export/pdf under both Lead Officer and Auditor tokens."""
    # Lead Officer (Level 2)
    headers_l2 = get_auth_header("officer_lead")
    res_l2 = client.get("/api/export/pdf", headers=headers_l2)
    assert res_l2.status_code == 200
    assert res_l2.headers["content-type"] == "application/pdf"
    assert "attachment; filename=Verion_Dossier_IR-2026-0914-ALPHA_LEVEL_2.pdf" in res_l2.headers["content-disposition"]
    assert "x-dossier-sha256" in res_l2.headers

    # Auditor (Level 1)
    headers_l1 = get_auth_header("auditor_l1")
    res_l1 = client.get("/api/export/pdf", headers=headers_l1)
    assert res_l1.status_code == 200
    assert res_l1.headers["content-type"] == "application/pdf"
    assert "LEVEL_1" in res_l1.headers["content-disposition"]

    # Verify zero spillage in Auditor PDF bytes
    doc_auditor = pymupdf.open(stream=res_l1.content, filetype="pdf")
    auditor_text = "\n".join([p.get_text() for p in doc_auditor])
    assert "10.240.1.45" not in auditor_text

def test_api_provenance_ledger_export():
    """Verify cryptographic provenance ledger JSON export."""
    headers = get_auth_header("officer_lead")
    res = client.get("/api/export/provenance-ledger", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["ledger_version"] == "1.0-SHA256"
    assert data["total_sealed_chunks"] >= 30
    assert len(data["chunks"]) >= 30

    # Ensure every chunk has an immutable SHA-256
    for chk in data["chunks"]:
        assert len(chk["sha256"]) == 64
        assert "source_file" in chk

def test_api_benchmark_kpis():
    """Verify Problem Statement (2B) Hackathon Evaluation Benchmark KPI scorecard."""
    headers = get_auth_header("officer_lead")
    res = client.get("/api/benchmark/kpis", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["problem_statement"] == "2B: Multi-Source Ingestion into a Single Verifiable Document"
    metrics = data["metrics"]
    assert metrics["attribution_accuracy"] == 1.0
    assert metrics["zero_data_spillage_rate"] == 0.0
    assert metrics["cryptographic_verification_rate"] == 1.0
    assert metrics["contradiction_recall"] == 1.0

    # Verify resilience boundary tests
    resilience = data["boundary_resilience_cases"]
    assert len(resilience) == 3
    assert all(r["status"] == "PASSED" for r in resilience)

def test_api_dossier_json_export():
    """Verify cryptographically sealed dossier JSON export with headers."""
    headers = get_auth_header("officer_lead")
    res = client.get("/api/export/dossier-json", headers=headers)
    assert res.status_code == 200
    assert "application/json" in res.headers["content-type"]
    assert "x-dossier-sha256" in res.headers
    assert "x-dossier-signature" in res.headers

    data = res.json()
    assert "dossier_sha256_seal" in data
    assert "digital_signature" in data
    assert data["tamper_protection"]["status"] == "CRYPTOGRAPHICALLY_SEALED"

def test_tamper_detection_unaltered_and_altered_dossier():
    """Verify that unmodified dossier verifies authentic, but altered text triggers TAMPER alert."""
    headers = get_auth_header("officer_lead")
    res = client.get("/api/export/dossier-json", headers=headers)
    dossier_data = res.json()

    # 1. Authentic verification
    verify_res = client.post("/api/verify/dossier", json=dossier_data)
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["is_authentic"] is True
    assert verify_data["status"] == "VERIFIED_AUTHENTIC"
    assert verify_data["signature_valid"] is True
    assert verify_data["content_valid"] is True

    # 2. Tampered content: Alter one word in the executive summary
    tampered_data = json.loads(json.dumps(dossier_data))
    tampered_data["sections"][0]["content"] += " [UNAUTHORIZED TAMPERED TEXT INSERTED]"
    
    tamper_res = client.post("/api/verify/dossier", json=tampered_data)
    assert tamper_res.status_code == 200
    tamper_verdict = tamper_res.json()
    assert tamper_verdict["is_authentic"] is False
    assert tamper_verdict["status"] == "TAMPER_DETECTED_CONTENT_MODIFIED"
    assert "Content modification detected" in tamper_verdict["message"]

    # 3. Forged signature: Modify the digital signature
    forged_data = json.loads(json.dumps(dossier_data))
    forged_data["digital_signature"] = "deadbeef" * 8
    forge_res = client.post("/api/verify/dossier", json=forged_data)
    assert forge_res.status_code == 200
    forge_verdict = forge_res.json()
    assert forge_verdict["is_authentic"] is False
    assert "INVALID_SIGNATURE" in forge_verdict["status"]
