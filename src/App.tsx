import React, { useEffect, useState, useCallback } from 'react';
import { Header, Tab } from './components/Header';
import { ForensicInspector, ForensicEntity } from './components/ForensicInspector';
import { CaseOverview } from './components/CaseOverview';
import { ViewInvestigationCrawl } from './components/ViewInvestigationCrawl';
import { ModuleEntityGraph } from './components/ModuleEntityGraph';
import { ViewInfrastructureCorrelator } from './components/ViewInfrastructureCorrelator';
import { ModuleInfraScan } from './components/ModuleInfraScan';
import { ViewStylometricMatcher } from './components/ViewStylometricMatcher';
import { ModuleStylometry } from './components/ModuleStylometry';
import { FusionLayer } from './components/FusionLayer';
import { ViewEvidenceLedger } from './components/ViewEvidenceLedger';
import { InvestigationTimeline } from './components/InvestigationTimeline';
import { SetupPage } from './components/SetupPage';
import { ReportExportModal } from './components/ReportExportModal';
import { NewTargetModal } from './components/NewTargetModal';
import { CrawlProgressModal } from './components/CrawlProgressModal';
import {
  BENCHMARK_CASES,
  MOCK_GRAPH_DATA,
  MOCK_TIMELINES,
  MOCK_FUSION_SIGNALS
} from './data/mockData';
import { ThreatActorCase, InfraScanResult, GraphNode, GraphLink, TimelineEvent, AttributionSignalBreakdown } from './types';
import { WifiOff, Server, Terminal, Sparkles, Scale, Table } from 'lucide-react';

