"""
Verion AI - System Configuration & Security Constants
"""
from typing import Dict, Any

SECRET_KEY = "verion-ai-security-token-2026-hackfest"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Security Clearance Levels
CLEARANCE_LEVEL_1 = "LEVEL_1"  # Unclassified / Public / Compliance
CLEARANCE_LEVEL_2 = "LEVEL_2"  # Classified / Restricted / Forensic Internal

ROLE_OFFICER = "OFFICER"
ROLE_INVESTIGATOR = "INVESTIGATOR"
ROLE_AUDITOR = "AUDITOR"

# Pre-seeded Default Accounts for Authentication
DEFAULT_USERS: Dict[str, Dict[str, Any]] = {
    "officer_lead": {
        "username": "officer_lead",
        "full_name": "Marcus Vance",
        "title": "Evidence Custodian & Lead Officer",
        "password": "Verion2026!",
        "role": ROLE_OFFICER,
        "clearance": CLEARANCE_LEVEL_2,
        "can_upload": True,
        "badge_color": "blue"
    },
    "investigator_l2": {
        "username": "investigator_l2",
        "full_name": "Elena Rostova",
        "title": "Senior Forensic Investigator",
        "password": "Investigate2026!",
        "role": ROLE_INVESTIGATOR,
        "clearance": CLEARANCE_LEVEL_2,
        "can_upload": False,
        "badge_color": "rose"
    },
    "auditor_l1": {
        "username": "auditor_l1",
        "full_name": "David Thorne",
        "title": "Public Compliance Auditor",
        "password": "Audit2026!",
        "role": ROLE_AUDITOR,
        "clearance": CLEARANCE_LEVEL_1,
        "can_upload": False,
        "badge_color": "emerald"
    }
}
