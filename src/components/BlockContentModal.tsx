import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Loader2 
} from 'lucide-react';

interface BlockContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemTypeLabel: string;
  itemTitle: string;
  itemOwnerLabel: string;
  itemOwnerName: string;
  itemContact?: string;
  predefinedReasons: string[];
  onConfirm: (reason: string) => Promise<void>;
}

export const BlockContentModal: React.FC<BlockContentModalProps> = ({
  isOpen,
  onClose,
  title,
  itemTypeLabel,
  itemTitle,
  itemOwnerLabel,
  itemOwnerName,
  itemContact,
  predefinedReasons,
  onConfirm
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(predefinedReasons[0] || 'Konten Tidak Layak');
  const [customReason, setCustomReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);

    const finalReason = selectedReason.startsWith('Lainnya')
      ? customReason.trim() || 'Melanggar aturan kebijakan platform JasaHub'
      : selectedReason;

    try {
      await onConfirm(finalReason);
      onClose();
    } catch (err: any) {
      console.error('Error blocking item:', err);
      setError(err?.message || 'Gagal memproses penonaktifan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-100 p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Danger Warning */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                Aksi Khusus Admin
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {title}
            </h3>
            <p className="text-xs text-slate-500">
              {itemTypeLabel} ini akan dinonaktifkan dan disembunyikan dari publik.
            </p>
          </div>
        </div>

        {/* Target Item Preview */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 mb-4">
          <p className="text-xs font-semibold text-slate-500">Target {itemTypeLabel}:</p>
          <p className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">{itemTitle}</p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
            <span>{itemOwnerLabel}: <strong className="text-slate-800">{itemOwnerName}</strong></span>
            {itemContact && (
              <>
                <span>•</span>
                <span className="font-mono text-[11px]">{itemContact}</span>
              </>
            )}
          </div>
        </div>

        {/* Reason Selector */}
        <div className="space-y-3 mb-5">
          <label className="block text-xs font-bold text-slate-800">
            Pilih Alasan Pemblokiran / Penonaktifan:
          </label>

          <div className="space-y-2">
            {predefinedReasons.map((reason) => (
              <label 
                key={reason}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                  selectedReason === reason 
                    ? 'border-red-500 bg-red-50/60 text-red-900 ring-1 ring-red-400' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="blockReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 border-slate-300"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason.startsWith('Lainnya') && (
            <div className="mt-2 animate-in fade-in">
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Tuliskan alasan spesifik pemblokiran..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-slate-800"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                Konfirmasi Blokir / Sembunyikan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
