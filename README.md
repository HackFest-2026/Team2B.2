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

### 📦 Phase 3: AI Intelligence, Conflict Radar & Chronological Reconciliation
* **Status:** ✅ **COMPLETED & TEST VERIFIED**
* **Tools & Stack Used:**
  * **AI & NLP Engines:** Local Ollama Client (`backend/ai/ollama_client.py`), Entity Resolution Parser (`entity_extractor.py`), Chronological Sequencing Engine (`timeline_builder.py`), NLI Contradiction Detector (`conflict_detector.py`)
  * **Hardware Optimization:** Engineered for NVIDIA RTX 5050 (8GB VRAM) and Intel i5-13450HX running `llama3.2:3b` / `mistral:7b` locally in-VRAM with zero offload latency.
  * **Frontend UI:** `WorkspaceView.jsx` (Unified Timeline & Entity Matrix) and `ConflictRadarView.jsx` (Side-by-side contradiction comparator with Apple-Design Liquid Glass styling)

#### What We Built in Phase 3:
1. **Cross-Source Entity Resolution (`backend/ai/entity_extractor.py`):**
   * Resolves actors (`Alice Chen`, `Agent Marcus Vance`), linked accounts (`alice_admin`), systems (`db-primary.internal`, `gw-datacenter-01`), and network IPs across all sources.
   * Enforces dynamic clearance masking: internal `10.x.x.x` addresses are masked with `[REDACTED - LEVEL 2]` for Level 1 compliance callers.
2. **Unified Chronological Timeline Builder (`timeline_builder.py`):**
   * Merges extracted actions across PDFs, witness transcripts, and syslogs into an authoritative chronological order (20:30 UTC through 22:30 UTC).
   * Flags events involved in contradictions as highlighted conflict anchors.
3. **Cross-Source Conflict Radar (`conflict_detector.py`):**
   * Automatically cross-examines human statements against machine syslogs.
   * **Contradiction #1:** Witness stated complete logoff and VPN disconnection at 21:00 UTC, directly contradicted by gateway keepalive at 21:00:00 UTC and an SSH session opened from her credentials at 21:14:22 UTC.
   * **Contradiction #2:** Witness denied database access, directly contradicted by PostgreSQL audit log recording `SELECT pg_dump_table` on `confidential.customers_pii` at 21:18:40 UTC.
   * Formulates forensic verdicts and actionable investigator directives.
4. **Interactive UI Views (`WorkspaceView.jsx` & `ConflictRadarView.jsx`):**
   * Side-by-side claim comparator cards with exact source quotes, time anchors, and SHA-256 chunk seals.
   * Filterable chronological timeline with status badges.

#### Phase 3 Verification Test Suite (`Test-3`):
Validated via `python -m pytest backend/tests/ -v`:

```bash
$ python -m pytest backend/tests/ -v
============================= test session starts =============================
platform win32 -- Python 3.14.7, pytest-9.1.1, pluggy-1.6.0
collected 20 items

backend/tests/test_phase1_auth.py::test_health_endpoint PASSED           [  5%]
backend/tests/test_phase1_auth.py::test_login_officer_lead PASSED        [ 10%]
backend/tests/test_phase1_auth.py::test_login_investigator_l2 PASSED     [ 15%]
backend/tests/test_phase1_auth.py::test_login_auditor_l1 PASSED          [ 20%]
backend/tests/test_phase1_auth.py::test_login_invalid_credentials PASSED [ 25%]
backend/tests/test_phase1_auth.py::test_auth_me_with_valid_and_invalid_tokens PASSED [ 30%]
backend/tests/test_phase1_auth.py::test_benchmark_files_existence_and_integrity PASSED [ 35%]
backend/tests/test_phase2_ingestion.py::test_pdf_parser_extraction PASSED [ 40%]
backend/tests/test_phase2_ingestion.py::test_log_parser_extraction PASSED [ 45%]
backend/tests/test_phase2_ingestion.py::test_transcript_parser_extraction PASSED [ 50%]
backend/tests/test_phase2_ingestion.py::test_sha256_cryptographic_fingerprinting PASSED [ 55%]
backend/tests/test_phase2_ingestion.py::test_pre_retrieval_clearance_zero_spillage PASSED [ 60%]
backend/tests/test_phase2_ingestion.py::test_level2_investigator_receives_all_chunks PASSED [ 65%]
backend/tests/test_phase2_ingestion.py::test_upload_role_authorization_enforced PASSED [ 70%]
backend/tests/test_phase3_intelligence.py::test_entity_extraction_resolution PASSED [ 75%]
backend/tests/test_phase3_intelligence.py::test_unified_timeline_chronology PASSED [ 80%]
backend/tests/test_phase3_intelligence.py::test_conflict_radar_detection PASSED [ 85%]
backend/tests/test_phase3_intelligence.py::test_conflict_provenance_cryptographic_anchors PASSED [ 90%]
backend/tests/test_phase3_intelligence.py::test_zero_spillage_on_conflicts_and_entities PASSED [ 95%]
backend/tests/test_phase3_intelligence.py::test_analysis_run_api_endpoint PASSED [100%]

======================= 20 passed in 0.52s =======================
```

