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
  FolderTree
} from 'lucide-react';
import { ThreatActorCase } from '../types';

export type ActiveView = 'crawl' | 'graph' | 'infra' | 'stylometry' | 'ledger';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
  cases: ThreatActorCase[];
  selectedCase: ThreatActorCase;
  setSelectedCase: (c: ThreatActorCase) => void;
  recordCount: number;
  nodeCount: number;
  edgeCount: number;
  isInspectorOpen: boolean;
  onToggleInspector: () => void;
  onExportReport: (format: 'pdf' | 'stix' | 'csv') => void;
  onTriggerCrawl: () => void;
  isBackendConnected: boolean;
}

const navViews: Array<{ id: ActiveView; num: string; label: string; icon: React.ElementType }> = [
  { id: 'crawl', num: '01', label: 'Investigation & Crawl', icon: Radio },
  { id: 'graph', num: '02', label: 'Entity Relationship Graph', icon: Network },
  { id: 'infra', num: '03', label: 'Infrastructure Correlator', icon: Server },
  { id: 'stylometry', num: '04', label: 'Stylometric Persona Profiler', icon: Scale },
  { id: 'ledger', num: '05', label: 'Evidence Provenance Ledger', icon: FileSpreadsheet },
];

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  cases,
  selectedCase,
  setSelectedCase,
  recordCount,
  nodeCount,
  edgeCount,
  isInspectorOpen,
  onToggleInspector,
  onExportReport,
  onTriggerCrawl,
  isBackendConnected,
}) => {
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [caseDropdownOpen, setCaseDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const caseDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExportDropdownOpen(false);
      }
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

          {/* Interactive Target Selector */}
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
              <div className="absolute left-0 top-full mt-1 w-64 rounded-md bg-[#121215] border border-zinc-800 shadow-xl py-1 z-50 text-xs font-sans">
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
                      <div className="font-mono text-xs">{c.codename}</div>
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

        {/* Right: System Heartbeat & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Tor SOCKS5 Proxy Status */}
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] text-zinc-300 px-2 py-0.5 rounded-sm bg-zinc-900/80 border border-zinc-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-400">Tor SOCKS5:</span>
            <span className="text-zinc-200">127.0.0.1:9050</span>
          </div>

          {/* SQLite Store Stats */}
          <div className="hidden xl:flex items-center gap-1 font-mono text-[11px] text-zinc-400 px-2 py-0.5 rounded-sm bg-zinc-900/50 border border-zinc-800">
            <span className="text-zinc-500">Store:</span>
            <span className="text-zinc-300">{nodeCount} nodes</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">{edgeCount} edges</span>
          </div>

          {/* Export Dossier Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-mono font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
              <span>Export Dossier</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-md bg-[#121215] border border-zinc-800 shadow-xl py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    onExportReport('pdf');
                    setExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-zinc-800/70 text-zinc-200 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.5} />
                  <span>PDF Forensic Report</span>
                </button>
                <button
                  onClick={() => {
                    onExportReport('stix');
                    setExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-zinc-800/70 text-zinc-200 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                  <span>STIX 2.1 Bundle (JSON)</span>
                </button>
                <button
                  onClick={() => {
                    onExportReport('csv');
                    setExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-zinc-800/70 text-zinc-200 transition-colors"
                >
                  <Table className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
                  <span>Evidence Ledger (CSV)</span>
                </button>
              </div>
            )}
          </div>

          {/* Toggle Inspector Drawer */}
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

      {/* 2. PRIMARY VIEW CONTROLLER: Seamless Sub-Navigation Header */}
      <nav 
        className="h-9 px-3 sm:px-4 border-b border-zinc-800/80 bg-[#0d0d10] flex items-center gap-1 overflow-x-auto"
        aria-label="Investigation Sub-Views"
      >
        {navViews.map(({ id, num, label, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-sm text-xs font-mono transition-colors whitespace-nowrap ${
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
