from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone
from collections import defaultdict
import json
import os

from scanner import run_full_scan, get_tor_session
from pipeline import run_pipeline
from db import init_db, get_conn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()


class ScanRequest(BaseModel):
    onion_url: str


@app.get("/api/testbed-target")
async def testbed_target():
    configured_target = os.getenv("TESTBED_ONION_URL")
    if configured_target:
        return {"onion_url": configured_target}

    hostname_path = "/var/lib/tor/testbed/hostname"
    try:
        with open(hostname_path, "r") as f:
            onion_url = f.read().strip()
        return {"onion_url": onion_url}
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/infra-scan")
async def infra_scan(req: ScanRequest):
    result = run_full_scan(
        req.onion_url,
        shodan_key=os.getenv("SHODAN_API_KEY"),
        censys_id=os.getenv("CENSYS_API_ID"),
        censys_secret=os.getenv("CENSYS_API_SECRET"),
    )

    conn = get_conn()
    conn.execute(
        "INSERT OR REPLACE INTO infra_scans (hostname, scan_json, scanned_at) VALUES (?, ?, ?)",
        (req.onion_url, json.dumps(result), datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    conn.close()

    return result


@app.post("/api/run-investigation")
async def run_investigation(req: ScanRequest):
    session = get_tor_session()
    result = run_pipeline(req.onion_url, session)
    return result


@app.get("/api/listings")
async def get_listings():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM listings ORDER BY extracted_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/api/urls")
async def get_urls():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM urls ORDER BY discovered_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/api/entity-graph")
async def entity_graph():
    conn = get_conn()
    rows = conn.execute(
        "SELECT url, handle, pgp_key, wallet_address FROM listings WHERE handle IS NOT NULL"
    ).fetchall()
    conn.close()

    nodes = {}
    links = []

    def add_node(node_id, label, ntype, properties=None):
        if node_id not in nodes:
            nodes[node_id] = {
                "id": node_id,
                "label": label,
                "type": ntype,
                "properties": properties or {},
            }

    for row in rows:
        actor_id = f"actor-{row['handle']}"
        add_node(actor_id, row["handle"], "actor", {"source_url": row["url"]})

        if row["pgp_key"]:
            pgp_id = f"pgp-{hash(row['pgp_key']) % 100000}"
            add_node(pgp_id, f"PGP: {row['pgp_key'][:20]}...", "pgp")
            links.append({
                "source": actor_id,
                "target": pgp_id,
                "relationship": "USED_PGP",
                "confidence": 100,
                "evidenceSource": f"Extracted from {row['url']}",
                "observedDate": "",
            })

        if row["wallet_address"]:
            wallet_id = f"wallet-{row['wallet_address'][:12]}"
            add_node(wallet_id, f"Wallet: {row['wallet_address'][:12]}...", "wallet")
            links.append({
                "source": actor_id,
                "target": wallet_id,
                "relationship": "TRANSACTED_WITH",
                "confidence": 100,
                "evidenceSource": f"Extracted from {row['url']}",
                "observedDate": "",
            })

    # Exact-match linking: actors sharing a PGP key or wallet get an ALIAS_OF edge
    by_pgp = defaultdict(set)
    by_wallet = defaultdict(set)
    for row in rows:
        if row["pgp_key"]:
            by_pgp[row["pgp_key"]].add(row["handle"])
        if row["wallet_address"]:
            by_wallet[row["wallet_address"]].add(row["handle"])

    seen_pairs = set()
    for group in list(by_pgp.values()) + list(by_wallet.values()):
        handles = list(group)
        for i in range(len(handles)):
            for j in range(i + 1, len(handles)):
                pair = tuple(sorted([handles[i], handles[j]]))
                if pair in seen_pairs:
                    continue
                seen_pairs.add(pair)
                links.append({
                    "source": f"actor-{pair[0]}",
                    "target": f"actor-{pair[1]}",
                    "relationship": "ALIAS_OF",
                    "confidence": 95,
                    "evidenceSource": "Shared PGP key or wallet address across listings",
                    "observedDate": "",
                })

    return {"nodes": list(nodes.values()), "links": links}