---

### 📦 Phase 4: Single Verifiable Document / Synthesized Dossier & Interactive Citation Anchors
* **Status:** ✅ **COMPLETED & TEST VERIFIED**
* **Tools & Stack Used:**
  * **Synthesis Engine:** Grounded Narrative Synthesizer (`backend/ai/synthesizer.py`), Cryptographic SHA-256 Hashing, Zero-Spillage Dynamic Masking
  * **API Endpoints:** FastAPI `GET /api/analysis/dossier` with optional `simulate_clearance` parameter
  * **Frontend UI:** `DossierView.jsx`, Apple Design Principles (publication typography, slide-over evidence inspector sheet, tactile interactive citation pills, 1-click hash copy, Liquid Glass cards)
  * **Automated Tests:** `backend/tests/test_phase4_dossier.py` (5 comprehensive tests, total test count: 25)

#### What We Built in Phase 4:
1. **Single Verifiable Document Synthesizer (`backend/ai/synthesizer.py`):**
   * Reconciles all 3 heterogeneous sources into one unified forensic incident narrative across 4 key sections:
     * **1. Executive Summary & Incident Overview:** Anomaly detection, witness departure claim, and confirmed machine persistence.
     * **2. Chronological Play-by-Play Reconstruction:** Strict timestamped sequence of events with interactive evidence anchors.
     * **3. Reconciled Contradiction Analysis:** Explaining the core divergence between claimed 21:00 UTC logoff and deterministic machine logs at 21:14 UTC.
     * **4. Technical Forensic Assessment & Actionable Remediation:** Mandatory key rotations, network isolation, and FIDO2 MFA enforcement.
   * Calculates a tamper-evident **Master Dossier SHA-256 Seal** across all sections.
2. **Interactive Cryptographic Citation Anchors:**
   * Every factual claim in the narrative is embedded with citation pills (`[Ref 01]` through `[Ref 08]`).
   * Each citation links mathematically to:
     * Source document name & source type (`PDF`, `TRANSCRIPT`, `SYSLOG`).
     * Exact locator (`Page 1, Paragraph 1`, `Line 42`, etc.).
     * Originating speaker / author / system daemon.
     * Raw text excerpt from the ingested chunk.
     * Verified 64-character SHA-256 hash stamp.
     * Clearance classification level (`LEVEL_1` or `LEVEL_2`).
3. **Zero Data Spillage RBAC Enforcement (Security Rule 2):**
   * When queried under `LEVEL_1` (Public Compliance Auditor), internal IP addresses (`10.240.1.45`) and classified database queries are dynamically redacted to `[REDACTED - LEVEL 2]` across the narrative and citation excerpts.
   * When queried under `LEVEL_2` (Investigator / Lead Officer), full technical evidence is unmasked.
