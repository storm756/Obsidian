import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Filter, 
  Server, 
  Wallet, 
  Key, 
  ShoppingBag, 
  MessageSquare,
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
        return <Server className="w-4 h-4 text-blue-400" />;
      case 'FINANCIAL_FLOW':
        return <Wallet className="w-4 h-4 text-amber-400" />;
      case 'PGP_ACTIVITY':
        return <Key className="w-4 h-4 text-emerald-400" />;
      case 'MARKET_TRANSITION':
        return <ShoppingBag className="w-4 h-4 text-purple-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-950/60 text-rose-300 border-rose-800 font-semibold';
      case 'HIGH':
        return 'bg-amber-950/60 text-amber-300 border-amber-800 font-semibold';
      case 'MEDIUM':
        return 'bg-blue-950/60 text-blue-300 border-blue-800 font-medium';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700 font-medium';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="surface-card rounded-xl p-5 border border-[#1e273d]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800">
                Temporal Forensics
              </span>
              <span className="text-xs text-slate-400">
                Chronological OpSec Footprint &middot; Incident Reconstruction
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Investigation Chronology &amp; OpSec Footprint</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed mt-1">
              Chronologically correlates {selectedCase.primaryHandle}&apos;s activity across darknet marketplaces, PGP key generation cycles, cryptocurrency cashouts, and network infrastructure misconfigurations.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#0e121a] border border-[#1b2336] px-4 py-3 rounded-xl shrink-0">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-medium">Logged Events</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">
                {timelineEvents.length} Incidents
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="surface-card rounded-xl px-4 py-3 border border-[#1e273d] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          {[
            { id: 'all', label: 'All Events' },
            { id: 'INFRA_LEAK', label: 'Infrastructure Leaks' },
            { id: 'MARKET_TRANSITION', label: 'Market Migration' },
            { id: 'PGP_ACTIVITY', label: 'PGP Keys' },
            { id: 'FINANCIAL_FLOW', label: 'Financial' },
            { id: 'FORUM_POST', label: 'Forum Comms' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterCategory(item.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterCategory === item.id
                  ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                  : 'bg-[#101420] text-slate-400 border border-[#1e273d] hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredEvents.length} of {timelineEvents.length} events
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 border-l border-slate-700/60 space-y-4 ml-3">
        {filteredEvents.map((event) => (
          <div key={event.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-3.5 w-3.5 h-3.5 rounded-full bg-[#090b10] border-2 border-blue-500 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </div>

            <div className="surface-card rounded-xl p-4 border border-[#1e273d] hover:border-slate-600 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1b2336] mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#0e121a] border border-[#1b2336]">
                    {getCategoryIcon(event.category)}
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {event.title || (event as any).eventTitle || 'Operational Milestone'}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${getSeverityBadge(event.severity)}`}>
                    {event.severity}
                  </span>
                  <span className="text-slate-300 flex items-center gap-1 bg-[#0e121a] px-2.5 py-0.5 rounded-md border border-[#1b2336] font-mono text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{event.date}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {event.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1b2336] text-xs text-slate-400">
                <span>Source: <strong className="text-slate-200">{event.source || (event as any).sourcePlatform || 'Tor Testbed'}</strong></span>
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <Fingerprint className="w-3.5 h-3.5" />
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
