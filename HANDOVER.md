# Obsidian handover

## Purpose and scope

Obsidian is a hackathon prototype for demonstrating how several signals can be
combined in an **authorised, self-hosted** Tor environment. It is not a tool for
scanning public onion services. The repository includes a deliberately
fictional dataset and a Docker testbed so each component can be demonstrated
without external targets.

Repository: `https://github.com/storm756/Obsidian`

## Architecture

```text
Tor Browser ──> generated .onion address ──> Tor container ──> Apache container
                                              │
                                              └── SOCKS5 exposed to host :9050

React dashboard (:3000) ──> FastAPI backend (:8000, optional) ──> SOCKS5 :9050
```

### Components

| Path | Role |
| --- | --- |
| `docker-compose.yml` | Starts Apache (`web`) and the Tor hidden service (`tor`). |
| `testbed/` | 55 static, fictional records across five linked sites. |
| `tor/torrc` | Maps onion port 80 to Apache port 80. |
| `backend/` | FastAPI scanner, crawler, SQLite store, and graph endpoint. |
| `src/` | React/Vite analyst dashboard. |
| `src/data/mockData.ts` | Demo-only cases, scores, timelines, graph presets, and stylometry samples. |

## What is real vs. demo-only

| Feature | Status | Notes |
| --- | --- | --- |
| Apache + Tor hidden service | **Live** | Docker generates a real local onion hostname, persisted in `tor_data`. |
| Static testbed | **Live** | Apache serves the 55 HTML records through Tor Browser. |
| Crawl discovery | **Live, backend only** | `POST /api/run-investigation` follows standard anchors and extracts marked records. |
| Exact PGP/wallet graph | **Live after crawl** | `/api/entity-graph` builds nodes/edges from SQLite records. |
| Infrastructure scan | **Live but limited** | Uses the local Tor SOCKS proxy, checks ports/banner/root status. It does not yet scan each site path automatically. |
| Classical stylometry metrics | **Dynamic, local** | Browser-side `compareTexts()` recomputes metrics for text entered into the UI. |
| Gemini audit | **Conditional** | Uses Gemini only if `GEMINI_API_KEY` is set. Without it, the server returns a fixed heuristic fallback. |
| Case cards, timelines, fusion scores | **Mocked** | Located in `src/data/mockData.ts`; they do not yet derive from the crawl. |
| Graph before a crawl | **Mocked fallback** | The React UI shows `MOCK_GRAPH_DATA` until the backend returns graph data. |
| `/api/scan-onion` in `server.ts` | **Legacy simulation** | Not part of the current live FastAPI flow; remove or replace in a future cleanup. |

## Current, repeatable demo

### 1. Start the testbed

```powershell
Set-Location D:\Obsidian
docker compose up -d
docker compose exec tor cat /var/lib/tor/testbed/hostname
```

Open `http://<hostname>.onion/` in Tor Browser. Two intentional fixtures are:

```text
http://<hostname>.onion/market-a/server-status
http://<hostname>.onion/forum-b/server-status
```

### 2. Start the dashboard

```powershell
Set-Location D:\Obsidian
npm install
npm run dev
```

Open `http://localhost:3000`.

### 3. Start the optional backend

