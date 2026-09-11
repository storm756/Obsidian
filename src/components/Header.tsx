import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  FileDown, 
  Network, 
  RefreshCw, 
  ScanSearch, 
  Settings2, 
  Sparkles, 
  Waypoints, 
  Shield, 
  Radio, 
  Plus, 
  Terminal,
  Activity,
  ChevronDown
} from 'lucide-react';
import { ThreatActorCase } from '../types';

export type Tab = 'overview' | 'setup' | 'infra' | 'graph' | 'stylometry' | 'fusion' | 'timeline';

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

const navigation: Array<{ id: Tab; label: string; keyHint: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Case Dossier', keyHint: '1', icon: Waypoints },
  { id: 'setup', label: 'Testbed Topology', keyHint: '2', icon: Settings2 },
  { id: 'infra', label: 'Infrastructure Leaks', keyHint: '3', icon: ScanSearch },
  { id: 'graph', label: 'Cryptographic Graph', keyHint: '4', icon: Network },
  { id: 'stylometry', label: 'AI Stylometric Audit', keyHint: '5', icon: Sparkles },
  { id: 'fusion', label: 'Attribution Evidence', keyHint: '6', icon: FileDown },
  { id: 'timeline', label: 'OpSec Chronology', keyHint: '7', icon: Clock },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cases,
  selectedCase,
  setSelectedCase,
  onOpenExport,
  onOpenNewTarget,
  onOpenCrawlModal,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[#1e2433] bg-[#090b10]/95 backdrop-blur-md">
      {/* Top Classified Classification & Status Strip */}
      <div className="border-b border-[#1a202c] bg-[#06070a] px-4 sm:px-6 py-1 text-[10px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800/80 text-amber-400 font-semibold tracking-wider text-[9px]">
            <Shield className="w-2.5 h-2.5" />
            RESTRICTED // NTRO LAW ENFORCEMENT INTELLIGENCE
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-mono hidden md:inline">
            PS-26151 · THREAT ACTOR DE-ANONYMIZATION PLATFORM
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>TOR SOCKS5 :9050 ONLINE (7 HS ACTIVE)</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">&bull;</span>
          <div className="text-slate-300 font-mono hidden sm:inline">
            {utcTime || '2026-09-10 12:00:00 UTC'}
          </div>
        </div>
      </div>

      {/* Main Tactical Command Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Brand & System Node Info */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 shadow-inner">
              <Network className="h-5 w-5" />
              <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#090b10]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white font-mono uppercase">
                  OBSIDIAN
                </span>
                <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.2 text-[9px] font-mono text-cyan-400">
                  v2.4-PROD
                </span>
                <span className="rounded bg-emerald-950/80 border border-emerald-700/60 px-1.5 py-0.2 text-[9px] font-mono font-semibold text-emerald-300">
                  AIR-GAPPED TESTBED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Multi-Signal Correlation &amp; Authorship Triangulation Engine
              </p>
            </div>
          </div>

          {/* Tactical Target Selector & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Active Target Dropdown */}
            <div className="flex items-center rounded border border-[#232a3b] bg-[#0f131d] px-2.5 py-1.5 shadow-sm">
              <span className="text-[11px] font-mono text-slate-400 mr-2 uppercase tracking-wider">
                TARGET CASE:
              </span>
              <select
                value={selectedCase.id}
                onChange={(e) => {
                  const next = cases.find((item) => item.id === e.target.value);
                  if (next) setSelectedCase(next);
                }}
                className="bg-transparent font-mono text-xs font-semibold text-cyan-300 outline-none cursor-pointer pr-2"
              >
                {cases.map((item) => (
                  <option key={item.id} value={item.id} className="bg-[#0f131d] text-slate-200">
                    {item.codename} ({item.primaryHandle})
                  </option>
                ))}
              </select>
              <span className="ml-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950/70 border border-rose-800/80 text-rose-300 font-bold">
                {selectedCase.threatLevel || 'CRITICAL'}
              </span>
            </div>

            {/* Quick Actions */}
            <button
              onClick={onOpenCrawlModal}
              className="flex items-center gap-1.5 rounded border border-emerald-600/60 bg-emerald-950/50 hover:bg-emerald-900/60 px-3 py-1.5 text-xs font-mono font-semibold text-emerald-300 transition-colors shadow-sm"
              title="Launch autonomous Tor hidden services crawl"
            >
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
              <span>Crawl Engine</span>
            </button>

            <button
              onClick={onOpenNewTarget}
              className="flex items-center gap-1 rounded border border-[#232a3b] bg-[#0f131d] hover:bg-[#161c2b] px-2.5 py-1.5 text-xs font-mono text-slate-300 transition-colors"
              title="Add custom synthetic threat actor"
            >
              <Plus className="h-3.5 w-3.5 text-slate-400" />
              <span>New Target</span>
            </button>

            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 rounded border border-cyan-600/70 bg-cyan-950/50 hover:bg-cyan-900/60 px-3 py-1.5 text-xs font-mono font-semibold text-cyan-200 transition-colors shadow-sm"
              title="Generate court-admissible NTRO dossier"
            >
              <FileDown className="h-3.5 w-3.5 text-cyan-400" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        {/* Segmented Module Navigation Tabs */}
        <nav className="mt-3 flex gap-1.5 overflow-x-auto border-t border-[#1a202c] pt-2.5 pb-0.5" aria-label="Investigation modules">
          {navigation.map(({ id, label, keyHint, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`group flex shrink-0 items-center gap-2 rounded px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#161c2b] border border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-950/30'
                    : 'text-slate-400 border border-transparent hover:border-[#1e2433] hover:bg-[#0f131d] hover:text-slate-200'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                <span className="font-mono text-xs">{label}</span>
                <span className={`text-[9px] font-mono px-1 rounded ${
                  isActive ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60' : 'bg-slate-900 text-slate-600'
                }`}>
                  [{keyHint}]
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
