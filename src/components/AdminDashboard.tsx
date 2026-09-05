import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Send, 
  DollarSign, 
  Building2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Clock, 
  ArrowUpRight, 
  Lock, 
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  Layers,
  Sparkles,
  QrCode,
  FileCheck,
  ShieldCheck,
  Briefcase,
  ShoppingBag,
  Trash2,
  MapPin,
  Calendar,
  ArrowRight,
  MessageCircle,
  RotateCcw
} from 'lucide-react';
import { 
  PaymentTransaction, 
  ServiceItem, 
  UserProfile, 
  BankAccountDetails,
  JobVacancy,
  JastipItem
} from '../types';
import { 
  listenToPayments, 
  approvePayment, 
  rejectPayment, 
  unblockService,
  fetchUserProfile,
  blockJob,
  unblockJob,
  deleteJob,
  blockJastip,
  unblockJastip,
  deleteJastip
} from '../lib/dbService';
import { useAuth } from '../context/AuthContext';
import { DisburseDPModal } from './DisburseDPModal';
import { BlockServiceModal } from './BlockServiceModal';
import { BlockContentModal } from './BlockContentModal';

interface AdminDashboardProps {
  services: ServiceItem[];
  jobs?: JobVacancy[];
  jastips?: JastipItem[];
  onSelectService?: (service: ServiceItem) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  services,
  jobs = [],
  jastips = [],
  onSelectService
}) => {
  const { profile, isAdmin, toggleAdminRole } = useAuth();

  // Admin sub-tabs
  const [activeAdminTab, setActiveAdminTab] = useState<'verify' | 'disburse' | 'services' | 'jobs' | 'jastip' | 'analytics'>('verify');
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  // Modals state
  const [disburseTarget, setDisburseTarget] = useState<PaymentTransaction | null>(null);
  const [targetProviderBank, setTargetProviderBank] = useState<BankAccountDetails | undefined>(undefined);
  const [blockTargetService, setBlockTargetService] = useState<ServiceItem | null>(null);
  const [jobToBlock, setJobToBlock] = useState<JobVacancy | null>(null);
  const [jastipToBlock, setJastipToBlock] = useState<JastipItem | null>(null);

  // Reject modal state
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Bukti transfer tidak terbaca / nominal tidak sesuai');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'DANA_DITAMPUNG' | 'DP_DITERUSKAN_KE_PENYEDIA'>('all');
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [jastipSearchTerm, setJastipSearchTerm] = useState('');
  const [jastipStatusFilter, setJastipStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  // Subscribe to real-time payments
  useEffect(() => {
    const unsub = listenToPayments((data) => setPayments(data));
    return () => unsub();
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Open disburse modal and fetch latest provider bank info if needed
  const handleOpenDisburse = async (payment: PaymentTransaction) => {
    setDisburseTarget(payment);
    if (payment.providerBankAccount) {
      setTargetProviderBank(payment.providerBankAccount);
    } else if (payment.providerId) {
      const pProfile = await fetchUserProfile(payment.providerId);
      setTargetProviderBank(pProfile?.bankAccount);
    }
  };

  const handleApprove = async (paymentId: string) => {
    try {
      await approvePayment(paymentId, profile?.displayName || profile?.email || 'Admin JasaHub');
    } catch (err) {
      console.error('Approve failed:', err);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingPaymentId) return;
    try {
      await rejectPayment(rejectingPaymentId, rejectReason, profile?.displayName || profile?.email || 'Admin JasaHub');
      setRejectingPaymentId(null);
    } catch (err) {
      console.error('Reject failed:', err);
    }
  };

  const handleUnblock = async (serviceId: string) => {
    try {
      await unblockService(serviceId);
    } catch (err) {
      console.error('Unblock failed:', err);
    }
  };

  const handleUnblockJobItem = async (jobId: string) => {
    try {
      await unblockJob(jobId);
    } catch (err) {
      console.error('Unblock job failed:', err);
    }
  };

  const handleDeleteJobItem = async (jobId: string) => {
    if (window.confirm('Hapus lowongan kerja ini secara permanen dari platform?')) {
      try {
        await deleteJob(jobId);
      } catch (err) {
        console.error('Delete job failed:', err);
      }
    }
  };

  const handleUnblockJastipItem = async (jastipId: string) => {
    try {
      await unblockJastip(jastipId);
    } catch (err) {
      console.error('Unblock jastip failed:', err);
    }
  };

  const handleDeleteJastipItem = async (jastipId: string) => {
    if (window.confirm('Hapus penawaran jastip ini secara permanen dari platform?')) {
      try {
        await deleteJastip(jastipId);
      } catch (err) {
        console.error('Delete jastip failed:', err);
      }
    }
  };

  // Metrics summary
  const totalGross = payments.reduce((acc, p) => acc + (p.grossAmount || 0), 0);
  const totalPlatformFees = payments
    .filter(p => p.status === 'DANA_DITAMPUNG' || p.status === 'DP_DITERUSKAN_KE_PENYEDIA')
    .reduce((acc, p) => acc + (p.platformFee || 0), 0);
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const escrowCount = payments.filter(p => p.status === 'DANA_DITAMPUNG').length;
  const disbursedCount = payments.filter(p => p.status === 'DP_DITERUSKAN_KE_PENYEDIA').length;
  const blockedServicesCount = services.filter(s => s.status === 'BLOCKED' || s.isApproved === false).length;
  const blockedJobsCount = jobs.filter(j => j.status === 'BLOCKED' || j.isApproved === false).length;
  const blockedJastipsCount = jastips.filter(jt => jt.status === 'BLOCKED' || jt.isApproved === false).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Mode Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              Pusat Kendali Admin JasaHub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Manajemen Rekber QRIS & Pengawasan Jasa
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Verifikasi transfer masuk QRIS <span className="text-emerald-400 font-semibold">RAJA DIMSUM QR FOOD</span>, potong komisi platform 5%, dan cairkan dana aman ke rekening penyedia jasa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-xs">
              <span className="text-slate-400 block text-[11px]">Email Admin Terdeteksi:</span>
              <strong className="text-white font-mono">{profile?.email || 'Belum Login'}</strong>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3.5 border border-slate-700">
            <span className="text-xs text-slate-400 flex items-center justify-between">
              Menunggu Verifikasi
              <Clock className="w-4 h-4 text-amber-400" />
            </span>
            <p className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</p>
            <span className="text-[10px] text-slate-400">Bukti transfer baru</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3.5 border border-slate-700">
            <span className="text-xs text-slate-400 flex items-center justify-between">
              Dana Ditampung (Escrow)
              <Lock className="w-4 h-4 text-blue-400" />
            </span>
            <p className="text-2xl font-black text-blue-400 mt-1">{escrowCount}</p>
            <span className="text-[10px] text-slate-400">Siap dicairkan ke penyedia</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3.5 border border-slate-700">
            <span className="text-xs text-slate-400 flex items-center justify-between">
              Komisi Platform (5%)
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{formatRupiah(totalPlatformFees)}</p>
            <span className="text-[10px] text-slate-400">Pendapatan fee JasaHub</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3.5 border border-slate-700">
            <span className="text-xs text-slate-400 flex items-center justify-between">
              Jasa Disembunyikan
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </span>
            <p className="text-2xl font-black text-red-400 mt-1">{blockedServicesCount}</p>
            <span className="text-[10px] text-slate-400">Layanan diblokir admin</span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveAdminTab('verify')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeAdminTab === 'verify'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Verifikasi Masuk QRIS
          {pendingCount > 0 && (
            <span className="bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded-full text-[10px]">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('disburse')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeAdminTab === 'disburse'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          Pencairan DP Penyedia
          {escrowCount > 0 && (
            <span className="bg-blue-400 text-white font-extrabold px-1.5 py-0.2 rounded-full text-[10px]">
              {escrowCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('services')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeAdminTab === 'services'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Moderasi Jasa ({services.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeAdminTab === 'jobs'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Moderasi Lowongan ({jobs.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('jastip')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeAdminTab === 'jastip'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Moderasi Jastip ({jastips.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeAdminTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Rincian Komisi & Rekber
        </button>
      </div>

      {/* TAB 1: VERIFIKASI QRIS */}
      {activeAdminTab === 'verify' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Antrean Bukti Transfer QRIS dari Penyewa
              </h3>
              <p className="text-xs text-slate-500">
                Periksa struk pembayaran ke merchant RAJA DIMSUM QR FOOD, lalu setujui untuk menampung dana di Rekber.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs p-2 rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value="all">Semua Status</option>
                <option value="PENDING">Hanya PENDING</option>
                <option value="DANA_DITAMPUNG">DANA_DITAMPUNG</option>
                <option value="DP_DITERUSKAN_KE_PENYEDIA">DP_DITERUSKAN</option>
              </select>
            </div>
          </div>

          {payments
            .filter((p) => (statusFilter === 'all' ? true : p.status === statusFilter))
            .length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Tidak ada data pembayaran yang cocok
              </h4>
              <p className="text-xs text-slate-500">
                Saat pengguna membayar DP dan mengunggah foto struk, data otomatis muncul secara realtime di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payments
                .filter((p) => (statusFilter === 'all' ? true : p.status === statusFilter))
                .map((payment) => (
                  <div 
                    key={payment.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Status and Timestamp */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                          payment.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : payment.status === 'DANA_DITAMPUNG'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : payment.status === 'DP_DITERUSKAN_KE_PENYEDIA'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-red-100 text-red-900 border-red-300'
                        }`}>
                          {payment.status === 'PENDING' && '⏳ MENUNGGU VERIFIKASI'}
                          {payment.status === 'DANA_DITAMPUNG' && '🛡️ DANA_DITAMPUNG (ESCROW)'}
                          {payment.status === 'DP_DITERUSKAN_KE_PENYEDIA' && '✅ DP DITERUSKAN KE PENYEDIA'}
                          {payment.status === 'REJECTED' && '❌ DITOLAK ADMIN'}
                        </span>

                        <span className="text-[11px] text-slate-400">
                          {new Date(payment.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>

                      {/* Service & Customer details */}
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {payment.serviceTitle}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Penyedia: <strong className="text-slate-800">{payment.providerName}</strong>
                      </p>

                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Penyewa (Pengirim):</span>
                          <strong className="text-slate-800">{payment.senderName || payment.customerName}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">Merchant Target:</span>
                          <span className="font-semibold text-emerald-800 text-[11px]">{payment.merchantName}</span>
                        </div>
                      </div>

                      {/* Amounts Breakdown */}
                      <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Gross Masuk QRIS:</span>
                          <strong className="text-slate-900">{formatRupiah(payment.grossAmount)}</strong>
                        </div>
                        <div className="flex justify-between text-amber-700">
                          <span>Potongan Komisi (5%):</span>
                          <span>- {formatRupiah(payment.platformFee)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                          <span>Net Payout untuk Penyedia:</span>
                          <span>{formatRupiah(payment.netPayout)}</span>
                        </div>
                      </div>

                      {/* Receipt Preview Thumbnail */}
                      <div className="mt-3">
                        <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                          Bukti Transfer Penyewa:
                        </span>
                        <div 
                          onClick={() => setSelectedProofUrl(payment.paymentProofUrl)}
                          className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-100 max-h-36 flex items-center justify-center"
                        >
                          <img
                            src={payment.paymentProofUrl}
                            alt="Bukti Struk Transfer"
                            referrerPolicy="no-referrer"
                            className="w-full h-32 object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                            <Eye className="w-4 h-4" />
                            Klik untuk Perbesar Foto
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      {payment.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(payment.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition shadow-md shadow-emerald-600/20"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Setujui (Approve)
                          </button>

                          <button
                            type="button"
                            onClick={() => setRejectingPaymentId(payment.id)}
                            className="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs py-2.5 px-3 rounded-xl transition"
                          >
                            <XCircle className="w-4 h-4" />
                            Tolak
                          </button>
                        </>
                      )}

                      {payment.status === 'DANA_DITAMPUNG' && (
                        <button
                          type="button"
                          onClick={() => handleOpenDisburse(payment)}
                          className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition shadow-md shadow-indigo-600/20"
                        >
                          <Send className="w-4 h-4" />
                          Cairkan DP ke Penyedia ({formatRupiah(payment.netPayout)})
                        </button>
                      )}

                      {payment.status === 'DP_DITERUSKAN_KE_PENYEDIA' && (
                        <div className="w-full text-center text-xs font-semibold text-emerald-700 bg-emerald-50 py-2 rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Telah Dicairkan oleh Admin
                        </div>
                      )}

                      {payment.status === 'REJECTED' && (
                        <div className="w-full text-xs text-red-700 bg-red-50 p-2 rounded-xl border border-red-200">
                          <strong>Alasan Ditolak:</strong> {payment.rejectReason || 'Bukti tidak sesuai'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENCAIRAN DP PENYEDIA */}
      {activeAdminTab === 'disburse' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pencairan DP ke Rekening Penyedia Jasa
              </h3>
              <p className="text-xs text-slate-500">
                Transfer dana bersih (netPayout) setelah dikurangi 5% komisi platform resmi ke rekening/e-wallet penyedia.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payments
              .filter(p => p.status === 'DANA_DITAMPUNG' || p.status === 'DP_DITERUSKAN_KE_PENYEDIA')
              .length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Send className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Belum Ada DP yang Siap Dicairkan
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Setelah Admin menyetujui bukti transfer QRIS pada menu "Verifikasi Masuk QRIS", transaksi akan masuk ke sini untuk dicairkan ke rekening penyedia.
                </p>
              </div>
            ) : (
              payments
                .filter(p => p.status === 'DANA_DITAMPUNG' || p.status === 'DP_DITERUSKAN_KE_PENYEDIA')
                .map((payment) => (
                  <div 
                    key={payment.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                          payment.status === 'DANA_DITAMPUNG'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}>
                          {payment.status === 'DANA_DITAMPUNG' ? '🛡️ DANA DITAMPUNG (SIAP CAIR)' : '✅ TELAH DICAIRKAN'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ID: {payment.id.substring(0, 8)}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {payment.serviceTitle}
                      </h4>

                      {/* Provider Details & Bank Account Info */}
                      <div className="mt-3 bg-blue-50/70 rounded-xl p-3.5 border border-blue-200 space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-blue-950">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          Data Rekening / E-Wallet Penyedia:
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 text-slate-800">
                          <div>
                            <span className="text-[10px] text-blue-700 block">Nama Penyedia:</span>
                            <strong className="text-xs">{payment.providerName}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-blue-700 block">Bank / E-Wallet:</span>
                            <strong className="text-xs">{payment.providerBankAccount?.bankName || 'BCA / Mandiri / GoPay'}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-blue-700 block">Nomor Rekening:</span>
                            <strong className="font-mono text-xs">{payment.providerBankAccount?.accountNumber || '8735019284'}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-blue-700 block">Atas Nama:</span>
                            <strong className="text-xs">{payment.providerBankAccount?.accountHolder || payment.providerName}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Financial Calculation Box */}
                      <div className="mt-3 bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex justify-between text-slate-600">
                          <span>Total DP Diterima (grossAmount):</span>
                          <span className="font-bold text-slate-900">{formatRupiah(payment.grossAmount)}</span>
                        </div>
                        <div className="flex justify-between text-amber-700 font-medium">
                          <span>Potongan Fee Platform (5%):</span>
                          <span>- {formatRupiah(payment.platformFee)}</span>
                        </div>
                        <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
                          <span>Nominal Bersih yang Ditransfer:</span>
                          <span className="text-emerald-700 text-base">{formatRupiah(payment.netPayout)}</span>
                        </div>
                      </div>

                      {/* If already disbursed, show proof */}
                      {payment.payoutProofUrl && (
                        <div className="mt-3 text-xs">
                          <span className="text-slate-500 block mb-1">Bukti Transfer Pencairan:</span>
                          <button
                            type="button"
                            onClick={() => setSelectedProofUrl(payment.payoutProofUrl!)}
                            className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Lihat Bukti Transfer Admin
                          </button>
                        </div>
                      )}
                    </div>

                    {payment.status === 'DANA_DITAMPUNG' ? (
                      <button
                        type="button"
                        onClick={() => handleOpenDisburse(payment)}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-[0.99]"
                      >
                        <Send className="w-4 h-4" />
                        Cairkan DP ({formatRupiah(payment.netPayout)})
                      </button>
                    ) : (
                      <div className="text-center text-xs font-semibold text-emerald-700 bg-emerald-50 py-2.5 rounded-xl border border-emerald-200">
                        ✅ Dana Berhasil Dicairkan ke Penyedia Jasa
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PENGELOLAAN JASA (MODERASI ADMIN) */}
      {activeAdminTab === 'services' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pengawasan Iklan & Layanan Jasa
              </h3>
              <p className="text-xs text-slate-500">
                Admin memiliki wewenang untuk menyembunyikan atau memblokir iklan yang melanggar aturan atau belum membayar fee platform.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari judul / nama penyedia..."
                className="text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services
              .filter(s => 
                s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                s.providerName.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((service) => {
                const isBlocked = service.status === 'BLOCKED' || service.isApproved === false;
                return (
                  <div 
                    key={service.id}
                    className={`bg-white rounded-2xl border transition shadow-sm p-4 flex flex-col justify-between space-y-3 ${
                      isBlocked ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Status indicator */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {isBlocked ? (
                          <span className="text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            BLOCKED / DISEMBUNYIKAN
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                            AKTIF & TAMPIL PUBLIK
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 font-mono">
                          DP: {formatRupiah(service.dpAmount || 50000)}
                        </span>
                      </div>

                      {/* Photo Thumbnail */}
                      <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                        <img
                          src={service.photos?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80'}
                          alt={service.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{service.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Penyedia: <span className="font-semibold">{service.providerName}</span></p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">WA: {service.whatsapp}</p>

                      {isBlocked && (
                        <div className="mt-2.5 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-900">
                          <strong>Alasan Blokir:</strong> {service.blockReason || 'Melanggar aturan platform'}
                        </div>
                      )}
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
                      {isBlocked ? (
                        <button
                          type="button"
                          onClick={() => handleUnblock(service.id)}
                          className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Pulihkan / Buka Blokir
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setBlockTargetService(service)}
                          className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs py-2 px-3 rounded-xl transition"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          Hapus / Sembunyikan Jasa
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB: MODERASI LOWONGAN KERJA */}
      {activeAdminTab === 'jobs' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                  <Briefcase className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Pengawasan & Moderasi Lowongan Kerja ({jobs.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Pantau lowongan kerja yang diposting oleh pengguna. Blokir atau hapus lowongan fiktif, indikasi penipuan, atau melanggar aturan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={jobStatusFilter}
                onChange={(e) => setJobStatusFilter(e.target.value as any)}
                className="text-xs p-2 rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value="all">Semua Status ({jobs.length})</option>
                <option value="active">Aktif ({jobs.length - blockedJobsCount})</option>
                <option value="blocked">Diblokir ({blockedJobsCount})</option>
              </select>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={jobSearchTerm}
                  onChange={(e) => setJobSearchTerm(e.target.value)}
                  placeholder="Cari lowongan, pemilik, kota..."
                  className="text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              Belum ada data lowongan kerja yang terdaftar di database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs
                .filter((job) => {
                  const matchStatus = 
                    jobStatusFilter === 'all'
                      ? true
                      : jobStatusFilter === 'blocked'
                        ? (job.status === 'BLOCKED' || job.isApproved === false)
                        : (job.status !== 'BLOCKED' && job.isApproved !== false);
                  const q = jobSearchTerm.toLowerCase();
                  const matchSearch =
                    job.title.toLowerCase().includes(q) ||
                    job.posterName.toLowerCase().includes(q) ||
                    job.location.toLowerCase().includes(q) ||
                    job.description.toLowerCase().includes(q);
                  return matchStatus && matchSearch;
                })
                .map((job) => {
                  const isBlocked = job.status === 'BLOCKED' || job.isApproved === false;
                  const waClean = (job.whatsapp || '').replace(/\D/g, '');
                  const waFormatted = waClean.startsWith('0') ? '62' + waClean.slice(1) : waClean;
                  const waUrl = `https://wa.me/${waFormatted}?text=${encodeURIComponent(`Halo ${job.posterName}, kami dari Tim Admin JasaHub mengenai lowongan "${job.title}".`)}`;

                  return (
                    <div 
                      key={job.id}
                      className={`bg-white rounded-2xl border transition shadow-sm p-4 flex flex-col justify-between space-y-3 ${
                        isBlocked ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                      }`}
                    >
                      <div>
                        {/* Status Header */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {isBlocked ? (
                            <span className="text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" />
                              BLOCKED / DISEMBUNYIKAN
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 px-2 py-0.5 rounded-full">
                              AKTIF MEMBUKA
                            </span>
                          )}

                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                            {job.salary} ({job.salaryType})
                          </span>
                        </div>

                        {/* Title & Poster Info */}
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{job.title}</h4>
                        
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                          <span className="font-semibold">{job.posterName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {job.location}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                          {job.description}
                        </p>

                        <div className="mt-2 text-xs text-slate-500 font-mono">
                          Kontak WA: {job.whatsapp}
                        </div>

                        {isBlocked && (
                          <div className="mt-2.5 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-900">
                            <strong>Alasan Blokir:</strong> {job.blockReason || 'Melanggar aturan platform'}
                          </div>
                        )}
                      </div>

                      {/* Admin Controls */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        {isBlocked ? (
                          <button
                            type="button"
                            onClick={() => handleUnblockJobItem(job.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Pulihkan Lowongan
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setJobToBlock(job)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs py-2 px-3 rounded-xl transition"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            Hapus / Sembunyikan
                          </button>
                        )}

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-xl border border-slate-200 transition"
                          title="Hubungi Pemilik via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteJobItem(job.id)}
                          className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl border border-slate-200 transition"
                          title="Hapus Permanen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB: MODERASI JASA TITIP (JASTIP) */}
      {activeAdminTab === 'jastip' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Pengawasan & Moderasi Jasa Titip (Jastip) ({jastips.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Awasi listing penawaran titip belanja. Pastikan tidak ada barang terlarang, produk ilegal, atau indikasi penipuan transaksi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={jastipStatusFilter}
                onChange={(e) => setJastipStatusFilter(e.target.value as any)}
                className="text-xs p-2 rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value="all">Semua Status ({jastips.length})</option>
                <option value="active">Aktif ({jastips.length - blockedJastipsCount})</option>
                <option value="blocked">Diblokir ({blockedJastipsCount})</option>
              </select>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={jastipSearchTerm}
                  onChange={(e) => setJastipSearchTerm(e.target.value)}
                  placeholder="Cari jastip, jastiper, rute..."
                  className="text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {jastips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              Belum ada data jastip yang terdaftar di database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jastips
                .filter((jastip) => {
                  const matchStatus = 
                    jastipStatusFilter === 'all'
                      ? true
                      : jastipStatusFilter === 'blocked'
                        ? (jastip.status === 'BLOCKED' || jastip.isApproved === false)
                        : (jastip.status !== 'BLOCKED' && jastip.isApproved !== false);
                  const q = jastipSearchTerm.toLowerCase();
                  const matchSearch =
                    jastip.title.toLowerCase().includes(q) ||
                    jastip.creatorName.toLowerCase().includes(q) ||
                    jastip.routeFrom.toLowerCase().includes(q) ||
                    jastip.routeTo.toLowerCase().includes(q) ||
                    jastip.description.toLowerCase().includes(q);
                  return matchStatus && matchSearch;
                })
                .map((jastip) => {
                  const isBlocked = jastip.status === 'BLOCKED' || jastip.isApproved === false;
                  const waClean = (jastip.whatsapp || '').replace(/\D/g, '');
                  const waFormatted = waClean.startsWith('0') ? '62' + waClean.slice(1) : waClean;
                  const waUrl = `https://wa.me/${waFormatted}?text=${encodeURIComponent(`Halo ${jastip.creatorName}, kami dari Tim Admin JasaHub mengenai penawaran jastip "${jastip.title}".`)}`;

                  return (
                    <div 
                      key={jastip.id}
                      className={`bg-white rounded-2xl border transition shadow-sm p-4 flex flex-col justify-between space-y-3 ${
                        isBlocked ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                      }`}
                    >
                      <div>
                        {/* Status Header */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {isBlocked ? (
                            <span className="text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" />
                              BLOCKED / DISEMBUNYIKAN
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                              AKTIF JASTIP
                            </span>
                          )}

                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                            Fee: {jastip.feeEstimate}
                          </span>
                        </div>

                        {/* Rute Badge */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 p-2 rounded-xl mb-2">
                          <span className="text-slate-900">{jastip.routeFrom}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-slate-900">{jastip.routeTo}</span>
                          <span className="text-[11px] text-slate-400 ml-auto flex items-center gap-1 font-normal">
                            <Calendar className="w-3 h-3" />
                            {jastip.travelDate}
                          </span>
                        </div>

                        {/* Title & Creator */}
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{jastip.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">Jastiper: <span className="font-semibold">{jastip.creatorName}</span></p>

                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                          {jastip.description}
                        </p>

                        <div className="mt-2 text-xs text-slate-500 font-mono">
                          Kontak WA: {jastip.whatsapp}
                        </div>

                        {isBlocked && (
                          <div className="mt-2.5 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-900">
                            <strong>Alasan Blokir:</strong> {jastip.blockReason || 'Melanggar aturan platform'}
                          </div>
                        )}
                      </div>

                      {/* Admin Controls */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        {isBlocked ? (
                          <button
                            type="button"
                            onClick={() => handleUnblockJastipItem(jastip.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Pulihkan Jastip
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setJastipToBlock(jastip)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs py-2 px-3 rounded-xl transition"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            Hapus / Sembunyikan
                          </button>
                        )}

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-xl border border-slate-200 transition"
                          title="Hubungi Jastiper via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteJastipItem(jastip.id)}
                          className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl border border-slate-200 transition"
                          title="Hapus Permanen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RINCIAN KOMISI & REKBER */}
      {activeAdminTab === 'analytics' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Informasi Merchant & Kebijakan Komisi Platform
              </h3>
              <p className="text-xs text-slate-500">
                Data penampung resmi Rekber JasaHub Indonesia
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Merchant Resmi Rekber:</span>
              <p className="text-base font-bold text-slate-900 mt-1">RAJA DIMSUM QR FOOD</p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">NMID: ID1020255104615</p>
              <p className="text-[11px] text-emerald-700 mt-2 font-medium">Bank Mitra: BNI & Danantara Indonesia</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Persentase Fee Platform:</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">5%</p>
              <p className="text-xs text-slate-600 mt-1">
                Dipungut otomatis dari grossAmount setiap pembayaran DP berhasil.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Akumulasi Komisi Diterima:</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{formatRupiah(totalPlatformFees)}</p>
              <p className="text-xs text-slate-600 mt-1">
                Dari total {disbursedCount + escrowCount} transaksi QRIS terverifikasi.
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              SOP Rekening Bersama (Rekber) JasaHub:
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
              <li>Penyewa Jasa melakukan scan QRIS dan mentransfer DP ke rekening penampung resmi.</li>
              <li>Penyewa mengunggah foto struk bukti transfer ke sistem JasaHub (status transaksi menjadi <strong>PENDING</strong>).</li>
              <li>Admin memverifikasi kecocokan struk di tab "Verifikasi Masuk QRIS" dan menyetujui (status menjadi <strong>DANA_DITAMPUNG</strong>).</li>
              <li>Admin mentransfer nominal bersih (netPayout) setelah fee 5% ke rekening penyedia jasa, lalu mengunggah bukti pencairan (status menjadi <strong>DP_DITERUSKAN_KE_PENYEDIA</strong>).</li>
            </ol>
          </div>
        </div>
      )}

      {/* Proof Image Enlarge Modal */}
      {selectedProofUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedProofUrl(null)}
        >
          <div className="relative max-w-2xl w-full bg-white rounded-2xl p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedProofUrl(null)}
              className="absolute top-3 right-3 p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h4 className="text-sm font-bold text-slate-900 mb-3">Foto Bukti Transfer (Pratinjau Penuh)</h4>
            <div className="max-h-[80vh] overflow-auto flex items-center justify-center bg-slate-900 rounded-xl p-2">
              <img
                src={selectedProofUrl}
                alt="Bukti Transfer Penuh"
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Disburse Modal */}
      <DisburseDPModal
        payment={disburseTarget}
        providerBankAccount={targetProviderBank}
        isOpen={!!disburseTarget}
        onClose={() => setDisburseTarget(null)}
        onSuccess={(id) => {
          setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'DP_DITERUSKAN_KE_PENYEDIA' } : p));
        }}
      />

      {/* Block Service Modal */}
      <BlockServiceModal
        service={blockTargetService}
        isOpen={!!blockTargetService}
        onClose={() => setBlockTargetService(null)}
        onSuccess={(id, reason) => {
          // Handled via realtime listener, or local optimistic update
        }}
      />

      {/* Block Job Modal */}
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

      {/* Block Jastip Modal */}
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

      {/* Reject Payment Prompt Modal */}
      {rejectingPaymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-100 space-y-4">
            <h4 className="text-base font-bold text-slate-900">Tolak Bukti Transfer</h4>
            <p className="text-xs text-slate-500">
              Tuliskan alasan penolakan bukti transfer ini untuk catatan transaksi.
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Alasan penolakan..."
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingPaymentId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
