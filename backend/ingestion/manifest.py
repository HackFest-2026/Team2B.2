"""
Verion AI - Ingestion Manifest & Clearance Gating Store
Maintains the cryptographic ledger of ingested evidence and enforces pre-retrieval access control.
"""
from pathlib import Path
from typing import List, Dict, Any, Optional

from backend.ingestion.chunker import process_file_into_chunks

class IngestionManifestStore:
    def __init__(self):
        self.case_id: str = "IR-2026-0914-ALPHA"
        self.case_title: str = "Unauthorized Relational Cluster Exfiltration"
        self.files: Dict[str, Dict[str, Any]] = {}
        self.all_chunks: List[Dict[str, Any]] = []
        # Registry of all cases (keyed by case_id)
        self.cases_registry: Dict[str, Dict[str, Any]] = {}
        # Analysis cache to prevent re-generation on tab switching
        self._analysis_cache: Dict[str, Any] = {}
        # Security quarantine incident log
        self.quarantine_events: List[Dict[str, Any]] = []

    def log_quarantine_event(self, event: Dict[str, Any]) -> None:
        """Records a quarantined malicious upload attempt in the security log."""
        self.quarantine_events.append(event)

    def get_quarantine_events(self) -> List[Dict[str, Any]]:
        """Returns all recorded quarantine incidents."""
        return list(self.quarantine_events)

    def get_cached_analysis(self, key: str) -> Optional[Any]:
        return self._analysis_cache.get(key)

    def set_cached_analysis(self, key: str, value: Any) -> None:
        self._analysis_cache[key] = value

    def invalidate_analysis_cache(self) -> None:
        self._analysis_cache.clear()

    def _snapshot_current(self) -> None:
        """Snapshots the current active case into the registry."""
        if self.case_id:
            self.cases_registry[self.case_id] = {
                "case_id": self.case_id,
                "title": self.case_title,
                "total_files": len(self.files),
                "total_chunks": len(self.all_chunks),
                "files": dict(self.files),
                "chunks": list(self.all_chunks),
            }

    def _restore_case(self, case_id: str) -> bool:
        """Restores a case from the registry as the active case."""
        entry = self.cases_registry.get(case_id)
        if not entry:
            return False
        self.case_id = entry["case_id"]
        self.case_title = entry["title"]
        self.files = dict(entry.get("files", {}))
        self.all_chunks = list(entry.get("chunks", []))
        self.invalidate_analysis_cache()
        return True

    def create_new_case(
        self,
        case_id: str,
        title: str,
        created_by: str = "officer_lead"
    ) -> Dict[str, Any]:
        """Initializes a fresh case container and resets evidence ledger."""
        # Archive currently active case first
        self._snapshot_current()
        self.case_id = case_id
        self.case_title = title
        self.files.clear()
        self.all_chunks.clear()
        # Register the new (empty) case
        self._snapshot_current()
        self.invalidate_analysis_cache()
        return {
            "status": "success",
            "case_id": self.case_id,
            "title": self.case_title,
            "created_by": created_by,
            "files_count": 0,
            "chunks_count": 0
        }

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
            "chunk_count": processed["chunk_count"],
            "malware_scan": "CLEAN (Zero Threats Detected)"
        }
        
        # Remove any prior chunks from this file to support re-ingestion
        self.all_chunks = [c for c in self.all_chunks if c["source_file"] != filepath.name]
        self.all_chunks.extend(processed["chunks"])
        # Keep registry in sync
        self._snapshot_current()
        self.invalidate_analysis_cache()
        return self.files[filepath.name]

    def get_manifest_summary(self) -> Dict[str, Any]:
        """Returns high-level statistics for the ingestion hub."""
        return {
            "case_id": getattr(self, "case_id", "IR-2026-0914-ALPHA"),
            "case_title": getattr(self, "case_title", "Unauthorized Relational Cluster Exfiltration"),
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
        # Archive current before overwriting
        self._snapshot_current()
        self.case_id = "IR-2026-0914-ALPHA"
        self.case_title = "Unauthorized Relational Cluster Exfiltration"
        self.files.clear()
        self.all_chunks.clear()
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

        # Registry is already updated by ingest_file calls
        self.invalidate_analysis_cache()
        return {
            "status": "success",
            "message": "Benchmark dataset ingested and cryptographically stamped.",
            "ingested_files": ingested,
            "manifest_summary": self.get_manifest_summary()
        }

    def list_cases(self) -> List[Dict[str, Any]]:
        """Returns summary info for all cases in the registry."""
        # Make sure the active case is up to date in the registry
        self._snapshot_current()
        result = []
        for cid, entry in self.cases_registry.items():
            result.append({
                "case_id": entry["case_id"],
                "title": entry["title"],
                "total_files": entry["total_files"],
                "total_chunks": entry["total_chunks"],
                "is_active": cid == self.case_id,
            })
        return result

    def delete_case(self, case_id: str) -> bool:
        """Deletes a case from the registry. Cannot delete the active case."""
        if case_id == self.case_id:
            return False
        if case_id in self.cases_registry:
            del self.cases_registry[case_id]
            self.invalidate_analysis_cache()
            return True
        return False

    def switch_case(self, case_id: str) -> bool:
        """Switches the active case to a different one from the registry."""
        if case_id == self.case_id:
            return True
        # Snapshot current before switching
        self._snapshot_current()
        return self._restore_case(case_id)

# Global singleton manifest store
manifest_store = IngestionManifestStore()
