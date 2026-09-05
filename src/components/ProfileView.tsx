import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, ServiceItem } from '../types';
import { deleteService, syncProviderServices } from '../lib/dbService';
import { 
  User as UserIcon, 
  MapPin, 
  Phone, 
  CreditCard, 
  ShieldCheck, 
  Briefcase, 
  Wrench, 
  CheckCircle2, 
  Sparkles,
  Link as LinkIcon,
  Edit3,
  Trash2,
  PlusCircle,
  Star,
  ExternalLink,
  Layers,
  Building2,
  ShieldAlert
} from 'lucide-react';

interface ProfileViewProps {
  onOpenAddService: () => void;
  services?: ServiceItem[];
  onEditService?: (service: ServiceItem) => void;
  onSelectService?: (service: ServiceItem) => void;
  onDeleteService?: (serviceId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  onOpenAddService,
  services = [],
  onEditService,
  onSelectService,
  onDeleteService
}) => {
  const { profile, isAdmin, updateRole, updateProfileDetails } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [phoneWhatsApp, setPhoneWhatsApp] = useState(profile?.phoneWhatsApp || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [paymentLink, setPaymentLink] = useState(profile?.paymentLink || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [bankName, setBankName] = useState(profile?.bankAccount?.bankName || 'BCA');
  const [accountNumber, setAccountNumber] = useState(profile?.bankAccount?.accountNumber || '');
  const [accountHolder, setAccountHolder] = useState(profile?.bankAccount?.accountHolder || profile?.displayName || '');
  const [syncWithServices, setSyncWithServices] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!profile) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
        <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Silakan login terlebih dahulu</h3>
        <p className="text-xs text-slate-500 mt-1">Masuk dengan akun Google untuk mengelola profil dan layanan Anda.</p>
      </div>
    );
  }

  const isProvider = profile.role === 'provider';

  // Filter provider's own services
  const myServices = services.filter((s) => {
    return (
      s.providerId === profile.uid ||
      (profile.email && s.providerEmail === profile.email) ||
      (profile.role === 'provider' && s.providerName === profile.displayName)
    );
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileDetails({
      displayName,
      phoneWhatsApp,
      address,
      paymentLink,
      bio,
      bankAccount: {
        bankName,
        accountNumber,
        accountHolder
      }
    });

    if (isProvider && syncWithServices && myServices.length > 0) {
      const updatedCount = await syncProviderServices(profile.uid, {
        whatsapp: phoneWhatsApp,
        location: address,
        providerName: displayName,
        paymentLink
      });
      setSaveMessage(`Profil & rekening disimpan, kontak disinkronkan ke ${updatedCount || myServices.length} iklan layanan!`);
    } else {
      setSaveMessage('Perubahan profil & data rekening berhasil disimpan!');
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setSaveMessage('');
    }, 3500);
  };

  const handleRoleToggle = (newRole: UserRole) => {
    updateRole(newRole);
  };

  const handleDeleteService = async (serviceId: string, title: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus layanan "${title}"?`);
    if (!confirmDelete) return;

    setDeletingId(serviceId);
    try {
      await deleteService(serviceId);
      if (onDeleteService) {
        onDeleteService(serviceId);
      }
    } catch (err) {
      console.warn('Delete service notice:', err);
      if (onDeleteService) {
        onDeleteService(serviceId);
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <img
            src={profile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={profile.displayName}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-emerald-100 shadow-md"
            referrerPolicy="no-referrer"
          />

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{profile.displayName}</h1>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isProvider ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {isProvider ? 'Penyedia Jasa' : 'Penyewa Jasa'}
              </span>
            </div>
            <p className="text-xs text-slate-500">{profile.email}</p>

            {/* Role switch toggle */}
            <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs text-slate-600 font-medium">Beralih Peran Akun:</span>
              <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleRoleToggle('customer')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    !isProvider ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Penyewa Jasa
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleToggle('provider')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    isProvider ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Penyedia Jasa
                </button>
              </div>
            </div>
          </div>

          {isProvider && (
            <button
              onClick={onOpenAddService}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Upload Hasil Kerja Baru
            </button>
          )}
        </div>
      </div>

      {/* Provider Services Management Section */}
      {isProvider && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Daftar Layanan & Hasil Kerja Saya</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {myServices.length} Iklan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola, perbarui foto hasil kerja, ganti nomor WhatsApp, edit alamat, atau ubah tarif layanan Anda.
              </p>
            </div>

            <button
              onClick={onOpenAddService}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Layanan
            </button>
          </div>

          {myServices.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Belum ada layanan yang dipublikasikan</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Publikasikan foto hasil pengerjaan Anda agar calon pelanggan dapat menemukan keahlian Anda dan menghubungi via WhatsApp.
              </p>
              <button
                onClick={onOpenAddService}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                Upload Layanan Pertama Anda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myServices.map((service) => {
                const cover = service.photos && service.photos.length > 0
                  ? service.photos[0]
                  : 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=80';

                return (
                  <div
                    key={service.id}
                    className="flex flex-col justify-between p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-sm transition"
                  >
                    <div>
                      {/* Photo & Badge */}
                      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <img
                          src={cover}
                          alt={service.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-800">
                          {service.category}
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white">
                          {service.photos?.length || 1} Foto
                        </div>
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] text-amber-300 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{service.rating.toFixed(1)}</span>
                          <span className="text-white/70 font-normal">({service.reviewCount})</span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                        {service.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{service.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate font-medium text-emerald-700">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>WhatsApp: {service.whatsapp}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-500">Tarif: <strong className="text-slate-800">{service.priceEstimate}</strong></span>
                          <span className="text-emerald-700 font-bold">DP: Rp {(service.dpAmount || 50000).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                      {onEditService && (
                        <button
                          type="button"
                          onClick={() => onEditService(service)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Layanan & Foto
                        </button>
                      )}

                      {onSelectService && (
                        <button
                          type="button"
                          onClick={() => onSelectService(service)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                          title="Lihat Tampilan Publik"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={deletingId === service.id}
                        onClick={() => handleDeleteService(service.id, service.title)}
                        className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs transition disabled:opacity-50"
                        title="Hapus Layanan Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Informasi Kontak & Lokasi Profil</h2>
          <p className="text-xs text-slate-500">Data utama penyedia untuk identitas akun, WhatsApp, dan alamat pengerjaan</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Tampilan / Usaha
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              Nomor WhatsApp Utama
            </label>
            <input
              type="text"
              placeholder="Contoh: 08123456789"
              value={phoneWhatsApp}
              onChange={(e) => setPhoneWhatsApp(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Alamat Lokasi & Wilayah Pengerjaan
          </label>
          <input
            type="text"
            placeholder="Nama jalan, nomor rumah/bengkel, RT/RW, kelurahan, kecamatan, kota"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {isProvider && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
              Tautan Pembayaran Uang Muka / DP (PayPal.me atau Link QRIS)
            </label>
            <input
              type="text"
              placeholder="Contoh: https://paypal.me/username atau link gambar QRIS / E-wallet"
              value={paymentLink}
              onChange={(e) => setPaymentLink(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Tautan ini akan otomatis dibuka ketika pelanggan menekan tombol "Bayar DP".
            </span>
          </div>
        )}

        {/* Bank & E-Wallet Account Info for DP Disbursements (Part 5) */}
        {isProvider && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Data Rekening / E-Wallet Pencairan DP (Rekber Admin)
                </h3>
                <p className="text-[11px] text-slate-600">
                  Admin JasaHub akan mentransfer uang muka (setelah fee platform 5%) ke nomor rekening ini.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Bank / E-Wallet <span className="text-red-500">*</span>
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="BCA">BCA (Bank Central Asia)</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BNI">BNI</option>
                  <option value="BRI">BRI</option>
                  <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                  <option value="CIMB Niaga">CIMB Niaga</option>
                  <option value="Permata">Bank Permata</option>
                  <option value="Danamon">Bank Danamon</option>
                  <option value="Bank Jago">Bank Jago</option>
                  <option value="SeaBank">SeaBank</option>
                  <option value="GoPay">GoPay (Gojek)</option>
                  <option value="OVO">OVO</option>
                  <option value="DANA">DANA</option>
                  <option value="ShopeePay">ShopeePay</option>
                  <option value="LinkAja">LinkAja</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nomor Rekening / No. HP E-Wallet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 8735019284 / 08123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Pemilik Rekening <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Sesuai buku tabungan / akun"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deskripsi Singkat / Bio
          </label>
          <textarea
            rows={3}
            placeholder="Tuliskan pengalaman, keahlian utama, atau catatan penting untuk pengguna lain..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Sync checkbox option for provider */}
        {isProvider && myServices.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="sync-services-checkbox"
              checked={syncWithServices}
              onChange={(e) => setSyncWithServices(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="sync-services-checkbox" className="text-xs text-emerald-950 font-medium cursor-pointer">
              Perbarui juga nomor WhatsApp dan Alamat di semua {myServices.length} iklan layanan aktif saya secara otomatis.
            </label>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          {saved ? (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {saveMessage}
            </span>
          ) : <div />}

          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            Simpan Perubahan Profil
          </button>
        </div>
      </form>
    </div>
  );
};

