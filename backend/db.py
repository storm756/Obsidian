import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "obsidian.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS urls (
        url TEXT PRIMARY KEY,
        hostname TEXT,
        source_folder TEXT,        -- market-a, forum-b, escrow, etc.
        crawled BOOLEAN DEFAULT 0,
        discovered_at TEXT,
        crawled_at TEXT
    );

    CREATE TABLE IF NOT EXISTS listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT REFERENCES urls(url),
        hostname TEXT,
        source_site TEXT,          -- market-a, market-b, forum-a, etc.
        handle TEXT,
        category TEXT,
        listing_text TEXT,
        snippet TEXT,
        content_hash TEXT,
        pgp_key TEXT,
        wallet_address TEXT,
        timestamp TEXT,
        extracted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS infra_scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hostname TEXT UNIQUE,
        scan_json TEXT,            -- store the full InfraScanResult as JSON
        scanned_at TEXT
    );

    CREATE TABLE IF NOT EXISTS stylometry_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handle_a TEXT,
        handle_b TEXT,
        similarity_score REAL,
        metrics_json TEXT,
        computed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_listings_pgp ON listings(pgp_key);
    CREATE INDEX IF NOT EXISTS idx_listings_wallet ON listings(wallet_address);
    CREATE INDEX IF NOT EXISTS idx_listings_handle ON listings(handle);
    CREATE INDEX IF NOT EXISTS idx_urls_hostname ON urls(hostname);
    CREATE INDEX IF NOT EXISTS idx_stylometry_handles ON stylometry_scores(handle_a, handle_b);
    """)
    conn.commit()
    conn.close()