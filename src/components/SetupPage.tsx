// src/components/SetupPage.tsx
import React, { useState } from 'react';
import { Shield, Globe, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';

interface SetupPageProps {
  testbedOnion: string;
  activeTarget: string;
  activeMode: 'testbed' | 'manual';
  onSetTarget: (onionUrl: string, mode: 'testbed' | 'manual') => void;
}

// Tor v3 hidden service address: 56-char base32 string + .onion
const ONION_V3_REGEX = /^[a-z2-7]{56}\.onion$/i;

export const SetupPage: React.FC<SetupPageProps> = ({
  testbedOnion,
  activeTarget,
  activeMode,
  onSetTarget,
}) => {
  const [mode, setMode] = useState<'testbed' | 'manual'>(activeMode);
  const [manualUrl, setManualUrl] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleApplyTestbed = () => {
    if (!testbedOnion) return;
    onSetTarget(testbedOnion, 'testbed');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
            SETUP
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Scanner Target Configuration
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
          Configure which Tor hidden service the Infrastructure Correlation Engine connects
          to. The scanning pipeline — Tor SOCKS5 proxy, misconfiguration detection, clearnet
          correlation — is identical regardless of target; only the destination changes.
        </p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setMode('testbed')}
          className={`text-left bg-[#121216] border rounded-2xl p-5 shadow-sm transition-colors ${
            mode === 'testbed'
              ? 'border-emerald-500/50'
              : 'border-white/[0.07] hover:border-white/[0.15]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-white">Simulated Testbed</span>
            </div>
            {mode === 'testbed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed mb-3">
            Self-hosted, sandboxed Tor hidden service with deliberately planted
            misconfigurations. Safe, legal, and reproducible.
          </p>
          <div className="bg-[#0b0b0e] border border-white/[0.05] rounded-lg p-2.5 font-mono text-[11px] text-emerald-300 break-all">
            {testbedOnion || 'Loading Tor testbed hostname...'}
          </div>
        </button>

        <button
          onClick={() => setMode('manual')}
          className={`text-left bg-[#121216] border rounded-2xl p-5 shadow-sm transition-colors ${
            mode === 'manual'
              ? 'border-amber-500/50'
              : 'border-white/[0.07] hover:border-white/[0.15]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-white">Manual Onion Target</span>
            </div>
            {mode === 'manual' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Enter any Tor v3 hidden service address directly. Restricted to authorized,
            sandboxed testing environments only.
          </p>
        </button>
      </div>

      {/* Active mode panel */}
      {mode === 'testbed' ? (
        <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Testbed Connection</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#0b0b0e] border border-white/[0.08] rounded-xl px-3 py-2.5 font-mono text-xs text-zinc-300 break-all">
              {testbedOnion || 'Loading Tor testbed hostname...'}
            </div>
            <button
              onClick={handleApplyTestbed}
              disabled={!testbedOnion}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              Set as Active Target
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 mt-3">
            Automatically loaded from the Docker Tor testbed container via{' '}
            <code className="text-zinc-400">/api/testbed-target</code>.
          </p>
        </div>
      ) : (
        <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Manual Target Entry</h3>
          </div>

          <label className="text-[11px] text-zinc-400 block mb-1.5 font-medium">
            TOR V3 HIDDEN SERVICE ADDRESS
          </label>
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => {
              setManualUrl(e.target.value);
              setValidationError(null);
            }}
            placeholder="e.g. vjkzvwwhgzy4bp57rmobgyodh7h4lhkwfgjjfg4briiotl4ylvgwqsqd.onion"
            className="w-full bg-[#0b0b0e] border border-white/[0.08] rounded-xl px-3 py-2.5 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500/50 mb-3"
          />

          <label className="flex items-start gap-2.5 mb-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 accent-amber-500"
            />
            <span className="text-[11px] text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
              I confirm this target is an authorized, sandboxed environment for security
              testing, and not a live, unauthorized third-party service.
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
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all"
          >
            Set as Active Target
          </button>
        </div>
      )}

      {/* Active target confirmation banner */}
      {activeTarget && (
        <div className="bg-[#0d1f17] border border-emerald-800/40 rounded-2xl p-5 shadow-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-emerald-300">
              Active Scan Target Configured
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-0.5 break-all">
              {activeTarget}{' '}
              <span className="text-zinc-600">·</span> Mode:{' '}
              {activeMode === 'testbed' ? 'Simulated Testbed' : 'Manual Target'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};