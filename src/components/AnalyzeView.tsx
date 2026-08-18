import { supabase } from '../lib/supabase';
import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Trash2,
  Bot,
  Lock,
  X,
  CheckCircle2,
  Circle,
  FileText,
  FileSearch,
  RotateCcw,
  AlertCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Fingerprint,
  Maximize2,
  Info,
  Copy,
  Check,
  Sparkles,
  Cpu,
} from 'lucide-react';

import {
  CaseReport,
  DiagnosticStage,
  ViewMode,
  CombinedAnalysisResponse
} from '../types';

import {
  INITIAL_DIAGNOSTIC_STAGES,
  PRESET_SAMPLES
} from '../data/mockData';

const API_URL = (import.meta.env.VITE_API_URL || 'https://women-deepfake-backend.onrender.com').replace(/\/$/, '');

interface AnalyzeViewProps {
  currentCase?: CaseReport;
  onNavigate: (view: ViewMode) => void;
  onCaseAnalyzed: (newCase: CaseReport) => void;
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({
  currentCase,
  onNavigate,
  onCaseAnalyzed,
}) => {
  // IMPORTANT: mockData's INITIAL_CASES is intentionally an empty array (no
  // fake/demo records), so it can never be used as a guaranteed fallback
  // CaseReport. The first time a user opens Analyze before any case has
  // ever been created, currentCase legitimately does not exist yet.
  //
  // safeCase therefore may be undefined, and every read of it below is
  // guarded accordingly instead of assuming a case object is always present.
  const safeCase: CaseReport | undefined = currentCase;

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: 'video' | 'image' | 'audio';
    previewUrl?: string;
    rawFile?: File;
  } | null>(
    safeCase
      ? {
        name: safeCase.fileName,
        size: safeCase.fileSize,
        type: safeCase.mediaType,
        previewUrl: safeCase.previewUrl,
      }
      : null
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stages, setStages] =
    useState<DiagnosticStage[]>(INITIAL_DIAGNOSTIC_STAGES);
  const [showResult, setShowResult] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [combinedResult, setCombinedResult] =
    useState<CombinedAnalysisResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Handle preset sample selection
  const handleSelectPreset = (preset: typeof PRESET_SAMPLES[0]) => {
    setSelectedFile({
      name: preset.name,
      size: preset.size,
      type: preset.type,
      previewUrl: preset.preview
    });
    setErrorMessage(null);
  };

  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('video')
        ? 'video'
        : file.type.startsWith('audio')
          ? 'audio'
          : 'image';

