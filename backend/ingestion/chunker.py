"""
Verion AI - Chunking & SHA-256 Cryptographic Fingerprint Engine
Normalizes heterogeneous parsed evidence into verifiable chunks with tamper-proof hashes.
"""
import hashlib
from pathlib import Path
from typing import List, Dict, Any

from backend.ingestion.pdf_parser import parse_pdf_file
from backend.ingestion.log_parser import parse_log_file
from backend.ingestion.chat_parser import parse_transcript_file

def compute_file_sha256(filepath: Path) -> str:
    """Calculates SHA-256 hash of the raw file contents."""
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def process_file_into_chunks(
    filepath: Path,
    classification_level: str,
    ingested_by: str = "officer_lead"
) -> Dict[str, Any]:
    """
    Parses a file, hashes its payload, and breaks it into cryptographically sealed chunks.
    classification_level: 'LEVEL_1' (Unclassified) or 'LEVEL_2' (Restricted/Classified)
    """
    if not filepath.exists():
        raise FileNotFoundError(f"File not found: {filepath}")

    ext = filepath.suffix.lower()
    file_hash = compute_file_sha256(filepath)

    if ext == ".pdf":
        raw_elements = parse_pdf_file(filepath)
    elif ext in [".log", ".syslog", ".csv"]:
        raw_elements = parse_log_file(filepath)
    elif ext in [".txt", ".json"]:
        raw_elements = parse_transcript_file(filepath)
    else:
        # Generic text fallback
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            lines = [l.strip() for l in f.readlines() if l.strip()]
        raw_elements = [
            {"source_file": filepath.name, "source_type": "GENERIC", "line_number": idx + 1, "text": l, "char_count": len(l)}
            for idx, l in enumerate(lines)
        ]

    chunks = []
    for idx, elem in enumerate(raw_elements, start=1):
        chunk_id = f"{filepath.stem.upper()}_CHK_{idx:03d}"
        text_content = elem["text"]
        
        # Cryptographic chunk fingerprint bound to file hash and content
        chunk_hasher = hashlib.sha256()
        chunk_hasher.update(file_hash.encode("utf-8"))
        chunk_hasher.update(chunk_id.encode("utf-8"))
        chunk_hasher.update(text_content.encode("utf-8"))
        chunk_sha256 = chunk_hasher.hexdigest()

        chunk_record = {
            "chunk_id": chunk_id,
            "source_file": filepath.name,
            "source_type": elem.get("source_type", "DOC"),
            "classification": classification_level,
            "page_number": elem.get("page_number"),
            "line_number": elem.get("line_number"),
            "time_anchor": elem.get("timestamp") or elem.get("time_anchor"),
            "speaker": elem.get("speaker"),
            "char_span": elem.get("char_span"),
            "text": text_content,
            "sha256": chunk_sha256,
            "file_sha256": file_hash,
            "ingested_by": ingested_by
        }
        chunks.append(chunk_record)

    return {
        "filename": filepath.name,
        "extension": ext,
        "size_bytes": filepath.stat().st_size,
        "file_sha256": file_hash,
        "classification": classification_level,
        "ingested_by": ingested_by,
        "chunk_count": len(chunks),
        "chunks": chunks
    }
