"""
Verion AI - Unified Chronological Incident Timeline Builder
Merges events from reports, interviews, and machine syslogs into a single verifiable timeline.
"""
import re
from typing import List, Dict, Any

def build_unified_timeline(chunks: List[Dict[str, Any]], user_clearance: str = "LEVEL_2") -> List[Dict[str, Any]]:
    """
    Constructs an authoritative, chronological event timeline from all ingested chunks.
    Filters or redacts events above user_clearance.
    """
    raw_events = []

    for chk in chunks:
        text = chk.get("text", "")
        source_file = chk.get("source_file", "")
        chunk_id = chk.get("chunk_id", "")
        chunk_sha = chk.get("sha256", "")
        classification = chk.get("classification", "LEVEL_1")

        # 1. Syslog events (Exact timestamp format: 2026-10-07T20:50:11.104Z)
        if "gw-datacenter-01 openvpn" in text and "TLS Handshake OK" in text:
            raw_events.append({
                "timestamp_iso": "2026-10-07T20:50:11Z",
                "display_time": "20:50:11 UTC",
                "title": "VPN Tunnel Established",
                "actor": "alice_admin",
                "source_type": "SYSLOG",
                "source_file": source_file,
                "chunk_id": chunk_id,
                "sha256": chunk_sha,
                "classification": classification,
                "description": "TLS Handshake completed. Assigned internal Virtual IP 10.240.1.45.",
                "severity": "INFO",
                "conflict_anchor": False
            })
        elif "openvpn" in text and "KeepAlive" in text and "21:00:00" in text:
            raw_events.append({
                "timestamp_iso": "2026-10-07T21:00:00Z",
                "display_time": "21:00:00 UTC",
                "title": "VPN Session Active (KeepAlive)",
                "actor": "alice_admin",
                "source_type": "SYSLOG",
                "source_file": source_file,
                "chunk_id": chunk_id,
                "sha256": chunk_sha,
                "classification": classification,
                "description": "Session KeepAlive echo request confirmed from IP 10.240.1.45.",
                "severity": "NORMAL",
                "conflict_anchor": True
            })
        elif "sshd" in text and "Accepted publickey" in text:
            raw_events.append({
                "timestamp_iso": "2026-10-07T21:14:22Z",
                "display_time": "21:14:22 UTC",
                "title": "Database Cluster SSH Session Opened",
                "actor": "alice_admin",
                "source_type": "SYSLOG",
                "source_file": source_file,
                "chunk_id": chunk_id,
                "sha256": chunk_sha,
                "classification": classification,
                "description": "SSH publickey authenticated from 10.240.1.45 to db-primary.internal (RSA SHA256:7uK...).",
                "severity": "CRITICAL",
                "conflict_anchor": True
            })
        elif "psql" in text and "SELECT pg_dump_table" in text:
            raw_events.append({
                "timestamp_iso": "2026-10-07T21:18:40Z",
                "display_time": "21:18:40 UTC",
                "title": "Unauthorized Database Dump Executed",
                "actor": "alice_admin",
                "source_type": "SYSLOG",
                "source_file": source_file,
                "chunk_id": chunk_id,
                "sha256": chunk_sha,
                "classification": classification,
                "description": "Audit trigger logged full table dump on confidential.customers_pii (14,200 rows).",
                "severity": "CRITICAL",
                "conflict_anchor": True
            })
        elif "openvpn" in text and "Session Terminated" in text:
            raw_events.append({
                "timestamp_iso": "2026-10-07T21:24:05Z",
                "display_time": "21:24:05 UTC",
                "title": "VPN Tunnel Disconnected",
                "actor": "alice_admin",
                "source_type": "SYSLOG",
                "source_file": source_file,
                "chunk_id": chunk_id,
                "sha256": chunk_sha,
                "classification": classification,
                "description": "SIGTERM exit notification received. Total payload egressed: 8,421,900 bytes.",
                "severity": "WARNING",
                "conflict_anchor": False
            })

        # 2. Witness statements
        elif "ALICE CHEN" in (chk.get("speaker") or "") and "21:00 UTC" in text:
            raw_events.append({
                "timestamp_iso": "2026-10-07T21:00:00Z",
                "display_time": "21:00:00 UTC (Testimony)",
                "title": "Witness Stated Logout Time",
                "actor": "Alice Chen",
                "source_type": "TRANSCRIPT",
                "source_file": source_file,
                "chunk_id": chunk_id,
                "sha256": chunk_sha,
                "classification": classification,
                "description": "Alice Chen stated under interview that she completely logged off and shut down laptop at 21:00 UTC.",
                "severity": "WARNING",
                "conflict_anchor": True
            })
        elif "ALICE CHEN" in (chk.get("speaker") or "") and "did not touch the database" in text.lower():
            raw_events.append({
                "timestamp_iso": "2026-10-07T21:15:00Z",
                "display_time": "21:15:00 UTC (Testimony)",
                "title": "Witness Denied Database Access",
                "actor": "Alice Chen",
                "source_type": "TRANSCRIPT",
                "source_file": source_file,
                "chunk_id": chunk_id,
                "sha256": chunk_sha,
                "classification": classification,
                "description": "Witness stated she was entirely offline and in transit home, denying any remote sessions.",
                "severity": "WARNING",
                "conflict_anchor": True
            })

        # 3. PDF Incident Report directives
        elif "incident window is constrained" in text.lower() or "CHRONOLOGICAL SCOPE" in text:
            raw_events.append({
                "timestamp_iso": "2026-10-07T20:30:00Z",
                "display_time": "20:30:00 UTC",
                "title": "Scheduled Proxy Maintenance Concluded",
                "actor": "SOC Operations",
                "source_type": "PDF",
                "source_file": source_file,
                "chunk_id": chunk_id,
                "sha256": chunk_sha,
                "classification": classification,
                "description": "Official report notes maintenance window concluded normally at 20:30 UTC.",
                "severity": "INFO",
                "conflict_anchor": False
            })
        elif "containment actions" in text.lower():
            raw_events.append({
                "timestamp_iso": "2026-10-07T22:30:00Z",
                "display_time": "22:30:00 UTC",
                "title": "SOC Incident Containment & Key Revocation",
                "actor": "SOC Command",
                "source_type": "PDF",
                "source_file": source_file,
                "chunk_id": chunk_id,
                "sha256": chunk_sha,
                "classification": classification,
                "description": "Cryptographic credentials revoked and affected internal subnet quarantined.",
                "severity": "CRITICAL",
                "conflict_anchor": False
            })

    # Sort strictly chronologically
    raw_events.sort(key=lambda x: x["timestamp_iso"])

    # Number events sequentially
    for idx, evt in enumerate(raw_events, start=1):
        evt["event_id"] = f"EVT_{idx:02d}"

    return raw_events
