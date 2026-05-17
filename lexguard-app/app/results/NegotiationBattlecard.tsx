'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Copy, CheckCheck, Download, Swords } from 'lucide-react';
import { AnalyzedClause } from '@/lib/types';
import { RISK_COLORS } from '@/lib/constants';

interface Props {
  clauses: AnalyzedClause[];
  documentTitle: string;
}

export default function NegotiationBattlecard({ clauses, documentTitle }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Only show CRITICAL and HIGH clauses — these are what you negotiate
  const battleClauses = clauses.filter(c =>
    c.risk_level === 'CRITICAL' || c.risk_level === 'HIGH'
  );

  if (battleClauses.length === 0) return null;

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAll = () => {
    const lines = battleClauses.map((c, i) =>
      `${i + 1}. ${c.title}\n` +
      `   Risk: ${c.risk_level}\n` +
      `   Problem: ${c.judge_verdict}\n` +
      `   Say This: "${c.negotiation_line}"\n`
    ).join('\n');

    const full =
      `LEXGUARD — NEGOTIATION BATTLECARD\n` +
      `Contract: ${documentTitle}\n` +
      `Generated: ${new Date().toLocaleDateString()}\n` +
      `${'─'.repeat(60)}\n\n` +
      lines +
      `\n${'─'.repeat(60)}\n` +
      `Not legal advice. AI-assisted contract awareness by LexGuard.`;

    navigator.clipboard.writeText(full);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const downloadTxt = () => {
    const lines = battleClauses.map((c, i) =>
      `${i + 1}. [${c.risk_level}] ${c.title}\n` +
      `   Clause Type: ${c.clause_type.replace(/_/g, ' ')}\n` +
      `   Original: ${c.original_text.slice(0, 200)}...\n` +
      `   Why It Hurts: ${c.user_advocate_argument}\n` +
      `   Fairer Rewrite: ${c.fight_back_rewrite}\n` +
      `   What To Say: "${c.negotiation_line}"\n`
    ).join('\n─────────────────────────────────────────\n\n');

    const full =
      `LEXGUARD — NEGOTIATION BATTLECARD\n` +
      `Contract: ${documentTitle}\n` +
      `Generated: ${new Date().toLocaleString()}\n` +
      `${'═'.repeat(60)}\n\n` +
      lines +
      `\n${'═'.repeat(60)}\n` +
      `Powered by LexGuard AI Contract Defense System\n` +
      `Not legal advice. For awareness and decision-support only.`;

    const blob = new Blob([full], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LexGuard_Battlecard_${documentTitle.replace(/\s+/g, '_').slice(0, 30)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 border-t border-white/5 pt-6">
      {/* Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 glass rounded-2xl hover:border-amber-500/30 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-400 flex items-center justify-center flex-shrink-0">
            <Swords className="w-5 h-5 text-black" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-gray-100 group-hover:text-yellow-300 transition-colors">
              ⚔️ Negotiation Battlecard
            </div>
            <div className="text-xs text-gray-500">
              {battleClauses.length} high-risk clause{battleClauses.length > 1 ? 's' : ''} — pull this up in your next meeting
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-semibold">
              {battleClauses.filter(c => c.risk_level === 'CRITICAL').length} CRITICAL
            </span>
            <span className="text-[10px] px-2 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20 font-semibold">
              {battleClauses.filter(c => c.risk_level === 'HIGH').length} HIGH
            </span>
          </div>
          {isOpen
            ? <ChevronUp className="w-5 h-5 text-gray-500" />
            : <ChevronDown className="w-5 h-5 text-gray-500" />
          }
        </div>
      </button>

      {/* Battlecard Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 glass rounded-2xl overflow-hidden">
              {/* Action bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/2">
                <div className="text-xs text-gray-400">
                  Use this as a cheat sheet during contract negotiations
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 text-xs font-semibold transition-all"
                  >
                    {copiedAll
                      ? <><CheckCheck className="w-3 h-3" /> Copied!</>
                      : <><Copy className="w-3 h-3" /> Copy All</>
                    }
                  </button>
                  <button
                    onClick={downloadTxt}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-gray-200 text-xs font-semibold transition-all"
                  >
                    <Download className="w-3 h-3" />
                    Download .txt
                  </button>
                </div>
              </div>

              {/* Table — horizontally scrollable on mobile */}
              <div className="overflow-x-auto -mx-0">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 border-b border-white/5 bg-white/2 min-w-[600px]">
                <div className="col-span-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  What They Have
                </div>
                <div className="col-span-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Why It Hurts You
                </div>
                <div className="col-span-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Your Counter-Demand
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5">
                {battleClauses.map((clause, i) => (
                  <motion.div
                    key={clause.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 py-4 hover:bg-white/2 transition-colors"
                  >
                    {/* Column 1: Clause title + risk */}
                    <div className="md:col-span-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: RISK_COLORS[clause.risk_level] }}
                        />
                        <span
                          className="text-[10px] font-bold uppercase"
                          style={{ color: RISK_COLORS[clause.risk_level] }}
                        >
                          {clause.risk_level}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-gray-200 leading-tight">
                        {clause.title}
                      </div>
                      <div className="text-[10px] text-gray-600 mt-0.5 capitalize">
                        {clause.clause_type.replace(/_/g, ' ')}
                      </div>
                    </div>

                    {/* Column 2: Why it hurts */}
                    <div className="md:col-span-4">
                      <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1 md:hidden">
                        Why It Hurts
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                        {clause.user_advocate_argument}
                      </p>
                    </div>

                    {/* Column 3: Counter-demand */}
                    <div className="md:col-span-5">
                      <div className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1 md:hidden">
                        Say This
                      </div>
                      <div className="p-3 rounded-xl bg-green-500/8 border border-green-500/20 relative group/row">
                        <p className="text-xs text-green-200 italic leading-relaxed pr-6">
                          &ldquo;{clause.negotiation_line}&rdquo;
                        </p>
                        <button
                          onClick={() => copy(clause.negotiation_line, clause.id)}
                          className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-green-500/20"
                          title="Copy"
                        >
                          {copiedId === clause.id
                            ? <CheckCheck className="w-3 h-3 text-green-400" />
                            : <Copy className="w-3 h-3 text-green-500" />
                          }
                        </button>
                      </div>
                      {clause.fight_back_rewrite && (
                        <div className="mt-2 text-[10px] text-gray-500 leading-relaxed">
                          <span className="text-gray-600 font-semibold">Rewrite: </span>
                          {clause.fight_back_rewrite.slice(0, 120)}
                          {clause.fight_back_rewrite.length > 120 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                </div>
              </div>{/* end scroll wrapper */}

              {/* Footer */}
              <div className="px-5 py-3 border-t border-white/5 bg-white/2 flex items-center justify-between">
                <p className="text-[10px] text-gray-600">
                  Not legal advice — AI-assisted contract awareness by LexGuard
                </p>
                <p className="text-[10px] text-gray-600">
                  {battleClauses.length} clauses · Generated {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