4. **Apple-Design Dossier Interface (`frontend/src/components/DossierView.jsx`):**
   * Publication-grade typographical layout with subtle Liquid Glass materials and hairline framing.
   * **Slide-over Evidence Inspector Sheet:** Clicking any `[Ref XX]` pill smoothly transitions an inspector sheet from the right, displaying raw source excerpts, 1-click SHA-256 copy, and cryptographic ledger verification status.
   * Action toolbar with "Verify Hashes" and "Copy Dossier" features.
   * Comprehensive Cryptographic Citation Ledger table at the bottom of the dossier.

#### Phase 4 Verification Test Suite (`Test-4`):
Validated via `python -m pytest backend/tests/test_phase4_dossier.py -v`:

```bash
$ python -m pytest backend/tests/ -v
============================= test session starts =============================
platform win32 -- Python 3.14.7, pytest-9.1.1, pluggy-1.6.0
collected 25 items

backend/tests/test_phase1_auth.py::test_health_endpoint PASSED           [  4%]
backend/tests/test_phase1_auth.py::test_login_officer_lead PASSED        [  8%]
backend/tests/test_phase1_auth.py::test_login_investigator_l2 PASSED     [ 12%]
backend/tests/test_phase1_auth.py::test_login_auditor_l1 PASSED          [ 16%]
backend/tests/test_phase1_auth.py::test_login_invalid_credentials PASSED [ 20%]
backend/tests/test_phase1_auth.py::test_auth_me_with_valid_and_invalid_tokens PASSED [ 24%]
backend/tests/test_phase1_auth.py::test_benchmark_files_existence_and_integrity PASSED [ 28%]
backend/tests/test_phase2_ingestion.py::test_pdf_parser_extraction PASSED [ 32%]
backend/tests/test_phase2_ingestion.py::test_log_parser_extraction PASSED [ 36%]
backend/tests/test_phase2_ingestion.py::test_transcript_parser_extraction PASSED [ 40%]
backend/tests/test_phase2_ingestion.py::test_sha256_cryptographic_fingerprinting PASSED [ 44%]
backend/tests/test_phase2_ingestion.py::test_pre_retrieval_clearance_zero_spillage PASSED [ 48%]
backend/tests/test_phase2_ingestion.py::test_level2_investigator_receives_all_chunks PASSED [ 52%]
backend/tests/test_phase2_ingestion.py::test_upload_role_authorization_enforced PASSED [ 56%]
backend/tests/test_phase3_intelligence.py::test_entity_extraction_resolution PASSED [ 60%]
backend/tests/test_phase3_intelligence.py::test_unified_timeline_chronology PASSED [ 64%]
backend/tests/test_phase3_intelligence.py::test_conflict_radar_detection PASSED [ 68%]
backend/tests/test_phase3_intelligence.py::test_conflict_provenance_cryptographic_anchors PASSED [ 72%]
backend/tests/test_phase3_intelligence.py::test_zero_spillage_on_conflicts_and_entities PASSED [ 76%]
backend/tests/test_phase3_intelligence.py::test_analysis_run_api_endpoint PASSED [ 80%]
backend/tests/test_phase4_dossier.py::test_dossier_structure_and_sections PASSED [ 84%]
backend/tests/test_phase4_dossier.py::test_citations_cryptographic_integrity PASSED [ 88%]
backend/tests/test_phase4_dossier.py::test_zero_data_spillage_clearance_gating PASSED [ 92%]
backend/tests/test_phase4_dossier.py::test_dossier_sha256_tamper_evidence PASSED [ 96%]
backend/tests/test_phase4_dossier.py::test_api_dossier_endpoints PASSED  [100%]

======================= 25 passed in 0.63s ========================
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

### 📦 Phase 5: Verified Cryptographic PDF Report Export, Provenance Ledger & Hackathon Evaluation Benchmark
* **Status:** ✅ **COMPLETED & TEST VERIFIED (30/30 Tests Passing)**
* **Tools & Stack Used:**
  * **PDF Generation Engine:** PyMuPDF (`pymupdf` 1.28.2) native vector engine, deterministic layout, cryptographic SHA-256 seal stamp, multi-page pagination
  * **Cryptographic Ledger & Export:** FastAPI `GET /api/export/pdf`, `GET /api/export/provenance-ledger`, `GET /api/benchmark/kpis`
  * **Frontend UI:** `AuditView.jsx`, Liquid Glass 2-tier elevation, Hero KPI Scorecard (Attribution, Zero Spillage, Ledger Provenance, Contradiction Recall), 1-click PDF download & JSON ledger export, live self-audit runner, boundary resilience cards, searchable cryptographic ledger table
  * **Automated Tests:** `backend/tests/test_phase5_export.py` (5 comprehensive tests, total test count across all phases: 30)

#### What We Built in Phase 5:
1. **Cryptographic PDF Report Generator (`backend/export/pdf_generator.py`):**
   * Generates a tamper-evident, court-admissible multi-page PDF document completely on-prem.
   * Embeds official classification banner (`RESTRICTED // LEVEL 2` or `CONFIDENTIAL // LEVEL 1 AUDITOR SANITIZED`).
   * Displays the **Master Dossier SHA-256 Seal** in an immutable verification block.
   * Includes all 4 synthesized narrative sections with high-contrast technical typography.
   * Appends an official **Cryptographic Evidence Citation Registry Table** with Ref ID, source file, locator, clearance, and 64-character SHA-256 hash digests.
   * Includes digital signature footer on every page: *"Digitally Sealed by Verion AI Cryptographic Provenance Ledger • Tamper Evident"*.
