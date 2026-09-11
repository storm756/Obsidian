import React, { useState } from 'react';
import { X, Plus, Shield, Globe, Key, Wallet, AlertCircle } from 'lucide-react';
import { ThreatActorCase } from '../types';

interface NewTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTarget: (newCase: ThreatActorCase) => void;
}

export const NewTargetModal: React.FC<NewTargetModalProps> = ({
  isOpen,
  onClose,
  onCreateTarget,
}) => {
  const [handle, setHandle] = useState('');
  const [codename, setCodename] = useState('');
  const [category, setCategory] = useState('Narcotics & Precursors');
  const [onionUrl, setOnionUrl] = useState('');
  const [pgpKey, setPgpKey] = useState('');
  const [cryptoWallet, setCryptoWallet] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;

    const newCase: ThreatActorCase = {
      id: `case-custom-${Date.now()}`,
      caseNumber: `CHR-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`,
      codename: codename.trim().toUpperCase() || 'OPERATION-PHANTOM',
      primaryHandle: handle.trim(),
      aliases: [handle.trim()],
      threatLevel: 'HIGH',
      primaryCategory: category,
      marketplaces: ['Bohemia', 'Dread Forum'],
      firstObserved: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      status: 'PROBABLE',
      suspectedRealIdentity: {
        name: 'Under Investigation',
        location: 'Pending Correlation',
        clearnetIP: 'Scanning...',
        isp: 'Telemetry Pending',
        asn: 'Pending Lookup',
      },
      summary: notes.trim() || 'Custom target profile ingested into Obsidian multi-signal correlation pipeline.',
      evidenceCount: 4,
      scores: {
        infrastructure: 85,
        entityGraph: 80,
        stylometry: 78,
        composite: 81.5,
      },
      onionServices: onionUrl.trim() ? [onionUrl.trim()] : ['customtarget99201msn3819028.onion'],
      pgpKeys: pgpKey.trim() ? [pgpKey.trim()] : ['0xCUSTOM4096HEXKEY01 (RSA 4096)'],
      cryptoWallets: cryptoWallet.trim() ? [cryptoWallet.trim()] : ['bc1qcustomtargetmockwallet11928374'],
    };

    onCreateTarget(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070a]/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="surface-card rounded-lg w-full max-w-lg shadow-2xl overflow-hidden font-mono border border-[#1a2436]">
        <div className="p-4 border-b border-[#161e30] flex items-center justify-between bg-[#070a10]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ingest Custom Investigation Target</h3>
              <p className="text-[10px] text-slate-500">Initialize a new de-anonymization target profile</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-500 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="text-slate-400 text-[10px] block mb-1 uppercase font-semibold">PRIMARY DARKNET HANDLE *</label>
            <input
              type="text"
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. DarkReaper_Direct"
              className="w-full bg-[#070a10] border border-[#161e30] rounded-md px-3 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono text-xs placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-[10px] block mb-1 uppercase font-semibold">OPERATION CODENAME</label>
              <input
                type="text"
                value={codename}
                onChange={(e) => setCodename(e.target.value)}
                placeholder="e.g. REAPER-NEXUS"
                className="w-full bg-[#070a10] border border-[#161e30] rounded-md px-3 py-1.5 text-amber-300 focus:outline-none focus:border-amber-500 uppercase font-mono text-xs placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="text-slate-400 text-[10px] block mb-1 uppercase font-semibold">CRIME CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#070a10] border border-[#161e30] rounded-md px-3 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              >
                <option value="Narcotics & Precursors">Narcotics &amp; Precursors</option>
                <option value="Ransomware & Laundering">Ransomware &amp; Laundering</option>
                <option value="Stolen Credentials & Data">Stolen Credentials &amp; Data</option>
                <option value="Academic Testbed">Academic Testbed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-[10px] block mb-1 uppercase font-semibold">SUSPECT HIDDEN SERVICE (.ONION)</label>
            <input
              type="text"
              value={onionUrl}
              onChange={(e) => setOnionUrl(e.target.value)}
              placeholder="e.g. reaperdirect4vj7kmk...onion"
              className="w-full bg-[#070a10] border border-[#161e30] rounded-md px-3 py-1.5 text-violet-300 focus:outline-none focus:border-violet-500 font-mono text-xs placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="text-slate-400 text-[10px] block mb-1 uppercase font-semibold">PGP KEY FINGERPRINT OR ID</label>
            <input
              type="text"
              value={pgpKey}
              onChange={(e) => setPgpKey(e.target.value)}
              placeholder="e.g. 0x88FE2109A440182C (RSA 4096)"
              className="w-full bg-[#070a10] border border-[#161e30] rounded-md px-3 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-xs placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="text-slate-400 text-[10px] block mb-1 uppercase font-semibold">CRYPTO WALLET ADDRESS</label>
            <input
              type="text"
              value={cryptoWallet}
              onChange={(e) => setCryptoWallet(e.target.value)}
              placeholder="e.g. bc1q... or 888t..."
              className="w-full bg-[#070a10] border border-[#161e30] rounded-md px-3 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono text-xs placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="text-slate-400 text-[10px] block mb-1 uppercase font-semibold">INVESTIGATIVE SUMMARY &amp; INTEL</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Initial intelligence findings from forum crawl or marketplace listing..."
              className="w-full bg-[#070a10] border border-[#161e30] rounded-md px-3 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-xs resize-none placeholder:text-slate-600"
            />
          </div>

          <div className="pt-3 border-t border-[#161e30] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition-all border border-amber-300/40 active:scale-95 glow-amber"
            >
              INGEST TARGET CASE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
