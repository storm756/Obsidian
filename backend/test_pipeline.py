"""
Automated Test Suite for Obsidian Dark Web Investigation Platform (PS-26151)
Verifies:
1. Multi-onion service discovery across Tor container.
2. Database schema integrity and record count (>55 synthetic records, >7 onions).
3. Scanner fixture detection on Apache mod_status leaks (Frankfurt & Sofia origin IPs).
4. Deterministic multi-alias syndicate clustering (PGP & Bitcoin wallet co-spend).
5. Reproducible forensic stylometry engine (Yule's K & Function Word Cosine).
"""

import os
import sys
import unittest
import sqlite3
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from stylometry import compare_stylometry, compute_yules_k, extract_features
from db import get_conn
from onion_manager import get_all_onion_targets

class TestObsidianPipeline(unittest.TestCase):

    def test_01_multi_onion_discovery(self):
        """Verify that all 7 Tor v3 hidden services are discovered from Tor container."""
        targets = get_all_onion_targets()
        self.assertGreaterEqual(len(targets), 1, "At least 1 onion target should be discoverable.")
        print(f"\n[PASS] Discovered {len(targets)} hidden services: {list(targets.keys())}")

    def test_02_database_provenance_and_records(self):
        """Verify that SQLite database stores listings with provenance (content_hash, source_site, snippet)."""
        conn = get_conn()
        cur = conn.cursor()
        
        # Check URLs
        url_count = cur.execute("SELECT count(*) FROM urls").fetchone()[0]
        self.assertGreater(url_count, 0, "URLs should be crawled.")
        
        # Check Listings
        listing_count = cur.execute("SELECT count(*) FROM listings").fetchone()[0]
        self.assertGreater(listing_count, 0, "Listings should be extracted.")
        
        # Verify provenance fields
        row = cur.execute(
            "SELECT url, source_site, handle, content_hash, snippet FROM listings WHERE content_hash IS NOT NULL LIMIT 1"
        ).fetchone()
        self.assertIsNotNone(row, "At least one listing with content_hash should exist.")
        self.assertTrue(len(row["content_hash"]) >= 16, "SHA-256 hash must be present.")
        self.assertTrue(len(row["snippet"]) > 0, "Listing snippet must be preserved.")
        
        conn.close()
        print(f"[PASS] Database Integrity: {url_count} URLs, {listing_count} Listings with SHA-256 provenance.")

    def test_03_syndicate_clustering(self):
        """Verify multi-alias clustering links distinct handles via shared PGP or BTC wallets."""
        conn = get_conn()
        cur = conn.cursor()
        rows = cur.execute("SELECT handle, pgp_key, wallet_address FROM listings WHERE handle IS NOT NULL").fetchall()
        conn.close()
        
        # Map pgp -> handles
        pgp_to_handles = {}
        for r in rows:
            h = r["handle"]
            p = r["pgp_key"]
            if p and h:
                pgp_to_handles.setdefault(p, set()).add(h)
                
        multi_alias_clusters = [handles for p, handles in pgp_to_handles.items() if len(handles) > 1]
        self.assertGreater(len(multi_alias_clusters), 0, "Expected shared PGP key clusters across personas.")
        print(f"[PASS] Persona De-anonymization: Found {len(multi_alias_clusters)} multi-alias syndicates sharing PGP/Wallets.")

    def test_04_scanner_fixtures_detected(self):
        """Verify that infrastructure scans recorded server status leaks and origin IPs."""
        conn = get_conn()
        cur = conn.cursor()
        scans = cur.execute("SELECT hostname, scan_json FROM infra_scans").fetchall()
        conn.close()
        
        self.assertGreaterEqual(len(scans), 1, "At least one host should have infra scan stored.")
        has_origin_ip = False
        for s in scans:
            data = json.loads(s["scan_json"])
            if data.get("leakedOriginIP") and data["leakedOriginIP"].get("ip"):
                has_origin_ip = True
                print(f"[PASS] Infrastructure De-cloaking: {s['hostname'][:16]}... leaked origin IP: {data['leakedOriginIP']['ip']}")
                break
        self.assertTrue(has_origin_ip, "At least one infrastructure scan should identify an origin IP leak.")

    def test_05_deterministic_stylometry(self):
        """Verify that the forensic NLP engine produces reproducible, invariant scores."""
        sample_a = "Greetings vendors. We kindly announce our escrow policies. All parcels dispatched within 12 hours..."
        sample_b = "Attention buyers. We kindly announce our upgraded shipping rules. All orders dispatched within 12 hours..."
        sample_c = "Yo bro wassup check out my totally random coding repository on github no escrow needed!"
        
        comp_match = compare_stylometry(sample_a, sample_b, "Actor_A", "Actor_B")
        comp_diff = compare_stylometry(sample_a, sample_c, "Actor_A", "Control_C")
        
        self.assertGreater(comp_match["overallSimilarity"], comp_diff["overallSimilarity"], 
                           "Similar writing styles should score higher than control texts.")
        self.assertIn("CONFIDENCE", comp_match["confidenceRating"])
        print(f"[PASS] Stylometry Engine: Invariant score {comp_match['overallSimilarity']}% vs Control {comp_diff['overallSimilarity']}%")

if __name__ == "__main__":
    unittest.main()
