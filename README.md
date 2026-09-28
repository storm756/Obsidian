# OBSIDIAN: Autonomous Dark Web Threat Actor De-Anonymization & Attribution Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Compose%20v2-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Tor](https://img.shields.io/badge/Tor-v3%20Hidden%20Services-7D4698?logo=tor-project&logoColor=white)](https://www.torproject.org/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![STIX 2.1](https://img.shields.io/badge/Format-STIX%202.1%20Compliant-red)](https://oasis-open.github.io/cti-documentation/)

> **A specialized intelligence and digital forensics workstation designed for cyber defense units, intelligence agencies (NTRO), and law enforcement to autonomously identify, track, and de-anonymize threat actors across the Tor darknet.**

---

## 1. Executive Summary

Threat actors on the Dark Web operate under the assumption that onion routing and persona rotation guarantee absolute impunity. Cyber syndicates routinely discard vendor handles, migrate across illicit marketplaces, and split cryptocurrency transactions to break chain-of-custody tracking.

**Obsidian** shatters this assumption. Rather than relying on a single fallible clue, Obsidian introduces an **autonomous, 4-pillar multi-signal attribution engine** that triangulates across:
1. **Network Infrastructure Vulnerabilities** (origin IP leaks, unhardened status handlers, TLS certificate reuse).
2. **Cryptographic & Financial Entity Graphs** (OpenPGP key fingerprint matching, Bitcoin SegWit UTXO co-spending).
3. **Behavioral AI Stylometry** (subconscious function-word distribution, lexical richness, punctuation cadence).
4. **Mathematical Fusion & Court-Admissible Dossier Generation** (composite Bayesian-weighted confidence scoring, STIX 2.1 exports, and REST APIs for national intelligence systems).

---

## 2. Core Pillars of Attribution

```
┌────────────────────────────────────────────────────────────────────────┐
│                          TARGET RECONNAISSANCE                         │
│             Seed .onion Discovery via Isolated SOCKS5h Proxy           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│     PILLAR 1     │      │     PILLAR 2     │      │     PILLAR 3     │
│  INFRASTRUCTURE  │      │   ENTITY GRAPH   │      │  AI STYLOMETRY   │
│  RECONNAISSANCE  │      │   CORRELATION    │      │    PROFILING     │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│• Server Banners  │      │• 4096-bit RSA PGP│      │• Function Words  │
│• Apache Status   │      │• BTC SegWit UTXO │      │• Cosine Concord. │
│• Origin IP Leak  │      │• Cross-Site Link │      │• Yule's K Metric │
│• TLS Cert Hash   │      │• Shortest Path   │      │• AI Ling. Audit  │
└────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
         │                         │                         │
         │ [40% Weight]            │ [35% Weight]            │ [25% Weight]
         └─────────────────────────┼─────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        MATHEMATICAL FUSION LAYER                       │
│    Composite Confidence: 95.8% · Court-Admissible NTRO Evidence Ledger │
│             Exports: Formal Dossier · STIX 2.1 · Graph CSV             │
└────────────────────────────────────────────────────────────────────────┘
```

### Pillar 1: Infrastructure Reconnaissance & Misconfigurations
- **Passive & Active Onion Probing**: Uses remote-DNS SOCKS5h routing to evaluate target onion services without DNS contamination.
- **Leak Vector Detection**: Scans for unhardened server endpoints (e.g., Apache `mod_status` at `/server-status`), dumping active worker slots, backend server uptimes, and internal RFC1918 subnets.
- **Clearnet Origin IP Deanonymization**: Correlates gateway routing and TLS X.509 certificate SHA-256 fingerprints to identify the operator's true physical host, datacenter, and Autonomous System (ASN).
- **Automated Infrastructure Assessment**: Integrates on-demand AI risk analysis to evaluate attack surfaces and subpoena targets.

### Pillar 2: Cryptographic & Financial Entity Graph
- **Relational Evidence Topology**: Models vendors, forums, markets, PGP keys, and cryptocurrency wallets in an interactive force-directed graph.
- **Cryptographic Fingerprint Matching**: Detects exact 4096-bit OpenPGP master public key reuse across seemingly unrelated storefronts, proving private key possession.
- **Blockchain Co-Spending Clustering**: Applies Common Input Ownership Heuristics (CIOH) on Bitcoin SegWit addresses to uncover shared wallet controllers.
- **Forensic Filtering & Pathfinding**: One-click filters for PGP, Wallet, Marketplace, and Origin IP, plus **Trace Shortest Path** to calculate multi-hop evidentiary trails from alias to physical host.

### Pillar 3: Behavioral AI Stylometry
- **Subconscious Linguistic Fingerprinting**: Analyzes invariant subconscious syntax—frequencies of non-contextual function words (modal verbs, prepositions, determiners), sentence lengths, and idiosyncratic punctuation habits.
- **Statistical Metric Suite**: Computes cosine concordance matrices, Yule's K characteristic vocabulary richness, and Simpson's D index.
- **Automated Forensic Linguistic Audit**: An integrated AI forensic evaluation engine generates formal authorship memorandums assessing whether two profiles represent persona migration or distinct individuals.

### Pillar 4: Mathematical Evidence Fusion & Court Dossiers
- **Weighted Multi-Signal Synthesis**: Eliminates guesswork by calculating a composite confidence rating:
  $$\text{Composite Score} = (0.40 \times \text{Infra}) + (0.35 \times \text{Graph}) + (0.25 \times \text{Stylometry})$$
