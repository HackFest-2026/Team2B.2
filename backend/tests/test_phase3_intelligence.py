"""
Phase 3 Verification Test Suite: AI Intelligence, Conflict Radar & Timeline Reconciliation
"""
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

from backend.main import app
from backend.config import DEFAULT_USERS
from backend.ingestion.manifest import manifest_store
from backend.ai.entity_extractor import extract_entities_from_chunks
from backend.ai.timeline_builder import build_unified_timeline
from backend.ai.conflict_detector import detect_cross_source_conflicts

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

def test_entity_extraction_resolution():
    """Verify entity extractor identifies actors, systems, and IP addresses across sources."""
    chunks = manifest_store.get_chunks_for_clearance("LEVEL_2")
    entities = extract_entities_from_chunks(chunks, user_clearance="LEVEL_2")
    
    assert entities["total_actors"] >= 2
    actor_names = [a["name"] for a in entities["actors"]]
    assert any("Alice Chen" in name or "alice_admin" in name for name in actor_names)
    
    system_names = [s["hostname"] for s in entities["systems"]]
    assert "db-primary.internal" in system_names or "gw-datacenter-01" in system_names
    
    raw_ips = [ip["address"] for ip in entities["ip_addresses"]]
    assert any("10.240.1.45" in ip or "192.168.1.105" in ip for ip in raw_ips)

def test_unified_timeline_chronology():
    """Verify events from PDF, transcripts, and logs are sequenced in strictly ascending time order."""
    chunks = manifest_store.get_chunks_for_clearance("LEVEL_2")
    timeline = build_unified_timeline(chunks, user_clearance="LEVEL_2")
    
    assert len(timeline) >= 5
    # Verify strict chronological order
    timestamps = [e["timestamp_iso"] for e in timeline]
    assert timestamps == sorted(timestamps)
    
    # Verify presence of key events
    titles = [e["title"] for e in timeline]
    assert any("VPN" in t for t in titles)
    assert any("SSH" in t or "Database" in t for t in titles)

def test_conflict_radar_detection():
    """
    CRITICAL KPI TEST (Cross-Source Conflict Detection):
    Verifies that the system flags the contradiction between Alice's stated logout at 21:00 UTC
    and the firewall/SSH audit logs recording an active session at 21:14 UTC.
    """
    chunks = manifest_store.get_chunks_for_clearance("LEVEL_2")
    conflicts = detect_cross_source_conflicts(chunks, user_clearance="LEVEL_2")
    
    assert len(conflicts) >= 1
    c1 = conflicts[0]
    assert c1["severity"] == "CRITICAL"
    assert "Departure Timestamp" in c1["title"] or "Contradiction" in c1["category"]
    assert "21:00" in c1["claim_a"]["claimed_time"]
    assert "21:14" in c1["claim_b"]["recorded_time"]

def test_conflict_provenance_cryptographic_anchors():
    """Verify all flagged claims link to valid source chunk IDs and 64-character SHA-256 hashes."""
    chunks = manifest_store.get_chunks_for_clearance("LEVEL_2")
    conflicts = detect_cross_source_conflicts(chunks, user_clearance="LEVEL_2")
    
    for conf in conflicts:
        assert len(conf["claim_a"]["sha256"]) == 64
        assert len(conf["claim_b"]["sha256"]) == 64
        assert conf["claim_a"]["chunk_id"].startswith("WITNESS") or "CHK" in conf["claim_a"]["chunk_id"]
        assert conf["claim_b"]["chunk_id"].startswith("AUTH") or "CHK" in conf["claim_b"]["chunk_id"]

def test_zero_spillage_on_conflicts_and_entities():
    """
    CRITICAL SECURITY TEST (Zero Data Spillage):
    When an Auditor (Level 1) inspects conflicts or entities, classified internal IP addresses
    are masked with [REDACTED - LEVEL 2] and no Level 2 data leaks.
    """
    chunks = manifest_store.get_chunks_for_clearance("LEVEL_1")
    conflicts_l1 = detect_cross_source_conflicts(chunks, user_clearance="LEVEL_1")
    
    for conf in conflicts_l1:
        # Record MUST NOT leak raw classified internal IP 10.240.1.45
        assert "10.240.1.45" not in conf["claim_b"]["record"]
        assert "REDACTED" in conf["claim_b"]["record"] or "REDACTED" in conf["forensic_verdict"]

def test_analysis_run_api_endpoint():
    """Verify /api/analysis/run triggers and returns structured forensic analysis payload."""
    officer_headers = get_auth_header("officer_lead")
    res = client.post("/api/analysis/run", headers=officer_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["summary"]["conflicts_detected"] >= 1
    assert data["summary"]["timeline_events"] >= 5
    assert len(data["timeline"]) >= 5
    assert len(data["conflicts"]) >= 1
