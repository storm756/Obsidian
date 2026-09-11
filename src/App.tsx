import React, { useEffect, useState, useCallback } from 'react';
import { Header, ActiveView } from './components/Header';
import { ForensicInspector, ForensicEntity } from './components/ForensicInspector';
import { ViewInvestigationCrawl } from './components/ViewInvestigationCrawl';
import { ModuleEntityGraph } from './components/ModuleEntityGraph';
import { ViewInfrastructureCorrelator } from './components/ViewInfrastructureCorrelator';
import { ViewStylometricMatcher } from './components/ViewStylometricMatcher';
import { ViewEvidenceLedger } from './components/ViewEvidenceLedger';
import { ReportExportModal } from './components/ReportExportModal';
import {
  BENCHMARK_CASES,
  MOCK_GRAPH_DATA,
  MOCK_TIMELINES,
  MOCK_FUSION_SIGNALS
} from './data/mockData';
import { ThreatActorCase, InfraScanResult, GraphNode, GraphLink } from './types';
import { AlertTriangle, WifiOff, Terminal, Shield } from 'lucide-react';

export default function App() {
  const [cases, setCases] = useState<ThreatActorCase[]>(BENCHMARK_CASES);
  const [selectedCase, setSelectedCase] = useState<ThreatActorCase>(
    BENCHMARK_CASES.find((item) => item.id === 'case-venom-01') ?? BENCHMARK_CASES[0]
  );

  const [activeView, setActiveView] = useState<ActiveView>('crawl');
  const [activeTarget, setActiveTarget] = useState<string>('5ddoqqirppgbbl3rgl7octcxixxzrarvhl5v6s65ycseillxpignm6ad.onion');
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
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'stix' | 'csv'>('pdf');

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
  const [recordCount, setRecordCount] = useState<number>(55);

  // Sync with FastAPI backend
  const refreshAllData = useCallback(async () => {
    try {
      // 1. Health check & onion targets
      const targetsRes = await fetch('http://localhost:8000/api/onion-targets');
      if (targetsRes.ok) {
        setIsBackendConnected(true);
        const tData = await targetsRes.json();
        if (tData.targets) {
          setOnionTargets(tData.targets);
          if (tData.targets.testbed) {
            setActiveTarget(tData.targets.testbed);
          }
        }
      } else {
        setIsBackendConnected(false);
      }

      // 2. Investigation status & record count
      const statusRes = await fetch('http://localhost:8000/api/investigation-status');
      if (statusRes.ok) {
        const sData = await statusRes.json();
        if (sData.listingsExtracted) {
          setRecordCount(sData.listingsExtracted);
        }
      }

      // 3. Graph
      const graphRes = await fetch('http://localhost:8000/api/entity-graph');
      if (graphRes.ok) {
        const gData = await graphRes.json();
        if (gData.nodes && gData.nodes.length > 0) {
          setLiveGraphData(gData);
        }
      }

      // 4. Cases
      const casesRes = await fetch('http://localhost:8000/api/cases');
      if (casesRes.ok) {
        const cData = await casesRes.json();
        if (Array.isArray(cData) && cData.length > 0) {
          setCases(cData);
        }
      }
    } catch (err) {
      console.warn('Backend not yet reachable on localhost:8000:', err);
      setIsBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Run live infrastructure scan
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
      setActiveView('infra');
    }
  };

  // Keyboard hotkeys for fast view switching (1-5), Toggle Inspector (Cmd+I / Ctrl+I / [), and Escape to close inspector
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

      const viewMap: Record<string, ActiveView> = {
        '1': 'crawl',
        '2': 'graph',
        '3': 'infra',
        '4': 'stylometry',
        '5': 'ledger',
      };
      if (viewMap[e.key]) {
        setActiveView(viewMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentGraphData = liveGraphData ?? MOCK_GRAPH_DATA[selectedCase.id] ?? MOCK_GRAPH_DATA['case-venom-01'];

  const handleEntitySelect = (entity: ForensicEntity) => {
    setSelectedEntity(entity);
    setIsInspectorOpen(true);
  };

  const handleExport = (format: 'pdf' | 'stix' | 'csv') => {
    setExportFormat(format);
    setExportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-700 selection:text-white">
      {/* 1. TOP COMMAND BAR */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        cases={cases}
        selectedCase={selectedCase}
        setSelectedCase={setSelectedCase}
        recordCount={recordCount}
        nodeCount={currentGraphData.nodes.length}
        edgeCount={currentGraphData.links.length}
        isInspectorOpen={isInspectorOpen}
        onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
        onExportReport={handleExport}
        onTriggerCrawl={() => setActiveView('crawl')}
        isBackendConnected={isBackendConnected}
      />

      {/* OFFLINE WARNING BANNER (When FastAPI is disconnected) */}
      {!isBackendConnected && (
        <div className="bg-amber-950/40 border-b border-amber-800/60 px-4 py-1.5 text-xs font-mono text-amber-300 flex items-center justify-between">
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
          {activeView === 'crawl' && (
            <ViewInvestigationCrawl
              activeTarget={activeTarget}
              setActiveTarget={setActiveTarget}
              onionTargets={onionTargets}
              onSelectEntity={handleEntitySelect}
              onInvestigationComplete={refreshAllData}
              recordCount={recordCount}
            />
          )}

          {activeView === 'graph' && (
            <ModuleEntityGraph
              selectedCase={selectedCase}
              graphData={currentGraphData}
              isLiveGraph={liveGraphData !== null}
              onSelectEntity={handleEntitySelect}
            />
          )}

          {activeView === 'infra' && (
            <ViewInfrastructureCorrelator
              selectedCase={selectedCase}
              scanResult={scanResults[selectedCase.id]}
              onRunScan={handleRunScan}
              isScanning={isScanning}
              onionTargets={onionTargets}
              onSelectEntity={handleEntitySelect}
            />
          )}

          {activeView === 'stylometry' && (
            <ViewStylometricMatcher
              selectedCase={selectedCase}
              onSelectEntity={handleEntitySelect}
            />
          )}

          {activeView === 'ledger' && (
            <ViewEvidenceLedger
              selectedCase={selectedCase}
              onSelectEntity={handleEntitySelect}
              onExportReport={handleExport}
            />
          )}
        </main>

        {/* Persistent Right-Hand Forensic Inspector (380px drawer) */}
        <ForensicInspector
          entity={selectedEntity}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          onFocusInGraph={(nodeId) => {
            setActiveView('graph');
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
          <span>Keys: <kbd className="px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">1-5</kbd> Views, <kbd className="px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">⌘I</kbd> Inspector</span>
        </div>
      </footer>

      {/* Dossier Export Modal */}
      <ReportExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        targetCase={selectedCase}
        scan={scanResults[selectedCase.id]}
        signals={MOCK_FUSION_SIGNALS[selectedCase.id] || MOCK_FUSION_SIGNALS['case-venom-01']}
        graphData={currentGraphData}
      />
    </div>
  );
}
