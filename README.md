# 🛡️ DepSentinel

[![DepSentinel Security Scan](https://github.com/JoshYadav/-DepSentinel/actions/workflows/depsentinel-scan.yml/badge.svg)](https://github.com/JoshYadav/-DepSentinel/actions/workflows/depsentinel-scan.yml)

> AI-powered software supply chain security — detect malicious dependencies before they reach production.

---

## 🚨 The Problem

In 2020, the SolarWinds attack compromised 33,000 organizations including NASA, the Pentagon, and Microsoft. Attackers silently modified a legitimate software update. The attack went undetected for 9 months.

**How?** Malicious code was injected into a dependency. Nobody checked if the package had changed.

DepSentinel solves this.

---

## 🔍 How It Works

DepSentinel scans your `requirements.txt` through 4 detection layers:

1. **Static Pattern Detection** — Scans for dangerous code patterns across 5 threat categories: Code Execution, Obfuscation, Network Exfiltration, Persistence, Sensitive Data Access
2. **OSV Vulnerability Intelligence** — Queries Google's real CVE database in real-time, returning actual GHSA/CVE IDs and severity scores
3. **Typosquatting Detection** — Checks package names against top 5000 PyPI packages using Levenshtein distance algorithm
4. **Gemini AI Analysis** — Behavioral intent analysis, attack type classification, and SOC analyst recommendations powered by Google Gemini 1.5 Flash

---

## ⛓️ Blockchain Integrity

Every verified safe package is recorded on the **Ethereum Sepolia testnet** as an immutable transaction. Click any Etherscan link in the Audit Ledger to verify the record exists on-chain — permanently and tamper-proof.

---

## 🖥️ Pages

| Page | Description |
|------|-------------|
| Dashboard | Paste requirements.txt and run a scan |
| Scan Results | Diff viewer, threat vectors, AI analysis, blockchain verification |
| Threat Center | Analytics — scan history charts, risk radar, threat heatmap |
| Audit Ledger | Cryptographic SHA-256 hash chain of all scans with Etherscan links |
| Alert/Block | Full screen threat detected screen for blocked packages |

---

## 🏗️ Architecture
requirements.txt input
↓
Parser & Fetcher
↓
┌──────────────────────────────────┐
│  4-Layer Detection Pipeline      │
│  1. Static Pattern Detection     │
│  2. OSV CVE Database Query       │
│  3. Typosquatting Check          │
│  4. Gemini AI Analysis           │
└──────────────────────────────────┘
↓
Risk Engine (LOW/MEDIUM/HIGH)
↓
ALLOW → Blockchain Record (Sepolia)
BLOCK → Alert Screen + Rollback
↓
SHA-256 Hash Chain Ledger

---

## 🧪 Demo Test Cases

| Input | Expected Result |
|-------|----------------|
| `colourama==0.3.9` | HIGH — BLOCK (typosquatting) |
| `Pillow==9.0.0` | MEDIUM/HIGH — real CVEs from OSV |
| `requests==2.31.0` | LOW — ALLOW + Etherscan link |

---

## 🤖 CI/CD Pipeline

DepSentinel scans itself on every push. If any dependency returns a BLOCK verdict, the build fails automatically.

See the badge at the top of this README — that's a live scan result.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, Framer Motion |
| Backend | Python, Flask |
| AI | Google Gemini 1.5 Flash |
| Blockchain | Ethereum Sepolia, Web3.py, Alchemy |
| Threat Intel | Google OSV API |
| Integrity | SHA-256 cryptographic hash chain |
| CI/CD | GitHub Actions |

---

## ⚙️ Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file inside the `backend/` folder:
GEMINI_API_KEY=
ALCHEMY_RPC_URL=
WALLET_PRIVATE_KEY=
WALLET_ADDRESS=
Never commit your `.env` file. It is listed in `.gitignore`.

---

## 👥 Team

Built at Chitkara University Hackathon 2026

---

*DepSentinel — Because trust in your dependencies should be verified, not assumed.*
