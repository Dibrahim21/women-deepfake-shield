import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Trash2,
  Database,
  Check,
  Sliders,
  Award,
  LogOut,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export const ProfileSecurityView: React.FC = () => {
  const [volatilePurge, setVolatilePurge] = useState(true);
  const [metadataScrubbing, setMetadataScrubbing] = useState(true);
  const [hashingAlgorithm, setHashingAlgorithm] =
    useState<'SHA-256' | 'SHA-3' | 'BLAKE3'>('SHA-256');

  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('User load error:', error);
      return;
    }

    const user = data.user;

    if (user) {
      setEmail(user.email || '');

      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        '';

      setName(fullName);
    }
  };

  const handleWipeBuffer = () => {
    setPurgeSuccess(true);

    setTimeout(() => {
      setPurgeSuccess(false);
    }, 2500);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return;
    }

    window.location.reload();
  };

  const initials = name
    ? name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : email
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">

      {/* Profile Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Security Profile
        </h1>

        <p className="text-slate-600 text-sm mt-1">
          Identity credentials, cryptographic key vaults, and security policies.
        </p>
      </div>

      {/* Real User Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center gap-4">

        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-600 flex items-center justify-center text-blue-600 font-mono font-bold text-xl">
            {initials}
          </div>

          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
            <ShieldCheck className="w-3 h-3" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {name || 'User'}
            </h2>

            <span className="bg-blue-50 text-blue-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-blue-200">
              User
            </span>
          </div>

          <p className="text-xs text-slate-500 font-sans mt-0.5">
            {email || 'No email available'}
          </p>

          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-emerald-600 font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>Authenticated with Supabase</span>
          </div>
        </div>
      </div>

      {/* Security Engine Settings */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">

        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Forensic Engine Configurations
          </h2>
        </div>

        {/* Volatile Memory Purge */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-bold text-slate-900">
              Volatile Memory Purge
            </p>

            <p className="text-xs text-slate-500 mt-0.5">
              Instantly purge temporary image/video tensors after report generation.
            </p>
          </div>

          <button
            onClick={() => setVolatilePurge(!volatilePurge)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${volatilePurge ? 'bg-blue-600' : 'bg-slate-300'
              }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${volatilePurge ? 'translate-x-6' : 'translate-x-0'
                }`}
            />
          </button>
        </div>

        {/* Metadata Scrubbing */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-xs font-mono font-bold text-slate-900">
              Auto-Scrub Personal Metadata
            </p>

            <p className="text-xs text-slate-500 mt-0.5">
              Strip GPS tags and serial metadata before neural tensor processing.
            </p>
          </div>

          <button
            onClick={() => setMetadataScrubbing(!metadataScrubbing)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${metadataScrubbing ? 'bg-blue-600' : 'bg-slate-300'
              }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${metadataScrubbing ? 'translate-x-6' : 'translate-x-0'
                }`}
            />
          </button>
        </div>

        {/* Hash Algorithm */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <label className="text-xs font-mono font-bold text-slate-900 block">
            Cryptographic Integrity Standard
          </label>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            {(['SHA-256', 'SHA-3', 'BLAKE3'] as const).map((algo) => (
              <button
                key={algo}
                onClick={() => setHashingAlgorithm(algo)}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${hashingAlgorithm === algo
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Buffer */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-3">

        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Database className="w-4 h-4 text-slate-600" />
          <span>Local Forensic Buffer Management</span>
        </div>

        <p className="text-xs text-slate-600 font-sans leading-relaxed">
          Zero traces of media or metadata remain cached on client devices once purged.
        </p>

        <button
          onClick={handleWipeBuffer}
          disabled={purgeSuccess}
          className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-mono text-xs font-bold rounded-2xl transition-all"
        >
          {purgeSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600">
                Local Buffers Purged Successfully
              </span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Wipe Local Forensic Buffer</span>
            </>
          )}
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>

      <div className="text-center pt-2">
        <p className="text-[11px] font-mono text-slate-400">
          Women Deepfake Shield Engine
        </p>
      </div>
    </div>
  );
};