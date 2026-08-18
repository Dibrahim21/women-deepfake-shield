import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

import { uploadMedia } from '../middleware/upload.js';
import { forensicAnalyzer } from '../services/forensicAnalyzer.js';
import { aiDetectionService } from '../services/ai/index.js';
import { analysisStore } from '../services/analysisStore.js';
import { CombinedAnalysisResponse } from '../types/forensic.js';
import { config } from '../config/index.js';

export const analyzeRouter = Router();

/*
|--------------------------------------------------------------------------
| Supabase Admin Client
|--------------------------------------------------------------------------
| Uses the backend secret key only on the server.
| Never expose SUPABASE_SECRET_KEY to the frontend.
*/

const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.supabaseSecretKey
);

/*
|--------------------------------------------------------------------------
| Get authenticated Supabase user
|--------------------------------------------------------------------------
*/

async function getAuthenticatedUser(req: Request) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return null;
  }

  if (!authorization.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.substring(7).trim();

  if (!token) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

/*
|--------------------------------------------------------------------------
| POST /api/analyze
|--------------------------------------------------------------------------
|
| Full analysis pipeline:
| 1. Authenticate logged-in Supabase user
| 2. Upload validation
| 3. Preliminary forensic analysis
| 4. AI deepfake detection
| 5. Persist result with user_id
| 6. Return result
|
*/

analyzeRouter.post(
  '/analyze',
  uploadMedia,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      /*
      |--------------------------------------------------------------------------
      | Step 0: Authenticate user
      |--------------------------------------------------------------------------
      */

      const user = await getAuthenticatedUser(req);

      if (!user) {
        return res.status(401).json({
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message:
              'You must be logged in to analyze media.',
          },
        });
      }

      const userId = user.id;

      console.log(
        `[Analyze] Authenticated user: ${userId}`
      );

      /*
      |--------------------------------------------------------------------------
      | Step 1: Validate uploaded file
      |--------------------------------------------------------------------------
      */

      const file = req.file;

      if (!file) {
        return res.status(400).json({
          status: 'error',
          error: {
            code: 'MISSING_FILE',
            message:
              "No media file uploaded. Please upload an image or video file using multipart/form-data (field 'media' or 'file').",
          },
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Create unique analysis ID
      |--------------------------------------------------------------------------
      */

      const analysisId = crypto.randomUUID();

      /*
      |--------------------------------------------------------------------------
      | Step 2: Preliminary forensic analysis
      |--------------------------------------------------------------------------
      */

      const preliminaryForensics =
        await forensicAnalyzer.analyzeMedia(
          file,
          analysisId
        );

      /*
      |--------------------------------------------------------------------------
      | Step 3: AI deepfake detection
      |--------------------------------------------------------------------------
      */

      const buffer = await fs.promises.readFile(
        file.path
      );

      const aiDetection =
        await aiDetectionService.detect({
          buffer,
          mimeType: file.mimetype,
          filename: file.originalname,
          mediaType:
            preliminaryForensics.mediaType,
          preliminaryForensics,
        });

      /*
      |--------------------------------------------------------------------------
      | Step 4: Determine overall status
      |--------------------------------------------------------------------------
      */

      const status: CombinedAnalysisResponse['status'] =
        preliminaryForensics.status ===
        'not_yet_supported'
          ? 'not_yet_supported'
          : aiDetection.isOperational &&
              aiDetection.status === 'completed'
            ? 'completed'
            : 'completed_preliminary_only';

      /*
      |--------------------------------------------------------------------------
      | Combined response
      |--------------------------------------------------------------------------
      */

      const combinedResponse: CombinedAnalysisResponse = {
        analysisId,
        filename: file.originalname,
        mediaType:
          preliminaryForensics.mediaType,
        status,
        preliminaryForensics,
        aiDetection,
        analyzedAt:
          new Date().toISOString(),
      };

      /*
      |--------------------------------------------------------------------------
      | Step 5: Save analysis WITH user ID
      |--------------------------------------------------------------------------
      */

      await analysisStore.saveAnalysis(
        combinedResponse,
        userId
      );

      console.log(
        `[Analyze] Analysis ${analysisId} belongs to user ${userId}`
      );

      /*
      |--------------------------------------------------------------------------
      | Step 6: Return result
      |--------------------------------------------------------------------------
      */

      return res.status(200).json(
        combinedResponse
      );
    } catch (error) {
      return next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/analyze/:analysisId
|--------------------------------------------------------------------------
|
| Only the authenticated owner can retrieve the analysis.
|
*/

analyzeRouter.get(
  '/analyze/:analysisId',
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      /*
      |--------------------------------------------------------------------------
      | Authenticate user
      |--------------------------------------------------------------------------
      */

      const user =
        await getAuthenticatedUser(req);

      if (!user) {
        return res.status(401).json({
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message:
              'You must be logged in to access this analysis.',
          },
        });
      }

      const userId = user.id;

      /*
      |--------------------------------------------------------------------------
      | Validate analysis ID
      |--------------------------------------------------------------------------
      */

      const { analysisId } = req.params;

      if (
        !analysisId ||
        analysisId.trim() === ''
      ) {
        return res.status(400).json({
          status: 'error',
          error: {
            code: 'INVALID_ANALYSIS_ID',
            message:
              'An analysisId parameter is required.',
          },
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Get analysis belonging to this user
      |--------------------------------------------------------------------------
      */

      const analysis =
        await analysisStore.getAnalysis(
          analysisId,
          userId
        );

      if (!analysis) {
        return res.status(404).json({
          status: 'error',
          error: {
            code: 'ANALYSIS_NOT_FOUND',
            message:
              `No analysis found for ID: ${analysisId}`,
          },
        });
      }

      return res.status(200).json(
        analysis
      );
    } catch (error) {
      return next(error);
    }
  }
);