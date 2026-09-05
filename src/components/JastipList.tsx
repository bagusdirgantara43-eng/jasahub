import React, { useState, useMemo } from 'react';
import { JastipItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  PlusCircle, 
  MessageCircle, 
  Tag,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { BlockContentModal } from './BlockContentModal';
import { blockJastip, unblockJastip, deleteJastip } from '../lib/dbService';

interface JastipListProps {
  jastips: JastipItem[];
  onOpenAddJastip: () => void;
}

export const JastipList: React.FC<JastipListProps> = ({ jastips, onOpenAddJastip }) => {
  const { profile, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [jastipToBlock, setJastipToBlock] = useState<JastipItem | null>(null);

  const filteredJastips = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return jastips.filter((item) => {
      // If not admin, hide blocked items
      if (!isAdmin && (item.status === 'BLOCKED' || item.isApproved === false)) {
        return false;
      }
      return (
        item.title.toLowerCase().includes(q) ||
        item.routeFrom.toLowerCase().includes(q) ||
        item.routeTo.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.creatorName.toLowerCase().includes(q)
      );
    });
  }, [jastips, searchQuery, isAdmin]);

  const handleUnblock = async (jastipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await unblockJastip(jastipId);
    } catch (err) {
      console.error('Failed to unblock jastip:', err);
    }
  };

  const handleDelete = async (jastipId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Yakin ingin menghapus penawaran jastip ini secara permanen?')) {
      try {
        await deleteJastip(jastipId);
      } catch (err) {
        console.error('Failed to delete jastip:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl text-white shadow-lg">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <ShoppingBag className="w-3.5 h-3.5" />
            Layanan Jasa Titip (Jastip)
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Titip Belanja Dari Mana Saja dengan Aman
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Titip oleh-oleh khas daerah (Bandung, Jogja, Bali), perabot IKEA, produk mall, hingga barang luar kota. Chat langsung jastiper terpercaya.
          </p>
        </div>

        <button
          onClick={onOpenAddJastip}
          id="btn-open-post-jastip"
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-md transition active:scale-[0.99] shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Tawarkan Jastip
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari jastip (misal: Bandung, IKEA, Kartika Sari, Jepang)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
      </div>

      {/* Jastip Cards Grid */}
      {filteredJastips.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Belum ada penawaran jastip yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1">Jadilah yang pertama menawarkan jasa titip ke kota tujuan Anda!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJastips.map((item) => {
            const formattedWhatsApp = item.whatsapp.replace(/\D/g, '');
            const waUrl = `https://wa.me/${formattedWhatsApp}?text=${encodeURIComponent(
              `Halo ${item.creatorName}, saya mau titip belanja untuk "${item.title}" di JasaHub.`
            )}`;

            const coverPhoto = item.photos && item.photos.length > 0
              ? item.photos[0]
              : 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Route Header */}
                  <div className="relative aspect-[16/8] overflow-hidden bg-slate-100">
                    <img
                      src={coverPhoto}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Route Tag */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-1.5 font-bold bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                        <span>{item.routeFrom}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.routeTo}</span>
                      </div>
                      <span className="text-[11px] bg-emerald-500/90 text-slate-950 font-extrabold px-2 py-0.5 rounded-md">
                        {item.feeEstimate}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5">
                    {/* Creator avatar & date */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                          alt={item.creatorName}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-xs font-semibold text-slate-800">{item.creatorName}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.travelDate}</span>
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {item.status === 'BLOCKED' ? (
                        <span className="text-red-600 font-bold">Diblokir Admin</span>
                      ) : (
                        <span>Titip Aman</span>
                      )}
                    </span>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-[0.99]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Titip via WhatsApp
                    </a>
                  </div>

                  {/* ADMIN ACTION: Kontrol & Moderasi Jastip (Hanya Admin) */}
                  {isAdmin && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                      {item.status === 'BLOCKED' || item.isApproved === false ? (
                        <div className="w-full flex items-center justify-between gap-1 p-2 rounded-xl bg-red-50 border border-red-200 text-xs">
                          <span className="text-[10px] font-bold text-red-700 flex items-center gap-1 truncate">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            BLOCKED ({item.blockReason || 'Disembunyikan Admin'})
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => handleUnblock(item.id, e)}
                              className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded border border-emerald-300 shadow-sm transition"
                            >
                              Pulihkan
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(item.id, e)}
                              className="p-1 bg-white hover:bg-red-50 text-red-600 rounded border border-red-200 transition"
                              title="Hapus Permanen"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            id={`btn-admin-block-jastip-${item.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setJastipToBlock(item);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition text-center"
                            title="Tindakan Moderasi Admin"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Hapus / Sembunyikan Jastip
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl border border-slate-200 transition"
                            title="Hapus Permanen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Block Jastip Modal */}
      <BlockContentModal
        isOpen={!!jastipToBlock}
        onClose={() => setJastipToBlock(null)}
        title="Hapus / Sembunyikan Penawaran Jastip"
        itemTypeLabel="Penawaran Jastip"
        itemTitle={jastipToBlock?.title || ''}
        itemOwnerLabel="Jastiper"
        itemOwnerName={jastipToBlock?.creatorName || ''}
        itemContact={jastipToBlock?.whatsapp}
        predefinedReasons={[
          'Titipan Barang Ilegal / Terlarang',
          'Indikasi Penipuan / Akun Palsu',
          'Konten Tidak Layak / Melanggar Aturan',
          'Lainnya (Tuliskan alasan di bawah)'
        ]}
        onConfirm={async (reason) => {
          if (!jastipToBlock) return;
          await blockJastip(jastipToBlock.id, reason, profile?.email || profile?.displayName || 'Admin JasaHub');
          setJastipToBlock(null);
        }}
      />
    </div>
  );
};