export default function App() {
  const [cases, setCases] = useState<ThreatActorCase[]>(BENCHMARK_CASES);
  const [selectedCase, setSelectedCase] = useState<ThreatActorCase>(
    BENCHMARK_CASES.find((item) => item.id === 'case-venom-01') ?? BENCHMARK_CASES[0]
  );

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [activeTarget, setActiveTarget] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'testbed' | 'manual'>('testbed');
  const [testbedOnion, setTestbedOnion] = useState<string>('');
  const [onionTargets, setOnionTargets] = useState<Record<string, string>>({
    testbed: '5ddoqqirppgbbl3rgl7octcxixxzrarvhl5v6s65ycseillxpignm6ad.onion',
    'market-a': 'q4fldlv4e4pscz7ng7jlpxyqntukjb6org6poihkyhjepu6yrbqx5kqd.onion',
    'forum-b': 'kn2tejq7fj47fra54jmfcgv2m277ltcsymtewdb2fs3wmpegt3zfevid.onion',
    escrow: '3zryvul2zmgds2t44bydfrkxjwq5nsqmqn64wijfwgyxqzi5322pn2id.onion',
    'market-c': 'rxr5hr4blxejbe2fr4xbkyheaoprlbjpuken33soivrjckodhhydsnid.onion',
  });

  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<Record<string, InfraScanResult>>({});

  // Modals state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [newTargetModalOpen, setNewTargetModalOpen] = useState(false);
  const [crawlModalOpen, setCrawlModalOpen] = useState(false);

  // Sub-view toggles for Infra and Stylometry to let analysts choose or see both
  const [infraSubView, setInfraSubView] = useState<'audit' | 'deep_scan'>('audit');
  const [styloSubView, setStyloSubView] = useState<'diff_matcher' | 'nlp_audit'>('diff_matcher');

  // Forensic Inspector State (Persistent 380px drawer)
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [selectedEntity, setSelectedEntity] = useState<ForensicEntity | null>({
    id: 'case-venom-01-lead',
    type: 'actor',
    label: 'VenomVendor (Lead Suspect)',
    handle: 'VenomVendor',
    category: 'Narcotics & Precursors Syndicate',
    threatLevel: 'CRITICAL',
    deterministicScore: 96,
    aiScore: 91,
    pgpKeyId: '0x7A94B3C2D812E55A',
    pgpFingerprint: 'F4A1 89DE 2011 77CB 92E1 0184 7A94 B3C2 D812 E55A',
    walletAddress: 'bc1q9v7kmw201994xza0183zzmm3291882a',
    originIp: '185.220.101.44',
    isp: 'Neterra Telecommunications Ltd',
    asn: 'AS34224 (Neterra BG)',
    sourceUrl: 'q4fldlv4e4pscz7ng7jlpxyqntukjb6org6poihkyhjepu6yrbqx5kqd.onion',
    htmlHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    firstSeen: '2021-04-12 00:00 UTC',
    lastSeen: '2024-09-02 18:30 UTC',
    rawPayload: `[FORENSIC_DOSSIER_ENTITY]
Target: VenomVendor
Aliases: Noxious_Direct, VV_EscrowAdmin
PGP Master: 0x7A94B3C2D812E55A
Bitcoin Wallet: bc1q9v7kmw201994xza0183zzmm3291882a
Clearnet IP Leak: 185.220.101.44 (Sofia, Bulgaria)
Attribution: 93.8% Composite (Palantir Gotham MCDA Algorithm)`
  });

  const [liveGraphData, setLiveGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const [liveTimeline, setLiveTimeline] = useState<TimelineEvent[] | null>(null);
  const [liveSignals, setLiveSignals] = useState<AttributionSignalBreakdown[] | null>(null);
  const [recordCount, setRecordCount] = useState<number>(337);

  // Sync with FastAPI backend
  const refreshAllData = useCallback(async () => {
    try {
      // 1. Onion targets
      const targetsRes = await fetch('http://localhost:8000/api/onion-targets');
      if (targetsRes.ok) {
        setIsBackendConnected(true);
        const tData = await targetsRes.json();
        if (tData.targets) {
          setOnionTargets(tData.targets);
          if (tData.targets.testbed && !testbedOnion) {
            setTestbedOnion(tData.targets.testbed);
            setActiveTarget(tData.targets.testbed);
          }
        }
      } else {
        setIsBackendConnected(false);
      }

      // 2. Cases
      const casesRes = await fetch('http://localhost:8000/api/cases');
      if (casesRes.ok) {
        const cData = await casesRes.json();
        if (Array.isArray(cData) && cData.length > 0) {
          setCases(cData);
        }
      }

      // 3. Status
      const statusRes = await fetch('http://localhost:8000/api/investigation-status');
      if (statusRes.ok) {
        const sData = await statusRes.json();
        if (sData.listingsExtracted) {
          setRecordCount(sData.listingsExtracted);
        }
      }

      // 4. Graph
      const graphRes = await fetch('http://localhost:8000/api/entity-graph');
      if (graphRes.ok) {
        const gData = await graphRes.json();
        if (gData.nodes && gData.nodes.length > 0) {
          setLiveGraphData(gData);
        }
      }

      // 5. Timeline
      const timeRes = await fetch('http://localhost:8000/api/timeline');
      if (timeRes.ok) {
        const timeData = await timeRes.json();
        if (Array.isArray(timeData) && timeData.length > 0) {
          setLiveTimeline(timeData);
        }
      }

      // 6. Fusion Signals
      const sigRes = await fetch('http://localhost:8000/api/fusion-signals');
      if (sigRes.ok) {
        const sigData = await sigRes.json();
        if (Array.isArray(sigData) && sigData.length > 0) {
          setLiveSignals(sigData);
        }
      }
    } catch (err) {
      console.warn('Backend not yet reachable on localhost:8000:', err);
      setIsBackendConnected(false);
    }
  }, [testbedOnion]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Re-fetch graph when user switches to graph tab
  useEffect(() => {
    if (activeTab === 'graph') {
      fetch('http://localhost:8000/api/entity-graph')
        .then(res => res.json())
        .then(data => {
          if (data.nodes && data.nodes.length > 0) {
            setLiveGraphData(data);
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  // Re-fetch dynamic fusion signals whenever active case changes
  useEffect(() => {
    if (!selectedCase?.id) return;
    fetch(`http://localhost:8000/api/fusion-signals?case_id=${encodeURIComponent(selectedCase.id)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLiveSignals(data);
        }
      })
      .catch((err) => console.warn('Could not fetch signals for case:', err));
  }, [selectedCase?.id]);

  const currentScan = scanResults[selectedCase.id];
  const currentGraphData = liveGraphData ?? MOCK_GRAPH_DATA[selectedCase.id] ?? MOCK_GRAPH_DATA['case-venom-01'];
  const currentTimeline = liveTimeline ?? MOCK_TIMELINES[selectedCase.id] ?? MOCK_TIMELINES['case-venom-01'];
  const currentSignals = liveSignals ?? MOCK_FUSION_SIGNALS[selectedCase.id] ?? MOCK_FUSION_SIGNALS['case-venom-01'];

  // Run infrastructure scan through the real backend
  const handleRunScan = async (onionUrl: string) => {
    if (!onionUrl) return;
    setIsScanning(true);
    try {
      const res = await fetch('http://localhost:8000/api/infra-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onion_url: onionUrl }),
      });
      if (res.ok) {
        const data: InfraScanResult = await res.json();
        setScanResults(prev => ({
          ...prev,
          [selectedCase.id]: data,
        }));
      }
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
      setActiveTab('infra');
    }
  };

  // Keyboard hotkeys for fast tab switching (1 to 9), Toggle Inspector (Cmd+I / Ctrl+I / [), and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsInspectorOpen(prev => !prev);
        return;
      }
      if (e.key === '[') {
        setIsInspectorOpen(prev => !prev);
        return;
      }
      if (e.key === 'Escape') {
        setIsInspectorOpen(false);
        return;
      }

      const tabMap: Record<string, Tab> = {
        '1': 'overview',
        '2': 'crawl',
        '3': 'graph',
        '4': 'infra',
        '5': 'stylometry',
        '6': 'fusion',
        '7': 'ledger',
        '8': 'timeline',
        '9': 'setup',
      };
      if (tabMap[e.key]) {
        setActiveTab(tabMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreateTarget = (newCase: ThreatActorCase) => {
    setCases(prev => [newCase, ...prev]);
    setSelectedCase(newCase);
    setActiveTab('overview');
  };

  const handleEntitySelect = (entity: ForensicEntity) => {
    setSelectedEntity(entity);
    setIsInspectorOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-700 selection:text-white">
      {/* 1. TOP COMMAND BAR & 9-MODULE CONTROLLER */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cases={cases}
        selectedCase={selectedCase}
        setSelectedCase={setSelectedCase}
        recordCount={recordCount}
        nodeCount={currentGraphData.nodes.length}
        edgeCount={currentGraphData.links.length}
        isInspectorOpen={isInspectorOpen}
        onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
        onOpenExport={() => setExportModalOpen(true)}
        onOpenNewTarget={() => setNewTargetModalOpen(true)}
        onOpenCrawlModal={() => setCrawlModalOpen(true)}
        isBackendConnected={isBackendConnected}
      />

      {/* OFFLINE WARNING BANNER */}
      {!isBackendConnected && (
        <div className="bg-amber-950/40 border-b border-amber-800/60 px-4 py-1 text-xs font-mono text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
            <span>[OFFLINE MODE: Displaying cached benchmark dataset. Connect FastAPI on :8000 for live Tor crawl.]</span>
          </div>
          <span className="text-[10px] text-amber-500 hidden sm:inline">
            55 Benchmark Records &bull; SHA-256 Signatures Intact
          </span>
        </div>
      )}

      {/* 2. MAIN WORKSPACE + 3. COLLAPSIBLE FORENSIC INSPECTOR */}
      <div className="flex-1 flex overflow-hidden">
        {/* Primary View Workspace */}
        <main className="flex-1 p-3.5 sm:p-4 overflow-y-auto max-w-[1800px] w-full mx-auto">
          {/* TAB 1: Case Dossier Overview */}
          {activeTab === 'overview' && (
            <CaseOverview
              targetCase={selectedCase}
              onNavigateTab={(tab) => setActiveTab(tab as Tab)}
              onRunScan={() => handleRunScan(activeTarget)}
            />
          )}

          {/* TAB 2: Investigation Runner & Autonomous Crawl */}
          {activeTab === 'crawl' && (
            <ViewInvestigationCrawl
              activeTarget={activeTarget}
              setActiveTarget={setActiveTarget}
              onionTargets={onionTargets}
              onSelectEntity={handleEntitySelect}
              onInvestigationComplete={refreshAllData}
              recordCount={recordCount}
            />
          )}

          {/* TAB 3: Cryptographic Entity Relationship Graph */}
          {activeTab === 'graph' && (
            <ModuleEntityGraph
              selectedCase={selectedCase}
              graphData={currentGraphData}
              isLiveGraph={liveGraphData !== null}
              onSelectEntity={handleEntitySelect}
            />
          )}

          {/* TAB 4: Infrastructure Correlator (Audit Table + Deep SOCKS5 & AI Analysis) */}
          {activeTab === 'infra' && (
            <div className="space-y-4">
              {/* Sub-Switch: Security Audit Table vs Deep SOCKS5 / AI Scan */}
              <div className="flex items-center justify-between p-2 rounded bg-[#121215] border border-zinc-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                  <span className="text-zinc-300 font-semibold uppercase">Infrastructure Reconnaissance Suite</span>
                </div>
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded p-0.5">
                  <button
                    onClick={() => setInfraSubView('audit')}
                    className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                      infraSubView === 'audit'
                        ? 'bg-zinc-800 text-zinc-100 font-medium'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Table className="w-3 h-3" />
                    <span>Origin Leak Matrix</span>
                  </button>
                  <button
                    onClick={() => setInfraSubView('deep_scan')}
                    className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                      infraSubView === 'deep_scan'
                        ? 'bg-zinc-800 text-zinc-100 font-medium'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Deep Scanner &amp; AI Audit</span>
                  </button>
                </div>
              </div>

              {infraSubView === 'audit' ? (
                <ViewInfrastructureCorrelator
                  selectedCase={selectedCase}
                  scanResult={scanResults[selectedCase.id]}
                  onRunScan={handleRunScan}
                  isScanning={isScanning}
                  onionTargets={onionTargets}
                  onSelectEntity={handleEntitySelect}
                />
              ) : (
                <ModuleInfraScan
                  selectedCase={selectedCase}
                  scanResult={scanResults[selectedCase.id]}
                  onRunScan={handleRunScan}
                  isScanning={isScanning}
                  onionTargets={onionTargets}
                />
              )}
            </div>
          )}

          {/* TAB 5: Stylometric Persona Profiler (Diff Matcher + Gemini AI Stylometry) */}
          {activeTab === 'stylometry' && (
            <div className="space-y-4">
              {/* Sub-Switch: Side-by-Side Diff vs Gemini Forensic NLP Audit */}
              <div className="flex items-center justify-between p-2 rounded bg-[#121215] border border-zinc-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                  <span className="text-zinc-300 font-semibold uppercase">Stylometric Author Attribution Suite</span>
                </div>
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded p-0.5">
                  <button
                    onClick={() => setStyloSubView('diff_matcher')}
                    className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                      styloSubView === 'diff_matcher'
                        ? 'bg-zinc-800 text-zinc-100 font-medium'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Scale className="w-3 h-3" />
                    <span>Rebrand Diff Matcher</span>
                  </button>
                  <button
                    onClick={() => setStyloSubView('nlp_audit')}
                    className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                      styloSubView === 'nlp_audit'
                        ? 'bg-zinc-800 text-zinc-100 font-medium'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Gemini AI Persona Audit</span>
                  </button>
                </div>
              </div>

              {styloSubView === 'diff_matcher' ? (
                <ViewStylometricMatcher
                  selectedCase={selectedCase}
                  onSelectEntity={handleEntitySelect}
                />
              ) : (
                <ModuleStylometry
                  selectedCase={selectedCase}
                />
              )}
            </div>
          )}

          {/* TAB 6: Attribution Fusion Matrix (MCDA) */}
          {activeTab === 'fusion' && (
            <FusionLayer
              selectedCase={selectedCase}
              signals={currentSignals}
              onOpenExport={() => setExportModalOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab as Tab)}
            />
          )}

          {/* TAB 7: Evidence Provenance Ledger */}
          {activeTab === 'ledger' && (
            <ViewEvidenceLedger
              selectedCase={selectedCase}
              onSelectEntity={handleEntitySelect}
              onExportReport={() => setExportModalOpen(true)}
            />
          )}

          {/* TAB 8: OpSec Timeline */}
          {activeTab === 'timeline' && (
            <InvestigationTimeline
              selectedCase={selectedCase}
              timelineEvents={currentTimeline}
            />
          )}

          {/* TAB 9: Topology & Organization Network Setup */}
          {activeTab === 'setup' && (
            <SetupPage
              testbedOnion={testbedOnion}
              activeTarget={activeTarget}
              activeMode={activeMode}
              onionTargets={onionTargets}
              onSetTarget={(url, mode) => {
                setActiveTarget(url);
                setActiveMode(mode);
              }}
              onOpenCrawlModal={() => setCrawlModalOpen(true)}
            />
          )}
        </main>

        {/* Persistent Right-Hand Forensic Inspector (380px drawer) */}
        <ForensicInspector
          entity={selectedEntity}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          onFocusInGraph={(nodeId) => {
            setActiveTab('graph');
          }}
        />
      </div>

      {/* Tactical Status Bar (Height 28px) */}
      <footer className="h-7 border-t border-zinc-800 bg-[#0c0c0e] px-3 sm:px-4 text-[11px] font-mono text-zinc-500 flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-zinc-300">OBSIDIAN DE-ANONYMIZATION ENGINE</span>
          <span className="text-zinc-700">|</span>
          <span>TOR SOCKS5 :9050</span>
          <span className="text-zinc-700">|</span>
          <span>AIR-GAPPED TESTBED</span>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span>Target: <strong className="text-zinc-300">{selectedCase.codename}</strong></span>
          <span className="text-zinc-700">|</span>
          <span>Integrity: <strong className="text-emerald-400">SHA-256 VERIFIED</strong></span>
          <span className="text-zinc-700">|</span>
          <span>Keys: <kbd className="px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">1-9</kbd> Modules, <kbd className="px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">⌘I</kbd> Inspector</span>
        </div>
      </footer>

      {/* Dossier Export Modal */}
      <ReportExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        targetCase={selectedCase}
        scan={currentScan}
        signals={currentSignals}
        graphData={currentGraphData}
      />

      {/* Custom Target Creation Modal */}
      <NewTargetModal
        isOpen={newTargetModalOpen}
        onClose={() => setNewTargetModalOpen(false)}
        onCreateTarget={handleCreateTarget}
      />

      {/* Autonomous Dark Web Crawl & Investigation Modal */}
      <CrawlProgressModal
        isOpen={crawlModalOpen}
        onClose={() => setCrawlModalOpen(false)}
        seedOnion={testbedOnion}
        onionTargets={onionTargets}
        onCrawlComplete={refreshAllData}
      />
    </div>
  );
}
