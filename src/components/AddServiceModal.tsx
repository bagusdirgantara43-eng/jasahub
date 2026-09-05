import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addService } from '../lib/dbService';
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Wrench, 
  MapPin, 
  Phone, 
  DollarSign, 
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Elektronik & AC',
  'Bangunan & Renovasi',
  'Kebersihan / Cleaning',
  'Fotografi & Desain',
  'Otomotif & Montir',
  'Pertukangan Kayu & Las',
  'Pindahan & Angkut Barang',
  'Les & Kursus Privat',
  'Lainnya'
];

// Sample preset photos for fast demonstration if user doesn't have immediate files on device
const SAMPLE_PRESET_PHOTOS = [
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
];

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { profile, user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(profile?.address || '');
  const [whatsapp, setWhatsapp] = useState(profile?.phoneWhatsApp || '');
  const [priceEstimate, setPriceEstimate] = useState('Rp 100.000 - Rp 250.000');
  const [dpAmount, setDpAmount] = useState<number>(50000);
  const [paymentLink, setPaymentLink] = useState(profile?.paymentLink || 'https://paypal.me/demo');
  const [photos, setPhotos] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle local file upload (converts to base64 Data URL so it previews and uploads effortlessly)
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

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setPhotos((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleAddSamplePhoto = (url: string) => {
    setPhotos((prev) => [...prev, url]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !location.trim() || !whatsapp.trim()) {
      setError('Mohon lengkapi semua bidang yang bertanda bintang (*).');
      return;
    }

    if (photos.length === 0) {
      setError('Mohon unggah minimal 1 foto hasil pekerjaan.');
      return;
    }

    setLoading(true);
    try {
      const providerId = profile?.uid || user?.uid || 'custom-provider-' + Date.now();
      const providerName = profile?.displayName || user?.displayName || 'Penyedia Jasa Handal';
      const providerEmail = profile?.email || user?.email || 'provider@example.com';
      const providerAvatar = profile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

      await addService({
        providerId,
        providerName,
        providerEmail,
        providerAvatar,
        title: title.trim(),
        category,
        description: description.trim(),
        photos,
        location: location.trim(),
        whatsapp: whatsapp.trim(),
        priceEstimate: priceEstimate.trim(),
        dpAmount: Number(dpAmount) || 50000,
        paymentLink: paymentLink.trim() || 'https://paypal.me/demo'
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error adding service:', err);
      setError(err.message || 'Gagal menyimpan jasa ke database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Upload Hasil Pekerjaan & Layanan Baru</h2>
              <p className="text-xs text-slate-500">Tampilkan keahlian Anda ke ribuan calon pelanggan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            id="close-add-service-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Category */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Layanan / Pekerjaan *
              </label>
              <input
                type="text"
                required
                id="input-service-title"
                placeholder="Contoh: Jasa Servis AC & Cuci AC Bersih Bergaransi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Jasa *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimasi Tarif / Biaya *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rp 65.000 - Rp 250.000"
                  value={priceEstimate}
                  onChange={(e) => setPriceEstimate(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Pekerjaan & Detail Keahlian *
            </label>
            <textarea
              rows={4}
              required
              id="input-service-desc"
              placeholder="Jelaskan jenis perbaikan, peralatan yang digunakan, jaminan garansi pengerjaan, jam operasional, dan keunggulan Anda..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Location & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Alamat Lokasi / Area Kerja *
              </label>
              <input
                type="text"
                required
                id="input-service-location"
                placeholder="Contoh: Sukajadi, Kota Bandung, Jawa Barat"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Nomor WhatsApp *
              </label>
              <input
                type="text"
                required
                id="input-service-whatsapp"
                placeholder="Contoh: 08123456789 (otomatis ke wa.me)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* DP & Payment Link configuration */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
            <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              Pengaturan Uang Muka (DP) & Link Pembayaran
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nominal DP yang Diminta (Rp)
                </label>
                <input
                  type="number"
                  min={10000}
                  step={5000}
                  value={dpAmount}
                  onChange={(e) => setDpAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-emerald-600" />
                  Link Pembayaran DP (PayPal.me / QRIS / E-Wallet)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: https://paypal.me/username atau link QRIS"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Upload Photos Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Upload Foto Hasil Pekerjaan * (Bisa banyak foto)
              </label>
              <span className="text-xs text-emerald-700 font-bold">
                {photos.length} foto dipilih
              </span>
            </div>

            {/* File Upload Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 rounded-2xl cursor-pointer transition">
                <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                <span className="text-xs font-bold text-emerald-900">Pilih Foto dari Perangkat</span>
                <span className="text-[11px] text-slate-500">Mendukung format JPG, PNG, WEBP</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Add by Image URL */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-700">Atau Tambah Tautan Gambar (URL)</span>
                <div className="flex gap-1.5 mt-1.5">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shrink-0 transition"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>

            {/* Preset Samples */}
            <div className="mb-3">
              <span className="text-[11px] text-slate-500 block mb-1">
                Sampel Foto Cepat:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {SAMPLE_PRESET_PHOTOS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddSamplePhoto(url)}
                    className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-600 transition shrink-0 group"
                  >
                    <img src={url} alt={`preset ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold">
                      +Pakai
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Preview List */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200">
                    <img
                      src={photo}
                      alt={`upload-${index}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600/80 text-white hover:bg-rose-600 transition opacity-0 group-hover:opacity-100"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              id="btn-submit-new-service"
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan & Publikasikan Jasa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
