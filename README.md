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

## 🛠️ How to Run Locally

### 1. Backend (FastAPI)
```bash
# From workspace root
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: `http://127.0.0.1:8000/docs`

### 2. Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
Dashboard will be available at: `http://localhost:5173`

### 3. Run Verification Tests
```bash
python -m pytest backend/tests/test_phase1_auth.py -v
```

---

## 🗺️ Next Steps
* **Phase 2:** Multi-Source Ingestion Engine, PDF/Log Parsers, and SHA-256 Chunk Hash Stamping.
* **Phase 3:** Local Ollama AI Engine, Zero-Spillage Pre-Retrieval Gating, and Conflict Radar.
* **Phase 4:** Apple-Design Investigation Workspace with Clickable Citation Anchors.
* **Phase 5:** Verified PDF Dossier Export & Live Benchmark KPI Evaluation Screen.
