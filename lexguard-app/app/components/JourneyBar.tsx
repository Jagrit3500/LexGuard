'use client';

import { motion } from 'framer-motion';
import { FileText, User, Cpu, BarChart3 } from 'lucide-react';

export type JourneyStep = 'upload' | 'persona' | 'analyze' | 'results';

interface Props {
  currentStep: JourneyStep;
}

const STEPS: { id: JourneyStep; label: string; icon: React.ReactNode; shortLabel: string }[] = [
  { id: 'upload',  label: 'Upload Contract',  shortLabel: 'Upload',  icon: <FileText  className="w-3.5 h-3.5" /> },
  { id: 'persona', label: 'Set Context',       shortLabel: 'Context', icon: <User      className="w-3.5 h-3.5" /> },
  { id: 'analyze', label: 'AI Analysis',       shortLabel: 'Analyze', icon: <Cpu       className="w-3.5 h-3.5" /> },
  { id: 'results', label: 'Defense Report',    shortLabel: 'Report',  icon: <BarChart3 className="w-3.5 h-3.5" /> },
];

const STEP_INDEX: Record<JourneyStep, number> = {
  upload: 0, persona: 1, analyze: 2, results: 3,
};

export default function JourneyBar({ currentStep }: Props) {
  const current = STEP_INDEX[currentStep];

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-3">
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const isDone    = i < current;
          const isActive  = i === current;
          const isFuture  = i > current;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step node */}
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-300 ${
                    isDone
                      ? 'bg-yellow-500 border-yellow-500 text-black'
                      : isActive
                      ? 'bg-yellow-500/15 border-yellow-500 text-yellow-400'
                      : 'bg-white/3 border-white/10 text-gray-600'
                  }`}
                >
                  {isDone ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}

                  {/* Active pulse ring */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full border-2 border-yellow-500/40 animate-ping pointer-events-none" />
                  )}
                </motion.div>

                {/* Label */}
                <span
                  className={`text-[9px] font-semibold uppercase tracking-wider transition-colors hidden md:block ${
                    isDone    ? 'text-yellow-500'
                    : isActive ? 'text-yellow-400'
                    : 'text-gray-600'
                  }`}
                >
                  {step.shortLabel}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-1.5 mb-4 md:mb-5 overflow-hidden bg-white/8">
                  <motion.div
                    className="h-full bg-yellow-500"
                    initial={{ width: 0 }}
                    animate={{ width: isDone ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
