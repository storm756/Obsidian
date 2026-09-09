# Obsidian

> A controlled, fictional Tor testbed and analyst prototype for demonstrating
> threat-actor correlation techniques in authorised environments.

![Status](https://img.shields.io/badge/demo-authorised%20use%20only-1f9d74)
![Docker](https://img.shields.io/badge/runtime-Docker%20Compose-2496ED)

## What this project demonstrates

Obsidian is an SIH prototype for dark-web threat-actor de-anonymisation. It is
designed for safe, offline-style demonstrations only. The included testbed does
**not** contain real marketplaces, illegal products, credentials, payment
capabilities, contact methods, or live targets.

The prototype brings together four investigative signals:

1. **Infrastructure exposure** - detect deliberately exposed status pages in a
   controlled Tor environment.
2. **Identity graph correlation** - connect handles using exact shared PGP key
   blocks and wallet-like identifiers.
3. **Stylometric persona analysis** - compare repeated wording and writing
   patterns across fictional aliases.
4. **Explainable fusion** - present multiple signals as auditable evidence,
   rather than treating AI output as a final conclusion.

## Included controlled testbed

Docker Compose starts exactly two services:

| Service | Purpose |
| --- | --- |
| `obsidian-web` | Apache serving static HTML from `testbed/` |
| `obsidian-tor` | Tor hidden service forwarding onion port 80 to Apache |

The static site contains:

- Five fictional site paths: `market-a`, `market-b`, `market-c`, `forum-a`,
  and `forum-b`.
- 55 synthetic listing records, all reachable from the root page by standard
  HTML links.
- Eight deliberately correlated fictional actor groups, reusing exact PGP
  blocks or wallet-like identifiers across different aliases.
- Consistent writing styles across selected aliases for stylometry demos.
- Ten cross-site links that emulate forum-to-market references.
- Two intentional static exposure fixtures:
  `/market-a/server-status` and `/forum-b/server-status`.

## Requirements

- Docker Desktop with the Linux/WSL2 engine running
- Tor Browser to view the `.onion` testbed
- Node.js 18+ for the dashboard
- Python 3.10+ for the optional local analysis backend

> **Storage note:** keep both the repository and Docker Desktop's disk image on
> `D:`. Docker Desktop storage is configured through **Settings → Resources →
> Advanced → Disk image location**.

## Quick start: Tor testbed

Open PowerShell in this project folder:

```powershell
Set-Location D:\Obsidian
docker compose up -d
docker compose ps
```

Get the generated onion hostname:

```powershell
docker compose exec tor cat /var/lib/tor/testbed/hostname
```

Open the returned value in Tor Browser, prefixed with `http://`:

```text
http://your-generated-address.onion/
```

### Stop the testbed

```powershell
docker compose down
```

This preserves the Tor volume, so the onion address remains the same. Use the
following only when you intentionally want a brand-new Tor identity and onion
address:

```powershell
docker compose down -v
```

## Dashboard

In a second PowerShell window:

```powershell
Set-Location D:\Obsidian
npm config set cache D:\npm-cache
npm install
npm run dev
```

Open the localhost address printed by Vite, normally
`http://localhost:5173`.

## Optional live analysis backend

Keep the Docker testbed running. In a third PowerShell window:

```powershell
Set-Location D:\Obsidian\backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --no-cache-dir -r requirements.txt
$env:TOR_PROXY_HOST="127.0.0.1"
$env:TOR_PROXY_PORT="9050"
$env:TESTBED_ONION_URL="your-generated-address.onion"
uvicorn main:app --host 0.0.0.0 --port 8000
```

Refresh the dashboard. It will read `TESTBED_ONION_URL`, route requests through
the local Tor SOCKS proxy at port `9050`, and make the controlled scan and graph
endpoints available on `http://localhost:8000`.

## Suggested demo flow

1. Open the testbed root in Tor Browser and explain that it is fictional,
   static training data.
2. Navigate between sites and open a few records.
3. Visit the two intentional `/server-status` fixtures and contrast them with
   the three clean site folders.
4. Start the dashboard and backend, then scan the generated onion address.
5. Open the entity graph to demonstrate links created by exact shared PGP or
   wallet evidence.
6. Use the stylometry and fusion views to explain why corroborated evidence is
   stronger than a single similarity score.

## Project layout

```text
.
├── docker-compose.yml     # Apache + Tor testbed
├── testbed/               # Static fictional websites and records
├── tor/torrc              # Hidden-service configuration
├── backend/               # FastAPI crawler, graph and scanner endpoints
└── src/                   # React analyst dashboard
```

For a full technical continuation guide - including the boundary between live
features and demo data - read [HANDOVER.md](HANDOVER.md).

## Safety and scope

Only scan this local, authorised testbed or systems for which you have explicit
permission. Do not use this project to target real onion services or real-world
individuals. Automated correlation is an analyst-assistance signal and should
be reviewed by a qualified human before any conclusion is made.
