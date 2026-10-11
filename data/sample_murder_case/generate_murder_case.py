"""
Generate Sample Murder Investigation Evidence Files for Verion AI
Creates:
1. autopsy_report.pdf (Medical Examiner Report - Level 1)
2. suspect_interrogation.txt (Detective Interview Transcript - Level 1)
3. security_access_cctv.log (ANPR & Sensor Telemetry - Level 2)
"""
import pymupdf as fitz
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def generate_autopsy_pdf():
    pdf_path = BASE_DIR / "autopsy_report.pdf"
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)  # A4 size

    # Header Banner
    header_rect = fitz.Rect(40, 40, 555, 75)
    page.draw_rect(header_rect, color=(0.7, 0.15, 0.15), fill=(0.99, 0.95, 0.95), width=1)
    page.insert_text(fitz.Point(55, 62), "OFFICE OF THE CHIEF MEDICAL EXAMINER // FORENSIC AUTOPSY", fontsize=12, fontname="helv", color=(0.5, 0.05, 0.05))

    # Case Metadata
    meta_lines = [
        ("CASE IDENTIFIER:", "CR-2026-1009-HOMICIDE"),
        ("DECEDENT:", "Jonathan Vance (Male, 42 years)"),
        ("INCIDENT DATE:", "2026-10-09 22:00:00 UTC (Estimated)"),
        ("EXAMINING PATHOLOGIST:", "Dr. Eleanor Ward, MD, FCAP (Chief Medical Examiner)"),
        ("SECURITY CLEARANCE:", "LEVEL 1 - UNCLASSIFIED // PUBLIC INQUEST RECORD"),
        ("LOCATION OF RECOVERY:", "Docklands Logistics Hub, Warehouse Bay 4, Industrial Row")
    ]
    y = 100
    for label, val in meta_lines:
        page.insert_text(fitz.Point(40, y), label, fontsize=8.5, fontname="helv", color=(0.4, 0.45, 0.5))
        page.insert_text(fitz.Point(210, y), val, fontsize=8.5, fontname="helv", color=(0.1, 0.1, 0.1))
        y += 17

    page.draw_line(fitz.Point(40, y + 4), fitz.Point(555, y + 4), color=(0.85, 0.88, 0.92), width=1)
    y += 24

    # Section 1: Post-Mortem Chronology
    page.insert_text(fitz.Point(40, y), "1. ESTIMATED TIME OF DEATH (TOD) & VITALS", fontsize=10.5, fontname="helv", color=(0.2, 0.05, 0.05))
    y += 16
    p1 = (
        "Rigor mortis and core hepatic temperature decay curve establish that the post-mortem interval "
        "places time of death between 21:45 UTC and 22:30 UTC on October 9, 2026. Lividity was unfixed "
        "when first responders arrived at 23:40 UTC, indicating minimal body repositioning post-cessation."
    )
    rect_p1 = fitz.Rect(40, y, 555, y + 45)
    page.insert_textbox(rect_p1, p1, fontsize=9, fontname="helv", color=(0.15, 0.15, 0.2), lineheight=1.3)
    y += 55

    # Section 2: Pathological Anatomical Findings
    page.insert_text(fitz.Point(40, y), "2. ANATOMICAL FINDINGS & MECHANISM OF DEATH", fontsize=10.5, fontname="helv", color=(0.2, 0.05, 0.05))
    y += 16
    p2 = (
        "Primary cause of death is traumatic asphyxiation accompanied by comminuted parietal contusions "
        "inflicted by a heavy blunt instrument. Subgaleal hemorrhage is evident along the posterior occiput. "
        "Pronounced defensive lacerations are documented across the dorsal surfaces of bilateral forearms."
    )
    rect_p2 = fitz.Rect(40, y, 555, y + 45)
    page.insert_textbox(rect_p2, p2, fontsize=9, fontname="helv", color=(0.15, 0.15, 0.2), lineheight=1.3)
    y += 55

    # Section 3: Trace Evidence & Toxicology
    page.insert_text(fitz.Point(40, y), "3. FORENSIC TRACE RECOVERY & LAB IMPRESSIONS", fontsize=10.5, fontname="helv", color=(0.2, 0.05, 0.05))
    y += 16
    p3 = (
        "Subungual scraping from decedent's left hand yielded foreign textile microfibers. Spectrophotometry "
        "identifies them as cobalt-blue synthetic nylon-polyester upholstery fibers, typical of high-end SUV "
        "automotive interiors. Partial epidermal epithelial cells recovered; DNA amplification initiated."
    )
    rect_p3 = fitz.Rect(40, y, 555, y + 45)
    page.insert_textbox(rect_p3, p3, fontsize=9, fontname="helv", color=(0.15, 0.15, 0.2), lineheight=1.3)
    y += 55

    # Certification Box
    page.draw_rect(fitz.Rect(40, y, 555, y + 40), color=(0.8, 0.82, 0.86), fill=(0.97, 0.98, 0.99), width=1)
    page.insert_text(fitz.Point(50, y + 16), "DIGITAL STAMP: CORONER-MED-EXAM-SEAL-VERIFIED // HASH: SHA-256", fontsize=7.5, fontname="helv", color=(0.3, 0.35, 0.4))
    page.insert_text(fitz.Point(50, y + 30), "AUTHORIZING PATHOLOGIST: Eleanor Ward, M.D. - Signed electronically under penalty of perjury.", fontsize=8, fontname="helv", color=(0.1, 0.1, 0.1))

    doc.save(pdf_path)
    print(f"Generated: {pdf_path}")

