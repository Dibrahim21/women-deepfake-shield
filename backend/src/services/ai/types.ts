import { ForensicAnalysisResult } from '../../types/forensic.js';

export type AIClassification = 'Authentic' | 'Suspicious' | 'Likely Deepfake';

export type AIDetectionStatus =
  | 'completed'
  | 'ai_not_configured'
  | 'unsupported_media'
  | 'failed';

export interface AIDetectionResult {
  provider: string; // e.g. "gemini-multimodal", "none"
  modelName?: string; // e.g. "gemini-2.5-flash"
  isOperational: boolean;
  status: AIDetectionStatus;
  classification?: AIClassification;
  confidenceScore?: number; // 0 - 100, only when isOperational is true
  facialIntegrityScore?: number; // 0 - 100
  reasoning?: string;
  detectedArtifacts?: string[];
  requiredConfig?: {
    envVar: string;
    description: string;
  };
  errorDetails?: string;
  disclaimer: string;
}

export interface MediaPayload {
  buffer: Buffer;
  mimeType: string;
  filename: string;
  mediaType: 'image' | 'video' | 'audio';
  preliminaryForensics?: ForensicAnalysisResult;
}

export interface IAIDetectorProvider {
  readonly name: string;
  isConfigured(): boolean;
  detect(media: MediaPayload): Promise<AIDetectionResult>;
}
