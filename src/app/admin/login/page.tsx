'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        // Fallback for simple local demo / testing if auth user not created yet
        if (email === 'admin@superior.edu.pk' && password === 'admin123') {
          sessionStorage.setItem('superior_admin_logged_in', 'true');
          router.push('/admin/dashboard');
          return;
        }
        throw error;
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-3">
            <Image src="/superior-logo.png" alt="Superior Logo" width={60} height={60} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Super Admin Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Superior College Wazirabad Accounts & Convocation Office
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@superiorwazirabad.edu.pk"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#0C7E81] text-white font-bold rounded-lg hover:bg-[#096366] transition flex items-center justify-center gap-2 text-sm cursor-pointer shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Super Admin</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Tip: You can use Supabase Auth credentials or demo (<code className="text-slate-600 font-mono">admin@superior.edu.pk / admin123</code>)
        </div>
      </div>
    </div>
  );
}
