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
  ShieldAlert
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
        return <Server className="w-4 h-4 text-rose-400" />;
      case 'FINANCIAL_FLOW':
        return <Wallet className="w-4 h-4 text-cyan-400" />;
      case 'PGP_ACTIVITY':
        return <Key className="w-4 h-4 text-amber-400" />;
      case 'MARKET_TRANSITION':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
      default:
        return 'bg-white/[0.05] text-zinc-300 border-white/[0.08]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
              CHRONOLOGY
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Operational Timeline &amp; OpSec Slip Log</h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Chronological reconstruction of {selectedCase.primaryHandle}&apos;s activity, tracing darknet forum migrations, key publications, cryptocurrency escrow sweeps, and operational security blunders that led to attribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">Total Milestones:</span>
          <span className="px-3 py-1 rounded-full bg-[#0b0b0e] border border-white/[0.08] font-mono text-xs text-cyan-300 font-semibold">
            {timelineEvents.length} Events
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-3.5 flex flex-wrap items-center gap-2 text-xs shadow-sm">
        <span className="text-zinc-400 flex items-center gap-1 font-medium text-xs">
          <Filter className="w-3.5 h-3.5" />
          <span>Category Filter:</span>
        </span>
        {[
          { id: 'all', label: 'All Events' },
          { id: 'INFRA_LEAK', label: 'Infra Leaks' },
          { id: 'MARKET_TRANSITION', label: 'Market Migration' },
          { id: 'PGP_ACTIVITY', label: 'PGP Keys' },
          { id: 'FINANCIAL_FLOW', label: 'Financial' },
          { id: 'FORUM_POST', label: 'Forums' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilterCategory(item.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filterCategory === item.id
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'bg-[#0b0b0e] text-zinc-400 border border-white/[0.06] hover:text-zinc-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Interactive Timeline Stream */}
      <div className="relative pl-6 border-l border-white/[0.1] space-y-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="relative group">
            {/* Timeline Marker Pin */}
            <div className="absolute -left-[31px] top-2 w-3.5 h-3.5 rounded-full bg-[#0a0a0c] border-2 border-cyan-500 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            </div>

            <div className="bg-[#121216] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-colors shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06] mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-[#0b0b0e] border border-white/[0.08]">
                    {getCategoryIcon(event.category)}
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {event.title || (event as any).eventTitle || 'Operational Milestone'}
                  </h3>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getSeverityBadge(event.severity)}`}>
                    {event.severity}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{event.date}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed mb-3.5">
                {event.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-white/[0.06] text-xs text-zinc-400">
                <span>Source: <strong className="text-zinc-200 font-medium">{event.source || (event as any).sourcePlatform || 'Tor Testbed'}</strong></span>
                <span className="text-emerald-400/90 font-medium">Corroborated by: {event.corroboratedBy || (event as any).significance || (event as any).evidenceRef || 'Exact Fingerprint Match'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
