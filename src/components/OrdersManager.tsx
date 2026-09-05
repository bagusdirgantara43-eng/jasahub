import React, { useState, useEffect } from 'react';
import { OrderItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { listenToOrders, updateOrderPayment } from '../lib/dbService';
import { PaymentDPModal } from './PaymentDPModal';
import { 
  ClipboardList, 
  Calendar, 
  MapPin, 
  Phone, 
  MessageCircle, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';

export const OrdersManager: React.FC = () => {
  const { profile, user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'dp_paid' | 'completed'>('all');

  // Active modal for payment
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<OrderItem | null>(null);

  const isProvider = profile?.role === 'provider';
  const currentUid = profile?.uid || user?.uid || 'demo-customer-99';

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToOrders(currentUid, isProvider ? 'provider' : 'customer', (loadedOrders) => {
      // If no orders yet, let's provide a sample order if the user wants to test the Bayar DP flow immediately!
      if (loadedOrders.length === 0) {
        setOrders([
          {
            id: 'sample-order-01',
            serviceId: 'seed-service-1',
            serviceTitle: 'Spesialis Servis AC & Pasang AC Rumah/Kantor Bergaransi',
            providerId: 'demo-provider-1',
            providerName: 'Budi Santoso (Karya Mandiri Service)',
            providerPhone: '6281223344551',
            paymentLink: 'https://paypal.me/demo',
            customerId: currentUid,
            customerName: profile?.displayName || 'Ahmad Fauzi',
            customerPhone: profile?.phoneWhatsApp || '08123456789',
            customerAddress: profile?.address || 'Jl. Dago Asri No. 15, Bandung',
            bookingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
            notes: 'AC 1 PK di kamar tidur menetes air dan kurang dingin.',
            dpAmount: 50000,
            status: 'pending',
            dpPaid: false,
            createdAt: new Date().toISOString()
          }
        ]);
      } else {
        setOrders(loadedOrders);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUid, isProvider]);

  const handleConfirmPaid = async (orderId: string, paymentMethod: string) => {
    try {
      await updateOrderPayment(orderId, true, paymentMethod, 'dp_paid');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, dpPaid: true, status: 'dp_paid', paymentMethod } : o))
      );
    } catch (e) {
      console.warn('Update order local fallback:', e);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, dpPaid: true, status: 'dp_paid', paymentMethod } : o))
      );
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <ClipboardList className="w-3.5 h-3.5" />
            Manajemen Pesanan & Uang Muka (DP)
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {isProvider ? 'Pesanan Jasa Masuk' : 'Daftar Pesanan Jasa Saya'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/70 mt-1">
            {isProvider
              ? 'Pantau jadwal pengerjaan dan konfirmasi pembayaran uang muka dari pelanggan.'
              : 'Pantau jadwal teknisi, bayar DP untuk mengunci jadwal pengerjaan, dan hubungi penyedia.'}
          </p>
        </div>

        {/* Status Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'pending' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            Menunggu DP
          </button>
          <button
            onClick={() => setFilterStatus('dp_paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'dp_paid' ? 'bg-emerald-400 text-slate-950 shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            DP Terbayar
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Belum ada pesanan dalam status ini</h3>
          <p className="text-xs text-slate-500 mt-1">
            {isProvider ? 'Pesanan dari penyewa jasa akan tampil di sini.' : 'Cari jasa yang Anda perlukan dan lakukan pemesanan.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const formattedPhone = (isProvider ? order.customerPhone : order.providerPhone).replace(/\D/g, '');
            const chatContactName = isProvider ? order.customerName : order.providerName;
            const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
              `Halo ${chatContactName}, terkait pesanan jasa "${order.serviceTitle}" di JasaHub.`
            )}`;

            const formattedDp = new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0
            }).format(order.dpAmount || 50000);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2.5 max-w-2xl">
                  {/* Status Badge & Order ID */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        order.dpPaid || order.status === 'dp_paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {order.dpPaid || order.status === 'dp_paid' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          DP Terbayar ({order.paymentMethod || 'ONLINE'})
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Menunggu Pembayaran DP
                        </>
                      )}
                    </span>
                    <span className="text-xs text-slate-400">Order #{order.id.slice(-6)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {order.serviceTitle}
                  </h3>

                  {/* Meta Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isProvider ? `Pelanggan: ${order.customerName}` : `Penyedia: ${order.providerName}`}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tanggal Pengerjaan: <strong>{order.bookingDate}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{order.customerAddress}</span>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Catatan:</span> {order.notes}
                    </div>
                  )}
                </div>

                {/* Right side: DP amount & Action buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 font-semibold block">Nominal DP</span>
                    <span className="text-lg font-extrabold text-emerald-600">{formattedDp}</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Bayar DP Button */}
                    {!order.dpPaid && order.status !== 'dp_paid' && (
                      <button
                        onClick={() => setSelectedOrderForPayment(order)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                      >
                        <CreditCard className="w-4 h-4" />
                        Bayar DP
                      </button>
                    )}

                    {/* WhatsApp Chat */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment DP Modal for orders */}
      {selectedOrderForPayment && (
        <PaymentDPModal
          isOpen={!!selectedOrderForPayment}
          onClose={() => setSelectedOrderForPayment(null)}
          serviceTitle={selectedOrderForPayment.serviceTitle}
          providerName={selectedOrderForPayment.providerName}
          dpAmount={selectedOrderForPayment.dpAmount}
          paymentLink={selectedOrderForPayment.paymentLink}
          orderId={selectedOrderForPayment.id}
          onConfirmPaid={(method) => {
            handleConfirmPaid(selectedOrderForPayment.id, method);
          }}
        />
      )}
    </div>
  );
};
