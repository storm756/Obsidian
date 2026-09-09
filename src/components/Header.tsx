import React from 'react';
import { Shield, Radio, Terminal, FileDown, Layers, Network, Compass, Cpu, Settings } from 'lucide-react';
import { ThreatActorCase } from '../types';

interface HeaderProps {
  activeTab: 'overview' | 'setup' | 'infra' | 'graph' | 'stylometry' | 'fusion' | 'timeline';
  setActiveTab: (tab: 'overview' | 'setup' | 'infra' | 'graph' | 'stylometry' | 'fusion' | 'timeline') => void;
  cases: ThreatActorCase[];
  selectedCase: ThreatActorCase;
  setSelectedCase: (c: ThreatActorCase) => void;
  onOpenExport: () => void;
  onOpenNewTarget: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cases,
  selectedCase,
  setSelectedCase,
  onOpenExport,
  onOpenNewTarget,
}) => {
  return (
    <header className="border-b border-white/[0.07] bg-[#0c0c0f]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Top operational bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>NTRO PS 26151 · Active</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">/</span>
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
            <Radio className="w-3 h-3 text-cyan-400/80" />
            <span>Continuous Monitoring: <span className="text-zinc-200 font-medium">Active</span></span>
          </div>
          <span className="text-zinc-700 hidden md:inline">/</span>
          <div className="hidden md:flex items-center gap-1.5 text-zinc-400 text-[11px]">
            <span>Benchmark Dataset:</span>
            <span className="text-zinc-300 font-medium">Gwern Archives &amp; Testbed</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Target selector */}
          <div className="flex items-center gap-1.5 bg-[#141418] hover:bg-[#18181e] border border-white/[0.08] rounded-lg px-2.5 py-1 transition-colors">
            <span className="text-zinc-400 text-[11px] font-medium">Target:</span>
            <select
              value={selectedCase.id}
              onChange={(e) => {
                const found = cases.find(c => c.id === e.target.value);
                if (found) setSelectedCase(found);
              }}
              className="bg-transparent text-amber-300/90 text-xs font-medium focus:outline-none cursor-pointer pr-1"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#141418] text-zinc-200">
                  {c.codename} ({c.primaryHandle})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenNewTarget}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#141418] hover:bg-[#1c1c22] text-zinc-300 hover:text-white border border-white/[0.08] transition-all"
            title="Create or test custom target"
          >
            <span>+ Custom Target</span>
          </button>

          <button
            onClick={onOpenExport}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white transition-all flex items-center gap-1.5 shadow-sm shadow-cyan-950/40"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Dossier</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-white/10 flex items-center justify-center text-cyan-400 shadow-md shadow-black/50">
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                OBSIDIAN
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium tracking-normal bg-zinc-800/80 text-zinc-300 border border-white/10">
                  v2.4
                </span>
              </h1>
              <span className="text-zinc-700">/</span>
              <span className="text-xs font-medium text-cyan-400/90 tracking-wide">
                Threat Actor De-anonymization
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Multi-Signal Fusion: Infrastructure Correlation, Entity Graphing &amp; AI Stylometry
            </p>
          </div>
        </div>

        {/* Tab navigation bar with smooth segmented control */}
        <nav className="flex items-center gap-1 p-1 bg-[#09090c]/70 border border-white/[0.06] rounded-xl overflow-x-auto scrollbar-none">
          {/* Overview Tab */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#1a1a20] text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Overview</span>
          </button>

          {/* Setup Tab */}
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'setup'
                ? 'bg-[#1a1a20] text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Setup</span>
          </button>

          {/* M1: Infra Scan Tab */}
          <button
            onClick={() => setActiveTab('infra')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'infra'
                ? 'bg-[#1a1a20] text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>M1: Infra Correlation</span>
          </button>

          {/* M2: Entity Graph Tab */}
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'graph'
                ? 'bg-[#1a1a20] text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-emerald-400" />
            <span>M2: Entity Graph</span>
          </button>

          {/* M3: AI Stylometry Tab */}
          <button
            onClick={() => setActiveTab('stylometry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'stylometry'
                ? 'bg-[#1a1a20] text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>M3: AI Stylometry</span>
          </button>

          {/* Fusion Scorecard Tab */}
          <button
            onClick={() => setActiveTab('fusion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'fusion'
                ? 'bg-[#1a1a20] text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fusion Scorecard</span>
          </button>
        </nav>
      </div>
    </header>
  );
};