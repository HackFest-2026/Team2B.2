"""
Verion AI - Transcript & Chat Ingestion Parser
Parses dialogue, interviews, and chat streams into structured speaker statements.
"""
import re
from pathlib import Path
from typing import List, Dict, Any

STATEMENT_REGEX = re.compile(r"^\[(\d{2}:\d{2}:\d{2})\]\s+([A-Z\s]+?):\s+(.*)$")

def parse_transcript_file(filepath: Path) -> List[Dict[str, Any]]:
    """
    Parses conversational transcript or witness interview files.
    """
    if not filepath.exists():
        raise FileNotFoundError(f"Transcript file not found: {filepath}")

    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()

    statements = []
    for line_idx, raw_line in enumerate(lines, start=1):
        line = raw_line.strip()
        if not line or line.startswith("=") or line.startswith("#"):
            continue

        match = STATEMENT_REGEX.match(line)
        if match:
            time_anchor, speaker, utterance = match.groups()
            statements.append({
                "source_file": filepath.name,
                "source_type": "TRANSCRIPT",
                "line_number": line_idx,
                "time_anchor": time_anchor,
                "speaker": speaker.strip(),
                "text": utterance.strip(),
                "char_count": len(utterance.strip())
            })
        else:
            # General text line in transcript
            statements.append({
                "source_file": filepath.name,
                "source_type": "TRANSCRIPT",
                "line_number": line_idx,
                "time_anchor": None,
                "speaker": "HEADER/METADATA",
                "text": line,
                "char_count": len(line)
            })

    return statements
