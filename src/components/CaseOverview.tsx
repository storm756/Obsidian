import React from 'react';
import { 
  ShieldAlert, 
  Server, 
  Network, 
  Cpu, 
  MapPin, 
  Globe, 
  Key, 
  Wallet, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Activity
} from 'lucide-react';
import { ThreatActorCase } from '../types';

interface CaseOverviewProps {
  targetCase: ThreatActorCase;
  onNavigateTab: (tab: 'infra' | 'graph' | 'stylometry' | 'fusion' | 'timeline') => void;
  onRunScan: () => void;
}

export const CaseOverview: React.FC<CaseOverviewProps> = ({
  targetCase,
  onNavigateTab,
  onRunScan,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
  };

  const getThreatBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-zinc-800/80 text-zinc-300 border-white/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Alert & Identity Lead Banner */}
      <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap text-xs">
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-white/10">
                {targetCase.caseNumber}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                Codename: {targetCase.codename}
              </span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${getThreatBadge(targetCase.threatLevel)}`}>
                Threat: {targetCase.threatLevel}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                {targetCase.status}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <span>{targetCase.primaryHandle}</span>
              <span className="text-sm font-normal text-zinc-400">
                (Aliases: {targetCase.aliases.join(', ')})
              </span>
            </h2>
            <p className="text-sm text-zinc-300 mt-1 max-w-3xl leading-relaxed">
              {targetCase.summary}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onRunScan}
              className="px-4 py-2.5 rounded-xl bg-amber-500/90 hover:bg-amber-400 text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-amber-950/40"
            >
              <Server className="w-4 h-4" />
              <span>Trigger Infra Scan</span>
            </button>
            <button
              onClick={() => onNavigateTab('fusion')}
              className="px-4 py-2.5 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-cyan-950/40"
            >
              <Activity className="w-4 h-4" />
              <span>Explain Attribution</span>
            </button>
          </div>
        </div>

        {/* Real-world Attribution Lead Spotlight */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-[#0b0b0e] border border-white/[0.06] rounded-xl p-3.5">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Probable Origin Lead</span>
            </div>
            <div className="text-sm font-semibold text-zinc-100 font-mono">
              {targetCase.suspectedRealIdentity.name || 'Unidentified'}
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              {targetCase.suspectedRealIdentity.location}
            </div>
          </div>

          <div className="bg-[#0b0b0e] border border-white/[0.06] rounded-xl p-3.5">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1.5 font-medium">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>De-cloaked Clearnet IP</span>
            </div>
            <div className="text-sm font-semibold text-cyan-300 font-mono">
              {targetCase.suspectedRealIdentity.clearnetIP || 'Tracing...'}
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              {targetCase.suspectedRealIdentity.asn}
            </div>
          </div>

          <div className="bg-[#0b0b0e] border border-white/[0.06] rounded-xl p-3.5">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Internet Service Provider</span>
            </div>
            <div className="text-sm font-semibold text-zinc-200 truncate">
              {targetCase.suspectedRealIdentity.isp || 'N/A'}
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Active across {targetCase.marketplaces.length} darknet forums
            </div>
          </div>

          <div className="bg-[#0b0b0e] border border-white/[0.06] rounded-xl p-3.5">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1.5 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Composite Confidence</span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {targetCase.scores.composite.toFixed(1)}%
            </div>
            <div className="text-xs text-emerald-400/90 mt-0.5 font-medium">
              High Confidence Attribution
            </div>
          </div>
        </div>
      </div>

      {/* The 3 Core Fusion Signals Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h3 className="text-sm font-semibold tracking-wide text-zinc-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            3-Signal Attribution Engines
          </h3>
          <span className="text-xs text-zinc-400">
            Automated correlation overcoming Tor de-anonymization blockers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Module 1: Infrastructure */}
          <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-5 hover:border-amber-500/30 transition-all flex flex-col justify-between shadow-sm group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Server className="w-4 h-4" />
                </div>
                <div className={`px-2.5 py-0.5 rounded-full border text-xs font-mono font-semibold ${getScoreColor(targetCase.scores.infrastructure)}`}>
                  {targetCase.scores.infrastructure}% MATCH
                </div>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Module 1: Infrastructure</h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                OnionScan-based correlation: detects Apache/nginx /server-status leaks, TLS certificate SHA-256 fingerprint reuse, and descriptor clock drift.
              </p>
              <div className="space-y-1.5 text-xs text-zinc-300 mb-4 bg-[#0b0b0e] p-3 rounded-xl border border-white/[0.05]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Status Page Leak:</span>
                  <span className="text-rose-400 font-medium">Detected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">TLS Cert Reused:</span>
                  <span className="text-amber-400 font-medium">SHA-256 Match</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">De-cloaked Host:</span>
                  <span className="text-cyan-300 font-mono font-medium">{targetCase.suspectedRealIdentity.clearnetIP}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('infra')}
              className="w-full py-2 px-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-xs font-medium text-amber-300 border border-white/[0.06] transition-all flex items-center justify-center gap-1.5"
            >
              <span>Inspect Infrastructure</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Module 2: Entity Graph */}
          <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-5 hover:border-emerald-500/30 transition-all flex flex-col justify-between shadow-sm group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Network className="w-4 h-4" />
                </div>
                <div className={`px-2.5 py-0.5 rounded-full border text-xs font-mono font-semibold ${getScoreColor(targetCase.scores.entityGraph)}`}>
                  {targetCase.scores.entityGraph}% MATCH
                </div>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Module 2: Entity Graph</h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Cross-marketplace relationship network: links handles, 4096-bit PGP fingerprints, cryptocurrency wallet clustering, and Dread forum vouches.
              </p>
              <div className="space-y-1.5 text-xs text-zinc-300 mb-4 bg-[#0b0b0e] p-3 rounded-xl border border-white/[0.05]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">PGP Key Reuse:</span>
                  <span className="text-emerald-400 font-medium">RSA 4096 Match</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Escrow Cluster:</span>
                  <span className="text-cyan-400 font-medium">18.44 BTC Sweep</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Graph Hops to IP:</span>
                  <span className="text-purple-300 font-medium">2 Hops (Direct)</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('graph')}
              className="w-full py-2 px-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-xs font-medium text-emerald-300 border border-white/[0.06] transition-all flex items-center justify-center gap-1.5"
            >
              <span>Explore Entity Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Module 3: Stylometry */}
          <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-5 hover:border-purple-500/30 transition-all flex flex-col justify-between shadow-sm group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className={`px-2.5 py-0.5 rounded-full border text-xs font-mono font-semibold ${getScoreColor(targetCase.scores.stylometry)}`}>
                  {targetCase.scores.stylometry}% MATCH
                </div>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Module 3: AI Stylometry</h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Persona-linking NLP engine: extracts subconscious function-word vectors, punctuation quirks, Yule's K vocabulary richness, and Gemini forensic reasoning.
              </p>
              <div className="space-y-1.5 text-xs text-zinc-300 mb-4 bg-[#0b0b0e] p-3 rounded-xl border border-white/[0.05]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Function Words:</span>
                  <span className="text-purple-300 font-medium">94.1% Cosine</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Idiosyncrasy:</span>
                  <span className="text-amber-400 font-medium">Punctuation Match</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Rebrand Detection:</span>
                  <span className="text-emerald-400 font-medium">Confirmed Continuity</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('stylometry')}
              className="w-full py-2 px-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-xs font-medium text-purple-300 border border-white/[0.06] transition-all flex items-center justify-center gap-1.5"
            >
              <span>Analyze Stylometry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Identifiers & Surveillance Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monitored Cryptographic & Darknet Identifiers */}
        <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Cryptographic &amp; Network Identifiers</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="text-[11px] text-zinc-400 mb-1.5 font-medium">PGP Public Key Blocks</div>
              {targetCase.pgpKeys.map((key, idx) => (
                <div key={idx} className="bg-[#0b0b0e] p-2.5 rounded-xl border border-white/[0.05] font-mono text-xs text-amber-300/90 break-all mb-1.5 flex items-center justify-between">
                  <span>{key}</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-sans">Verified</span>
                </div>
              ))}
            </div>

            <div>
              <div className="text-[11px] text-zinc-400 mb-1.5 font-medium">Monitored Crypto Wallets</div>
              {targetCase.cryptoWallets.map((wallet, idx) => (
                <div key={idx} className="bg-[#0b0b0e] p-2.5 rounded-xl border border-white/[0.05] font-mono text-xs text-cyan-300 break-all mb-1.5 flex items-center justify-between">
                  <span>{wallet}</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-sans">Tracked</span>
                </div>
              ))}
            </div>

            <div>
              <div className="text-[11px] text-zinc-400 mb-1.5 font-medium">Tor Hidden Services (.onion)</div>
              {targetCase.onionServices.map((onion, idx) => (
                <div key={idx} className="bg-[#0b0b0e] p-2.5 rounded-xl border border-white/[0.05] font-mono text-xs text-purple-300 break-all mb-1.5 flex items-center justify-between">
                  <span>{onion}</span>
                  <span className="text-[10px] text-emerald-400 uppercase font-sans">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ethical Framework & Benchmark Validation Note */}
        <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Responsible-by-Design Compliance Framework</span>
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Addressing darknet threat attribution requires strict evidentiary validity and legal integrity. Obsidian implements key operational safeguards:
            </p>

            <ul className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span className="leading-relaxed">
                  <strong className="text-zinc-100">Safe Benchmark Testbed:</strong> All live scanning simulations run strictly against self-hosted test services and academic datasets (Gwern darknet market archives), avoiding unauthorized scanning.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span className="leading-relaxed">
                  <strong className="text-zinc-100">Multi-Signal Redundancy:</strong> Offsets stylometry's known weakness on short marketplace listings by cross-fusing with infrastructure leaks and PGP fingerprints.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span className="leading-relaxed">
                  <strong className="text-zinc-100">Court-Admissible Explainability:</strong> No opaque black-box AI scores; every attribution breaks down exact points for judges and investigators.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-end">
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 font-medium"
            >
              <span>Investigation Timeline &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
