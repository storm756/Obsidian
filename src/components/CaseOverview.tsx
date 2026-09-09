import React from 'react';
import { ArrowRight, FileSearch, Fingerprint, Network, ScanSearch, ShieldCheck, Sparkles } from 'lucide-react';
import { ThreatActorCase } from '../types';

interface CaseOverviewProps {
  targetCase: ThreatActorCase;
  onNavigateTab: (tab: 'infra' | 'graph' | 'stylometry' | 'fusion' | 'timeline') => void;
  onRunScan: () => void;
}

const Score = ({ label, score }: { label: string; score: number }) => (
  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
    <div className="flex items-center justify-between"><span className="text-xs text-slate-400">{label}</span><span className="font-mono text-sm font-semibold text-slate-100">{score}%</span></div>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${score}%` }} /></div>
  </div>
);

export const CaseOverview: React.FC<CaseOverviewProps> = ({ targetCase, onNavigateTab, onRunScan }) => (
  <div className="space-y-6">
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-6 lg:flex-row">
        <div className="max-w-3xl">
          <div className="mb-3 flex flex-wrap gap-2 text-[11px] font-medium">
            <span className="rounded bg-slate-800 px-2 py-1 font-mono text-slate-300">{targetCase.caseNumber}</span>
            <span className="rounded bg-blue-950/60 px-2 py-1 text-blue-300">Controlled case data</span>
            <span className="rounded bg-amber-950/50 px-2 py-1 text-amber-300">{targetCase.status.replaceAll('_', ' ')}</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-50">{targetCase.primaryHandle}</h2>
          <p className="mt-1 text-sm text-slate-400">Aliases: {targetCase.aliases.join(', ')}</p>
          <p className="mt-4 text-sm leading-6 text-slate-300">{targetCase.summary}</p>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <button onClick={onRunScan} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-500"><ScanSearch className="h-4 w-4" />Run scan</button>
          <button onClick={() => onNavigateTab('fusion')} className="rounded-md border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800">Review evidence</button>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Score label="Infrastructure evidence" score={targetCase.scores.infrastructure} />
        <Score label="Identifier correlation" score={targetCase.scores.entityGraph} />
        <Score label="Writing similarity" score={targetCase.scores.stylometry} />
      </div>
    </section>

    <section>
      <div className="mb-3 flex items-end justify-between"><div><h3 className="text-base font-semibold text-slate-100">Investigation workflow</h3><p className="mt-1 text-sm text-slate-400">Review independent signals before drawing a conclusion.</p></div><span className="hidden text-xs text-slate-500 sm:block">Authorised training environment</span></div>
      <div className="grid gap-4 md:grid-cols-3">
        <WorkflowCard icon={ScanSearch} title="1. Infrastructure" description="Inspect the controlled hidden service and record any intentionally exposed status pages." action="Open infrastructure" onClick={() => onNavigateTab('infra')} />
        <WorkflowCard icon={Network} title="2. Entity graph" description="Trace exact shared PGP blocks and wallet-like identifiers across the synthetic sites." action="Open graph" onClick={() => onNavigateTab('graph')} />
        <WorkflowCard icon={Sparkles} title="3. Writing analysis" description="Compare repeated phrases and structural habits without treating similarity as proof." action="Open analysis" onClick={() => onNavigateTab('stylometry')} />
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-center gap-2"><Fingerprint className="h-4 w-4 text-blue-400" /><h3 className="font-semibold text-slate-100">Observed identifiers</h3></div><div className="mt-4 space-y-3 text-sm"><Record label="PGP material" values={targetCase.pgpKeys} /><Record label="Wallet-like identifiers" values={targetCase.cryptoWallets} /><Record label="Onion services" values={targetCase.onionServices} /></div></div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /><h3 className="font-semibold text-slate-100">Scope and safeguards</h3></div><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400"><li>Only the included self-hosted Tor testbed is in scope for live scanning.</li><li>Exact identifier reuse is deterministic evidence; writing similarity is supporting evidence only.</li><li>All findings require analyst review before any attribution decision.</li></ul><button onClick={() => onNavigateTab('timeline')} className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300">View investigation timeline <ArrowRight className="h-3.5 w-3.5" /></button></div>
    </section>
  </div>
);

const WorkflowCard = ({ icon: Icon, title, description, action, onClick }: { icon: React.ElementType; title: string; description: string; action: string; onClick: () => void }) => <article className="rounded-xl border border-slate-800 bg-slate-900 p-5"><Icon className="h-5 w-5 text-blue-400" /><h4 className="mt-4 font-semibold text-slate-100">{title}</h4><p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{description}</p><button onClick={onClick} className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300">{action}<ArrowRight className="h-3.5 w-3.5" /></button></article>;

const Record = ({ label, values }: { label: string; values: string[] }) => <div><p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>{values.map((value) => <div key={value} className="mb-1 rounded border border-slate-800 bg-slate-950 px-2.5 py-2 font-mono text-xs text-slate-300 break-all">{value}</div>)}</div>;
