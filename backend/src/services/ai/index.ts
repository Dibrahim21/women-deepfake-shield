import { pythonMLDetector } from './pythonMLDetector.js';
import { IAIDetectorProvider, MediaPayload, AIDetectionResult } from './types.js';
import { geminiDetector } from './geminiDetector.js';

export class AIDetectionService {
  private activeProvider: IAIDetectorProvider;

  constructor(provider: IAIDetectorProvider = pythonMLDetector) {
    this.activeProvider = provider;
  }

  /**
   * Set or swap the underlying AI detection provider
   */
  public setProvider(provider: IAIDetectorProvider): void {
    this.activeProvider = provider;
  }

  /**
   * Get the active provider's display name
   */
  public getActiveProviderName(): string {
    return this.activeProvider.name;
  }

  /**
   * Check if the active provider is configured with valid credentials
   */
  public isOperational(): boolean {
    return this.activeProvider.isConfigured();
  }

  /**
   * Run AI deepfake detection on media
   */
  public async detect(media: MediaPayload): Promise<AIDetectionResult> {
    return this.activeProvider.detect(media);
  }
}

export const aiDetectionService = new AIDetectionService();
export * from './types.js';
