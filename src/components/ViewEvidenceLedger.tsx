import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  Filter, 
  ExternalLink, 
  Copy, 
  Check, 
  Key, 
  Coins, 
  Hash, 
  Clock, 
  FileText, 
  Code2, 
  Table,
  CheckCircle2
} from 'lucide-react';
import { ForensicEntity } from './ForensicInspector';
import { ThreatActorCase } from '../types';

interface ViewEvidenceLedgerProps {
  selectedCase: ThreatActorCase;
  onSelectEntity: (entity: ForensicEntity) => void;
  onExportReport: (format: 'pdf' | 'stix' | 'csv') => void;
}

export interface RawListing {
  id: string;
  url: string;
  hostname: string;
  source_site: string;
  handle: string;
  category: string;
  pgp_key?: string;
  wallet_address?: string;
  content_hash: string;
  timestamp: string;
  extracted_at: string;
  mcda_score: number;
}

// 55 Benchmark Forensic Listing Receipts (when live API is offline)
const GENERATE_BENCHMARK_LISTINGS = (): RawListing[] => {
  const platforms = ['Market Alpha (Aegis)', 'SilkBoard Forum', 'BlackVault Escrow', 'CipherPaste', 'Hydra Archive'];
  const handles = ['VenomVendor', 'Noxious_Direct', 'CryptaVault', 'ShadowBroker_77', 'LabSynthetic_Actor_1', 'GhostTest_Admin', 'KryptonEx_Admin'];
  const categories = ['Narcotics & Precursors', 'Ransomware Proceeds', 'Escrow Guarantee', 'OpSec Breach', 'Synthetic Testbed Data'];
  const wallets = [
    'bc1q9v7kmw201994xza0183zzmm3291882a',
    '888tNk919920192837482910293847561829304958671920394857618293049',
    'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    'bc1qdevleak0029384719283748192837481928374'
  ];
  const pgpKeys = [
    '0x7A94B3C2D812E55A',
    '0xC5019A82D1E43391',
    '0xAE99120491823741',
    '0x3F88210928374129'
  ];

  const listings: RawListing[] = [];
  for (let i = 1; i <= 55; i++) {
    const handle = handles[(i - 1) % handles.length];
    const platform = platforms[(i - 1) % platforms.length];
    const category = categories[(i - 1) % categories.length];
    const wallet = wallets[(i - 1) % wallets.length];
    const pgp = pgpKeys[(i - 1) % pgpKeys.length];
    const day = (10 - (i % 8)).toString().padStart(2, '0');
    const hash = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b785${(i * 1337).toString(16).padStart(6, '0')}`;
    const score = 88 + (i % 11);

    listings.push({
      id: `LST-2024-${(1000 + i).toString()}`,
      url: `http://5ddoqqirppgbbl3rgl7octcxixxzrarvhl5v6s65ycseillxpignm6ad.onion/listing/${1000 + i}`,
      hostname: '5ddoqqirppgbbl3rgl7octcxixxzrarvhl5v6s65ycseillxpignm6ad.onion',
      source_site: platform,
      handle,
      category,
      pgp_key: pgp,
      wallet_address: wallet,
      content_hash: hash,
      timestamp: `2024-09-${day} 14:${(i % 59).toString().padStart(2, '0')}:00 UTC`,
      extracted_at: `2024-09-${day} 14:${(i % 59).toString().padStart(2, '0')}:12 UTC`,
      mcda_score: score
    });
  }
  return listings;
};

