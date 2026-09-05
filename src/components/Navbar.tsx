import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  Wrench, 
  ShoppingBag, 
  ClipboardList, 
  User as UserIcon, 
  LogIn, 
  LogOut, 
  PlusCircle, 
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Shield,
  ShieldAlert
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'services' | 'jobs' | 'jastip' | 'orders' | 'profile' | 'admin';
  setActiveTab: (tab: 'services' | 'jobs' | 'jastip' | 'orders' | 'profile' | 'admin') => void;
  onOpenLogin: () => void;
  onOpenAddService: () => void;
  onOpenAddJob: () => void;
  onOpenAddJastip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenAddService,
  onOpenAddJob,
  onOpenAddJastip
}) => {
  const { user, profile, isAdmin, signOut, updateRole, toggleAdminRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isProvider = profile?.role === 'provider';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('services')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
              id="brand-logo-btn"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                  Jasa<span className="text-emerald-600">Hub</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 block leading-none">
                  Jasa, Loker & Jastip
                </span>
              </div>
            </button>

            {/* Current Role Badge */}
            {profile && (
              <div className="hidden md:flex items-center gap-1.5 ml-2">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  isProvider 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isProvider ? 'Penyedia Jasa' : 'Penyewa Jasa'}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              id="nav-tab-services"
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'services'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Cari Jasa
            </button>

            <button
              id="nav-tab-jobs"
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Lowongan Kerja
            </button>

            <button
              id="nav-tab-jastip"
              onClick={() => setActiveTab('jastip')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'jastip'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Jastip
            </button>

            <button
              id="nav-tab-orders"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Pesanan & DP
            </button>

            {/* Admin tab button */}
            {isAdmin && (
              <button
                id="nav-tab-admin"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-emerald-400 shadow-sm'
                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Rekber
              </button>
            )}
          </nav>

          {/* Action buttons & User profile */}
          <div className="flex items-center gap-2.5">
            {/* Quick Action Button based on context/role */}
            {profile && isProvider && (
              <button
                id="btn-upload-service-nav"
                onClick={onOpenAddService}
                className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                Upload Hasil Kerja
              </button>
            )}

            {profile && (
              <div className="relative">
                <button
                  id="user-profile-menu-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition border border-slate-200"
                >
                  <img
                    src={profile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={profile.displayName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="hidden sm:block text-xs font-medium text-slate-800 max-w-[120px] truncate">
                    {profile.displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{profile.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{profile.email || 'Akun Aktif'}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500">Peran:</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isProvider ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isProvider ? 'Penyedia Jasa' : 'Penyewa Jasa'}
                        </span>
                      </div>
                    </div>

                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        Kelola Profil & WhatsApp
                      </button>

                      <button
                        onClick={() => {
                          updateRole(isProvider ? 'customer' : 'provider');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        Ganti ke {isProvider ? 'Penyewa Jasa' : 'Penyedia Jasa'}
                      </button>

                      {isProvider ? (
                        <button
                          onClick={() => {
                            onOpenAddService();
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-600" />
                          Upload Hasil Kerja Baru
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveTab('orders');
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        >
                          <ClipboardList className="w-4 h-4 text-slate-500" />
                          Pesanan & DP Saya
                        </button>
                      )}

                      {/* Admin Controls */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setActiveTab('admin');
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                        >
                          <Shield className="w-4 h-4 text-emerald-600" />
                          Dashboard Admin Rekber
                        </button>
                      )}

                      <button
                        onClick={() => {
                          toggleAdminRole();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <ShieldAlert className="w-4 h-4 text-indigo-600" />
                        {isAdmin ? 'Mode Admin: Aktif (Klik matikan)' : 'Beralih ke Role Admin'}
                      </button>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={() => {
                          signOut();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!profile && (
              <button
                id="btn-open-login"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm shadow-emerald-500/20 transition"
              >
                <LogIn className="w-4 h-4" />
                Login Google
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden items-center justify-between overflow-x-auto py-2 border-t border-slate-100 no-scrollbar gap-1">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-emerald-100 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Cari Jasa
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'bg-emerald-100 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Lowongan Kerja
          </button>
          <button
            onClick={() => setActiveTab('jastip')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'jastip'
                ? 'bg-emerald-100 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Jastip
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-emerald-100 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Pesanan & DP
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-emerald-400 font-bold'
                  : 'bg-emerald-100 text-emerald-900 font-semibold'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          )}
          {profile && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-emerald-100 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Profil
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
