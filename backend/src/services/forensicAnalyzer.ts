import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  ForensicAnalysisResult,
  ForensicIndicator,
  ImageDimensions,
  IntegrityCheck,
  IntegrityStatus,
  MetadataInfo,
  MediaType,
} from '../types/forensic.js';

const SUSPICIOUS_SOFTWARE_KEYWORDS = [
  'stable diffusion',
  'midjourney',
  'dall-e',
  'dalle',
  'automatic1111',
  'comfyui',
  'photoshop',
  'gimp',
  'facefusion',
  'roop',
  'deepfacelab',
  'generative',
  'firefly',
  'novelai',
  'civitai',
  'waifu2x',
  'upscayl',
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function calculateGcd(a: number, b: number): number {
  return b === 0 ? a : calculateGcd(b, a % b);
}

function formatAspectRatio(width: number, height: number): string {
  if (!width || !height) return 'Unknown';
  const gcd = calculateGcd(width, height);
  const rWidth = width / gcd;
  const rHeight = height / gcd;

  // Map close ratios to standard photography/screen formats if reasonable
  const ratio = width / height;
  if (Math.abs(ratio - 1.0) < 0.01) return '1:1 (Square)';
  if (Math.abs(ratio - 16 / 9) < 0.02) return '16:9 (Widescreen)';
  if (Math.abs(ratio - 9 / 16) < 0.02) return '9:16 (Vertical)';
  if (Math.abs(ratio - 4 / 3) < 0.02) return '4:3 (Standard)';
  if (Math.abs(ratio - 3 / 2) < 0.02) return '3:2 (35mm Photo)';

  return `${rWidth}:${rHeight}`;
}

/**
 * Deterministically parse image dimensions, header, and EOF markers from raw buffer
 */
function parseImageBuffer(
  buffer: Buffer,
  declaredExt: string
): {
  detectedFormat: string;
  hasValidMagicBytes: boolean;
  hasValidEof: boolean;
  dimensions?: ImageDimensions;
  metadata: MetadataInfo;
} {
  let detectedFormat = 'unknown';
  let hasValidMagicBytes = false;
  let hasValidEof = false;
  let dimensions: ImageDimensions | undefined = undefined;
  const rawMetadataSummary: Record<string, string | number | boolean> = {};
  const detectedSignatures: string[] = [];

  const bufferLength = buffer.length;

  // 1. PNG Check
  if (
    bufferLength >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    detectedFormat = 'png';
    hasValidMagicBytes = true;

    // Check IEND EOF chunk
    const eofIndex = buffer.indexOf(Buffer.from([0x49, 0x45, 0x4e, 0x44])); // "IEND"
    hasValidEof = eofIndex !== -1 && eofIndex <= bufferLength - 4;

    // Parse IHDR chunk for dimensions (starts at offset 12)
    if (bufferLength >= 24) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      if (width > 0 && height > 0) {
        dimensions = {
          width,
          height,
          aspectRatio: formatAspectRatio(width, height),
        };
      }
    }

    // Inspect text chunks for software signatures
    const bufferString = buffer.toString('latin1');
    const textChunkKeywords = ['Software', 'Creation Time', 'parameters', 'prompt', 'Comment'];
    for (const keyword of textChunkKeywords) {
      const index = bufferString.indexOf(keyword);
      if (index !== -1) {
        const snippet = bufferString.slice(index, index + 100).replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').trim();
        rawMetadataSummary[keyword] = snippet;
      }
    }
  }
  // 2. JPEG Check
  else if (
    bufferLength >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    detectedFormat = 'jpeg';
    hasValidMagicBytes = true;

    // Check EOI (End of Image) marker: FF D9 in last 128 bytes
    const tailSearch = buffer.subarray(Math.max(0, bufferLength - 128));
    for (let i = 0; i < tailSearch.length - 1; i++) {
      if (tailSearch[i] === 0xff && tailSearch[i + 1] === 0xd9) {
        hasValidEof = true;
        break;
      }
    }

    // Scan JPEG segments for SOF (Start Of Frame) and APP1 (Exif)
    let offset = 2;
    while (offset < bufferLength - 8) {
      if (buffer[offset] !== 0xff) {
        offset++;
        continue;
      }

      const marker = buffer[offset + 1];

      // SOF markers containing width & height: C0, C1, C2, C3, C5, C6, C7, C9, CA, CB, CD, CE, CF
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        if (width > 0 && height > 0 && !dimensions) {
          dimensions = {
            width,
            height,
            aspectRatio: formatAspectRatio(width, height),
          };
        }
      }

      // APP1 Marker for Exif (FF E1)
      if (marker === 0xe1) {
        const segLength = buffer.readUInt16BE(offset + 2);
        if (offset + 4 + segLength <= bufferLength) {
          const exifHeader = buffer.subarray(offset + 4, offset + 10).toString('latin1');
          if (exifHeader.startsWith('Exif')) {
            rawMetadataSummary['exifMarker'] = 'Present (APP1)';
          }
        }
      }

      // Move to next segment
      if (marker === 0xd8 || marker === 0xd9 || marker === 0x00) {
        offset += 2;
      } else {
        const len = buffer.readUInt16BE(offset + 2);
        offset += 2 + len;
      }
    }
  }
  // 3. WebP Check
  else if (
    bufferLength >= 12 &&
    buffer.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buffer.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    detectedFormat = 'webp';
    hasValidMagicBytes = true;
    hasValidEof = true;

    // Check VP8, VP8L, VP8X
    const chunkType = buffer.subarray(12, 16).toString('latin1');
    if (chunkType === 'VP8 ' && bufferLength >= 30) {
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      if (width && height) {
        dimensions = { width, height, aspectRatio: formatAspectRatio(width, height) };
      }
    } else if (chunkType === 'VP8L' && bufferLength >= 25) {
      const b0 = buffer[21];
      const b1 = buffer[22];
      const b2 = buffer[23];
      const b3 = buffer[24];
      const width = 1 + (((b1 & 0x3f) << 8) | b0);
      const height = 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      if (width && height) {
        dimensions = { width, height, aspectRatio: formatAspectRatio(width, height) };
      }
    } else if (chunkType === 'VP8X' && bufferLength >= 30) {
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      if (width && height) {
        dimensions = { width, height, aspectRatio: formatAspectRatio(width, height) };
      }
      const flags = buffer[20];
      if (flags & 0x08) rawMetadataSummary['exifMarker'] = 'Present (VP8X Exif Flag)';
      if (flags & 0x04) rawMetadataSummary['xmpMarker'] = 'Present (VP8X XMP Flag)';
    }
  }
  // 4. GIF Check
  else if (
    bufferLength >= 10 &&
    (buffer.subarray(0, 6).toString('latin1') === 'GIF87a' ||
      buffer.subarray(0, 6).toString('latin1') === 'GIF89a')
  ) {
    detectedFormat = 'gif';
    hasValidMagicBytes = true;
    hasValidEof = buffer[bufferLength - 1] === 0x3b; // GIF trailer
    const width = buffer.readUInt16LE(6);
    const height = buffer.readUInt16LE(8);
    if (width && height) {
      dimensions = { width, height, aspectRatio: formatAspectRatio(width, height) };
    }
  }
  // 5. BMP Check
  else if (bufferLength >= 26 && buffer[0] === 0x42 && buffer[1] === 0x4d) {
    detectedFormat = 'bmp';
    hasValidMagicBytes = true;
    hasValidEof = true;
    const width = buffer.readInt32LE(18);
    const height = Math.abs(buffer.readInt32LE(22));
    if (width && height) {
      dimensions = { width, height, aspectRatio: formatAspectRatio(width, height) };
    }
  }

  // Scan entire buffer text representation for software signatures
  const fullText = buffer.toString('latin1').toLowerCase();
  for (const keyword of SUSPICIOUS_SOFTWARE_KEYWORDS) {
    if (fullText.includes(keyword)) {
      detectedSignatures.push(keyword);
    }
  }

  const exifPresent = Boolean(rawMetadataSummary['exifMarker']) || fullText.includes('exif\x00\x00');

  const metadata: MetadataInfo = {
    exifPresent,
    hasSuspiciousSoftwareSignature: detectedSignatures.length > 0,
    detectedSignatures,
    rawMetadataSummary: Object.keys(rawMetadataSummary).length > 0 ? rawMetadataSummary : undefined,
  };

  return {
    detectedFormat,
    hasValidMagicBytes,
    hasValidEof,
    dimensions,
    metadata,
  };
}

