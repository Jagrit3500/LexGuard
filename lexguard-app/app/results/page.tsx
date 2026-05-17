'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, ChevronDown, ChevronUp, ArrowLeft,
  Copy, CheckCheck, Scale, Zap, Lock, Ghost,
  Gavel, Swords, Eye, Terminal
} from 'lucide-react';
import { AnalysisResult, AnalyzedClause, RiskLevel } from '@/lib/types';
import { RISK_COLORS, GRADE_COLOR, BRAND_GOLD } from '@/lib/constants';
import { RESULT_STORAGE_KEY, RISK_ORDER } from '@/lib/config';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import NegotiationBattlecard from './NegotiationBattlecard';
import ConsequenceTimeline from './ConsequenceTimeline';
import LeverageScore from './LeverageScore';
import ExportReportButton from './ExportReportButton';

const SIDEBAR = [
  { icon: Gavel,  label: 'Scanner' },
  { icon: Swords, label: 'Defense', active: true },
  { icon: Scale,  label: 'Judge' },
  { icon: Shield, label: 'Guard' },
  { icon: Eye,    label: 'Intel' },
];

const RISK_LABEL: Record<RiskLevel, string> = {
  CRITICAL: 'CRITICAL EXPOSURE',
  HIGH: 'HIGH RISK',
  MEDIUM: 'MODERATE RISK',
  LOW: 'LOW RISK',
  SAFE: 'NEUTRALIZED',
};

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedClause, setSelectedClause] = useState<AnalyzedClause | null>(null);
  const [expandedFightBack, setExpandedFightBack] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dangerDismissed, setDangerDismissed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(RESULT_STORAGE_KEY);
    if (!stored) { router.push('/'); return; }
    const parsed = JSON.parse(stored) as AnalysisResult;
    setResult(parsed);
    const first = parsed.clauses.find(c => c.risk_level === 'CRITICAL') || parsed.clauses[0];
    if (first) setSelectedClause(first);
  }, [router]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!result) {
    return (
      <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-void)' }}>
        <span className="lx-label" style={{ color:'var(--gold)', letterSpacing:'0.3em' }}>LOADING ANALYSIS...</span>
      </div>
    );
  }

  const criticalCount = result.clauses.filter(c => c.risk_level === 'CRITICAL').length;
  const highCount = result.clauses.filter(c => c.risk_level === 'HIGH').length;
  const sortedClauses = [...result.clauses].sort(
    (a, b) => RISK_ORDER.indexOf(a.risk_level) - RISK_ORDER.indexOf(b.risk_level)
  );
  const ghostClauses = result.ghost_clauses || [];

  // 5 Legal Dimensions — maps AI trust metrics to the radar axes
  const radarData = [
    { subject: 'Privacy',    value: result.trust_score.user_safety },
    { subject: 'Financial',  value: result.trust_score.fairness },
    { subject: 'Employment', value: result.power_imbalance.user_rights_pct },
    { subject: 'IP Rights',  value: result.trust_score.transparency },
    { subject: 'Compliance', value: Math.round((result.trust_score.fairness + result.trust_score.transparency) / 2) },
  ];

  const clauseIndex = selectedClause ? sortedClauses.findIndex(c => c.id === selectedClause.id) + 1 : 0;

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg-void)' }}>

      {/* Sidebar */}
      <aside className="lx-sidebar" style={{ height:'100vh' }}>
        <div style={{ width:'100%', height:'var(--nav-h)', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:'linear-gradient(135deg,#B8860B,#C9A84C)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Scale style={{ width:14, height:14, color:'#000' }} />
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'12px 0' }}>
          {SIDEBAR.map((s,i) => (
            <button key={i} className={`lx-sidebar-icon${s.active?' active':''}`} title={s.label}>
              <s.icon style={{ width:15, height:15 }} />
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Nav */}
        <nav className="lx-nav">
          <button onClick={() => router.push('/')} style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer', transition:'color 0.15s', marginRight:16 }}>
            <ArrowLeft style={{ width:14, height:14 }} />
            <span className="lx-label">Back</span>
          </button>
          <span style={{ color:'rgba(255,255,255,0.15)' }}>|</span>
          <span style={{ fontWeight:700, letterSpacing:'0.15em', fontSize:13, color:'white', fontFamily:'JetBrains Mono,monospace', margin:'0 12px' }}>LEXGUARD</span>
          <span className="lx-label" style={{ color:'rgba(255,255,255,0.2)' }}>/</span>
          <span className="lx-label" style={{ color:'rgba(201,168,76,0.7)', margin:'0 8px' }}>
            {selectedClause ? `CLAUSE ${clauseIndex} / ${selectedClause.clause_type.replace(/_/g,' ').toUpperCase()}` : result.document_title.toUpperCase()}
          </span>
          {selectedClause && (
            <span className={`risk-${selectedClause.risk_level}`} style={{ padding:'2px 10px', borderRadius:3, fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:700, letterSpacing:'0.1em' }}>
              ⊗ {RISK_LABEL[selectedClause.risk_level]}
            </span>
          )}
          <div style={{ display:'flex', gap:4, margin:'0 auto' }}>
            {['REPORTS','ARCHIVE','STATUTES'].map(n => <button key={n} className={`lx-nav-link${n==='REPORTS'?' active':''}`}>{n}</button>)}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <ExportReportButton result={result} />
            {[Shield,Terminal].map((Icon,i) => (
              <button key={i} style={{ width:32, height:32, borderRadius:4, border:'1px solid rgba(255,255,255,0.08)', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', cursor:'pointer' }}>
                <Icon style={{ width:14, height:14 }} />
              </button>
            ))}
          </div>
        </nav>

        {/* ── Scrollable Body ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Hidden Danger Toast */}
        <AnimatePresence>
          {!dangerDismissed && result.hidden_dangers.length > 0 && (
            <motion.div
              initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
              style={{ background:'rgba(80,0,10,0.7)', borderBottom:'1px solid rgba(230,57,70,0.25)', padding:'8px 20px' }}
            >
              <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <AlertTriangle style={{ width:14, height:14, color:'var(--danger)', flexShrink:0, marginTop:2 }} />
                <div style={{ flex:1 }}>
                  <div className="lx-label" style={{ color:'var(--danger)', marginBottom:4 }}>⚠ Hidden Dangers Detected</div>
                  {result.hidden_dangers.map((d,i) => (
                    <div key={i} className="lx-mono" style={{ color:'#FFAAAA', fontSize:10, marginBottom:2 }}>• {d}</div>
                  ))}
                </div>
                <button onClick={() => setDangerDismissed(true)} style={{ color:'var(--danger)', background:'none', border:'none', cursor:'pointer', fontSize:14 }}>✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main style={{ flex:1, display:'grid', gridTemplateColumns:'280px 1fr 260px', overflow:'hidden' }}>

          {/* LEFT: Contract Scanner */}
          <div style={{ borderRight:'1px solid rgba(255,255,255,0.05)', overflowY:'auto', padding:'16px 12px', display:'flex', flexDirection:'column', gap:12 }}>
            <div className="lx-label" style={{ marginBottom:4 }}>Contract Scanner</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
              {criticalCount > 0 && <span className="risk-CRITICAL" style={{ padding:'2px 8px', borderRadius:3, fontSize:9, fontFamily:'JetBrains Mono,monospace', fontWeight:700 }}>CRITICAL ×{criticalCount}</span>}
              {highCount > 0 && <span className="risk-HIGH" style={{ padding:'2px 8px', borderRadius:3, fontSize:9, fontFamily:'JetBrains Mono,monospace', fontWeight:700 }}>SEVERE ×{highCount}</span>}
              {result.clauses.filter(c=>c.risk_level==='MEDIUM').length > 0 && <span className="risk-MEDIUM" style={{ padding:'2px 8px', borderRadius:3, fontSize:9, fontFamily:'JetBrains Mono,monospace', fontWeight:700 }}>MODERATE ×{result.clauses.filter(c=>c.risk_level==='MEDIUM').length}</span>}
            </div>
            <div className="lx-mono" style={{ fontSize:10, color:'var(--text-secondary)', lineHeight:1.7, marginBottom:8 }}>{result.executive_summary}</div>

          {/* Ghost Clauses */}
          {ghostClauses.length > 0 && (
            <motion.div
              className="glass rounded-2xl p-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Ghost className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">👻 Ghost Clauses</span>
                <span className="ml-auto text-[10px] text-gray-500">What they didn&apos;t include</span>
              </div>
              <div className="space-y-2">
                {ghostClauses.map((g, i) => (
                  <div key={i} className="p-3 rounded-xl bg-purple-500/8 border border-purple-500/20">
                    <div className="text-xs font-semibold text-purple-300 mb-1">⚠️ Missing: {g.protection_name}</div>
                    <div className="text-[10px] text-gray-400 leading-relaxed mb-1.5">{g.why_it_matters}</div>
                    <div className="text-[10px] text-purple-400 italic">+ {g.inject_suggestion}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Clause List */}
          <div className="space-y-2">
            {sortedClauses.map((clause, i) => (
              <motion.button
                key={clause.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedClause(clause)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                  selectedClause?.id === clause.id
                    ? `border-[${RISK_COLORS[clause.risk_level]}]/50 bg-[${RISK_COLORS[clause.risk_level]}]/10`
                    : 'border-white/5 hover:border-white/15 bg-white/2'
                } ${clause.risk_level === 'CRITICAL' && selectedClause?.id !== clause.id ? 'pulse-danger' : ''}`}
                style={selectedClause?.id === clause.id ? {
                  borderColor: `${RISK_COLORS[clause.risk_level]}50`,
                  background: `${RISK_COLORS[clause.risk_level]}15`
                } : {}}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-200 truncate">{clause.title}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 capitalize">{clause.clause_type.replace(/_/g, ' ')}</div>
                  </div>
                  <div
                    className="text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0"
                    style={{
                      color: RISK_COLORS[clause.risk_level],
                      background: `${RISK_COLORS[clause.risk_level]}18`,
                      border: `1px solid ${RISK_COLORS[clause.risk_level]}40`
                    }}
                  >
                    {clause.risk_level}
                  </div>
                </div>
                {clause.is_hidden_danger && (
                  <div className="mt-1.5 text-[10px] text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {clause.hidden_danger_message?.slice(0, 60)}...
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* CENTER: Clause Detail */}
        <div style={{ overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:16, borderRight:'1px solid rgba(255,255,255,0.04)' }}>
          <AnimatePresence mode="wait">
            {selectedClause ? (
              <motion.div
                key={selectedClause.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Clause Header */}
                <div
                  className="glass rounded-2xl p-5"
                  style={{ borderColor: `${RISK_COLORS[selectedClause.risk_level]}30` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h2 className="text-lg font-bold text-white">{selectedClause.title}</h2>
                      <div className="text-xs text-gray-500 mt-0.5 capitalize">
                        {selectedClause.clause_type.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div
                      className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
                      style={{
                        color: RISK_COLORS[selectedClause.risk_level],
                        background: `${RISK_COLORS[selectedClause.risk_level]}18`,
                        border: `1px solid ${RISK_COLORS[selectedClause.risk_level]}40`
                      }}
                    >
                      {RISK_LABEL[selectedClause.risk_level]}
                    </div>
                  </div>

                  {/* Original text */}
                  <div className="p-3 rounded-xl bg-white/3 border border-white/5 mb-3">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Original Clause</div>
                    <p className="text-xs font-mono text-gray-400 leading-relaxed line-clamp-4">
                      {selectedClause.original_text}
                    </p>
                  </div>

                  {/* Jurisdiction badge */}
                  {selectedClause.jurisdiction_override?.applicable && (
                    <div className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
                      selectedClause.jurisdiction_override.severity_change === 'downgrade'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                        : 'bg-purple-500/10 border border-purple-500/30 text-purple-300'
                    }`}>
                      <span>{selectedClause.jurisdiction_override.severity_change === 'downgrade' ? '✨' : '⚠️'}</span>
                      <div>
                        <div className="font-semibold mb-0.5">Jurisdiction Intelligence</div>
                        <div>{selectedClause.jurisdiction_override.note}</div>
                        {selectedClause.jurisdiction_override.law_reference && (
                          <div className="mt-1 text-[10px] opacity-70">{selectedClause.jurisdiction_override.law_reference}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Agent Debate */}
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Scale className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold text-gray-200">AI Agent Debate</span>
                    <div className="ml-auto text-[10px] text-gray-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded">
                      5 Agents · Benefits: {selectedClause.judge_who_benefits}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* User Advocate */}
                    <div className="p-3 rounded-xl bg-blue-500/8 border border-blue-500/20">
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1.5">
                        🔵 User Advocate — Fighting For You
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{selectedClause.user_advocate_argument}</p>
                    </div>

                    {/* Devil's Advocate */}
                    <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                      <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1.5">
                        🔴 Devil&apos;s Advocate — Their Defense
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{selectedClause.drafters_devil_argument}</p>
                    </div>

                    {/* Judge Verdict */}
                    <div className="p-3 rounded-xl bg-yellow-500/8 border border-yellow-500/20">
                      <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider mb-1.5">
                        ⚖️ Judge&apos;s Verdict
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{selectedClause.judge_verdict}</p>
                    </div>

                    {/* Regulator Agent */}
                    {selectedClause.regulatory_note && (
                      <div className="p-3 rounded-xl bg-green-500/8 border border-green-500/20">
                        <div className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1.5">
                          ⚖️ Regulator — Compliance Check
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">{selectedClause.regulatory_note}</p>
                      </div>
                    )}

                    {/* Ethics Agent */}
                    {selectedClause.ethics_flag && (
                      <div className="p-3 rounded-xl bg-purple-500/8 border border-purple-500/20">
                        <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">
                          🌐 Ethics Agent — Moral Fairness
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">{selectedClause.ethics_flag}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Consequence Timeline — Interactive */}
                {selectedClause.consequence_timeline && selectedClause.consequence_timeline.length > 0 && (
                  <ConsequenceTimeline
                    events={selectedClause.consequence_timeline}
                    clauseTitle={selectedClause.title}
                  />
                )}

                {/* Fight Back */}
                <div className="glass rounded-2xl p-5">
                  <button
                    onClick={() => setExpandedFightBack(
                      expandedFightBack === selectedClause.id ? null : selectedClause.id
                    )}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-bold text-gray-200">⚔️ Fight Back</span>
                    </div>
                    {expandedFightBack === selectedClause.id
                      ? <ChevronUp className="w-4 h-4 text-gray-500" />
                      : <ChevronDown className="w-4 h-4 text-gray-500" />
                    }
                  </button>

                  <AnimatePresence>
                    {expandedFightBack === selectedClause.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3 overflow-hidden"
                      >
                        <div>
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Fairer Rewrite
                          </div>
                          <div className="p-3 rounded-xl bg-green-500/8 border border-green-500/20 text-xs text-green-200 font-mono leading-relaxed">
                            {selectedClause.fight_back_rewrite}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            💬 What to Actually Say
                          </div>
                          <div className="p-3 rounded-xl bg-blue-500/8 border border-blue-500/20 text-xs text-blue-200 leading-relaxed italic">
                            &ldquo;{selectedClause.negotiation_line}&rdquo;
                          </div>
                          <button
                            onClick={() => copyToClipboard(selectedClause.negotiation_line, `neg_${selectedClause.id}`)}
                            className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            {copiedId === `neg_${selectedClause.id}`
                              ? <><CheckCheck className="w-3 h-3 text-green-400" /> Copied!</>
                              : <><Copy className="w-3 h-3" /> Copy negotiation line</>
                            }
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="glass rounded-2xl p-10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Scale className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Select a clause to see the full AI agent debate</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: Trust Score + Power Imbalance */}
        <div style={{ overflowY:'auto', padding:'16px 12px', display:'flex', flexDirection:'column', gap:16 }}>
          {/* Trust Score */}
          <motion.div
            className="glass rounded-2xl p-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-bold text-gray-200">Contract Trust Analysis</span>
            </div>

            {/* Grade */}
            <div className="text-center mb-4">
              <div
                className="text-6xl font-black"
                style={{ color: GRADE_COLOR[result.trust_score.overall_grade] || '#E63946' }}
              >
                {result.trust_score.overall_grade}
              </div>
              <div className="text-xs text-gray-500 mt-1">Overall Trust Grade</div>
            </div>

            {/* Radar Chart */}
            <div className="h-40 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 5, right: 15, bottom: 5, left: 15 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="subject"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke={BRAND_GOLD}
                    fill={BRAND_GOLD}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Metrics */}
            <div className="space-y-2.5">
              {[
                { label: 'Privacy',    value: result.trust_score.user_safety },
                { label: 'Financial',  value: result.trust_score.fairness },
                { label: 'Employment', value: result.power_imbalance.user_rights_pct },
                { label: 'IP Rights',  value: result.trust_score.transparency },
                { label: 'Compliance', value: Math.round((result.trust_score.fairness + result.trust_score.transparency) / 2) },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>{metric.label}</span>
                    <span>{metric.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      style={{
                        background: metric.value > 60
                          ? `linear-gradient(90deg, ${RISK_COLORS.SAFE}, #4ade80)`
                          : metric.value > 35
                          ? `linear-gradient(90deg, ${RISK_COLORS.MEDIUM}, ${RISK_COLORS.LOW})`
                          : `linear-gradient(90deg, ${RISK_COLORS.CRITICAL}, ${RISK_COLORS.HIGH})`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Power Imbalance */}
          <motion.div
            className="glass rounded-2xl p-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-bold text-gray-200">Power Imbalance</span>
              <div className={`ml-auto text-[10px] font-bold px-2 py-1 rounded ${
                result.power_imbalance.level === 'EXTREME' ? 'risk-CRITICAL' :
                result.power_imbalance.level === 'HIGH' ? 'risk-HIGH' :
                result.power_imbalance.level === 'MEDIUM' ? 'risk-MEDIUM' : 'risk-LOW'
              }`}>
                {result.power_imbalance.level}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-blue-400 font-semibold">Your Rights</span>
                  <span className="text-gray-400">{result.power_imbalance.user_rights_pct}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.power_imbalance.user_rights_pct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-red-400 font-semibold">Their Rights</span>
                  <span className="text-gray-400">{result.power_imbalance.counterparty_rights_pct}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.power_imbalance.counterparty_rights_pct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.7 }}
                  />
                </div>
              </div>
            </div>

            {result.power_imbalance.drivers.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Imbalance Drivers</div>
                <ul className="space-y-1">
                  {result.power_imbalance.drivers.map((d, i) => (
                    <li key={i} className="text-[10px] text-gray-400 flex items-start gap-1.5">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">→</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* Clause Risk Summary */}
          {/* Leverage Score */}
          <LeverageScore result={result} />

          {/* Risk Distribution */}
          <motion.div
            className="glass rounded-2xl p-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Risk Distribution</div>
            {RISK_ORDER.map((level) => {
              const count = result.clauses.filter(c => c.risk_level === level).length;
              if (count === 0) return null;
              return (
                <div key={level} className="flex items-center gap-2 mb-2">
                  <div className="w-16 text-[10px] font-semibold" style={{ color: RISK_COLORS[level] }}>{level}</div>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(count / result.clauses.length) * 100}%`,
                        background: RISK_COLORS[level]
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-500 w-4 text-right">{count}</div>
                </div>
              );
            })}
          </motion.div>

          {/* CTA */}
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-xl text-sm font-semibold border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-all"
          >
            Analyze Another Contract
          </button>
        </div>

        </main>
        </div>
      </div>
    </div>
  );
}
