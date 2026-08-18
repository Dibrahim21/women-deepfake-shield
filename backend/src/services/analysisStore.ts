import { CombinedAnalysisResponse } from '../types/forensic.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

class AnalysisStore {
  private store = new Map<string, CombinedAnalysisResponse>();
  private supabase: SupabaseClient | null = null;

  constructor() {
    if (config.supabaseUrl && config.supabaseSecretKey) {
      this.supabase = createClient(
        config.supabaseUrl,
        config.supabaseSecretKey
      );

      console.log('[AnalysisStore] Supabase persistence enabled.');
    } else {
      console.warn(
        '[AnalysisStore] Supabase credentials missing. Using in-memory storage.'
      );
    }
  }

  public async saveAnalysis(
    result: CombinedAnalysisResponse,
    userId: string
  ): Promise<void> {
    this.store.set(result.analysisId, result);

    if (!this.supabase) {
      return;
    }

    const { error } = await this.supabase
      .from('analysis_records')
      .upsert(
        {
          analysis_id: result.analysisId,
          user_id: userId,
          filename: result.filename,
          media_type: result.mediaType,
          mime_type: result.preliminaryForensics?.mimeType ?? null,
          file_size:
            result.preliminaryForensics?.fileSize?.bytes ?? null,
          sha256_hash:
            result.preliminaryForensics?.fileHash ?? null,
          status: result.status,
          forensic_result: result.preliminaryForensics ?? null,
          ai_result: result.aiDetection ?? null,
        },
        {
          onConflict: 'analysis_id',
        }
      );

    if (error) {
      console.error(
        '[AnalysisStore] Supabase save failed:',
        error.message
      );

      throw new Error(
        `Failed to persist analysis to Supabase: ${error.message}`
      );
    }

    console.log(
      `[AnalysisStore] Analysis ${result.analysisId} saved for user ${userId}.`
    );
  }

  public async getAnalysis(
    analysisId: string,
    userId?: string
  ): Promise<CombinedAnalysisResponse | undefined> {
    if (!this.supabase) {
      return this.store.get(analysisId);
    }

    let query = this.supabase
      .from('analysis_records')
      .select('*')
      .eq('analysis_id', analysisId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error(
        '[AnalysisStore] Supabase retrieval failed:',
        error.message
      );

      throw new Error(
        `Failed to retrieve analysis from Supabase: ${error.message}`
      );
    }

    if (!data) {
      return undefined;
    }

    const result: CombinedAnalysisResponse = {
      analysisId: data.analysis_id,
      filename: data.filename,
      mediaType: data.media_type,
      status: data.status,
      preliminaryForensics: data.forensic_result,
      aiDetection: data.ai_result,
      analyzedAt: data.created_at,
    };

    this.store.set(analysisId, result);

    return result;
  }

  public async hasAnalysis(
    analysisId: string,
    userId?: string
  ): Promise<boolean> {
    const result = await this.getAnalysis(
      analysisId,
      userId
    );

    return Boolean(result);
  }

  public async deleteAnalysis(
    analysisId: string,
    userId?: string
  ): Promise<boolean> {
    this.store.delete(analysisId);

    if (!this.supabase) {
      return true;
    }

    let query = this.supabase
      .from('analysis_records')
      .delete()
      .eq('analysis_id', analysisId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      console.error(
        '[AnalysisStore] Supabase delete failed:',
        error.message
      );

      return false;
    }

    return true;
  }

  public async getAllAnalyses(
    userId?: string
  ): Promise<CombinedAnalysisResponse[]> {
    if (!this.supabase) {
      return Array.from(this.store.values()).reverse();
    }

    let query = this.supabase
      .from('analysis_records')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        '[AnalysisStore] Supabase list failed:',
        error.message
      );

      throw new Error(
        `Failed to retrieve analyses from Supabase: ${error.message}`
      );
    }

    const results: CombinedAnalysisResponse[] =
      (data ?? []).map((row) => ({
        analysisId: row.analysis_id,
        filename: row.filename,
        mediaType: row.media_type,
        status: row.status,
        preliminaryForensics: row.forensic_result,
        aiDetection: row.ai_result,
        analyzedAt: row.created_at,
      }));

    for (const result of results) {
      this.store.set(result.analysisId, result);
    }

    return results;
  }

  public clear(): void {
    this.store.clear();
  }
}

export const analysisStore = new AnalysisStore();