export const ViewEvidenceLedger: React.FC<ViewEvidenceLedgerProps> = ({
  selectedCase,
  onSelectEntity,
  onExportReport,
}) => {
  const [listings, setListings] = useState<RawListing[]>(GENERATE_BENCHMARK_LISTINGS());
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch live crawled listings from backend if available
  useEffect(() => {
    fetch('http://localhost:8000/api/listings')
      .then(res => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: RawListing[] = data.map((d: any, idx: number) => ({
            id: d.id ? `LST-${d.id}` : `LST-LIVE-${1000 + idx}`,
            url: d.url || 'http://127.0.0.1:9050',
            hostname: d.hostname || 'onion-target',
            source_site: d.source_site || 'Market Alpha',
            handle: d.handle || 'Unknown Vendor',
            category: d.category || 'Forensic Extraction',
            pgp_key: d.pgp_key,
            wallet_address: d.wallet_address,
            content_hash: d.content_hash || 'a184f7b8c09192e10084c7a94b3c2d812e55a909123847a94b3c2d812e55a409',
            timestamp: d.timestamp || '2024-09-11 12:00:00 UTC',
            extracted_at: d.extracted_at || '2024-09-11 12:00:15 UTC',
            mcda_score: 92
          }));
          setListings(mapped);
        }
      })
      .catch(() => {
        // Retain 55 benchmark listings
      });
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      const matchesPlatform = platformFilter === 'ALL' || item.source_site.toLowerCase().includes(platformFilter.toLowerCase());
      if (!matchesPlatform) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return item.handle.toLowerCase().includes(q) ||
             item.id.toLowerCase().includes(q) ||
             (item.wallet_address && item.wallet_address.toLowerCase().includes(q)) ||
             (item.pgp_key && item.pgp_key.toLowerCase().includes(q)) ||
             item.content_hash.toLowerCase().includes(q);
    });
  }, [listings, searchQuery, platformFilter]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleInspectRow = (item: RawListing) => {
    onSelectEntity({
      id: item.id,
      type: 'listing',
      label: `${item.handle} Listing (${item.id})`,
      handle: item.handle,
      category: item.category,
      threatLevel: item.mcda_score >= 95 ? 'CRITICAL' : 'HIGH',
      deterministicScore: item.mcda_score,
      aiScore: 90,
      pgpKeyId: item.pgp_key,
      walletAddress: item.wallet_address,
      sourceUrl: item.url,
      htmlHash: item.content_hash,
      firstSeen: item.timestamp,
      lastSeen: item.extracted_at,
      rawPayload: `[RAW_HTML_EXTRACT]
Listing ID: ${item.id}
Source Platform: ${item.source_site}
Vendor: ${item.handle}
Category: ${item.category}
PGP Key: ${item.pgp_key || 'None'}
Wallet Address: ${item.wallet_address || 'None'}
SHA-256 Digest: ${item.content_hash}
Ingestion Timestamp: ${item.extracted_at}
Obsidian MCDA Attributed Score: ${item.mcda_score}%`
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Toolbar */}
      <div className="p-3 rounded-md bg-[#121215] border border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2 font-mono text-xs">
          <div className="flex-1 flex items-center bg-[#09090b] border border-zinc-800 rounded px-2.5 py-1.5 focus-within:border-zinc-700">
            <Search className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by handle, wallet address, PGP fingerprint, or SHA-256 hash..."
              className="flex-1 bg-transparent text-zinc-200 outline-none font-mono text-xs placeholder:text-zinc-600"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-zinc-300 text-[10px]">
                ✕
              </button>
            )}
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2.5 py-1.5 text-xs outline-none cursor-pointer"
          >
            <option value="ALL">All Platforms ({listings.length})</option>
            <option value="Market Alpha">Market Alpha</option>
            <option value="SilkBoard">SilkBoard Forum</option>
            <option value="BlackVault">BlackVault Escrow</option>
            <option value="CipherPaste">CipherPaste</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onExportReport('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-mono text-xs transition-colors"
          >
            <Table className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onExportReport('stix')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-mono text-xs transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
            <span>Export STIX 2.1</span>
          </button>
        </div>
      </div>

      {/* Dense Forensic Audit Table */}
      <div className="rounded-md bg-[#121215] border border-zinc-800/80 overflow-hidden">
        <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <span className="text-xs font-mono font-semibold uppercase text-zinc-200">
              Evidence Provenance Ledger &amp; Cryptographic Receipts
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            Showing {filteredListings.length} of {listings.length} forensic items
          </span>
        </div>

        <div className="overflow-x-auto max-h-[620px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[#0c0c0e] z-10">
              <tr className="border-b border-zinc-800 font-mono text-[11px] text-zinc-400">
                <th className="py-2 px-3 font-medium">Listing ID</th>
                <th className="py-2 px-3 font-medium">Entity Handle</th>
                <th className="py-2 px-3 font-medium">Marketplace / Host</th>
                <th className="py-2 px-3 font-medium">Extracted UTC</th>
                <th className="py-2 px-3 font-medium">Crypto Wallets</th>
                <th className="py-2 px-3 font-medium">PGP Fingerprint</th>
                <th className="py-2 px-3 font-medium">SHA-256 Digest</th>
                <th className="py-2 px-3 font-medium">MCDA Score</th>
                <th className="py-2 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredListings.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleInspectRow(item)}
                  className="hover:bg-zinc-900/60 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3 font-mono text-zinc-400 font-medium text-[11px]">
                    {item.id}
                  </td>
                  <td className="py-2 px-3 font-medium text-zinc-100 font-mono">
                    {item.handle}
                  </td>
                  <td className="py-2 px-3 text-zinc-300 text-xs">
                    {item.source_site}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-zinc-400">
                    {item.extracted_at}
                  </td>
                  <td className="py-2 px-3 font-mono text-emerald-400 text-[11px] max-w-[140px] truncate select-all">
                    {item.wallet_address || '—'}
                  </td>
                  <td className="py-2 px-3 font-mono text-amber-400 text-[11px] select-all">
                    {item.pgp_key || '—'}
                  </td>
                  <td className="py-2 px-3 font-mono text-zinc-400 text-[10px] select-all">
                    {item.content_hash.substring(0, 16)}...
                  </td>
                  <td className="py-2 px-3 font-mono font-semibold text-emerald-400">
                    {item.mcda_score}%
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInspectRow(item);
                      }}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
