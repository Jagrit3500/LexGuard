// Types for LexGuard analysis

export type Persona = 'employee' | 'freelancer' | 'consumer' | 'tenant' | 'startup';

export type Jurisdiction =
  | 'india' | 'california' | 'new_york' | 'uk' | 'eu' | 'australia' | 'canada' | 'other';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';

export type ClauseType =
  | 'intellectual_property'
  | 'non_compete'
  | 'termination'
  | 'privacy_data'
  | 'payment_financial'
  | 'arbitration'
  | 'liability'
  | 'auto_renewal'
  | 'indemnification'
  | 'confidentiality'
  | 'governing_law'
  | 'other';

export interface JurisdictionOverride {
  applicable: boolean;
  note: string;
  severity_change?: 'upgrade' | 'downgrade' | 'null';
  law_reference?: string;
}

export interface ConsequenceEvent {
  month: number;
  event: string;
  is_risk_point: boolean;
}

export interface AnalyzedClause {
  id: string;
  clause_type: ClauseType;
  original_text: string;
  risk_level: RiskLevel;
  title: string;
  is_hidden_danger: boolean;
  hidden_danger_message?: string;
  user_advocate_argument: string;
  drafters_devil_argument: string;
  judge_verdict: string;
  judge_who_benefits: 'You' | 'Counterparty' | 'Both' | 'Neutral';
  fight_back_rewrite: string;
  negotiation_line: string;
  regulatory_note?: string;       // Regulator Agent: GDPR/CCPA/local law flags
  ethics_flag?: string;           // Ethics Agent: moral fairness evaluation
  jurisdiction_override?: JurisdictionOverride;
  consequence_timeline?: ConsequenceEvent[];
}

export interface GhostClause {
  protection_name: string;
  why_it_matters: string;
  inject_suggestion: string;
}

export interface TrustScore {
  fairness: number;       // 0-100
  transparency: number;   // 0-100
  user_safety: number;    // 0-100
  overall_grade: string;  // A-F
}

export interface PowerImbalance {
  user_rights_pct: number;
  counterparty_rights_pct: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  drivers: string[];
}

export interface AnalysisResult {
  document_title: string;
  persona: Persona;
  jurisdiction: Jurisdiction;
  clauses: AnalyzedClause[];
  ghost_clauses: GhostClause[];
  trust_score: TrustScore;
  power_imbalance: PowerImbalance;
  hidden_dangers: string[];
  overall_risk: RiskLevel;
  executive_summary: string;
}
