'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { ConsequenceEvent } from '@/lib/types';

interface Props {
  events: ConsequenceEvent[];
  clauseTitle: string;
}

export default function ConsequenceTimeline({ events, clauseTitle }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  if (!events || events.length === 0) return null;

  const maxMonth = Math.max(...events.map(e => e.month), 1);
  const riskCount = events.filter(e => e.is_risk_point).length;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-bold text-gray-200">🔮 What Happens If You Sign?</span>
          {riskCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-semibold">
              {riskCount} risk point{riskCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-500 text-xs"
        >
          ▼
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {/* Timeline Track */}
              <div className="relative mt-2 mb-6">
                {/* Track line */}
                <div className="absolute top-[14px] md:top-[18px] left-0 right-0 h-0.5 bg-white/8 rounded-full" />

                {/* Animated fill */}
                <motion.div
                  className="absolute top-[14px] md:top-[18px] left-0 h-0.5 rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                />

                {/* Event markers */}
                <div className="relative flex justify-between">
                  {events.map((event, i) => {
                    const isActive = activeIndex === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(isActive ? null : i)}
                        className="flex flex-col items-center group"
                        style={{ width: `${100 / events.length}%` }}
                      >
                        {/* Dot */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 300 }}
                          className={`relative w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center border-2 transition-all duration-200 z-10 ${
                            isActive
                              ? event.is_risk_point
                                ? 'bg-red-500 border-red-400 scale-110'
                                : 'bg-purple-500 border-purple-400 scale-110'
                              : event.is_risk_point
                              ? 'bg-red-500/20 border-red-500/60 hover:bg-red-500/40 hover:scale-105'
                              : 'bg-purple-500/15 border-purple-500/40 hover:bg-purple-500/30 hover:scale-105'
                          }`}
                        >
                          {event.is_risk_point ? (
                            <AlertTriangle
                              className={`w-3 h-3 md:w-4 md:h-4 ${isActive ? 'text-white' : 'text-red-400'}`}
                            />
                          ) : (
                            <span
                              className={`text-[8px] md:text-[10px] font-bold ${isActive ? 'text-white' : 'text-purple-400'}`}
                            >
                              M
                            </span>
                          )}

                          {/* Glow for risk points */}
                          {event.is_risk_point && (
                            <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping pointer-events-none" />
                          )}
                        </motion.div>

                        {/* Month label */}
                        <div
                          className={`mt-2 text-[9px] font-bold transition-colors ${
                            isActive
                              ? event.is_risk_point ? 'text-red-400' : 'text-purple-400'
                              : 'text-gray-600'
                          }`}
                        >
                          {event.month === 0 ? 'Now' : `M${event.month}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Event Detail Card */}
              <AnimatePresence mode="wait">
                {activeIndex !== null ? (
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 rounded-xl border text-sm leading-relaxed ${
                      events[activeIndex].is_risk_point
                        ? 'bg-red-500/10 border-red-500/30 text-red-200'
                        : 'bg-purple-500/8 border-purple-500/20 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {events[activeIndex].is_risk_point
                        ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        : <Clock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      }
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        events[activeIndex].is_risk_point ? 'text-red-400' : 'text-purple-400'
                      }`}>
                        {events[activeIndex].month === 0
                          ? 'Day You Sign'
                          : `Month ${events[activeIndex].month}`}
                        {events[activeIndex].is_risk_point ? ' — ⚠️ Risk Point' : ''}
                      </span>
                    </div>
                    {events[activeIndex].event}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-3 text-[11px] text-gray-600"
                  >
                    Tap any marker to see what happens at that point
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mini legend */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <div className="w-3 h-3 rounded-full bg-purple-500/40 border border-purple-500/50" />
                  Neutral event
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/50" />
                  Risk point
                </div>
                <div className="ml-auto text-[10px] text-gray-600 italic">
                  Based on: {clauseTitle}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
