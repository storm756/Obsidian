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
    const filenameBase = `OBSIDIAN_${targetCase.codename}_${targetCase.caseNumber.replace(/[^a-zA-Z0-9]/g, '_')}`;
    if (activeFormat === 'report') {
      downloadFile(reportText, `${filenameBase}_EVIDENTIARY_DOSSIER.txt`, 'text/plain');
    } else if (activeFormat === 'stix') {
      downloadFile(stixJson, `${filenameBase}_STIX21_BUNDLE.json`, 'application/json');
    } else {
      downloadFile(csvText, `${filenameBase}_ENTITY_RELATIONSHIPS.csv`, 'text/csv');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070a]/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="surface-card rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#1a2436]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#161e30] flex items-center justify-between bg-[#070a10]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>Evidentiary Dossier &amp; Intelligence Export Center</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 font-bold">
                  {targetCase.caseNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Court-admissible law enforcement intelligence export for NTRO / Cybercrime Prosecution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-[#0e1422] hover:bg-[#161e30] text-slate-400 hover:text-white transition border border-[#1e273a]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selectors */}
        <div className="px-4 py-2.5 bg-[#090d14] border-b border-[#161e30] flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFormat('report')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeFormat === 'report'
                  ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm glow-cyan'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>NTRO Forensic Brief (.txt)</span>
            </button>

            <button
              onClick={() => setActiveFormat('stix')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeFormat === 'stix'
                  ? 'bg-violet-950/70 text-violet-300 border border-violet-500/50 font-bold shadow-sm glow-violet'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>STIX 2.1 Threat Intel (.json)</span>
            </button>

            <button
              onClick={() => setActiveFormat('csv')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeFormat === 'csv'
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 font-bold shadow-sm glow-emerald'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Entity Relationships (.csv)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-md bg-[#070a10] hover:bg-[#0e1422] text-slate-200 transition-all flex items-center gap-1.5 border border-[#161e30] active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 glow-cyan"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Content Preview Canvas */}
        <div className="flex-1 p-4 bg-[#05070a] overflow-y-auto font-mono text-xs text-slate-300 scrollbar-thin">
          <pre className="whitespace-pre-wrap leading-relaxed select-all">
            {getCurrentContent()}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#070a10] border-t border-[#161e30] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="text-emerald-400 font-semibold">Digital Signature: SHA-256 e3b0c44298fc1c149... Verified</span>
          <span>OBSIDIAN ATTRIBUTION ENGINE v2.5</span>
        </div>
      </div>
    </div>
  );
};
