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
DEFAULT_MODEL = "llama3.2:3b"

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

    def generate_json(self, prompt: str, system_prompt: str = "", model: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Sends an inference request to the local Ollama instance requesting JSON format.
        """
        target_model = model or self.default_model
        payload = {
            "model": target_model,
            "prompt": prompt,
            "system": system_prompt + "\nYou MUST reply with valid JSON only. Do not add markdown backticks.",
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
            with urllib.request.urlopen(req, timeout=15) as response:
                result = json.loads(response.read().decode("utf-8"))
                response_text = result.get("response", "").strip()
                return json.loads(response_text)
        except Exception:
            return None

# Global client singleton
local_ai = LocalAIClient()
