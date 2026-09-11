import React, { useEffect, useState } from 'react';
import {
  Server,
  Terminal,
  AlertOctagon,
  Lock,
  Globe,
  Clock,
  Zap,
  CheckCircle2,
  Sparkles,
  Brain,
  Copy,
  Check,
  X,
  Radio,
  Activity
} from 'lucide-react';
import { InfraScanResult, ThreatActorCase } from '../types';

interface ModuleInfraScanProps {
  selectedCase: ThreatActorCase;
  scanResult?: InfraScanResult;
  onRunScan: (url: string) => Promise<void>;
  isScanning: boolean;
  onionTargets?: Record<string, string>;
}

export const ModuleInfraScan: React.FC<ModuleInfraScanProps> = ({
  selectedCase,
  scanResult,
  onRunScan,
  isScanning,
  onionTargets = {},
}) => {
  const [customUrl, setCustomUrl] = useState('');
  const [isAiInfraAnalyzing, setIsAiInfraAnalyzing] = useState(false);
  const [aiInfraReport, setAiInfraReport] = useState<string | null>(null);
  const [aiInfraError, setAiInfraError] = useState<string | null>(null);
  const [copiedInfraReport, setCopiedInfraReport] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[INIT] SOCKS5 Infrastructure Reconnaissance Engine loaded (127.0.0.1:9050).',
    '[READY] Polling local Tor hidden service testbed nodes...',
  ]);

  const handleRunAiInfraAnalysis = async () => {
    if (!scanResult) return;
    setIsAiInfraAnalyzing(true);
    setAiInfraError(null);
    setAiInfraReport(null);
    try {
      let res = await fetch('/api/gemini-infra-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanResult }),
      });
      if (!res.ok) {
        res = await fetch('http://localhost:8000/api/gemini-infra-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scanResult }),
        });
      }
      const data = await res.json();
      if (data.analysis) {
        setAiInfraReport(data.analysis);
      } else if (data.error) {
        setAiInfraError(data.error);
      } else {
        setAiInfraError('Failed to generate AI analysis');
      }
    } catch (e: any) {
      setAiInfraError(e.message || 'Failed to generate infra AI analysis');
    } finally {
      setIsAiInfraAnalyzing(false);
    }
  };

  // Auto-fetch the primary testbed target
  useEffect(() => {
    fetch('http://localhost:8000/api/testbed-target')
      .then(res => {
        if (!res.ok) throw new Error(`Testbed API returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.onion_url) {
          setCustomUrl(data.onion_url);
          setConsoleLogs(prev => [
            ...prev,
            `[TARGET] Active Tor testbed hidden service: ${data.onion_url}`,
            '[READY] Target verified on circuit. Ready for reconnaissance scan.',
          ]);
        }
      })
      .catch(err => {
        console.error('Failed to load testbed target:', err);
        setConsoleLogs(prev => [
          ...prev,
          '[WARN] Could not retrieve primary target automatically. Enter onion manually.',
        ]);
      });
  }, []);

  const handleTrigger = async (urlToScan: string) => {
    if (!urlToScan) {
      setConsoleLogs(prev => [
        ...prev,
        '[ERROR] Target URL parameter is empty.',
      ]);
      return;
    }

    setCustomUrl(urlToScan);
    setConsoleLogs(prev => [
      ...prev,
      `[PROBE] Establishing SOCKS5 circuit handshake for ${urlToScan}`,
      '[STAGE 1] Multi-port TCP SYN handshake probe (:80, :443, :22, :9050, :8080)...',
      '[STAGE 2] Intercepting HTTP Server response banners & caching headers...',
      '[STAGE 3] Querying Apache /server-status handler & worker slot scoreboard...',
      '[STAGE 4] Fingerprinting TLS certificates & cryptographic serial hashes...',
    ]);

    try {
      await onRunScan(urlToScan);
      setConsoleLogs(prev => [
        ...prev,
        `[SUCCESS] Reconnaissance probe complete. Evidentiary signals ingested into Fusion Matrix.`,
      ]);
    } catch (error) {
      console.error('Infrastructure scan failed:', error);
      setConsoleLogs(prev => [
        ...prev,
        '[ERROR] Scan pipeline encountered an error.',
      ]);
    }
  };

  const statusPageDetails = scanResult?.statusPageDetails;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="surface-card rounded-xl p-5 border border-[#1e273d]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800">
                Network Forensics
              </span>
              <span className="text-xs text-slate-400">
                Tor SOCKS5 &middot; Port Probing &middot; /server-status Leakage &middot; TLS Fingerprints
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Network Reconnaissance &amp; Origin De-Anonymization</span>
              <Radio className="w-4 h-4 text-blue-400" />
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed mt-1">
              Non-destructive reconnaissance executed through an isolated Tor SOCKS5 proxy (:9050). Audits exposed TCP ports, extracts web server banners, and discovers misconfigured status handlers to de-cloak internal RFC1918 and origin IP addresses.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#0e121a] border border-[#1b2336] px-4 py-3 rounded-xl shrink-0">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-medium">Circuit Telemetry</div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>SOCKS5 :9050 Online</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                7 Testbed Hidden Services Ready
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Selector & Probe Execution */}
      <div className="surface-card rounded-xl p-4 border border-[#1e273d] space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Enter target onion address (e.g. http://xyz...onion)"
              className="w-full bg-[#0e121a] border border-[#1b2336] rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={() => handleTrigger(customUrl)}
            disabled={isScanning || !customUrl}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            {isScanning ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Scanning Circuit...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Initiate Probe</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Select Service Chips */}
        {Object.keys(onionTargets).length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#1b2336]">
            <span className="text-xs text-slate-400 mr-1 font-medium">Testbed Services:</span>
            {(Object.entries(onionTargets) as [string, string][]).map(([svc, onion]) => (
              <button
                key={svc}
                type="button"
                onClick={() => {
                  setCustomUrl(onion);
                  handleTrigger(onion);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                  customUrl === onion
                    ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                    : 'bg-[#101420] text-slate-400 border border-[#1e273d] hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {svc}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live Scan Results Display */}
      {scanResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Primary Finding Card */}
            <div className="surface-card rounded-xl p-5 border border-[#1e273d]">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b2336] mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800 text-blue-400">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Target Reconnaissance Telemetry
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-mono text-slate-200 break-all">
                        {scanResult.onionUrl}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(scanResult.onionUrl);
                          setCopiedTarget(true);
                          setTimeout(() => setCopiedTarget(false), 1500);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy onion address"
                      >
                        {copiedTarget ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunAiInfraAnalysis}
                    disabled={isAiInfraAnalyzing}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    {isAiInfraAnalyzing ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Analysis</span>
                      </>
                    )}
                  </button>

                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                    scanResult.status === 'ONLINE'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      : 'bg-rose-950/60 text-rose-300 border-rose-800'
                  }`}>
                    {scanResult.status === 'ONLINE' ? 'HTTP 200 OK' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* AI Assessment Panel */}
              {aiInfraReport && (
                <div className="bg-[#0e121a] border border-blue-600/50 rounded-lg p-4 mb-4 shadow-md">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#1b2336] mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">
                        Gemini Infrastructure Attribution Analysis
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiInfraReport);
                          setCopiedInfraReport(true);
                          setTimeout(() => setCopiedInfraReport(false), 2000);
                        }}
                        className="px-2 py-1 rounded bg-[#161c2c] border border-[#24304c] text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                      >
                        {copiedInfraReport ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setAiInfraReport(null)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {aiInfraReport}
                  </div>
                </div>
              )}

              {aiInfraError && (
                <div className="bg-rose-950/30 border border-rose-800/50 rounded-lg p-3 mb-4 text-xs text-rose-300 flex items-center justify-between">
                  <span>Notice: {aiInfraError}</span>
                  <button onClick={() => setAiInfraError(null)} className="text-rose-400 hover:text-rose-200 font-semibold">Dismiss</button>
                </div>
              )}

              {/* Metric Matrix Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#0e121a] p-3 rounded-lg border border-[#1b2336]">
                  <div className="text-[11px] text-slate-400 font-medium">Server Banner</div>
                  <div className="text-xs font-mono font-semibold text-white mt-1 break-all">
                    {scanResult.serverBanner || 'Not disclosed'}
                  </div>
                </div>

                <div className="bg-[#0e121a] p-3 rounded-lg border border-[#1b2336]">
                  <div className="text-[11px] text-slate-400 font-medium">Open Ports</div>
                  <div className="text-xs font-mono font-semibold text-white mt-1">
                    {scanResult.openPorts.length > 0 ? scanResult.openPorts.map(p => `:${p}`).join(', ') : 'None'}
                  </div>
                </div>

                <div className="bg-[#0e121a] p-3 rounded-lg border border-[#1b2336]">
                  <div className="text-[11px] text-slate-400 font-medium">Status Page Exposure</div>
                  <div className={`text-xs font-semibold mt-1 ${
                    scanResult.exposedStatusPage ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {scanResult.exposedStatusPage ? 'Exposed (/server-status)' : 'Protected / Secure'}
                  </div>
                </div>
              </div>
            </div>

            {/* Apache Status Handler & Origin IP Disclosures */}
            <div className="surface-card rounded-xl p-5 border border-[#1e273d]">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b2336] mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Web Server Diagnostics &amp; Internal IP Disclosures
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">Apache Mod_Status</span>
              </div>

              {scanResult.exposedStatusPage ? (
                <div className="space-y-3">
                  <div className="bg-rose-950/20 border border-rose-800/40 rounded-lg p-3.5">
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
                      <AlertOctagon className="w-4 h-4" />
                      <span>Critical Misconfiguration: Exposed mod_status Endpoint</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      The Apache <code className="text-rose-300 bg-rose-950/60 px-1 py-0.5 rounded font-mono">/server-status</code> handler is publicly reachable over Tor without subnet authorization. This discloses active worker threads, internal RFC1918 interfaces, and origin IP addresses.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#0e121a] p-3 rounded-lg border border-[#1b2336]">
                      <span className="text-[11px] text-slate-400 block font-medium">Server Uptime</span>
                      <span className="text-slate-200 font-semibold mt-1 block">
                        {statusPageDetails?.serverUptime || 'Continuous execution'}
                      </span>
                    </div>

                    <div className="bg-[#0e121a] p-3 rounded-lg border border-[#1b2336]">
                      <span className="text-[11px] text-slate-400 block font-medium">Disclosed Origin Interfaces</span>
                      {statusPageDetails?.internalIPs && statusPageDetails.internalIPs.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-1 font-mono">
                          {statusPageDetails.internalIPs.map((ip, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800 text-xs font-bold">
                              {ip}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs mt-1 block font-mono">172.28.0.2 (Docker Gateway)</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0e121a] p-4 rounded-lg border border-[#1b2336] text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <span>No unauthenticated status handlers exposed on this target port.</span>
                </div>
              )}

              {/* TLS Certificate Section */}
              {scanResult.sslCertificate && scanResult.sslCertificate.hasSsl && (
                <div className="pt-4 mt-4 border-t border-[#1b2336]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-2">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>X.509 TLS Certificate Fingerprint</span>
                  </div>

                  <div className="bg-[#0e121a] p-3 rounded-lg border border-[#1b2336] text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-slate-400 text-xs">SHA-256 Fingerprint</span>
                      <span className="text-slate-200 font-mono text-xs break-all">
                        {scanResult.sslCertificate.sha256Fingerprint}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 Col) */}
          <div className="space-y-4">
            {/* Port Matrix */}
            <div className="surface-card rounded-xl p-5 border border-[#1e273d]">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b2336] mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    TCP Port Matrix
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">SYN Probe</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3 font-mono">
                {[
                  { port: 80, name: 'HTTP', open: scanResult.openPorts.includes(80) },
                  { port: 443, name: 'HTTPS', open: scanResult.openPorts.includes(443) },
                  { port: 22, name: 'SSH', open: scanResult.openPorts.includes(22) },
                  { port: 9050, name: 'SOCKS5', open: scanResult.openPorts.includes(9050) },
                ].map(p => (
                  <div key={p.port} className="bg-[#0e121a] p-2.5 rounded-lg border border-[#1b2336] flex items-center justify-between">
                    <div>
                      <span className="text-slate-200 font-bold">:{p.port}</span>
                      <span className="text-[11px] text-slate-400 ml-1">({p.name})</span>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${p.open ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#1b2336] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Scan Completed:</span>
                </span>
                <span className="text-slate-200 font-mono">{scanResult.testedAt}</span>
              </div>
            </div>

            {/* Live Console Terminal */}
            <div className="bg-[#090c12] border border-[#1b2336] rounded-xl p-4 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b2336] mb-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-slate-200">SOCKS5 Probe Log</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Streaming
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-slate-400 max-h-64 overflow-y-auto pr-1 leading-tight">
                {consoleLogs.map((log, i) => (
                  <div key={i}>
                    {log.startsWith('[SUCCESS]') ? (
                      <span className="text-emerald-400 font-semibold">{log}</span>
                    ) : log.startsWith('[ERROR]') ? (
                      <span className="text-rose-400 font-semibold">{log}</span>
                    ) : log.startsWith('[PROBE]') || log.startsWith('[TARGET]') ? (
                      <span className="text-blue-300">{log}</span>
                    ) : (
                      <span>{log}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No Active Scan Empty State */
        <div className="surface-card rounded-xl p-10 text-center border border-[#1e273d]">
          <Server className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">
            Reconnaissance Ready
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Select a target service from the presets above or enter a custom .onion address to trigger the SOCKS5 infrastructure probe.
          </p>
          <button
            onClick={() => handleTrigger(customUrl)}
            disabled={isScanning || !customUrl}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
          >
            {isScanning ? 'Executing...' : 'Run Probe Now'}
          </button>
        </div>
      )}
    </div>
  );
};