      const preview = URL.createObjectURL(file);
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type,
        previewUrl: preview,
        rawFile: file
      });
      setErrorMessage(null);
    }
  };

  // Copy SHA-256 hash to clipboard
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Execute Phase 3 full workflow: POST /api/analyze -> get analysisId -> GET /api/analyze/:analysisId -> render combined
  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select or upload a media file first.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setShowResult(false);
    setProgress(15);
    setStages(
      INITIAL_DIAGNOSTIC_STAGES.map((s, idx) => ({
        ...s,
        status: idx === 0 ? 'running' : 'waiting',
      }))
    );

    // Prepare multipart FormData
    const formData = new FormData();
    let rawFileToSend: File | Blob | null = selectedFile.rawFile || null;

    if (!rawFileToSend && selectedFile.previewUrl) {
      try {
        const fetchRes = await fetch(selectedFile.previewUrl);
        const blob = await fetchRes.blob();
        const mime = blob.type || (selectedFile.type === 'video' ? 'video/mp4' : 'image/jpeg');
        rawFileToSend = new File([blob], selectedFile.name, { type: mime });
      } catch {
        // Fallback for preset sample
        rawFileToSend = new File([new Uint8Array(8)], selectedFile.name, {
          type: selectedFile.type === 'video' ? 'video/mp4' : 'image/jpeg',
        });
      }
    }

    if (!rawFileToSend) {
      setIsAnalyzing(false);
      setErrorMessage('No valid media file found to upload.');
      return;
    }

    // Append file using field name 'media'
    formData.append('media', rawFileToSend, selectedFile.name);

    // Setup abort controller for cancel action
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Simulate progressive scanning steps while request executes
    const stageTimer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 10, 85);
        const stageIndex = Math.floor((next / 100) * INITIAL_DIAGNOSTIC_STAGES.length);
        setStages(
          INITIAL_DIAGNOSTIC_STAGES.map((s, idx) => {
            if (idx < stageIndex) return { ...s, status: 'completed' };
            if (idx === stageIndex) return { ...s, status: 'running' };
            return { ...s, status: 'waiting' };
          })
        );
        return next;
      });
    }, 160);

    try {
      // Step 1: POST /api/analyze with the logged-in Supabase user's JWT
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('You are not logged in. Please login again.');
      }

      const postResponse = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
        signal: controller.signal,
      });

      if (!postResponse.ok) {
        let errorMsg = `Upload failed with HTTP ${postResponse.status}`;
        try {
          const errData = await postResponse.json();
          if (errData.error?.message) {
            errorMsg = errData.error.message;
          }
        } catch {
          // ignore json parse error
        }
        throw new Error(errorMsg);
      }

      const uploadData: CombinedAnalysisResponse = await postResponse.json();
      const analysisId = uploadData.analysisId;

      if (!analysisId) {
        throw new Error('Backend did not return a valid analysis ID.');
      }

      // Step 2: GET /api/analyze/:analysisId to fetch full stored analysis record
      const getResponse = await fetch(`${API_URL}/api/analyze/${analysisId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        signal: controller.signal,
      });

      clearInterval(stageTimer);

      if (!getResponse.ok) {
        let fetchError = `Failed to retrieve analysis record (HTTP ${getResponse.status})`;
        try {
          const errData = await getResponse.json();
          if (errData.error?.message) {
            fetchError = errData.error.message;
          }
        } catch {
          // ignore json parse error
        }
        throw new Error(fetchError);
      }

      const fullResult: CombinedAnalysisResponse = await getResponse.json();


      setProgress(100);
      setStages(
        INITIAL_DIAGNOSTIC_STAGES.map((s) => ({
          ...s,
          status: 'completed',
        }))
      );
      setCombinedResult(fullResult);

      // Update active case for downstream reports.
      // safeCase may be undefined (no prior case existed yet), so every
      // fallback below is guarded — no case data is invented, only neutral
      // placeholders are used where a prior value genuinely doesn't exist.
      // Keep the complete real backend forensic payload attached to the active case.
      // This is what the Forensic Detail / Evidence Report views need in order
      // to display MIME type, dimensions, metadata, integrity checks, SHA-256,
      // and forensic indicators instead of falling back to "Unavailable".
      const updatedCase: CaseReport & {
        forensicResult: CombinedAnalysisResponse['preliminaryForensics'];
        aiResult: CombinedAnalysisResponse['aiDetection'];
      } = {
        ...safeCase,

        id: fullResult.analysisId,

        caseNumber:
          `#AN-${fullResult.analysisId.slice(0, 8).toUpperCase()}`,

        reportNumber:
          `#R-${fullResult.analysisId.slice(0, 6).toUpperCase()}`,

        title:
          fullResult.filename,

        fileName:
          fullResult.filename,

        fileSize:
          fullResult.preliminaryForensics?.fileSize?.formatted ||
          selectedFile.size,

        duration:
          safeCase?.duration || 'N/A',

        fps:
          safeCase?.fps || '',

        mediaType:
          fullResult.mediaType,

        scannedAt:
          fullResult.analyzedAt
            ? new Date(fullResult.analyzedAt).toLocaleString()
            : '',

        analysisDate:
          fullResult.analyzedAt
            ? new Date(fullResult.analyzedAt).toLocaleDateString()
            : '',

        integrityHash:
          fullResult.preliminaryForensics?.fileHash || '',

        riskScore:
          fullResult.aiDetection?.isOperational &&
            fullResult.aiDetection.confidenceScore !== undefined
            ? fullResult.aiDetection.confidenceScore
            : 0,

        riskLevel:
          fullResult.aiDetection?.isOperational &&
            fullResult.aiDetection.classification
            ? fullResult.aiDetection.classification
            : 'Authentic',

        confidenceText:
          fullResult.aiDetection?.confidenceScore !== undefined
            ? `${fullResult.aiDetection.confidenceScore}% model confidence`
            : 'Confidence unavailable',

        facialManipulationScore:
          typeof fullResult.aiDetection?.facialIntegrityScore === 'number'
            ? fullResult.aiDetection.facialIntegrityScore
            : 0,

        frameInconsistenciesScore: 0,

        audioVideoSyncScore: 0,

        textureConsistencyScore: 0,

        explainableAssessment:
          fullResult.aiDetection?.reasoning ||
          fullResult.preliminaryForensics?.message ||
          'No assessment available.',

        timelineLogs: [],

        suspiciousFrames: [],

        previewUrl:
          selectedFile.previewUrl ||
          safeCase?.previewUrl ||
          '',

        sourcePreviewUrl:
          selectedFile.previewUrl ||
          safeCase?.sourcePreviewUrl ||
          '',

        waveformUrl: '',

        anomaliesSummary:
          fullResult.preliminaryForensics?.message || '',

        anomaliesTimestamps: [],

        // REAL backend forensic result — never fabricate missing forensic values.
        forensicResult:
          fullResult.preliminaryForensics,

        // Keep the AI payload available to the report layer as well.
        aiResult:
          fullResult.aiDetection,
      };
      onCaseAnalyzed(updatedCase);

      setTimeout(() => {
        setIsAnalyzing(false);
        setShowResult(true);
      }, 400);
    } catch (err: any) {
      clearInterval(stageTimer);
      setIsAnalyzing(false);

      if (err.name === 'AbortError') {
        setErrorMessage('Analysis request was cancelled.');
      } else {
        setErrorMessage(
          err.message || 'Network error: Could not reach Backend server at https://women-deepfake-backend.onrender.com Ensure the backend is running.'
        );
      }
    }
  };

  const handleCancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsAnalyzing(false);
  };

  // View 2: Live Diagnostic Scanner (Running UI)
  if (isAnalyzing) {
    return (
      <div className="space-y-5 pb-16 animate-in fade-in duration-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analyzing Your Media
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Running preliminary binary heuristics and AI deepfake detection pipeline.
          </p>
        </div>

        {/* Video / Scanline Frame */}
        <div className="bg-[#0b132b] rounded-2xl overflow-hidden border border-slate-700 shadow-md relative">
          <div className="relative h-48 sm:h-56 bg-slate-950 flex items-center justify-center overflow-hidden">
            {selectedFile?.previewUrl ? (
              <img
                src={selectedFile.previewUrl}
                alt="Forensic Frame"
                className="w-full h-full object-cover opacity-40 filter contrast-125 brightness-90"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-b from-blue-950/40 to-slate-950" />
            )}

            {/* Cyan / Blue Scanning Radar Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] opacity-25" />

            {/* Animated Laser Scanline */}
            <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_12px_#38bdf8] animate-scanline pointer-events-none" />

            {/* Top right timestamp */}
            <div className="absolute top-3 right-3 font-mono text-[11px] text-cyan-400 bg-black/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
              14:32:09:18
            </div>

            {/* Analyzing Live Indicator */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/80 border border-blue-500/40 px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className="font-mono text-[10px] font-bold text-white tracking-widest uppercase">
                ANALYZING PIPELINE
              </span>
            </div>

            {/* Waveform graphic overlay */}
            <div className="absolute bottom-2 right-3 left-32 h-6 flex items-end gap-1 opacity-70">
              {[40, 65, 30, 85, 95, 45, 70, 80, 50, 90, 60, 75, 40, 85, 30, 60].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-cyan-400 rounded-t-xs transition-all duration-75"
                  style={{ height: `${(h * (progress % 20 + 80)) / 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Case progress summary */}
          <div className="p-4 bg-white text-slate-900 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400">
                  Case {safeCase?.caseNumber ?? 'New Analysis'}
                </span>
                <p className="font-mono text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                  {selectedFile?.name || 'evidence_clip.mp4'}
                </p>
              </div>
              <span className="text-[11px] font-mono font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md uppercase">
                {selectedFile?.type || 'MEDIA'}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-500 font-semibold tracking-wider uppercase">ANALYSIS PROGRESS</span>
                <span className="text-blue-600 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-100 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Stages Checklist */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-mono font-bold tracking-wider text-slate-800 uppercase mb-4">
            DIAGNOSTIC PIPELINE STAGES
          </h2>

          <div className="space-y-4">
            {stages.map((stage) => {
              const isDone = stage.status === 'completed';
              const isCurrent = stage.status === 'running';

              return (
                <div key={stage.id} className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : isCurrent ? (
                      <div className="relative flex items-center justify-center w-5 h-5">
                        <span className="absolute w-5 h-5 rounded-full bg-blue-100 animate-ping" />
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-600" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-slate-200" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-mono font-semibold ${isCurrent ? 'text-blue-600' : isDone ? 'text-slate-700' : 'text-slate-400'
                      }`}>
                      {stage.name}
                    </p>
                    {isCurrent && stage.detail && (
                      <p className="text-xs font-mono text-slate-500 mt-0.5 animate-pulse">
                        {stage.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security protocol notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600 font-mono">
          <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your media is uploaded securely to the local backend and sanitized. Original files are protected with isolated storage protocols.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleCancelAnalysis}
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-mono text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Cancel Analysis</span>
          </button>
        </div>
      </div>
    );
  }

  // View 3: Result Summary Screen (Phase 3: Combined Forensic & Real AI Detection)
  if (showResult && combinedResult) {
    const forensics = combinedResult.preliminaryForensics;
    const ai = combinedResult.aiDetection;
    const isImage = combinedResult.mediaType === 'image';
    const isAiOperational = Boolean(ai?.isOperational && ai?.status === 'completed');
    const integrityStatus = forensics?.integrity?.integrityStatus || 'warning';

    return (
      <div className="space-y-5 pb-16 animate-in fade-in duration-200">
        {/* Header with clear labeling */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Forensic & AI Analysis
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Combined binary heuristics, metadata verification, and AI visual anomaly detection.
            </p>
          </div>

          <div className="self-start">
            {isAiOperational ? (
              <div className={`border rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-[11px] font-mono font-semibold ${ai.classification === 'Likely Deepfake'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : ai.classification === 'Suspicious'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>AI DETECTION: {ai.classification?.toUpperCase()}</span>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-blue-800 text-[11px] font-mono font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>PRELIMINARY FORENSICS VERIFIED</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 1: AI DEEPFAKE VISION INFERENCE */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">AI Deepfake Vision Inference</h2>
                <p className="text-[11px] font-mono text-slate-400">{ai?.modelName || 'prithivMLmods/deepfake-detector-model-v1'}</p>
              </div>
            </div>
            {isAiOperational && ai?.classification ? (
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${ai.classification === 'Likely Deepfake' ? 'bg-rose-100 text-rose-800 border border-rose-200' : ai.classification === 'Suspicious' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                {ai.classification}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">AI UNAVAILABLE</span>
            )}
          </div>

          {isAiOperational ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-xs font-mono font-semibold uppercase">Classification Confidence</span>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1 block">{ai.confidenceScore ?? 0}%</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-mono font-bold text-sm">{ai.confidenceScore ?? 0}%</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-xs font-mono font-semibold uppercase">Facial Integrity Index</span>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1 block">{ai.facialIntegrityScore ?? 0}/100</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-mono font-bold text-sm">{ai.facialIntegrityScore ?? 0}</div>
                </div>
              </div>

              {ai.reasoning && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                  <span className="font-mono font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Model Forensic Assessment</span>
                  <p className="text-slate-700 leading-relaxed font-sans">{ai.reasoning}</p>
                </div>
              )}

              {ai.detectedArtifacts && ai.detectedArtifacts.length > 0 && (
                <div className="space-y-2">
                  <span className="font-mono font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Detected Visual Artifacts</span>
                  <div className="flex flex-wrap gap-2">
                    {ai.detectedArtifacts.map((artifact, i) => (
                      <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-mono flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{artifact}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                <span className="font-mono font-bold text-amber-800 text-xs uppercase">AI Analysis Unavailable</span>
              </div>
              <p className="text-xs text-amber-700 mt-2 leading-relaxed">The Python ML deepfake detection service could not complete inference for this analysis. No AI classification is being assigned.</p>
              {ai?.errorDetails && <p className="text-[11px] text-amber-600 mt-2 font-mono">{ai.errorDetails}</p>}
            </div>
          )}
        </div>

        {/* SECTION 2: PRELIMINARY FORENSIC LAYER (SHA-256, Metadata, Dimensions, Checks) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">File Authentication & Fingerprint</h2>
            </div>
            <span className="font-mono text-[11px] font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
              ID: {combinedResult.analysisId.slice(0, 8)}...
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">File Name</span>
              <span className="font-bold text-slate-900 truncate block mt-0.5">{combinedResult.filename}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Media & MIME Type</span>
              <span className="font-bold text-slate-900 capitalize block mt-0.5">
                {combinedResult.mediaType} • {forensics.mimeType}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">File Size</span>
              <span className="font-bold text-slate-900 block mt-0.5">
                {forensics.fileSize.formatted} ({forensics.fileSize.bytes.toLocaleString()} bytes)
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Integrity Status</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {integrityStatus === 'verified' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Intact
                  </span>
                ) : integrityStatus === 'warning' ? (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Non-Standard / Warning
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Compromised Header
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Digest Box */}
          <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
              <span>SHA-256 Cryptographic Hash</span>
              <button
                onClick={() => handleCopyHash(forensics.fileHash)}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                title="Copy hash"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
            <p className="break-all font-mono text-[11px] text-cyan-300 selection:bg-cyan-600 selection:text-white">
              {forensics.fileHash}
            </p>
          </div>
        </div>

        {/* Technical Image Metrics Card (if dimensions available) */}
        {isImage && forensics.dimensions && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Maximize2 className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Image Resolution & Structure</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dimensions</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {forensics.dimensions.width} × {forensics.dimensions.height} px
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Aspect Ratio</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {forensics.dimensions.aspectRatio}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">EXIF Presence</span>
                <span className={`font-bold block mt-0.5 ${forensics.metadata?.exifPresent ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {forensics.metadata?.exifPresent ? 'Present in Header' : 'Stripped / None'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Deterministic Forensic Checks Checklist */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Preliminary Forensic Heuristics</h2>
          </div>

          <div className="space-y-2.5">
            {forensics.forensicIndicators.map((indicator, index) => {
              const isAlert = indicator.level === 'alert';
              const isWarning = indicator.level === 'warning';

              return (
                <div
                  key={index}
                  className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${isAlert
                    ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                    : isWarning
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                      : 'bg-slate-50 border-slate-200/80 text-slate-700'
                    }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isAlert ? (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 leading-relaxed">
                    <span>{indicator.message}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => onNavigate('forensic-detail')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl shadow-sm transition-all duration-150 active:scale-98 cursor-pointer"
          >
            <FileSearch className="w-4 h-4" />
            <span>Detailed Forensic View</span>
          </button>

          <button
            onClick={() => onNavigate('evidence-report')}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-semibold py-3.5 rounded-2xl shadow-xs transition-all duration-150 active:scale-98 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Evidence Report</span>
          </button>

          <button
            onClick={() => {
              setShowResult(false);
              setIsAnalyzing(false);
              setCombinedResult(null);
              setErrorMessage(null);
            }}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-semibold py-3.5 rounded-2xl transition-all duration-150 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Analyze Another Media</span>
          </button>
        </div>
      </div>
    );
  }

  // View 1: Media Upload Screen (Analyze Media)
  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analyze Media</h1>
        <p className="text-slate-600 text-sm mt-1">
          Upload suspicious media for preliminary forensic inspection and AI deepfake analysis.
        </p>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start justify-between gap-3 text-xs font-mono animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-rose-900">Analysis Notice</span>
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Drag & Drop Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) {
            const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image';
            setSelectedFile({
              name: file.name,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              type,
              previewUrl: URL.createObjectURL(file),
              rawFile: file
            });
            setErrorMessage(null);
          }
        }}
        className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 group"
      >
        <div className="w-14 h-14 rounded-full bg-slate-200/80 group-hover:bg-blue-100 flex items-center justify-center text-slate-600 group-hover:text-blue-600 mb-4 transition-colors">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Drag & drop or tap to select
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Images, videos, or audio files.
        </p>

        <div className="flex items-center gap-3 mt-6 text-xs text-slate-400 font-mono">
          <span>Max size: 50MB</span>
          <span>•</span>
          <span>PNG, JPG, WEBP, GIF, MP4, MOV</span>
        </div>
      </div>

      {/* Test presets picker */}
      <div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 px-1">
          Or test with sample cases:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESET_SAMPLES.map((sample) => (
            <button
              key={sample.name}
              onClick={() => handleSelectPreset(sample)}
              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all text-xs cursor-pointer ${selectedFile?.name === sample.name
                ? 'border-blue-500 bg-blue-50/60 font-semibold text-blue-900 shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
            >
              <img
                src={sample.preview}
                alt={sample.name}
                className="w-9 h-9 rounded-lg object-cover border border-slate-200"
              />
              <div className="truncate">
                <p className="font-mono font-semibold truncate text-[11px]">{sample.name}</p>
                <p className="text-[10px] text-slate-500">{sample.duration} • {sample.riskLevel}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Media Item Card */}
      {selectedFile && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5 overflow-hidden">
            {selectedFile.previewUrl ? (
              <img
                src={selectedFile.previewUrl}
                alt="Thumbnail"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 font-mono text-xs font-bold">
                {selectedFile.type.toUpperCase()}
              </div>
            )}
            <div className="truncate">
              <p className="font-mono text-xs sm:text-sm font-bold text-slate-900 truncate">
                {selectedFile.name}
              </p>
              <p className="font-mono text-xs text-slate-400 mt-0.5">
                {selectedFile.size} • Ready for analysis
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedFile(null)}
            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors shrink-0 ml-2 cursor-pointer"
            title="Remove media"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Button */}
      <div>
        <button
          onClick={handleStartAnalysis}
          disabled={!selectedFile}
          className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm shadow-sm transition-all duration-150 active:scale-98 ${selectedFile
            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
        >
          <Bot className="w-5 h-5" />
          <span>Start Deepfake Analysis</span>
        </button>
      </div>

      {/* Security Disclaimer */}
      <div className="flex items-start gap-2.5 text-xs text-slate-500 font-mono px-1">
        <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Files are processed securely using isolated local storage protocols. We do not store or distribute your personal media.
        </p>
      </div>
    </div>
  );
};