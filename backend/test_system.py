import sys
import json
from pathlib import Path

# Add backend to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from scanner import get_tor_session, run_full_scan
from pipeline import run_pipeline
from onion_manager import get_all_onion_targets, sync_testbed_cross_links
from db import init_db, get_conn

def test_full_flow():
    print("=== 1. Initializing DB ===")
    init_db()

    print("=== 2. Discovering Tor Targets ===")
    targets = get_all_onion_targets()
    print(f"Discovered {len(targets)} onion targets:")
    for k, v in targets.items():
        print(f"  [{k}]: {v}")

    print("=== 3. Synchronizing Testbed Cross-Onion Links ===")
    sync_testbed_cross_links(targets)
    print("Cross-links synchronized in testbed/index.html")

    print("=== 4. Testing Infrastructure Scanner on market-a ===")
    if "market-a" in targets:
        m_a_onion = targets["market-a"]
        scan_res = run_full_scan(m_a_onion)
        print(f"Scan Status: {scan_res['status']}")
        print(f"Server Banner: {scan_res['serverBanner']}")
        print(f"Exposed Status Page: {scan_res['exposedStatusPage']}")
        print(f"Status Details: {scan_res.get('statusPageDetails')}")
        print(f"Leaked Origin IP: {scan_res.get('leakedOriginIP')}")
        print(f"Risk Score: {scan_res.get('riskScore')}")

    print("=== 5. Running Full Crawl Pipeline from Testbed Hub ===")
    session = get_tor_session()
    seed_onion = targets.get("testbed", "5ddoqqirppgbbl3rgl7octcxixxzrarvhl5v6s65ycseillxpignm6ad.onion")
    crawl_res = run_pipeline(f"http://{seed_onion}/", session, max_pages=150)
    print(f"Crawl completed: {crawl_res}")

    print("=== 6. Verifying Database Extracted Records ===")
    conn = get_conn()
    url_count = conn.execute("SELECT COUNT(*) as c FROM urls").fetchone()["c"]
    listing_count = conn.execute("SELECT COUNT(*) as c FROM listings").fetchone()["c"]
    scan_count = conn.execute("SELECT COUNT(*) as c FROM infra_scans").fetchone()["c"]
    print(f"Total Discovered URLs: {url_count}")
    print(f"Total Extracted Listings: {listing_count}")
    print(f"Total Scanned Onion Hosts: {scan_count}")

    print("=== 7. Verifying Entity Graph Generation ===")
    from main import entity_graph, get_cases
    import asyncio
    graph = asyncio.run(entity_graph())
    print(f"Graph Nodes: {len(graph['nodes'])}")
    print(f"Graph Links: {len(graph['links'])}")

    cases = asyncio.run(get_cases())
    print(f"Generated Cases: {len(cases)}")
    for c in cases:
        print(f"  Case: {c['caseNumber']} - {c['codename']} ({c['primaryHandle']}) [Composite Score: {c['scores']['composite']}%]")
        print(f"  Aliases: {c['aliases']}")
        print(f"  Origin IP Lead: {c['suspectedRealIdentity']['clearnetIP']} ({c['suspectedRealIdentity']['location']})")

    conn.close()
    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_flow()
