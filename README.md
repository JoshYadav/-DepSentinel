<p align="center">
  <img src="https://img.shields.io/badge/DepSentinel-Supply%20Chain%20Security-7c3aed?style=for-the-badge&logo=shieldsdotio&logoColor=white" alt="DepSentinel" />
</p>

<h1 align="center">🛡️ DepSentinel</h1>

<p align="center">
  <strong>AI-Powered Software Supply Chain Security Monitor</strong><br/>
  Detect malicious dependencies before they reach production.
</p>

<p align="center">
  <a href="https://github.com/JoshYadav/-DepSentinel/actions/workflows/depsentinel-scan.yml">
    <img src="https://github.com/JoshYadav/-DepSentinel/actions/workflows/depsentinel-scan.yml/badge.svg" alt="DepSentinel Security Scan" />
  </a>
  <img src="https://img.shields.io/badge/python-3.11+-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Blockchain-Ethereum%20Sepolia-627EEA?logo=ethereum&logoColor=white" alt="Ethereum" />
  <img src="https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?logo=google&logoColor=white" alt="Gemini AI" />
</p>

---

## 📌 The Problem

In 2020, the **SolarWinds attack** compromised **33,000+ organizations** — including NASA, the Pentagon, and Microsoft. Attackers silently injected malicious code into a legitimate software update. The attack went **undetected for 9 months**.

**How?** Malicious code was injected into a dependency. Nobody verified whether the package had changed.

**DepSentinel solves this.**

---

## 🏗️ Architecture

```
requirements.txt input
        │
        ▼
  ┌─────────────────┐
  │ Parser & Fetcher │
  └────────┬────────┘
           ▼
  ┌──────────────────────────────────────────┐
  │      4-Layer Detection Pipeline          │
  │                                          │
  │  1. Static Pattern Detection             │
  │  2. OSV CVE Database Query               │
  │  3. Typosquatting Detection              │
  │  4. Gemini AI Behavioral Analysis        │
  └────────────────┬─────────────────────────┘
                   ▼
  ┌──────────────────────────────┐
  │   Risk Engine (Score 0-100)  │
  │   LOW / MEDIUM / HIGH        │
  └──────────┬───────────────────┘
             ▼
     ┌───────┴────────┐
     │                │
   ALLOW            BLOCK
     │                │
     ▼                ▼
  Blockchain       Alert Screen
  Record           + Rollback
  (Sepolia)
     │
     ▼
  SHA-256 Hash
  Chain Ledger
```

---

## ✨ Features

### 🔍 4-Layer Threat Detection Pipeline

| Layer | Description | Technology |
|-------|-------------|------------|
| **Static Pattern Detection** | Scans for dangerous code patterns across 6 threat categories: Code Execution, Obfuscation, Network Exfiltration, Persistence, Sensitive Data Access, Crypto Mining | Python AST & Regex |
| **OSV Vulnerability Intelligence** | Queries Google's Open Source Vulnerability database in real-time, returning actual GHSA/CVE IDs with CVSS severity scores | [Google OSV API](https://osv.dev) |
| **Typosquatting Detection** | Checks package names against the top 5,000 PyPI packages using Levenshtein distance algorithm with confidence scoring | Custom Algorithm |
| **Gemini AI Analysis** | Behavioral intent analysis, attack type classification, and SOC analyst recommendations | Google Gemini 2.5 Flash |

### 🤖 AI-Powered Security Analysis

DepSentinel uses **Google Gemini 2.5 Flash** to provide intelligent security analysis for every scanned package:

- **Behavioral Intent** — One-sentence description of what the package does or what threat it poses
- **Attack Type Classification** — Categorizes threats as Clean, Supply Chain Injection, Typosquatting, Known CVE, or Suspicious
- **Specific Concerns** — Itemized list of security concerns found in the package
- **SOC Analyst Recommendation** — Actionable guidance for Security Operations Center analysts
- **Confidence Scoring** — HIGH / MEDIUM / LOW confidence in the AI's assessment
- **Multi-Model Fallback** — Automatically cycles through `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.0-flash-lite` with retry logic and exponential backoff

### ⛓️ Blockchain Integrity Verification

Every verified safe package is recorded on the **Ethereum Sepolia testnet** as an immutable on-chain transaction:

- **On-Chain Recording** — Zero-value self-transactions with scan data encoded in the `input` field: `DEPSENTINEL:{package}:{version}:{sha256_hash}`
- **Etherscan Verification** — Click any Etherscan link in the Audit Ledger to verify the record exists on-chain — permanently and tamper-proof
- **Hash Verification** — `verify_hash_onchain()` function to cryptographically verify any past scan result against the blockchain
- **Nonce Collision Handling** — Automatic retry with incremented nonce for concurrent transactions
- **Blocked Package Protection** — Malicious packages are never recorded on-chain, only clean packages get immutable proof

### 📊 Analytics Dashboard & Graphs

The **Threat Center** provides rich visual analytics powered by **Recharts**:

- **Exposure Timeline** — 30-day area chart showing scanned vs. blocked packages over time
- **Risk Radar** — Radar chart visualizing attack pattern distribution across 6 threat vectors (Typosquatting, Code Execution, Exfiltration, Obfuscation, Persistence, Known CVEs)
- **Threat Tactics Heatmap** — GitHub-style 12-week heatmap showing threat activity intensity by day
- **Risk Severity Breakdown** — Segmented bar charts showing distribution across Low, Medium, High, and Critical risk categories
- **Animated Stat Cards** — Real-time counters for Total Scans, Threats Blocked, Clean Packages, and Average Risk Score
- **Threats Coverage Panel** — Live counts of PyPI packages monitored, pattern signatures, CVE database entries, and active monitors

