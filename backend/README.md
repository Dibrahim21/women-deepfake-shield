# Women Deepfake Shield — Backend API (Phase 3)

This is the backend service for the **Women Deepfake Shield** application. It is built with **Node.js**, **Express**, and **TypeScript**, combining deterministic preliminary file heuristics with multimodal AI deepfake detection.

---

## Features (Phase 3)

- **Express + TypeScript Architecture**: Modular, typed, and scalable design.
- **AI Detection Abstraction Layer (`backend/src/services/ai/`)**:
  - Provider interface (`IAIDetectorProvider`) decoupling AI model inference from the HTTP routing layer.
  - **Google Gemini 2.5 Flash Multimodal Vision Provider** (`geminiDetector.ts`) analyzing:
    - Facial boundary blending & smoothing artifacts
    - Ocular asymmetry and corneal light reflection distortion
    - Teeth, ear, and hair boundary anomalies
    - Ambient lighting & perspective consistency
    - Frequency & compression artifact mismatches
  - **Zero Fake Scores**: When `GEMINI_API_KEY` is not present, returns `status: "ai_not_configured"` with explicit setup guidance instead of fabricating synthetic predictions.
- **Deterministic Preliminary Image Forensics (`backend/src/services/forensicAnalyzer.ts`)**:
  - Cryptographic **SHA-256 binary hash** calculation.
  - Dimension extraction (`width`, `height`, `aspectRatio`) for PNG, JPEG, WebP, GIF, and BMP.
  - Binary **magic bytes vs declared extension** validation.
  - **End-of-File (EOF) integrity validation** to detect stream truncation.
  - **EXIF & metadata inspection** and stripping detection.
  - **Suspicious AI/editor signature scanning** (`Stable Diffusion`, `Midjourney`, `DALL-E`, `Photoshop`, `FaceFusion`, etc.).
- **Combined Analysis Pipeline**:
  - Staged flow: `Upload` → `Validation` → `Preliminary Forensics` → `AI Deepfake Inference` → `Combined Storage & Response`.
- **In-Memory Analysis Store (`backend/src/services/analysisStore.ts`)**:
  - Thread-safe storage of combined analysis records accessible via `GET /api/analyze/:analysisId`.
- **RESTful Endpoints**:
  - `GET /api/health` — Service health check.
  - `POST /api/analyze` — Multipart media upload and combined analysis pipeline.
  - `GET /api/analyze/:analysisId` — Retrieve combined analysis records by analysis ID.

---

## Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── index.ts               # Centralized configuration & environment loader
│   ├── middleware/
│   │   ├── upload.ts              # Multer storage, MIME validation & security filter
│   │   └── errorHandler.ts        # Global error handling middleware
│   ├── routes/
│   │   ├── health.ts              # GET /api/health endpoint
│   │   ├── analyze.ts             # POST /api/analyze & GET /api/analyze/:analysisId
│   │   └── index.ts               # Central API router (/api)
│   ├── services/
│   │   ├── ai/
│   │   │   ├── types.ts           # AI detection interfaces & contracts
│   │   │   ├── geminiDetector.ts  # Google Gemini 2.5 Multimodal AI Provider
│   │   │   └── index.ts           # AI Detection orchestrator service
│   │   ├── analysisStore.ts       # Modular analysis storage repository
│   │   └── forensicAnalyzer.ts    # Deterministic preliminary forensic engine
│   ├── types/
│   │   └── forensic.ts            # TypeScript interfaces & types
│   ├── app.ts                     # Express application factory
│   └── index.ts                   # Server entry point
├── scripts/
│   ├── verify-phase2a.mjs         # Forensic engine regression tests
│   └── verify-phase3.mjs          # Phase 3 AI pipeline verification suite
├── uploads/
│   └── .gitkeep                   # Temporary media upload destination
├── package.json                   # Backend package configuration
├── tsconfig.json                  # TypeScript compiler configuration
└── README.md                      # Backend documentation
```

---

## Environment Variables

Copy `.env.example` to `.env` or set environment variables:

```bash
# Server Port
PORT=5000

# CORS Allowed Origins
CORS_ORIGIN="http://localhost:3000,http://127.0.0.1:3000"

# Maximum Upload Size in Megabytes
MAX_FILE_SIZE_MB=50

# Google Gemini API Key (Required for live AI vision deepfake inference)
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
```

---

## Installation & Running

From the `backend/` directory (or project root):

```bash
# 1. Install dependencies
npm install

# 2. Start Backend in Development Mode (with hot-reload)
npm run dev

# 3. Build & Run in Production Mode
npm run build
npm start
```

---

## Combined API Response Schema

### `POST /api/analyze` & `GET /api/analyze/:analysisId`

```json
{
  "analysisId": "7d36258b-2aba-400f-b5ed-622e4d33666e",
  "filename": "sample.png",
  "mediaType": "image",
  "status": "completed",
  "preliminaryForensics": {
    "analysisId": "7d36258b-2aba-400f-b5ed-622e4d33666e",
    "filename": "sample.png",
    "mediaType": "image",
    "fileHash": "d2481afe274fa67769acccaf264b81d0956fbf6796477b8a6735741b775f42d9",
    "fileSize": {
      "bytes": 70,
      "formatted": "70 Bytes"
    },
    "mimeType": "image/png",
    "dimensions": {
      "width": 1024,
      "height": 768,
      "aspectRatio": "4:3 (Standard)"
    },
    "metadata": {
      "exifPresent": false,
      "hasSuspiciousSoftwareSignature": false,
      "detectedSignatures": []
    },
    "integrity": {
      "hasValidMagicBytes": true,
      "hasValidEof": true,
      "formatMatchesExtension": true,
      "detectedFormat": "png",
      "declaredMimeType": "image/png",
      "integrityStatus": "warning"
    },
    "forensicIndicators": [
      {
        "type": "security",
        "level": "info",
        "message": "Cryptographic SHA-256 computed: d2481afe..."
      },
      {
        "type": "format",
        "level": "info",
        "message": "Binary header signature verified as valid PNG matching file extension."
      }
    ],
    "status": "completed_preliminary",
    "message": "Preliminary deterministic forensic checks completed successfully.",
    "disclaimer": "This is a deterministic preliminary forensic file analysis. It does NOT constitute a machine-learning deepfake classification.",
    "analyzedAt": "2026-08-15T15:01:45.000Z"
  },
  "aiDetection": {
    "provider": "gemini-multimodal",
    "modelName": "gemini-2.5-flash",
    "isOperational": true,
    "status": "completed",
    "classification": "Likely Deepfake",
    "confidenceScore": 89,
    "facialIntegrityScore": 32,
    "reasoning": "Facial boundary exhibits blending artifacts and corneal light reflections in the left eye are geometrically inconsistent with the right eye light source.",
    "detectedArtifacts": [
      "Ocular light reflection mismatch",
      "Mandibular boundary blending",
      "Synthetic skin smoothing"
    ],
    "disclaimer": "AI detection is an automated probabilistic model evaluation and should be used alongside human forensic corroboration."
  },
  "analyzedAt": "2026-08-15T15:01:45.000Z"
}
```

---

## Automated Verification Suites

```bash
# Run Phase 3 AI pipeline tests
node backend/scripts/verify-phase3.mjs

# Run Phase 2A forensic regression tests
node backend/scripts/verify-phase2a.mjs
```
