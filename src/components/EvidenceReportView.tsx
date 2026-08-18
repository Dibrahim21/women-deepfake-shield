import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Printer,
  Download,
  AlertTriangle,
  FileCheck,
  Copy,
  Check,
  ShieldCheck,
  Info,
  Image as ImageIcon,
  Database,
  Hash,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { CaseReport, ViewMode } from '../types';

interface EvidenceReportViewProps {
  currentCase: CaseReport;
  onNavigate: (view: ViewMode) => void;
}

export const EvidenceReportView: React.FC<EvidenceReportViewProps> = ({
  currentCase,
  onNavigate,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [shared, setShared] = useState(false);

  const forensic = currentCase.forensicResult;
  const integrity = forensic?.integrity;
  const metadata = forensic?.metadata;
  const indicators = forensic?.forensicIndicators || [];

  const handleCopyHash = async () => {
    if (!currentCase.integrityHash) return;

    try {
      await navigator.clipboard?.writeText(
        currentCase.integrityHash
      );

      setCopiedHash(true);

      setTimeout(() => {
        setCopiedHash(false);
      }, 2000);
    } catch {
      setCopiedHash(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Digital Evidence Report ${currentCase.caseNumber}`,
        text: `Digital Evidence Report for ${currentCase.fileName}. Classification: ${currentCase.riskLevel}.`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setShared(true);

      setTimeout(() => {
        setShared(false);
      }, 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getIndicatorClasses = (level: string) => {
    if (level === 'alert') {
      return 'bg-rose-50 border-rose-200 text-rose-800';
    }

    if (level === 'warning') {
      return 'bg-amber-50 border-amber-200 text-amber-800';
    }

    return 'bg-emerald-50 border-emerald-200 text-emerald-800';
  };

  const getIndicatorIcon = (level: string) => {
    if (level === 'alert') {
      return <XCircle className="w-4 h-4 shrink-0" />;
    }

    if (level === 'warning') {
      return <AlertTriangle className="w-4 h-4 shrink-0" />;
    }

    return <CheckCircle2 className="w-4 h-4 shrink-0" />;
  };

  const getRiskClasses = () => {
    switch (currentCase.riskLevel) {
      case 'Likely Deepfake':
        return 'bg-rose-50 border-rose-200 text-rose-800';

      case 'Suspicious':
        return 'bg-amber-50 border-amber-200 text-amber-800';

      case 'Authentic':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';

      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const getIntegrityClasses = () => {
    switch (integrity?.integrityStatus) {
      case 'verified':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';

      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';

      case 'compromised':
        return 'bg-rose-50 border-rose-200 text-rose-800';

      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">

      {/* Back */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="text-xs font-mono text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors no-print"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Evidence Vault</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">

        <div className="flex items-start gap-4">

          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Digital Evidence
              <br />
              Report
            </h1>

            <p className="text-xs font-mono text-slate-500 mt-1">
              Case{' '}
              <span className="font-bold text-slate-700">
                {currentCase.caseNumber}
              </span>

              {' • '}

              Report{' '}
              <span className="font-bold text-slate-700">
                {currentCase.reportNumber}
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2.5 mt-6 no-print">

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-mono font-semibold py-2.5 px-3 rounded-xl transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>
              {shared ? 'Copied Link' : 'Share Report'}
            </span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-mono font-semibold py-2.5 px-3 rounded-xl transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-semibold py-2.5 px-3 rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download / Print PDF</span>
          </button>

        </div>
      </div>

      {/* Analysis Summary */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">

        <h2 className="text-base font-bold text-slate-900">
          Analysis Summary
        </h2>

        <div
          className={`rounded-2xl border p-4 flex items-center justify-between gap-4 ${getRiskClasses()}`}
        >
          <div>
            <p className="text-xs font-mono font-semibold">
              AI Classification
            </p>

            <p className="text-lg font-bold mt-1">
              {currentCase.riskLevel}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase font-mono opacity-70">
              Model Confidence
            </p>

            <p className="font-mono font-bold mt-1">
              {typeof currentCase.confidenceText === 'string' &&
                currentCase.confidenceText
                ? currentCase.confidenceText
                : 'Unavailable'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono pt-2 px-1 text-slate-600">
          <span>Analysis Date:</span>

          <span className="font-bold text-slate-900">
            {currentCase.analysisDate || 'Unavailable'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono px-1 text-slate-600">
          <span>Analysis ID:</span>

          <span className="font-bold text-slate-900 break-all text-right ml-4">
            {forensic?.analysisId ||
              currentCase.id ||
              'Unavailable'}
          </span>
        </div>

      </section>

      {/* File Evidence */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">

        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />

          <h2 className="text-base font-bold text-slate-900">
            File Evidence
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <EvidenceItem
            label="Source File"
            value={currentCase.fileName}
          />

          <EvidenceItem
            label="File Size"
            value={
              forensic?.fileSize?.formatted ||
              currentCase.fileSize ||
              'Unavailable'
            }
          />

          <EvidenceItem
            label="Media Type"
            value={currentCase.mediaType}
          />

          <EvidenceItem
            label="MIME Type"
            value={
              forensic?.mimeType ||
              integrity?.declaredMimeType ||
              'Unavailable'
            }
          />

          <EvidenceItem
            label="Detected Format"
            value={
              integrity?.detectedFormat
                ? integrity.detectedFormat.toUpperCase()
                : 'Unavailable'
            }
          />

          <EvidenceItem
            label="Resolution"
            value={
              forensic?.dimensions
                ? `${forensic.dimensions.width} × ${forensic.dimensions.height}`
                : 'Unavailable'
            }
          />

          <EvidenceItem
            label="Aspect Ratio"
            value={
              forensic?.dimensions?.aspectRatio ||
              'Unavailable'
            }
          />

        </div>
      </section>

      {/* SHA-256 */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">

        <div className="flex items-center justify-between gap-3">

          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-blue-600" />

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cryptographic Evidence
              </h2>

              <p className="text-[11px] text-slate-400 font-mono">
                SHA-256 file fingerprint
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyHash}
            disabled={!currentCase.integrityHash}
            className="text-xs font-mono text-blue-600 hover:text-blue-700 disabled:text-slate-400 flex items-center gap-1 font-semibold"
          >
            {copiedHash ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600">
                  Copied
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>

        </div>

        <div className="p-4 bg-slate-950 rounded-2xl">
          <p className="text-[10px] text-slate-400 uppercase font-mono mb-2">
            SHA-256
          </p>

          <p className="text-xs sm:text-sm font-mono text-emerald-300 break-all select-all">
            {currentCase.integrityHash ||
              'SHA-256 hash unavailable'}
          </p>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          This hash identifies the exact file that was submitted
          for analysis. It is a file fingerprint, not a deepfake
          detection score.
        </p>

      </section>

      {/* Integrity */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">

        <div className="flex items-center justify-between gap-3">

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />

            <h2 className="text-base font-bold text-slate-900">
              File Integrity
            </h2>
          </div>

          <span
            className={`px-3 py-1.5 rounded-full border text-[11px] font-mono font-bold ${getIntegrityClasses()}`}
          >
            {integrity?.integrityStatus
              ? integrity.integrityStatus.toUpperCase()
              : 'UNAVAILABLE'}
          </span>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <IntegrityItem
            label="Magic Bytes"
            valid={integrity?.hasValidMagicBytes}
          />

          <IntegrityItem
            label="EOF Marker"
            valid={integrity?.hasValidEof}
          />

          <IntegrityItem
            label="Extension / Format"
            valid={integrity?.formatMatchesExtension}
          />

        </div>

      </section>

      {/* Metadata */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">

        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-600" />

          <h2 className="text-base font-bold text-slate-900">
            Metadata Inspection
          </h2>
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
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">

              <p className="text-xs font-bold text-rose-800 mb-2">
                Detected Software Signatures
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

      </section>

      {/* Forensic Indicators */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Forensic Findings
            </h2>

            <p className="text-[11px] text-slate-400">
              Findings returned by the forensic analysis engine
            </p>
          </div>
        </div>

        {indicators.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500">
            No additional forensic indicators were returned.
          </div>
        ) : (
          <div className="space-y-3">

            {indicators.map((indicator, index) => (
              <div
                key={`${indicator.message}-${index}`}
                className={`rounded-2xl border p-4 flex items-start gap-3 ${getIndicatorClasses(
                  indicator.level
                )}`}
              >

                {getIndicatorIcon(indicator.level)}

                <div>
                  <p className="text-[10px] uppercase font-mono font-bold mb-1">
                    {indicator.type} · {indicator.level}
                  </p>

                  <p className="text-xs leading-relaxed">
                    {indicator.message}
                  </p>
                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* AI Assessment */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">

        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-600" />

          <div>
            <h2 className="text-base font-bold text-slate-900">
              AI Deepfake Assessment
            </h2>

            <p className="text-[11px] text-slate-400">
              Machine-learning classification
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <EvidenceItem
            label="Classification"
            value={currentCase.riskLevel}
          />

          <EvidenceItem
            label="Model Confidence"
            value={
              currentCase.confidenceText ||
              'Unavailable'
            }
          />

          <EvidenceItem
            label="Provider"
            value="Local Python ML"
          />

        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">

          <p className="text-xs text-slate-700 leading-relaxed">
            {currentCase.explainableAssessment ||
              'No AI reasoning was returned.'}
          </p>

        </div>

      </section>

      {/* Explicitly unavailable evidence */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">

        <div className="flex items-start gap-3">

          <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />

          <div>
            <p className="text-xs font-bold text-slate-700">
              Evidence scope
            </p>

            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              This report does not include frame-level anomaly
              timestamps, suspicious-frame extraction, facial
              landmark displacement, audio-video synchronization
              measurements, or named generative-model attribution
              because the current analysis pipeline does not
              calculate those measurements.
            </p>
          </div>

        </div>

      </section>

      {/* Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs text-slate-500 leading-relaxed">

        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />

        <p>
          <span className="font-semibold text-slate-700">
            Disclaimer:
          </span>{' '}
          This report contains file-level forensic checks and
          AI-assisted classification results. These results are
          intended to support investigation and should not be
          treated as definitive legal proof without appropriate
          expert review.
        </p>

      </div>

    </div>
  );
};

const EvidenceItem: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">

      <span className="text-[10px] uppercase font-mono text-slate-400">
        {label}
      </span>

      <p className="text-sm font-semibold text-slate-900 mt-1 break-all">
        {value}
      </p>

    </div>
  );
};

const IntegrityItem: React.FC<{
  label: string;
  valid?: boolean;
}> = ({ label, valid }) => {
  return (
    <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">

      <span className="text-xs font-semibold text-slate-700">
        {label}
      </span>

      {valid === true ? (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-bold">
            Valid
          </span>
        </div>
      ) : valid === false ? (
        <div className="flex items-center gap-1.5 text-rose-700">
          <XCircle className="w-4 h-4" />
          <span className="text-xs font-bold">
            Invalid
          </span>
        </div>
      ) : (
        <span className="text-xs font-mono text-slate-400">
          Unavailable
        </span>
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
    <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">

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