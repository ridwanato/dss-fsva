'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const supabase = createClient();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/entry');
      router.refresh();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setError('Registrasi berhasil! Silakan cek email Anda untuk verifikasi atau langsung login jika auto-login aktif.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-transparent flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 h-full">
      <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-2xl">
        <div>
          <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-500 rounded-xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md">
            F
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#1E1B4B]">
            Masuk ke FSVA
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Akses dashboard pemetaan untuk kabupaten/kota Anda.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className={`p-3 text-sm rounded-lg ${error.includes('berhasil') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1 block">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-[rgba(109,94,245,0.2)] bg-white/60 placeholder-slate-400 text-[#1E1B4B] focus:outline-none focus:ring-[#6D5EF5] focus:border-[#6D5EF5] focus:z-10 sm:text-sm transition-all"
                  placeholder="admin@email.com"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-[rgba(109,94,245,0.2)] bg-white/60 placeholder-slate-400 text-[#1E1B4B] focus:outline-none focus:ring-[#6D5EF5] focus:border-[#6D5EF5] focus:z-10 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 btn-secondary text-sm font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6D5EF5]"
            >
              Daftar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 btn-primary text-sm font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6D5EF5]"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[rgba(109,94,245,0.1)]">
            <button
              type="button"
              onClick={() => router.push('/map')}
              className="w-full flex justify-center py-3 px-4 border border-[rgba(109,94,245,0.2)] text-sm font-bold rounded-xl text-slate-600 bg-white/50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              Masuk sebagai Tamu (Read-Only)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
