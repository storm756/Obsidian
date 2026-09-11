import React from 'react';
import { 
  ArrowRight, 
  Fingerprint, 
  Network, 
  ScanSearch, 
  ShieldCheck, 
  Sparkles, 
  Server, 
  Coins, 
  Globe, 
  FileText, 
  AlertTriangle,
  Radio,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';
import { ThreatActorCase } from '../types';

interface CaseOverviewProps {
  targetCase: ThreatActorCase;
  onNavigateTab: (tab: 'infra' | 'graph' | 'stylometry' | 'fusion' | 'timeline') => void;
  onRunScan: () => void;
}

const AttributionGauge = ({
  title,
  score,
  weight,
  color,
  layerCode,
  detail
}: {
  title: string;
  score: number;
  weight: string;
  color: string;
  layerCode: string;
  detail: string;
}) => (
  <div className="rounded border border-[#1e2433] bg-[#0c0e15] p-4 shadow-sm flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
        <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <span className="text-cyan-400">{layerCode}</span>
          <span>{title}</span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
          Weight: {weight}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-3xl font-mono font-bold ${color}`}>
          {score}%
        </span>
        <span className="text-xs font-mono text-slate-500">/ 100.0</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded bg-[#161c2b] mb-2.5">
        <div 
          className="h-full rounded transition-all duration-500" 
          style={{ width: `${score}%`, backgroundColor: color.replace('text-', '').includes('amber') ? '#f59e0b' : color.replace('text-', '').includes('emerald') ? '#10b981' : '#6366f1' }} 
        />
      </div>
    </div>

    <p className="text-[11px] font-mono text-slate-400 leading-relaxed border-t border-[#1a202c] pt-2">
      {detail}
    </p>
  </div>
);

export const CaseOverview: React.FC<CaseOverviewProps> = ({ targetCase, onNavigateTab, onRunScan }) => {
  return (
    <div className="space-y-6">
      {/* Tactical Suspect Identification Sheet */}
      <section className="rounded border border-[#1e2433] bg-[#0c0e15] p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-950/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col justify-between gap-6 lg:flex-row relative z-10">
          <div className="max-w-3xl">
            {/* Top Tactical Metadata Badges */}
            <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="rounded bg-[#161c2b] border border-[#232a3b] px-2 py-0.5 text-cyan-300 font-semibold">
                DOSSIER REF: {targetCase.caseNumber}
              </span>
              <span className="rounded bg-rose-950/70 border border-rose-800/80 px-2 py-0.5 font-bold text-rose-300">
                THREAT LEVEL: {targetCase.threatLevel || 'CRITICAL TIER-1'}
              </span>
              <span className="rounded bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 text-emerald-300 font-semibold">
                STATUS: {targetCase.status.replaceAll('_', ' ')}
              </span>
              <span className="text-slate-500 text-xs">
                Observed: {targetCase.firstObserved} &rarr; {targetCase.lastActive}
              </span>
            </div>

            {/* Target Identification */}
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-mono tracking-tight text-white">
                {targetCase.primaryHandle}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                {targetCase.codename}
              </span>
            </div>

            <div className="mt-2 text-xs font-mono text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
              <div>
                <span className="text-slate-500">CORROBORATED ALIASES: </span>
                <span className="text-amber-300 font-semibold">
                  {targetCase.aliases && targetCase.aliases.length > 0 ? targetCase.aliases.join(', ') : 'None documented'}
                </span>
              </div>
              <span className="text-slate-700 hidden sm:inline">&bull;</span>
              <div>
                <span className="text-slate-500">OPERATIONAL DOMAINS: </span>
                <span className="text-slate-300">
                  {targetCase.marketplaces.join(', ')}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs font-mono leading-relaxed text-slate-300 bg-[#090b10] p-3 rounded border border-[#1a202c]">
              {targetCase.summary}
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col gap-2 shrink-0 justify-start">
            <button
              onClick={onRunScan}
              className="inline-flex items-center justify-center gap-2 rounded border border-amber-600/70 bg-amber-950/50 hover:bg-amber-900/60 px-4 py-2 text-xs font-mono font-semibold text-amber-200 transition-colors shadow-sm"
            >
              <ScanSearch className="h-4 w-4 text-amber-400" />
              <span>Launch Infra Scan</span>
            </button>
            <button
              onClick={() => onNavigateTab('fusion')}
              className="inline-flex items-center justify-center gap-2 rounded border border-[#232a3b] bg-[#121624] hover:bg-[#181e30] px-4 py-2 text-xs font-mono font-medium text-slate-200 transition-colors"
            >
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Attribution Evidence</span>
            </button>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="inline-flex items-center justify-center gap-2 rounded border border-[#1e2433] hover:bg-[#121624] px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>View OpSec Timeline &rarr;</span>
            </button>
          </div>
        </div>

        {/* 3-Pillar Attribution Telemetry Metrics */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 pt-6 border-t border-[#1a202c]">
          <AttributionGauge 
            layerCode="M1"
            title="Infrastructure Origin Leak"
            score={targetCase.scores.infrastructure}
            weight="40%"
            color="text-amber-400"
            detail="Tor hidden service misconfiguration: exposed Apache status handler leaking internal worker slot IPs."
          />
          <AttributionGauge 
            layerCode="M2"
            title="Entity Graph Linkage"
            score={targetCase.scores.entityGraph}
            weight="35%"
            color="text-emerald-400"
            detail="Deterministic cryptographic proof: identical 4096-bit OpenPGP master key and Bitcoin payout clustering."
          />
          <AttributionGauge 
            layerCode="M3"
            title="AI Stylometric Persona Audit"
            score={targetCase.scores.stylometry}
            weight="25%"
            color="text-indigo-400"
            detail="Subconscious linguistic affinity: function-word cosine concordance and matching Yule's K vocabulary curve."
          />
        </div>
      </section>

      {/* Investigation Pipeline Navigation Cards */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Investigation Pipeline Modules
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 font-mono">
              Independent evidentiary telemetry streams for multi-criteria legal attribution.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-500 border border-slate-800 bg-slate-900/60 px-2 py-1 rounded">
            DAUBERT STANDARD COMPLIANT
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PipelineCard
            step="01"
            icon={ScanSearch}
            title="Infrastructure Probing"
            desc="SOCKS5 port scan and Apache /server-status origin IP de-cloaking."
            action="Open Infrastructure"
            color="text-amber-400"
            borderColor="hover:border-amber-500/50"
            onClick={() => onNavigateTab('infra')}
          />
          <PipelineCard
            step="02"
            icon={Network}
            title="Entity Graph Disjoint-Set"
            desc="Trace shared 4096-bit RSA PGP blocks and Bitcoin UTXO co-spending."
            action="Open Entity Graph"
            color="text-emerald-400"
            borderColor="hover:border-emerald-500/50"
            onClick={() => onNavigateTab('graph')}
          />
          <PipelineCard
            step="03"
            icon={Sparkles}
            title="AI Stylometric Audit"
            desc="Subconscious function-word cosine similarity and Yule's K invariance."
            action="Open Stylometry"
            color="text-indigo-400"
            borderColor="hover:border-indigo-500/50"
            onClick={() => onNavigateTab('stylometry')}
          />
          <PipelineCard
            step="04"
            icon={Layers}
            title="MCDA Attribution Matrix"
            desc="Explainable linear combination scoring with ISO/IEC 27037 audit hash."
            action="Review Evidence"
            color="text-cyan-400"
            borderColor="hover:border-cyan-500/50"
            onClick={() => onNavigateTab('fusion')}
          />
        </div>
      </section>

      {/* Observed Cryptographic & Financial Telemetry Details */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* PGP Cryptographic Anchors */}
        <div className="rounded border border-[#1e2433] bg-[#0c0e15] p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1a202c] mb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <h4 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                  OpenPGP Material
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                DETERMINISTIC
              </span>
            </div>
            <div className="space-y-2">
              {targetCase.pgpKeys && targetCase.pgpKeys.length > 0 ? (
                targetCase.pgpKeys.map((k, i) => (
                  <div key={i} className="rounded bg-[#08090d] border border-[#1a202c] p-2.5 font-mono text-xs text-slate-300 break-all leading-relaxed">
                    <span className="text-[10px] text-slate-500 block mb-1">KEY SPECIFICATION: RSA 4096 / SHA-256</span>
                    {k}
                  </div>
                ))
              ) : (
                <div className="text-xs font-mono text-slate-500 italic p-3">No public key material recorded.</div>
              )}
            </div>
          </div>
          <p className="mt-3 text-[10px] font-mono text-slate-500 border-t border-[#1a202c] pt-2">
            SHA-256 key-block fingerprint exact-match across marketplace profiles.
          </p>
        </div>

        {/* Blockchain Wallet Anchors */}
        <div className="rounded border border-[#1e2433] bg-[#0c0e15] p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1a202c] mb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-400" />
                <h4 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Cryptocurrency Wallets
                </h4>
              </div>
              <span className="text-[10px] font-mono text-yellow-400 bg-yellow-950/60 border border-yellow-800/80 px-1.5 py-0.5 rounded">
                ON-CHAIN UTXO
              </span>
            </div>
            <div className="space-y-2">
              {targetCase.cryptoWallets && targetCase.cryptoWallets.length > 0 ? (
                targetCase.cryptoWallets.map((w, i) => (
                  <div key={i} className="rounded bg-[#08090d] border border-[#1a202c] p-2.5 font-mono text-xs text-slate-300 break-all leading-relaxed">
                    <span className="text-[10px] text-slate-500 block mb-1">NETWORK: BITCOIN SEGWIT (BECH32)</span>
                    <span className="text-yellow-300">{w}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs font-mono text-slate-500 italic p-3">No wallet identifiers detected.</div>
              )}
            </div>
          </div>
          <p className="mt-3 text-[10px] font-mono text-slate-500 border-t border-[#1a202c] pt-2">
            Multi-input transaction co-spending heuristic proves single entity wallet control.
          </p>
        </div>

        {/* Tor Onion Services */}
        <div className="rounded border border-[#1e2433] bg-[#0c0e15] p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1a202c] mb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" />
                <h4 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Correlated Onion Services
                </h4>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-1.5 py-0.5 rounded">
                7 ONLINE
              </span>
            </div>
            <div className="space-y-2">
              {targetCase.onionServices && targetCase.onionServices.length > 0 ? (
                targetCase.onionServices.slice(0, 3).map((onion, i) => (
                  <div key={i} className="rounded bg-[#08090d] border border-[#1a202c] p-2.5 font-mono text-xs text-slate-300 break-all leading-relaxed flex items-center justify-between gap-2">
                    <span className="text-cyan-300 truncate">{onion}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online SOCKS5 Circuit" />
                  </div>
                ))
              ) : (
                <div className="text-xs font-mono text-slate-500 italic p-3">No active hidden services mapped.</div>
              )}
            </div>
          </div>
          <p className="mt-3 text-[10px] font-mono text-slate-500 border-t border-[#1a202c] pt-2">
            Discovered via autonomous SOCKS5 crawler crawling internal marketplace links.
          </p>
        </div>
      </section>
    </div>
  );
};

const PipelineCard = ({
  step,
  icon: Icon,
  title,
  desc,
  action,
  color,
  borderColor,
  onClick
}: {
  step: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  action: string;
  color: string;
  borderColor: string;
  onClick: () => void;
}) => (
  <article className={`rounded border border-[#1e2433] bg-[#0c0e15] p-4 flex flex-col justify-between transition-all ${borderColor} shadow-sm group`}>
    <div>
      <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono mb-2.5">
        <span className="font-bold">STEP {step}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <h4 className="font-mono text-xs font-bold text-slate-100 tracking-wide mb-1">
        {title}
      </h4>
      <p className="text-[11px] font-mono text-slate-400 leading-relaxed mb-3">
        {desc}
      </p>
    </div>
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold ${color} hover:underline pt-2 border-t border-[#1a202c]`}
    >
      <span>{action}</span>
      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
    </button>
  </article>
);
