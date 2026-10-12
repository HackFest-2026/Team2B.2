# VERION AI

> **Multi-Source Forensic Ingestion & Single Verifiable Document Engine**  
> **Problem Statement 2B**: Multi-Source Ingestion into a Single Verifiable Document  
> **Team**: Horizon Tech • **KLE Tech Hackfest 2026**  
> **Official Repository**: [https://github.com/HackFest-2026/Team2B.2.git](https://github.com/HackFest-2026/Team2B.2.git)

---

## 📌 Executive Overview

During incident investigations—whether cyberattacks, compliance audits, or legal proceedings—evidence is fragmented across heterogeneous, incompatible sources: **unstructured PDF reports**, **witness/suspect interview transcripts**, and **machine syslogs or network telemetry**.

Conventional LLM systems fail in these high-assurance environments: they hallucinate, cannot prove sources, lack strict clearance boundaries, and leave reports vulnerable to silent in-transit tampering.

**VERION AI** solves this by establishing a **100% on-premise, mathematically verifiable forensic intelligence system**:
1. **Pre-Ingestion Zero-Trust Malware Shield**: Scans all incoming files in memory before disk writing, blocking polyglot executables, weaponized PDF `/Launch` exploits, and EICAR threats.
2. **Multi-Source Normalization**: Ingests PDFs, chat/interview transcripts, and machine syslogs into cryptographically sealed chunk units.
3. **SHA-256 Cryptographic Provenance**: Every chunk receives an immutable FIPS 180-4 SHA-256 fingerprint bound to its source file hash and character span.
4. **Pre-Retrieval Zero-Spillage Security Gate**: Enforces physical separation between Level 1 (Unclassified/Public) and Level 2 (Restricted/Internal) records before data retrieval.
5. **Automated Conflict Radar**: Cross-examines witness testimony against immutable machine syslogs to expose temporal and factual contradictions without silently resolving them.
6. **Single Verifiable Document Synthesis**: Generates an authoritative incident dossier where 100% of factual assertions are anchored to interactive, mathematically verifiable citations (`[Ref 01]`, `[Ref 02]`).
7. **In-Transit Tamper Detection**: Dual-stamped with a master SHA-256 narrative digest and custodial HMAC-SHA256 signature, validated via web portal or air-gapped CLI.
8. **Local LLM Engine**: Powered by on-premise Ollama (`llama3.2:latest`) with deterministic heuristic fallbacks—ensuring zero sensitive evidence ever leaves the local perimeter.

---

## 🛡️ Role-Based Access Control (RBAC) & Default Credentials

The platform enforces strict Role-Based Access Control with pre-retrieval clearance boundaries:

| Role | Username | Password | Security Clearance | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Evidence Custodian & Lead Officer** | `officer_lead` | `Verion2026!` | `LEVEL_2` | Full upload access, case creation, classification tagging, manifest signing, full dossier export |
| **Senior Forensic Investigator** | `investigator_l2` | `Investigate2026!` | `LEVEL_2` | Unredacted evidence inspection, raw machine syslogs, conflict radar analysis, dossier synthesis |
| **Public Compliance Auditor** | `auditor_l1` | `Audit2026!` | `LEVEL_1` | Sanitized public audit view; Level 2 evidence and citations are cryptographically masked (zero data spillage) |

> **Security Rule (Zero Data Spillage)**: If a user logs in with `LEVEL_1` clearance, `LEVEL_2` chunks and raw internal IP addresses/SQL queries are physically excluded at the data store level—guaranteeing 0.00% data leakage.

---

## 🖥️ Platform Modules & UI Navigation

The interface provides an Apple-inspired, fluid glassmorphic forensic console organized into focused modules:

| Tab | Name | Purpose |
| :--- | :--- | :--- |
| 📂 | **Case Manager** | Multi-case registry allowing officers to create new cases, switch active cases, and view chunk summaries. |
| 📊 | **Investigation Overview** | Real-time forensic telemetry, ingestion metrics, security clearance indicator, and case KPIs. |
| 📥 | **Evidence Ingestion** | Upload multi-source files with active Malware Shield defense, EICAR test probe button, classification tagging (`LEVEL_1` vs `LEVEL_2`), and quarantine incident logs. |
| ⏱️ | **Investigation Workspace** | Chronological multi-source incident reconstruction and entity resolution matrix (actors, systems, IPs) with clearance masking. |
| ⚠️ | **Conflict Radar** | High-visibility cross-examination comparing human testimony against machine logs. Surfaces temporal and factual contradictions with actionable forensic directives. |
| 📄 | **Synthesized Dossier** | The **Single Verifiable Document**. Four-section synthesized narrative with interactive citation pills linked to chunk hashes and master SHA-256 seal verification. |
| 🛡️ | **Audit & Provenance** | Immutable evidence ledger table displaying file hashes, chunk fingerprints, quarantine audit logs, and tamper-evident PDF export. |

---

## ⚙️ Architecture & Data Pipeline

```text
[ PDF Reports ]   [ Witness Transcripts ]   [ Machine Syslogs ]
       │                     │                      │
       └─────────────────────┼──────────────────────┘
                             ▼
         [ Pre-Ingestion Zero-Trust Malware Shield ]
         • In-Memory Inspection (Zero Disk Write on Threat)
         • Polyglot & PE/ELF Disguised Binary Detection
         • PDF /Launch Exploit & Reverse Shell Interception
         • EICAR Standard Antivirus Test Quarantine
                             ▼
             [ Ingestion & Normalization Layer ]
         PyMuPDF / Transcript Parser / Syslog Parser
                             ▼
          [ FIPS 180-4 SHA-256 Chunk Fingerprinting ]
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
     [ Dual Cryptographic Seal & Attestation Engine ]
    • Master SHA-256 Narrative Digest (Avalanche Proof)
    • Custodial HMAC-SHA256 Signature (Key Attestation)
    • Page 1 Visual Seal Box + PDF Metadata Injection
                             ▼
    [ Air-Gapped Standalone Verifier & Web Sandbox ]
```

---

## 🔐 Anti-Tamper & Cryptographic Verification

When you send an exported dossier (PDF or JSON) to a third party, they can verify that the file has **not been altered in transit** through 3 independent methods:

### Method 1: Web Drag-and-Drop Verifier (`/api/verify/file`)
* Open the **Synthesized Dossier** tab in Verion AI.
* Click **"Verify & Anti-Tamper Info"** ➔ **Live File Verifier**.
* Drop any exported `.pdf` or `.json` to get an instant verdict:
  * `✅ VERIFIED AUTHENTIC: 100% UNTAMPERED`
  * `🚨 TAMPER DETECTED: Narrative hash mismatch / signature invalid`

### Method 2: Visual Inspection of the Page 1 Cryptographic Seal Box
Every exported PDF contains an official seal box on Page 1:
```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ CRYPTOGRAPHIC PROVENANCE TAMPER-EVIDENT SEAL (SHA-256)                      │
│ DIGEST: f228597489006cbeea12bcd595caf1419cb7b57b78f61ae1524080298eb7d6da  │
│ HMAC SIGNATURE: ba89ece136f40b357a2e39da8578593a... • SIGNED BY: Custodian  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Method 3: Air-Gapped Standalone CLI Verifier
Third-party auditors can verify files completely offline without running the web server:
```bash
# Verify exported PDF
python backend/export/verify_standalone.py Verion_Dossier_CASE-2026-X94_LEVEL_2.pdf

# Verify exported JSON
python backend/export/verify_standalone.py Verion_Dossier_CASE-2026-X94_LEVEL_2.json
```

---

## 🛡️ Pre-Ingestion Malware Defense & Quarantine Engine

To protect the evidence store against adversarial droppers, Verion AI enforces zero-trust scanning **before any file touches the filesystem**:
* **Magic-Byte Polyglot Disguise Analysis:** Blocks Windows PE binaries (`MZ`) and Linux ELF binaries disguised under `.pdf` or `.txt` extensions.
* **Weaponized PDF Defense:** Inspects PDF streams for `/Launch` actions (spawns OS processes), embedded executable attachments, and obfuscated JavaScript blocks.
* **Reverse Shell Detection:** Catches encoded PowerShell droppers (`-enc`, `-w hidden`), Bash reverse sockets (`/dev/tcp/`), and Netcat shells (`-e`).
* **Instant Quarantine:** Rejects malicious uploads with `HTTP 422 Unprocessable Content`, discards the buffer from memory, and logs an immutable audit trail.
* **Safe EICAR Test Probe:** Evaluators can click the **"Test EICAR Probe"** button in the Evidence Ingestion UI to witness the instant quarantine alert live.

---

## 🚀 Quick Setup & Installation

### Prerequisites
* **Python**: 3.10+ (Tested on Python 3.12 / 3.14)
* **Node.js**: v18+ & npm
* **Ollama**: (Optional for LLM features; deterministic fallback runs offline without Ollama)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/HackFest-2026/Team2B.2.git
cd Team2B.2
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

### Step 5: Run Automated Verification Tests
Run the comprehensive test suite validating authentication, ingestion, zero-spillage gating, conflict detection, dossier synthesis, PDF export, tamper detection, and malware quarantine:
```bash
python -m pytest backend/tests -v
```
* Expected output: **43 passed (100%)**

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
