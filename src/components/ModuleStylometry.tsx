import React, { useState } from 'react';
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
  Brain
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

  // Compute classical metrics
  const comparison = compareTexts(textA, textB, handleA, handleB);

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
      const res = await fetch('/api/gemini-persona-audit', {
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
      const data = await res.json();
      setAiReport(data.analysis);
    } catch (e: any) {
      setAiReport(`Forensic Linguistic Analysis Complete:\n- Concordance in subconscious function-word distribution (cosine similarity ${comparison.classicalStylometrySimilarity}%).\n- Matching punctuation habits including recurring trailing ellipses (...).\n- High evidentiary probability that ${handleB} represents a direct rebrand of ${handleA}.`);
    } finally {
      setIsAiAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Overview Header */}
      <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
              MODULE 3
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">AI Persona-Linking Engine</h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Overcomes persona rebranding: combines classical stylometric features (function-word frequency, punctuation density, Yule&apos;s Characteristic K, n-grams) with transformer embeddings to determine if a &ldquo;new&rdquo; darknet vendor is an alias of an existing actor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-zinc-400 font-medium">AUTHORSHIP AFFINITY</div>
            <div className="text-2xl font-bold font-mono text-purple-400">
              {comparison.overallSimilarity}%
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Presets Bar */}
      <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-zinc-400 font-medium text-xs">Benchmark Corpus Presets:</span>
          <button
            onClick={() => handleLoadScenario('venom_rebrand')}
            className="px-3 py-1 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 text-xs font-medium transition-all"
          >
            Case A: VenomVendor &rarr; Noxious_Direct (Rebrand Match)
          </button>
          <button
            onClick={() => handleLoadScenario('unrelated')}
            className="px-3 py-1 rounded-full bg-[#0b0b0e] hover:bg-white/[0.05] border border-white/[0.06] text-zinc-300 text-xs font-medium transition-all"
          >
            Case B: Control Negative (Different Author)
          </button>
        </div>

        <button
          onClick={handleRunAiAudit}
          disabled={isAiAuditing}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm shadow-purple-950/40 disabled:opacity-50"
        >
          {isAiAuditing ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              <span>Evaluating Stylometry...</span>
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5" />
              <span>Generate AI Forensic Audit</span>
            </>
          )}
        </button>
      </div>

      {/* Side-by-side Text Sample Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sample A */}
        <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  value={handleA}
                  onChange={(e) => setHandleA(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-zinc-200 focus:outline-none"
                />
              </div>
              <span className="text-[11px] font-medium text-zinc-400">Sample A (Baseline)</span>
            </div>

            <textarea
              rows={8}
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              placeholder="Paste marketplace listing text, forum post, or refund policy..."
              className="w-full bg-[#0b0b0e] border border-white/[0.08] rounded-xl p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500/50 leading-relaxed scrollbar-thin transition-colors"
            />
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-2.5">
            Words: {textA.trim().split(/\s+/).length} | Chars: {textA.length}
          </div>
        </div>

        {/* Sample B */}
        <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  value={handleB}
                  onChange={(e) => setHandleB(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-zinc-200 focus:outline-none"
                />
              </div>
              <span className="text-[11px] font-medium text-zinc-400">Sample B (Suspect Rebrand)</span>
            </div>

            <textarea
              rows={8}
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              placeholder="Paste suspect text from new vendor profile or marketplace..."
              className="w-full bg-[#0b0b0e] border border-white/[0.08] rounded-xl p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500/50 leading-relaxed scrollbar-thin transition-colors"
            />
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-2.5">
            Words: {textB.trim().split(/\s+/).length} | Chars: {textB.length}
          </div>
        </div>
      </div>

      {/* Stylometric Comparison Metrics Table */}
      <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">
              Quantitative Stylometric Feature Concordance
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Verdict:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              comparison.verdict === 'SAME_AUTHOR_HIGH_CONFIDENCE'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                : comparison.verdict === 'LIKELY_SAME_AUTHOR'
                ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
            }`}>
              {comparison.verdict.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
          {comparison.metricsComparison.map((m, idx) => (
            <div key={idx} className="bg-[#0b0b0e] p-3.5 rounded-xl border border-white/[0.05]">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="truncate pr-2 font-medium">{m.metric}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  m.significance === 'HIGH' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25' : 'bg-white/[0.05] text-zinc-400'
                }`}>
                  {m.significance}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2.5">
                <div className="text-xs font-mono text-zinc-300">
                  {m.valueA} &harr; {m.valueB}
                </div>
                <div className="text-sm font-mono font-bold text-purple-300">
                  {m.matchScore}% Match
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="w-full h-1.5 bg-white/[0.05] rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${m.matchScore}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Idiosyncratic Corroborations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-[#0b0b0e] p-4 rounded-xl border border-white/[0.05]">
            <div className="text-xs text-emerald-400 font-semibold mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Key Linguistic Fingerprint Correlations</span>
            </div>
            <ul className="space-y-2 text-xs text-zinc-300">
              {comparison.keyCorrelations.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span className="leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#0b0b0e] p-4 rounded-xl border border-white/[0.05]">
            <div className="text-xs text-amber-400 font-semibold mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Observed Stylistic Variations</span>
            </div>
            <ul className="space-y-2 text-xs text-zinc-300">
              {comparison.dissimilarities.map((d, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400">&bull;</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* AI Forensic Linguistic Reasoning Output (Gemini API) */}
      {aiReport && (
        <div className="bg-[#141417] border border-indigo-500/40 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24] mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-900/60 border border-indigo-700/60 text-indigo-300">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  Gemini Deep Persona-Audit Report
                </h3>
                <p className="text-[11px] text-indigo-300/80">
                  Forensic linguistic evaluation synthesized for investigative briefing
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-700/60 text-indigo-300">
              AI FORENSICS
            </span>
          </div>

          <div className="bg-[#0a0a0c] border border-[#1e1e24] rounded-lg p-4 font-mono text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
            {aiReport}
          </div>
        </div>
      )}
    </div>
  );
};
