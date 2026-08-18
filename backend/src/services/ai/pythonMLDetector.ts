import {
  IAIDetectorProvider,
  MediaPayload,
  AIDetectionResult,
  AIClassification,
} from './types.js';

export class PythonMLDetector implements IAIDetectorProvider {
  public readonly name = 'Local Python Deepfake Detector';

  private readonly mlServiceUrl =
    process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001';

  public isConfigured(): boolean {
    return Boolean(this.mlServiceUrl);
  }

  public async detect(media: MediaPayload): Promise<AIDetectionResult> {
    const disclaimer =
      'AI detection is an automated probabilistic model evaluation and should be used alongside human forensic corroboration.';

    if (media.mediaType !== 'image') {
      return {
        provider: 'python-ml',
        modelName: 'prithivMLmods/deepfake-detector-model-v1',
        isOperational: false,
        status: 'unsupported_media',
        reasoning: `Image detection is currently enabled. ${media.mediaType} detection will be added in a later phase.`,
        disclaimer,
      };
    }

    try {
      const formData = new FormData();

   const blob = new Blob([new Uint8Array(media.buffer)], {
  type: media.mimeType,
});
      formData.append('file', blob, media.filename);

      const response = await fetch(`${this.mlServiceUrl}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `ML service returned HTTP ${response.status}: ${errorText}`
        );
      }

      const result = await response.json();

      const classification: AIClassification =
        result.classification === 'Likely Deepfake' ||
        result.classification === 'Suspicious' ||
        result.classification === 'Authentic'
          ? result.classification
          : 'Suspicious';

      return {
        provider: 'python-ml',
        modelName:
          result.model ||
          'prithivMLmods/deepfake-detector-model-v1',
        isOperational: true,
        status: 'completed',
        classification,
        confidenceScore: Math.round(
          Number(result.confidenceScore ?? 0)
        ),
        facialIntegrityScore:
          classification === 'Authentic'
            ? Math.round(Number(result.realProbability ?? 0))
            : Math.round(
                100 - Number(result.fakeProbability ?? 0)
              ),
        reasoning:
          `Python ML model classified this image as ${classification}. ` +
          `Fake probability: ${result.fakeProbability ?? 0}%. ` +
          `Real probability: ${result.realProbability ?? 0}%.`,
        detectedArtifacts: [],
        disclaimer,
      };
    } catch (error: any) {
      return {
        provider: 'python-ml',
        modelName:
          'prithivMLmods/deepfake-detector-model-v1',
        isOperational: false,
        status: 'failed',
        errorDetails:
          error?.message ||
          'Python ML service could not complete inference.',
        reasoning:
          'The local Python deepfake detection service could not be reached or failed during inference.',
        disclaimer,
      };
    }
  }
}

export const pythonMLDetector = new PythonMLDetector();