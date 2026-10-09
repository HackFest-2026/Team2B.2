# Verion AI Design & Security Directives

## 1. UI & Aesthetics: Apple Design for Enterprise Forensics
- **Theme**: Minimalist, light-mode, enterprise investigation dashboard.
- **Palette**: Off-white background (`#F8FAFC`), crisp white cards with fine gray borders (`border-slate-200/80`), electric-blue accents (`#2563EB`), ink black text (`#0F172A`), crimson conflict/error alerts (`#DC2626`).
- **Typography**: Bold sans-serif headings (`Inter` / system-ui font stack) paired with uppercase, letter-spaced monospace meta labels (`font-mono text-[11px] tracking-wider uppercase`).
- **Motion & Interactions (Apple Design)**:
  - Respond on pointer-down with subtle press feedback (`active:scale-[0.985]`).
  - Smooth spring transitions, interruptible slide-over panels for evidence inspection.
  - Spatial consistency: Slide-overs originate and dismiss toward the same edge.

## 2. Core Security & Privacy: 100% On-Prem & Zero Spillage
- **Local-Only Inference**: All AI reasoning is processed locally via Ollama (`llama3.2:3b` / `mistral:7b`) with deterministic on-prem fallback. Zero cloud API leakage.
- **Rule 1: Provenance At Every Stage**: Every extracted fact, log row, and synthesized claim must record source file, chunk ID, page/line number, and SHA-256 hash.
- **Rule 2: Security Checks Precede Composition**: RBAC clearance level checks run before vector search and before prompt assembly. Level 2 chunks are physically excluded from the memory context of Level 1 sessions.
