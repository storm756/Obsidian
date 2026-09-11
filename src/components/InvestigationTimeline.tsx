import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  AlertCircle, 
  Filter, 
  Server, 
  Wallet, 
  Key, 
  ShoppingBag, 
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';
import { TimelineEvent, ThreatActorCase } from '../types';

interface InvestigationTimelineProps {
  selectedCase: ThreatActorCase;
  timelineEvents: TimelineEvent[];
}

export const InvestigationTimeline: React.FC<InvestigationTimelineProps> = ({
  selectedCase,
  timelineEvents,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredEvents = timelineEvents.filter(
    (e) => filterCategory === 'all' || e.category === filterCategory
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'INFRA_LEAK':
        return <Server className="w-4 h-4 text-amber-400" />;
      case 'FINANCIAL_FLOW':
        return <Wallet className="w-4 h-4 text-cyan-400" />;
      case 'PGP_ACTIVITY':
        return <Key className="w-4 h-4 text-emerald-400" />;
      case 'MARKET_TRANSITION':
        return <ShoppingBag className="w-4 h-4 text-purple-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold';
      case 'MEDIUM':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-[#111622] text-zinc-400 border-[#1e2433]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Technical Header */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                TIMELINE AUDIT // CHRONOLOGICAL OPSEC SLIPSTREAM
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                TEMPORAL FORENSICS · INCIDENT LOGS · CHAIN OF CUSTODY
              </span>
            </div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Operational Timeline &amp; De-Anonymizing Slipstream</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </h2>
            <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed mt-1">
              Chronologically reconstructs {selectedCase.primaryHandle}&apos;s digital footprint across darknet markets, cryptographic key updates, cryptocurrency escrow sweeps, and infrastructure misconfigurations that enabled cross-layer attribution.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#08090d] border border-[#1e2433] px-4 py-3 rounded-lg shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">LOGGED MILESTONES</div>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {timelineEvents.length} INCIDENTS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] uppercase text-zinc-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>CATEGORY:</span>
          </span>
          {[
            { id: 'all', label: 'ALL EVENTS' },
            { id: 'INFRA_LEAK', label: 'INFRA LEAKS' },
            { id: 'MARKET_TRANSITION', label: 'MARKET MIGRATION' },
            { id: 'PGP_ACTIVITY', label: 'PGP KEYS' },
            { id: 'FINANCIAL_FLOW', label: 'FINANCIAL' },
            { id: 'FORUM_POST', label: 'FORUM COMM' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterCategory(item.id)}
              className={`px-2.5 py-1 rounded font-mono text-[10px] font-semibold transition-colors border ${
                filterCategory === item.id
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                  : 'bg-[#08090d] text-zinc-400 border-[#1e2433] hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="font-mono text-[10px] text-zinc-500">
          SHOWING {filteredEvents.length} OF {timelineEvents.length} EVENTS
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 border-l border-[#1e2433] space-y-4">
        {filteredEvents.map((event) => (
          <div key={event.id} className="relative group">
            {/* Timeline Marker Node */}
            <div className="absolute -left-[31px] top-3.5 w-3.5 h-3.5 rounded-full bg-[#08090d] border-2 border-cyan-500 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            </div>

            <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg p-4 hover:border-zinc-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1e2433] mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-[#08090d] border border-[#1e2433]">
                    {getCategoryIcon(event.category)}
                  </div>
                  <h3 className="font-mono text-xs font-bold text-white">
                    {event.title || (event as any).eventTitle || 'Operational Milestone'}
                  </h3>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${getSeverityBadge(event.severity)}`}>
                    {event.severity}
                  </span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1 bg-[#08090d] px-2 py-0.5 rounded border border-[#1e2433]">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    <span>{event.date}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                {event.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1e2433] font-mono text-[10px] text-zinc-500">
                <span>SOURCE: <strong className="text-zinc-200">{event.source || (event as any).sourcePlatform || 'Tor Testbed'}</strong></span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Fingerprint className="w-3 h-3" />
                  <span>{event.corroboratedBy || (event as any).significance || (event as any).evidenceRef || 'Corroborated Telemetry'}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
