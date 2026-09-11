import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Radio, 
  Network, 
  Server, 
  Scale, 
  FileSpreadsheet, 
  ChevronDown, 
  Download, 
  FileText, 
  Code2, 
  Table, 
  PanelRightClose, 
  PanelRightOpen,
  CheckCircle2,
  RefreshCw,
  Plus,
  Waypoints,
  Layers,
  Clock,
  Settings2
} from 'lucide-react';
import { ThreatActorCase } from '../types';

export type Tab = 
  | 'overview' 
  | 'crawl' 
  | 'graph' 
  | 'infra' 
  | 'stylometry' 
  | 'fusion' 
  | 'ledger' 
  | 'timeline' 
  | 'setup';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (v: Tab) => void;
  cases: ThreatActorCase[];
  selectedCase: ThreatActorCase;
  setSelectedCase: (c: ThreatActorCase) => void;
  recordCount: number;
  nodeCount: number;
  edgeCount: number;
  isInspectorOpen: boolean;
  onToggleInspector: () => void;
  onOpenExport: () => void;
  onOpenNewTarget: () => void;
  onOpenCrawlModal: () => void;
  isBackendConnected: boolean;
}

const navViews: Array<{ id: Tab; num: string; label: string; icon: React.ElementType }> = [
  { id: 'overview', num: '01', label: 'Case Dossier', icon: Waypoints },
  { id: 'crawl', num: '02', label: 'Investigation & Crawl', icon: Radio },
  { id: 'graph', num: '03', label: 'Entity Relationship Graph', icon: Network },
  { id: 'infra', num: '04', label: 'Infrastructure Correlator', icon: Server },
  { id: 'stylometry', num: '05', label: 'Stylometric Profiler', icon: Scale },
  { id: 'fusion', num: '06', label: 'Attribution Matrix', icon: Layers },
  { id: 'ledger', num: '07', label: 'Evidence Ledger', icon: FileSpreadsheet },
  { id: 'timeline', num: '08', label: 'OpSec Timeline', icon: Clock },
  { id: 'setup', num: '09', label: 'Topology & Network', icon: Settings2 },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cases,
  selectedCase,
  setSelectedCase,
  recordCount,
  nodeCount,
  edgeCount,
  isInspectorOpen,
  onToggleInspector,
  onOpenExport,
  onOpenNewTarget,
  onOpenCrawlModal,
  isBackendConnected,
}) => {
  const [caseDropdownOpen, setCaseDropdownOpen] = useState(false);
  const caseDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (caseDropdownRef.current && !caseDropdownRef.current.contains(e.target as Node)) {
        setCaseDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#09090b] select-none">
      {/* 1. TOP COMMAND BAR (Height: 44px, sticky, border-b border-zinc-800) */}
      <div className="h-11 px-3 sm:px-4 border-b border-zinc-800 flex items-center justify-between gap-2 bg-[#09090b]">
        
        {/* Left: Brand Icon + Title + NTRO Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-6 h-6 rounded-sm bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-200">
            <Shield className="w-3.5 h-3.5 text-zinc-300" strokeWidth={1.5} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono tracking-widest text-xs font-semibold text-zinc-100">
              OBSIDIAN
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">
              v1.0-NTRO-TESTBED
            </span>
          </div>
        </div>

        {/* Center: Target Selector Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="text-zinc-500">Investigation</span>
          <span className="text-zinc-600">/</span>

          {/* Interactive Target Selector Dropdown */}
          <div className="relative" ref={caseDropdownRef}>
            <button
              onClick={() => setCaseDropdownOpen(!caseDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm hover:bg-zinc-900 hover:text-zinc-200 text-zinc-300 border border-transparent hover:border-zinc-800 transition-colors"
            >
              <span className="font-medium text-zinc-200">{selectedCase?.codename || 'testbed-target'}</span>
              <span className="text-[10px] text-zinc-500">({selectedCase?.primaryHandle || 'Target'})</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {caseDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-68 rounded-md bg-[#121215] border border-zinc-800 shadow-xl py-1 z-50 text-xs font-sans">
                <div className="px-2.5 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                  Select Active Investigation Case
                </div>
                {cases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCase(c);
                      setCaseDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between hover:bg-zinc-800/60 transition-colors ${
                      c.id === selectedCase.id ? 'bg-zinc-800/80 text-zinc-100 font-medium' : 'text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="font-mono text-xs font-medium">{c.codename}</div>
                      <div className="text-[11px] text-zinc-500 font-sans">{c.primaryHandle}</div>
                    </div>
                    <span className={`text-[10px] font-mono px-1 py-0.2 rounded border ${
                      c.threatLevel === 'CRITICAL' 
                        ? 'text-rose-400 border-rose-900/60 bg-rose-950/40' 
                        : 'text-amber-400 border-amber-900/60 bg-amber-950/40'
                    }`}>
                      {c.threatLevel}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-zinc-600">/</span>
          <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-1.5 py-0.2 rounded-sm text-[11px]">
            [ {recordCount} Records Extracted ]
          </span>
        </div>

        {/* Right: Heartbeats + Actions (All Buttons Restored!) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Tor SOCKS5 Proxy Status */}
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] text-zinc-300 px-2 py-0.5 rounded-sm bg-zinc-900/80 border border-zinc-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-400">Tor:</span>
            <span className="text-zinc-200">127.0.0.1:9050</span>
          </div>

          {/* SQLite Store Stats */}
          <div className="hidden xl:flex items-center gap-1 font-mono text-[11px] text-zinc-400 px-2 py-0.5 rounded-sm bg-zinc-900/50 border border-zinc-800">
            <span className="text-zinc-500">Store:</span>
            <span className="text-zinc-300">{nodeCount}n</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">{edgeCount}e</span>
          </div>

          {/* Action 1: Crawl Target Modal Button */}
          <button
            onClick={onOpenCrawlModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono transition-colors"
            title="Launch autonomous darknet crawler"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <span className="hidden sm:inline">Crawl Target</span>
          </button>

          {/* Action 2: New Target Modal Button */}
          <button
            onClick={onOpenNewTarget}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono transition-colors"
            title="Create a new target investigation case"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <span className="hidden sm:inline">New Target</span>
          </button>

          {/* Action 3: Export Dossier Modal Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-mono font-medium transition-colors"
            title="Export forensic intelligence dossier"
          >
            <Download className="w-3.5 h-3.5 text-zinc-300" strokeWidth={1.5} />
            <span>Export Dossier</span>
          </button>

          {/* Action 4: Toggle Inspector Drawer Button */}
          <button
            onClick={onToggleInspector}
            className={`p-1.5 rounded-sm border transition-colors ${
              isInspectorOpen
                ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-zinc-800'
            }`}
            title="Toggle Forensic Inspector (⌘I / Ctrl+I)"
          >
            {isInspectorOpen ? (
              <PanelRightClose className="w-3.5 h-3.5" strokeWidth={1.5} />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* 2. PRIMARY VIEW CONTROLLER: Seamless Sub-Navigation Header with All 9 Modules */}
      <nav 
        className="h-9 px-3 sm:px-4 border-b border-zinc-800/80 bg-[#0d0d10] flex items-center gap-1 overflow-x-auto"
        aria-label="Investigation Modules"
      >
        {navViews.map(({ id, num, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-800/90 text-zinc-100 font-medium border border-zinc-700/80 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
              }`}
            >
              <span className={`text-[10px] ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                [{num}]
              </span>
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-200' : 'text-zinc-400'}`} strokeWidth={1.5} />
              <span className="text-[11px] font-sans font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
