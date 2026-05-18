'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Swords, Shield, Eye, Gavel, Upload, ChevronRight, AlertTriangle, Terminal } from 'lucide-react';
import { PERSONAS, JURISDICTIONS, DEMO_CONTRACTS } from '@/lib/constants';
import { Persona, Jurisdiction } from '@/lib/types';
import { API_ANALYZE, API_PARSE_PDF, MIN_CONTRACT_CHARS, RESULT_STORAGE_KEY } from '@/lib/config';

const SIDEBAR = [
  { icon: Gavel,  label: 'Scanner' },
  { icon: Swords, label: 'Defense', active: true },
  { icon: Scale,  label: 'Judge' },
  { icon: Shield, label: 'Guard' },
  { icon: Eye,    label: 'Intel' },
];

const RISK_BADGE: Record<string, string> = {
  internship_trap:    'CRITICAL THREAT',
  freelancer_ip_heist:'SEVERE BREACH',
  app_privacy_horror: 'CRITICAL EXPOSURE',
};

export default function HomePage() {
  const router = useRouter();
  const [persona, setPersona] = useState<Persona>('employee');
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('india');
  const [contractText, setContractText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'paste'|'demo'>('paste');

  const handleAnalyze = async (text = contractText) => {
    if (!text.trim() || text.trim().length < MIN_CONTRACT_CHARS) {
      setError(`Minimum ${MIN_CONTRACT_CHARS} characters required.`); return;
    }
    setError(''); setIsAnalyzing(true);
    try {
      const res = await fetch(API_ANALYZE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText: text, persona, jurisdiction }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Analysis failed'); }
      sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(await res.json()));
      router.push('/results');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed.');
      setIsAnalyzing(false);
    }
  };

  const handleFile = useCallback(async (file: File) => {
    setError('');
    const isDocx = file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');
    const allowed = ['application/pdf','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword'];
    if (!allowed.includes(file.type) && !isDocx) { setError('Only PDF, DOCX, and .txt files are supported.'); return; }
    if (file.type === 'text/plain') { setContractText(await file.text()); setActiveTab('paste'); return; }
    setIsParsing(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch(API_PARSE_PDF, { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Parse failed'); }
      setContractText((await res.json()).text); setActiveTab('paste');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Parse failed.'); }
    finally { setIsParsing(false); }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0]; if (file) await handleFile(file);
  }, [handleFile]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) await handleFile(file); e.target.value = '';
  };

  if (isAnalyzing) return <AnalyzingScreen />;

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg-void)' }}>

      {/* ── Sidebar ── */}
      <aside className="lx-sidebar" style={{ height:'100vh' }}>
        <div style={{ width:'100%', height:'var(--nav-h)', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:'linear-gradient(135deg,#B8860B,#C9A84C)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Scale style={{ width:14, height:14, color:'#000' }} />
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'12px 0', flex:1 }}>
          {SIDEBAR.map((s, i) => (
            <button key={i} className={`lx-sidebar-icon${s.active ? ' active' : ''}`} title={s.label}>
              <s.icon style={{ width:15, height:15 }} />
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Nav */}
        <nav className="lx-nav">
          <span style={{ fontWeight:700, letterSpacing:'0.15em', fontSize:13, color:'white', fontFamily:'JetBrains Mono,monospace' }}>LEXGUARD</span>
          <span style={{ color:'rgba(255,255,255,0.15)', margin:'0 12px' }}>|</span>
          <span className="lx-label" style={{ color:'rgba(201,168,76,0.5)' }}>CLEARANCE GRANTED / V2.0</span>
          <div style={{ display:'flex', gap:4, margin:'0 auto' }}>
            {['REPORTS','ARCHIVE','STATUTES'].map(n => (
              <button key={n} className={`lx-nav-link${n==='STATUTES'?' active':''}`}>{n}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {[Shield,Terminal].map((Icon, i) => (
              <button key={i} style={{ width:32, height:32, borderRadius:4, border:'1px solid rgba(255,255,255,0.08)', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', cursor:'pointer' }}>
                <Icon style={{ width:14, height:14 }} />
              </button>
            ))}
          </div>
        </nav>

        {/* Content scroll area */}
        <div style={{ flex:1, overflowY:'auto', padding:'40px 48px' }}>

          {/* ── Hero ── */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} style={{ marginBottom:32 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:24, marginBottom:16, flexWrap:'wrap' }}>
              <h1 style={{ fontSize:'clamp(36px,5vw,60px)', fontWeight:900, color:'white', lineHeight:1.05, letterSpacing:'-0.02em' }}>Before You Sign</h1>
              <div style={{ width:40, height:2, background:'var(--gold)', flexShrink:0, alignSelf:'center' }} />
              <h1 style={{ fontSize:'clamp(36px,5vw,60px)', fontWeight:900, lineHeight:1.05, letterSpacing:'-0.02em', background:'linear-gradient(135deg,#C9A84C,#E8C96A)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>We Go To War.</h1>
            </div>
            <p className="lx-mono" style={{ color:'var(--text-muted)', maxWidth:560, lineHeight:1.7, fontSize:11 }}>
              LexGuard deploys 5 adversarial AI agents to stress-test your legal documents, simulating corporate sabotage, intellectual property heists, and termination maneuvers. We find the trap before they spring it.
            </p>
          </motion.div>

          {/* ── Upload + Config ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20, marginBottom:40 }}>

            {/* Upload */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.15 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span className="lx-label">Contract Input</span>
                <div style={{ display:'flex', gap:6 }}>
                  {['PDF','DOCX','TXT'].map(f => (
                    <span key={f} className="lx-label" style={{ border:'1px solid rgba(255,255,255,0.1)', padding:'2px 8px', borderRadius:3, color:'rgba(255,255,255,0.3)' }}>{f}</span>
                  ))}
                </div>
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `1px solid ${isDragging ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 8,
                  background: isDragging ? 'rgba(201,168,76,0.04)' : 'var(--bg-surface)',
                  padding: '20px 24px',
                  transition: 'all 0.2s',
                  position: 'relative',
                  boxShadow: isDragging ? '0 0 0 3px rgba(201,168,76,0.15)' : 'none'
                }}
              >
                {isParsing && (
                  <div style={{ position:'absolute', inset:0, background:'rgba(8,12,20,0.85)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, zIndex:10 }}>
                    <span className="lx-label" style={{ color:'var(--gold)' }}>Extracting text...</span>
                  </div>
                )}
                <div style={{ display:'flex', gap:12, marginBottom:12 }}>
                  <button onClick={() => setActiveTab('paste')} className="lx-label"
                    style={{ border:'none', borderBottom: activeTab==='paste' ? '1px solid var(--gold)' : '1px solid transparent', color: activeTab==='paste' ? 'var(--gold)' : 'var(--text-muted)', paddingBottom:6, paddingTop:2, background:'none', cursor:'pointer', transition:'all 0.15s' }}>Paste / Upload</button>
                  <button onClick={() => setActiveTab('demo')} className="lx-label"
                    style={{ border:'none', borderBottom: activeTab==='demo' ? '1px solid #E63946' : '1px solid transparent', color: activeTab==='demo' ? '#E63946' : 'var(--text-muted)', paddingBottom:6, paddingTop:2, background:'none', cursor:'pointer', transition:'all 0.15s' }}>Threat Scenarios</button>
                </div>

                {activeTab === 'paste' ? (
                  <>
                    <textarea
                      value={contractText}
                      onChange={e => setContractText(e.target.value)}
                      placeholder="Drop your contract — or paste any clause. LexGuard begins immediately."
                      className="lx-mono"
                      style={{ width:'100%', height:140, background:'transparent', border:'none', outline:'none', color:'rgba(232,235,242,0.9)', fontSize:11, lineHeight:1.8, resize:'none' }}
                    />
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8, borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:8 }}>
                      <label className="lx-mono" style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-muted)', cursor:'pointer', fontSize:10, transition:'color 0.15s' }}>
                        <Upload style={{ width:11, height:11 }} />
                        {isParsing ? 'Extracting...' : 'Upload PDF, DOCX or .txt'}
                        <input type="file" accept=".pdf,.txt,.docx,.doc" onChange={handleFileInput} style={{ display:'none' }} />
                      </label>
                      {contractText && <span className="lx-label" style={{ color:'rgba(201,168,76,0.4)' }}>{contractText.length.toLocaleString()} chars</span>}
                    </div>
                  </>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {DEMO_CONTRACTS.map(demo => (
                      <button key={demo.id} onClick={() => { setContractText(demo.text); setActiveTab('paste'); }}
                        style={{ padding:'10px 14px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:4, textAlign:'left', cursor:'pointer', transition:'all 0.15s' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <div>
                            <div className="lx-label" style={{ color:'var(--danger)', marginBottom:2 }}>⊗ {RISK_BADGE[demo.id]}</div>
                            <div style={{ color:'var(--text-primary)', fontWeight:600, fontSize:12 }}>{demo.title.replace(/^[^\s]+\s/,'')}</div>
                            <div className="lx-label" style={{ marginTop:2 }}>{demo.subtitle}</div>
                          </div>
                          <ChevronRight style={{ width:14, height:14, color:'var(--text-muted)' }} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right: Jurisdiction + Deploy */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <div className="lx-label" style={{ marginBottom:8 }}>Jurisdiction</div>
                <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value as Jurisdiction)}
                  className="lx-mono"
                  style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:5, color:'var(--text-primary)', fontSize:11, outline:'none', cursor:'pointer' }}>
                  {JURISDICTIONS.map(j => <option key={j.value} value={j.value} style={{ background:'#0D1320' }}>{j.label}</option>)}
                </select>
              </div>

              {error && (
                <div style={{ padding:'10px 12px', background:'rgba(230,57,70,0.08)', border:'1px solid rgba(230,57,70,0.25)', borderRadius:5, display:'flex', gap:8, alignItems:'flex-start' }}>
                  <AlertTriangle style={{ width:13, height:13, color:'var(--danger)', flexShrink:0, marginTop:1 }} />
                  <span className="lx-mono" style={{ color:'#FF8A8A', fontSize:10 }}>{error}</span>
                </div>
              )}

              <button onClick={() => handleAnalyze()} disabled={isAnalyzing || isParsing || !contractText.trim()}
                className="lx-deploy-btn">
                {isAnalyzing ? '⊙ Deploying Agents...' : '→ Deploy AI Defense'}
              </button>

              <p className="lx-label" style={{ textAlign:'center', lineHeight:1.6 }}>
                Not legal advice. AI-assisted contract awareness.
              </p>
            </motion.div>
          </div>

          {/* ── Persona Selector ── */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
            <div className="lx-label" style={{ marginBottom:12 }}>Threat Vector Analysis:</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {PERSONAS.map(p => (
                <button key={p.value} onClick={() => setPersona(p.value)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 10, padding: '18px 16px',
                    background: persona===p.value ? 'rgba(201,168,76,0.1)' : 'var(--bg-surface)',
                    border: persona===p.value ? '1px solid rgba(201,168,76,0.45)' : '1px solid var(--border-muted)',
                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.18s',
                    minWidth: 100, flex: 1,
                    boxShadow: persona===p.value ? '0 0 20px rgba(201,168,76,0.1)' : 'none'
                  }}>
                  <span style={{ fontSize: 28 }}>{p.icon}</span>
                  <span className="lx-label" style={{ color: persona===p.value ? 'var(--gold)' : 'var(--text-muted)', letterSpacing:'0.1em' }}>{p.label}</span>
                  {persona===p.value && <span style={{ width:20, height:2, background:'var(--gold)', borderRadius:1, display:'block' }} />}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AnalyzingScreen() {
  const agents = [
    { id:'UA', label:'USER ADVOCATE',  color:'#4361EE', desc:'Scanning for rights violations...' },
    { id:'DA', label:'DEVIL\'S ADVOCATE', color:'#E63946', desc:'Building counterarguments...' },
    { id:'JG', label:'JUDGE',          color:'#C9A84C', desc:'Synthesizing verdict...' },
    { id:'RG', label:'REGULATOR',      color:'#2DC653', desc:'Cross-referencing jurisdiction laws...' },
    { id:'EQ', label:'ETHICS AGENT',   color:'#A855F7', desc:'Evaluating moral fairness...' },
  ];
  const positions = [
    { top:'10%', left:'50%', transform:'translateX(-50%)' },
    { top:'35%', left:'15%' },
    { top:'35%', right:'15%' },
    { bottom:'20%', left:'22%' },
    { bottom:'20%', right:'22%' },
  ];
  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--bg-void)', overflow:'hidden' }}>
      <aside className="lx-sidebar" style={{ height:'100vh' }}>
        <div style={{ width:'100%', height:'var(--nav-h)', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:28, height:28, borderRadius:6, background:'linear-gradient(135deg,#B8860B,#C9A84C)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Scale style={{ width:14, height:14, color:'#000' }} />
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'12px 0' }}>
          {[Gavel,Swords,Scale,Shield,Eye].map((Icon,i) => (
            <button key={i} className={`lx-sidebar-icon${i===1?' active':''}`}><Icon style={{ width:15, height:15 }} /></button>
          ))}
        </div>
      </aside>
      <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
        <nav className="lx-nav">
          <span style={{ fontWeight:700, letterSpacing:'0.15em', fontSize:13, color:'white', fontFamily:'JetBrains Mono,monospace' }}>LEXGUARD</span>
          <span style={{ color:'rgba(255,255,255,0.15)', margin:'0 12px' }}>|</span>
          <span className="lx-label" style={{ color:'rgba(201,168,76,0.5)' }}>PROTOCOL: OMEGA-01</span>
          <div style={{ display:'flex', gap:4, margin:'0 auto' }}>
            {['REPORTS','ARCHIVE','STATUTES'].map(n => <button key={n} className="lx-nav-link">{n}</button>)}
          </div>
        </nav>
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
          <span className="lx-label" style={{ marginBottom:32, letterSpacing:'0.3em', color:'rgba(201,168,76,0.6)' }}>ANALYZING</span>
          {/* Orbital rings */}
          <div style={{ position:'relative', width:320, height:320, marginBottom:40 }}>
            {[320,220].map(s => (
              <div key={s} style={{ position:'absolute', width:s, height:s, top:'50%', left:'50%', transform:'translate(-50%,-50%)', border:'1px solid rgba(201,168,76,0.1)', borderRadius:'50%' }} />
            ))}
            {/* Center */}
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:56, height:56, borderRadius:'50%', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:'var(--gold)', fontSize:14 }}>LX</span>
            </div>
            {/* Agent nodes */}
            {agents.map((agent, i) => (
              <motion.div key={i}
                style={{ position:'absolute', ...positions[i] }}
                initial={{ opacity:0, scale:0 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ delay:i*0.4+0.2, type:'spring', stiffness:200 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:`${agent.color}18`, border:`1px solid ${agent.color}50`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'default' }}>
                  <span style={{ fontFamily:'JetBrains Mono,monospace', fontWeight:700, color:agent.color, fontSize:11 }}>{agent.id}</span>
                </div>
                <div className="lx-label" style={{ textAlign:'center', marginTop:6, color:`${agent.color}99`, whiteSpace:'nowrap' }}>{agent.label}</div>
              </motion.div>
            ))}
          </div>
          {/* Log */}
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
            style={{ width:'100%', maxWidth:480, background:'rgba(13,19,32,0.9)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:6, padding:'16px 20px' }}>
            <div className="lx-label" style={{ marginBottom:10, color:'rgba(201,168,76,0.5)' }}>Real-Time Execution Log</div>
            {agents.map((agent, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.8+0.5 }}
                className="lx-mono" style={{ fontSize:10, color:'var(--text-secondary)', marginBottom:6, display:'flex', gap:12 }}>
                <span style={{ color:'rgba(255,255,255,0.2)' }}>[{String(i).padStart(2,'0')}:{String(i*4).padStart(2,'0')}]</span>
                <span style={{ color:agent.color }}>●</span>
                <span style={{ color:agent.color, fontWeight:600 }}>{agent.id}</span>
                <span>—</span>
                <span>{agent.desc}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
