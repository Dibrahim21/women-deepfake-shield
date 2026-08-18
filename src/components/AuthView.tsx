import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthViewProps {
    onAuthenticated: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
    onAuthenticated,
}) => {
    const [isSignup, setIsSignup] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (isSignup) {
                if (!fullName.trim()) {
                    throw new Error('Please enter your full name.');
                }

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName.trim(),
                        },
                    },
                });

                if (error) throw error;

                if (data.session) {
                    onAuthenticated();
                } else {
                    setMessage(
                        'Account created. Check your email to confirm your account.'
                    );
                }
            } else {
                const { error } =
                    await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });

                if (error) throw error;

                onAuthenticated();
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">

                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                        WS
                    </div>

                    <h1 className="text-2xl font-extrabold text-slate-900 mt-4">
                        Women Deepfake Shield
                    </h1>

                    <p className="text-sm text-slate-500 mt-2">
                        {isSignup
                            ? 'Create your account to protect your digital identity.'
                            : 'Sign in to access your protected analysis dashboard.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Full Name - Signup only */}
                    {isSignup && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Full Name
                            </label>

                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) =>
                                    setFullName(e.target.value)
                                }
                                required
                                placeholder="Your full name"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {message && (
                        <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
                    >
                        {loading
                            ? 'Please wait...'
                            : isSignup
                                ? 'Create Account'
                                : 'Sign In'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignup(!isSignup);
                            setError('');
                            setMessage('');
                        }}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                        {isSignup
                            ? 'Already have an account? Sign in'
                            : "Don't have an account? Create one"}
                    </button>
                </div>

            </div>
        </div>
    );
};