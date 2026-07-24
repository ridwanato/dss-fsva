'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';

const supabase = createClient();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for reset password flows
  const [forgotMode, setForgotMode] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Listen for thePASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setForgotMode(false);
      }
    });

    // Also check URL hash for recovery tokens directly (as fallback)
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && (hash.includes('access_token=') || hash.includes('type=recovery'))) {
        setIsRecoveryMode(true);
      }
    }

    return () => subscription.unsubscribe();
  }, []);

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
      setError('Registrasi berhasil! Silakan cek email Anda untuk verifikasi.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setError('Link reset password telah dikirim ke email Anda! Silakan periksa kotak masuk/spam.');
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setError('Password berhasil diperbarui! Silakan masuk menggunakan password baru.');
      setIsRecoveryMode(false);
      setNewPassword('');
      setLoading(false);
      // Clear hash from address bar
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
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
            {isRecoveryMode 
              ? 'Atur Ulang Password' 
              : forgotMode 
                ? 'Lupa Password' 
                : 'Masuk ke FSVA'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            {isRecoveryMode 
              ? 'Masukkan password baru Anda untuk memulihkan akun.' 
              : forgotMode 
                ? 'Masukkan email terdaftar Anda untuk mengirim link reset.' 
                : 'Akses dashboard pemetaan untuk kabupaten/kota Anda.'}
          </p>
        </div>

        {error && (
          <div className={`p-3 text-sm rounded-lg ${error.includes('berhasil') || error.includes('dikirim') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {error}
          </div>
        )}

        {/* 1. Recovery Mode: Enter New Password */}
        {isRecoveryMode && (
          <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
            <div>
              <label className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1 block">Password Baru</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 btn-primary text-sm font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6D5EF5]"
              >
                {loading ? 'Memproses...' : 'Perbarui Password'}
              </button>
            </div>
          </form>
        )}

        {/* 2. Forgot Password Mode: Enter Email */}
        {forgotMode && !isRecoveryMode && (
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1 block">Email Terdaftar</label>
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

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setError(null);
                }}
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 btn-secondary text-sm font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6D5EF5] items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 btn-primary text-sm font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6D5EF5]"
              >
                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </div>
          </form>
        )}

        {/* 3. Normal Login / Register Mode */}
        {!forgotMode && !isRecoveryMode && (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
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
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      setError(null);
                    }}
                    className="text-xs font-bold text-[#6D5EF5] hover:text-[#5b4ddb] transition-colors cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>
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
                className="w-full flex justify-center py-3 px-4 border border-[rgba(109,94,245,0.2)] text-sm font-bold rounded-xl text-slate-600 bg-white/50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors cursor-pointer"
              >
                Masuk sebagai Tamu (Read-Only)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
