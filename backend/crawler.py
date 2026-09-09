# backend/crawler.py
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from datetime import datetime, timezone
import re
from db import get_conn

PGP_RE = re.compile(r"-----BEGIN PGP PUBLIC KEY BLOCK-----.*?-----END PGP PUBLIC KEY BLOCK-----", re.DOTALL)
WALLET_RE = re.compile(r"\b(bc1[a-z0-9]{25,60}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b")

def extract_listing(html: str, url: str) -> dict | None:
    soup = BeautifulSoup(html, "html.parser")
    listing_el = soup.select_one("[data-obsidian-listing='true']")
    if not listing_el:
        return None
    handle_el = listing_el.select_one(".handle, .vendor-name, h1")
    if not handle_el:
        return None
    text = listing_el.get_text(separator=" ", strip=True)
    pgp_match = PGP_RE.search(html)
    wallet_match = WALLET_RE.search(text)
    category_el = listing_el.select_one(".category")
    timestamp_el = listing_el.select_one("time.timestamp")
    return {
        "handle": handle_el.get_text(strip=True),
        "category": category_el.get_text(strip=True) if category_el else None,
        "listing_text": text[:2000],
        "pgp_key": pgp_match.group(0) if pgp_match else None,
        "wallet_address": wallet_match.group(0) if wallet_match else None,
        "timestamp": timestamp_el.get("datetime") if timestamp_el else None,
    }

def extract_links(html: str, base_url: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    links = []
    for a in soup.find_all("a", href=True):
        full = urljoin(base_url, a["href"])
        parsed = urlparse(full)
        if parsed.netloc.endswith(".onion"):
            links.append(full)
    return links

def crawl(seed_url: str, session, max_pages: int = 200):
    conn = get_conn()
    conn.execute(
        "INSERT OR IGNORE INTO urls (url, crawled, discovered_at) VALUES (?, 0, ?)",
        (seed_url, datetime.now(timezone.utc).isoformat())
    )
    conn.commit()

    pages_done = 0
    while pages_done < max_pages:
        row = conn.execute("SELECT url FROM urls WHERE crawled = 0 LIMIT 1").fetchone()
        if row is None:
            break
        url = row["url"]

        try:
            resp = session.get(url, timeout=15)
            resp.raise_for_status()
            html = resp.text[:500_000]  # size cap per your own security notes
        except Exception:
            conn.execute("UPDATE urls SET crawled=1, crawled_at=? WHERE url=?",
                         (datetime.now(timezone.utc).isoformat(), url))
            conn.commit()
            continue

        listing = extract_listing(html, url)
        if listing:
            conn.execute(
                "INSERT INTO listings (url, handle, category, listing_text, pgp_key, wallet_address, timestamp, extracted_at) VALUES (?,?,?,?,?,?,?,?)",
                (url, listing["handle"], listing["category"], listing["listing_text"], listing["pgp_key"],
                 listing["wallet_address"], listing["timestamp"], datetime.now(timezone.utc).isoformat())
            )

        for link in extract_links(html, url):
            conn.execute(
                "INSERT OR IGNORE INTO urls (url, crawled, discovered_at) VALUES (?, 0, ?)",
                (link, datetime.now(timezone.utc).isoformat())
            )

        conn.execute("UPDATE urls SET crawled=1, crawled_at=? WHERE url=?",
                     (datetime.now(timezone.utc).isoformat(), url))
        conn.commit()
        pages_done += 1

    conn.close()
    return pages_done
