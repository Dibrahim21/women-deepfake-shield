import React from 'react';
import { 
  ArrowLeft, 
  UploadCloud, 
  Cpu, 
  Search, 
  Scan, 
  FileText, 
  CheckCircle2, 
  Info,
  ArrowRight
} from 'lucide-react';
import { ViewMode } from '../types';

interface HowItWorksViewProps {
  onNavigate: (view: ViewMode) => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onNavigate }) => {
  const pipelineSteps = [
    {
      num: '1',
      title: 'Upload',
      desc: 'Secure ingress of media via encrypted channels.',
      icon: UploadCloud,
    },
    {
      num: '2',
      title: 'Preprocessing',
      desc: 'Optimization and automated face isolation algorithms.',
      icon: Cpu,
    },
    {
      num: '3',
      title: 'Analysis',
      desc: 'Deep forensic scans targeting texture, audio, and framing.',
      icon: Search,
    },
    {
      num: '4',
      title: 'Detection',
      desc: 'AI scoring against known synthetic signatures.',
      icon: Scan,
    },
    {
      num: '5',
      title: 'Findings',
      desc: 'Generation of evidence report and actionable guidance.',
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Back button */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="text-xs font-mono text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-blue-600">
          TECHNOLOGY OVERVIEW
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">How It Works</h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
          Understanding the forensic pipeline. Our proprietary AI isolates, analyzes, and verifies digital media to detect synthetic manipulation with clinical precision.
        </p>
      </div>

      {/* The Forensic Pipeline Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-3">
          The Forensic Pipeline
        </h2>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-dashed before:border-l-2 before:border-dashed before:border-blue-200">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative flex items-start gap-4">
                <div className="absolute -left-6 sm:-left-8 mt-0.5 w-7 h-7 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center text-blue-600 shadow-2xs z-10">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-mono font-bold text-slate-900">
                    {step.num}. {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What AI Can Determine */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">What AI Can Determine</h2>
        </div>

        <div className="space-y-4 font-sans text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <span className="text-blue-600 font-bold font-mono">→</span>
            <div>
              <span className="font-bold text-slate-900">Artifact Detection: </span>
              Identifies microscopic inconsistencies in pixels, noise patterns, and compression anomalies typical of Generative Adversarial Networks (GANs).
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="text-blue-600 font-bold font-mono">→</span>
            <div>
              <span className="font-bold text-slate-900">Temporal Inconsistencies: </span>
              Spots irregular blinking, unnatural facial muscle movements, and desynchronized audio-visual cues across video frames.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="text-blue-600 font-bold font-mono">→</span>
            <div>
              <span className="font-bold text-slate-900">Statistical Probability: </span>
              Provides a robust confidence score indicating the likelihood of synthetic manipulation based on trained datasets.
            </div>
          </div>
        </div>
      </div>

      {/* Limitations & Context */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-slate-500" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Limitations & Context</h2>
        </div>

        <div className="space-y-4 font-sans text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <span className="text-slate-400 font-bold font-mono">-</span>
            <div>
              <span className="font-bold text-slate-900">Absolute Certainty: </span>
              AI outputs probabilities, not absolute truths. Extreme low-resolution or heavily compressed files can degrade analysis accuracy.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="text-slate-400 font-bold font-mono">-</span>
            <div>
              <span className="font-bold text-slate-900">Intent Analysis: </span>
              The system detects manipulation but cannot determine the creator's intent (e.g., malicious vs. comedic or artistic).
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="text-slate-400 font-bold font-mono">-</span>
            <div>
              <span className="font-bold text-slate-900">Novel Algorithms: </span>
              While constantly updated, entirely new generation methods may initially yield lower confidence scores until the model is retrained.
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <button
        onClick={() => onNavigate('analyze-upload')}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl shadow-sm transition-all active:scale-98 text-xs font-mono"
      >
        <span>Test Media in Analysis Pipeline</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
