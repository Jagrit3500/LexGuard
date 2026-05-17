'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import { RISK_COLORS } from '@/lib/constants';

// Design tokens — matches globals.css and RISK_COLORS
const LEVERAGE_COLORS = {
  VERY_STRONG: { color: RISK_COLORS.SAFE,     bg: 'rgba(45,198,83,0.12)' },
  STRONG:      { color: RISK_COLORS.SAFE,     bg: 'rgba(45,198,83,0.10)' },
  MODERATE:    { color: RISK_COLORS.MEDIUM,   bg: 'rgba(255,159,28,0.12)' },
  WEAK:        { color: RISK_COLORS.HIGH,     bg: 'rgba(255,107,53,0.12)' },
  VERY_WEAK:   { color: RISK_COLORS.CRITICAL, bg: 'rgba(230,57,70,0.12)' },
} as const;

const FACTOR_COLORS = {
  positive: RISK_COLORS.SAFE,
  negative: RISK_COLORS.CRITICAL,
  neutral:  RISK_COLORS.MEDIUM,
} as const;

interface Props {
  result: AnalysisResult;
}

interface LeverageData {
  score: number;
  position: 'VERY WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'VERY STRONG';
  color: string;
  bgColor: string;
  factors: { text: string; impact: 'negative' | 'neutral' | 'positive' }[];
  advice: string;
}

function computeLeverage(result: AnalysisResult): LeverageData {
  const { clauses, trust_score, power_imbalance } = result;

  // Weighted score from existing data
  let score =
    trust_score.user_safety * 0.35 +
    power_imbalance.user_rights_pct * 0.40 +
    trust_score.transparency * 0.25;

  // Clamp 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Determine position
  let position: LeverageData['position'];
  let color: string;
  let bgColor: string;
  if (score >= 70) {
    position = 'VERY STRONG';
    color = LEVERAGE_COLORS.VERY_STRONG.color;
    bgColor = LEVERAGE_COLORS.VERY_STRONG.bg;
  } else if (score >= 55) {
    position = 'STRONG';
    color = LEVERAGE_COLORS.STRONG.color;
    bgColor = LEVERAGE_COLORS.STRONG.bg;
  } else if (score >= 40) {
    position = 'MODERATE';
    color = LEVERAGE_COLORS.MODERATE.color;
    bgColor = LEVERAGE_COLORS.MODERATE.bg;
  } else if (score >= 25) {
    position = 'WEAK';
    color = LEVERAGE_COLORS.WEAK.color;
    bgColor = LEVERAGE_COLORS.WEAK.bg;
  } else {
    position = 'VERY WEAK';
    color = LEVERAGE_COLORS.VERY_WEAK.color;
    bgColor = LEVERAGE_COLORS.VERY_WEAK.bg;
  }

  // Dynamic leverage factors
  const factors: LeverageData['factors'] = [];

  const criticalCount = clauses.filter(c => c.risk_level === 'CRITICAL').length;
  const highCount = clauses.filter(c => c.risk_level === 'HIGH').length;
  const jurisdictionHits = clauses.filter(
    c => c.jurisdiction_override?.applicable && c.jurisdiction_override?.severity_change === 'downgrade'
  ).length;
  const hiddenDangerCount = clauses.filter(c => c.is_hidden_danger).length;

  if (criticalCount > 0) {
    factors.push({
      text: `${criticalCount} CRITICAL clause${criticalCount > 1 ? 's' : ''} severely limits your position`,
      impact: 'negative',
    });
  }

  if (highCount > 0) {
    factors.push({
      text: `${highCount} HIGH-risk clause${highCount > 1 ? 's' : ''} reduce your bargaining power`,
      impact: 'negative',
    });
  }

  if (power_imbalance.counterparty_rights_pct > 70) {
    factors.push({
      text: `Power balance is heavily skewed ${power_imbalance.counterparty_rights_pct}% in their favour`,
      impact: 'negative',
    });
  } else if (power_imbalance.user_rights_pct >= 40) {
    factors.push({
      text: `Power balance is relatively fair (${power_imbalance.user_rights_pct}% your rights)`,
      impact: 'positive',
    });
  }

  if (jurisdictionHits > 0) {
    factors.push({
      text: `${jurisdictionHits} clause${jurisdictionHits > 1 ? 's' : ''} may be unenforceable in your jurisdiction`,
      impact: 'positive',
    });
  }

  if (hiddenDangerCount > 0) {
    factors.push({
      text: `${hiddenDangerCount} hidden trap${hiddenDangerCount > 1 ? 's' : ''} detected — knowledge is your advantage`,
      impact: 'neutral',
    });
  }

  if (trust_score.transparency < 40) {
    factors.push({
      text: 'Low transparency score — contract obscures key terms intentionally',
      impact: 'negative',
    });
  }

  if (trust_score.fairness > 60) {
    factors.push({
      text: 'Fairness score is acceptable — some room for negotiation',
      impact: 'positive',
    });
  }

  // Keep top 4 factors
  const topFactors = factors.slice(0, 4);

  // Advice based on position
  const adviceMap: Record<LeverageData['position'], string> = {
    'VERY WEAK':    'Do NOT sign yet. Get legal review or request significant rewrites before proceeding.',
    'WEAK':         'Negotiate hard on CRITICAL clauses before signing. Use Fight Back rewrites.',
    'MODERATE':     'Targeted negotiation on key clauses will strengthen your position significantly.',
    'STRONG':       'You have reasonable leverage. Use the Negotiation Battlecard to maximize it.',
    'VERY STRONG':  'Your position is strong. Sign with confidence after minor review.',
  };

  return { score, position, color, bgColor, factors: topFactors, advice: adviceMap[position] };
}