2. **Zero Data Spillage Enforcement in Exported PDF Binaries:**
   * When exported under `LEVEL_1` (Public Compliance Auditor), internal IP addresses (`10.240.1.45`) and classified queries (`SELECT pg_dump_table`) are masked in the generated binary stream with `[REDACTED - LEVEL 2]`.
   * Mathematically verified that no classified byte strings leak into the Auditor's PDF.
3. **Immutable Provenance Ledger Export (`/api/export/provenance-ledger`):**
   * Exports the complete cryptographic audit ledger JSON (all 39 chunks with SHA-256 hashes, file metadata, time anchors, and clearance classifications) for external SIEM or blockchain anchoring.
4. **Hackathon Evaluation Benchmark Screen (`AuditView.jsx`):**
   * **Hero Problem (2B) Scorecard:**
     * **Attribution Accuracy:** `100.0%` (100% of narrative claims anchored to immutable citations).
     * **Zero Data Spillage:** `0.00%` (Pre-retrieval clearance filter excludes classified IPs & queries).
     * **Ledger Provenance:** `100.0%` (All 39 chunks verified with SHA-256 seals).
     * **Contradiction Recall:** `100.0%` (2/2 planted cross-source contradictions detected and flagged).
   * **Failure Boundary & Edge-Case Resilience:**
     * `RESIL-01`: Corrupted / Malformed Document Recovery (PASSED).
     * `RESIL-02`: Clearance Escalation Boundary Defense (PASSED).
     * `RESIL-03`: Offline / Air-Gapped Fallback Reliability (PASSED).
   * **Interactive Ledger Browser:** Filter by source type (`.pdf`, `.txt`, `.log`), 1-click SHA-256 hash copy, and real-time validation badges.
   * **Direct 1-Click Downloads:** Download official PDF dossier and raw JSON ledger with active clearance applied.

#### Phase 5 Verification Test Suite (`Test-5`):
Validated via `python -m pytest backend/tests/test_phase5_export.py -v`:

