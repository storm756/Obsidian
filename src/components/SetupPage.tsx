import React, { useState } from 'react';
import { 
  Shield, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  RefreshCw, 
  Server,
  Copy,
  Check
} from 'lucide-react';

interface SetupPageProps {
  testbedOnion: string;
  activeTarget: string;
  activeMode: 'testbed' | 'manual';
  onionTargets?: Record<string, string>;
  onSetTarget: (onionUrl: string, mode: 'testbed' | 'manual') => void;
  onOpenCrawlModal?: () => void;
}

// Tor v3 hidden service address: 56-char base32 string + .onion
const ONION_V3_REGEX = /^[a-z2-7]{56}\.onion$/i;

export const SetupPage: React.FC<SetupPageProps> = ({
  testbedOnion,
  activeTarget,
  activeMode,
  onionTargets = {},
  onSetTarget,
  onOpenCrawlModal,
}) => {
  const [mode, setMode] = useState<'testbed' | 'manual'>(activeMode);
  const [manualUrl, setManualUrl] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedOnion, setCopiedOnion] = useState<string | null>(null);

  const handleApplyTestbed = (url?: string) => {
    const target = url || testbedOnion;
    if (!target) return;
    onSetTarget(target, 'testbed');
  };

  const handleApplyManual = () => {
    const trimmed = manualUrl.trim();
    if (!ONION_V3_REGEX.test(trimmed)) {
      setValidationError(
        'Must be a valid Tor v3 .onion address (56-character base32 string + .onion)'
      );
      return;
    }
    if (!acknowledged) {
      setValidationError('You must confirm this target is authorized for scanning.');
      return;
    }
    setValidationError(null);
    onSetTarget(trimmed, 'manual');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOnion(id);
    setTimeout(() => setCopiedOnion(null), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="surface-card rounded-xl p-5 border border-[#1e273d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800">
              Testbed Environment
            </span>
            <span className="text-xs text-slate-400">
              7 V3 Hidden Services &middot; Local SOCKS5 Proxy
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Target Configuration &amp; Topology Hub</span>
            <Server className="w-4 h-4 text-blue-400" />
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed mt-1">
            Direct interface to sandboxed Tor v3 hidden services running in isolated local containers. Executes automated network reconnaissance, crawling, and cross-platform identity correlation without live network exposure.
          </p>
        </div>

        {onOpenCrawlModal && (
          <button
            onClick={onOpenCrawlModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Launch Multi-Onion Crawl</span>
          </button>
        )}
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setMode('testbed')}
          className={`text-left surface-card rounded-xl p-5 border transition-colors ${
            mode === 'testbed'
              ? 'border-blue-500 bg-[#121827]'
              : 'border-[#1e273d] hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-950/60 border border-blue-800 text-blue-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-white">Docker Multi-Onion Testbed</span>
            </div>
            {mode === 'testbed' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Self-hosted, sandboxed Tor hidden services spanning 7 distinct domains with realistic misconfigurations.
          </p>
          <div className="bg-[#0e121a] border border-[#1b2336] rounded-lg p-2.5 font-mono text-xs text-blue-300 break-all">
            {Object.keys(onionTargets).length > 0 ? `${Object.keys(onionTargets).length} Live Tor Services Configured` : testbedOnion || 'Loading Tor testbed hostname...'}
          </div>
        </button>

        <button
          onClick={() => setMode('manual')}
          className={`text-left surface-card rounded-xl p-5 border transition-colors ${
            mode === 'manual'
              ? 'border-blue-500 bg-[#121827]'
              : 'border-[#1e273d] hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-white">Manual Onion Target</span>
            </div>
            {mode === 'manual' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Enter any Tor v3 hidden service address directly. Restricted to authorized, sandboxed testing environments only.
          </p>
        </button>
      </div>

      {/* Active mode panel */}
      {mode === 'testbed' ? (
        <div className="surface-card rounded-xl p-5 border border-[#1e273d] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2336]">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Configured Tor Hidden Services in Testbed
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Port 80 &middot; SOCKS5: 127.0.0.1:9050
            </span>
          </div>

          {/* Grid of 7 onion targets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.entries(onionTargets) as [string, string][]).map(([svc, onion]) => {
              const isSelected = activeTarget === onion;
              return (
                <div
                  key={svc}
                  className={`bg-[#0e121a] border rounded-xl p-3.5 flex flex-col justify-between transition-colors ${
                    isSelected ? 'border-blue-500/80 bg-[#121827]' : 'border-[#1b2336] hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-blue-400" />
                        {svc}
                      </span>
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                          Online
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-slate-300 break-all mb-3 flex items-center justify-between gap-1 bg-[#090c12] p-2 rounded-lg border border-[#182030]">
                      <span className="truncate">{onion}</span>
                      <button
                        onClick={() => handleCopy(onion, svc)}
                        className="text-slate-400 hover:text-white p-0.5 rounded transition-colors shrink-0"
                        title="Copy onion address"
                      >
                        {copiedOnion === svc ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyTestbed(onion)}
                    className={`w-full py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white cursor-default'
                        : 'bg-[#141a28] hover:bg-[#1a2336] text-slate-200 border border-[#24304c]'
                    }`}
                  >
                    {isSelected ? 'Currently Selected' : 'Target This Service'}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 pt-2 border-t border-[#1b2336]">
            Discovered dynamically from Docker Tor hidden service directory via <code className="text-slate-200">/api/onion-targets</code>.
          </p>
        </div>
      ) : (
        <div className="surface-card rounded-xl p-5 border border-[#1e273d]">
          <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-[#1b2336]">
            <Radio className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Manual Target Entry</h3>
          </div>

          <label className="text-xs text-slate-300 block mb-1.5 font-medium">
            Tor v3 Hidden Service Address (.onion)
          </label>
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => {
              setManualUrl(e.target.value);
              setValidationError(null);
            }}
            placeholder="e.g. vjkzvwwhgzy4bp57rmobgyodh7h4lhkwfgjjfg4briiotl4ylvgwqsqd.onion"
            className="w-full bg-[#0e121a] border border-[#1b2336] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500 mb-3"
          />

          <label className="flex items-start gap-2.5 mb-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 accent-blue-500"
            />
            <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              I confirm this target is an authorized, sandboxed environment for security research, and not an unauthorized live service.
            </span>
          </label>

          {validationError && (
            <div className="flex items-start gap-2 bg-rose-950/40 border border-rose-800/40 rounded-lg p-3 mb-4">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
              <span className="text-xs text-rose-300">{validationError}</span>
            </div>
          )}

          <button
            onClick={handleApplyManual}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm"
          >
            Set as Active Target
          </button>
        </div>
      )}

      {/* Active target confirmation banner */}
      {activeTarget && (
        <div className="bg-[#0e1624] border border-blue-800/50 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">
                Active Recon Target Configured
              </div>
              <div className="text-xs text-slate-300 font-mono mt-0.5 break-all">
                {activeTarget}{' '}
                <span className="text-slate-600">&bull;</span> Mode:{' '}
                <strong className="text-white font-sans">{activeMode === 'testbed' ? 'Docker Multi-Onion Testbed' : 'Manual Target'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};