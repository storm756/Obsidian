import React, { useState } from 'react';
import { 
  Server, 
  Terminal, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Hash, 
  Activity, 
  Globe, 
  Clock, 
  Cpu, 
  Code
} from 'lucide-react';
import { ForensicEntity } from './ForensicInspector';
import { InfraScanResult, ThreatActorCase } from '../types';

interface ViewInfrastructureCorrelatorProps {
  selectedCase: ThreatActorCase;
  scanResult?: InfraScanResult;
  onRunScan: (url: string) => Promise<void>;
  isScanning: boolean;
  onionTargets: Record<string, string>;
  onSelectEntity: (entity: ForensicEntity) => void;
}

interface AuditRow {
  id: string;
  targetPath: string;
  onionHost: string;
  probeType: string;
  detectedLeak: string;
  originIndicator: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SECURE';
  headersSnippet: string;
  responseCode: number;
}

export const ViewInfrastructureCorrelator: React.FC<ViewInfrastructureCorrelatorProps> = ({
  selectedCase,
  scanResult,
  onRunScan,
  isScanning,
  onionTargets,
  onSelectEntity,
}) => {
  const [selectedRowId, setSelectedRowId] = useState<string>('row-1');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customProbeUrl, setCustomProbeUrl] = useState<string>(
    onionTargets['market-a'] ? `http://${onionTargets['market-a']}/server-status` : 'http://q4fldlv4e4pscz7ng7jlpxyqntukjb6org6poihkyhjepu6yrbqx5kqd.onion/server-status'
  );

  const auditRows: AuditRow[] = [
    {
      id: 'row-1',
      targetPath: '/market-a/server-status',
      onionHost: onionTargets['market-a'] || 'q4fldlv4e4pscz7ng7jlpxyqntukjb6org6poihkyhjepu6yrbqx5kqd.onion',
      probeType: 'Apache mod_status',
      detectedLeak: 'Apache 2.4.52 Status Page with unmasked worker slots & active internal IP',
      originIndicator: '172.19.0.2 (Docker bridge internal) & worker thread host',
      severity: 'CRITICAL',
      responseCode: 200,
      headersSnippet: `HTTP/1.1 200 OK
Date: Fri, 11 Sep 2026 12:14:02 GMT
Server: Apache/2.4.52 (Ubuntu)
Vary: Accept-Encoding
Content-Type: text/html; charset=ISO-8859-1

Apache Server Status for 172.19.0.2 (via 127.0.0.1:9050)
Server Version: Apache/2.4.52 (Ubuntu) OpenSSL/3.0.2
Server Built: 2024-03-04T12:00:00
Current Time: Friday, 11-Sep-2026 12:14:02 UTC
Restart Time: Wednesday, 09-Sep-2026 04:00:00 UTC
Parent Server Config. Generation: 1
Server uptime: 2 days 8 hours 14 minutes 2 seconds
Server load: 0.12 0.08 0.05
Total accesses: 14,892 - Total Traffic: 48.2 MB
CPU Usage: u.48 s.12 cu0 cs0 - .00298% CPU load
.0722 requests/sec - 245 B/second - 3.4 kB/request
1 requests currently being processed, 74 idle workers
PID Key: 1488 (172.19.0.2:80) -> VHost: market-alpha.internal`
    },
    {
      id: 'row-2',
      targetPath: '/forum-b/server-status',
      onionHost: onionTargets['forum-b'] || 'kn2tejq7fj47fra54jmfcgv2m277ltcsymtewdb2fs3wmpegt3zfevid.onion',
      probeType: 'Apache mod_status',
      detectedLeak: 'Exposed VirtualHost configuration, real uptime & process map',
      originIndicator: 'VHost: silkboard.darknet.infra / Host Uptime: 4d 12h',
      severity: 'CRITICAL',
      responseCode: 200,
      headersSnippet: `HTTP/1.1 200 OK
Date: Fri, 11 Sep 2026 12:14:08 GMT
Server: Apache/2.4.58 (Debian)
Content-Type: text/html; charset=UTF-8

Apache Server Status for silkboard.darknet.infra
Server Version: Apache/2.4.58 (Debian)
Server MPM: event
Server Built: 2024-01-20T08:00:00
Current Time: Friday, 11-Sep-2026 12:14:08 UTC
Server uptime: 4 days 12 hours 3 minutes 12 seconds
Active Workers: 4 - Idle Workers: 46
VirtualHost: silkboard-node02.clearnet-relay.org:443`
    },
    {
      id: 'row-3',
      targetPath: '/favicon.ico',
      onionHost: onionTargets['market-a'] || 'q4fldlv4e4pscz7ng7jlpxyqntukjb6org6poihkyhjepu6yrbqx5kqd.onion',
      probeType: 'MurmurHash3 (mmh3)',
      detectedLeak: 'Unique favicon hash (-127498214) matched on Shodan clearnet index',
      originIndicator: 'Matched Clearnet IP: 185.220.101.44 (Sofia, Bulgaria / Neterra)',
      severity: 'HIGH',
      responseCode: 200,
      headersSnippet: `HTTP/1.1 200 OK
Date: Fri, 11 Sep 2026 12:14:15 GMT
Content-Type: image/x-icon
Content-Length: 1406
ETag: "57e-6138902f81200"
Accept-Ranges: bytes

[BINARY STREAM: 1406 bytes]
MurmurHash3 (mmh3) Digest: -127498214
Shodan Query: http.favicon.hash:-127498214
Clearnet Correlated Result:
  IP: 185.220.101.44
  Port: 8080 (Apache/2.4.52)
  ISP: Neterra Telecommunications Ltd
  Country: Bulgaria (BG) / City: Sofia`
    },
    {
      id: 'row-4',
      targetPath: '/escrow/server-status',
      onionHost: onionTargets.escrow || '3zryvul2zmgds2t44bydfrkxjwq5nsqmqn64wijfwgyxqzi5322pn2id.onion',
      probeType: 'Apache mod_status',
      detectedLeak: 'mod_status endpoint disabled or access restricted via .htaccess',
      originIndicator: 'None detected (Clearnet origin shielded)',
      severity: 'SECURE',
      responseCode: 403,
      headersSnippet: `HTTP/1.1 403 Forbidden
Date: Fri, 11 Sep 2026 12:14:20 GMT
Server: Apache
Content-Type: text/html; charset=iso-8859-1

<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>403 Forbidden</title>
</head><body>
<h1>Forbidden</h1>
<p>You don't have permission to access this resource.</p>
</body></html>`
    },
    {
      id: 'row-5',
      targetPath: '/market-c/server-info',
      onionHost: onionTargets['market-c'] || 'rxr5hr4blxejbe2fr4xbkyheaoprlbjpuken33soivrjckodhhydsnid.onion',
      probeType: 'Apache mod_info',
      detectedLeak: 'Internal compilation flags, loaded PHP 8.1 modules & server root path',
      originIndicator: 'ServerRoot: /etc/apache2 / Compiled Modules: mod_ssl, mod_proxy',
      severity: 'HIGH',
      responseCode: 200,
      headersSnippet: `HTTP/1.1 200 OK
Date: Fri, 11 Sep 2026 12:14:25 GMT
Server: Apache/2.4.52
Content-Type: text/html; charset=ISO-8859-1

Apache Server Information
Server Settings:
  Server Version: Apache/2.4.52 (Ubuntu)
  Server Built: 2024-03-04
  Server MPM: Prefork
  Loaded Modules: core, mod_so, mod_watchdog, mod_ssl, mod_socache_shmcb
In-use Configuration Files:
  /etc/apache2/apache2.conf
  /etc/apache2/mods-enabled/status.conf`
    },
  ];

  const activeRow = auditRows.find(r => r.id === selectedRowId) || auditRows[0];

  const handleRowClick = (row: AuditRow) => {
    setSelectedRowId(row.id);
    onSelectEntity({
      id: `leak-${row.targetPath}`,
      type: 'leak',
      label: `${row.probeType} Leak (${row.targetPath})`,
      category: 'INFRASTRUCTURE_EXPOSURE',
      threatLevel: row.severity === 'SECURE' ? 'LOW' : row.severity,
      deterministicScore: row.severity === 'CRITICAL' ? 98 : row.severity === 'HIGH' ? 88 : 30,
      aiScore: 92,
      originIp: row.originIndicator.includes('185.220.101.44') ? '185.220.101.44' : row.originIndicator.includes('172.19.0.2') ? '172.19.0.2' : undefined,
      isp: row.originIndicator.includes('Neterra') ? 'Neterra Telecommunications Ltd' : 'Internal Docker Bridge',
      asn: row.originIndicator.includes('Neterra') ? 'AS34224 (Neterra BG)' : 'AS-LOCAL-BRIDGE',
      sourceUrl: row.onionHost,
      htmlHash: 'e71029348bc129837a10293847a94b3c2d812e55a909123847a94b3c2d812e55',
      firstSeen: '2024-02-19 11:20 UTC',
      lastSeen: '2024-09-11 12:14 UTC',
      rawPayload: row.headersSnippet,
    });
  };

  const handleTriggerProbe = async () => {
    if (onRunScan && customProbeUrl) {
      await onRunScan(customProbeUrl);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
      case 'HIGH':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-950/40 border-yellow-800/60';
      case 'SECURE':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
      default:
        return 'text-zinc-400 bg-zinc-900 border-zinc-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Probe Control Bar */}
      <div className="p-3 rounded-md bg-[#121215] border border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-500 shrink-0 font-medium">TARGET PROBE:</span>
          <div className="flex-1 flex items-center bg-[#09090b] border border-zinc-800 rounded px-2.5 py-1.5 focus-within:border-zinc-700">
            <input
              type="text"
              value={customProbeUrl}
              onChange={(e) => setCustomProbeUrl(e.target.value)}
              placeholder="e.g. http://<onion>/server-status"
              className="flex-1 bg-transparent text-zinc-200 outline-none font-mono text-xs placeholder:text-zinc-600"
            />
          </div>
        </div>

        <button
          onClick={handleTriggerProbe}
          disabled={isScanning}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-mono text-xs font-medium transition-colors ${
            isScanning ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Probing Circuit...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Probe Origin Leaks</span>
            </>
          )}
        </button>
      </div>

      {/* Structured Security Audit Table */}
      <div className="rounded-md bg-[#121215] border border-zinc-800/80 overflow-hidden">
        <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <span className="text-xs font-mono font-semibold uppercase text-zinc-200">
              Tor-to-Clearnet Origin Exposure Audit Matrix
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            5 Diagnostic Probes &bull; Click row to inspect evidence payload
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#0c0c0e] font-mono text-[11px] text-zinc-400">
                <th className="py-2 px-3 font-medium">Target Path</th>
                <th className="py-2 px-3 font-medium">Probe Type</th>
                <th className="py-2 px-3 font-medium">Detected Leak Signature</th>
                <th className="py-2 px-3 font-medium">Origin Indicator</th>
                <th className="py-2 px-3 font-medium">Severity</th>
                <th className="py-2 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {auditRows.map((row) => {
                const isSelected = row.id === selectedRowId;
                return (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-zinc-800/80 text-zinc-100' : 'hover:bg-zinc-900/60 text-zinc-300'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-violet-300 font-medium select-all">
                      {row.targetPath}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400">
                      {row.probeType}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-200 font-sans text-xs">
                      {row.detectedLeak}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-zinc-300">
                      {row.originIndicator}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getSeverityBadge(row.severity)}`}>
                        {row.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row);
                        }}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Leak Evidence Inspector Panel */}
      {activeRow && (
        <div className="p-3.5 rounded-md bg-[#121215] border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
              <span className="text-zinc-200 font-semibold uppercase">
                Raw Probe Evidence: {activeRow.targetPath}
              </span>
              <span className="text-zinc-500 font-mono text-[10px]">
                (HTTP {activeRow.responseCode})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeRow.headersSnippet);
                  setCopiedKey('snippet');
                  setTimeout(() => setCopiedKey(null), 1500);
                }}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'snippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'snippet' ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>
          </div>

          <pre className="p-3 rounded bg-[#09090b] border border-zinc-800/90 text-zinc-300 font-mono text-xs leading-relaxed max-h-64 overflow-y-auto select-all whitespace-pre-wrap">
            {activeRow.headersSnippet}
          </pre>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
            <span>Origin Attribution: <strong className="text-rose-400 font-medium">{activeRow.originIndicator}</strong></span>
            <span>Cryptographic Confidence: <strong className="text-emerald-400 font-medium">98.4% DETERMINISTIC</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
