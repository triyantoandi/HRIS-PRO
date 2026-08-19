import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { User } from '../types';

interface LoginContainerProps {
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
}

export const LoginContainer: React.FC<LoginContainerProps> = ({ onLoginSuccess, allUsers }) => {
  const [email, setEmail] = useState<string>('admin@company.com');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Silakan masukkan email Anda.');
      return;
    }
    if (!password) {
      setErrorMsg('Silakan masukkan password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Find matching user by email (case-insensitive)
      const user = allUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (user) {
        onLoginSuccess(user);
      } else {
        // Fallback demo matching if generic
        if (email.includes('admin')) {
          const adminUser = allUsers.find(u => u.role === 'admin') || allUsers[0];
          onLoginSuccess(adminUser);
        } else {
          setErrorMsg('Email atau password tidak terdaftar dalam sistem demo HR.');
        }
      }
    }, 400);
  };

  const handleSelectDemo = (demoUser: User) => {
    setEmail(demoUser.email);
    setPassword('password123');
    setErrorMsg('');
  };

  return (
    <div 
      id="loginContainer" 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-4xl grid md:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700/30">
        
        {/* Left Side: Brand & Visual Overview */}
        <div className="md:col-span-5 bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-800 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center space-x-3 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 mb-6">
              <Building2 className="w-4 h-4 text-blue-200" />
              <span className="text-xs font-semibold tracking-wide">PT NUSA CIPTA TEKNOLOGI</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Sistem Informasi SDM Terintegrasi
            </h2>
            <p className="mt-3 text-blue-100 text-sm leading-relaxed">
              Platform manajemen kehadiran, perizinan cuti online, dan slip gaji resmi berbasis digital yang aman dan transparan.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center space-x-3 text-xs text-blue-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Presensi Geolocation & Deteksi Selfie</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-blue-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Otomasi Pengajuan & Kuota Cuti</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-blue-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Kalkulasi Payroll & Slip Gaji Terstandar</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/15 relative z-10 flex items-center justify-between text-[11px] text-blue-200">
            <span>HRIS Portal v2.6.4</span>
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> 256-bit SSL
            </span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            
            <div className="mb-6 text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Login HR System
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Silakan masuk menggunakan kredensial akun perusahaan Anda
              </p>
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Perusahaan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="nama@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <span className="text-[11px] text-blue-600 font-medium cursor-pointer hover:underline">
                    Lupa Password?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="pass"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    placeholder="Masukkan password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-4 h-4"
                  />
                  <span>Ingat akun saya di perangkat ini</span>
                </label>
              </div>

              <button
                type="submit"
                id="loginBtn"
                disabled={isLoading}
                className="w-full mt-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-[0.99] transition shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Pilih Akun Demo 1-Klik:
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="demoAdminBtn"
                  onClick={() => {
                    const admin = allUsers.find((u) => u.role === 'admin') || allUsers[0];
                    handleSelectDemo(admin);
                  }}
                  className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-left transition group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                      HR
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-900">Admin HR</p>
                      <p className="text-[10px] text-purple-700">Andi Triyanto</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  id="demoKaryawanBtn"
                  onClick={() => {
                    const emp = allUsers.find((u) => u.role === 'employee') || allUsers[1];
                    handleSelectDemo(emp);
                  }}
                  className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      ST
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-900">Karyawan</p>
                      <p className="text-[10px] text-blue-700">Budi Santoso</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
