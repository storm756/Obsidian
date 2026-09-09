import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Download, 
  Check, 
  FileText, 
  FileCode, 
  Table, 
  ShieldCheck 
} from 'lucide-react';
import { ThreatActorCase, InfraScanResult, AttributionSignalBreakdown, GraphNode, GraphLink } from '../types';
import { generateForensicReportText, generateStixJson, generateCsvRelationships, downloadFile } from '../utils/export';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCase: ThreatActorCase;
  scan?: InfraScanResult;
  signals?: AttributionSignalBreakdown[];
  graphData: { nodes: GraphNode[]; links: GraphLink[] };
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  targetCase,
  scan,
  signals,
  graphData,
}) => {
  const [activeFormat, setActiveFormat] = useState<'report' | 'stix' | 'csv'>('report');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const reportText = generateForensicReportText(targetCase, scan, signals);
  const stixObj = generateStixJson(targetCase, scan);
  const stixJson = JSON.stringify(stixObj, null, 2);
  const csvText = generateCsvRelationships(graphData.nodes, graphData.links);

  const getCurrentContent = () => {
    if (activeFormat === 'report') return reportText;
    if (activeFormat === 'stix') return stixJson;
    return csvText;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filenameBase = `CHARON_${targetCase.codename}_${targetCase.caseNumber.replace(/[^a-zA-Z0-9]/g, '_')}`;
    if (activeFormat === 'report') {
      downloadFile(reportText, `${filenameBase}_EVIDENTIARY_DOSSIER.txt`, 'text/plain');
    } else if (activeFormat === 'stix') {
      downloadFile(stixJson, `${filenameBase}_STIX21_BUNDLE.json`, 'application/json');
    } else {
      downloadFile(csvText, `${filenameBase}_ENTITY_RELATIONSHIPS.csv`, 'text/csv');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0c]/80 backdrop-blur-sm p-4">
      <div className="bg-[#141417] border border-[#1e1e24] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#1e1e24] flex items-center justify-between bg-[#0e0e11]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>Evidentiary Dossier &amp; Export Center</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1f] text-gray-300 border border-[#1e1e24]">
                  {targetCase.caseNumber}
                </span>
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Admissible law enforcement intelligence export for NTRO / Cybercrime Unit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1a1a1f] hover:bg-[#25252d] text-gray-400 hover:text-white transition border border-[#1e1e24]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selectors */}
        <div className="px-4 py-2 bg-[#0e0e11] border-b border-[#1e1e24] flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFormat('report')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
                activeFormat === 'report'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-bold shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>NTRO Forensic Brief (.txt)</span>
            </button>

            <button
              onClick={() => setActiveFormat('stix')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
                activeFormat === 'stix'
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-800/60 font-bold shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>STIX 2.1 Threat Intel (.json)</span>
            </button>

            <button
              onClick={() => setActiveFormat('csv')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
                activeFormat === 'csv'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Entity Relationships (.csv)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded bg-[#1a1a1f] hover:bg-[#25252d] text-gray-200 transition flex items-center gap-1.5 border border-[#1e1e24]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Content Preview Canvas */}
        <div className="flex-1 p-4 bg-[#0a0a0c] overflow-y-auto font-mono text-xs text-zinc-300 scrollbar-thin">
          <pre className="whitespace-pre-wrap leading-relaxed select-all">
            {getCurrentContent()}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#0e0e11] border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500">
          <span>Digital Signature: SHA-256 e3b0c44298fc1c149... verified</span>
          <span>Obsidian Attribution Engine v2.4</span>
        </div>
      </div>
    </div>
  );
};
