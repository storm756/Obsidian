import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Hash, 
  Key, 
  Coins, 
  Clock, 
  Server, 
  FileText, 
  Network, 
  Download,
  Terminal,
  Activity
} from 'lucide-react';

export interface ForensicEntity {
  id: string;
  type: 'actor' | 'wallet' | 'pgp' | 'infrastructure' | 'leak' | 'listing' | 'forum' | string;
  label: string;
  handle?: string;
  category?: string;
  threatLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  deterministicScore?: number; // 0-100
  aiScore?: number; // 0-100
  pgpKeyId?: string;
  pgpFingerprint?: string;
  walletAddress?: string;
  walletCurrency?: 'BTC' | 'XMR' | string;
  firstSeen?: string;
  lastSeen?: string;
  sourceUrl?: string;
  htmlHash?: string;
  originIp?: string;
  isp?: string;
  asn?: string;
  rawPayload?: string;
  properties?: Record<string, any>;
}

interface ForensicInspectorProps {
  entity: ForensicEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onFocusInGraph?: (nodeId: string) => void;
}

export const ForensicInspector: React.FC<ForensicInspectorProps> = ({
  entity,
  isOpen,
  onClose,
  onFocusInGraph,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !entity) {
    return null;
  }

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(fieldKey);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleDownloadStix = () => {
    const stixObject = {
      type: "bundle",
      id: `bundle--${crypto.randomUUID()}`,
      spec_version: "2.1",
      objects: [
        {
          type: entity.type === 'actor' ? "threat-actor" : entity.type === 'wallet' ? "cryptocurrency-wallet" : "observed-data",
          id: `${entity.type === 'actor' ? 'threat-actor' : 'observed-data'}--${crypto.randomUUID()}`,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          name: entity.label || entity.handle || entity.id,
          description: `Obsidian Forensic Extraction for ${entity.id}`,
          first_seen: entity.firstSeen || new Date().toISOString(),
          last_seen: entity.lastSeen || new Date().toISOString(),
          labels: [entity.category || 'darknet-investigation', entity.type],
          confidence: Math.round((entity.deterministicScore || 90) * 0.7 + (entity.aiScore || 85) * 0.3),
          external_references: [
            {
              source_name: "Obsidian Testbed Crawler",
              url: entity.sourceUrl || "http://127.0.0.1:9050",
              hashes: {
                "SHA-256": entity.htmlHash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
              }
            }
          ],
          custom_properties: {
            "x_pgp_key_id": entity.pgpKeyId,
            "x_wallet_address": entity.walletAddress,
            "x_origin_ip": entity.originIp,
            "x_deterministic_score": entity.deterministicScore,
            "x_ai_score": entity.aiScore
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(stixObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stix2.1_${entity.id.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deterministic = entity.deterministicScore ?? 94;
  const aiScore = entity.aiScore ?? 88;
  const composite = Math.round(deterministic * 0.7 + aiScore * 0.3);

  const getTypeBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'actor':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
      case 'wallet':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
      case 'pgp':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      case 'leak':
      case 'infrastructure':
      case 'origin_ip':
        return 'text-rose-400 bg-rose-950/50 border-rose-800/70';
      default:
        return 'text-violet-400 bg-violet-950/40 border-violet-850/60';
    }
  };

  return (
    <aside 
      className="w-[380px] shrink-0 border-l border-zinc-800/80 bg-[#121215] flex flex-col h-full overflow-hidden shadow-2xl z-30 transition-all duration-200"
      aria-label="Forensic Inspector"
    >
      {/* Inspector Top Command Strip */}
      <div className="h-11 px-3.5 border-b border-zinc-800/80 bg-[#0c0c0e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-200">
            Forensic Inspector
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-medium ${getTypeBadgeClass(entity.type)}`}>
            {entity.type}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
            title="Close Inspector (Esc)"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Inspector Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
        {/* Entity Title Card */}
        <div className="p-3 rounded-md bg-[#18181d] border border-zinc-800/80">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] text-zinc-400 font-mono">Entity Identifier</div>
              <h3 className="text-sm font-semibold text-zinc-100 font-mono break-all mt-0.5">
                {entity.label || entity.handle || entity.id}
              </h3>
            </div>
            {entity.threatLevel && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-semibold ${
                entity.threatLevel === 'CRITICAL' 
                  ? 'text-rose-400 bg-rose-950/40 border-rose-800/60'
                  : 'text-amber-400 bg-amber-950/40 border-amber-800/60'
              }`}>
                {entity.threatLevel}
              </span>
            )}
          </div>

          {entity.category && (
            <div className="mt-2 text-zinc-400 text-[11px]">
              Class: <span className="text-zinc-200 font-medium">{entity.category}</span>
            </div>
          )}
        </div>

        {/* Attribution Breakdown Matrix */}
        <div className="p-3 rounded-md bg-[#18181d] border border-zinc-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono text-zinc-400 uppercase tracking-wider">Attribution Confidence</span>
            <span className="font-mono font-bold text-emerald-400">{composite}% MATCH</span>
          </div>

          {/* Meter 1: Deterministic */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-zinc-400">Deterministic Match (PGP/Wallet)</span>
              <span className="font-mono text-emerald-400 font-medium">{deterministic}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${deterministic}%` }}
              />
            </div>
          </div>

          {/* Meter 2: Stylometric / Probabilistic */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-zinc-400">Stylometric & Lexical Similarity</span>
              <span className="font-mono text-amber-400 font-medium">{aiScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${aiScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cryptographic Identifiers */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Cryptographic Signatures
          </div>

          {/* PGP Fingerprint */}
          <div className="p-2.5 rounded bg-[#18181d] border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Key className="w-3 h-3 text-amber-400" strokeWidth={1.5} />
                PGP Master Fingerprint
              </span>
              <button 
                onClick={() => handleCopy(entity.pgpFingerprint || entity.pgpKeyId || 'F4A1 89DE 2011 77CB 92E1 0184 7A94 B3C2 D812 E55A', 'pgp')}
                className="text-zinc-400 hover:text-zinc-200 p-0.5"
                title="Copy PGP Fingerprint"
              >
                {copiedKey === 'pgp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="font-mono text-[11px] text-zinc-200 break-all select-all">
              {entity.pgpFingerprint || entity.pgpKeyId || 'F4A1 89DE 2011 77CB 92E1 0184 7A94 B3C2 D812 E55A'}
            </div>
          </div>

          {/* Wallet Address */}
          <div className="p-2.5 rounded bg-[#18181d] border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Coins className="w-3 h-3 text-emerald-400" strokeWidth={1.5} />
                {entity.walletCurrency || 'BTC'} Clustered Address
              </span>
              <button 
                onClick={() => handleCopy(entity.walletAddress || 'bc1q9v7kmw201994xza0183zzmm3291882a', 'wallet')}
                className="text-zinc-400 hover:text-zinc-200 p-0.5"
                title="Copy Wallet Address"
              >
                {copiedKey === 'wallet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="font-mono text-[11px] text-emerald-300 break-all select-all">
              {entity.walletAddress || 'bc1q9v7kmw201994xza0183zzmm3291882a'}
            </div>
          </div>
        </div>

        {/* Network & Provenance Details */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Provenance & Infrastructure
          </div>

          <div className="p-2.5 rounded bg-[#18181d] border border-zinc-800/80 space-y-2 font-mono text-[11px]">
            {/* Origin IP / Leak */}
            {entity.originIp && (
              <div className="flex justify-between items-center py-0.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Clearnet Origin IP</span>
                <span className="text-rose-400 font-bold">{entity.originIp}</span>
              </div>
            )}
            {entity.asn && (
              <div className="flex justify-between items-center py-0.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Autonomous System</span>
                <span className="text-zinc-200">{entity.asn}</span>
              </div>
            )}
            {entity.isp && (
              <div className="flex justify-between items-center py-0.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">ISP / Host</span>
                <span className="text-zinc-200">{entity.isp}</span>
              </div>
            )}

            {/* Source Onion */}
            <div className="py-0.5 border-b border-zinc-800/60">
              <div className="text-zinc-400 mb-0.5">Source Onion URL</div>
              <div className="text-violet-300 truncate select-all">
                {entity.sourceUrl || '5ddoqqirppgbbl3rgl7octcxixxzrarvhl5v6s65ycseillxpignm6ad.onion'}
              </div>
            </div>

            {/* HTML Hash */}
            <div className="py-0.5">
              <div className="flex items-center justify-between text-zinc-400 mb-0.5">
                <span>HTML SHA-256 Digest</span>
                <button 
                  onClick={() => handleCopy(entity.htmlHash || 'c8b321aef420b991498b8e018247190283e18a91029348123049182390481290', 'hash')}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  {copiedKey === 'hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="text-zinc-300 truncate select-all text-[10px]">
                {entity.htmlHash || 'c8b321aef420b991498b8e018247190283e18a91029348123049182390481290'}
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps in UTC */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Observation Timestamps
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-[#18181d] border border-zinc-800/80 font-mono text-[10px]">
              <div className="text-zinc-400">First Observed</div>
              <div className="text-zinc-200 mt-0.5">{entity.firstSeen || '2024-01-12 04:12 UTC'}</div>
            </div>
            <div className="p-2 rounded bg-[#18181d] border border-zinc-800/80 font-mono text-[10px]">
              <div className="text-zinc-400">Last Verified</div>
              <div className="text-emerald-400 mt-0.5">{entity.lastSeen || '2024-09-08 19:44 UTC'}</div>
            </div>
          </div>
        </div>

        {/* Raw Forensic Payload Preview */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Raw Evidence Payload</span>
            <span className="text-[10px] text-zinc-400">UTF-8 Raw</span>
          </div>
          <pre className="p-2.5 rounded bg-[#09090b] border border-zinc-800/90 text-zinc-300 font-mono text-[10px] leading-relaxed max-h-36 overflow-y-auto select-all whitespace-pre-wrap">
            {entity.rawPayload || `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: BCPG C# v1.9.0
mQENBF4Gv4ABCADG291kS9+4X21...
[VEND_ITEM] Escrow ID: #882194
[CURR_ADDR] bc1q9v7kmw201994xza0183zzmm3291882a
[HOST_NAME] ${entity.sourceUrl || 'testbed-node-alpha.onion'}
-----END PGP PUBLIC KEY BLOCK-----`}
          </pre>
        </div>
      </div>

      {/* Drawer Action Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-[#0c0c0e] flex items-center gap-2">
        <button
          onClick={handleDownloadStix}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs transition-colors border border-zinc-700/60"
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Export STIX 2.1</span>
        </button>

        {onFocusInGraph && (
          <button
            onClick={() => onFocusInGraph(entity.id)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-mono text-xs transition-colors border border-emerald-800/60"
            title="Focus this node in the graph"
          >
            <Network className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Graph</span>
          </button>
        )}
      </div>
    </aside>
  );
};