export default function LeverageScore({ result }: Props) {
  const leverage = useMemo(() => computeLeverage(result), [result]);

  const circumference = 2 * Math.PI * 38;
  const dashOffset = circumference * (1 - leverage.score / 100);

  return (
    <motion.div
      className="glass rounded-2xl p-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: leverage.color, boxShadow: `0 0 6px ${leverage.color}` }}
        />
        <span className="text-sm font-bold text-gray-200">Negotiating Leverage</span>
      </div>

      {/* Gauge + Score */}
      <div className="flex items-center gap-4 mb-4">
        {/* Circular gauge */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 88 88">
            {/* Track */}
            <circle
              cx="44" cy="44" r="38"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
            {/* Progress */}
            <motion.circle
              cx="44" cy="44" r="38"
              fill="none"
              stroke={leverage.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
              style={{ filter: `drop-shadow(0 0 6px ${leverage.color}60)` }}
            />
          </svg>
          {/* Center score */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="text-xl font-black"
              style={{ color: leverage.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {leverage.score}
            </motion.span>
          </div>
        </div>

        {/* Position label + advice */}
        <div className="flex-1 min-w-0">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold mb-1.5"
            style={{ color: leverage.color, background: leverage.bgColor, border: `1px solid ${leverage.color}40` }}
          >
            {leverage.score < 40
              ? <TrendingDown className="w-3 h-3" />
              : leverage.score > 60
              ? <TrendingUp className="w-3 h-3" />
              : <Minus className="w-3 h-3" />
            }
            {leverage.position}
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            {leverage.advice}
          </p>
        </div>
      </div>

      {/* Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
          <span>Your Leverage</span>
          <span>{leverage.score}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${leverage.score}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
            style={{
              background: leverage.score < 35
                ? `linear-gradient(90deg, ${RISK_COLORS.CRITICAL}, ${RISK_COLORS.HIGH})`
                : leverage.score < 60
                ? `linear-gradient(90deg, ${RISK_COLORS.MEDIUM}, ${RISK_COLORS.LOW})`
                : `linear-gradient(90deg, ${RISK_COLORS.SAFE}, #4ade80)`,
            }}
          />
        </div>
      </div>

      {/* Leverage factors */}
      {leverage.factors.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Leverage Factors
          </div>
          <div className="space-y-1.5">
            {leverage.factors.map((factor, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-start gap-2 text-[10px] text-gray-400"
              >
                <span
                  className="mt-0.5 flex-shrink-0 font-bold"
                  style={{
                    color: FACTOR_COLORS[factor.impact]
                  }}
                >
                  {factor.impact === 'positive' ? '↑' : factor.impact === 'negative' ? '↓' : '~'}
                </span>
                {factor.text}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
