import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { config } from '../config/index.js';

export interface ApiErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Handle Multer specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds the maximum allowed limit of ${config.maxFileSizeMB} MB.`,
        },
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'UNEXPECTED_FIELD',
          message: `Unexpected upload field. Please upload using form field 'media' or 'file'.`,
        },
      });
    }

    return res.status(400).json({
      status: 'error',
      error: {
        code: err.code || 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  }

  // Handle custom validation errors with status
  const statusCode = err.status || (err.code === 'INVALID_FILE_TYPE' ? 400 : 500);

  return res.status(statusCode).json({
    status: 'error',
    error: {
      code: err.code || (statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR'),
      message: err.message || 'An unexpected error occurred while processing your request.',
    },
  });
};
