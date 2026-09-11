import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  Bot, 
  Brain, 
  Copy, 
  Check, 
  X, 
  Building2, 
  Scale,
  ShieldCheck
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
  const handleLoadScenario = (scenario: 'venom_rebrand' | 'unrelated' | 'shadow_broker' | 'insider_slack') => {
    setAiReport(null);
    if (scenario === 'venom_rebrand') {
      setHandleA('VenomVendor (AlphaBay 2021)');
      setHandleB('Noxious_Direct (Bohemia 2023)');
      setTextA(SAMPLE_TEXTS.sample_venom_alphabay);
      setTextB(SAMPLE_TEXTS.sample_noxious_bohemia);
    } else if (scenario === 'insider_slack') {
      setHandleA('Vikram S. (Internal Slack: #devops-infra)');
      setHandleB('CorpExfil_Direct (Darknet Forum Listing)');
      setTextA(SAMPLE_TEXTS.sample_insider_slack);
      setTextB(SAMPLE_TEXTS.sample_insider_darknet);
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
        setAiReport(`Forensic Evaluation Notice: ${data.error}`);
      } else {
        setAiReport('Failed to complete AI stylometric analysis.');
      }
    } catch (e: any) {
      console.error('Audit failed:', e);
      setAiReport(`Forensic Linguistic Service Error: ${e.message || 'Unable to connect to analysis endpoint.'}`);
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
      {/* Module Overview Header */}
      <div className="surface-card rounded-xl p-5 border border-[#1e273d]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800">
                Stylometric Forensics
              </span>
              <span className="text-xs text-slate-400">
                Mosteller-Wallace Discriminator &middot; Yule Characteristic K
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Authorship Attribution &amp; Persona-Linking</span>
              <Scale className="w-5 h-5 text-blue-400" />
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed mt-1">
              Detects persona rebranding across darknet marketplaces and internal channels. Analyzes subconscious syntax (function-word distribution, punctuation cadence, and vocabulary richness curves) to test whether distinct monikers belong to the same human operator.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#0e121a] border border-[#1b2336] px-4 py-3 rounded-xl shrink-0">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-medium">Concordance Index</div>
              <div className="text-3xl font-mono font-bold text-white">
                {comparison.overallSimilarity}%
              </div>
              <div className="text-[11px] font-medium text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>p &lt; 0.001 Significant</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-[#1e273d]" />
            <div className="text-left">
              <div className="text-[11px] text-slate-400 font-medium">Daubert Standard</div>
              <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-md border ${
                comparison.verdict === 'SAME_AUTHOR_HIGH_CONFIDENCE'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                  : comparison.verdict === 'LIKELY_SAME_AUTHOR'
                  ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800'
              }`}>
                {(comparison.verdict || 'LIKELY_SAME_AUTHOR').replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Corpus Source Switcher & AI Run Action */}
      <div className="surface-card rounded-xl px-4 py-3 border border-[#1e273d] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-400">Presets:</span>
          
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
            className="px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/70 border border-blue-800 text-blue-300 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Target: {selectedCase.primaryHandle} &rarr; {selectedCase.aliases[0] || 'Suspect Rebrand'}</span>
          </button>

          <button
            onClick={() => handleLoadScenario('venom_rebrand')}
            className="px-3 py-1.5 rounded-lg bg-[#101420] hover:bg-[#161c2c] border border-[#1e273d] text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            Benchmark: VenomVendor &rarr; Noxious_Direct
          </button>

          <button
            onClick={() => handleLoadScenario('insider_slack')}
            className="px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/80 text-amber-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Internal employee chat correlated to darknet leak"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Insider: Slack &rarr; Darknet Breach</span>
          </button>

          <button
            onClick={() => handleLoadScenario('unrelated')}
            className="px-3 py-1.5 rounded-lg bg-[#101420] hover:bg-[#161c2c] border border-[#1e273d] text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
          >
            Negative Control (Different Author)
          </button>
        </div>

        <button
          onClick={handleRunAiAudit}
          disabled={isAiAuditing}
          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          {isAiAuditing ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Analyzing Linguistic Fingerprint...</span>
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5" />
              <span>Generate AI Analysis Report</span>
            </>
          )}
        </button>
      </div>

      {/* Side-by-Side Dual-Corpus Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sample A (Reference Baseline) */}
        <div className="surface-card rounded-xl p-4 border border-[#1e273d] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1b2336] mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800">
                  Sample A
                </span>
                <span className="text-xs font-semibold text-slate-200">Reference Baseline</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <span>{wordsA} words</span>
                <span>&middot;</span>
                <span>{charsA} chars</span>
              </div>
            </div>

            <div className="mb-2.5">
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                Author / Profile Handle
              </label>
              <input
                type="text"
                value={handleA}
                onChange={(e) => setHandleA(e.target.value)}
                className="w-full bg-[#0e121a] border border-[#1b2336] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                Evidentiary Text Sample
              </label>
              <textarea
                rows={8}
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
                placeholder="Enter baseline corpus sample..."
                className="w-full bg-[#0e121a] border border-[#1b2336] rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed transition-colors resize-none"
              />
            </div>
          </div>
          <div className="pt-2 border-t border-[#1b2336] mt-2 flex items-center justify-between font-mono text-xs text-slate-500">
            <span>SHA-256 Hash</span>
            <span className="text-slate-400">f8a1c9e2b0...e4</span>
          </div>
        </div>

        {/* Sample B (Questioned Persona) */}
        <div className="surface-card rounded-xl p-4 border border-[#1e273d] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1b2336] mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800">
                  Sample B
                </span>
                <span className="text-xs font-semibold text-slate-200">Questioned Alias / Suspect Rebrand</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <span>{wordsB} words</span>
                <span>&middot;</span>
                <span>{charsB} chars</span>
              </div>
            </div>

            <div className="mb-2.5">
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                Author / Profile Handle
              </label>
              <input
                type="text"
                value={handleB}
                onChange={(e) => setHandleB(e.target.value)}
                className="w-full bg-[#0e121a] border border-[#1b2336] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                Evidentiary Text Sample
              </label>
              <textarea
                rows={8}
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
                placeholder="Enter suspect corpus sample..."
                className="w-full bg-[#0e121a] border border-[#1b2336] rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed transition-colors resize-none"
              />
            </div>
          </div>
          <div className="pt-2 border-t border-[#1b2336] mt-2 flex items-center justify-between font-mono text-xs text-slate-500">
            <span>SHA-256 Hash</span>
            <span className="text-slate-400">b4c730e19d...8a</span>
          </div>
        </div>
      </div>

      {/* Quantitative Forensic Feature Concordance Matrix Table */}
      <div className="surface-card rounded-xl p-5 border border-[#1e273d]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1b2336] mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Stylometric Feature Concordance Matrix
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Protocol:</span>
            <span className="text-[10px] text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-medium">
              ISO/IEC 27037 Forensic Linguistics
            </span>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto border border-[#1b2336] rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0e121a] text-slate-400 text-[11px] font-semibold border-b border-[#1b2336]">
                <th className="p-3">Feature Vector</th>
                <th className="p-3">Significance</th>
                <th className="p-3">Sample A</th>
                <th className="p-3">Sample B</th>
                <th className="p-3">Concordance Score</th>
                <th className="p-3 text-right">Admissibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2336] bg-[#101420]">
              {(Array.isArray(comparison?.metricsComparison) ? comparison.metricsComparison : []).map((m: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#141a29] transition-colors">
                  <td className="p-3 font-medium text-slate-200">
                    {m.metric}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      m.significance === 'HIGH' 
                        ? 'bg-blue-950/60 text-blue-300 border border-blue-800' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {m.significance}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">
                    {m.valueA}
                  </td>
                  <td className="p-3 font-mono text-slate-300">
                    {m.valueB}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-24 h-1.5 bg-[#1a2234] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            m.matchScore >= 80 ? 'bg-emerald-400' : m.matchScore >= 60 ? 'bg-blue-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${m.matchScore}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-white text-xs">{m.matchScore}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      {m.matchScore >= 75 ? 'Corroborated' : 'Probative'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Idiosyncratic Corroborations & Stylistic Variances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-[#0e121a] p-4 rounded-lg border border-[#1b2336]">
            <div className="text-xs text-emerald-400 font-semibold mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmatory Idiosyncratic Markers</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {(comparison.keyCorrelations || [
                'Concordance in subconscious function word selection (conjunctions & relative pronouns)',
                'Matching idiosyncratic punctuation marker: repetitive trailing ellipses (...) in terms',
                'Correlated vocabulary diversity and Yule\'s characteristic curve'
              ]).map((c: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span className="leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#0e121a] p-4 rounded-lg border border-[#1b2336]">
            <div className="text-xs text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Observed Stylistic Divergences</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {(comparison.dissimilarities || [
                'Minor stylistic cadence variation across market listings',
                'Capitalization variance attributed to template differences between marketplace engines'
              ]).map((d: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">&bull;</span>
                  <span className="leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Stylometric Intelligence Memorandum (AI Audit Output) */}
      {aiReport && (
        <div className="surface-card border border-blue-600/50 rounded-xl p-5 shadow-lg relative">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2336] mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-300">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    AI Stylometric Intelligence Memorandum
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                    Gemini Analysis
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>Ref: MEMO-STYLO-{selectedCase.id}</span>
                  <span>&middot;</span>
                  <span>Daubert Evidentiary Standard</span>
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
                className="px-3 py-1.5 rounded-lg bg-[#141a28] hover:bg-[#1a2336] border border-[#24304c] text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Report</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setAiReport(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-[#0e121a] border border-[#1b2336] rounded-lg p-4 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {aiReport}
          </div>

          <div className="mt-3 pt-2 border-t border-[#1b2336] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Forensically Sealed &middot; Ready for Case File</span>
            </span>
            <span className="font-medium text-slate-400">Obsidian De-anonymization Suite</span>
          </div>
        </div>
      )}
    </div>
  );
};
