import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { SetupPage } from './components/SetupPage';
import { CaseOverview } from './components/CaseOverview';
import { ModuleInfraScan } from './components/ModuleInfraScan';
import { ModuleEntityGraph } from './components/ModuleEntityGraph';
import { ModuleStylometry } from './components/ModuleStylometry';
import { FusionLayer } from './components/FusionLayer';
import { InvestigationTimeline } from './components/InvestigationTimeline';
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

export default function App() {
  const [cases, setCases] = useState<ThreatActorCase[]>(BENCHMARK_CASES);
  const [selectedCase, setSelectedCase] = useState<ThreatActorCase>(BENCHMARK_CASES.find((item) => item.id === 'case-testbed-03') ?? BENCHMARK_CASES[0]);
  
  const [activeTab, setActiveTab] = useState<
    'overview' | 'setup' | 'infra' | 'graph' | 'stylometry' | 'fusion' | 'timeline'
  >('overview');
  const [activeTarget, setActiveTarget] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'testbed' | 'manual'>('testbed');

  const [scanResults, setScanResults] = useState<Record<string, InfraScanResult>>({});
  const [isScanning, setIsScanning] = useState(false);

  const [testbedOnion, setTestbedOnion] = useState<string>('');
  const [onionTargets, setOnionTargets] = useState<Record<string, string>>({});

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [newTargetModalOpen, setNewTargetModalOpen] = useState(false);
  const [crawlModalOpen, setCrawlModalOpen] = useState(false);

  const [liveGraphData, setLiveGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const [liveTimeline, setLiveTimeline] = useState<TimelineEvent[] | null>(null);
  const [liveSignals, setLiveSignals] = useState<AttributionSignalBreakdown[] | null>(null);

  // Master refresh function to synchronize all intelligence from the backend
  const refreshAllData = useCallback(async () => {
    try {
      // 1. Fetch Onion Targets
      const targetsRes = await fetch('http://localhost:8000/api/onion-targets');
      if (targetsRes.ok) {
        const tData = await targetsRes.json();
        if (tData.targets) {
          setOnionTargets(tData.targets);
          if (tData.targets.testbed && !testbedOnion) {
            setTestbedOnion(tData.targets.testbed);
            setActiveTarget(tData.targets.testbed);
          }
        }
      }

      // 2. Fetch Cases (derived from crawl data)
      const casesRes = await fetch('http://localhost:8000/api/cases');
      if (casesRes.ok) {
        const cData = await casesRes.json();
        if (Array.isArray(cData) && cData.length > 0) {
          setCases(cData);
          setSelectedCase((prev) => {
            const found = cData.find((item: ThreatActorCase) => item.id === prev.id);
            return found || cData[0];
          });
        }
      }

      // 3. Fetch Entity Graph
      const graphRes = await fetch('http://localhost:8000/api/entity-graph');
      if (graphRes.ok) {
        const gData = await graphRes.json();
        if (gData.nodes && gData.nodes.length > 0) {
          setLiveGraphData(gData);
        }
      }

      // 4. Fetch Timeline
      const timeRes = await fetch('http://localhost:8000/api/timeline');
      if (timeRes.ok) {
        const timeData = await timeRes.json();
        if (Array.isArray(timeData) && timeData.length > 0) {
          setLiveTimeline(timeData);
        }
      }

      // 5. Fetch Fusion Signals
      const sigRes = await fetch('http://localhost:8000/api/fusion-signals');
      if (sigRes.ok) {
        const sigData = await sigRes.json();
        if (Array.isArray(sigData) && sigData.length > 0) {
          setLiveSignals(sigData);
        }
      }
    } catch (err) {
      console.warn('Backend not yet reachable on localhost:8000:', err);
    }
  }, [testbedOnion]);

  // Initial load
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

  // Re-fetch dynamic fusion signals whenever active case changes or Evidence tab is active
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
  }, [selectedCase?.id, activeTab]);

  // Active target data with fallback to mock data if backend not yet crawled
  const currentScan = scanResults[selectedCase.id];
  const currentGraphData =
    liveGraphData ?? MOCK_GRAPH_DATA[selectedCase.id] ?? MOCK_GRAPH_DATA['case-venom-01'];
  const isLiveGraph = liveGraphData !== null;

  const currentTimeline =
    liveTimeline ?? MOCK_TIMELINES[selectedCase.id] ?? MOCK_TIMELINES['case-venom-01'];
  const currentSignals =
    liveSignals ?? MOCK_FUSION_SIGNALS[selectedCase.id] ?? MOCK_FUSION_SIGNALS['case-venom-01'];

  // Run infrastructure scan through the real backend
  const handleRunScan = async (onionUrl: string) => {
    if (!onionUrl) {
      console.error('No Tor target onion address available');
      return;
    }

    setIsScanning(true);

    try {
      const res = await fetch('http://localhost:8000/api/infra-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onion_url: onionUrl,
        }),
      });

      if (!res.ok) {
        throw new Error(`Scan API returned ${res.status}`);
      }

      const data: InfraScanResult = await res.json();

      setScanResults(prev => ({
        ...prev,
        [selectedCase.id]: data,
      }));
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
      setActiveTab('infra');
    }
  };

  const handleCreateTarget = (newCase: ThreatActorCase) => {
    setCases(prev => [newCase, ...prev]);
    setSelectedCase(newCase);
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col font-sans">

      {/* Top Main Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cases={cases}
        selectedCase={selectedCase}
        setSelectedCase={setSelectedCase}
        onOpenExport={() => setExportModalOpen(true)}
        onOpenNewTarget={() => setNewTargetModalOpen(true)}
        onOpenCrawlModal={() => setCrawlModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">

        {activeTab === 'overview' && (
          <CaseOverview
            targetCase={selectedCase}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onRunScan={() => handleRunScan(activeTarget)}
          />
        )}

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

        {activeTab === 'infra' && (
          <ModuleInfraScan
            selectedCase={selectedCase}
            scanResult={scanResults[selectedCase.id]}
            onRunScan={handleRunScan}
            isScanning={isScanning}
            onionTargets={onionTargets}
          />
        )}

        {activeTab === 'graph' && (
          <ModuleEntityGraph
            selectedCase={selectedCase}
            graphData={currentGraphData}
            isLiveGraph={isLiveGraph}
          />
        )}

        {activeTab === 'stylometry' && (
          <ModuleStylometry
            selectedCase={selectedCase}
          />
        )}

        {activeTab === 'fusion' && (
          <FusionLayer
            selectedCase={selectedCase}
            signals={currentSignals}
            onOpenExport={() => setExportModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'timeline' && (
          <InvestigationTimeline
            selectedCase={selectedCase}
            timelineEvents={currentTimeline}
          />
        )}
      </main>

      {/* Operational Status Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-4 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-semibold tracking-wide">
              OBSIDIAN MULTI-SIGNAL ATTRIBUTION PLATFORM
            </span>
            <span className="text-slate-700">&bull;</span>
            <span className="text-slate-400">
              7 Active Sandboxed Tor Hidden Services Online
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-slate-400">
              NTRO PS-26151 · Docker WSL2 · SOCKS5 :9050
            </span>
          </div>
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
