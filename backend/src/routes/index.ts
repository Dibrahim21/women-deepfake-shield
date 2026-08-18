import { Router } from 'express';
import { healthRouter } from './health.js';
import { analyzeRouter } from './analyze.js';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(analyzeRouter);
