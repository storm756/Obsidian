from urllib.parse import urlparse
from datetime import datetime, timezone
import os

from db import get_conn
from crawler import extract_listing, extract_links
from scanner import run_full_scan

MAX_HTML_BYTES = 500_000


def _get_hostname(url: str) -> str:
    if not url.startswith("http"):
        url = f"http://{url}"
    return urlparse(url).netloc


def run_pipeline(seed_url: str, session, max_pages: int = 200) -> dict:
    conn = get_conn()

    seed_hostname = _get_hostname(seed_url)
    conn.execute(
        "INSERT OR IGNORE INTO urls (url, hostname, crawled, discovered_at) VALUES (?, ?, 0, ?)",
        (seed_url, seed_hostname, datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()

    scanned_hosts = {
        row["hostname"]
        for row in conn.execute("SELECT hostname FROM infra_scans").fetchall()
    }

    pages_done = 0
    hosts_scanned_this_run = 0

    while pages_done < max_pages:
        row = conn.execute("SELECT url FROM urls WHERE crawled = 0 LIMIT 1").fetchone()
        if row is None:
            break
        url = row["url"]
        hostname = _get_hostname(url)

        # Scan this host exactly once, the first time we see it, regardless
        # of how many pages under it we discover later.
        if hostname not in scanned_hosts:
            scan_result = run_full_scan(
                hostname,
                shodan_key=os.getenv("SHODAN_API_KEY"),
                censys_id=os.getenv("CENSYS_API_ID"),
                censys_secret=os.getenv("CENSYS_API_SECRET"),
            )
            import json
            conn.execute(
                "INSERT OR REPLACE INTO infra_scans (hostname, scan_json, scanned_at) VALUES (?, ?, ?)",
                (hostname, json.dumps(scan_result), datetime.now(timezone.utc).isoformat()),
            )
            conn.commit()
            scanned_hosts.add(hostname)
            hosts_scanned_this_run += 1

        try:
            fetch_url = url if url.startswith("http") else f"http://{url}"
            resp = session.get(fetch_url, timeout=15)
            resp.raise_for_status()
            html = resp.text[:MAX_HTML_BYTES]
        except Exception:
            conn.execute(
                "UPDATE urls SET crawled=1, crawled_at=? WHERE url=?",
                (datetime.now(timezone.utc).isoformat(), url),
            )
            conn.commit()
            pages_done += 1
            continue

        listing = extract_listing(html, url)
        if listing:
            conn.execute(
                """INSERT INTO listings
                   (url, hostname, source_site, handle, category, listing_text, snippet, content_hash, pgp_key, wallet_address, timestamp, extracted_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    url,
                    listing["hostname"],
                    listing["source_site"],
                    listing["handle"],
                    listing["category"],
                    listing["listing_text"],
                    listing["snippet"],
                    listing["content_hash"],
                    listing["pgp_key"],
                    listing["wallet_address"],
                    listing["timestamp"],
                    datetime.now(timezone.utc).isoformat(),
                ),
            )

        for link in extract_links(html, url):
            link_hostname = _get_hostname(link)
            conn.execute(
                "INSERT OR IGNORE INTO urls (url, hostname, crawled, discovered_at) VALUES (?, ?, 0, ?)",
                (link, link_hostname, datetime.now(timezone.utc).isoformat()),
            )

        conn.execute(
            "UPDATE urls SET crawled=1, crawled_at=? WHERE url=?",
            (datetime.now(timezone.utc).isoformat(), url),
        )
        conn.commit()
        pages_done += 1

    conn.close()
    return {"pagesProcessed": pages_done, "hostsScanned": hosts_scanned_this_run}
