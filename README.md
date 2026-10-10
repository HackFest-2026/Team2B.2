# Verion AI

> **From Fragmented Evidence to One Verifiable Document**  
> *KLE Tech Hackfest 2026 — Problem 2B: Multi-Source Ingestion into a Single Verifiable Document*  
> **Repository:** [https://github.com/KartikShivshetty/VerionAI.git](https://github.com/KartikShivshetty/VerionAI.git)

---

## 🎯 Executive Summary & Mission
In incident investigations (cyber breaches, audit disputes, compliance violations), evidence is scattered across incompatible formats: **scanned PDF forms**, **witness interview transcripts**, and **machine syslogs**. 

Conventional LLM systems fail because they hallucinate, cannot prove sources, and lack role-based classification boundaries (risking data spillage).

**Verion AI** is a **100% on-prem, local-first investigation intelligence engine** that:
1. Normalizes heterogeneous evidence and seals each chunk with **SHA-256 cryptographic hashes**.
2. Enforces **zero data spillage by design** through pre-retrieval clearance filtering.
3. Cross-examines witness testimony against immutable syslogs to **detect and flag contradictions**.
4. Produces a single, verifiable investigation dossier where **100% of claims are anchored to traceable source citations**.

---

## 🛡️ Core Security Architecture & Roles

| Role | Username | Password | Clearance | Permissions |
|---|---|---|---|---|
| **Evidence Custodian & Lead Officer** | `officer_lead` | `Verion2026!` | `LEVEL_2` | Full upload access, explicit classification tagging, manifest signing, full dossier |
| **Senior Forensic Investigator** | `investigator_l2` | `Investigate2026!` | `LEVEL_2` | Full unredacted evidence inspection, raw machine syslogs, conflict radar |
| **Public Compliance Auditor** | `auditor_l1` | `Audit2026!` | `LEVEL_1` | Sanitized public dossier view; Level 2 evidence and citations are cryptographically masked (zero spillage) |

---

## 🚀 Incremental Phase Log

### 📦 Phase 1: Foundations, 3-Tier Authentication & Ground Truth Benchmark
* **Status:** ✅ **COMPLETED & TEST VERIFIED**
* **Tools & Stack Used:**
  * **Backend:** Python 3.14, FastAPI 0.143, Uvicorn, Pydantic, PyMuPDF (fitz), HMAC-SHA256, Pytest 9.1.1
  * **Frontend:** React 19, Vite 8.3, Tailwind CSS v4, Lucide Icons
  * **Design Directives:** Apple Design Principles (zero-latency press feedback, critically damped spring transitions, minimal light-mode enterprise palette)

#### What We Built in Phase 1:
1. **Authentic Token Authentication Engine:**
   * HMAC-SHA256 cryptographically signed bearer tokens.
   * Granular Role-Based Access Control (RBAC) supporting Officer, Investigator, and Auditor tiers.
   * One-click demo credential accelerators with password fail-safes.
2. **Ground Truth Benchmark Incident Package (`CASE-2026-ALPHA`):**
   * `data/benchmark_case/incident_report.pdf`: Official unclassified incident overview.
   * `data/benchmark_case/witness_interview.txt`: Transcript where witness claims they were offline at 21:00 UTC.
   * `data/benchmark_case/auth_firewall.log`: Classified Level 2 syslog recording SSH session from the witness identity at 21:14 UTC (intentional conflict planted).
3. **Forensic Enterprise Dashboard UI:**
   * Top bar with live clearance level preview switcher (`L1 Unclass` vs. `L2 Secret`).
   * Persistent modular sidebar with permission status cards.
   * Metric KPI cards (Sources Ingested, Zero Data Spillage Rate, Attribution Guarantee, Conflict Radar).
   * Live evidence registry displaying dynamic redaction when viewed under Level 1 clearance.

#### Phase 1 Verification Test Suite (`Test-1`):
The phase was validated using automated tests in `backend/tests/test_phase1_auth.py`:

```bash
$ python -m pytest backend/tests/test_phase1_auth.py -v
============================= test session starts =============================
platform win32 -- Python 3.14.7, pytest-9.1.1, pluggy-1.6.0
collected 7 items

backend/tests/test_phase1_auth.py::test_health_endpoint PASSED           [ 14%]
backend/tests/test_phase1_auth.py::test_login_officer_lead PASSED        [ 28%]
backend/tests/test_phase1_auth.py::test_login_investigator_l2 PASSED     [ 42%]
backend/tests/test_phase1_auth.py::test_login_auditor_l1 PASSED          [ 57%]
backend/tests/test_phase1_auth.py::test_login_invalid_credentials PASSED [ 71%]
backend/tests/test_phase1_auth.py::test_auth_me_with_valid_and_invalid_tokens PASSED [ 85%]
backend/tests/test_phase1_auth.py::test_benchmark_files_existence_and_integrity PASSED [100%]

======================== 7 passed in 3.00s =========================
```

---

### 📦 Phase 2: Multi-Source Ingestion, SHA-256 Provenance & Liquid-Glass UI
* **Status:** ✅ **COMPLETED & TEST VERIFIED**
* **Tools & Stack Used:**
  * **Ingestion Parsers:** PyMuPDF (`pymupdf`), Python Regex Normalizers, Python Standard `hashlib` (FIPS 180-4 SHA-256)
  * **Security Gating:** Pre-Retrieval Clearance Filtering Engine (`backend/ingestion/manifest.py`)
  * **Frontend UI:** React 19, Lucide Icons, `@tailwindcss/vite`, Custom `LiquidGlass` React component adapted from `liquid-glass-react` (specular mouse-tracking sheen, chromatic highlights, and Apple spring press states)

#### What We Built in Phase 2:
1. **Multi-Source Ingestion Parsers (`backend/ingestion/`):**
   * `pdf_parser.py`: PyMuPDF layout-aware block extraction preserving page numbers, bounding boxes, and paragraphs.
   * `log_parser.py`: Structured syslog normalizer parsing timestamps, IPs, hostnames, and exact line numbers.
   * `chat_parser.py`: Witness interview parser extracting speaker labels, timestamps, and statements.
2. **Cryptographic Chunking & Fingerprinting Engine (`chunker.py`):**
   * Normalizes heterogeneous inputs into discrete verifiable passages.
   * Calculates immutable 64-character SHA-256 hashes for every chunk: `sha256(file_hash + chunk_id + text)`.
   * Stretches provenance passports with file name, page, line number, time anchor, and clearance level.
3. **Pre-Retrieval Zero-Spillage Manifest Store (`manifest.py`):**
   * Enforces **Security Rule 2**: When a Level 1 session queries chunks, Level 2 records are filtered out *before* delivery, mathematically preventing data spillage.
4. **Liquid-Glass Evidence Ingestion Hub (`frontend/src/components/IngestionView.jsx`):**
   * Evidence upload terminal with explicit security classification prompts (`🟢 UNCLASSIFIED (L1)` vs `🔴 CLASSIFIED (L2)`).
   * 1-Click "Re-Ingest Benchmark Case" accelerator.
   * Normalized Chunk Ledger with live filtering by active clearance level and source type.
   * `LiquidGlass` component providing translucent sheen and Apple Design press feedback.

#### Phase 2 Verification Test Suite (`Test-2`):
Validated via `python -m pytest backend/tests/test_phase2_ingestion.py -v`:

```bash
$ python -m pytest backend/tests/ -v
============================= test session starts =============================
platform win32 -- Python 3.14.7, pytest-9.1.1, pluggy-1.6.0
collected 14 items

backend/tests/test_phase1_auth.py::test_health_endpoint PASSED           [  7%]
backend/tests/test_phase1_auth.py::test_login_officer_lead PASSED        [ 14%]
backend/tests/test_phase1_auth.py::test_login_investigator_l2 PASSED     [ 21%]
backend/tests/test_phase1_auth.py::test_login_auditor_l1 PASSED          [ 28%]
backend/tests/test_phase1_auth.py::test_login_invalid_credentials PASSED [ 35%]
backend/tests/test_phase1_auth.py::test_auth_me_with_valid_and_invalid_tokens PASSED [ 42%]
backend/tests/test_phase1_auth.py::test_benchmark_files_existence_and_integrity PASSED [ 50%]
backend/tests/test_phase2_ingestion.py::test_pdf_parser_extraction PASSED [ 57%]
backend/tests/test_phase2_ingestion.py::test_log_parser_extraction PASSED [ 64%]
backend/tests/test_phase2_ingestion.py::test_transcript_parser_extraction PASSED [ 71%]
backend/tests/test_phase2_ingestion.py::test_sha256_cryptographic_fingerprinting PASSED [ 78%]
backend/tests/test_phase2_ingestion.py::test_pre_retrieval_clearance_zero_spillage PASSED [ 85%]
backend/tests/test_phase2_ingestion.py::test_level2_investigator_receives_all_chunks PASSED [ 92%]
backend/tests/test_phase2_ingestion.py::test_upload_role_authorization_enforced PASSED [100%]

======================= 14 passed in 0.49s =======================
```

---

## 🛠️ How to Run Locally

### 1. Backend (FastAPI)
```bash
# From workspace root
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
Dashboard: `http://localhost:5173`

### 3. Run Automated Verification Tests
```bash
python -m pytest backend/tests/ -v
```

---

## 🗺️ Next Steps
* **Phase 3:** Local Ollama AI Engine, Zero-Spillage Pre-Retrieval Gating, and Conflict Radar.
* **Phase 4:** Apple-Design Investigation Workspace with Clickable Citation Anchors.
* **Phase 5:** Verified PDF Dossier Export & Live Benchmark KPI Evaluation Screen.
