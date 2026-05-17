import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult, Persona, Jurisdiction } from './types';
import {
  GROQ_MODEL, GEMINI_MODEL, GROQ_BASE_URL,
  MAX_CONTRACT_CHARS, MAX_RESPONSE_TOKENS, AI_TEMPERATURE,
} from './config';

// ─── Provider Detection ────────────────────────────────────────────────────
// Set AI_PROVIDER=groq   → uses Groq (groq.com) — fast, free, OpenAI-compatible
// Set AI_PROVIDER=gemini → uses Google Gemini
// Default: gemini
const PROVIDER = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

// ─── Jurisdiction Context ──────────────────────────────────────────────────
function getJurisdictionContext(jurisdiction: Jurisdiction): string {
  const map: Record<Jurisdiction, string> = {
    india:      'India — IT Act 2000, Arbitration & Conciliation Act 1996, no strong non-compete law but courts enforce reasonable clauses, Consumer Protection Act 2019',
    california: 'California, USA — Non-competes VOID under B&P Code §16600, CCPA strong privacy rights, strong employee protections, at-will employment',
    new_york:   'New York, USA — Non-competes limited and must be reasonable, SHIELD Act (data privacy), Wage Theft Prevention Act',
    uk:         'United Kingdom — UK GDPR, Employment Rights Act 1996, non-competes limited to 12 months typical, Consumer Rights Act 2015',
    eu:         'European Union — Strict GDPR, DSA/DMA, strong consumer rights, Working Time Directive, mandatory works council rights in many countries',
    australia:  'Australia — Fair Work Act 2009, Privacy Act 1988, non-competes time-limited, unfair contract term protections (ACL), NES minimum standards',
    canada:     'Canada — PIPEDA (privacy), provincial Employment Standards Acts, non-competes rarely enforced, strong worker protections',
    other:      'General international best practices — apply conservative risk assessment',
  };
  return map[jurisdiction] || map.other;
}

// ─── Persona Context ───────────────────────────────────────────────────────
function getPersonaContext(persona: Persona): string {
  const map: Record<Persona, string> = {
    employee:   'The user is an EMPLOYEE reviewing an employment offer or job contract. Focus on: IP ownership, non-compete scope, termination notice, severance, working hours, performance clauses.',
    freelancer: 'The user is a FREELANCER reviewing a client service or project agreement. Focus on: payment terms, kill fees, IP transfer, revision limits, liability, exclusivity.',
    consumer:   'The user is a CONSUMER reviewing terms of service, subscription, or app agreement. Focus on: auto-renewal, cancellation rights, data privacy, refund policy, arbitration waivers.',
    tenant:     'The user is a TENANT reviewing a rental or lease agreement. Focus on: deposit terms, habitability, notice periods, maintenance obligations, entry rights, renewal terms.',
    startup:    'The user is a STARTUP FOUNDER or VENDOR reviewing a partnership, SaaS, or vendor agreement. Focus on: SLAs, liability caps, IP ownership, indemnification, exclusivity, exit clauses.',
  };
  return map[persona];
}

// ─── Ghost Clause Benchmarks (what a FAIR contract should include) ─────────
function getGhostClauseBenchmarks(persona: Persona): string {
  const map: Record<Persona, string> = {
    employee:   'severance terms, clear termination notice period (both parties), IP carve-out for personal projects, non-compete geographic and time limits, right to reference letter, expense reimbursement policy',
    freelancer: 'kill fee (partial payment if project cancelled), late payment penalty/interest, IP ownership carve-out for pre-existing work, revision limit clause, project pause/kill rights, payment schedule milestones',
    consumer:   'explicit cancellation procedure, auto-renewal advance notice (min 30 days), data deletion rights, refund policy, price change advance notice, right to export your data',
    tenant:     'security deposit return timeline (typically 21-30 days), habitability guarantee, landlord entry notice requirement (min 24h), maintenance response time, lease renewal terms, rent increase notice period',
    startup:    'SLA with penalty provisions, liability cap (mutual), indemnification scope limits, IP ownership clarity, data portability on termination, exit/termination for convenience clause',
  };
  return map[persona];
}

