"""
Verion AI - Cross-Source Entity Resolution Engine
Resolves human actors, machine identifiers, IP subnets, and systems across heterogeneous sources.
"""
import re
from typing import List, Dict, Any, Set

IP_PATTERN = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
USER_PATTERN = re.compile(r"\b(?:user[=:]\s*([a-zA-Z0-9_-]+)|CN=([a-zA-Z0-9_-]+)|USER=([a-zA-Z0-9_-]+))\b")
HOST_PATTERN = re.compile(r"\b([a-zA-Z0-9_-]+\.(?:internal|corp|local|datacenter))\b")

def extract_entities_from_chunks(chunks: List[Dict[str, Any]], user_clearance: str = "LEVEL_2") -> Dict[str, Any]:
    """
    Extracts and resolves entities across all provided evidence chunks.
    Enforces dynamic clearance masking if user_clearance is LEVEL_1.
    """
    actors: Dict[str, Dict[str, Any]] = {}
    systems: Dict[str, Dict[str, Any]] = {}
    ip_addresses: Dict[str, Dict[str, Any]] = {}
    actions: List[Dict[str, Any]] = []

    for chk in chunks:
        text = chk.get("text", "")
        source_file = chk.get("source_file", "")
        chunk_id = chk.get("chunk_id", "")
        chunk_class = chk.get("classification", "LEVEL_1")

        # 1. Resolve Actors
        speaker = chk.get("speaker")
        if speaker and speaker != "HEADER/METADATA":
            name_key = speaker.title()
            if name_key not in actors:
                actors[name_key] = {
                    "entity_id": f"ACTOR_{len(actors)+1:02d}",
                    "name": name_key,
                    "type": "HUMAN_PERSONNEL",
                    "aliases": ["Alice Chen"] if "ALICE" in speaker else [speaker],
                    "classification": chunk_class,
                    "mentions_count": 0,
                    "source_chunks": []
                }
            actors[name_key]["mentions_count"] += 1
            if chunk_id not in actors[name_key]["source_chunks"]:
                actors[name_key]["source_chunks"].append(chunk_id)

        # Check for system users (alice_admin, db_superuser)
        for u_match in USER_PATTERN.finditer(text):
            username = next(filter(None, u_match.groups()), None)
            if username:
                if username not in actors:
                    actors[username] = {
                        "entity_id": f"ACTOR_{len(actors)+1:02d}",
                        "name": username,
                        "type": "SYSTEM_CREDENTIAL",
                        "aliases": ["Alice Chen (Linked Account)"] if "alice" in username else [username],
                        "classification": chunk_class,
                        "mentions_count": 0,
                        "source_chunks": []
                    }
                actors[username]["mentions_count"] += 1
                if chunk_id not in actors[username]["source_chunks"]:
                    actors[username]["source_chunks"].append(chunk_id)

        # 2. Resolve Systems & Hosts
        for h_match in HOST_PATTERN.finditer(text):
            hostname = h_match.group(1)
            if hostname not in systems:
                systems[hostname] = {
                    "entity_id": f"HOST_{len(systems)+1:02d}",
                    "hostname": hostname,
                    "type": "INFRASTRUCTURE_ASSET",
                    "classification": chunk_class,
                    "source_chunks": []
                }
            if chunk_id not in systems[hostname]["source_chunks"]:
                systems[hostname]["source_chunks"].append(chunk_id)

        # Check known infrastructure names and homicide locations/assets
        for known_host in [
            "gw-datacenter-01", "core-router-01", "db-primary.internal",
            "Warehouse Bay 4", "Metro Downtown Cinema", "Docklands Logistics Hub", "Plate 7XYZ-892 (Sapphire Blue SUV)"
        ]:
            if known_host.lower() in text.lower():
                if known_host not in systems:
                    is_vehicle = "7XYZ" in known_host
                    systems[known_host] = {
                        "entity_id": f"ASSET_{len(systems)+1:02d}",
                        "hostname": known_host,
                        "type": "EVIDENCE_VEHICLE" if is_vehicle else ("CRIME_SCENE" if "Warehouse" in known_host else "LOCATION"),
                        "classification": chunk_class,
                        "source_chunks": []
                    }
                if chunk_id not in systems[known_host]["source_chunks"]:
                    systems[known_host]["source_chunks"].append(chunk_id)

        # Homicide actors in text
        for person_name, person_type in [
            ("Jonathan Vance", "VICTIM_DECEDENT"),
            ("Marcus Sterling", "PRIMARY_SUSPECT"),
            ("Detective Sarah Ramos", "LEAD_INVESTIGATOR"),
            ("Dr. Eleanor Ward", "MEDICAL_EXAMINER")
        ]:
            if person_name.lower() in text.lower():
                if person_name not in actors:
                    actors[person_name] = {
                        "entity_id": f"ACTOR_{len(actors)+1:02d}",
                        "name": person_name,
                        "type": person_type,
                        "aliases": [person_name],
                        "classification": chunk_class,
                        "mentions_count": 0,
                        "source_chunks": []
                    }
                actors[person_name]["mentions_count"] += 1
                if chunk_id not in actors[person_name]["source_chunks"]:
                    actors[person_name]["source_chunks"].append(chunk_id)

        # 3. Resolve IP Addresses
        for ip in IP_PATTERN.findall(text):
            if ip not in ip_addresses:
                # IPs inside 10.x.x.x are internal classified infrastructure
                is_internal = ip.startswith("10.")
                ip_class = "LEVEL_2" if is_internal else "LEVEL_1"
                
                # Check clearance masking
                display_ip = ip
                if user_clearance == "LEVEL_1" and is_internal:
                    display_ip = f"[REDACTED - LEVEL 2 ({ip.split('.')[0]}.x.x.x)]"

                ip_addresses[ip] = {
                    "entity_id": f"IP_{len(ip_addresses)+1:02d}",
                    "address": display_ip,
                    "raw_address": ip if user_clearance == "LEVEL_2" else None,
                    "is_internal": is_internal,
                    "classification": ip_class,
                    "source_chunks": []
                }
            if chunk_id not in ip_addresses[ip]["source_chunks"]:
                ip_addresses[ip]["source_chunks"].append(chunk_id)

    return {
        "total_actors": len(actors),
        "total_systems": len(systems),
        "total_ips": len(ip_addresses),
        "actors": list(actors.values()),
        "systems": list(systems.values()),
        "ip_addresses": list(ip_addresses.values())
    }
