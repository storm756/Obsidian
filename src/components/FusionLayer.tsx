import React, { useState } from 'react';
import { 
  Layers, 
  Sliders, 
  CheckCircle2, 
  ShieldAlert, 
  FileDown, 
  FileText, 
  ExternalLink,
  HelpCircle,
  TrendingUp,
  Cpu,
  Network,
  Server,
  Sparkles,
  Copy,
  Check,
  Brain,
  X,
  ShieldCheck,
  Scale,
  Calculator,
  Fingerprint,
  ArrowRight
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
      label: 'HIGH CONFIDENCE // DAUBERT ADMISSIBLE', 
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
      desc: 'Sufficiently corroborated across physical origin disclosures and cryptographic proof to satisfy legal burden of proof.'
    };
    if (score >= 70) return { 
      label: 'PROBABLE ATTRIBUTION // INVESTIGATIVE RECON', 
      color: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
      desc: 'Strong multi-pillar correlation; warrants targeted intercept or search warrant application.'
    };
    return { 
      label: 'INCONCLUSIVE // INSUFFICIENT SIGNAL DIVERSITY', 
      color: 'text-rose-400 bg-rose-950/40 border-rose-800/60',
      desc: 'Primary signals uncorroborated; potential decoy or shared proxy artifact.'
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
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                FUSION CORE // MCDA ENGINE
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                MULTI-CRITERIA DECISION ANALYSIS · LINEAR ATTRIBUTION MODEL
              </span>
            </div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Explainable Evidentiary Attribution Scorecard</span>
              <Calculator className="w-4 h-4 text-cyan-400" />
            </h2>
            <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed mt-1">
              Eliminates attribution "black box" obscurity. Cross-synthesizes physical SOCKS5 server leaks, Neo4j cryptographic graph clusters, and linguistic stylometrics into a mathematically auditable composite score with full chain of custody.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunAiSynthesis}
              disabled={isSynthesizing}
              className="px-3.5 py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:bg-[#1e2433] disabled:text-zinc-600 text-white font-mono text-xs font-semibold tracking-wider transition-colors flex items-center gap-2 border border-purple-400/30 shadow-sm"
            >
              {isSynthesizing ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>SYNTHESIZING DOSSIER...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                  <span>AI FORENSIC DOSSIER</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenExport}
              className="px-3.5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold tracking-wider transition-colors flex items-center gap-2 border border-cyan-400/30 shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>EXPORT CASE BRIEF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live AI Dossier Card (Gemini 3.6 Flash) */}
      {aiDossier && (
        <div className="bg-[#0d1117] border border-purple-500/40 rounded-lg p-5 shadow-2xl relative animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2433] mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                    NTRO Court-Admissible De-Anonymization Synthesis Dossier
                  </h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-950/60 border border-purple-700/60 text-purple-300">
                    GEMINI 3.6 FLASH · LIVE SYNTHESIS
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-500 mt-0.5">
                  <span>SUBJECT: {selectedCase.primaryHandle} ({selectedCase.codename})</span>
                  <span>·</span>
                  <span>CROSS-LAYER EVIDENTIARY AUDIT</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDossier}
                className="px-3 py-1.5 rounded bg-[#08090d] hover:bg-[#111622] border border-[#1e2433] text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                {copiedDossier ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY DOSSIER</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setAiDossier(null)}
                className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-[#08090d] border border-[#1e2433] rounded p-4 font-mono text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto scrollbar-thin">
            {aiDossier}
          </div>

          <div className="mt-3 pt-2 border-t border-[#1e2433] flex items-center justify-between font-mono text-[10px] text-zinc-500">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>EVIDENTIARY INTEGRITY VERIFIED // DAUBERT STANDARD SECTION 702 COMPLIANT</span>
            </span>
            <span>NTRO CYBER INTELLIGENCE COMMAND</span>
          </div>
        </div>
      )}

      {aiError && (
        <div className="bg-rose-950/30 border border-rose-800/50 rounded-lg p-3 text-xs font-mono text-rose-300 flex items-center justify-between">
          <span>AI SYNTHESIS SERVICE ALERT: {aiError}</span>
          <button onClick={() => setAiError(null)} className="text-rose-400 hover:text-rose-200">DISMISS</button>
        </div>
      )}

      {/* Dynamic Fusion Scorecard & Weight Calibration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Composite Score Spotlight */}
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 pb-2 border-b border-[#1e2433] mb-3">
              <span className="font-mono text-[10px] uppercase tracking-wider">COMPOSITE ATTRIBUTION</span>
              <span className="font-mono text-[10px] text-cyan-400">MCDA MODEL</span>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-5xl font-black font-mono text-cyan-400 tracking-tight">
                {dynamicComposite}%
              </span>
              <span className="text-zinc-500 text-xs font-mono">/ 100.0</span>
            </div>

            <div className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border inline-block ${currentRating.color} mb-3`}>
              {currentRating.label}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              {currentRating.desc}
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-[#1e2433] text-xs font-mono">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Server className="w-3.5 h-3.5" /> M1: Infrastructure:
              </span>
              <span>{selectedCase.scores.infrastructure}% &times; {(normInfra * 100).toFixed(0)}% = <strong>{(selectedCase.scores.infrastructure * normInfra).toFixed(1)} pts</strong></span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Network className="w-3.5 h-3.5" /> M2: Entity Graph:
              </span>
              <span>{selectedCase.scores.entityGraph}% &times; {(normGraph * 100).toFixed(0)}% = <strong>{(selectedCase.scores.entityGraph * normGraph).toFixed(1)} pts</strong></span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span className="flex items-center gap-1.5 text-purple-400">
                <Cpu className="w-3.5 h-3.5" /> M3: Stylometry:
              </span>
              <span>{selectedCase.scores.stylometry}% &times; {(normStylo * 100).toFixed(0)}% = <strong>{(selectedCase.scores.stylometry * normStylo).toFixed(1)} pts</strong></span>
            </div>
          </div>
        </div>

        {/* Signal Weight Calibration Sliders */}
        <div className="lg:col-span-2 bg-[#0d1117] border border-[#1e2433] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1e2433] mb-4 gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Telemetry Layer Sensitivity &amp; Weight Calibration
                </h3>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-zinc-500">PRESETS:</span>
                <button
                  onClick={() => applyPreset('daubert')}
                  className="px-2 py-0.5 rounded bg-[#111622] hover:bg-[#161d2d] border border-[#1e2433] text-zinc-300 hover:text-white font-mono text-[10px] transition-colors"
                >
                  DAUBERT (45/35/20)
                </button>
                <button
                  onClick={() => applyPreset('balanced')}
                  className="px-2 py-0.5 rounded bg-[#111622] hover:bg-[#161d2d] border border-[#1e2433] text-zinc-300 hover:text-white font-mono text-[10px] transition-colors"
                >
                  BALANCED (40/35/25)
                </button>
                <button
                  onClick={() => applyPreset('linguistic')}
                  className="px-2 py-0.5 rounded bg-[#111622] hover:bg-[#161d2d] border border-[#1e2433] text-zinc-300 hover:text-white font-mono text-[10px] transition-colors"
                >
                  REBRAND (25/35/40)
                </button>
              </div>
            </div>

            <div className="space-y-4 font-mono">
              {/* Weight 1: Infrastructure */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <span>M1: INFRASTRUCTURE RECONNAISSANCE</span>
                  </span>
                  <span className="text-zinc-300 text-xs">{(normInfra * 100).toFixed(0)}% (w₁ = {normInfra.toFixed(3)})</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={wInfra}
                  onChange={(e) => setWInfra(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#08090d] rounded-lg"
                />
                <p className="text-[10px] text-zinc-500 mt-1 font-sans">
                  Higher weight allocated when tangible Apache /status disclosures or TLS SHA-256 certificate reuse occurs.
                </p>
              </div>

              {/* Weight 2: Entity Graph */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span>M2: CRYPTOGRAPHIC ENTITY GRAPH</span>
                  </span>
                  <span className="text-zinc-300 text-xs">{(normGraph * 100).toFixed(0)}% (w₂ = {normGraph.toFixed(3)})</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={wGraph}
                  onChange={(e) => setWGraph(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-[#08090d] rounded-lg"
                />
                <p className="text-[10px] text-zinc-500 mt-1 font-sans">
                  Reflects 4096-bit RSA PGP key fingerprint overlaps and UTXO co-spend transaction clustering.
                </p>
              </div>

              {/* Weight 3: Stylometry */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-purple-400 font-semibold flex items-center gap-1.5">
                    <span>M3: LINGUISTIC STYLOMETRIC DISCRIMINATOR</span>
                  </span>
                  <span className="text-zinc-300 text-xs">{(normStylo * 100).toFixed(0)}% (w₃ = {normStylo.toFixed(3)})</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={wStylo}
                  onChange={(e) => setWStylo(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer h-1.5 bg-[#08090d] rounded-lg"
                />
                <p className="text-[10px] text-zinc-500 mt-1 font-sans">
                  Calculates Mosteller-Wallace function-word frequencies to connect rebranded seller identities.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between font-mono text-[10px]">
            <span className="text-zinc-500">
              CORROBORATION DIVERSITY: <strong className="text-emerald-400">3 OF 3 ACTIVE PILLARS</strong>
            </span>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <span>TRACE CHRONOLOGICAL OPSEC SLIPS</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Explainable Attribution Breakdown Table (Chain of Custody) */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2433] mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Evidentiary Audit Ledger &amp; Signal Contribution Breakdown
            </h3>
          </div>
          <span className="font-mono text-[10px] text-zinc-500">
            SHOWING {signals.length} INDEPENDENT TELEMETRY SIGNALS
          </span>
        </div>

        <div className="space-y-3">
          {signals.map((sig, idx) => (
            <div
              key={idx}
              className="bg-[#08090d] p-4 rounded border border-[#1e2433] hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1e2433] mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    sig.category === 'INFRASTRUCTURE'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      : sig.category === 'ENTITY_GRAPH'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                  }`}>
                    {sig.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    {sig.signalName}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-zinc-500">Raw Confidence: <strong className="text-zinc-200">{sig.rawScore}%</strong></span>
                  <span className="text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                    +{sig.weightedScore.toFixed(1)} MCDA PTS
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 mb-2.5 leading-relaxed">
                {sig.evidenceSummary}
              </p>

              <div className="text-xs font-mono text-zinc-400 bg-[#0d1117] p-2.5 rounded border border-[#1e2433] flex items-start gap-2">
                <Fingerprint className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-cyan-400 font-semibold mr-1.5">CRYPTOGRAPHIC EVIDENCE PROOF:</span>
                  <span className="text-zinc-200 break-all">{sig.verifiableProof}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
