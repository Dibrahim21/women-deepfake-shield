import React from 'react';
import {
  ScanFace,
  Info,
  Files,
  AlertTriangle,
  FileText,
  CheckSquare,
  Lock,
  ShieldCheck,
  ChevronRight,
  Video,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';
import { CaseReport, ViewMode } from '../types';

interface DashboardViewProps {
  cases: CaseReport[];
  onNavigate: (view: ViewMode) => void;
  onSelectCase: (caseItem: CaseReport, view?: ViewMode) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  onNavigate,
  onSelectCase,
}) => {
  const filesAnalyzed = cases.length;

  const potentialDeepfakesCount = cases.filter(
    (c) =>
      c.riskLevel === 'Likely Deepfake' ||
      c.riskScore > 60
  ).length;

  const evidenceReportsCount = cases.length;
  const casesReviewed = cases.length;

  const recentCases = cases.slice(0, 3);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">

      {/* Hero Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Detect.
          <br />
          Verify.
          <br />
          Protect.
        </h1>

        <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed max-w-xl">
          AI-assisted analysis to identify potentially manipulated media
          and help protect digital identity.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => onNavigate('analyze-upload')}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-sm transition-all duration-150 active:scale-98"
          >
            <ScanFace className="w-5 h-5" />
            <span>Analyze Media</span>
          </button>

          <button
            onClick={() => onNavigate('how-it-works')}
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold px-6 py-3.5 rounded-2xl transition-all duration-150 active:scale-98"
          >
            <Info className="w-5 h-5 text-slate-600" />
            <span>How It Works</span>
          </button>
        </div>
      </section>

      {/* System Overview */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            System Overview
          </h2>

          <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 font-semibold px-2 py-0.5 rounded-md">
            LIVE DATA
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">

          {/* Files */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-blue-600">
              <Files className="w-5 h-5" />

              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Files
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {filesAnalyzed}
            </p>

            <p className="text-xs text-slate-500 mt-0.5">
              Files Analyzed
            </p>
          </div>

          {/* Alerts */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-rose-500">
              <AlertTriangle className="w-5 h-5" />

              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Alerts
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2">
              {potentialDeepfakesCount}
            </p>

            <p className="text-xs text-slate-500 mt-0.5">
              Potential Deepfakes
            </p>
          </div>

          {/* Reports */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600">
              <FileText className="w-5 h-5" />

              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Reports
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {evidenceReportsCount}
            </p>

            <p className="text-xs text-slate-500 mt-0.5">
              Evidence Reports
            </p>
          </div>

          {/* Reviews */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-indigo-600">
              <CheckSquare className="w-5 h-5" />

              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Reviews
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {casesReviewed}
            </p>

            <p className="text-xs text-slate-500 mt-0.5">
              Cases Reviewed
            </p>
          </div>

        </div>
      </section>

      {/* Recent Analyses */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Recent Analyses
          </h2>

          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentCases.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">

            <Files className="w-8 h-8 text-slate-300 mx-auto mb-3" />

            <h3 className="text-sm font-bold text-slate-700">
              No analyses yet
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Upload an image or video to start your first analysis.
            </p>

            <button
              onClick={() => onNavigate('analyze-upload')}
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              <ScanFace className="w-4 h-4" />
              Analyze Media
            </button>

          </div>
        ) : (
          <div className="space-y-3">

            {recentCases.map((c) => {
              const isDeepfake =
                c.riskLevel === 'Likely Deepfake' ||
                c.riskScore > 60;

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c, 'case-detail')}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-150"
                >

                  {/* Case Header */}
                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">

                      <div
                        className={`p-2.5 rounded-xl ${
                          isDeepfake
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {c.mediaType === 'video' ? (
                          <Video className="w-5 h-5" />
                        ) : (
                          <ImageIcon className="w-5 h-5" />
                        )}
                      </div>

                      <div>

                        <div className="flex items-center gap-2">

                          <span className="font-mono text-xs font-bold text-slate-900">
                            {c.caseNumber || 'Case'}
                          </span>

                          <span className="text-xs font-mono text-slate-600 truncate max-w-[150px] sm:max-w-[220px]">
                            {c.fileName || 'Unnamed file'}
                          </span>

                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-medium">

                          <Clock className="w-3.5 h-3.5" />

                          <span>
                            {c.scannedAt || 'Recently analyzed'}
                          </span>

                          <span>•</span>

                          <span className="capitalize">
                            {c.mediaType}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* Risk Information */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">

                    {isDeepfake ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">

                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />

                        <span>
                          Risk: Likely Deepfake ({c.riskScore}%)
                        </span>

                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">

                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />

                        <span>
                          Risk: Authentic
                        </span>

                      </div>
                    )}

                    <span className="text-xs font-medium text-slate-500 font-mono">
                      Confidence: {c.confidenceText || 'N/A'}
                    </span>

                  </div>

                </div>
              );
            })}

          </div>
        )}
      </section>

      {/* Privacy & Security */}
      <section>

        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-3 px-1">
          Privacy & Security
        </h2>

        <div
          onClick={() => onNavigate('privacy-security')}
          className="bg-[#0B132B] text-white p-6 rounded-3xl relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all"
        >

          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex flex-col items-center text-center">

            <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold tracking-tight">
              Your analysis data is protected
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
              Your uploaded media and analysis results are processed securely.
            </p>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">

              <div className="flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-700/60 rounded-xl py-2.5 px-3 text-xs font-mono text-slate-200">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Secure Processing</span>
              </div>

              <div className="flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-700/60 rounded-xl py-2.5 px-3 text-xs font-mono text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>File Integrity Verified</span>
              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};

export default DashboardView;