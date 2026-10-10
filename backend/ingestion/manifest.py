"""
Verion AI - Ingestion Manifest & Clearance Gating Store
Maintains the cryptographic ledger of ingested evidence and enforces pre-retrieval access control.
"""
from pathlib import Path
from typing import List, Dict, Any, Optional

from backend.ingestion.chunker import process_file_into_chunks

class IngestionManifestStore:
    def __init__(self):
        self.files: Dict[str, Dict[str, Any]] = {}
        self.all_chunks: List[Dict[str, Any]] = []

    def ingest_file(
        self,
        filepath: Path,
        classification_level: str,
        ingested_by: str = "officer_lead"
    ) -> Dict[str, Any]:
        """Processes and registers a file into the manifest."""
        processed = process_file_into_chunks(filepath, classification_level, ingested_by)
        self.files[filepath.name] = {
            "filename": processed["filename"],
            "extension": processed["extension"],
            "size_bytes": processed["size_bytes"],
            "file_sha256": processed["file_sha256"],
            "classification": processed["classification"],
            "ingested_by": processed["ingested_by"],
            "chunk_count": processed["chunk_count"]
        }
        
        # Remove any prior chunks from this file to support re-ingestion
        self.all_chunks = [c for c in self.all_chunks if c["source_file"] != filepath.name]
        self.all_chunks.extend(processed["chunks"])
        
        return self.files[filepath.name]

    def get_manifest_summary(self) -> Dict[str, Any]:
        """Returns high-level statistics for the ingestion hub."""
        return {
            "total_files": len(self.files),
            "total_chunks": len(self.all_chunks),
            "files": list(self.files.values()),
            "level1_chunks_count": len([c for c in self.all_chunks if c["classification"] == "LEVEL_1"]),
            "level2_chunks_count": len([c for c in self.all_chunks if c["classification"] == "LEVEL_2"])
        }

    def get_chunks_for_clearance(self, user_clearance: str) -> List[Dict[str, Any]]:
        """
        DETERMINISTIC PRE-RETRIEVAL SECURITY GATE:
        If user_clearance is LEVEL_1, LEVEL_2 chunks are physically excluded.
        The caller never receives restricted chunks.
        """
        if user_clearance == "LEVEL_1":
            return [c for c in self.all_chunks if c["classification"] == "LEVEL_1"]
        return list(self.all_chunks)

    def load_benchmark_dataset(self, ingested_by: str = "officer_lead") -> Dict[str, Any]:
        """Loads and seals the 3 benchmark case files with explicit classification tagging."""
        benchmark_dir = Path(__file__).resolve().parent.parent.parent / "data" / "benchmark_case"
        
        mapping = [
            ("incident_report.pdf", "LEVEL_1"),
            ("witness_interview.txt", "LEVEL_1"),
            ("auth_firewall.log", "LEVEL_2")
        ]
        
        ingested = []
        for filename, clearance in mapping:
            path = benchmark_dir / filename
            if path.exists():
                res = self.ingest_file(path, classification_level=clearance, ingested_by=ingested_by)
                ingested.append(res)
                
        return {
            "status": "success",
            "message": "Benchmark dataset ingested and cryptographically stamped.",
            "ingested_files": ingested,
            "manifest_summary": self.get_manifest_summary()
        }

# Global singleton manifest store
manifest_store = IngestionManifestStore()
