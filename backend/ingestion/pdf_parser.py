"""
Verion AI - PDF Ingestion Parser (PyMuPDF)
Extracts pages, text blocks, and character offsets with full forensic provenance.
"""
import pymupdf
from pathlib import Path
from typing import List, Dict, Any

def parse_pdf_file(filepath: Path) -> List[Dict[str, Any]]:
    """
    Parses a PDF file into structured pages and blocks using PyMuPDF block extraction.
    Returns a list of extracted sections with page numbers and metadata.
    """
    if not filepath.exists():
        raise FileNotFoundError(f"PDF file not found: {filepath}")

    doc = pymupdf.open(str(filepath))
    extracted_sections = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Extract structured text blocks (x0, y0, x1, y1, text, block_no, block_type)
        blocks = page.get_text("blocks")
        
        block_idx = 1
        for b in blocks:
            # block_type 0 is text (1 is image)
            if len(b) >= 5 and b[6] == 0:
                text = b[4].strip()
                if not text:
                    continue
                    
                extracted_sections.append({
                    "source_file": filepath.name,
                    "source_type": "PDF",
                    "page_number": page_num + 1,
                    "section_index": block_idx,
                    "text": text,
                    "bbox": [round(b[0], 1), round(b[1], 1), round(b[2], 1), round(b[3], 1)],
                    "char_count": len(text)
                })
                block_idx += 1

    doc.close()
    return extracted_sections
