"""
Verion AI - System Log Ingestion Parser
Converts raw log streams (Syslog, Auth, Kernel) into structured events with line numbers.
"""
import re
from pathlib import Path
from typing import List, Dict, Any

TIMESTAMP_REGEX = re.compile(r"(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)")
IP_REGEX = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")

def parse_log_file(filepath: Path) -> List[Dict[str, Any]]:
    """
    Parses a log file line by line into structured entries with exact line numbers.
    """
    if not filepath.exists():
        raise FileNotFoundError(f"Log file not found: {filepath}")

    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()

    entries = []
    for line_idx, raw_line in enumerate(lines, start=1):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        # Extract timestamp if present
        ts_match = TIMESTAMP_REGEX.search(line)
        timestamp = ts_match.group(1) if ts_match else None

        # Extract IP addresses
        ips = IP_REGEX.findall(line)

        entries.append({
            "source_file": filepath.name,
            "source_type": "SYSLOG",
            "line_number": line_idx,
            "timestamp": timestamp,
            "ips_found": ips,
            "text": line,
            "char_count": len(line)
        })

    return entries
