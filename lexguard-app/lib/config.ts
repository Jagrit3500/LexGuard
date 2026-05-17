/**
 * LexGuard — Central Configuration
 * All magic numbers, model names, and limits live here.
 * Change values here or override via environment variables.
 */

// ─── AI Models ─────────────────────────────────────────────────────────────
export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

// ─── Analysis Limits ────────────────────────────────────────────────────────
/** Max characters sent to AI (avoids token overflows) */
export const MAX_CONTRACT_CHARS = Number(process.env.MAX_CONTRACT_CHARS) || 12000;
/** Minimum contract length before we attempt analysis */
export const MIN_CONTRACT_CHARS = Number(process.env.MIN_CONTRACT_CHARS) || 100;
/** Minimum characters required from an uploaded file (PDF/DOCX/TXT) */
export const MIN_FILE_CHARS = Number(process.env.MIN_FILE_CHARS) || 50;
/** Max tokens the AI response can use */
export const MAX_RESPONSE_TOKENS = Number(process.env.MAX_RESPONSE_TOKENS) || 4000;
/** AI temperature — lower = more deterministic legal reasoning */
export const AI_TEMPERATURE = Number(process.env.AI_TEMPERATURE) || 0.3;

// ─── Groq Endpoint ──────────────────────────────────────────────────────────
export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

// ─── Session Storage Key ────────────────────────────────────────────────────
export const RESULT_STORAGE_KEY = 'lexguard_result';

// ─── API Routes ─────────────────────────────────────────────────────────────
export const API_ANALYZE = '/api/analyze';
export const API_PARSE_PDF = '/api/parse-pdf';

// ─── Risk Level Order (highest → lowest) ───────────────────────────────────
export const RISK_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SAFE'] as const;
export type RiskOrderTuple = typeof RISK_ORDER;