def generate_interrogation_txt():
    txt_path = BASE_DIR / "suspect_interrogation.txt"
    content = """================================================================================
METROPOLITAN POLICE DEPARTMENT - HOMICIDE DIVISION
INTERVIEW RECORD // FORM 104-B
================================================================================
CASE FILE:       CR-2026-1009-HOMICIDE (Docklands Logistics Homicide)
DATE / TIME:     2026-10-10 09:15:00 UTC
LOCATION:        Interview Room 3, Central Precinct
INTERVIEWER:     Detective Sarah Ramos (Badge #4412)
WITNESS/SUSPECT: Marcus Sterling (Chief Operations Partner)
ATTORNEY:        Julian Mercer (Present)
CLEARANCE:       LEVEL 1 - UNCLASSIFIED // FORMAL DEPOSITION RECORD
================================================================================

[09:15:22] DETECTIVE RAMOS: Mr. Sterling, for the record, please state your full name and your relationship with the deceased, Jonathan Vance.
[09:15:35] MARCUS STERLING: My name is Marcus Sterling. Jonathan and I co-founded Vantage Logistics. We have been 50-50 business partners for eight years.
[09:16:02] DETECTIVE RAMOS: When did you last see Mr. Vance alive at the Warehouse Bay 4 office on the evening of October 9th?
[09:16:20] MARCUS STERLING: We had an audit review meeting on Friday evening. We finished going over our books at 20:30 UTC. I packed my briefcase and clocked out through Gate 3 right around 20:30. Jonathan stayed behind to finalize inventory manifests.
[09:17:05] DETECTIVE RAMOS: Where did you go after leaving the warehouse at 20:30 UTC?
[09:17:22] MARCUS STERLING: I drove straight to the Metro Downtown Cinema on Grand Avenue. I wanted to catch the 21:00 screening of the premiere. I arrived at the theater parking lot around 20:50, bought a ticket with cash, and sat inside from 21:00 until 23:15 UTC.
[09:18:00] DETECTIVE RAMOS: Did you leave the cinema auditorium at any point between 21:00 and 23:15?
[09:18:18] MARCUS STERLING: Absolutely not. I remained seated in the theater the entire movie. My phone was turned completely off in my coat pocket. I did not step out until 23:15.
[09:18:45] DETECTIVE RAMOS: Did you return to Warehouse Bay 4 at any point later that night?
[09:19:02] MARCUS STERLING: No, I never returned to the warehouse. Under no circumstances did I go back to Industrial Row that night. The first time I learned Jonathan was injured or killed was when your precinct called my residence at 01:30 in the morning.
[09:19:40] DETECTIVE RAMOS: What vehicle were you driving on the night of October 9th?
[09:19:55] MARCUS STERLING: My personal blue Sapphire SUV. License plate 7XYZ-892. It remained parked outside the cinema the entire duration.
[09:20:25] DETECTIVE RAMOS: Thank you. Interview paused at 09:20 UTC.
================================================================================
END OF TRANSCRIPT CHUNK
"""
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated: {txt_path}")

def generate_cctv_log():
    log_path = BASE_DIR / "security_access_cctv.log"
    content = """# ==============================================================================
# INDUSTRIAL ROW TELEMETRY & HIGHWAY ANPR LOG
# SOURCE: Port Authority Camera Cam-04 & Warehouse 4 Automated Security Grid
# CLEARANCE CLASSIFICATION: LEVEL_2 // RESTRICTED FORENSIC TELEMETRY
# TIMEZONE: UTC
# ==============================================================================
2026-10-09T20:30:14.200Z [GATE-3-BADGE] USER=marcus_sterling BADGE=8819 EVENT=OUTBOUND_EXIT STATUS=AUTHORIZED
2026-10-09T20:31:05.110Z [ANPR-CAM01] PLATE=7XYZ-892 VEHICLE="Sapphire Blue SUV" DIR=OUTBOUND SPEED=42kmh
2026-10-09T21:48:02.114Z [ANPR-CAM04] PLATE=7XYZ-892 VEHICLE="Sapphire Blue SUV" DIR=INBOUND_ALLEY_ROW SPEED=38kmh
2026-10-09T21:50:18.005Z [PIR-OUTDOOR] SENSOR=PERIMETER-NORTH EVENT=MOTION_CONFIRMED ZONE=WH4_REAR_DOCK
2026-10-09T21:54:33.882Z [DOOR-WH4-REAR] SENSOR=MAG_LOCK_4 EVENT=UNAUTHORIZED_FORCED_CONTACT STATUS=ALARM_SUPPRESSED
2026-10-09T22:12:04.550Z [INTERIOR-WH4] SENSOR=OFFICE_AUDIO EVENT=DECIBEL_SPIKE_85DB FREQ=HIGH_IMPACT
2026-10-09T22:15:10.040Z [IR-PIR-MOTION] SENSOR=OFFICE_SUITE_B EVENT=MOTION_CONFIRMED DURATION=3m42s
2026-10-09T22:21:45.612Z [DOOR-WH4-REAR] SENSOR=MAG_LOCK_4 EVENT=DOOR_CLOSED_LATCH_CYCLE STATUS=SECURED
2026-10-09T22:23:09.431Z [ANPR-CAM04] PLATE=7XYZ-892 VEHICLE="Sapphire Blue SUV" DIR=OUTBOUND_HIGHWAY_RAMP SPEED=88kmh ACCELERATION=RAPID
2026-10-09T23:38:12.910Z [PATROL-OFFICER] SENSOR=GATE-1-CALLBOX EVENT=911_EMERGENCY_DISPATCH_CALLED BY=SECURITY_PATROL
"""
    with open(log_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated: {log_path}")

if __name__ == "__main__":
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    generate_autopsy_pdf()
    generate_interrogation_txt()
    generate_cctv_log()
