import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

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

// Graceful shutdown handling
const handleShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('Server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
