import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(): Express {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
        if (!origin) return callback(null, true);

        if (Array.isArray(config.corsOrigin)) {
          if (
            config.corsOrigin.includes(origin) ||
            config.corsOrigin.includes('*') ||
            origin.includes('localhost') ||
            origin.includes('127.0.0.1')
          ) {
            return callback(null, true);
          }
        } else if (
          config.corsOrigin === '*' ||
          config.corsOrigin === origin ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1')
        ) {
          return callback(null, true);
        }

        return callback(null, true); // Permissive during local development
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
    })
  );

  // Standard body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api', apiRouter);

  // 404 handler for unmatched routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      status: 'error',
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();

// Start server if executed directly (e.g. `tsx src/app.ts` or `node dist/app.js`)
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('app.ts') ||
    process.argv[1].endsWith('app.js') ||
    process.argv[1].includes('app'));

if (isDirectRun) {
  const server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log('  Women Deepfake Shield - Backend API (Phase 1)');
    console.log('====================================================');
    console.log(`  Server running on: http://localhost:${config.port}`);
    console.log(`  Health Check:     http://localhost:${config.port}/api/health`);
    console.log(`  Media Analysis:   http://localhost:${config.port}/api/analyze`);
    console.log(`  Upload Directory: ${config.uploadDir}`);
    console.log(`  Max File Size:    ${config.maxFileSizeMB} MB`);
    console.log('====================================================');
  });

  const handleShutdown = (signal: string) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);
    server.close(() => {
      console.log('Server closed successfully.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

export default app;
