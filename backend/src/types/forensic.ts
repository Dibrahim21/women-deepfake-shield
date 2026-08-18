export type MediaType = 'image' | 'video' | 'audio';

export type IntegrityStatus = 'verified' | 'warning' | 'compromised';

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
  rawMetadataSummary?: Record<string, string | number | boolean>;
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
  type: 'integrity' | 'metadata' | 'format' | 'security';
  level: 'info' | 'warning' | 'alert';
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
  fileHash: string; // Cryptographic SHA-256
  fileSize: FileSizeInfo;
  mimeType: string;
  dimensions?: ImageDimensions;
  metadata?: MetadataInfo;
  integrity?: IntegrityCheck;
  forensicIndicators: ForensicIndicator[];
  status: 'completed_preliminary' | 'not_yet_supported' | 'analysis_pending';
  message: string;
  disclaimer: string;
  analyzedAt: string;
}

export type AIClassification = 'Authentic' | 'Suspicious' | 'Likely Deepfake';

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
  status: 'completed' | 'completed_preliminary_only' | 'not_yet_supported';
  preliminaryForensics: ForensicAnalysisResult;
  aiDetection: AIDetectionResult;
  analyzedAt: string;
}
