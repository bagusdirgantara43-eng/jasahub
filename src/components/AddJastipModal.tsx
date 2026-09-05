import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addJastip } from '../lib/dbService';
import { 
  X, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Calendar, 
  Upload, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';

interface AddJastipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_JASTIP_PHOTOS = [
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
];

export const AddJastipModal: React.FC<AddJastipModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { profile, user } = useAuth();

  const [title, setTitle] = useState('');
  const [routeFrom, setRouteFrom] = useState('Bandung');
  const [routeTo, setRouteTo] = useState('Jakarta & Jabodetabek');
  const [travelDate, setTravelDate] = useState('Setiap Akhir Pekan');
  const [feeEstimate, setFeeEstimate] = useState('Mulai Rp 10.000 / item');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState(profile?.phoneWhatsApp || '');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddSample = (url: string) => {
    setPhotos((prev) => [...prev, url]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !routeFrom.trim() || !routeTo.trim() || !description.trim() || !whatsapp.trim()) {
      setError('Mohon lengkapi semua bidang yang bertanda bintang (*).');
      return;
    }

    setLoading(true);
    try {
      const creatorId = profile?.uid || user?.uid || 'guest-jastip-' + Date.now();
      const creatorName = profile?.displayName || user?.displayName || 'Jastiper Amanah';
      const creatorAvatar = profile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

      await addJastip({
        creatorId,
        creatorName,
        creatorAvatar,
        title: title.trim(),
        routeFrom: routeFrom.trim(),
        routeTo: routeTo.trim(),
        travelDate: travelDate.trim(),
        feeEstimate: feeEstimate.trim(),
        description: description.trim(),
        photos: photos.length > 0 ? photos : [SAMPLE_JASTIP_PHOTOS[0]],
        whatsapp: whatsapp.trim(),
        status: 'open'
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error adding jastip:', err);
      setError(err.message || 'Gagal menyimpan penawaran jastip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Tawarkan Jasa Titip (Jastip)</h2>
              <p className="text-xs text-slate-500">Bantu belikan barang atau oleh-oleh untuk pelanggan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            id="close-add-jastip-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Penawaran Jastip *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Jastip Oleh-oleh Bandung (Kartika Sari, Bolu Susu, Prima Rasa)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kota / Lokasi Belanja (Dari) *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bandung / IKEA Alam Sutera"
                value={routeFrom}
                onChange={(e) => setRouteFrom(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tujuan / Area Pengiriman (Ke) *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Jakarta / Kirim Ekspedisi Seluruh RI"
                value={routeTo}
                onChange={(e) => setRouteTo(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Jadwal Belanja / Keberangkatan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Setiap Sabtu & Minggu / Tanggal 15"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimasi Biaya / Fee Jastip *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Rp 10.000 / item atau 10% harga barang"
                value={feeEstimate}
                onChange={(e) => setFeeEstimate(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              Nomor WhatsApp Titipan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 08123456789 (pelanggan langsung kirim list titipan)"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Titipan & Ketentuan *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Sebutkan barang yang bisa dititipkan, batas order, metode packing (bubble wrap), dan ketentuan DP..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Foto Contoh Barang / Toko (Opsional)
            </label>
            
            <div className="flex items-center gap-2 mb-2">
              <label className="px-3.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                Unggah Foto
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <span className="text-[11px] text-slate-400">Atau pilih sampel:</span>
              <div className="flex gap-1.5">
                {SAMPLE_JASTIP_PHOTOS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSample(s)}
                    className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-500 transition"
                  >
                    <img src={s} alt="sample" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {photos.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-200 group">
                    <img src={p} alt="p" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Publikasikan Penawaran Jastip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
