import { CaseReport, DiagnosticStage } from '../types';

// No fake/demo analysis records.
// Real cases will come from actual user uploads and Supabase.
export const INITIAL_CASES: CaseReport[] = [];

// Static UI stages used while an analysis is running.
export const INITIAL_DIAGNOSTIC_STAGES: DiagnosticStage[] = [
  {
    id: 1,
    name: 'Upload verification',
    detail: 'Secure SHA-256 integrity validation',
    status: 'completed',
  },
  {
    id: 2,
    name: 'Face detection',
    detail: 'Detecting facial regions and landmarks',
    status: 'completed',
  },
  {
    id: 3,
    name: 'Frame analysis',
    detail: 'Scanning for manipulation and visual artifacts',
    status: 'running',
  },
  {
    id: 4,
    name: 'Audio analysis',
    detail: 'Checking audio characteristics and synchronization',
    status: 'waiting',
  },
  {
    id: 5,
    name: 'Metadata analysis',
    detail: 'Checking EXIF, encoding and file consistency',
    status: 'waiting',
  },
  {
    id: 6,
    name: 'AI assessment',
    detail: 'Running AI-assisted media assessment',
    status: 'waiting',
  },
  {
    id: 7,
    name: 'Generating findings',
    detail: 'Compiling explainable analysis findings',
    status: 'waiting',
  },
];

// No fake/sample media.
// Users will analyze their own uploaded files.
export const PRESET_SAMPLES = [];

// Default safety guidance shown to users.
export const SAFETY_CHECKLIST_DEFAULT = [
  {
    id: 'save-original',
    title: 'Save original file',
    desc: 'Do not compress or alter the file. Download the highest resolution available.',
    completed: true,
  },
  {
    id: 'keep-metadata',
    title: "Don't delete metadata",
    desc: 'Metadata can be useful for forensic analysis. Keep files in their original format.',
    completed: true,
  },
  {
    id: 'capture-context',
    title: 'Capture context screenshots',
    desc: 'Take screenshots of the content in its original context, including URL, platform, profile, date and time when available.',
    completed: false,
  },
  {
    id: 'document-timeline',
    title: 'Document distribution timeline',
    desc: 'Record when you first saw the material and who shared or received it.',
    completed: false,
  },
  {
    id: 'hash-verification',
    title: 'Generate digital evidence hash',
    desc: 'Compute a SHA-256 checksum to help maintain evidence integrity.',
    completed: false,
  },
];