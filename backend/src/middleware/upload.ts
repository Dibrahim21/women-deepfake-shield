import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

// Ensure the upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Allowed file extensions matching our MIME types
const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff',
  '.mp4', '.webm', '.mov', '.avi', '.mkv',
  '.mp3', '.wav', '.ogg', '.m4a', '.aac'
]);

// Configure secure disk storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate a secure, non-colliding, non-executable filename
    const uniqueId = crypto.randomUUID();
    const rawExt = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.bin';
    const safeFilename = `${Date.now()}-${uniqueId}${safeExt}`;
    cb(null, safeFilename);
  },
});

// File filter for format validation
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const mimeType = file.mimetype.toLowerCase();
  const ext = path.extname(file.originalname).toLowerCase();

  // Validate both MIME type and extension
  const isMimeValid = Boolean(config.allowedMimeTypes[mimeType]);
  const isExtValid = ALLOWED_EXTENSIONS.has(ext);

  if (!isMimeValid && !isExtValid) {
    const error = new Error(
      `Unsupported file format (${mimeType || ext || 'unknown'}). Allowed formats: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV, MKV, MP3, WAV.`
    );
    (error as any).status = 400;
    (error as any).code = 'INVALID_FILE_TYPE';
    return cb(error as any);
  }

  cb(null, true);
};

// Base Multer instance
const uploadInstance = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeBytes,
    files: 1,
  },
  fileFilter,
});

/**
 * Flexible upload middleware accepting 'media' or 'file' field name, or single arbitrary field.
 */
export const uploadMedia = (req: Request, res: Response, next: NextFunction) => {
  const uploadHandler = uploadInstance.fields([
    { name: 'media', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]);

  uploadHandler(req, res, (err) => {
    if (err) {
      return next(err);
    }

    // Normalize single file to req.file if uploaded via fields
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files) {
      if (files['media'] && files['media'].length > 0) {
        req.file = files['media'][0];
      } else if (files['file'] && files['file'].length > 0) {
        req.file = files['file'][0];
      }
    }

    next();
  });
};
