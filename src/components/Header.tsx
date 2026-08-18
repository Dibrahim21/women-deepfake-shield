import React, { useState } from 'react';
import { Bell, ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { ShieldLogo } from './ShieldLogo';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onBack?: () => void;
  unreadAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onBack,
  unreadAlertsCount = 2,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Subviews that have a back arrow
  const isDetailView = [
    'forensic-detail',
    'evidence-report',
    'case-detail',
    'how-it-works',
    'privacy-security',
    'legal-support'
  ].includes(currentView);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3.5 flex items-center justify-between shadow-xs transition-colors">
      <div className="flex items-center gap-3">
        {isDetailView && onBack ? (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden"
          >
            <ShieldLogo size={26} />
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                WOMEN DEEPFAKE SHIELD
              </h1>
            </div>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors focus:outline-hidden"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Notifications Dropdown Modal */}
        {showNotifications && (
          <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Security Alerts</h2>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
              <div 
                onClick={() => {
                  onNavigate('analysis-result');
                  setShowNotifications(false);
                }}
                className="py-3 px-1 hover:bg-slate-50 cursor-pointer rounded-lg transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-red-50 text-red-600 rounded-lg shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">High Risk Deepfake Detected</p>
                    <p className="text-xs text-slate-500 mt-0.5">Case #CS-9425 (evidence_clip.mp4) scored 84% synthetic probability.</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">10 mins ago</span>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => {
                  onNavigate('privacy-security');
                  setShowNotifications(false);
                }}
                className="py-3 px-1 hover:bg-slate-50 cursor-pointer rounded-lg transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Volatile Purge Completed</p>
                    <p className="text-xs text-slate-500 mt-0.5">All temporary forensic buffers cleared from volatile memory.</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => {
                  onNavigate('history');
                  setShowNotifications(false);
                }}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                View all logs
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
