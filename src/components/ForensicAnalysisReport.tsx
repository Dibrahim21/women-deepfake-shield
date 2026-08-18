import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Info,
  XCircle,
  Clock,
  Hash,
  Image as ImageIcon,
  Database,
  ArrowRight,
} from 'lucide-react';
import { CaseReport, ViewMode } from '../types';

interface ForensicAnalysisReportProps {
  currentCase: CaseReport;
  onNavigate: (view: ViewMode) => void;
}

export const ForensicAnalysisReport: React.FC<
  ForensicAnalysisReportProps
> = ({ currentCase, onNavigate }) => {
  const forensic = currentCase.forensicResult;
  const integrity = forensic?.integrity;
  const metadata = forensic?.metadata;
  const dimensions = forensic?.dimensions;
  const indicators = forensic?.forensicIndicators || [];

  const getLevelClasses = (level: string) => {
    if (level === 'alert') {
      return 'bg-rose-50 border-rose-200 text-rose-700';
    }

    if (level === 'warning') {
      return 'bg-amber-50 border-amber-200 text-amber-700';
    }

    return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  };

  const getLevelIcon = (level: string) => {
    if (level === 'alert') {
      return <XCircle className="w-4 h-4 shrink-0" />;
    }

    if (level === 'warning') {
      return <AlertTriangle className="w-4 h-4 shrink-0" />;
    }

    return <CheckCircle2 className="w-4 h-4 shrink-0" />;
  };

  const integrityLabel =
    integrity?.integrityStatus === 'verified'
      ? 'Verified'
      : integrity?.integrityStatus === 'warning'
        ? 'Warning'
        : integrity?.integrityStatus === 'compromised'
          ? 'Compromised'
          : 'Unavailable';

  const integrityClass =
    integrity?.integrityStatus === 'verified'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : integrity?.integrityStatus === 'warning'
        ? 'text-amber-700 bg-amber-50 border-amber-200'
        : 'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Forensic Analysis Report
        </h1>

        <p className="text-xs sm:text-sm font-mono text-slate-500 mt-1">
          Case: {currentCase.caseNumber}
          {' • '}
          Scanned: {currentCase.scannedAt || 'Unavailable'}
        </p>
      </div>

      {/* IMPORTANT STATUS */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-blue-800">
        <Info className="w-5 h-5 mt-0.5 shrink-0" />

        <div>
          <p className="font-bold text-sm">
            Preliminary forensic inspection
          </p>

          <p className="text-xs mt-1 leading-relaxed">
            This report displays deterministic file-level forensic checks
            performed on the uploaded file. These checks are separate from
            the AI deepfake classification.
          </p>
        </div>
      </div>

      {/* FILE IDENTITY */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                File Identity
              </h2>

              <p className="text-xs text-slate-400 font-mono">
                Actual uploaded file information
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <div className="bg-slate-50 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-400">
              File Name
            </span>

            <p className="font-semibold text-sm text-slate-900 mt-1 break-all">
              {currentCase.fileName}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-400">
              File Size
            </span>

            <p className="font-semibold text-sm text-slate-900 mt-1">
              {forensic?.fileSize?.formatted ||
                currentCase.fileSize ||
                'Unavailable'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-400">
              MIME Type
            </span>

            <p className="font-semibold text-sm text-slate-900 mt-1">
              {forensic?.mimeType ||
                integrity?.declaredMimeType ||
                'Unavailable'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-400">
              Detected Format
            </span>

            <p className="font-semibold text-sm text-slate-900 mt-1 uppercase">
              {integrity?.detectedFormat || 'Unavailable'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-400">
              Resolution
            </span>

            <p className="font-semibold text-sm text-slate-900 mt-1">
              {dimensions
                ? `${dimensions.width} × ${dimensions.height}`
                : 'Unavailable'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-400">
              Aspect Ratio
            </span>

            <p className="font-semibold text-sm text-slate-900 mt-1">
              {dimensions?.aspectRatio || 'Unavailable'}
            </p>
          </div>

        </div>
      </div>

      {/* SHA-256 */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Hash className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Cryptographic Integrity
            </h2>

            <p className="text-xs text-slate-400">
              SHA-256 fingerprint of the uploaded file
            </p>
          </div>
        </div>

        <div className="bg-slate-950 rounded-2xl p-4">
          <p className="text-[10px] text-slate-400 uppercase font-mono mb-2">
            SHA-256
          </p>

          <p className="text-xs sm:text-sm text-emerald-300 font-mono break-all">
            {currentCase.integrityHash || 'Hash unavailable'}
          </p>
        </div>

        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          This fingerprint identifies the exact file that was analyzed.
          It is not a deepfake score.
        </p>
      </div>

      {/* INTEGRITY */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600" />

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                File Integrity
              </h2>

              <p className="text-xs text-slate-400">
                Binary structure and declared format checks
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1.5 rounded-full border text-xs font-bold ${integrityClass}`}
          >
            {integrityLabel}
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">

          <IntegrityCheck
            label="Magic Bytes"
            value={
              integrity?.hasValidMagicBytes
                ? 'Valid'
                : 'Invalid'
            }
            valid={integrity?.hasValidMagicBytes}
          />

          <IntegrityCheck
            label="EOF Marker"
            value={
              integrity?.hasValidEof
                ? 'Valid'
                : 'Missing / Invalid'
            }
            valid={integrity?.hasValidEof}
          />

          <IntegrityCheck
            label="Extension vs Format"
            value={
              integrity?.formatMatchesExtension
                ? 'Matches'
                : 'Mismatch'
            }
            valid={integrity?.formatMatchesExtension}
          />

          <IntegrityCheck
            label="Detected Format"
            value={
              integrity?.detectedFormat
                ? integrity.detectedFormat.toUpperCase()
                : 'Unavailable'
            }
            valid={undefined}
          />

        </div>
      </div>

      {/* METADATA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

        <div className="flex items-center gap-3 mb-5">
          <Database className="w-5 h-5 text-purple-600" />

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Metadata Inspection
            </h2>

            <p className="text-xs text-slate-400">
              Metadata actually found in the uploaded file
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <MetadataItem
            label="EXIF Metadata"
            value={
              metadata?.exifPresent
                ? 'Present'
                : 'Not found'
            }
            warning={!metadata?.exifPresent}
          />

          <MetadataItem
            label="Known Software / AI Signature"
            value={
              metadata?.hasSuspiciousSoftwareSignature
                ? 'Detected'
                : 'Not detected'
            }
            warning={
              metadata?.hasSuspiciousSoftwareSignature
            }
          />

        </div>

        {metadata?.detectedSignatures &&
          metadata.detectedSignatures.length > 0 && (
            <div className="mt-4 bg-rose-50 border border-rose-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-rose-800 mb-2">
                Detected signatures
              </p>

              <div className="flex flex-wrap gap-2">
                {metadata.detectedSignatures.map(
                  (signature) => (
                    <span
                      key={signature}
                      className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-xs font-mono text-rose-700"
                    >
                      {signature}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

        {metadata?.rawMetadataSummary &&
          Object.keys(metadata.rawMetadataSummary).length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-700 mb-2">
                Raw metadata indicators
              </p>

              <div className="bg-slate-950 rounded-2xl p-4 space-y-2">
                {Object.entries(
                  metadata.rawMetadataSummary
                ).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 text-xs font-mono"
                  >
                    <span className="text-cyan-300 shrink-0">
                      {key}:
                    </span>

                    <span className="text-slate-300 break-all">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* FORENSIC INDICATORS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <SearchIcon />

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Forensic Findings
              </h2>

              <p className="text-xs text-slate-400">
                Deterministic findings generated from this file
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">

          {indicators.length === 0 ? (
            <div className="text-sm text-slate-500 bg-slate-50 rounded-2xl p-4">
              No forensic indicators were returned for this analysis.
            </div>
          ) : (
            indicators.map((indicator, index) => (
              <div
                key={`${indicator.message}-${index}`}
                className={`rounded-2xl border p-4 flex items-start gap-3 ${getLevelClasses(
                  indicator.level
                )}`}
              >
                {getLevelIcon(indicator.level)}

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-1">
                    {indicator.type} · {indicator.level}
                  </p>

                  <p className="text-sm leading-relaxed">
                    {indicator.message}
                  </p>
                </div>
              </div>
            ))
          )}

        </div>
      </div>

      {/* AI RESULT */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              AI Deepfake Assessment
            </h2>

            <p className="text-xs text-slate-400">
              Separate from deterministic file forensics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <div className="bg-slate-50 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-400">
              Classification
            </span>

            <p className="font-bold text-lg text-slate-900 mt-1">
              {currentCase.riskLevel}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-400">
              Model Confidence
            </span>

            <p className="font-bold text-lg text-slate-900 mt-1">
              {currentCase.confidenceText || 'Unavailable'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-mono text-slate-400">
              Provider
            </span>

            <p className="font-bold text-sm text-slate-900 mt-1">
              Local Python ML
            </p>
          </div>

        </div>

        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            {currentCase.explainableAssessment ||
              'No AI reasoning was returned.'}
          </p>
        </div>

      </div>

      {/* DISCLAIMER */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />

        <p className="text-xs text-slate-500 leading-relaxed">
          {forensic?.disclaimer ||
            'Forensic inspection and AI classification are probabilistic/technical analysis tools and should not be treated as definitive proof without appropriate human review.'}
        </p>
      </div>

      {/* ACTION */}
      <div className="flex flex-col sm:flex-row gap-3">

        <button
          onClick={() => onNavigate('evidence-report')}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl shadow-sm transition-all active:scale-98"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Digital Evidence Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};

const IntegrityCheck: React.FC<{
  label: string;
  value: string;
  valid?: boolean;
}> = ({ label, value, valid }) => {
  return (
    <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold text-slate-700">
          {label}
        </p>

        <p className="text-xs text-slate-400 mt-1">
          {value}
        </p>
      </div>

      {valid === true && (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      )}

      {valid === false && (
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
      )}

      {valid === undefined && (
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
      )}
    </div>
  );
};

const MetadataItem: React.FC<{
  label: string;
  value: string;
  warning?: boolean;
}> = ({ label, value, warning }) => {
  return (
    <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold text-slate-700">
          {label}
        </p>

        <p className="text-xs text-slate-400 mt-1">
          {value}
        </p>
      </div>

      {warning ? (
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      )}
    </div>
  );
};

const SearchIcon: React.FC = () => (
  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
    <SearchIconInner />
  </div>
);

const SearchIconInner: React.FC = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
};