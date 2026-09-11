import React, { useState } from 'react';
import { 
  ArrowRight, 
  ScanSearch, 
  Layers, 
  Clock, 
  UserCheck, 
  Lock, 
  Coins, 
  Globe, 
  Copy, 
  Check, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ThreatActorCase } from '../types';

interface CaseOverviewProps {
  targetCase: ThreatActorCase;
  onNavigateTab: (tab: 'infra' | 'graph' | 'stylometry' | 'fusion' | 'timeline') => void;
  onRunScan: () => void;
}

export const CaseOverview: React.FC<CaseOverviewProps> = ({ targetCase, onNavigateTab, onRunScan }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const isCritical = targetCase.threatLevel?.includes('CRITICAL') ?? true;
  const compositeScore = (
    (targetCase.scores.infrastructure * 0.40) +
    (targetCase.scores.entityGraph * 0.35) +
    (targetCase.scores.stylometry * 0.25)
  ).toFixed(1);

  return (
    <div className="space-y-5">
      {/* Suspect Identification & Dossier Header */}
      <section className="surface-card rounded-xl p-6 border border-[#1e273d]">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-4 max-w-4xl">
            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                Case: {targetCase.caseNumber}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                isCritical 
                  ? 'bg-rose-950/60 border-rose-800 text-rose-300' 
                  : 'bg-amber-950/60 border-amber-800 text-amber-300'
              }`}>
                {targetCase.threatLevel || 'Critical'}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {targetCase.status.replaceAll('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">
                Active Window: <span className="text-slate-200 font-medium">{targetCase.firstObserved}</span> &rarr; <span className="text-slate-200 font-medium">{targetCase.lastActive}</span>
              </span>
            </div>

            {/* Target Identity Details */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1c253b] border border-slate-700 text-slate-200">
                <UserCheck className="h-6 w-6 text-blue-400" />
              </div>

              <div>
                <div className="flex items-baseline gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    {targetCase.primaryHandle}
                  </h1>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                    {targetCase.codename}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-400 font-medium">Corroborated Aliases: </span>
                    <span className="text-slate-200 font-medium">
                      {targetCase.aliases && targetCase.aliases.length > 0 ? targetCase.aliases.join(', ') : 'None documented'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Target Marketplaces: </span>
                    <span className="text-slate-200">
                      {targetCase.marketplaces.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Case Summary */}
            <div className="p-4 rounded-lg bg-[#0e121a] border-l-2 border-l-blue-500 border border-[#1b2336] text-xs leading-relaxed text-slate-300">
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wide block mb-1">
                Evidentiary Executive Summary
              </span>
              {targetCase.summary}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col gap-2 shrink-0 w-full lg:w-48">
            <button
              onClick={onRunScan}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#1a2236] hover:bg-[#222d47] border border-[#2d3b5c] text-white px-4 py-2 text-xs font-medium transition-colors shadow-sm"
            >
              <ScanSearch className="h-4 w-4 text-blue-400" />
              <span>Launch Infra Scan</span>
            </button>
            <button
              onClick={() => onNavigateTab('fusion')}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#1a2236] hover:bg-[#222d47] border border-[#2d3b5c] text-white px-4 py-2 text-xs font-medium transition-colors shadow-sm"
            >
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>Attribution Matrix</span>
            </button>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#121622] hover:bg-[#181f2f] border border-[#222c42] text-slate-300 hover:text-white px-4 py-2 text-xs font-medium transition-colors shadow-sm"
            >
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>OpSec Timeline &rarr;</span>
            </button>
          </div>
        </div>

        {/* 3-Pillar Evidentiary Attribution Scores */}
        <div className="mt-6 pt-5 border-t border-[#1b2336]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Multi-Signal Evidentiary Confidence
              </h3>
              <span className="text-[11px] text-slate-400">
                Weighted Linear Combination (MCDA)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Composite Score:</span>
              <span className="text-sm font-mono font-bold text-white bg-blue-950/60 border border-blue-800/80 px-2 py-0.5 rounded-md">
                {compositeScore}% / 100.0
              </span>
              <span className="text-[10px] font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded-md">
                Daubert Admissible
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Infrastructure Leakage */}
            <div className="rounded-lg bg-[#101420] border border-[#1b2336] p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">1. Infrastructure Origin Leak</span>
                  <span className="font-mono text-slate-400 text-[11px]">Weight: 40%</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-mono font-bold text-white">
                    {targetCase.scores.infrastructure.toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-500">confidence</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#182030] overflow-hidden mb-2.5">
                  <div 
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${targetCase.scores.infrastructure}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 border-t border-[#182030] pt-2">
                Apache mod_status handler disclosure leaking backend origin IP 10.24.8.17.
              </p>
            </div>

            {/* Entity Graph */}
            <div className="rounded-lg bg-[#101420] border border-[#1b2336] p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">2. Entity Graph Linkage</span>
                  <span className="font-mono text-slate-400 text-[11px]">Weight: 35%</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-mono font-bold text-white">
                    {targetCase.scores.entityGraph.toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-500">confidence</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#182030] overflow-hidden mb-2.5">
                  <div 
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${targetCase.scores.entityGraph}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 border-t border-[#182030] pt-2">
                Deterministic 4096-bit RSA PGP key match and Bitcoin multi-input co-spend.
              </p>
            </div>

            {/* Stylometry */}
            <div className="rounded-lg bg-[#101420] border border-[#1b2336] p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">3. Stylometric Audit</span>
                  <span className="font-mono text-slate-400 text-[11px]">Weight: 25%</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-mono font-bold text-white">
                    {targetCase.scores.stylometry.toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-500">concordance</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#182030] overflow-hidden mb-2.5">
                  <div 
                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${targetCase.scores.stylometry}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 border-t border-[#182030] pt-2">
                Function-word cosine similarity and Yule's K characteristic syntax invariance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investigation Pipeline Shortcuts */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Investigation Modules
            </h3>
            <p className="text-xs text-slate-400">
              Corroborated analytical streams for multi-criteria legal attribution.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-card rounded-xl p-4 border border-[#1e273d] flex flex-col justify-between hover:border-slate-600 transition-colors">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-slate-400">Module 01</span>
                <ScanSearch className="h-4 w-4 text-blue-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Infrastructure Probing
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                SOCKS5 port scan and Apache /server-status origin IP de-cloaking.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('infra')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 pt-2 border-t border-[#1e273d]"
            >
              <span>Inspect Infrastructure</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="surface-card rounded-xl p-4 border border-[#1e273d] flex flex-col justify-between hover:border-slate-600 transition-colors">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-slate-400">Module 02</span>
                <Layers className="h-4 w-4 text-emerald-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Cryptographic Graph
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Trace shared 4096-bit RSA PGP blocks and Bitcoin UTXO co-spending.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('graph')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 pt-2 border-t border-[#1e273d]"
            >
              <span>Explore Graph</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="surface-card rounded-xl p-4 border border-[#1e273d] flex flex-col justify-between hover:border-slate-600 transition-colors">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-slate-400">Module 03</span>
                <UserCheck className="h-4 w-4 text-purple-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Stylometric Audit
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Subconscious function-word cosine similarity and Yule's K invariance.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('stylometry')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 pt-2 border-t border-[#1e273d]"
            >
              <span>Run Stylometry</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="surface-card rounded-xl p-4 border border-[#1e273d] flex flex-col justify-between hover:border-slate-600 transition-colors">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-slate-400">Module 04</span>
                <ShieldCheck className="h-4 w-4 text-sky-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Attribution Matrix
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Multi-Criteria Decision Analysis with ISO/IEC 27037 audit ledger.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('fusion')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 pt-2 border-t border-[#1e273d]"
            >
              <span>View Matrix</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Corroborated Evidence Anchors */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* PGP Cryptographic Keys */}
        <div className="surface-card rounded-xl p-5 border border-[#1e273d] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2336] mb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  OpenPGP Material
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded font-semibold">
                Deterministic Match
              </span>
            </div>
            <div className="space-y-2">
              {targetCase.pgpKeys && targetCase.pgpKeys.length > 0 ? (
                targetCase.pgpKeys.map((k, i) => (
                  <div key={i} className="rounded-lg bg-[#0e121a] border border-[#1b2336] p-2.5 font-mono text-xs text-slate-300 break-all leading-relaxed">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500 uppercase">RSA-4096 / SHA-256</span>
                      <button
                        onClick={() => handleCopy(k, `pgp-${i}`)}
                        className="text-slate-500 hover:text-slate-200 p-0.5 rounded"
                        title="Copy PGP key block"
                      >
                        {copiedKey === `pgp-${i}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <span className="text-emerald-400/90 text-[11px]">{k}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-3 text-center">No public key material recorded.</div>
              )}
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 border-t border-[#1b2336] pt-2">
            SHA-256 key-block fingerprint match across marketplace profiles.
          </p>
        </div>

        {/* Cryptocurrency Wallets */}
        <div className="surface-card rounded-xl p-5 border border-[#1e273d] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2336] mb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Cryptocurrency Wallets
                </h4>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded font-semibold">
                On-Chain UTXO
              </span>
            </div>
            <div className="space-y-2">
              {targetCase.cryptoWallets && targetCase.cryptoWallets.length > 0 ? (
                targetCase.cryptoWallets.map((w, i) => (
                  <div key={i} className="rounded-lg bg-[#0e121a] border border-[#1b2336] p-2.5 font-mono text-xs text-slate-300 break-all leading-relaxed">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500 uppercase">Bitcoin Bech32</span>
                      <button
                        onClick={() => handleCopy(w, `btc-${i}`)}
                        className="text-slate-500 hover:text-slate-200 p-0.5 rounded"
                        title="Copy Bitcoin address"
                      >
                        {copiedKey === `btc-${i}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <span className="text-amber-300 text-[11px]">{w}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-3 text-center">No wallet identifiers detected.</div>
              )}
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 border-t border-[#1b2336] pt-2">
            Multi-input transaction co-spending heuristic proves wallet ownership.
          </p>
        </div>

        {/* Onion Services */}
        <div className="surface-card rounded-xl p-5 border border-[#1e273d] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2336] mb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Mapped Onion Services
                </h4>
              </div>
              <span className="text-[10px] font-mono text-blue-300 bg-blue-950/60 border border-blue-800 px-2 py-0.5 rounded font-semibold">
                7 Discovered
              </span>
            </div>
            <div className="space-y-2">
              {targetCase.onionServices && targetCase.onionServices.length > 0 ? (
                targetCase.onionServices.slice(0, 3).map((onion, i) => (
                  <div key={i} className="rounded-lg bg-[#0e121a] border border-[#1b2336] p-2.5 font-mono text-xs text-slate-300 break-all leading-relaxed flex items-center justify-between gap-2">
                    <span className="text-blue-300 text-[11px] truncate">{onion}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopy(onion, `onion-${i}`)}
                        className="text-slate-500 hover:text-slate-200 p-0.5 rounded"
                        title="Copy Onion address"
                      >
                        {copiedKey === `onion-${i}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active SOCKS5 Tor Circuit" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-3 text-center">No active hidden services mapped.</div>
              )}
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 border-t border-[#1b2336] pt-2">
            Discovered via autonomous SOCKS5 crawler through darknet links.
          </p>
        </div>
      </section>
    </div>
  );
};
