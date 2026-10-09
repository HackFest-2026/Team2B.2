"""
Script to generate benchmark incident_report.pdf using PyMuPDF (fitz)
"""
import fitz  # PyMuPDF
from pathlib import Path

def generate_pdf():
    output_path = Path(__file__).resolve().parent / "incident_report.pdf"
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4 size

    # Header Banner
    header_rect = fitz.Rect(40, 40, 555, 75)
    page.draw_rect(header_rect, color=(0.14, 0.39, 0.92), fill=(0.95, 0.97, 1.0), width=1)
    page.insert_text(fitz.Point(55, 62), "VERION AI FORENSIC INCIDENT DISCLOSURE", fontsize=13, fontname="helv", color=(0.06, 0.1, 0.2))

    # Metadata table
    meta_lines = [
        ("INCIDENT ID:", "IR-2026-0914-ALPHA"),
        ("SEVERITY:", "HIGH // SUSPECTED CREDENTIAL COMPROMISE"),
        ("SECURITY CLASSIFICATION:", "LEVEL 1 - UNCLASSIFIED // PUBLIC RELEASE"),
        ("REPORTING DATE:", "2026-10-08 12:00:00 UTC"),
        ("ORIGINATING UNIT:", "Security Operations Command (SOC)")
    ]
    y = 100
    for label, val in meta_lines:
        page.insert_text(fitz.Point(40, y), label, fontsize=9, fontname="helv", color=(0.4, 0.45, 0.5))
        page.insert_text(fitz.Point(220, y), val, fontsize=9, fontname="helv", color=(0.1, 0.1, 0.1))
        y += 18

    # Divider line
    page.draw_line(fitz.Point(40, y + 5), fitz.Point(555, y + 5), color=(0.85, 0.88, 0.92), width=1)
    y += 25

    # Section 1: Executive Summary
    page.insert_text(fitz.Point(40, y), "1. EXECUTIVE SUMMARY", fontsize=11, fontname="helv", color=(0.06, 0.1, 0.2))
    y += 18
    p1 = (
        "On the night of October 7, 2026, automated threat detection sensors identified an "
        "anomaly regarding the primary relational database cluster (db-primary.internal). "
        "A database dump query was observed targeting the customer records repository. "
        "Preliminary triage confirmed that valid administrator authentication credentials "
        "associated with staff member Alice Chen were utilized during the incident window."
    )
    rect_p1 = fitz.Rect(40, y, 555, y + 50)
    page.insert_textbox(rect_p1, p1, fontsize=9.5, fontname="helv", color=(0.15, 0.15, 0.2), lineheight=1.3)
    y += 65

    # Section 2: Preliminary Findings & Timings
    page.insert_text(fitz.Point(40, y), "2. CHRONOLOGICAL SCOPE & TARGET ASSETS", fontsize=11, fontname="helv", color=(0.06, 0.1, 0.2))
    y += 18
    p2 = (
        "The incident window is constrained between 20:30 UTC and 22:00 UTC on October 7. "
        "According to shift logs, routine proxy server maintenance was scheduled for completion "
        "at 20:30 UTC. However, suspicious high-volume outbound network egress was detected "
        "between 21:15 UTC and 21:25 UTC. Immediate containment actions were executed at 22:30 UTC "
        "to revoke the affected cryptographic keys and isolate the relevant subnet."
    )
    rect_p2 = fitz.Rect(40, y, 555, y + 55)
    page.insert_textbox(rect_p2, p2, fontsize=9.5, fontname="helv", color=(0.15, 0.15, 0.2), lineheight=1.3)
    y += 70

    # Section 3: Next Actions
    page.insert_text(fitz.Point(40, y), "3. AUDIT DIRECTIVE", fontsize=11, fontname="helv", color=(0.06, 0.1, 0.2))
    y += 18
    p3 = (
        "Investigators must cross-reconcile verbal witness testimony against immutable firewall and "
        "SSH bastion audit streams. Any discrepancy between human claims and cryptographic machine "
        "records must be surfaced as an investigative priority."
    )
    rect_p3 = fitz.Rect(40, y, 555, y + 45)
    page.insert_textbox(rect_p3, p3, fontsize=9.5, fontname="helv", color=(0.15, 0.15, 0.2), lineheight=1.3)
    y += 60

    # Footer Seal
    page.draw_line(fitz.Point(40, 780), fitz.Point(555, 780), color=(0.85, 0.88, 0.92), width=1)
    page.insert_text(fitz.Point(40, 795), "AUTHENTICATED ARTIFACT // CASE-2026-ALPHA // PAGE 1 OF 1", fontsize=8, fontname="helv", color=(0.5, 0.5, 0.5))
    page.insert_text(fitz.Point(430, 795), "VERION VERIFIABLE DOSSIER", fontsize=8, fontname="helv", color=(0.14, 0.39, 0.92))

    doc.save(str(output_path))
    doc.close()
    print(f"Generated {output_path} successfully.")

if __name__ == "__main__":
    generate_pdf()