// ─── Core Analysis Prompt ─────────────────────────────────────────────────
function buildPrompt(contractText: string, persona: Persona, jurisdiction: Jurisdiction): string {
  const truncated = contractText.slice(0, MAX_CONTRACT_CHARS);
  const benchmarks = getGhostClauseBenchmarks(persona);

  return `You are LexGuard — an elite AI Contract Defense System. Your job is to protect people BEFORE they sign.

CONTEXT:
- ${getPersonaContext(persona)}
- Jurisdiction: ${getJurisdictionContext(jurisdiction)}

CONTRACT TO ANALYZE:
---
${truncated}
---

Perform a full adversarial analysis. You MUST return ONLY valid JSON. No markdown. No code fences. No explanation outside the JSON.

Return this exact JSON structure:
{
  "document_title": "Short descriptive title for this contract type",
  "executive_summary": "2-3 sentences in plain English: what does this contract mean for the user? Be direct and alarming if warranted.",
  "overall_risk": "CRITICAL|HIGH|MEDIUM|LOW|SAFE",
  "power_imbalance": {
    "user_rights_pct": <integer 0-100>,
    "counterparty_rights_pct": <integer 0-100>,
    "level": "LOW|MEDIUM|HIGH|EXTREME",
    "drivers": ["Specific reason 1 why power is imbalanced", "Reason 2", "Reason 3"]
  },
  "trust_score": {
    "fairness": <integer 0-100>,
    "transparency": <integer 0-100>,
    "user_safety": <integer 0-100>,
    "overall_grade": "A|B|C|D|F"
  },
  "hidden_dangers": [
    "⚠️ One punchy sentence about a hidden danger in this contract",
    "⚠️ Another hidden danger they probably missed"
  ],
  "ghost_clauses": [
    {
      "protection_name": "Name of the standard protection that is MISSING from this contract",
      "why_it_matters": "In one sentence: what happens to the user because this protection is absent?",
      "inject_suggestion": "A one-sentence fair clause they should ask to be added"
    }
  ],
  "clauses": [
    {
      "id": "clause_1",
      "clause_type": "intellectual_property|non_compete|termination|privacy_data|payment_financial|arbitration|liability|auto_renewal|indemnification|confidentiality|governing_law|other",
      "original_text": "Exact quoted text from the contract for this clause",
      "risk_level": "CRITICAL|HIGH|MEDIUM|LOW|SAFE",
      "title": "Short human-readable title",
      "is_hidden_danger": true or false,
      "hidden_danger_message": "If is_hidden_danger is true: one shocking sentence about what this hides",
      "user_advocate_argument": "Passionate argument from a rights attorney about HOW this hurts the user. Be specific with real consequences.",
      "drafters_devil_argument": "How the contract drafter would commercially justify this clause.",
      "judge_verdict": "Balanced final verdict: who benefits, real-world impact, how serious?",
      "judge_who_benefits": "You|Counterparty|Both|Neutral",
      "fight_back_rewrite": "A fairer rewritten version of this clause that protects the user better.",
      "negotiation_line": "The exact sentence the user should say out loud to negotiate this clause.",
      "regulatory_note": "REGULATOR AGENT: Does this clause violate or conflict with any law in the specified jurisdiction? (GDPR, CCPA, Indian IT Act, local labor law, consumer protection act, etc.). If compliant, say so. Be specific with law names.",
      "ethics_flag": "ETHICS AGENT: Even if technically legal, is this clause morally fair? Consider power dynamics, bargaining inequality, gig economy impact. One punchy sentence — e.g. 'Exploitative: gives company unlimited rights over personal time with no compensation.'",
      "jurisdiction_override": {
        "applicable": true or false,
        "note": "Jurisdiction-specific legal note about this clause",
        "severity_change": "upgrade|downgrade|null",
        "law_reference": "Specific law or code section if applicable, else empty string"
      },
      "consequence_timeline": [
        {
          "month": <integer, e.g. 0, 6, 12, 24>,
          "event": "What happens to the user at this point in time because of this clause",
          "is_risk_point": true or false
        }
      ]
    }
  ]
}

Rules:
- Find ALL significant clauses (minimum 4, maximum 10)
- Sort clauses by risk_level: CRITICAL first, then HIGH, MEDIUM, LOW, SAFE
- Be brutally honest about risks. Do not sugarcoat.
- hidden_dangers: 2-4 shocking one-liners about hidden dangers
- ghost_clauses: Check if these standard protections are MISSING from the contract: ${benchmarks}. List only the ones that are genuinely absent (2-4 items).
- consequence_timeline: Only generate for CRITICAL or HIGH risk clauses (3-5 events spanning realistic timeframe)
- fight_back_rewrite: A real, usable clause rewrite (1-3 sentences)
- negotiation_line: A professional sentence they can say verbatim in a meeting`;
}

// ─── Groq Provider (OpenAI-compatible) ────────────────────────────────────
// Free tier: 30 req/min, 14,400 req/day
async function analyzeWithGroq(prompt: string): Promise<string> {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || '',
    baseURL: GROQ_BASE_URL,
  });

  const response = await client.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are LexGuard, an AI contract defense system. Always respond with valid JSON only. No markdown, no code fences.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: AI_TEMPERATURE,
    max_tokens: MAX_RESPONSE_TOKENS,
  });

  return response.choices[0]?.message?.content || '';
}

// ─── Gemini Provider ───────────────────────────────────────────────────────
async function analyzeWithGemini(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── Provider Validation ───────────────────────────────────────────────────
function validateProviderKey(): void {
  if (PROVIDER === 'groq' && !process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set. Add it to your .env.local file.');
  }
  if (PROVIDER === 'gemini' && !process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Add it to your .env.local file.');
  }
}

// ─── Main Export ───────────────────────────────────────────────────────────
export async function analyzeContract(
  contractText: string,
  persona: Persona,
  jurisdiction: Jurisdiction
): Promise<AnalysisResult> {
  validateProviderKey();

  const prompt = buildPrompt(contractText, persona, jurisdiction);
  let rawText: string;

  if (PROVIDER === 'groq') {
    console.log(`[LexGuard] Provider: Groq | Model: ${GROQ_MODEL}`);
    rawText = await analyzeWithGroq(prompt);
  } else {
    console.log(`[LexGuard] Provider: Gemini | Model: ${GEMINI_MODEL}`);
    rawText = await analyzeWithGemini(prompt);
  }

  // Strip markdown fences if model accidentally adds them
  const cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  const parsed = JSON.parse(cleaned) as Omit<AnalysisResult, 'persona' | 'jurisdiction'>;

  return {
    ...parsed,
    ghost_clauses: parsed.ghost_clauses || [],
    persona,
    jurisdiction,
  };
}
