<div align="center">

# ⚖️ LexGuard
### AI Contract Defense System

**Before you sign anything — LexGuard defends you.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?style=flat-square&logo=google)](https://aistudio.google.com)
[![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-FF6B35?style=flat-square)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 🎯 What is LexGuard?

LexGuard is a **production-grade AI contract defense system** that goes far beyond document summarization. It deploys **5 specialized AI agents** that argue about every clause, detect what was deliberately left out, simulate your legal future, and arm you with the exact words to fight back — all before you sign.

> ⚠️ *Not legal advice. LexGuard provides AI-assisted contract awareness and risk intelligence.*

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **5-Agent Adversarial Debate** | User Advocate, Devil's Advocate, Judge, Regulator, and Ethics agents analyze every clause |
| 👻 **Ghost Clause Detection** | Identifies standard protections that were deliberately omitted from the contract |
| 🔮 **Consequence Simulation** | Interactive timeline showing what happens month-by-month if you sign |
| ⚡ **Power Imbalance Detector** | Calculates your rights % vs their rights % with animated visualization |
| 📊 **5D Trust Score Radar** | Privacy, Financial, Employment, IP Rights, and Compliance dimensions |
| 🏋️ **Leverage Score Widget** | Real-time negotiating position from VERY WEAK to VERY STRONG |
| ⚔️ **Fight Back Mode** | Fairer clause rewrites + verbatim negotiation scripts |
| 🗡️ **Negotiation Battlecard** | 3-column cheat sheet: What They Have / Why It Hurts / Your Counter-Demand |
| 🌍 **Jurisdiction Intelligence** | 8 jurisdictions with per-clause legal override (GDPR, CCPA, Indian IT Act, etc.) |
| 📄 **PDF Export** | Full dark-themed multi-page report with all agent outputs and battlecard |
| 📝 **Multi-Format Upload** | PDF, DOCX, and TXT file support |

---

## 🏗️ Architecture

```
lexguard-app/
├── app/
│   ├── page.tsx                      ← Landing page (upload + persona + demo)
│   ├── layout.tsx                    ← SEO meta, viewport, Google Fonts
│   ├── globals.css                   ← Design system (dark mode, tokens, animations)
│   ├── components/
│   │   └── JourneyBar.tsx            ← 4-step progress indicator
│   ├── results/
│   │   ├── page.tsx                  ← 3-column results dashboard
│   │   ├── ConsequenceTimeline.tsx   ← Interactive horizontal timeline
│   │   ├── LeverageScore.tsx         ← SVG circular gauge widget
│   │   ├── NegotiationBattlecard.tsx ← 3-col negotiation table
│   │   └── ExportReportButton.tsx    ← jsPDF full report export
│   └── api/
│       ├── analyze/route.ts          ← POST /api/analyze (AI engine)
│       └── parse-pdf/route.ts        ← POST /api/parse-pdf (PDF/DOCX/TXT)
└── lib/
    ├── config.ts                     ← All magic numbers + env overrides
    ├── constants.ts                  ← Colors, personas, jurisdictions, demos
    ├── gemini.ts                     ← Dual AI provider (Groq + Gemini)
    └── types.ts                      ← Full TypeScript type system
```

---

## 🤖 The 5-Agent System

Every clause is analyzed by all 5 agents in a single structured JSON call:

| Agent | Color | Role |
|---|---|---|
| 🔵 **User Advocate** | Blue | Civil rights attorney fighting for the signer |
| 🔴 **Devil's Advocate** | Red | Contract drafter defending every clause |
| ⚖️ **Judge** | Gold | Synthesizes both sides, delivers verdict |
| 🟢 **Regulator** | Green | GDPR, CCPA, Indian IT Act, local labor law |
| 🌐 **Ethics Agent** | Purple | Moral fairness — fair even if technically legal? |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A free API key from [Groq](https://console.groq.com/keys) or [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
git clone https://github.com/your-username/lexguard.git
cd lexguard/lexguard-app
npm install
```

### Environment Setup

Create a `.env.local` file in the `lexguard-app` directory:

```env
# AI Provider — choose one
AI_PROVIDER=gemini           # or 'groq'

# API Keys (only the one you're using is required)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Optional overrides (sensible defaults provided)
# GROQ_MODEL=llama-3.3-70b-versatile
# GEMINI_MODEL=gemini-1.5-flash
# MAX_CONTRACT_CHARS=12000
# MAX_RESPONSE_TOKENS=4000
# AI_TEMPERATURE=0.3
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (strict) |
| **Styling** | TailwindCSS v4 + CSS variables |
| **Animations** | Framer Motion |
| **Charts** | Recharts (RadarChart) |
| **Icons** | Lucide React |
| **AI — Primary** | Google Gemini 1.5 Flash |
| **AI — Fallback** | Groq llama-3.3-70b-versatile |
| **PDF Parsing** | pdf-parse |
| **DOCX Parsing** | mammoth |
| **PDF Export** | jsPDF |

---

## 🌍 Supported Jurisdictions

| Jurisdiction | Key Laws |
|---|---|
| 🇮🇳 India | IT Act 2000, Arbitration & Conciliation Act, Consumer Protection Act 2019 |
| 🇺🇸 California | Non-competes VOID (B&P §16600), CCPA, strong worker protections |
| 🇺🇸 New York | SHIELD Act, Wage Theft Prevention Act |
| 🇬🇧 UK | UK GDPR, Employment Rights Act 1996, Consumer Rights Act 2015 |
| 🇪🇺 EU | Strict GDPR, DSA/DMA, Working Time Directive |
| 🇦🇺 Australia | Fair Work Act 2009, Privacy Act 1988, Australian Consumer Law |
| 🇨🇦 Canada | PIPEDA, provincial Employment Standards Acts |
| 🌐 Other | Conservative international best practices |

---

## 👤 Supported Personas

| Persona | Focus Areas |
|---|---|
| 🧑‍💼 **Employee** | Non-compete, IP ownership, termination, severance, working hours |
| 🧑‍🎨 **Freelancer** | Kill fees, payment terms, IP transfer, revision limits, exclusivity |
| 👤 **Consumer** | Auto-renewal, cancellation rights, data privacy, refund policy |
| 🏠 **Tenant** | Deposit return, habitability, notice periods, maintenance |
| 🏢 **Startup / Vendor** | SLAs, liability caps, IP ownership, indemnification, exit clauses |

---

## 📦 API Reference

### `POST /api/analyze`

Analyzes a contract using the 5-agent system.

**Request Body:**
```json
{
  "contractText": "string (min 100 chars)",
  "persona": "employee | freelancer | consumer | tenant | startup",
  "jurisdiction": "india | california | new_york | uk | eu | australia | canada | other"
}
```

**Response:** Full `AnalysisResult` JSON including clauses, ghost clauses, trust score, power imbalance, hidden dangers, and executive summary.

---

### `POST /api/parse-pdf`

Extracts text from uploaded files.

**Request:** `multipart/form-data` with a `file` field.

**Supported formats:** `.pdf`, `.docx`, `.doc`, `.txt`

**Response:**
```json
{
  "text": "extracted contract text",
  "charCount": 4821
}
```

---

## 🚢 Deployment

### Google Cloud Run (Recommended)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]
```

```bash
# Build and push to Google Artifact Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT/lexguard

# Deploy to Cloud Run
gcloud run deploy lexguard \
  --image gcr.io/YOUR_PROJECT/lexguard \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars AI_PROVIDER=gemini,GEMINI_API_KEY=YOUR_KEY
```

---

## 🔒 Security

- ✅ Zero hardcoded API keys in source code
- ✅ All secrets via environment variables only
- ✅ `.env.local` in `.gitignore`
- ✅ Server-side AI calls only (keys never exposed to browser)
- ✅ Input validation on both client and server
- ✅ TypeScript strict mode — no `any` types

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ⚖️ for those who sign without reading**

*LexGuard — AI Contract Defense System*

</div>