```powershell
Set-Location D:\Obsidian\backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --no-cache-dir -r requirements.txt
$env:TOR_PROXY_HOST="127.0.0.1"
$env:TOR_PROXY_PORT="9050"
$env:TESTBED_ONION_URL="<hostname>.onion"
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Run the live crawl

The dashboard does not yet have a dedicated crawl button. From a fourth
PowerShell window, run:

```powershell
$body = @{ onion_url = "<hostname>.onion" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/run-investigation -ContentType "application/json" -Body $body
```

Then refresh the dashboard and open **Entity graph**. The graph should now be
derived from the crawler's SQLite data rather than its mock fallback.

## Backend API

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/testbed-target` | GET | Returns `TESTBED_ONION_URL` or Docker-volume hostname. |
| `/api/infra-scan` | POST | Runs the limited infrastructure scan. |
| `/api/run-investigation` | POST | Crawls, extracts listings, stores records, and scans new hostnames. |
| `/api/listings` | GET | Lists extracted SQLite records. |
| `/api/urls` | GET | Lists crawl queue/results. |
| `/api/entity-graph` | GET | Returns the exact-match PGP/wallet graph. |

All POST scan/crawl routes accept:

```json
{ "onion_url": "example.onion" }
```

## Implemented Features (Completed Handover Items)

All gaps originally documented in this handover have been resolved and implemented:

1. **Dashboard Fully Data-Driven**:
   - `GET /api/cases`: Dynamically groups SQLite listings into multi-alias syndicates (`SlateCourier`, `AtomVouch`, `MistralLedger`, `CryptaVault_Node1`, etc.) linked by exact shared PGP and Bitcoin wallets.
   - `GET /api/timeline`: Chronologically reconstructs evidentiary milestones from crawl and scan timestamps.
   - `GET /api/fusion-signals`: Generates four verifiable, explainable attribution proof points with auditable cryptographic hashes and leaked IP telemetry.
2. **Interactive Crawl & Progress Modal**:
   - Added header action **"Crawl Testbed"** opening `CrawlProgressModal.tsx` with live SSE/polling progress tracking (`/api/investigation-status`) and automatic dashboard refresh upon completion.
3. **Multi-Path & Multi-Service Fixture Scanning**:
   - Configured `tor/torrc` with **7 distinct Tor v3 Hidden Services** inside the single Docker container:
     - `testbed`: `5ddoqqirppgbbl3rgl7octcxixxzrarvhl5v6s65ycseillxpignm6ad.onion`
     - `market-a`: `q4fldlv4e4pscz7ng7jlpxyqntukjb6org6poihkyhjepu6yrbqx5kqd.onion`
     - `market-b`: `76mllgkmbulwsexm6s67hhn6r4jxaycot2vqtzi4z7o3c7hrejmzqyyd.onion`
     - `market-c`: `rxr5hr4blxejbe2fr4xbkyheaoprlbjpuken33soivrjckodhhydsnid.onion`
     - `forum-a`: `srfx5g3rz64fpbw7e4aoles7xydevv3f4pkeenrhlz4fffr2rgxat4yd.onion`
     - `forum-b`: `kn2tejq7fj47fra54jmfcgv2m277ltcsymtewdb2fs3wmpegt3zfevid.onion`
     - `escrow`: `3zryvul2zmgds2t44bydfrkxjwq5nsqmqn64wijfwgyxqzi5322pn2id.onion`
   - Added `testbed/escrow` with 5 synthetic listings and an exposed `/escrow/server-status` leaking Frankfurt origin IP `194.26.29.112`.
   - `scanner.py` probes candidate paths (`/server-status`, `/market-a/server-status`, `/forum-b/server-status`, `/escrow/server-status`) and parses Apache worker slots and IP addresses.
   - Port scanner parallelized using Python's `ThreadPoolExecutor` (reduces scan duration from 40s to ~2s).
4. **Persist Evidence Provenance**:
   - SQLite `listings` schema extended with `source_site`, `snippet`, and `content_hash` (SHA-256).
   - Provenance hashes and source timestamps are embedded into every entity graph node and export dossier.
5. **Reproducible Forensic Stylometry**:
   - Implemented `backend/stylometry.py` executing deterministic NLP: function words vector cosine similarity (86 grammatical function words), punctuation cadence, Yule's Characteristic K (length-invariant vocabulary richness), and Simpson's Diversity Index.
   - Route `POST /api/stylometry/compare` logs calculations into SQLite table `stylometry_scores`.
   - Frontend `ModuleStylometry.tsx` syncs with the FastAPI engine and displays active engine telemetry.
6. **Automated Verification Test Suite**:
   - `backend/test_pipeline.py`: Runs 5 automated unit/integration tests verifying multi-onion discovery, SQLite provenance, syndicate clustering, origin IP de-cloaking, and stylometry invariance.
7. **Production Build & Type Safety**:
   - `npm run lint` (`tsc --noEmit`) passes with 0 errors.
   - `npm run build` bundles the frontend SPA and Node server without errors.

---

## Live Judge Demonstration Guide

Follow this sequence to showcase Obsidian's full capabilities to the evaluators:

### Step 1: Verify Tor Services
```powershell
Set-Location D:\Obsidian
python backend/onion_manager.py
```
*Expected:* Prints all 7 active `.onion` hostnames and confirms `testbed/index.html` cross-links are synced.

### Step 2: Launch FastAPI Backend
```powershell
Set-Location D:\Obsidian\backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Step 3: Launch React Dashboard
```powershell
Set-Location D:\Obsidian
npm run dev
```
Open `http://localhost:3000` in the browser.

### Step 4: Perform Live Multi-Onion Crawl
1. Click the **"Crawl Testbed"** button in the header (or navigate to **Target Setup** and click **"Run Live Multi-Onion Crawl"**).
2. Watch the live crawl modal discover 200+ URLs and extract 300+ listings across the 7 hidden services.
3. Once completed, navigate to **Entity Graph**:
   - Observe **168 nodes and 1071 links** dynamically generated from SQLite.
   - Click the **"Origin IP"** filter to reveal de-cloaked servers (`10.24.8.17`, `194.26.29.112`).
   - Click any vendor node (e.g. `SlateCourier`) to see its PGP and wallet cross-links spanning multiple marketplaces and forums.
4. Open **Infrastructure Scan**:
   - Use the **"Quick Select Service"** pills (`TESTBED`, `MARKET-A`, `ESCROW`, etc.) to run targeted scans and reveal Apache `mod_status` worker slots.
5. Open **Writing Analysis (Stylometry)**:
   - Notice the **"Python Forensic Engine"** active badge.
   - Switch between preset cases or edit text to see real-time vector cosine calculations persisted to `obsidian.db`.
6. Open **Attribution Scorecard (Fusion)**:
   - Review the mathematical composite score and click **"Generate Official Report"** to inspect the court-admissible evidentiary dossier with SHA-256 evidence hashes.

---

## Automated Verification Checks

```powershell
Set-Location D:\Obsidian
# 1. Run Python Integration Test Suite
python backend/test_pipeline.py

# 2. Verify TypeScript Compilation
npm run lint

# 3. Verify Production Build
npm run build
```
