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
  ShieldCheck, 
  Plus, 
  ChevronDown,
  Layers,
  CheckCircle2
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

const navigation: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Case Dossier', icon: Waypoints },
  { id: 'setup', label: 'Testbed Topology', icon: Settings2 },
  { id: 'infra', label: 'Infrastructure Leaks', icon: ScanSearch },
  { id: 'graph', label: 'Cryptographic Graph', icon: Network },
  { id: 'stylometry', label: 'Stylometric Audit', icon: Sparkles },
  { id: 'fusion', label: 'Attribution Matrix', icon: Layers },
  { id: 'timeline', label: 'OpSec Timeline', icon: Clock },
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
    <header className="sticky top-0 z-40 border-b border-[#1c2436] bg-[#0d1118]/95 backdrop-blur-md">
      {/* Top Utility Strip */}
      <div className="border-b border-[#182030] bg-[#090c12] px-4 sm:px-6 py-1 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>Tor SOCKS5 :9050 Connected</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-[11px] text-slate-400">Backend API :8000 Live</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>{utcTime || '2026-09-11 12:00:00 UTC'}</span>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          
          {/* Brand & Suite Identification */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">
                  OBSIDIAN
                </span>
                <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                  v2.5
                </span>
                <span className="rounded bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Darknet Threat Actor De-anonymization Workstation
              </p>
            </div>
          </div>

          {/* Target Selection & Operations Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Target Selector */}
            <div className="flex items-center rounded-lg border border-[#24304c] bg-[#121724] px-3 py-1.5 shadow-sm">
              <span className="text-xs text-slate-400 mr-2 font-medium">Target:</span>
              <select
                value={selectedCase.id}
                onChange={(e) => {
                  const next = cases.find((item) => item.id === e.target.value);
                  if (next) setSelectedCase(next);
                }}
                className="bg-transparent text-xs font-semibold text-slate-100 outline-none cursor-pointer pr-2"
              >
                {cases.map((item) => (
                  <option key={item.id} value={item.id} className="bg-[#121724] text-slate-200">
                    {item.codename} ({item.primaryHandle})
                  </option>
                ))}
              </select>
              <span className={`ml-1 text-[10px] px-2 py-0.5 rounded font-semibold border ${
                selectedCase.threatLevel?.includes('CRITICAL') 
                  ? 'bg-rose-950/60 border-rose-800/80 text-rose-300' 
                  : 'bg-amber-950/60 border-amber-800/80 text-amber-300'
              }`}>
                {selectedCase.threatLevel || 'CRITICAL'}
              </span>
            </div>

            {/* Quick Actions */}
            <button
              onClick={onOpenCrawlModal}
              className="flex items-center gap-1.5 rounded-lg border border-[#24304c] bg-[#141a28] hover:bg-[#1a2336] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors shadow-sm"
              title="Launch darknet crawler"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
              <span>Crawl Target</span>
            </button>

            <button
              onClick={onOpenNewTarget}
              className="flex items-center gap-1.5 rounded-lg border border-[#24304c] bg-[#141a28] hover:bg-[#1a2336] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors shadow-sm"
              title="Add a new investigation target"
            >
              <Plus className="h-3.5 w-3.5 text-slate-400" />
              <span>New Target</span>
            </button>

            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-medium transition-colors shadow-sm"
              title="Export forensic intelligence dossier"
            >
              <FileDown className="h-3.5 w-3.5 text-white" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        {/* Clean Segmented Navigation Tabs */}
        <nav className="mt-3 flex gap-1 overflow-x-auto border-t border-[#182030] pt-2" aria-label="Investigation modules">
          {navigation.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1c2438] text-white shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131826]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
