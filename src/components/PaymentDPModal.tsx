import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  FileText,
  Lock,
  ArrowRight,
  Info,
  Maximize2
} from 'lucide-react';
import { createPaymentTransaction, calculateCommission } from '../lib/dbService';
import { useAuth } from '../context/AuthContext';
import { PaymentTransaction } from '../types';

interface PaymentDPModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
  providerName: string;
  providerId?: string;
  serviceId?: string;
  dpAmount: number;
  paymentLink?: string;
  orderId?: string;
  onConfirmPaid?: (method: string) => void;
}

export const PaymentDPModal: React.FC<PaymentDPModalProps> = ({
  isOpen,
  onClose,
  serviceTitle,
  providerName,
  providerId = 'default-provider',
  serviceId = 'default-service',
  dpAmount,
  orderId,
  onConfirmPaid
}) => {
  const { profile } = useAuth();

  // Calculation Breakdown (5% platform fee)
  const actualGrossAmount = dpAmount || 50000;
  const { grossAmount, platformFeePercentage, platformFee, netPayout } = calculateCommission(actualGrossAmount, 5);

  // Form states
  const [senderName, setSenderName] = useState(profile?.displayName || '');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isZoomedQR, setIsZoomedQR] = useState(false);

  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Handle file receipt upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Harap unggah file foto bukti transfer (JPG, PNG, WebP).');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran foto maksimal 5MB.');
      return;
    }

    setErrorMessage(null);
    setReceiptFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Harap unggah file foto bukti transfer.');
      return;
    }
    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit payment proof to Firestore `payments` collection
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiptImage) {
      setErrorMessage('Harap unggah foto bukti pembayaran / struk transfer terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const paymentData: Omit<PaymentTransaction, 'id' | 'createdAt' | 'status'> = {
        orderId: orderId || undefined,
        serviceId: serviceId || undefined,
        serviceTitle,
        providerId: providerId || 'provider-unknown',
        providerName,
        customerId: profile?.uid || 'guest-customer',
        customerName: profile?.displayName || senderName || 'Penyewa Jasa',
        customerEmail: profile?.email || '',
        customerPhone: profile?.phoneWhatsApp || '',
        grossAmount,
        platformFeePercentage,
        platformFee,
        netPayout,
        paymentProofUrl: receiptImage,
        senderName: senderName.trim() || undefined,
        notes: notes.trim() || undefined,
        merchantName: 'RAJA DIMSUM QR FOOD'
      };

      await createPaymentTransaction(paymentData);

      setIsSubmitting(false);
      setSubmitSuccess(true);

      if (onConfirmPaid) {
        onConfirmPaid('QRIS_REKBER');
      }
    } catch (err: any) {
      console.error('Failed to submit payment proof:', err);
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Terjadi kesalahan saat mengirim bukti transfer. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 sm:p-7 my-6 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Pembayaran DP via QRIS
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Rekber Resmi
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sistem Rekening Bersama (Rekber) JasaHub
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            id="btn-close-payment-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 text-slate-700">
          {submitSuccess ? (
            /* Success State View */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Bukti Pembayaran Terkirim!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Terima kasih! Bukti transfer Anda sebesar <strong className="text-emerald-700">{formatRupiah(grossAmount)}</strong> telah masuk ke antrean verifikasi Admin JasaHub.
                </p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Status Transaksi:</span>
                  <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">PENDING (Menunggu Verifikasi)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Merchant Penerima:</span>
                  <span className="font-semibold text-slate-900">RAJA DIMSUM QR FOOD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Layanan:</span>
                  <span className="font-medium text-slate-900">{serviceTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Penyedia Jasa:</span>
                  <span className="font-medium text-slate-900">{providerName}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                Dana Anda akan berstatus <span className="font-semibold text-emerald-700">DANA_DITAMPUNG</span> di escrow JasaHub sampai pengerjaan disepakati atau selesai.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/20"
              >
                Selesai & Tutup
              </button>
            </div>
          ) : (
            /* Standard Payment Flow Form */
            <form onSubmit={handleSubmitProof} className="space-y-5">
              {/* Order & Amount Highlight */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Layanan Dipesan:</span>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{serviceTitle}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Penyedia: <span className="font-semibold">{providerName}</span></p>
                  </div>
                  <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium">Uang Muka (DP) Masuk QRIS:</span>
                    <p className="text-lg font-extrabold text-emerald-600">{formatRupiah(grossAmount)}</p>
                  </div>
                </div>
              </div>

              {/* QRIS Display Section */}
              <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl p-4 border-2 border-emerald-500/30 text-center shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    Kode QRIS Resmi JasaHub
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsZoomedQR(!isZoomedQR)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    <Maximize2 className="w-3 h-3" />
                    {isZoomedQR ? 'Perkecil' : 'Perbesar Gambar'}
                  </button>
                </div>

                {/* QR Code Card Image */}
                <div className="relative mx-auto inline-block rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white p-2">
                  <img
                    src="/qris-merchant.jpg"
                    alt="QRIS Resmi Rekber JasaHub"
                    referrerPolicy="no-referrer"
                    className={`mx-auto rounded-lg object-contain transition-all duration-300 ${
                      isZoomedQR ? 'w-80 max-w-full' : 'w-56 h-auto max-h-72'
                    }`}
                  />
                  <div className="mt-2 text-center text-[10px] text-slate-600 font-medium flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>QRIS Resmi Penampung Rekber JasaHub</span>
                  </div>
                </div>

                {/* Merchant Clarification Note */}
                <div className="mt-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-left flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed text-emerald-950">
                    <strong>Sistem Rekber Terlindungi:</strong> Scan barcode QRIS di atas menggunakan e-wallet (GoPay, OVO, Dana, ShopeePay) atau Mobile Banking (BCA, Mandiri, BRI, BNI). Dana DP Anda ditampung secara aman dan baru diteruskan setelah pekerjaan dikonfirmasi selesai.
                  </div>
                </div>
              </div>

              {/* Automatic Commission Breakdown (Part 3) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 pb-1.5 border-b border-slate-200">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Rincian Pembayaran Rekber:
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Fee Platform 5%
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Total DP Discan (grossAmount):</span>
                    <span className="font-bold text-slate-900">{formatRupiah(grossAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Potongan Fee Platform (platformFee 5%):</span>
                    <span className="font-semibold text-amber-700">- {formatRupiah(platformFee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200">
                    <span className="font-bold">Nominal Bersih untuk Penyedia (netPayout):</span>
                    <span className="font-extrabold text-emerald-700">{formatRupiah(netPayout)}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 italic mt-1">
                  * Dana disimpan aman di penampung resmi sampai admin menyetujui dan meneruskan ke penyedia jasa.
                </p>
              </div>

              {/* Form Upload Bukti Transfer */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Upload Bukti Pembayaran (Foto/Struk Transfer): <span className="text-red-500">*</span>
                </label>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                    receiptImage 
                      ? 'border-emerald-500 bg-emerald-50/40' 
                      : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    id="receipt-file-input"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="receipt-file-input" className="cursor-pointer block">
                    {receiptImage ? (
                      <div className="flex items-center justify-center gap-3">
                        <img
                          src={receiptImage}
                          alt="Bukti Transfer Preview"
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 object-cover rounded-lg border border-emerald-300 shadow-sm"
                        />
                        <div className="text-left text-xs">
                          <p className="font-bold text-slate-800 line-clamp-1">{receiptFileName || 'bukti_transfer.jpg'}</p>
                          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Foto siap dikirim • Klik untuk mengganti</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700">
                          Pilih foto struk transfer atau seret file ke sini
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Mendukung JPG, PNG, WebP (maks. 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {receiptImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptImage(null);
                      setReceiptFileName('');
                    }}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold"
                  >
                    Hapus / Pilih foto lain
                  </button>
                )}
              </div>

              {/* Optional Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Pengirim (Opsional):
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Contoh: Budi Gunawan (BCA)"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Catatan Transaksi (Opsional):
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: DP Servis AC Ruang Tamu"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-submit-payment-proof"
                disabled={isSubmitting || !receiptImage}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengunggah & Menyimpan Bukti Transfer...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Kirim Bukti Pembayaran
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
