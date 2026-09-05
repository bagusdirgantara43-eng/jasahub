import React, { useState, useMemo } from 'react';
import { ServiceItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  MessageCircle, 
  PlusCircle, 
  Filter, 
  Sparkles,
  CreditCard,
  CheckCircle2,
  Edit3,
  ShieldAlert,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { BlockServiceModal } from './BlockServiceModal';
import { unblockService } from '../lib/dbService';

interface ServicesListProps {
  services: ServiceItem[];
  onSelectService: (service: ServiceItem) => void;
  onOpenAddService: () => void;
  onQuickPayDP: (service: ServiceItem) => void;
  onEditService?: (service: ServiceItem) => void;
}

const CATEGORIES = [
  'Semua Kategori',
  'Elektronik & AC',
  'Bangunan & Renovasi',
  'Kebersihan / Cleaning',
  'Fotografi & Desain',
  'Otomotif & Montir',
  'Pertukangan Kayu & Las',
  'Les & Kursus Privat'
];

export const ServicesList: React.FC<ServicesListProps> = ({
  services,
  onSelectService,
  onOpenAddService,
  onQuickPayDP,
  onEditService
}) => {
  const { profile, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [serviceToBlock, setServiceToBlock] = useState<ServiceItem | null>(null);

  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      // If not admin, hide blocked/unapproved items
      if (!isAdmin && (item.status === 'BLOCKED' || item.isApproved === false)) {
        return false;
      }
      const matchCategory =
        selectedCategory === 'Semua Kategori' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.providerName.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [services, selectedCategory, searchQuery, isAdmin]);

  const handleUnblock = async (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await unblockService(serviceId);
    } catch (err) {
      console.error('Failed to unblock service:', err);
    }
  };

  const isProvider = profile?.role === 'provider';

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Platform Jasa Terverifikasi & Terpercaya
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Temukan Penyedia Jasa Terbaik di Sekitar Anda
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100/80 leading-relaxed">
            Mulai dari tukang bangunan, servis AC, cleaning service, hingga fotografer. Lihat foto hasil pekerjaan nyata, hubungi via WhatsApp, dan bayar DP dengan aman.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isProvider ? (
              <button
                id="hero-btn-upload-service"
                onClick={onOpenAddService}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-[0.99]"
              >
                <PlusCircle className="w-4 h-4" />
                Upload Hasil Pekerjaan Anda
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Foto pekerjaan asli • Hubungi via WhatsApp • Pembayaran DP Aman</span>
              </div>
            )}
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="search-services-input"
              placeholder="Cari jasa (misal: servis AC, cat tembok, fotografer, kebersihan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>

          {/* Action button for providers on mobile */}
          {isProvider && (
            <button
              onClick={onOpenAddService}
              className="sm:hidden flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Upload Hasil Kerja
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
                selectedCategory === category
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak ada jasa yang sesuai</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau ganti kategori untuk menemukan penyedia jasa yang Anda butuhkan.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua Kategori');
            }}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const coverPhoto = service.photos && service.photos.length > 0
              ? service.photos[0]
              : 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=80';
            
            const formattedWhatsApp = service.whatsapp.replace(/\D/g, '');
            const waUrl = `https://wa.me/${formattedWhatsApp}?text=${encodeURIComponent(
              `Halo ${service.providerName}, saya tertarik dengan layanan "${service.title}" di JasaHub.`
            )}`;

            const currentUserId = profile?.uid;
            const isOwner = Boolean(
              currentUserId && (
                currentUserId === service.providerId ||
                profile?.email === service.providerEmail ||
                (profile?.role === 'provider' && profile?.displayName === service.providerName)
              )
            );

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between overflow-hidden group relative"
              >
                <div>
                  {/* Photo Header with Badge */}
                  <div 
                    onClick={() => onSelectService(service)}
                    className="relative aspect-[16/10] overflow-hidden cursor-pointer bg-slate-100"
                  >
                    <img
                      src={coverPhoto}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-sm">
                        {service.category}
                      </span>
                    </div>

                    {isOwner && onEditService && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditService(service);
                        }}
                        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-md transition"
                        title="Edit Layanan Anda"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit Jasa
                      </button>
                    )}

                    {service.photos && service.photos.length > 1 && !isOwner && (
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium">
                        +{service.photos.length} Foto
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      <div className="flex items-center text-amber-400 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md text-[11px] font-bold">
                        <Star className="w-3 h-3 fill-amber-400 mr-1" />
                        <span>{service.rating.toFixed(1)}</span>
                        <span className="text-white/80 font-normal ml-0.5">({service.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    {/* Provider Info */}
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <img
                        src={service.providerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                        alt={service.providerName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {service.providerName}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => onSelectService(service)}
                      className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 cursor-pointer transition leading-snug"
                    >
                      {service.title}
                    </h3>

                    {/* Description preview */}
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Location */}
                    <div className="mt-3 flex items-center gap-1 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{service.location}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Pricing & Actions */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Tarif Estimasi</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">{service.priceEstimate}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Uang Muka (DP)</span>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-600">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(service.dpAmount || 50000)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectService(service)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition text-center"
                    >
                      Detail & Foto
                    </button>

                    {isOwner && onEditService ? (
                      <button
                        onClick={() => onEditService(service)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition text-center shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Layanan
                      </button>
                    ) : (
                      <button
                        onClick={() => onQuickPayDP(service)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition text-center shadow-sm"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Bayar DP
                      </button>
                    )}
                  </div>

                  {/* Direct WhatsApp button */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[11px] font-semibold transition text-center"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Hubungi WhatsApp ({service.whatsapp})
                  </a>

                  {/* ADMIN ACTION: Hapus / Sembunyikan Jasa (Hanya terlihat oleh Admin) */}
                  {isAdmin && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                      {service.status === 'BLOCKED' || service.isApproved === false ? (
                        <div className="w-full flex items-center justify-between gap-1 p-2 rounded-xl bg-red-50 border border-red-200 text-xs">
                          <span className="text-[10px] font-bold text-red-700 flex items-center gap-1 truncate">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            BLOCKED ({service.blockReason || 'Disembunyikan Admin'})
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleUnblock(service.id, e)}
                            className="shrink-0 px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded border border-emerald-300 shadow-sm"
                          >
                            Pulihkan
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          id={`btn-admin-block-${service.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setServiceToBlock(service);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition text-center"
                          title="Tindakan Moderasi Admin"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Hapus / Sembunyikan Jasa
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Block Service Modal */}
      <BlockServiceModal
        service={serviceToBlock}
        isOpen={!!serviceToBlock}
        onClose={() => setServiceToBlock(null)}
        onSuccess={() => {
          // Realtime or state handles update
        }}
      />
    </div>
  );
};
