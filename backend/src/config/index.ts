import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env if present
dotenv.config();

export interface AppConfig {
  port: number;
  corsOrigin: string[] | string;
  maxFileSizeMB: number;
  maxFileSizeBytes: number;
  uploadDir: string;

  // Supabase
  supabaseUrl: string;
  supabaseSecretKey: string;

  allowedMimeTypes: Record<string, 'image' | 'video' | 'audio'>;
}

const maxFileSizeMB = parseInt(
  process.env.MAX_FILE_SIZE_MB || '50',
  10
);

const corsOriginEnv = process.env.CORS_ORIGIN;

const parsedCorsOrigin = corsOriginEnv
  ? corsOriginEnv.includes(',')
    ? corsOriginEnv.split(',').map((o) => o.trim())
    : corsOriginEnv.trim()
  : [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
  ];

const rawUploadDir = process.env.UPLOAD_DIR || 'uploads';

const uploadDir = path.isAbsolute(rawUploadDir)
  ? rawUploadDir
  : process.cwd().endsWith('backend')
    ? path.resolve(
      process.cwd(),
      rawUploadDir.replace(/^backend[/\\]/, '')
    )
    : path.resolve(
      process.cwd(),
      rawUploadDir.startsWith('backend')
        ? rawUploadDir
        : path.join('backend', rawUploadDir)
    );

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),

  corsOrigin: parsedCorsOrigin,

  maxFileSizeMB,

  maxFileSizeBytes: maxFileSizeMB * 1024 * 1024,

  uploadDir,

  // Supabase configuration
  supabaseUrl: process.env.SUPABASE_URL || '',

  supabaseSecretKey:
    process.env.SUPABASE_SECRET_KEY || '',

  allowedMimeTypes: {
    // Images
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/webp': 'image',
    'image/gif': 'image',
    'image/bmp': 'image',
    'image/tiff': 'image',

    // Videos
    'video/mp4': 'video',
    'video/webm': 'video',
    'video/quicktime': 'video',
    'video/x-msvideo': 'video',
    'video/x-matroska': 'video',
    'video/avi': 'video',
    'video/mpeg': 'video',

    // Audio
    'audio/mpeg': 'audio',
    'audio/wav': 'audio',
    'audio/ogg': 'audio',
    'audio/mp4': 'audio',
    'audio/aac': 'audio',
    'audio/webm': 'audio',
  },
};