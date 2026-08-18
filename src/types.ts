export type MediaType = 'video' | 'image' | 'audio';

export type RiskLevel =
  | 'Likely Deepfake'
  | 'Suspicious'
  | 'Authentic';

export interface TimelineAnomaly {
  time: string;
  vector: string;
  details: string;
  confidence?: number;
  anomalyType?: string;
}

export interface FrameExtraction {
  time: string;
  label: string;
  subtitle: string;
  imageUrl: string;
  boxLabel?: string;
  tagColor?: string;
}

/**
 * Real forensic result returned by the backend.
 */
export interface CaseForensicResult {
  analysisId?: string;
  filename?: string;
  mediaType?: MediaType;

  fileHash?: string;

  fileSize?: {
    bytes: number;
    formatted: string;
  };

  mimeType?: string;

  dimensions?: {
    width: number;
    height: number;
    aspectRatio: string;
  };

  metadata?: {
    exifPresent: boolean;
    software?: string;
    make?: string;
    model?: string;
    dateTime?: string;
    hasSuspiciousSoftwareSignature: boolean;
    detectedSignatures: string[];
    rawMetadataSummary?: Record<
      string,
      string | number | boolean
    >;
  };

  integrity?: {
    hasValidMagicBytes: boolean;
    hasValidEof: boolean;
    formatMatchesExtension: boolean;
    detectedFormat: string;
    declaredMimeType: string;
    integrityStatus:
      | 'verified'
      | 'warning'
      | 'compromised';
  };

  forensicIndicators?: ForensicIndicator[];

  status?:
    | 'completed_preliminary'
    | 'not_yet_supported'
    | 'analysis_pending';

  message?: string;

  disclaimer?: string;

  analyzedAt?: string;
}

export interface CaseReport {
  id: string;
  caseNumber: string;
  reportNumber: string;
  title: string;
  fileName: string;
  fileSize: string;
  duration: string;
  fps?: string;
  mediaType: MediaType;
  scannedAt: string;
  analysisDate: string;

  riskScore: number;
  riskLevel: RiskLevel;
  confidenceText: string;

  integrityHash: string;

  /*
   * REAL backend forensic payload
   */
  forensicResult?: CaseForensicResult;

  /*
   * REAL backend AI payload
   */
  aiResult?: AIDetectionResult;

  facialManipulationScore: number;
  frameInconsistenciesScore: number;
  audioVideoSyncScore: number;
  textureConsistencyScore?: number;

  explainableAssessment: string;

  /*
   * Kept for existing UI compatibility.
   * Current backend does not generate these,
   * so they must remain empty rather than fabricated.
   */
  timelineLogs: TimelineAnomaly[];
  suspiciousFrames: FrameExtraction[];

  previewUrl: string;
  sourcePreviewUrl?: string;
  waveformUrl?: string;

  anomaliesSummary?: string;
  anomaliesTimestamps?: string[];
}

export type TabType =
  | 'dashboard'
  | 'analyze'
  | 'history'
  | 'safety'
  | 'profile';

export type ViewMode =
  | 'dashboard'
  | 'analyze-upload'
  | 'analyzing-live'
  | 'analysis-result'
  | 'forensic-detail'
  | 'evidence-report'
  | 'case-detail'
  | 'safety'
  | 'how-it-works'
  | 'privacy-security'
  | 'history'
  | 'profile'
  | 'legal-support';

export interface DiagnosticStage {
  id: number;
  name: string;
  detail?: string;
  status:
    | 'waiting'
    | 'running'
    | 'completed'
    | 'failed';
}

// ==========================================
// Phase 2 & 3 Forensic & AI Analysis Types
// ==========================================

export type IntegrityStatus =
  | 'verified'
  | 'warning'
  | 'compromised';

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: string;
}

export interface MetadataInfo {
  exifPresent: boolean;
  software?: string;
  make?: string;
  model?: string;
  dateTime?: string;
  hasSuspiciousSoftwareSignature: boolean;
  detectedSignatures: string[];
  rawMetadataSummary?: Record<
    string,
    string | number | boolean
  >;
}

export interface IntegrityCheck {
  hasValidMagicBytes: boolean;
  hasValidEof: boolean;
  formatMatchesExtension: boolean;
  detectedFormat: string;
  declaredMimeType: string;
  integrityStatus: IntegrityStatus;
}

export interface ForensicIndicator {
  type:
    | 'integrity'
    | 'metadata'
    | 'format'
    | 'security';

  level:
    | 'info'
    | 'warning'
    | 'alert';

  message: string;
}

export interface FileSizeInfo {
  bytes: number;
  formatted: string;
}

export interface ForensicAnalysisResult {
  analysisId: string;
  filename: string;
  mediaType: MediaType;

  fileHash: string;

  fileSize: FileSizeInfo;

  mimeType: string;

  dimensions?: ImageDimensions;

  metadata?: MetadataInfo;

  integrity?: IntegrityCheck;

  forensicIndicators: ForensicIndicator[];

  status:
    | 'completed_preliminary'
    | 'not_yet_supported'
    | 'analysis_pending';

  message: string;

  disclaimer: string;

  analyzedAt: string;
}

export type AIClassification =
  | 'Authentic'
  | 'Suspicious'
  | 'Likely Deepfake';

export type AIDetectionStatus =
  | 'completed'
  | 'ai_not_configured'
  | 'unsupported_media'
  | 'failed';

export interface AIDetectionResult {
  provider: string;

  modelName?: string;

  isOperational: boolean;

  status: AIDetectionStatus;

  classification?: AIClassification;

  confidenceScore?: number;

  facialIntegrityScore?: number;

  reasoning?: string;

  detectedArtifacts?: string[];

  requiredConfig?: {
    envVar: string;
    description: string;
  };

  errorDetails?: string;

  disclaimer: string;
}

export interface CombinedAnalysisResponse {
  analysisId: string;

  filename: string;

  mediaType: MediaType;

  status:
    | 'completed'
    | 'completed_preliminary_only'
    | 'not_yet_supported';

  preliminaryForensics: ForensicAnalysisResult;

  aiDetection: AIDetectionResult;

  analyzedAt: string;
}