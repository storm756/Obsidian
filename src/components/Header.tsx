import React from 'react';
import { Clock, FileDown, Network, RefreshCw, ScanSearch, Settings2, Sparkles, Waypoints } from 'lucide-react';
import { ThreatActorCase } from '../types';

type Tab = 'overview' | 'setup' | 'infra' | 'graph' | 'stylometry' | 'fusion' | 'timeline';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  cases: ThreatActorCase[];
  selectedCase: ThreatActorCase;
  setSelectedCase: (c: ThreatActorCase) => void;
  onOpenExport: () => void;
  onOpenNewTarget: () => void;
  onOpenCrawlModal: () => void;
}

const navigation: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Case overview', icon: Waypoints },
  { id: 'setup', label: 'Setup', icon: Settings2 },
  { id: 'infra', label: 'Infrastructure', icon: ScanSearch },
  { id: 'graph', label: 'Entity graph', icon: Network },
  { id: 'stylometry', label: 'Writing analysis', icon: Sparkles },
  { id: 'fusion', label: 'Evidence', icon: FileDown },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab, setActiveTab, cases, selectedCase, setSelectedCase, onOpenExport, onOpenNewTarget, onOpenCrawlModal,
}) => (
  <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
    <div className="mx-auto max-w-7xl px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-950/60">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-slate-50">Obsidian</h1>
              <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">7 ONIONS ACTIVE</span>
            </div>
            <p className="text-xs text-slate-400">NTRO Threat Actor De-anonymization Workspace</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5">
            <span className="text-xs text-slate-400">Case</span>
            <select value={selectedCase.id} onChange={(e) => {
              const next = cases.find((item) => item.id === e.target.value);
              if (next) setSelectedCase(next);
            }} className="max-w-52 bg-transparent text-xs font-medium text-slate-200 outline-none">
              {cases.map((item) => <option key={item.id} value={item.id} className="bg-slate-900">{item.codename} ({item.primaryHandle})</option>)}
            </select>
          </div>
          <button onClick={onOpenCrawlModal} className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Crawl Testbed</span>
          </button>
          <button onClick={onOpenNewTarget} className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900">New case</button>
          <button onClick={onOpenExport} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500">Export report</button>
        </div>
      </div>

      <nav className="mt-4 flex gap-1 overflow-x-auto border-t border-slate-800 pt-3" aria-label="Case navigation">
        {navigation.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition ${activeTab === id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </nav>
    </div>
  </header>
);
