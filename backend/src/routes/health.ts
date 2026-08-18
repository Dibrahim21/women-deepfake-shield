import { Router, Request, Response } from 'express';

export const healthRouter = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
healthRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'Women Deepfake Shield API',
  });
});
