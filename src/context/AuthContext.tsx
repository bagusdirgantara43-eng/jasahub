import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  type User 
} from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { fetchUserProfile, saveUserProfile } from '../lib/dbService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateRole: (newRole: UserRole) => Promise<void>;
  updateProfileDetails: (details: Partial<UserProfile>) => Promise<void>;
  loginDemoUser: (role: UserRole) => void;
  toggleAdminRole: () => void;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const isAdmin = Boolean(
    profile?.role === 'admin' ||
    profile?.isAdmin === true ||
    (profile?.email && profile.email.toLowerCase() === 'bagusdirgantara43@guru.smk.belajar.id')
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          let userProfile = await fetchUserProfile(currentUser.uid);
          const isUserAdminEmail = currentUser.email?.toLowerCase() === 'bagusdirgantara43@guru.smk.belajar.id';
          
          if (!userProfile) {
            // First time login - default to Penyewa Jasa (or admin if admin email)
            userProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Pengguna Baru',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
              role: isUserAdminEmail ? 'admin' : 'customer',
              isAdmin: isUserAdminEmail,
              phoneWhatsApp: '',
              address: '',
              category: 'Umum',
              createdAt: new Date().toISOString()
            };
            await saveUserProfile(userProfile);
          } else if (isUserAdminEmail && !userProfile.isAdmin) {
            userProfile = { ...userProfile, isAdmin: true, role: 'admin' };
            await saveUserProfile(userProfile);
          }
          setProfile(userProfile);
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      } else {
        // Keep local demo profile if not logged into Firebase but using demo mode
        if (!profile?.uid.startsWith('demo-')) {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      let userProfile = await fetchUserProfile(googleUser.uid);
      if (!userProfile) {
        userProfile = {
          uid: googleUser.uid,
          displayName: googleUser.displayName || 'Pengguna Baru',
          email: googleUser.email || '',
          photoURL: googleUser.photoURL || '',
          role: 'customer',
          phoneWhatsApp: '',
          address: '',
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(userProfile);
      }
      setProfile(userProfile);
      return true;
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.code === 'auth/user-cancelled'
      ) {
        console.info('Login popup closed or cancelled by user.');
        setAuthError('Jendela masuk Google ditutup. Silakan coba lagi atau gunakan opsi simulasi cepat di bawah.');
        return false;
      }

      console.warn('Google Sign-In notice:', error?.code, error?.message);
      let msg = error?.message || 'Gagal login dengan Google.';
      if (error?.code === 'auth/popup-blocked') {
        msg = 'Jendela popup login diblokir oleh browser. Izinkan popup untuk login dengan Google.';
      } else if (error?.code === 'auth/unauthorized-domain') {
        msg = 'Domain ini belum diotorisasi di Firebase Authentication. Gunakan tombol Mode Simulasi di bawah untuk menguji aplikasi secara penuh.';
      } else if (error?.code === 'auth/network-request-failed') {
        msg = 'Gagal terhubung ke server autentikasi. Periksa koneksi internet Anda.';
      }
      setAuthError(msg);
      return false;
    }
  };

  const loginDemoUser = (role: UserRole) => {
    if (role === 'admin') {
      const adminProfile: UserProfile = {
        uid: 'demo-admin-01',
        displayName: 'Admin JasaHub (Pusat Rekber)',
        email: 'bagusdirgantara43@guru.smk.belajar.id',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'admin',
        isAdmin: true,
        phoneWhatsApp: '6281234567890',
        address: 'Kantor Operasional JasaHub Pusat, Jakarta',
        bio: 'Administrator Resmi Pengawasan Rekber QRIS & Layanan JasaHub.',
        createdAt: new Date().toISOString()
      };
      setProfile(adminProfile);
      setAuthError(null);
      return;
    }

    const isProvider = role === 'provider';
    const demoProfile: UserProfile = {
      uid: isProvider ? 'demo-provider-1' : 'demo-customer-99',
      displayName: isProvider ? 'Budi Santoso (Penyedia Jasa)' : 'Ahmad Fauzi (Penyewa Jasa)',
      email: isProvider ? 'budi.provider@example.com' : 'ahmad.fauzi@example.com',
      photoURL: isProvider 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: role,
      isAdmin: false,
      phoneWhatsApp: isProvider ? '6281223344551' : '6281987654321',
      address: isProvider ? 'Jl. Surya Sumantri No. 42, Bandung' : 'Jl. Dago Asri No. 15, Bandung',
      category: isProvider ? 'Elektronik & AC' : undefined,
      bio: isProvider ? 'Teknisi profesional AC & Elektronik 8 tahun pengalaman.' : 'Mencari teknisi dan tukang terpercaya.',
      paymentLink: isProvider ? 'https://paypal.me/demo' : undefined,
      bankAccount: isProvider ? {
        bankName: 'BCA',
        accountNumber: '8735019284',
        accountHolder: 'Budi Santoso'
      } : undefined,
      createdAt: new Date().toISOString()
    };

    setProfile(demoProfile);
    setAuthError(null);
  };

  const toggleAdminRole = async () => {
    if (!profile) return;
    const newIsAdmin = !isAdmin;
    const updated: UserProfile = {
      ...profile,
      role: newIsAdmin ? 'admin' : 'provider',
      isAdmin: newIsAdmin
    };
    setProfile(updated);
    if (!profile.uid.startsWith('demo-')) {
      await saveUserProfile(updated);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setUser(null);
    setProfile(null);
  };

  const updateRole = async (newRole: UserRole) => {
    if (!profile) return;
    const updated = { ...profile, role: newRole, isAdmin: newRole === 'admin' };
    setProfile(updated);
    if (!profile.uid.startsWith('demo-')) {
      await saveUserProfile(updated);
    }
  };

  const updateProfileDetails = async (details: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...details };
    setProfile(updated);
    if (!profile.uid.startsWith('demo-')) {
      await saveUserProfile(updated);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signInWithGoogle,
        signOut,
        updateRole,
        updateProfileDetails,
        loginDemoUser,
        toggleAdminRole,
        authError,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