```bash
$ python -m pytest backend/tests/ -v
============================= test session starts =============================
platform win32 -- Python 3.14.7, pytest-9.1.1, pluggy-1.6.0
collected 30 items

backend/tests/test_phase1_auth.py::test_health_endpoint PASSED           [  3%]
backend/tests/test_phase1_auth.py::test_login_officer_lead PASSED        [  6%]
backend/tests/test_phase1_auth.py::test_login_investigator_l2 PASSED     [ 10%]
backend/tests/test_phase1_auth.py::test_login_auditor_l1 PASSED          [ 13%]
backend/tests/test_phase1_auth.py::test_login_invalid_credentials PASSED [ 16%]
backend/tests/test_phase1_auth.py::test_auth_me_with_valid_and_invalid_tokens PASSED [ 20%]
backend/tests/test_phase1_auth.py::test_benchmark_files_existence_and_integrity PASSED [ 23%]
backend/tests/test_phase2_ingestion.py::test_pdf_parser_extraction PASSED [ 26%]
backend/tests/test_phase2_ingestion.py::test_log_parser_extraction PASSED [ 30%]
backend/tests/test_phase2_ingestion.py::test_transcript_parser_extraction PASSED [ 33%]
backend/tests/test_phase2_ingestion.py::test_sha256_cryptographic_fingerprinting PASSED [ 36%]
backend/tests/test_phase2_ingestion.py::test_pre_retrieval_clearance_zero_spillage PASSED [ 40%]
backend/tests/test_phase2_ingestion.py::test_level2_investigator_receives_all_chunks PASSED [ 43%]
backend/tests/test_phase2_ingestion.py::test_upload_role_authorization_enforced PASSED [ 46%]
backend/tests/test_phase3_intelligence.py::test_entity_extraction_resolution PASSED [ 50%]
backend/tests/test_phase3_intelligence.py::test_unified_timeline_chronology PASSED [ 53%]
backend/tests/test_phase3_intelligence.py::test_conflict_radar_detection PASSED [ 56%]
backend/tests/test_phase3_intelligence.py::test_conflict_provenance_cryptographic_anchors PASSED [ 60%]
backend/tests/test_phase3_intelligence.py::test_zero_spillage_on_conflicts_and_entities PASSED [ 63%]
backend/tests/test_phase3_intelligence.py::test_analysis_run_api_endpoint PASSED [ 66%]
backend/tests/test_phase4_dossier.py::test_dossier_structure_and_sections PASSED [ 70%]
backend/tests/test_phase4_dossier.py::test_citations_cryptographic_integrity PASSED [ 73%]
backend/tests/test_phase4_dossier.py::test_zero_data_spillage_clearance_gating PASSED [ 76%]
backend/tests/test_phase4_dossier.py::test_dossier_sha256_tamper_evidence PASSED [ 80%]
backend/tests/test_phase4_dossier.py::test_api_dossier_endpoints PASSED  [ 83%]
backend/tests/test_phase5_export.py::test_pdf_export_generation_and_structure PASSED [ 86%]
backend/tests/test_phase5_export.py::test_pdf_export_zero_data_spillage PASSED [ 90%]
backend/tests/test_phase5_export.py::test_api_pdf_export_endpoint PASSED [ 93%]
backend/tests/test_phase5_export.py::test_api_provenance_ledger_export PASSED [ 96%]
backend/tests/test_phase5_export.py::test_api_benchmark_kpis PASSED      [100%]

======================= 30 passed in 0.90s ========================
```

---

## 🛠️ How to Run Locally

### 1. Backend (FastAPI)
```bash
# From workspace root
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
* API Documentation: `http://127.0.0.1:8000/docs`
* PDF Export: `GET http://127.0.0.1:8000/api/export/pdf`
* Provenance Ledger: `GET http://127.0.0.1:8000/api/export/provenance-ledger`
* Benchmark KPIs: `GET http://127.0.0.1:8000/api/benchmark/kpis`

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

## 🏆 Hackathon Deliverable Status
* **Problem Statement:** KLE Tech Hackfest 2026 — Problem 2B: Multi-Source Ingestion into a Single Verifiable Document
* **Phases Delivered:** All 5 of 5 Phases Complete & Cryptographically Verified
* **Local Inference:** 100% On-Prem (RTX 5050 8GB / Intel i5-13450HX ready, zero cloud dependence)
* **Test Pass Rate:** **30 / 30 Automated Tests Passing (100%)**