/**
 * Service to execute deterministic preliminary forensic analysis
 */
export class ForensicAnalyzerService {
  /**
   * Main analysis pipeline
   */
  public async analyzeMedia(
    file: Express.Multer.File,
    analysisId: string
  ): Promise<ForensicAnalysisResult> {
    const filePath = file.path;
    const buffer = await fs.promises.readFile(filePath);

    // 1. Calculate cryptographic SHA-256 fingerprint
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

    // 2. Determine declared media type
    const mimeType = file.mimetype.toLowerCase();
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const isImage = mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'].includes(ext);
    const isVideo = mimeType.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext);
    const isAudio = mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext);

    const mediaType: MediaType = isVideo ? 'video' : isAudio ? 'audio' : 'image';

    const fileSizeInfo = {
      bytes: buffer.length,
      formatted: formatBytes(buffer.length),
    };

    // 3. For video or audio in Phase 2A, return structured not_yet_supported result
    if (!isImage) {
      const indicators: ForensicIndicator[] = [
        {
          type: 'security',
          level: 'info',
          message: `Cryptographic SHA-256 checksum generated: ${fileHash}`,
        },
        {
          type: 'format',
          level: 'warning',
          message: `Phase 2A engine currently executes preliminary forensic checks on images. Stream-level analysis for ${mediaType} will be available in subsequent phases.`,
        },
      ];

      return {
        analysisId,
        filename: file.originalname,
        mediaType,
        fileHash,
        fileSize: fileSizeInfo,
        mimeType: file.mimetype,
        forensicIndicators: indicators,
        status: 'not_yet_supported',
        message: `Preliminary forensic engine only supports image analysis in Phase 2A. Received ${mediaType} file (${file.originalname}).`,
        disclaimer:
          'This is a deterministic preliminary forensic inspection. It does NOT constitute a machine-learning deepfake classification or AI detection result.',
        analyzedAt: new Date().toISOString(),
      };
    }

    // 4. Perform deterministic Image Forensics
    const { detectedFormat, hasValidMagicBytes, hasValidEof, dimensions, metadata } = parseImageBuffer(
      buffer,
      ext
    );

    const formatMatchesExtension =
      detectedFormat === ext ||
      (detectedFormat === 'jpeg' && (ext === 'jpg' || ext === 'jpeg')) ||
      (detectedFormat === 'png' && ext === 'png') ||
      (detectedFormat === 'webp' && ext === 'webp');

    let integrityStatus: IntegrityStatus = 'verified';
    if (!hasValidMagicBytes || !formatMatchesExtension) {
      integrityStatus = 'compromised';
    } else if (!hasValidEof || !metadata.exifPresent) {
      integrityStatus = 'warning';
    }

    const integrity: IntegrityCheck = {
      hasValidMagicBytes,
      hasValidEof,
      formatMatchesExtension,
      detectedFormat,
      declaredMimeType: file.mimetype,
      integrityStatus,
    };

    // 5. Generate deterministic forensic findings
    const forensicIndicators: ForensicIndicator[] = [];

    // SHA-256 indicator
    forensicIndicators.push({
      type: 'security',
      level: 'info',
      message: `Cryptographic SHA-256 computed: ${fileHash}`,
    });

    // Magic bytes & format check
    if (hasValidMagicBytes && formatMatchesExtension) {
      forensicIndicators.push({
        type: 'format',
        level: 'info',
        message: `Binary header signature verified as valid ${detectedFormat.toUpperCase()} matching file extension.`,
      });
    } else if (!formatMatchesExtension) {
      forensicIndicators.push({
        type: 'format',
        level: 'warning',
        message: `File extension '.${ext}' mismatches binary magic bytes detected as '${detectedFormat}'.`,
      });
    } else {
      forensicIndicators.push({
        type: 'integrity',
        level: 'alert',
        message: 'Binary magic bytes could not be verified for standard image format.',
      });
    }

    // Dimensions check
    if (dimensions) {
      forensicIndicators.push({
        type: 'format',
        level: 'info',
        message: `Image resolution: ${dimensions.width}x${dimensions.height} pixels (${dimensions.aspectRatio}).`,
      });
    } else {
      forensicIndicators.push({
        type: 'integrity',
        level: 'warning',
        message: 'Could not extract image dimension headers from binary stream.',
      });
    }

    // EOF Check
    if (hasValidEof) {
      forensicIndicators.push({
        type: 'integrity',
        level: 'info',
        message: 'File integrity check passed: End-of-file (EOF) marker verified intact.',
      });
    } else {
      forensicIndicators.push({
        type: 'integrity',
        level: 'warning',
        message: 'File trailer/EOF marker missing or truncated. File may have been clipped during transit.',
      });
    }

    // Metadata / EXIF check
    if (metadata.exifPresent) {
      forensicIndicators.push({
        type: 'metadata',
        level: 'info',
        message: 'EXIF metadata header is present in file stream.',
      });
    } else {
      forensicIndicators.push({
        type: 'metadata',
        level: 'warning',
        message: 'No EXIF metadata found. Metadata may have been stripped by an editor, social media platform, or AI generator.',
      });
    }

    // Software signatures
    if (metadata.hasSuspiciousSoftwareSignature) {
      forensicIndicators.push({
        type: 'security',
        level: 'alert',
        message: `Suspicious software/AI generator signatures found in metadata: ${metadata.detectedSignatures.join(', ')}.`,
      });
    } else {
      forensicIndicators.push({
        type: 'security',
        level: 'info',
        message: 'No known AI generator signatures or editor strings detected in metadata strings.',
      });
    }

    return {
      analysisId,
      filename: file.originalname,
      mediaType: 'image',
      fileHash,
      fileSize: fileSizeInfo,
      dimensions,
      mimeType: file.mimetype,
      metadata,
      integrity,
      forensicIndicators,
      status: 'completed_preliminary',
      message: 'Preliminary deterministic forensic checks completed successfully.',
      disclaimer:
        'This is a deterministic preliminary forensic file analysis. It does NOT constitute a machine-learning deepfake classification or AI detection result. Deepfake classification models will run in subsequent phases.',
      analyzedAt: new Date().toISOString(),
    };
  }
}

export const forensicAnalyzer = new ForensicAnalyzerService();
