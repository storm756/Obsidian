import sys
import asyncio
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from main import entity_graph, get_cases, get_timeline, get_fusion_signals
from onion_manager import get_all_onion_targets
from db import get_conn

def verify():
    print("=== Onion Targets ===")
    targets = get_all_onion_targets()
    for k, v in targets.items():
        print(f"  {k}: {v}")

    print("\n=== Database Record Counts ===")
    conn = get_conn()
    print("  URLs:", conn.execute("SELECT count(*) FROM urls").fetchone()[0])
    print("  Listings:", conn.execute("SELECT count(*) FROM listings").fetchone()[0])
    print("  Infra Scans:", conn.execute("SELECT count(*) FROM infra_scans").fetchone()[0])
    conn.close()

    print("\n=== Entity Graph ===")
    g = asyncio.run(entity_graph())
    print(f"  Total Nodes: {len(g['nodes'])}")
    print(f"  Total Links: {len(g['links'])}")
    node_types = {}
    for n in g['nodes']:
        node_types[n['type']] = node_types.get(n['type'], 0) + 1
    print("  Nodes by Type:", node_types)

    rel_types = {}
    for l in g['links']:
        rel_types[l['relationship']] = rel_types.get(l['relationship'], 0) + 1
    print("  Links by Relationship:", rel_types)

    print("\n=== Derived Cases ===")
    cases = asyncio.run(get_cases())
    print(f"  Cases Count: {len(cases)}")
    for c in cases[:3]:
        print(f"  • {c['codename']} ({c['primaryHandle']})")
        print(f"    Aliases: {c['aliases']}")
        print(f"    Markets: {c['marketplaces']}")
        print(f"    Origin IP: {c['suspectedRealIdentity']['clearnetIP']} ({c['suspectedRealIdentity']['location']})")
        print(f"    Scores: Composite {c['scores']['composite']}% (Infra {c['scores']['infrastructure']}%, Graph {c['scores']['entityGraph']}%, Stylo {c['scores']['stylometry']}%)")

    print("\n=== Verification Completed Successfully! ===")

if __name__ == "__main__":
    verify()
