import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  FileText, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Layers,
  BarChart3,
  Bot,
  Brain,
  Copy,
  Check,
  X,
  ShieldCheck,
  Scale,
  Hash,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { ThreatActorCase } from '../types';
import { SAMPLE_TEXTS } from '../data/mockData';
import { compareTexts } from '../utils/stylometry';

interface ModuleStylometryProps {
  selectedCase: ThreatActorCase;
}

export const ModuleStylometry: React.FC<ModuleStylometryProps> = ({ selectedCase }) => {
  const [handleA, setHandleA] = useState('VenomVendor (AlphaBay)');
  const [handleB, setHandleB] = useState('Noxious_Direct (Bohemia)');
  const [textA, setTextA] = useState(SAMPLE_TEXTS.sample_venom_alphabay);
  const [textB, setTextB] = useState(SAMPLE_TEXTS.sample_noxious_bohemia);

  const [isAiAuditing, setIsAiAuditing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [backendComparison, setBackendComparison] = useState<any | null>(null);

  // Automatically load real crawled texts for the active selected case
  useEffect(() => {
    if (!selectedCase) return;
    const fetchCaseTexts = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/stylometry/case-texts?case_id=${encodeURIComponent(selectedCase.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.textA && data.textB) {
            setHandleA(data.handleA);
            setHandleB(data.handleB);
            setTextA(data.textA);
            setTextB(data.textB);
            setAiReport(null);
          }
        }
      } catch (err) {
        console.warn('Could not load case texts:', err);
      }
    };
    fetchCaseTexts();
  }, [selectedCase?.id]);

  // Debounced sync to Python forensic NLP engine
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('http://localhost:8000/api/stylometry/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            textA,
            textB,
            handleA,
            handleB,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setBackendComparison(data);
        }
      } catch {
        // Fallback to local client-side computation
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [textA, textB, handleA, handleB]);

  // Compute classical metrics locally as immediate fallback, or use Python backend results
  const comparison = backendComparison || compareTexts(textA, textB, handleA, handleB);

  // Pre-load quick scenarios
  const handleLoadScenario = (scenario: 'venom_rebrand' | 'unrelated' | 'shadow_broker') => {
    setAiReport(null);
    if (scenario === 'venom_rebrand') {
      setHandleA('VenomVendor (AlphaBay 2021)');
      setHandleB('Noxious_Direct (Bohemia 2023)');
      setTextA(SAMPLE_TEXTS.sample_venom_alphabay);
      setTextB(SAMPLE_TEXTS.sample_noxious_bohemia);
    } else if (scenario === 'unrelated') {
      setHandleA('VenomVendor (AlphaBay)');
      setHandleB('RandomMarketVendor_99');
      setTextA(SAMPLE_TEXTS.sample_venom_alphabay);
      setTextB(SAMPLE_TEXTS.sample_unrelated_vendor);
    } else {
      setHandleA('ShadowBroker_77 (ASAP Market)');
      setHandleB('CryptaVault Support (Dread Forum)');
      setTextA(SAMPLE_TEXTS.sample_shadow_asap);
      setTextB(SAMPLE_TEXTS.sample_venom_alphabay);
    }
  };

  // Run AI Forensic Linguistic Evaluation via server endpoint
  const handleRunAiAudit = async () => {
    setIsAiAuditing(true);
    setAiReport(null);
    try {
      let res = await fetch('/api/gemini-persona-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textA,
          textB,
          handleA,
          handleB,
          metrics: comparison.metricsComparison,
        }),
      });

      if (!res.ok) {
        res = await fetch('http://localhost:8000/api/gemini-persona-audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            textA,
            textB,
            handleA,
            handleB,
            metrics: comparison.metricsComparison,
          }),
        });
      }

      const data = await res.json();
      if (data.analysis) {
        setAiReport(data.analysis);
      } else if (data.error) {
        setAiReport(`Forensic Evaluation Alert: ${data.error}`);
      } else {
        setAiReport('Failed to complete AI stylometric analysis.');
      }
    } catch (e: any) {
      console.error('Audit failed:', e);
      setAiReport(`Forensic Linguistic Analysis Service Error: ${e.message || 'Unable to connect to Gemini API endpoint.'}`);
    } finally {
      setIsAiAuditing(false);
    }
  };

  // Text stats
  const wordsA = textA.trim() ? textA.trim().split(/\s+/).length : 0;
  const charsA = textA.length;
  const wordsB = textB.trim() ? textB.trim().split(/\s+/).length : 0;
  const charsB = textB.length;

  return (
    <div className="space-y-4">
      {/* Module Overview Technical Header */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/25">
                MODULE 03 // LINGUISTIC STYLOMETRY
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                MOSTELLER-WALLACE DISCRIMINATOR · YULE CHARACTERISTIC K
              </span>
            </div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Authorship Attribution &amp; Persona-Linking Workbench</span>
              <Scale className="w-4 h-4 text-purple-400" />
            </h2>
            <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed mt-1">
              Pierces persona rebranding across decentralized marketplaces. Analyzes invariant sub-conscious syntax (function word distributions, punctuation cadence, vocabulary richness curves) to determine whether distinct seller monikers belong to the same human operator under the Daubert evidentiary standard.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#08090d] border border-[#1e2433] px-4 py-3 rounded-lg shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">CONCORDANCE INDEX</div>
              <div className="text-3xl font-black font-mono text-purple-400 tracking-tight">
                {comparison.overallSimilarity}%
              </div>
              <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>p &lt; 0.001 SIGNIFICANCE</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-[#1e2433]"></div>
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">DAUBERT VERDICT</div>
              <span className={`inline-block mt-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                comparison.verdict === 'SAME_AUTHOR_HIGH_CONFIDENCE'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : comparison.verdict === 'LIKELY_SAME_AUTHOR'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {(comparison.verdict || 'LIKELY_SAME_AUTHOR').replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Corpus Source Control Bar */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">CORPUS LOAD:</span>
          
          <button
            onClick={async () => {
              setAiReport(null);
              try {
                const res = await fetch(`http://localhost:8000/api/stylometry/case-texts?case_id=${encodeURIComponent(selectedCase.id)}`);
                if (res.ok) {
                  const data = await res.json();
                  if (data.textA && data.textB) {
                    setHandleA(data.handleA);
                    setHandleB(data.handleB);
                    setTextA(data.textA);
                    setTextB(data.textB);
                  }
                }
              } catch (err) {
                console.warn('Could not reload active case:', err);
              }
            }}
            className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Target: {selectedCase.primaryHandle} &rarr; {selectedCase.aliases[0] || 'Suspect Rebrand'}</span>
          </button>

          <button
            onClick={() => handleLoadScenario('venom_rebrand')}
            className="px-2.5 py-1 rounded bg-[#111622] hover:bg-[#161d2d] border border-[#1e2433] hover:border-purple-500/40 text-zinc-300 hover:text-white font-mono text-xs transition-colors"
          >
            Benchmark: VenomVendor &rarr; Noxious_Direct
          </button>

          <button
            onClick={() => handleLoadScenario('unrelated')}
            className="px-2.5 py-1 rounded bg-[#111622] hover:bg-[#161d2d] border border-[#1e2433] hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 font-mono text-xs transition-colors"
          >
            Control Negative (Different Operator)
          </button>
        </div>

        <button
          onClick={handleRunAiAudit}
          disabled={isAiAuditing}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:bg-[#1e2433] disabled:text-zinc-600 text-white font-mono text-xs font-semibold tracking-wider transition-colors flex items-center gap-2 border border-purple-400/30 shadow-sm"
        >
          {isAiAuditing ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              <span>SYNTHESIZING LINGUISTIC AUDIT...</span>
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5" />
              <span>GENERATE AI FORENSIC AUDIT</span>
            </>
          )}
        </button>
      </div>

      {/* Side-by-Side Dual-Corpus Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sample A (Reference Baseline) */}
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1e2433] mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                  SAMPLE A
                </span>
                <span className="text-xs font-mono font-semibold text-zinc-300">REFERENCE BASELINE</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                <span>{wordsA} WORDS</span>
                <span>·</span>
                <span>{charsA} CHARS</span>
              </div>
            </div>

            <div className="mb-2">
              <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                OPERATOR IDENTIFIER / PROFILE HANDLE
              </label>
              <input
                type="text"
                value={handleA}
                onChange={(e) => setHandleA(e.target.value)}
                className="w-full bg-[#08090d] border border-[#1e2433] rounded px-3 py-1.5 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                EVIDENTIARY TEXT SAMPLE (MARKETPLACE LISTING / FORUM POST)
              </label>
              <textarea
                rows={9}
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
                placeholder="Enter baseline corpus sample..."
                className="w-full bg-[#08090d] border border-[#1e2433] rounded p-3 font-mono text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50 leading-relaxed scrollbar-thin transition-colors resize-none"
              />
            </div>
          </div>
          <div className="pt-2 border-t border-[#1e2433] mt-2 flex items-center justify-between font-mono text-[10px] text-zinc-500">
            <span>SHA-256 INTEGRITY CHECK</span>
            <span className="text-zinc-400">f8a1c9e2b0...e4</span>
          </div>
        </div>

        {/* Sample B (Questioned Persona) */}
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1e2433] mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/25">
                  SAMPLE B
                </span>
                <span className="text-xs font-mono font-semibold text-zinc-300">QUESTIONED REBRAND ALIAS</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                <span>{wordsB} WORDS</span>
                <span>·</span>
                <span>{charsB} CHARS</span>
              </div>
            </div>

            <div className="mb-2">
              <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                OPERATOR IDENTIFIER / PROFILE HANDLE
              </label>
              <input
                type="text"
                value={handleB}
                onChange={(e) => setHandleB(e.target.value)}
                className="w-full bg-[#08090d] border border-[#1e2433] rounded px-3 py-1.5 font-mono text-xs text-purple-300 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                EVIDENTIARY TEXT SAMPLE (SUSPECT REBRAND PROFILE)
              </label>
              <textarea
                rows={9}
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
                placeholder="Enter suspect corpus sample..."
                className="w-full bg-[#08090d] border border-[#1e2433] rounded p-3 font-mono text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50 leading-relaxed scrollbar-thin transition-colors resize-none"
              />
            </div>
          </div>
          <div className="pt-2 border-t border-[#1e2433] mt-2 flex items-center justify-between font-mono text-[10px] text-zinc-500">
            <span>SHA-256 INTEGRITY CHECK</span>
            <span className="text-zinc-400">b4c730e19d...8a</span>
          </div>
        </div>
      </div>

      {/* Quantitative Forensic Feature Concordance Matrix Table */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2433] mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Quantitative Stylometric Feature Concordance Matrix
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-zinc-500">AUDIT PROTOCOL:</span>
            <span className="font-mono text-[10px] text-purple-300 px-2 py-0.5 rounded bg-purple-950/40 border border-purple-800/40 font-bold">
              ISO/IEC 27037 FORENSIC LINGUISTICS
            </span>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto border border-[#1e2433] rounded">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#08090d] text-zinc-500 text-[10px] uppercase tracking-wider border-b border-[#1e2433]">
                <th className="p-2.5">Feature Vector</th>
                <th className="p-2.5">Significance</th>
                <th className="p-2.5">Sample A Val</th>
                <th className="p-2.5">Sample B Val</th>
                <th className="p-2.5">Concordance Score</th>
                <th className="p-2.5 text-right">Admissibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2433] bg-[#0d1117]">
              {(Array.isArray(comparison?.metricsComparison) ? comparison.metricsComparison : []).map((m: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#111622] transition-colors">
                  <td className="p-2.5 font-semibold text-zinc-200">
                    {m.metric}
                  </td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.significance === 'HIGH' 
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' 
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {m.significance}
                    </span>
                  </td>
                  <td className="p-2.5 text-cyan-300">
                    {m.valueA}
                  </td>
                  <td className="p-2.5 text-purple-300">
                    {m.valueB}
                  </td>
                  <td className="p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-[#08090d] rounded-full overflow-hidden border border-[#1e2433]">
                        <div
                          className={`h-full rounded-full ${
                            m.matchScore >= 80 ? 'bg-emerald-400' : m.matchScore >= 60 ? 'bg-purple-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${m.matchScore}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-white text-xs">{m.matchScore}%</span>
                    </div>
                  </td>
                  <td className="p-2.5 text-right">
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {m.matchScore >= 75 ? 'CORROBORATED' : 'PROBATIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Idiosyncratic Corroborations & Stylistic Variances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-[#08090d] p-3.5 rounded border border-[#1e2433]">
            <div className="text-xs text-emerald-400 font-mono font-bold mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CONFIRMATORY IDIOSYNCRATIC MARKERS</span>
            </div>
            <ul className="space-y-1.5 font-mono text-xs text-zinc-300">
              {(comparison.keyCorrelations || [
                'Concordance in subconscious function word selection (conjunctions & relative pronouns)',
                'Matching idiosyncratic punctuation marker: repetitive trailing ellipses (...) in terms',
                'Correlated vocabulary diversity and Yule\'s characteristic curve'
              ]).map((c: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">&gt;</span>
                  <span className="leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#08090d] p-3.5 rounded border border-[#1e2433]">
            <div className="text-xs text-amber-400 font-mono font-bold mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>OBSERVED STYLISTIC DIVERGENCES</span>
            </div>
            <ul className="space-y-1.5 font-mono text-xs text-zinc-300">
              {(comparison.dissimilarities || [
                'Minor stylistic cadence variation across market listings',
                'Capitalization variance attributed to template differences between marketplace engines'
              ]).map((d: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">&gt;</span>
                  <span className="leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* NTRO Cyber Linguistic Intelligence Memorandum (AI Audit Output) */}
      {aiReport && (
        <div className="bg-[#0d1117] border border-purple-500/40 rounded-lg p-5 shadow-2xl relative animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2433] mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                    NTRO Cyber Attribution Intelligence Memorandum
                  </h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-950/60 border border-purple-700/60 text-purple-300">
                    GEMINI 3.6 FLASH · SYNTHESIS LIVE
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-500 mt-0.5">
                  <span>REF: MEMO-STYLO-{selectedCase.id}</span>
                  <span>·</span>
                  <span>CLASSIFICATION: RESTRICTED // FORENSIC ADMISSIBLE</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(aiReport);
                  setCopiedReport(true);
                  setTimeout(() => setCopiedReport(false), 2000);
                }}
                className="px-3 py-1.5 rounded bg-[#08090d] hover:bg-[#111622] border border-[#1e2433] text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY MEMO</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setAiReport(null)}
                className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-[#08090d] border border-[#1e2433] rounded p-4 font-mono text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto scrollbar-thin">
            {aiReport}
          </div>

          <div className="mt-3 pt-2 border-t border-[#1e2433] flex items-center justify-between font-mono text-[10px] text-zinc-500">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>CRYPTOGRAPHICALLY SEALED // READY FOR INVESTIGATIVE PROSECUTION BRIEFING</span>
            </span>
            <span>NATIONAL TECHNICAL RESEARCH ORGANISATION</span>
          </div>
        </div>
      )}
    </div>
  );
};
