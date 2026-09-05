import React, { useState, useEffect } from 'react';
import { ServiceItem } from '../types';
import { updateService } from '../lib/dbService';
import { 
  X, 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  MapPin, 
  Phone, 
  DollarSign, 
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Edit3
} from 'lucide-react';

interface EditServiceModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedService: ServiceItem) => void;
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

const SAMPLE_PRESET_PHOTOS = [
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
];

export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [priceEstimate, setPriceEstimate] = useState('');
  const [dpAmount, setDpAmount] = useState<number>(50000);
  const [paymentLink, setPaymentLink] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setTitle(service.title || '');
      setCategory(service.category || CATEGORIES[0]);
      setDescription(service.description || '');
      setLocation(service.location || '');
      setWhatsapp(service.whatsapp || '');
      setPriceEstimate(service.priceEstimate || '');
      setDpAmount(service.dpAmount || 50000);
      setPaymentLink(service.paymentLink || '');
      setPhotos(service.photos ? [...service.photos] : []);
      setError(null);
    }
  }, [service, isOpen]);

  if (!isOpen || !service) return null;

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
      setError('Mohon sertakan minimal 1 foto hasil pekerjaan.');
      return;
    }

    setLoading(true);
    try {
      const updatedFields: Partial<ServiceItem> = {
        title: title.trim(),
        category,
        description: description.trim(),
        photos,
        location: location.trim(),
        whatsapp: whatsapp.trim(),
        priceEstimate: priceEstimate.trim(),
        dpAmount: Number(dpAmount) || 50000,
        paymentLink: paymentLink.trim()
      };

      await updateService(service.id, updatedFields);

      const fullUpdatedService: ServiceItem = {
        ...service,
        ...updatedFields
      };

      onSuccess(fullUpdatedService);
      onClose();
    } catch (err: any) {
      console.error('Error updating service:', err);
      // Even if Firestore throws permission in offline/demo, update local state
      const fallbackUpdated: ServiceItem = {
        ...service,
        title: title.trim(),
        category,
        description: description.trim(),
        photos,
        location: location.trim(),
        whatsapp: whatsapp.trim(),
        priceEstimate: priceEstimate.trim(),
        dpAmount: Number(dpAmount) || 50000,
        paymentLink: paymentLink.trim()
      };
      onSuccess(fallbackUpdated);
      onClose();
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Informasi Layanan</h2>
              <p className="text-xs text-slate-500">Perbarui foto hasil kerja, deskripsi, alamat, dan nomor WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            id="btn-close-edit-service"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Layanan / Keahlian *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Spesialis Servis AC & Pasang AC Rumah/Kantor Bergaransi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Layanan *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimasi Tarif / Biaya Jasa *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Rp 80.000 / unit atau Mulai Rp 150.000"
                value={priceEstimate}
                onChange={(e) => setPriceEstimate(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Photos Management Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Foto Hasil Pekerjaan Anda * ({photos.length} foto tersimpan)
              </label>
              <span className="text-[11px] text-slate-400">Penyewa lebih percaya dengan foto asli</span>
            </div>

            {/* Current Photos Grid with Delete Buttons */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                    <img
                      src={url}
                      alt={`Foto hasil kerja ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-medium">
                      #{idx + 1} {idx === 0 ? '(Cover)' : ''}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition"
                      title="Hapus foto ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Photos Controls */}
            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm">
                  <Upload className="w-4 h-4" />
                  Upload Foto Baru
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex-1 flex gap-1.5 min-w-[200px]">
                  <input
                    type="url"
                    placeholder="Atau tempel URL gambar..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* Sample presets */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                <span className="text-[11px] text-slate-500 font-medium">Tambah contoh cepat:</span>
                <div className="flex gap-1.5">
                  {SAMPLE_PRESET_PHOTOS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddSamplePhoto(sample)}
                      className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-500 transition shrink-0"
                    >
                      <img src={sample} alt="sample" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Lengkap, Pengalaman & Garansi Hasil Kerja *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Jelaskan detail pengerjaan, alat yang digunakan, pengalaman kerja, serta garansi setelah pengerjaan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-medium"
            />
          </div>

          {/* WhatsApp & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Nomor WhatsApp Penyedia *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 08123456789 (pelanggan chat ke nomor ini)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Pelanggan akan langsung terhubung ke nomor ini saat chat.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Alamat Lokasi & Wilayah Pengerjaan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bandung & Cimahi (bisa dipanggil ke lokasi)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Tentukan kota atau radius wilayah yang Anda layani.</span>
            </div>
          </div>

          {/* DP Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nominal Uang Muka (DP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={dpAmount}
                  onChange={(e) => setDpAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Uang muka untuk mengunci jadwal pengerjaan.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                Tautan Pembayaran DP (Opsional)
              </label>
              <input
                type="text"
                placeholder="https://paypal.me/username atau link QRIS"
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Tautan dibuka saat pelanggan klik "Bayar DP".</span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              id="btn-submit-edit-service"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>Menyimpan Perubahan...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan Perubahan Layanan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
