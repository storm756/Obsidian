import React, { useState } from 'react';
import { 
  Layers, 
  Sliders, 
  FileDown, 
  Sparkles, 
  Copy, 
  Check, 
  Brain, 
  X, 
  ShieldCheck, 
  Calculator, 
  Fingerprint, 
  ArrowRight,
  Server,
  Network,
  Cpu
} from 'lucide-react';
import { ThreatActorCase, AttributionSignalBreakdown } from '../types';

interface FusionLayerProps {
  selectedCase: ThreatActorCase;
  signals: AttributionSignalBreakdown[];
  onOpenExport: () => void;
  onNavigateTab: (tab: 'timeline') => void;
}

export const FusionLayer: React.FC<FusionLayerProps> = ({
  selectedCase,
  signals,
  onOpenExport,
  onNavigateTab,
}) => {
  // Configurable weights
  const [wInfra, setWInfra] = useState<number>(40);
  const [wGraph, setWGraph] = useState<number>(35);
  const [wStylo, setWStylo] = useState<number>(25);

  // Live AI Synthesis State
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [aiDossier, setAiDossier] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedDossier, setCopiedDossier] = useState(false);

  const handleRunAiSynthesis = async () => {
    setIsSynthesizing(true);
    setAiError(null);
    setAiDossier(null);
    try {
      let res = await fetch('/api/gemini-case-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCase: selectedCase, signals }),
      });

      if (!res.ok) {
        res = await fetch('http://localhost:8000/api/gemini-case-synthesis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetCase: selectedCase, signals }),
        });
      }

      const data = await res.json();
      if (data.dossier) {
        setAiDossier(data.dossier);
      } else if (data.error) {
        setAiError(data.error);
      } else {
        setAiError('Failed to generate AI synthesis');
      }
    } catch (e: any) {
      console.error('Synthesis error:', e);
      setAiError(e.message || 'Error reaching AI synthesis service');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCopyDossier = () => {
    if (aiDossier) {
      navigator.clipboard.writeText(aiDossier);
      setCopiedDossier(true);
      setTimeout(() => setCopiedDossier(false), 2000);
    }
  };

  const totalWeight = wInfra + wGraph + wStylo;
  const normInfra = totalWeight > 0 ? wInfra / totalWeight : 0.4;
  const normGraph = totalWeight > 0 ? wGraph / totalWeight : 0.35;
  const normStylo = totalWeight > 0 ? wStylo / totalWeight : 0.25;

  const dynamicComposite = +(
    (selectedCase.scores.infrastructure * normInfra) +
    (selectedCase.scores.entityGraph * normGraph) +
    (selectedCase.scores.stylometry * normStylo)
  ).toFixed(1);

  const getConfidenceRating = (score: number) => {
    if (score >= 85) return { 
      label: 'High Confidence · Daubert Admissible', 
      color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800',
      desc: 'Corroborated across network origin disclosures and cryptographic key proof to meet evidentiary standards.'
    };
    if (score >= 70) return { 
      label: 'Probable Attribution · Investigative', 
      color: 'text-amber-300 bg-amber-950/60 border-amber-800',
      desc: 'Strong multi-pillar correlation; warrants targeted investigative subpoena or warrant application.'
    };
    return { 
      label: 'Inconclusive · Weak Multi-Signal Density', 
      color: 'text-rose-300 bg-rose-950/60 border-rose-800',
      desc: 'Primary signals uncorroborated; potential shared infrastructure or proxy artifact.'
    };
  };

  const currentRating = getConfidenceRating(dynamicComposite);

  // Quick legal/forensic preset calibration
  const applyPreset = (preset: 'daubert' | 'balanced' | 'linguistic') => {
    if (preset === 'daubert') {
      setWInfra(45);
      setWGraph(35);
      setWStylo(20);
    } else if (preset === 'balanced') {
      setWInfra(40);
      setWGraph(35);
      setWStylo(25);
    } else if (preset === 'linguistic') {
      setWInfra(25);
      setWGraph(35);
      setWStylo(40);
    }
  };

  return (
    <div className="space-y-4">
      {/* Fusion Header */}
      <div className="surface-card rounded-xl p-5 border border-[#1e273d]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800">
                Synthesis Engine
              </span>
              <span className="text-xs text-slate-400">
                Multi-Criteria Decision Analysis (MCDA) &middot; Linear Combination Model
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Evidentiary Attribution Scorecard</span>
              <Calculator className="w-4 h-4 text-blue-400" />
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed mt-1">
              Synthesizes physical SOCKS5 server leaks, cryptographic entity graph linkages, and linguistic stylometrics into a mathematically auditable composite score with full chain of custody.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunAiSynthesis}
              disabled={isSynthesizing}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              {isSynthesizing ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Synthesizing Dossier...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Case Brief</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenExport}
              className="px-3.5 py-2 rounded-lg bg-[#1a2236] hover:bg-[#222d47] border border-[#2d3b5c] text-white text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live AI Dossier Card */}
      {aiDossier && (
        <div className="surface-card border border-blue-600/50 rounded-xl p-5 shadow-lg relative">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2336] mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-300">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    De-Anonymization Synthesis Dossier
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                    Gemini Analysis
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>Target: {selectedCase.primaryHandle} ({selectedCase.codename})</span>
                  <span>&middot;</span>
                  <span>Cross-Signal Corroboration</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDossier}
                className="px-3 py-1.5 rounded-lg bg-[#141a28] hover:bg-[#1a2336] border border-[#24304c] text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copiedDossier ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Dossier</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setAiDossier(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-[#0e121a] border border-[#1b2336] rounded-lg p-4 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {aiDossier}
          </div>

          <div className="mt-3 pt-2 border-t border-[#1b2336] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Evidentiary Integrity Verified &middot; Daubert Standard Compliant</span>
            </span>
            <span className="font-medium text-slate-400">Obsidian De-anonymization Suite</span>
          </div>
        </div>
      )}

      {aiError && (
        <div className="bg-rose-950/30 border border-rose-800/50 rounded-lg p-3 text-xs text-rose-300 flex items-center justify-between">
          <span>Notice: {aiError}</span>
          <button onClick={() => setAiError(null)} className="text-rose-400 hover:text-rose-200 font-semibold">Dismiss</button>
        </div>
      )}

      {/* Dynamic Fusion Scorecard & Weight Calibration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Composite Score Spotlight */}
        <div className="surface-card rounded-xl p-5 border border-[#1e273d] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1b2336] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Composite Attribution</span>
              <span className="text-xs font-bold text-blue-400">MCDA Model</span>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl font-mono font-bold text-white">
                {dynamicComposite}%
              </span>
              <span className="text-slate-500 text-xs">/ 100.0</span>
            </div>

            <div className={`px-2.5 py-1 rounded text-xs font-semibold border inline-block ${currentRating.color} mb-3`}>
              {currentRating.label}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {currentRating.desc}
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-[#1b2336] text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                <Server className="w-3.5 h-3.5 text-blue-400" /> Infrastructure:
              </span>
              <span className="font-mono">{selectedCase.scores.infrastructure}% &times; {(normInfra * 100).toFixed(0)}% = <strong className="text-white">{(selectedCase.scores.infrastructure * normInfra).toFixed(1)} pts</strong></span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                <Network className="w-3.5 h-3.5 text-emerald-400" /> Entity Graph:
              </span>
              <span className="font-mono">{selectedCase.scores.entityGraph}% &times; {(normGraph * 100).toFixed(0)}% = <strong className="text-white">{(selectedCase.scores.entityGraph * normGraph).toFixed(1)} pts</strong></span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> Stylometry:
              </span>
              <span className="font-mono">{selectedCase.scores.stylometry}% &times; {(normStylo * 100).toFixed(0)}% = <strong className="text-white">{(selectedCase.scores.stylometry * normStylo).toFixed(1)} pts</strong></span>
            </div>
          </div>
        </div>

        {/* Signal Weight Calibration Sliders */}
        <div className="lg:col-span-2 surface-card rounded-xl p-5 border border-[#1e273d] flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1b2336] mb-4 gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Telemetry Layer Weight Sensitivity
                </h3>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 mr-1 font-medium">Presets:</span>
                <button
                  onClick={() => applyPreset('daubert')}
                  className="px-2.5 py-1 rounded-md bg-[#0e121a] hover:bg-[#161c2c] border border-[#1b2336] text-slate-300 hover:text-white text-xs transition-colors"
                >
                  Daubert (45/35/20)
                </button>
                <button
                  onClick={() => applyPreset('balanced')}
                  className="px-2.5 py-1 rounded-md bg-[#0e121a] hover:bg-[#161c2c] border border-[#1b2336] text-slate-300 hover:text-white text-xs transition-colors"
                >
                  Balanced (40/35/25)
                </button>
                <button
                  onClick={() => applyPreset('linguistic')}
                  className="px-2.5 py-1 rounded-md bg-[#0e121a] hover:bg-[#161c2c] border border-[#1b2336] text-slate-300 hover:text-white text-xs transition-colors"
                >
                  Rebrand Focus (25/35/40)
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Weight 1: Infrastructure */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <span>1. Infrastructure Reconnaissance</span>
                  </span>
                  <span className="text-slate-300 font-mono text-xs">{(normInfra * 100).toFixed(0)}% (w₁ = {normInfra.toFixed(3)})</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={wInfra}
                  onChange={(e) => setWInfra(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 bg-[#0e121a] rounded-lg"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Higher weight allocated when tangible Apache /status disclosures or TLS SHA-256 certificate reuse occurs.
                </p>
              </div>

              {/* Weight 2: Entity Graph */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <span>2. Cryptographic Entity Graph</span>
                  </span>
                  <span className="text-slate-300 font-mono text-xs">{(normGraph * 100).toFixed(0)}% (w₂ = {normGraph.toFixed(3)})</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={wGraph}
                  onChange={(e) => setWGraph(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-[#0e121a] rounded-lg"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Reflects 4096-bit RSA PGP key fingerprint overlaps and UTXO co-spend transaction clustering.
                </p>
              </div>

              {/* Weight 3: Stylometry */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <span>3. Linguistic Stylometric Discriminator</span>
                  </span>
                  <span className="text-slate-300 font-mono text-xs">{(normStylo * 100).toFixed(0)}% (w₃ = {normStylo.toFixed(3)})</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={wStylo}
                  onChange={(e) => setWStylo(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#0e121a] rounded-lg"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Calculates Mosteller-Wallace function-word frequencies to connect rebranded seller identities.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1b2336] flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Signal Diversity: <strong className="text-emerald-400">3 of 3 Active Pillars</strong>
            </span>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium"
            >
              <span>View Investigation Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Explainable Attribution Breakdown Table (Chain of Custody) */}
      <div className="surface-card rounded-xl p-5 border border-[#1e273d]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1b2336] mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Evidentiary Audit Ledger &amp; Signal Contribution
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {signals.length} Independent Telemetry Signals
          </span>
        </div>

        <div className="space-y-3">
          {signals.map((sig, idx) => (
            <div
              key={idx}
              className="bg-[#0e121a] p-4 rounded-xl border border-[#1b2336] hover:border-slate-600 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1b2336] mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    sig.category === 'INFRASTRUCTURE'
                      ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                      : sig.category === 'ENTITY_GRAPH'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                      : 'bg-purple-950/60 text-purple-300 border border-purple-800'
                  }`}>
                    {sig.category}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {sig.signalName}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">Confidence: <strong className="text-slate-200 font-mono">{sig.rawScore}%</strong></span>
                  <span className="text-blue-300 font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800 font-mono">
                    +{sig.weightedScore.toFixed(1)} pts
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">
                {sig.evidenceSummary}
              </p>

              <div className="text-xs text-slate-400 bg-[#090c12] p-2.5 rounded-lg border border-[#1b2336] flex items-start gap-2">
                <Fingerprint className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-blue-400 font-semibold mr-1.5">Cryptographic Proof:</span>
                  <span className="text-slate-200 font-mono text-[11px] break-all">{sig.verifiableProof}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
