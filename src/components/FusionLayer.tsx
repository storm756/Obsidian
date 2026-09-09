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
  Server
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
    if (score >= 85) return { label: 'HIGH CONFIDENCE (COURT-ADMISSIBLE)', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' };
    if (score >= 70) return { label: 'PROBABLE ATTRIBUTION', color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' };
    return { label: 'INCONCLUSIVE ATTRIBUTION', color: 'text-rose-400 bg-rose-950/60 border-rose-800/60' };
  };

  const currentRating = getConfidenceRating(dynamicComposite);

  return (
    <div className="space-y-6">
      {/* Fusion Overview Header */}
      <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
              FUSION CORE
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Explainable Attribution Fusion Scorecard</h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Solves the &ldquo;black box&rdquo; dilemma: unites independent telemetry streams into one mathematically traceable score, where every point awarded corresponds to auditable physical or cryptographic proof.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenExport}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-all flex items-center gap-2 shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            <span>Generate Official Report</span>
          </button>
        </div>
      </div>

      {/* Dynamic Fusion Scorecard & Weight Calibration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composite Score Spotlight */}
        <div className="bg-[#121216] border border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="text-xs font-medium text-zinc-400 mb-1 flex items-center justify-between">
              <span>COMPOSITE ATTRIBUTION SCORE</span>
              <span className="text-[10px] text-cyan-400 font-mono">MATHEMATICAL MODEL</span>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-5xl font-black font-mono text-cyan-400 tracking-tight">
                {dynamicComposite}%
              </span>
              <span className="text-zinc-500 text-sm font-mono">/ 100.0</span>
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-medium border inline-block ${currentRating.color} mb-4`}>
              {currentRating.label}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Calculated via linear multi-criteria decision analysis (MCDA), cross-corroborating independent network observations with cryptographic key reuse and syntactic profiles.
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs font-mono">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Server className="w-3.5 h-3.5" /> M1: Infra Score:
              </span>
              <span>{selectedCase.scores.infrastructure}% &times; {(normInfra * 100).toFixed(0)}% = {(selectedCase.scores.infrastructure * normInfra).toFixed(1)} pts</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <Network className="w-3.5 h-3.5" /> M2: Entity Graph:
              </span>
              <span>{selectedCase.scores.entityGraph}% &times; {(normGraph * 100).toFixed(0)}% = {(selectedCase.scores.entityGraph * normGraph).toFixed(1)} pts</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span className="flex items-center gap-1.5 text-purple-300">
                <Cpu className="w-3.5 h-3.5" /> M3: Stylometry:
              </span>
              <span>{selectedCase.scores.stylometry}% &times; {(normStylo * 100).toFixed(0)}% = {(selectedCase.scores.stylometry * normStylo).toFixed(1)} pts</span>
            </div>
          </div>
        </div>

        {/* Signal Weight Calibration Sliders */}
        <div className="lg:col-span-2 bg-[#121216] border border-white/[0.07] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">
                  Signal Weight Calibration &amp; Sensitivity Tuning
                </h3>
              </div>
              <button
                onClick={() => {
                  setWInfra(40);
                  setWGraph(35);
                  setWStylo(25);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Reset Default Weights
              </button>
            </div>

            <div className="space-y-4">
              {/* Weight 1: Infrastructure */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-amber-300 font-medium flex items-center gap-1.5">
                    <span>Module 1: Infrastructure Leaks Weight</span>
                  </span>
                  <span className="text-zinc-300 font-mono">{(normInfra * 100).toFixed(0)}% (Relative)</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={wInfra}
                  onChange={(e) => setWInfra(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  High priority when tangible Apache /status or SSL certificate reuse is detected.
                </p>
              </div>

              {/* Weight 2: Entity Graph */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                    <span>Module 2: Entity Graph Linkage Weight</span>
                  </span>
                  <span className="text-zinc-300 font-mono">{(normGraph * 100).toFixed(0)}% (Relative)</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={wGraph}
                  onChange={(e) => setWGraph(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Evaluates 4096-bit PGP fingerprint matches and blockchain co-spend clustering.
                </p>
              </div>

              {/* Weight 3: Stylometry */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-purple-300 font-medium flex items-center gap-1.5">
                    <span>Module 3: AI Stylometric Persona Weight</span>
                  </span>
                  <span className="text-zinc-300 font-mono">{(normStylo * 100).toFixed(0)}% (Relative)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={wStylo}
                  onChange={(e) => setWStylo(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Calibrated to offset stylometric decay on short marketplace text via multi-signal cross-layer balancing.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Corroboration Factor: <strong className="text-zinc-200 font-medium">3 of 3 Independent Layers Active</strong>
            </span>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Examine Chronological OpSec Slips &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Explainable Attribution Breakdown Table */}
      <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Transparent Evidentiary Contribution Breakdown</span>
        </h3>

        <div className="space-y-3">
          {signals.map((sig, idx) => (
            <div
              key={idx}
              className="bg-[#0b0b0e] p-4 rounded-xl border border-white/[0.05] hover:border-white/[0.1] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/[0.05] mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    sig.category === 'INFRASTRUCTURE'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : sig.category === 'ENTITY_GRAPH'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                  }`}>
                    {sig.category}
                  </span>
                  <span className="text-xs font-semibold text-zinc-200">
                    {sig.signalName}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-zinc-400">Raw: <strong className="text-zinc-200">{sig.rawScore}%</strong></span>
                  <span className="text-cyan-400 font-bold">Contribution: +{sig.weightedScore.toFixed(1)} pts</span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 mb-2.5 leading-relaxed">
                {sig.evidenceSummary}
              </p>

              <div className="text-xs text-zinc-400 bg-[#121216] p-2.5 rounded-lg border border-white/[0.05] flex items-start gap-2">
                <span className="text-cyan-400 font-semibold shrink-0">PROOF:</span>
                <span className="text-zinc-300">{sig.verifiableProof}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
