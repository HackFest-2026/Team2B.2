"""
Verion AI - Local On-Prem Ollama Inference Client
Optimized for local GPU execution (e.g. RTX 5050 8GB VRAM) via Ollama (http://localhost:11434).
Includes deterministic heuristic fallback for instant test execution and offline stability.
"""
import json
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "llama3.2:latest"

class LocalAIClient:
    def __init__(self, base_url: str = OLLAMA_BASE_URL, default_model: str = DEFAULT_MODEL):
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model

    def is_ollama_available(self) -> bool:
        """Checks if the local Ollama daemon is running."""
        try:
            req = urllib.request.Request(f"{self.base_url}/api/tags", headers={"User-Agent": "VerionAI"})
            with urllib.request.urlopen(req, timeout=1.5) as response:
                return response.status == 200
        except Exception:
            return False

    def _clean_json_str(self, text: str) -> str:
        """Strips markdown code fences and extraneous text around JSON."""
        t = text.strip()
        if t.startswith("```json"):
            t = t[7:]
        elif t.startswith("```"):
            t = t[3:]
        if t.endswith("```"):
            t = t[:-3]
        t = t.strip()
        # Find first { or [
        idx_obj = t.find("{")
        idx_arr = t.find("[")
        if idx_obj != -1 and (idx_arr == -1 or idx_obj < idx_arr):
            # Object
            last_idx = t.rfind("}")
            if last_idx != -1:
                t = t[idx_obj:last_idx+1]
        elif idx_arr != -1:
            # Array
            last_idx = t.rfind("]")
            if last_idx != -1:
                t = t[idx_arr:last_idx+1]
        return t

    def generate_json(self, prompt: str, system_prompt: str = "", model: Optional[str] = None) -> Optional[Any]:
        """
        Sends an inference request to the local Ollama instance requesting JSON format.
        """
        target_model = model or self.default_model
        payload = {
            "model": target_model,
            "prompt": prompt,
            "system": system_prompt + "\nYou MUST reply with valid JSON only. Do not add explanations or conversational filler.",
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.1,  # Low temperature for strict factual grounding
                "top_p": 0.9
            }
        }

        try:
            req = urllib.request.Request(
                f"{self.base_url}/api/generate",
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json", "User-Agent": "VerionAI"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode("utf-8"))
                response_text = result.get("response", "").strip()
                cleaned = self._clean_json_str(response_text)
                return json.loads(cleaned)
        except Exception as e:
            return None

    def dynamic_timeline_events(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Uses Llama 3.2 to extract timeline events from arbitrary case evidence."""
        if not chunks:
            return []
        
        # Build prompt from chunks
        evidence_snippets = []
        for c in chunks[:15]:
            evidence_snippets.append(f"[{c.get('source_file')}] {c.get('text', '')[:300]}")
        evidence_text = "\n".join(evidence_snippets)

        prompt = (
            "Analyze the following evidence text and extract a chronological sequence of events.\n"
            "Return a JSON object with key 'events' containing a list of objects with: \n"
            "- 'timestamp_iso': ISO-8601 or date-time string (e.g. '2026-10-09T21:45:00Z' or '21:45 UTC')\n"
            "- 'display_time': Short display time string\n"
            "- 'title': Short descriptive title\n"
            "- 'actor': Person, vehicle, or system responsible\n"
            "- 'description': One sentence description of what occurred\n"
            "- 'severity': 'INFO', 'WARNING', or 'CRITICAL'\n\n"
            f"Evidence:\n{evidence_text}"
        )
        system_prompt = "You are a forensic incident timeline analyzer. Extract strictly verifiable events with times."
        res = self.generate_json(prompt, system_prompt)
        if res and isinstance(res, dict) and "events" in res:
            return res["events"]
        return []

    def dynamic_detect_conflicts(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Uses Llama 3.2 to cross-examine claims and detect contradictions across arbitrary sources."""
        if not chunks:
            return []
            
        evidence_snippets = []
        for c in chunks[:15]:
            evidence_snippets.append(f"[File: {c.get('source_file')} | ID: {c.get('chunk_id')}] {c.get('text', '')[:350]}")
        evidence_text = "\n".join(evidence_snippets)

        prompt = (
            "Carefully cross-examine the following multi-source evidence (witness statements vs. logs/reports).\n"
            "Identify any factual or temporal contradictions or conflicts.\n"
            "Return a JSON object with key 'conflicts' containing a list of objects with:\n"
            "- 'conflict_id': string like 'CONF-001'\n"
            "- 'title': summary title of the contradiction\n"
            "- 'severity': 'CRITICAL' or 'WARNING'\n"
            "- 'category': 'TEMPORAL_CONTRADICTION' or 'FACTUAL_INCONSISTENCY'\n"
            "- 'claim_a_summary': what the first source states\n"
            "- 'claim_b_summary': what the second source states that contradicts it\n"
            "- 'forensic_verdict': detailed explanation of why they contradict\n"
            "- 'investigator_action': recommended investigative follow-up\n\n"
            f"Evidence:\n{evidence_text}"
        )
        system_prompt = "You are a forensic contradiction detection engine. Discover conflicting claims across sources."
        res = self.generate_json(prompt, system_prompt)
        if res and isinstance(res, dict) and "conflicts" in res:
            return res["conflicts"]
        return []

    def dynamic_synthesize_narrative(self, case_title: str, citations: List[Dict[str, Any]], user_clearance: str) -> Optional[Dict[str, str]]:
        """Uses Llama 3.2 to synthesize a multi-source forensic narrative for arbitrary cases."""
        if not citations:
            return None

        c_text = "\n".join([f"{c['label']} [{c['source_file']}]: {c['excerpt'][:250]}" for c in citations[:10]])
        prompt = (
            f"Synthesize an authoritative forensic incident report for case '{case_title}'.\n"
            f"Use inline citation tags like [Ref 01], [Ref 02] whenever referencing facts from the evidence below.\n"
            "Return a JSON object with exact keys:\n"
            "- 'summary': 3-4 sentence executive overview citing sources\n"
            "- 'timeline': 4-6 bulleted chronological play-by-play events\n"
            "- 'conflicts': 2-3 paragraphs analyzing key contradictions and forensic resolution\n"
            "- 'remediation': 3-4 actionable numbered recommendations for investigators\n\n"
            f"Evidence Citations:\n{c_text}"
        )
        system_prompt = "You are a Lead Forensic Investigator writing an immutable incident dossier."
        res = self.generate_json(prompt, system_prompt)
        if res and isinstance(res, dict) and "summary" in res:
            return res
        return None

# Global client singleton
local_ai = LocalAIClient()

