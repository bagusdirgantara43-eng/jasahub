import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  Building2,
  User,
  CreditCard
} from 'lucide-react';
import { PaymentTransaction, BankAccountDetails } from '../types';
import { disbursePayment } from '../lib/dbService';
import { useAuth } from '../context/AuthContext';

interface DisburseDPModalProps {
  payment: PaymentTransaction | null;
  providerBankAccount?: BankAccountDetails;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
}

export const DisburseDPModal: React.FC<DisburseDPModalProps> = ({
  payment,
  providerBankAccount,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { profile } = useAuth();
  const [payoutProofImage, setPayoutProofImage] = useState<string | null>(null);
  const [payoutNotes, setPayoutNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !payment) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Harap unggah file foto bukti transfer pencairan.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPayoutProofImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutProofImage) {
      setError('Admin wajib mengunggah bukti transfer pencairan ke Penyedia Jasa.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await disbursePayment(payment.id, {
        payoutProofUrl: payoutProofImage,
        payoutNotes: payoutNotes.trim() || 'Pencairan DP netto setelah fee platform 5%',
        adminName: profile?.displayName || profile?.email || 'Admin JasaHub',
        providerBankAccount: providerBankAccount || payment.providerBankAccount
      });

      onSuccess(payment.id);
      onClose();
    } catch (err: any) {
      console.error('Failed to disburse payment:', err);
      setError(err?.message || 'Gagal menyimpan data pencairan.');
    } finally {
      setLoading(false);
    }
  };

  const bank = providerBankAccount || payment.providerBankAccount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Pencairan DP Rekber
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                Konfirmasi Transfer ke Penyedia
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirmDisburse} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Service & Provider Info */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Layanan:</span>
              <span className="font-bold text-slate-900">{payment.serviceTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Penyedia Jasa:</span>
              <span className="font-semibold text-slate-900">{payment.providerName}</span>
            </div>
          </div>

          {/* Provider Bank Account Details */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 pb-1 border-b border-blue-200">
              <Building2 className="w-4 h-4 text-blue-600" />
              Rekening / E-Wallet Tujuan Transfer Penyedia:
            </div>

            {bank ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-[11px] text-blue-700 block">Bank / E-Wallet:</span>
                  <strong className="text-slate-900 text-sm">{bank.bankName}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-blue-700 block">Nomor Rekening:</span>
                  <strong className="font-mono text-slate-900 text-sm tracking-wider">{bank.accountNumber}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-blue-700 block">Atas Nama:</span>
                  <strong className="text-slate-900 text-sm">{bank.accountHolder}</strong>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Penyedia belum mengisi rekening di profil. Konfirmasi via WhatsApp sebelum mentransfer.</span>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total DP Diterima (grossAmount):</span>
              <span className="font-bold text-slate-900">{formatRupiah(payment.grossAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Potongan Komisi Platform (platformFee 5%):</span>
              <span className="font-semibold text-amber-700">- {formatRupiah(payment.platformFee)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
              <span>Nominal Bersih yang Ditransfer (netPayout):</span>
              <span className="text-emerald-700 text-base">{formatRupiah(payment.netPayout)}</span>
            </div>
          </div>

          {/* Admin Upload Proof of Payout */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Upload Bukti Transfer Pencairan ke Penyedia: <span className="text-red-500">*</span>
            </label>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 transition">
              <input
                type="file"
                id="disburse-proof-file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="disburse-proof-file" className="cursor-pointer block">
                {payoutProofImage ? (
                  <div className="flex items-center justify-center gap-3">
                    <img
                      src={payoutProofImage}
                      alt="Bukti Transfer Pencairan"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-lg border border-emerald-300 shadow-sm"
                    />
                    <div className="text-left text-xs">
                      <p className="font-bold text-slate-800">Bukti Transfer Terlampir</p>
                      <p className="text-[11px] text-emerald-700 font-medium">Klik untuk mengganti gambar</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">
                      Klik untuk unggah tangkapan layar / struk transfer
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Format JPG, PNG (maks. 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Admin Payout Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Catatan Pencairan (Opsional):
            </label>
            <input
              type="text"
              value={payoutNotes}
              onChange={(e) => setPayoutNotes(e.target.value)}
              placeholder="Contoh: No. Referensi Transfer 892019 / BCA Berhasil"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading || !payoutProofImage}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan Pencairan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi & Cairkan DP
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
