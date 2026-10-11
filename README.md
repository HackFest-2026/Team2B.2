# VERION AI

> **Multi-Source Forensic Ingestion & Single Verifiable Document Engine**  
> **Problem Statement 2B**: Multi-Source Ingestion into a Single Verifiable Document  
> **Team**: Horizon Tech • **KLE Tech Hackfest 2026**  
> **Repository**: [https://github.com/KartikShivshetty/VerionAI.git](https://github.com/KartikShivshetty/VerionAI.git)

---

## 📌 Executive Overview

During incident investigations—whether cyberattacks, audit disputes, or criminal proceedings—evidence is fragmented across incompatible sources: **unstructured PDF reports**, **witness/suspect interview transcripts**, and **machine syslogs or sensor telemetry**. 

Conventional LLM systems fail in these high-stakes environments because they hallucinate, cannot prove sources, and lack strict clearance boundaries, risking catastrophic data spillage.

**VERION AI** solves this by establishing a **100% on-premise, local-first forensic intelligence system**:
1. **Multi-Source Normalization**: Ingests PDFs, chat/interview transcripts, and machine syslogs into cryptographically sealed chunk units.
2. **SHA-256 Cryptographic Provenance**: Every chunk receives an immutable FIPS 180-4 SHA-256 fingerprint bound to its source file hash and character span.
3. **Pre-Retrieval Zero-Spillage Security Gate**: Enforces physical separation between Level 1 (Unclassified/Public) and Level 2 (Restricted/Internal) records before data retrieval.
4. **Automated Conflict Radar**: Cross-examines witness testimony against immutable machine syslogs to expose temporal and factual contradictions without silently resolving them.
5. **Single Verifiable Document Synthesis**: Generates an authoritative incident dossier where 100% of factual assertions are anchored to interactive, mathematically verifiable citations (`[Ref 01]`, `[Ref 02]`).
6. **Local LLM Engine**: Powered by on-premise Ollama (`llama3.2:latest`) with deterministic heuristic fallbacks—ensuring zero sensitive evidence ever leaves the local perimeter.

---

## 🛡️ Role-Based Access Control (RBAC) & Default Credentials

The platform enforces strict Role-Based Access Control with pre-retrieval clearance boundaries:

| Role | Username | Password | Security Clearance | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Evidence Custodian & Lead Officer** | `officer_lead` | `Verion2026!` | `LEVEL_2` | Full upload access, case creation, classification tagging, manifest signing, full dossier export |
| **Senior Forensic Investigator** | `investigator_l2` | `Investigate2026!` | `LEVEL_2` | Unredacted evidence inspection, raw machine syslogs, conflict radar analysis, dossier synthesis |
| **Public Compliance Auditor** | `auditor_l1` | `Audit2026!` | `LEVEL_1` | Sanitized public audit view; Level 2 evidence and citations are cryptographically masked (zero data spillage) |

> **Security Rule (Zero Data Spillage)**: If a user logs in with `LEVEL_1` clearance, `LEVEL_2` chunks and raw internal IP addresses/SQL queries are physically excluded at the data store level—guaranteeing zero leakage.

---

## 🖥️ Platform Modules & UI Navigation

The interface provides an Apple-inspired, fluid glassmorphic forensic console organized into focused modules:

| Tab | Name | Purpose |
| :--- | :--- | :--- |
| 📂 | **Case Manager** | Multi-case registry allowing officers to create new cases, switch active cases, and view chunk summaries. |
| 📊 | **Investigation Overview** | Real-time forensic telemetry, ingestion metrics, security clearance indicator, and case KPIs. |
| 📥 | **Evidence Ingestion** | Upload multi-source files (PDF, TXT, LOG) with explicit security classification prompts (`LEVEL_1` vs `LEVEL_2`), view cryptographic chunk passports, or reload ground truth benchmarks. |
| ⏱️ | **Investigation Workspace** | Chronological multi-source incident reconstruction and entity resolution matrix (actors, systems, IPs). Run on-premise AI intelligence with one click. |
| ⚠️ | **Conflict Radar** | Side-by-side cross-examination comparing human testimony against immutable machine logs. Surfaces temporal and factual contradictions with actionable forensic directives. |
| 📄 | **Synthesized Dossier** | The **Single Verifiable Document**. Four-section synthesized narrative with interactive citation pills linked to chunk hashes and master SHA-256 seal verification. |
| 🛡️ | **Audit & Provenance** | Immutable evidence ledger table displaying file hashes, chunk fingerprints, and tamper-evident PDF export. |

---

## ⚙️ Architecture & Data Pipeline

```
[ PDF Reports ]   [ Interrogation Transcripts ]   [ Machine Syslogs ]
       │                         │                         │
       └─────────────────────────┼─────────────────────────┘
                                 ▼
                 [ Ingestion & Normalization Layer ]
             PyMuPDF / Transcript Parser / Syslog Parser
                                 ▼
              [ FIPS 180-4 SHA-256 Chunk Sealer ]
               sha256(file_hash + chunk_id + text)
                                 ▼
           [ Pre-Retrieval Zero-Spillage Security Gate ]
               LEVEL_1 (Public) ─── vs ─── LEVEL_2 (Secret)
                                 ▼
            [ Local On-Prem Ollama (Llama 3.2 Engine) ]
       Timeline Correlator ─ Conflict Radar ─ Dossier Synthesizer
                                 ▼
             [ Single Verifiable Document (Dossier) ]
               100% Traceable Inline Citation Anchors
                                 ▼
              [ Tamper-Evident Cryptographic PDF Export ]
```

---

## 🚀 Quick Setup & Installation

### Prerequisites
* **Python**: 3.10+ (Tested on Python 3.12 / 3.14)
* **Node.js**: v18+ & npm
* **Ollama**: (Optional for LLM features; deterministic fallback runs offline without Ollama)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/KartikShivshetty/VerionAI.git
cd VerionAI
```

---

### Step 2: Backend Setup
```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Start the FastAPI backend server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend API will be live at: `http://127.0.0.1:8000`
* Interactive API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`

---

### Step 3: Frontend Setup
In a new terminal window:
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Launch Vite dev server
npm run dev
```
* Frontend Console will be live at: `http://localhost:5173`

---

### Step 4: Local Ollama LLM Setup (Optional & Recommended)
```bash
# 1. Ensure Ollama daemon is running
ollama serve

# 2. Pull the optimized lightweight Llama 3.2 model
ollama pull llama3.2
```
* Verion AI automatically connects to `http://localhost:11434` and uses `llama3.2:latest` for dynamic multi-case reasoning.

---

---

## 🔐 In-Transit Tamper-Evident Dossier Guarantee & Verification

### The Core Problem:
When an investigative summary report is exported (as PDF or JSON) and emailed to an auditor, judge, or executive, **what happens if someone in between alters the file** (e.g. changing an IP address from `10.240.1.45` to an innocent IP, shifting an exfiltration timestamp, or changing patient records from `42,000` to `42`)?

### How Verion AI Solves & Detects In-Transit Tampering:
Verion AI employs a **multi-layered cryptographic defense architecture**:

1. **SHA-256 Avalanche Digest (FIPS 180-4)**:
   The entire synthesized narrative, section headers, and citation references are canonically concatenated and hashed. Due to the cryptographic avalanche effect, changing even a single byte or character causes a completely different 64-character hexadecimal digest.
2. **Custodial HMAC-SHA256 Digital Signature**:
   The master digest is cryptographically signed by the Verion AI Custodian Authority using a server-side private key (`SECRET_KEY`). An adversary intercepting the file cannot forge a valid signature because they lack the secret key.
3. **Dual PDF Forensic Embeddings**:
   - **Visual Custody Seal Box**: Stamped on Page 1 displaying the SHA-256 digest, clearance level, and HMAC signature.
   - **Embedded Trailer Metadata**: Digitally injected into document properties (`doc.metadata["keywords"] = "SHA256:... SIG:..."`) readable by any standard PDF parser.
4. **Interactive In-Transit Tamper Verification & Sandbox**:
   - **Upload File Verifier (`/api/verify/file`)**: Drop any exported `.pdf` or `.json` to instantly verify cryptographic integrity against the server custodian.
   - **Live Tamper Simulation Sandbox**: Built directly into the UI, allowing reviewers to test altering one character and visually observing the instant tamper alert!

---

### Step 5: Verification & Testing
Run the comprehensive test suite validating authentication, ingestion, zero-spillage gating, conflict detection, dossier synthesis, tamper detection, and export:
```bash
python -m pytest
```
* Expected output: **33 passed (100%)**

---

## 👥 Team Horizon Tech

* **Kartik S. Shivshetty** — 3rd Year CSE (Team Lead)
* **Shubhda Khanjire** — 3rd Year CSE
* **Akshaykumar Rabakavi** — 3rd Year CSE
* **Sahana Bellakki** — 3rd Year CSE
* **Spandana Bellakki** — 1st Year CSE

---

## 📜 License
Developed for **KLE Tech Hackfest 2026**. All rights reserved.
