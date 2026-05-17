'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCheck } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';

interface Props {
  result: AnalysisResult;
}

export default function ExportReportButton({ result }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Dynamic import to keep jsPDF out of initial bundle
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const PAGE_W = 210;
      const MARGIN = 15;
      const CONTENT_W = PAGE_W - MARGIN * 2;
      let y = 20;

      // ── Helpers ────────────────────────────────────────────────────
      const addText = (
        text: string,
        size: number,
        style: 'normal' | 'bold' = 'normal',
        color: [number, number, number] = [240, 244, 255]
      ) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, CONTENT_W) as string[];
        lines.forEach((line) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(line, MARGIN, y);
          y += size * 0.45;
        });
        y += 2;
      };

      const addRule = (color: [number, number, number] = [40, 52, 80]) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setDrawColor(...color);
        doc.line(MARGIN, y, PAGE_W - MARGIN, y);
        y += 4;
      };

      const addBadge = (label: string, level: string) => {
        const colors: Record<string, [number, number, number]> = {
          CRITICAL: [230, 57, 70], HIGH: [255, 107, 53],
          MEDIUM: [255, 159, 28], LOW: [255, 209, 102], SAFE: [45, 198, 83],
        };
        const c = colors[level] || [150, 150, 150];
        doc.setFillColor(...c);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        const tw = doc.getTextWidth(label) + 6;
        doc.roundedRect(MARGIN, y - 4, tw, 6, 1.5, 1.5, 'F');
        doc.text(label, MARGIN + 3, y);
        y += 6;
      };

      // ── Cover ──────────────────────────────────────────────────────
      // Dark background
      doc.setFillColor(8, 13, 26);
      doc.rect(0, 0, 210, 297, 'F');

      // Gold accent bar
      doc.setFillColor(201, 168, 76);
      doc.rect(0, 0, 4, 297, 'F');

      addText('LEXGUARD', 28, 'bold', [201, 168, 76]);
      y -= 2;
      addText('AI Contract Defense System', 11, 'normal', [136, 146, 164]);
      y += 4;
      addRule([201, 168, 76]);

      addText(result.document_title, 16, 'bold', [240, 244, 255]);
      y += 2;
      addText(`Persona: ${result.persona.toUpperCase()}  |  Jurisdiction: ${result.jurisdiction.replace('_', ' ').toUpperCase()}`, 9, 'normal', [136, 146, 164]);
      addText(`Generated: ${new Date().toLocaleString()}`, 9, 'normal', [136, 146, 164]);
      y += 6;

      // Overall risk
      addBadge(`Overall Risk: ${result.overall_risk}`, result.overall_risk);
      y += 4;

      // Executive Summary
      addText('EXECUTIVE SUMMARY', 9, 'bold', [201, 168, 76]);
      addText(result.executive_summary, 9, 'normal', [200, 210, 230]);
      y += 4;
      addRule();

      // ── Trust Score ────────────────────────────────────────────────
      addText('CONTRACT TRUST ANALYSIS', 10, 'bold', [201, 168, 76]);
      y += 1;
      addText(`Overall Grade: ${result.trust_score.overall_grade}`, 12, 'bold', [240, 244, 255]);
      addText(`Privacy Score:    ${result.trust_score.user_safety}%`, 9, 'normal', [200, 210, 230]);
      addText(`Financial Score:  ${result.trust_score.fairness}%`, 9, 'normal', [200, 210, 230]);
      addText(`IP/Compliance:    ${result.trust_score.transparency}%`, 9, 'normal', [200, 210, 230]);
      y += 2;
      addRule();

      // ── Power Imbalance ────────────────────────────────────────────
      addText('POWER IMBALANCE', 10, 'bold', [201, 168, 76]);
      addText(`Level: ${result.power_imbalance.level}  |  Your Rights: ${result.power_imbalance.user_rights_pct}%  |  Their Rights: ${result.power_imbalance.counterparty_rights_pct}%`, 9, 'normal', [200, 210, 230]);
      result.power_imbalance.drivers.forEach(d => addText(`• ${d}`, 8, 'normal', [200, 210, 230]));
      y += 2;
      addRule();

      // ── Hidden Dangers ─────────────────────────────────────────────
      if (result.hidden_dangers.length > 0) {
        addText('HIDDEN DANGER ALERTS', 10, 'bold', [230, 57, 70]);
        result.hidden_dangers.forEach(d => addText(d, 9, 'normal', [255, 180, 180]));
        y += 2;
        addRule();
      }

      // ── Ghost Clauses ──────────────────────────────────────────────
      if (result.ghost_clauses.length > 0) {
        addText('GHOST CLAUSES — What They Omitted', 10, 'bold', [167, 139, 250]);
        result.ghost_clauses.forEach(g => {
          addText(`▲ Missing: ${g.protection_name}`, 9, 'bold', [200, 180, 255]);
          addText(g.why_it_matters, 8, 'normal', [200, 210, 230]);
          addText(`Suggested addition: ${g.inject_suggestion}`, 8, 'normal', [150, 180, 150]);
          y += 1;
        });
        addRule();
      }

      // ── Clause Analysis ────────────────────────────────────────────
      addText('CLAUSE-BY-CLAUSE ANALYSIS', 10, 'bold', [201, 168, 76]);
      y += 2;

      result.clauses.forEach((clause, i) => {
        if (y > 240) { doc.addPage(); y = 20; doc.setFillColor(8, 13, 26); doc.rect(0, 0, 210, 297, 'F'); doc.setFillColor(201, 168, 76); doc.rect(0, 0, 4, 297, 'F'); }

        addText(`${i + 1}. ${clause.title}`, 10, 'bold', [240, 244, 255]);
        addBadge(clause.risk_level, clause.risk_level);

        addText('Original Clause:', 8, 'bold', [136, 146, 164]);
        addText(clause.original_text.slice(0, 300) + (clause.original_text.length > 300 ? '...' : ''), 7, 'normal', [180, 190, 210]);
        y += 1;

        addText('🔵 User Advocate:', 8, 'bold', [100, 160, 255]);
        addText(clause.user_advocate_argument, 8, 'normal', [200, 210, 230]);

        addText('🔴 Devil\'s Advocate:', 8, 'bold', [255, 120, 100]);
        addText(clause.drafters_devil_argument, 8, 'normal', [200, 210, 230]);

        addText('⚖️ Judge Verdict:', 8, 'bold', [255, 210, 100]);
        addText(clause.judge_verdict, 8, 'normal', [200, 210, 230]);

        if (clause.regulatory_note) {
          addText('⚖️ Regulator:', 8, 'bold', [100, 220, 150]);
          addText(clause.regulatory_note, 8, 'normal', [200, 210, 230]);
        }
        if (clause.ethics_flag) {
          addText('🌐 Ethics:', 8, 'bold', [200, 150, 255]);
          addText(clause.ethics_flag, 8, 'normal', [200, 210, 230]);
        }

        addText('⚔️ Fight Back Rewrite:', 8, 'bold', [100, 200, 150]);
        addText(clause.fight_back_rewrite, 8, 'normal', [200, 210, 230]);

        addText('💬 Say This:', 8, 'bold', [200, 200, 255]);
        addText(`"${clause.negotiation_line}"`, 8, 'normal', [200, 210, 230]);

        if (clause.jurisdiction_override?.applicable) {
          addText(`🌍 Jurisdiction Note (${clause.jurisdiction_override.severity_change?.toUpperCase() || 'INFO'}):`, 8, 'bold', [150, 220, 200]);
          addText(clause.jurisdiction_override.note, 8, 'normal', [200, 210, 230]);
          if (clause.jurisdiction_override.law_reference) {
            addText(`Law: ${clause.jurisdiction_override.law_reference}`, 7, 'normal', [150, 180, 150]);
          }
        }

        y += 3;
        addRule([30, 42, 65]);
      });

      // ── Footer ─────────────────────────────────────────────────────
      doc.addPage();
      doc.setFillColor(8, 13, 26);
      doc.rect(0, 0, 210, 297, 'F');
      doc.setFillColor(201, 168, 76);
      doc.rect(0, 0, 4, 297, 'F');
      y = 30;
      addText('NEGOTIATION BATTLECARD', 14, 'bold', [201, 168, 76]);
      addRule([201, 168, 76]);
      const battle = result.clauses.filter(c => c.risk_level === 'CRITICAL' || c.risk_level === 'HIGH');
      battle.forEach((c, i) => {
        addText(`${i + 1}. [${c.risk_level}] ${c.title}`, 10, 'bold', [240, 244, 255]);
        addText(`Why it hurts: ${c.user_advocate_argument.slice(0, 200)}`, 8, 'normal', [255, 180, 180]);
        addText(`Say this: "${c.negotiation_line}"`, 8, 'normal', [180, 255, 180]);
        y += 3;
      });

      y += 10;
      addRule();
      addText('Generated by LexGuard — AI Contract Defense System', 8, 'normal', [136, 146, 164]);
      addText('Not legal advice. For contract awareness and decision-support only.', 8, 'normal', [100, 110, 130]);
      addText('lexguard.ai', 8, 'bold', [201, 168, 76]);

      // Save
      const filename = `LexGuard_Report_${result.document_title.replace(/\s+/g, '_').slice(0, 40)}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      console.error('[LexGuard] PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.button
      onClick={handleExport}
      disabled={isExporting}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
        done
          ? 'bg-green-500/15 border-green-500/40 text-green-400'
          : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
      } disabled:opacity-50 disabled:cursor-wait`}
    >
      {done ? (
        <><CheckCheck className="w-3.5 h-3.5" /> Exported!</>
      ) : isExporting ? (
        <><motion.div className="w-3.5 h-3.5 border-2 border-yellow-400 border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} /> Building PDF...</>
      ) : (
        <><Download className="w-3.5 h-3.5" /> Export Full Report</>
      )}
    </motion.button>
  );
}
