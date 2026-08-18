import { GoogleGenAI } from '@google/genai';
import {
  IAIDetectorProvider,
  MediaPayload,
  AIDetectionResult,
  AIClassification,
} from './types.js';

export class GeminiDeepfakeDetector implements IAIDetectorProvider {
  public readonly name = 'Google Gemini 2.5 Flash Multimodal Vision';

  /**
   * Check if a genuine Gemini API key is configured
   */
  public isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY;
    return Boolean(key && key.trim() !== '' && key !== 'MY_GEMINI_API_KEY');
  }

  /**
   * Execute real multimodal deepfake detection
   */
  public async detect(media: MediaPayload): Promise<AIDetectionResult> {
    const disclaimer =
      'AI detection is an automated probabilistic model evaluation and should be used alongside human forensic corroboration.';

    // 1. Only image media is supported in Phase 3
    if (media.mediaType !== 'image') {
      return {
        provider: 'gemini-multimodal',
        modelName: 'gemini-2.5-flash',
        isOperational: false,
        status: 'unsupported_media',
        reasoning: `Phase 3 AI detection currently analyzes static image frames. Stream-level AI detection for ${media.mediaType} will be integrated in subsequent phases.`,
        disclaimer,
      };
    }

    // 2. Verify provider configuration
    if (!this.isConfigured()) {
      return {
        provider: 'gemini-multimodal',
        modelName: 'gemini-2.5-flash',
        isOperational: false,
        status: 'ai_not_configured',
        requiredConfig: {
          envVar: 'GEMINI_API_KEY',
          description:
            'Set a valid GEMINI_API_KEY in .env to activate real-time Gemini 2.5 Multimodal deepfake detection.',
        },
        reasoning:
          'AI Detection service is integration-ready. Set GEMINI_API_KEY to enable live multimodal visual anomaly analysis.',
        disclaimer,
      };
    }

    // 3. Execute live Gemini Multimodal Vision inspection
    try {
      const apiKey = process.env.GEMINI_API_KEY as string;
      const ai = new GoogleGenAI({ apiKey });

      const base64Data = media.buffer.toString('base64');
      const prompt = `
You are an expert digital media forensics AI specializing in detecting face swaps, GAN-generated faces, diffusion artifacts, synthetic warping, and digital manipulations.

Carefully inspect the attached image for deepfake and synthetic manipulation indicators, specifically:
1. Facial boundary blending, unnatural smoothing, or edge haloing.
2. Inconsistent ocular geometry, asymmetric corneal light reflections, or distorted pupil contours.
3. Teeth, ear, and hair boundary anomalies or repetitive diffusion patterns.
4. Lighting, shading, and perspective inconsistencies between face and surrounding background.
5. Compression artifacts or frequency mismatches between facial region and ambient context.

Respond ONLY with a valid JSON object matching this schema:
{
  "classification": "Authentic" | "Suspicious" | "Likely Deepfake",
  "confidenceScore": number, // integer from 0 to 100 reflecting confidence in the classification
  "facialIntegrityScore": number, // integer from 0 to 100 (100 = completely natural/consistent, 0 = severe manipulation)
  "reasoning": string, // concise summary of observed forensic evidence
  "detectedArtifacts": string[] // list of specific observed anomalies (e.g. "Ocular light reflection mismatch", "Mandibular edge blending")
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: media.mimeType,
            },
          },
          prompt,
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      let parsed: {
        classification?: AIClassification;
        confidenceScore?: number;
        facialIntegrityScore?: number;
        reasoning?: string;
        detectedArtifacts?: string[];
      } = {};

      try {
        parsed = JSON.parse(responseText);
      } catch {
        // Fallback parsing if wrapped in markdown code fence
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(cleanJson);
      }

      const classification: AIClassification =
        parsed.classification === 'Likely Deepfake' ||
        parsed.classification === 'Suspicious' ||
        parsed.classification === 'Authentic'
          ? parsed.classification
          : 'Suspicious';

      return {
        provider: 'gemini-multimodal',
        modelName: 'gemini-2.5-flash',
        isOperational: true,
        status: 'completed',
        classification,
        confidenceScore: Math.min(100, Math.max(0, Math.round(parsed.confidenceScore ?? 80))),
        facialIntegrityScore: Math.min(
          100,
          Math.max(0, Math.round(parsed.facialIntegrityScore ?? 50))
        ),
        reasoning: parsed.reasoning || 'AI visual inspection completed.',
        detectedArtifacts: Array.isArray(parsed.detectedArtifacts) ? parsed.detectedArtifacts : [],
        disclaimer,
      };
    } catch (err: any) {
      return {
        provider: 'gemini-multimodal',
        modelName: 'gemini-2.5-flash',
        isOperational: true,
        status: 'failed',
        errorDetails: err.message || 'AI detection model call encountered an error.',
        reasoning: 'The AI model service could not complete inference on this image.',
        disclaimer,
      };
    }
  }
}

export const geminiDetector = new GeminiDeepfakeDetector();
