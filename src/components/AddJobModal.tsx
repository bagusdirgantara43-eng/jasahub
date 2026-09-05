import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addJob } from '../lib/dbService';
import { SalaryType } from '../types';
import { 
  X, 
  Briefcase, 
  MapPin, 
  Phone, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const JOB_CATEGORIES = [
  'Pelayanan / Toko',
  'F&B / Restoran',
  'Otomotif / Montir',
  'Konstruksi / Pertukangan',
  'Cleaning & Rumah Tangga',
  'Admin & Logistik',
  'Lainnya'
];

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { profile, user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(JOB_CATEGORIES[0]);
  const [salary, setSalary] = useState('');
  const [salaryType, setSalaryType] = useState<SalaryType>('harian');
  const [location, setLocation] = useState(profile?.address || '');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState(profile?.phoneWhatsApp || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !salary.trim() || !location.trim() || !description.trim() || !whatsapp.trim()) {
      setError('Mohon lengkapi semua kolom yang wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const posterId = profile?.uid || user?.uid || 'guest-poster-' + Date.now();
      const posterName = profile?.displayName || user?.displayName || 'Pemilik Usaha';
      const posterAvatar = profile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80';

      await addJob({
        posterId,
        posterName,
        posterAvatar,
        title: title.trim(),
        category,
        salary: salary.trim(),
        salaryType,
        location: location.trim(),
        description: description.trim(),
        whatsapp: whatsapp.trim(),
        status: 'open'
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error adding job vacancy:', err);
      setError(err.message || 'Gagal memasang lowongan kerja.');
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
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Pasang Lowongan Pekerjaan Baru</h2>
              <p className="text-xs text-slate-500">Temukan pekerja terampil dan berdedikasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            id="close-add-job-modal"
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
              Judul Lowongan Pekerjaan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Cari Penjaga Kios Fotokopi & Print"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Pekerjaan *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipe Penggajian *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSalaryType('harian')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    salaryType === 'harian'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Gaji Harian
                </button>
                <button
                  type="button"
                  onClick={() => setSalaryType('bulanan')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    salaryType === 'bulanan'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Gaji Bulanan
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Besaran Gaji ({salaryType === 'harian' ? 'Harian' : 'Bulanan'}) *
            </label>
            <input
              type="text"
              required
              placeholder={salaryType === 'harian' ? 'Contoh: Rp 90.000 / hari' : 'Contoh: Rp 2.800.000 / bulan'}
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Lokasi Pekerjaan / Tempat Usaha *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Jl. Dipatiukur No. 88 (dekat Kampus UNPAD), Bandung"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              Nomor WhatsApp untuk Lamaran / Konfirmasi *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 08123456789 (pelamar bisa langsung klik chat)"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Pekerjaan, Syarat & Jam Kerja *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Tuliskan rincian tugas, jam kerja, kualifikasi yang dicari, fasilitas makan siang/transport jika ada..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
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
              {loading ? 'Memposting...' : 'Pasang Lowongan Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
