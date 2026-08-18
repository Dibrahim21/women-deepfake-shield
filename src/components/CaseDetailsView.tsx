import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Eye, 
  ImageIcon, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Layers
} from 'lucide-react';
import { CaseReport, ViewMode } from '../types';

interface CaseDetailsViewProps {
  currentCase: CaseReport;
  onNavigate: (view: ViewMode) => void;
  onReanalyze: (caseItem: CaseReport) => void;
}

export const CaseDetailsView: React.FC<CaseDetailsViewProps> = ({
  currentCase,
  onNavigate,
  onReanalyze,
}) => {
  const [showMeshOverlay, setShowMeshOverlay] = useState(true);
  const isDeepfake = currentCase.riskLevel === 'Likely Deepfake' || currentCase.riskScore > 60;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Back button */}
      <button
        onClick={() => onNavigate('history')}
        className="text-xs font-mono text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Logs</span>
      </button>

      {/* Case Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Case Details - {currentCase.caseNumber}
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onReanalyze(currentCase)}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-mono font-semibold py-3 px-4 rounded-2xl transition-all shadow-2xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Re-analyze File</span>
        </button>

        <button
          onClick={() => onNavigate('forensic-detail')}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-semibold py-3 px-4 rounded-2xl transition-all shadow-xs"
        >
          <Eye className="w-4 h-4" />
          <span>View Forensic Analysis</span>
        </button>
      </div>

      {/* Analyzed Media Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Analyzed Media</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMeshOverlay(!showMeshOverlay)}
              className="text-xs font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg"
            >
              <Layers className="w-3 h-3" />
              <span>{showMeshOverlay ? 'Hide Mesh' : 'Show Mesh'}</span>
            </button>
            <ImageIcon className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Media Frame with Face Mesh Grid Overlay */}
        <div className="relative bg-slate-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="relative rounded-2xl overflow-hidden shadow-md max-w-sm w-full bg-white">
            <img
              src={currentCase.previewUrl}
              alt="Analyzed Media Subject"
              className="w-full h-80 object-cover object-top"
            />

            {/* Neural Face Mesh Overlay */}
            {showMeshOverlay && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Simulated 3D facial grid pattern centered over face */}
                <div className="w-44 h-48 rounded-full border border-cyan-400/70 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:10px_10px] opacity-75 mix-blend-screen shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                  {/* Eye keypoint dots */}
                  <div className="absolute top-16 left-12 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
                  <div className="absolute top-16 right-12 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
                  {/* Nose keypoint dot */}
                  <div className="absolute top-24 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
                  {/* Mouth keypoint dots */}
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-8 h-3 border-t-2 border-cyan-300 rounded-full opacity-80" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Media Metadata Specs */}
        <div className="p-5 space-y-2.5 font-mono text-xs border-t border-slate-100">
          <div className="flex items-center justify-between text-slate-600">
            <span>File Name:</span>
            <span className="font-bold text-slate-900 truncate max-w-[200px]">{currentCase.fileName}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Duration/Size:</span>
            <span className="font-bold text-slate-900">{currentCase.duration} / {currentCase.fileSize}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
            <span>Analysis Status:</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Risk Score:</span>
            <span className={`font-bold ${isDeepfake ? 'text-rose-600' : 'text-emerald-600'}`}>
              {currentCase.riskScore}% ({currentCase.riskLevel})
            </span>
          </div>
        </div>
      </div>

      {/* Quick navigation to Digital Evidence Report */}
      <button
        onClick={() => onNavigate('evidence-report')}
        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-blue-300 rounded-2xl shadow-xs transition-all text-xs font-mono"
      >
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-900">View Full Judicial Evidence Dossier</span>
        </div>
        <span className="text-blue-600 font-semibold">Open →</span>
      </button>
    </div>
  );
};