### 🔄 CI/CD Pipeline (GitHub Actions)

DepSentinel **scans itself** on every push and pull request:

- **Automated Security Gate** — Runs `scan_ci.py` against `requirements.txt` on every push to `main`/`master`
- **Build Failure on BLOCK** — If any dependency returns a BLOCK verdict, the CI pipeline fails automatically
- **Scan Report Artifact** — Uploads `scan_report.json` as a GitHub Actions artifact for audit trails
- **Secrets Management** — API keys and wallet credentials stored as GitHub Secrets, never in code
- **Live Badge** — The status badge at the top of this README shows the latest scan result in real-time

### 🔐 SHA-256 Cryptographic Audit Ledger

- Every scan produces a **SHA-256 hash** of `{package}:{version}`
- Entries are stored in a tamper-evident **hash chain** (each entry references the previous hash)
- **Tamper detection** — `is_tampered()` validates the entire chain integrity
- **Full audit trail** — Package name, version, hash, verdict, timestamp, and blockchain transaction links

---

## 📄 Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Paste `requirements.txt` and run a security scan with one click |
| **Scan Results** | Diff viewer, threat vector breakdown, AI security analysis card, blockchain verification status |
| **Threat Center** | Full analytics suite — timeline charts, risk radar, threat heatmap, severity distributions |
| **Audit Ledger** | Cryptographic SHA-256 hash chain of all scans with Etherscan verification links |
| **Alert / Block** | Full-screen threat alert for blocked packages with detailed threat breakdown |

---

## 🧪 Demo Test Cases

| Input | Expected Result |
|-------|-----------------|
| `colourama==0.3.9` | 🔴 HIGH — BLOCK (typosquatting of `colorama`) |
| `Pillow==9.0.0` | 🟡 MEDIUM/HIGH — Real CVEs from OSV database |
| `requests==2.31.0` | 🟢 LOW — ALLOW + Etherscan blockchain link |
| `flask==2.3.0` | 🟢 LOW — ALLOW (trusted top-PyPI package) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Tailwind CSS, Framer Motion, Recharts, Lucide Icons |
| **Backend** | Python 3.11+, Flask, Flask-CORS |
| **AI Engine** | Google Gemini 2.5 Flash (multi-model fallback chain) |
| **Blockchain** | Ethereum Sepolia Testnet, Web3.py, Alchemy RPC |
| **Threat Intel** | Google OSV API (Open Source Vulnerabilities) |
| **Integrity** | SHA-256 Cryptographic Hash Chain |
| **CI/CD** | GitHub Actions (automated security gate) |
| **Build Tools** | Vite, PostCSS, ESLint |

---

## 🚀 Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python main.py
```

The backend API will be available at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
GEMINI_API_KEY=your_gemini_api_key
ALCHEMY_RPC_URL=your_alchemy_sepolia_rpc_url
WALLET_PRIVATE_KEY=your_ethereum_wallet_private_key
WALLET_ADDRESS=your_ethereum_wallet_address
```

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key for AI analysis | [Google AI Studio](https://aistudio.google.com/apikey) |
| `ALCHEMY_RPC_URL` | Alchemy Sepolia RPC endpoint for blockchain | [Alchemy Dashboard](https://dashboard.alchemy.com) |
| `WALLET_PRIVATE_KEY` | Ethereum wallet private key for signing transactions | MetaMask or any Ethereum wallet |
| `WALLET_ADDRESS` | Ethereum wallet address | Your wallet |

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

---

## 📁 Project Structure

```
DepSentinel/
├── .github/
│   └── workflows/
│       └── depsentinel-scan.yml    # CI/CD pipeline
├── backend/
│   ├── main.py                     # Flask API server
│   ├── ai_analyzer.py              # Gemini AI analysis (multi-model fallback)
│   ├── blockchain.py               # Ethereum Sepolia integration
│   ├── detector.py                 # Static pattern detection engine
│   ├── diff_engine.py              # Package code diff analysis
│   ├── fetcher.py                  # PyPI metadata fetcher
│   ├── osv_client.py               # Google OSV vulnerability queries
│   ├── parser.py                   # requirements.txt parser
│   ├── risk_engine.py              # Composite risk scoring engine
│   ├── typosquatting.py            # Levenshtein-based typosquat detection
│   ├── ledger.py                   # SHA-256 hash chain ledger
│   ├── scan_ci.py                  # CI/CD scanner script
│   └── requirements.txt            # Python dependencies
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx           # Navigation bar
│       │   ├── ScanLoader.jsx       # Animated scan progress
│       │   └── SearchModal.jsx      # Package search modal
│       └── pages/
│           ├── Dashboard.jsx        # Main scan input page
│           ├── ScanResults.jsx      # Detailed results + AI card
│           ├── ThreatCenter.jsx     # Analytics graphs & charts
│           ├── Ledger.jsx           # Audit trail viewer
│           └── AlertBlock.jsx       # Threat alert page
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 👥 Team

Built at **Chitkara University Hackathon 2026**

---

<p align="center">
  <em>DepSentinel — Because trust in your dependencies should be verified, not assumed.</em>
</p>