- **Court-Admissible Evidence Ledger**: Produces tamper-evident forensic intelligence dossiers meeting Indian Evidence Act / Daubert standards.
- **Open Standards Interoperability**: Instant export to **STIX 2.1 JSON**, CSV relationship matrices, and REST APIs for national intelligence pipelines (NTRO, CERT-In, Law Enforcement Agencies).

---

## 3. Real Tor v3 Sandboxed Testbed

> **Legal & Ethical Compliance Note**: Actively scraping or probing live dark web criminal infrastructure without judicial warrants carries severe legal liabilities. To enable safe, repeatable, and court-verifiable validation, Obsidian includes an isolated, containerized Tor testbed.

The sandboxed environment provisions **7 independent, real Tor v3 hidden services** running over an isolated Docker bridge:

| Service Codename | Service Role | Sample Synthetic Records |
| :--- | :--- | :--- |
| **`testbed`** | Central Directory & Cross-Onion Index | Navigation hub linking all nodes |
| **`market-a`** (Aster Market) | Illicit Credential Storefront | 11 synthetic catalog listings |
| **`market-b`** (Boreal Exchange) | Counterfeit Goods Marketplace | 12 synthetic vendor profiles |
| **`market-c`** (Cinder Bazaar) | Data Broker & Exploit Archive | 11 synthetic offers |
| **`forum-a`** (Lantern Forum) | Threat Actor Dispute Community | 11 synthetic discussion threads |
| **`forum-b`** (Harbor Board) | Sybil Vendor Review Board | 10 synthetic reputation posts |
| **`escrow`** (CryptaVault) | Tumbler & Multi-Sig Escrow Node | 5 synthetic settlement records |

> **Production Deployment**: When operated by authorized defense personnel with proper warrants, Obsidian's crawler switches from the local testbed to any target `.onion` URL on the live Tor network without code modifications.

---

## 4. Quick Start & Installation

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (WSL2 engine enabled)
- [Node.js 18+](https://nodejs.org/) & `npm`
- [Python 3.10+](https://www.python.org/)
- [Tor Browser](https://www.torproject.org/) (optional, for viewing `.onion` sites directly)

### Step 1: Clone Repository & Configure Environment
```bash
git clone https://github.com/storm756/Obsidian.git
cd Obsidian

# Copy example environment configuration
cp .env.example .env
```

Add your optional AI API key to `.env` for live on-demand linguistic and case synthesis reports:
```env
GEMINI_API_KEY=your_api_key_here
TOR_PROXY_HOST=127.0.0.1
TOR_PROXY_PORT=9050
```

### Step 2: Launch Tor Testbed Containers
```bash
docker compose up -d
docker compose ps
```

Extract the newly generated Tor v3 hidden service addresses:
- **Windows (Command Prompt)**: `extract_onions.bat`
- **Windows (PowerShell)**: `powershell -ExecutionPolicy Bypass -File .\extract_onions.ps1`
- **Linux / macOS**: `./extract_onions.sh`

### Step 3: Start the Backend Analytics Engine
```bash
# In terminal 1:
python -m venv .venv
# Windows: .venv\Scripts\activate | Linux: source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
*API Swagger Documentation is available at: [http://localhost:8000/docs](http://localhost:8000/docs)*

### Step 4: Start the Analyst Workstation Dashboard
```bash
# In terminal 2:
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Analyst Workstation Tour

| Tab | Hotkey | Functionality |
| :--- | :---: | :--- |
| **Overview** | `1` | Case management, suspect profile, executive summary, and attribution score. |
| **Setup & Testbed** | `2` | Tor container diagnostics, live `.onion` service health, and automated crawler trigger. |
| **Infra Recon** | `3` | Live SOCKS5 port scan, server banner harvesting, status leak detection, and AI attack-surface evaluation. |
| **Entity Graph** | `4` | D3.js interactive graph, PGP/Wallet filters, Cypher query console, and Shortest Path tracing. |
| **Stylometry** | `5` | Dual-text comparative stylometry, cosine concordance matrix, and on-demand AI Linguistic Audits. |
| **Fusion Layer** | `6` | Mathematical evidence weighting, verifiable proof points, and NTRO dossier export center. |
| **Timeline** | `7` | Chronological breadcrumbs of persona migrations, infrastructure changes, and transaction logs. |

---

## 6. Interoperability & Export Center

Obsidian is engineered for seamless integration into national intelligence ecosystems:
- **STIX 2.1 JSON**: Standardized Cyber Threat Intelligence (CTI) bundle ready for ingestion into MISP, OpenCTI, and agency SIEMs.
- **Forensic Dossier (.txt / .md)**: Court-admissible intelligence summary with cryptographic content hashes, origin IP physical leads, and evidence provenance.
- **Entity Relationship CSV**: Export edge lists for advanced link analysis in **Maltego** and **IBM i2 Analyst's Notebook**.
- **REST API Endpoints**: All endpoints (`/api/cases`, `/api/entity-graph`, `/api/fusion-signals`, `/api/infra-scan`) return structured JSON for programmatic consumption by defense microservices.

---

## 7. Security, Legal & Ethical Guidelines

- **Authorization Required**: This tool is designed strictly for defensive intelligence, academic research, and authorized law enforcement operations.
- **Zero Real Darknet Contamination**: The built-in testbed contains strictly synthetic, fictional data with no real contraband, payment capabilities, or personally identifiable information (PII).
- **Audit Trails**: All database writes maintain UTC timestamps, SHA-256 content hashes, and immutable scan logs to preserve legal chain of custody.

---

## 8. License & Acknowledgements

Developed under the MIT License. Built for national cyber defense competitions and intelligence modernization research. Dedicated to enhancing attribution capabilities against complex darknet threat syndicates.
