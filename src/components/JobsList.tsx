import React, { useState, useMemo } from 'react';
import { JobVacancy, SalaryType } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  DollarSign, 
  PlusCircle, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Building2,
  ShieldAlert,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { BlockContentModal } from './BlockContentModal';
import { blockJob, unblockJob, deleteJob } from '../lib/dbService';

interface JobsListProps {
  jobs: JobVacancy[];
  onOpenAddJob: () => void;
}

export const JobsList: React.FC<JobsListProps> = ({ jobs, onOpenAddJob }) => {
  const { profile, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [salaryFilter, setSalaryFilter] = useState<'all' | 'harian' | 'bulanan'>('all');
  const [jobToBlock, setJobToBlock] = useState<JobVacancy | null>(null);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // If not admin, hide blocked items
      if (!isAdmin && (job.status === 'BLOCKED' || job.isApproved === false)) {
        return false;
      }
      const matchSalary = salaryFilter === 'all' || job.salaryType === salaryFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.posterName.toLowerCase().includes(q);
      return matchSalary && matchSearch;
    });
  }, [jobs, salaryFilter, searchQuery, isAdmin]);

  const handleUnblock = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await unblockJob(jobId);
    } catch (err) {
      console.error('Failed to unblock job:', err);
    }
  };

  const handleDelete = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Yakin ingin menghapus lowongan ini secara permanen?')) {
      try {
        await deleteJob(jobId);
      } catch (err) {
        console.error('Failed to delete job:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl text-white shadow-lg">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
            <Briefcase className="w-3.5 h-3.5" />
            Papan Lowongan Kerja
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Lowongan Kerja Cepat & Fleksibel
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
            Cari pekerjaan harian atau bulanan: penjaga toko, kios fotokopi, barista, montir, dan asisten kerja. Hubungi langsung pemilik usaha tanpa perantara.
          </p>
        </div>

        <button
          onClick={onOpenAddJob}
          id="btn-open-post-job"
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-md transition active:scale-[0.99] shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Pasang Lowongan Kerja
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari lowongan (misal: penjaga kios fotokopi, montir, barista, kasir)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSalaryFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              salaryFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua Gaji
          </button>
          <button
            onClick={() => setSalaryFilter('harian')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              salaryFilter === 'harian'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Gaji Harian
          </button>
          <button
            onClick={() => setSalaryFilter('bulanan')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              salaryFilter === 'bulanan'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Gaji Bulanan
          </button>
        </div>
      </div>

      {/* Jobs Listing */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Tidak ada lowongan yang ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1">Coba gunakan filter lain atau pasang lowongan pekerjaan pertama Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const formattedWhatsApp = job.whatsapp.replace(/\D/g, '');
            const waUrl = `https://wa.me/${formattedWhatsApp}?text=${encodeURIComponent(
              `Halo ${job.posterName}, saya ingin melamar lowongan "${job.title}" yang diposting di JasaHub.`
            )}`;

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Poster & Salary Type Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={job.posterAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80'}
                        alt={job.posterName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{job.posterName}</p>
                        <span className="text-[11px] text-slate-500 font-medium">{job.category}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        job.salaryType === 'harian'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      Gaji {job.salaryType}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                    {job.title}
                  </h3>

                  {/* Salary Highlight */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-emerald-700 font-extrabold text-sm mb-3">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>{job.salary}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                    {job.description}
                  </p>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{job.location}</span>
                  </div>
                </div>

                {/* Apply via WhatsApp button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Status:{' '}
                    {job.status === 'BLOCKED' ? (
                      <span className="text-red-600 font-bold">Diblokir Admin</span>
                    ) : job.status === 'closed' ? (
                      <span className="text-slate-500 font-semibold">Tutup</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">Aktif Membuka</span>
                    )}
                  </span>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-[0.99]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Lamar via WhatsApp
                  </a>
                </div>

                {/* ADMIN ACTION: Kontrol & Moderasi Lowongan Kerja (Hanya Admin) */}
                {isAdmin && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                    {job.status === 'BLOCKED' || job.isApproved === false ? (
                      <div className="w-full flex items-center justify-between gap-1 p-2 rounded-xl bg-red-50 border border-red-200 text-xs">
                        <span className="text-[10px] font-bold text-red-700 flex items-center gap-1 truncate">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                          BLOCKED ({job.blockReason || 'Disembunyikan Admin'})
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleUnblock(job.id, e)}
                            className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded border border-emerald-300 shadow-sm transition"
                          >
                            Pulihkan
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(job.id, e)}
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
                          id={`btn-admin-block-job-${job.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setJobToBlock(job);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition text-center"
                          title="Tindakan Moderasi Admin"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Hapus / Sembunyikan Lowongan
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(job.id, e)}
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
            );
          })}
        </div>
      )}

      {/* Admin Block Job Modal */}
      <BlockContentModal
        isOpen={!!jobToBlock}
        onClose={() => setJobToBlock(null)}
        title="Hapus / Sembunyikan Lowongan Kerja"
        itemTypeLabel="Lowongan Kerja"
        itemTitle={jobToBlock?.title || ''}
        itemOwnerLabel="Pemilik Usaha"
        itemOwnerName={jobToBlock?.posterName || ''}
        itemContact={jobToBlock?.whatsapp}
        predefinedReasons={[
          'Lowongan Fiktif / Indikasi Penipuan',
          'Konten Tidak Layak / Melanggar Aturan',
          'Spam / Duplikasi Lowongan',
          'Lainnya (Tuliskan alasan di bawah)'
        ]}
        onConfirm={async (reason) => {
          if (!jobToBlock) return;
          await blockJob(jobToBlock.id, reason, profile?.email || profile?.displayName || 'Admin JasaHub');
          setJobToBlock(null);
        }}
      />
    </div>
  );
};
