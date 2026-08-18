import React, { useState } from 'react';
import { 
  Download, 
  AlertOctagon, 
  Lock, 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  HelpCircle, 
  Info, 
  ExternalLink,
  ChevronRight,
  Phone,
  Scale,
  Globe,
  X
} from 'lucide-react';
import { SAFETY_CHECKLIST_DEFAULT } from '../data/mockData';

export const SafetyCenterView: React.FC = () => {
  const [checklist, setChecklist] = useState(SAFETY_CHECKLIST_DEFAULT);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const toggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Safety Center</h1>
        <p className="text-slate-600 text-sm mt-1 leading-relaxed">
          Resources and actionable steps to protect your privacy and take control of your digital security in the event of an incident.
        </p>
      </div>

      {/* 4 Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div 
          onClick={() => setActiveModal('preserve')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Preserve Evidence</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              How to save high-quality forensics for reporting.
            </p>
          </div>
        </div>

        <div 
          onClick={() => setActiveModal('report')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-rose-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Report Content</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Direct links to platform safety teams.
            </p>
          </div>
        </div>

        <div 
          onClick={() => setActiveModal('secure')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Secure Accounts</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Checklist for two-factor and password security.
            </p>
          </div>
        </div>

        <div 
          onClick={() => setActiveModal('legal')}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Official Authorities</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              When and how to contact legal professionals.
            </p>
          </div>
        </div>
      </div>

      {/* Evidence Preservation Checklist */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="text-blue-600 font-mono font-bold">⇄</div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Evidence Preservation Checklist
          </h2>
        </div>

        <div className="space-y-4 pt-1">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleChecklist(item.id)}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <button className="mt-0.5 text-blue-600 focus:outline-hidden">
                {item.completed ? (
                  <CheckSquare className="w-5 h-5 fill-blue-600 text-white" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                )}
              </button>
              <div>
                <p className={`text-xs font-mono font-bold ${
                  item.completed ? 'text-slate-900 line-through opacity-80' : 'text-slate-900'
                }`}>
                  {item.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reporting Guide */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Reporting Guide</h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          Brief summary of reporting to social platforms and local authorities.
        </p>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 font-sans text-xs text-slate-700">
          <ul className="space-y-2.5 list-disc list-inside">
            <li className="leading-relaxed">
              <span className="font-semibold text-slate-900">Use the platform's native reporting tools first</span> (e.g., "Report Post" -&gt; "Non-consensual explicit imagery").
            </li>
            <li className="leading-relaxed">
              <span className="font-semibold text-slate-900">Document all interactions</span> with platform support, saving ticket IDs and confirmation emails.
            </li>
            <li className="leading-relaxed">
              <span className="font-semibold text-slate-900">Contact local law enforcement</span> if there is extortion, blackmail, or immediate threat. Provide the preserved evidence dossier.
            </li>
          </ul>
        </div>
      </div>

      {/* Important Notice & Legal Support Button */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900">Important Notice</h3>
            <p className="text-xs text-slate-600 mt-1 font-mono italic">
              "AI detection is an assistive tool. Seek professional assistance for legal action."
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveModal('legal')}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl shadow-sm transition-all active:scale-98 text-xs font-mono"
        >
          <Scale className="w-4 h-4" />
          <span>Find Legal Support</span>
        </button>
      </div>

      {/* Interactive Modal for Safety Action Resources */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {activeModal === 'preserve' && 'Evidence Preservation Protocol'}
                {activeModal === 'report' && 'Major Platform Takedown Portals'}
                {activeModal === 'secure' && 'Account Lockdown Checklist'}
                {activeModal === 'legal' && 'Legal Support & Victim Advocacy Resources'}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeModal === 'legal' && (
              <div className="space-y-3 font-sans text-xs text-slate-600">
                <p>If you are targeted by non-consensual synthetic media or extortion, reach out to verified legal aid and takedown organizations:</p>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="font-bold text-slate-900">StopNCII.org</p>
                    <p className="text-slate-500 mt-0.5">Free platform to prevent the non-consensual sharing of intimate images online.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="font-bold text-slate-900">Cyber Civil Rights Initiative (CCRI)</p>
                    <p className="text-slate-500 mt-0.5">24/7 helpline and legal referrals for victims of nonconsensual imagery.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="font-bold text-slate-900">Take It Down (NCMEC)</p>
                    <p className="text-slate-500 mt-0.5">Helps remove explicit images and videos of individuals under 18.</p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'report' && (
              <div className="space-y-2.5 font-mono text-xs">
                <a href="https://help.instagram.com" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-800 font-bold">
                  <span>Instagram / Meta Safety Reporting</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a href="https://help.twitter.com" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-800 font-bold">
                  <span>X / Twitter Safety Center</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {activeModal === 'preserve' && (
              <div className="space-y-3 font-sans text-xs text-slate-700">
                <p>Ensure that original forensic traces are not stripped by web compression tools:</p>
                <ol className="list-decimal list-inside space-y-1.5 font-mono text-[11px]">
                  <li>Download raw master file directly from source URL.</li>
                  <li>Store in encrypted cloud vault or offline external storage.</li>
                  <li>Calculate SHA-256 hash using Women Deepfake Shield before opening.</li>
                </ol>
              </div>
            )}

            {activeModal === 'secure' && (
              <div className="space-y-3 font-sans text-xs text-slate-700">
                <p>Prevent unauthorized account takeovers with immediate hardening:</p>
                <ul className="list-disc list-inside space-y-1.5 font-mono text-[11px]">
                  <li>Enable hardware-backed 2FA (FIDO2 / Authenticator app).</li>
                  <li>Revoke all active active web sessions across all social accounts.</li>
                  <li>Change master email password immediately.</li>
                </ul>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-mono font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
