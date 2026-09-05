import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  X, 
  Briefcase, 
  CheckCircle2, 
  Sparkles, 
  Wrench, 
  AlertCircle 
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, loginDemoUser, authError, clearAuthError } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    clearAuthError();
    try {
      const success = await signInWithGoogle();
      if (success) {
        onClose();
      }
    } catch (err) {
      console.warn('Google sign-in completed or cancelled');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    loginDemoUser(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          id="close-login-modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Masuk ke JasaHub</h2>
          <p className="text-sm text-slate-500 mt-1">
            Pilih jenis pengguna dan masuk dengan akun Google Anda
          </p>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Catatan Login</p>
              <p>{authError}</p>
            </div>
          </div>
        )}

        {/* Role selection preview */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Pilih Peran Anda
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              id="role-select-provider"
              onClick={() => setSelectedRole('provider')}
              className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                selectedRole === 'provider'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${selectedRole === 'provider' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Wrench className="w-4 h-4" />
                </div>
                {selectedRole === 'provider' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Penyedia Jasa</p>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Tukang, teknisi, fotografer, cleaning, dll.
                </p>
              </div>
            </button>

            <button
              type="button"
              id="role-select-customer"
              onClick={() => setSelectedRole('customer')}
              className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                selectedRole === 'customer'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${selectedRole === 'customer' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                {selectedRole === 'customer' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Penyewa Jasa</p>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Mencari jasa, pesan, beri rating & review.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Primary Google Login Button */}
        <button
          id="btn-login-google-action"
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm py-3 px-4 rounded-xl border border-slate-300 shadow-sm transition active:scale-[0.99] disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          {loading ? 'Menghubungkan...' : 'Lanjutkan dengan Akun Google'}
        </button>

        {/* Quick Testing Options */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[11px] text-center text-slate-400 mb-2.5">
            Atau coba langsung dengan akun simulasi cepat:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-quick-login-provider"
              onClick={() => handleDemoLogin('provider')}
              className="px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition text-center"
            >
              Mode Penyedia Jasa
            </button>
            <button
              type="button"
              id="btn-quick-login-customer"
              onClick={() => handleDemoLogin('customer')}
              className="px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition text-center"
            >
              Mode Penyewa Jasa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
