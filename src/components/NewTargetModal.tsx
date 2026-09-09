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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0c]/80 backdrop-blur-sm p-4">
      <div className="bg-[#141417] border border-[#1e1e24] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-mono">
        <div className="p-4 border-b border-[#1e1e24] flex items-center justify-between bg-[#0e0e11]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/60">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create Custom Investigation Target</h3>
              <p className="text-[11px] text-gray-400">Initialize a new de-anonymization target profile</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="text-gray-400 block mb-1">PRIMARY DARKNET HANDLE *</label>
            <input
              type="text"
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. DarkReaper_Direct"
              className="w-full bg-[#0c0c0e] border border-[#1e1e24] rounded-lg px-3 py-2 text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 block mb-1">OPERATION CODENAME</label>
              <input
                type="text"
                value={codename}
                onChange={(e) => setCodename(e.target.value)}
                placeholder="e.g. REAPER-NEXUS"
                className="w-full bg-[#0c0c0e] border border-[#1e1e24] rounded-lg px-3 py-2 text-amber-300 focus:outline-none focus:border-amber-500 uppercase"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1">CRIME CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0c0c0e] border border-[#1e1e24] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Narcotics & Precursors">Narcotics &amp; Precursors</option>
                <option value="Ransomware & Laundering">Ransomware &amp; Laundering</option>
                <option value="Stolen Credentials & Data">Stolen Credentials &amp; Data</option>
                <option value="Academic Testbed">Academic Testbed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-gray-400 block mb-1">SUSPECT HIDDEN SERVICE (.ONION)</label>
            <input
              type="text"
              value={onionUrl}
              onChange={(e) => setOnionUrl(e.target.value)}
              placeholder="e.g. reaperdirect4vj7kmk...onion"
              className="w-full bg-[#0c0c0e] border border-[#1e1e24] rounded-lg px-3 py-2 text-purple-300 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">PGP KEY FINGERPRINT OR ID</label>
            <input
              type="text"
              value={pgpKey}
              onChange={(e) => setPgpKey(e.target.value)}
              placeholder="e.g. 0x88FE2109A440182C (RSA 4096)"
              className="w-full bg-[#0c0c0e] border border-[#1e1e24] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">CRYPTO WALLET ADDRESS</label>
            <input
              type="text"
              value={cryptoWallet}
              onChange={(e) => setCryptoWallet(e.target.value)}
              placeholder="e.g. bc1q... or 888t..."
              className="w-full bg-[#0c0c0e] border border-[#1e1e24] rounded-lg px-3 py-2 text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">INVESTIGATIVE SUMMARY &amp; INTEL</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Initial intelligence findings from forum crawl or marketplace listing..."
              className="w-full bg-[#0c0c0e] border border-[#1e1e24] rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-3 border-t border-[#1e1e24] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#1a1a1f] hover:bg-[#25252d] text-gray-300 transition border border-[#1e1e24]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            >
              Ingest Target Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
