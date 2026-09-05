import React, { useState, useEffect } from 'react';
import { ServiceItem, ReviewItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { listenToReviews, addReview, createOrder } from '../lib/dbService';
import { PaymentDPModal } from './PaymentDPModal';
import { 
  X, 
  Star, 
  MapPin, 
  Phone, 
  Calendar, 
  Send, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle, 
  CreditCard,
  CheckCircle2,
  Clock,
  User as UserIcon,
  Edit3
} from 'lucide-react';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess?: () => void;
  onEditService?: (service: ServiceItem) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  isOpen,
  onClose,
  onOrderSuccess,
  onEditService
}) => {
  const { user, profile, loginDemoUser } = useAuth();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  
  // Review submission state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Booking Order form state
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [customerPhone, setCustomerPhone] = useState(profile?.phoneWhatsApp || '');
  const [customerAddress, setCustomerAddress] = useState(profile?.address || '');
  const [orderNotes, setOrderNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState(false);

  // Payment DP modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!service) return;
    setActivePhotoIdx(0);
    const unsubscribe = listenToReviews(service.id, (loadedReviews) => {
      setReviews(loadedReviews);
    });
    return () => unsubscribe();
  }, [service]);

  useEffect(() => {
    if (profile) {
      if (profile.phoneWhatsApp && !customerPhone) setCustomerPhone(profile.phoneWhatsApp);
      if (profile.address && !customerAddress) setCustomerAddress(profile.address);
    }
  }, [profile]);

  if (!isOpen || !service) return null;

  const photos = service.photos && service.photos.length > 0
    ? service.photos
    : ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=80'];

  const handleNextPhoto = () => {
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const formattedWhatsApp = service.whatsapp.replace(/\D/g, '');
  const waUrl = `https://wa.me/${formattedWhatsApp}?text=${encodeURIComponent(
    `Halo ${service.providerName}, saya tertarik dengan layanan "${service.title}" di JasaHub. Bisakah saya tanya informasi lebih lanjut?`
  )}`;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;

    setSubmittingReview(true);
    try {
      const currentUserName = profile?.displayName || user?.displayName || 'Penyewa Jasa';
      const currentUserAvatar = profile?.photoURL || user?.photoURL || '';
      const currentUserId = profile?.uid || user?.uid || 'guest-user-' + Date.now();

      await addReview({
        serviceId: service.id,
        providerId: service.providerId,
        userId: currentUserId,
        userName: currentUserName,
        userAvatar: currentUserAvatar,
        rating: userRating,
        comment: userComment.trim()
      });

      setUserComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) return;

    setSubmittingOrder(true);
    try {
      const currentUserId = profile?.uid || user?.uid || 'guest-customer-' + Date.now();
      const currentUserName = profile?.displayName || user?.displayName || 'Penyewa Jasa';

      const newOrderId = await createOrder({
        serviceId: service.id,
        serviceTitle: service.title,
        providerId: service.providerId,
        providerName: service.providerName,
        providerPhone: service.whatsapp,
        paymentLink: service.paymentLink,
        customerId: currentUserId,
        customerName: currentUserName,
        customerPhone: customerPhone || '08123456789',
        customerAddress: customerAddress || service.location,
        bookingDate,
        notes: orderNotes,
        dpAmount: service.dpAmount || 50000,
        status: 'pending',
        dpPaid: false
      });

      setCreatedOrderId(newOrderId);
      setOrderSuccessMsg(true);
      setShowOrderForm(false);
      if (onOrderSuccess) onOrderSuccess();
    } catch (err) {
      console.error('Failed to submit order:', err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const currentUserId = profile?.uid || user?.uid;
  const isOwner = Boolean(
    currentUserId && (
      currentUserId === service.providerId ||
      profile?.email === service.providerEmail ||
      (profile?.role === 'provider' && profile?.displayName === service.providerName)
    )
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
        <div 
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md">
                {service.category}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <div className="flex items-center text-amber-500 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-current mr-1" />
                <span>{service.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal ml-1">({service.reviewCount} ulasan)</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isOwner && onEditService && (
                <button
                  type="button"
                  onClick={() => onEditService(service)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 text-xs font-bold transition shadow-sm"
                  id="btn-edit-service-from-detail"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Layanan
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
                id="btn-close-service-detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Title & Provider Banner */}
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {service.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <img
                    src={service.providerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={service.providerName}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-900">{service.providerName}</p>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {service.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner && onEditService && (
                    <button
                      type="button"
                      onClick={() => onEditService(service)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition"
                    >
                      <Edit3 className="w-4 h-4" />
                      Perbarui Foto & Data
                    </button>
                  )}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat WhatsApp ({service.whatsapp})
                  </a>
                </div>
              </div>
            </div>

            {/* Photos Gallery of Work Results */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  Foto Hasil Pekerjaan ({photos.length} foto)
                </h3>
                <span className="text-xs text-slate-400">Klik untuk melihat</span>
              </div>

              {/* Main Photo View */}
              <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 group">
                <img
                  src={photos[activePhotoIdx]}
                  alt={`Hasil kerja ${activePhotoIdx + 1}`}
                  className="w-full h-full object-cover transition duration-300"
                  referrerPolicy="no-referrer"
                />

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-sm transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-sm transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-[11px] font-medium">
                      {activePhotoIdx + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {photos.length > 1 && (
                <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1">
                  {photos.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition ${
                        activePhotoIdx === idx ? 'border-emerald-600 scale-95 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={p} 
                        alt={`thumb ${idx}`} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description & Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Description (2 cols) */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Deskripsi Pekerjaan & Keahlian</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                    {service.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Alamat Lokasi Pengerjaan / Bengkel
                  </h3>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">{service.location}</p>
                    <p className="text-slate-500 mt-1">Siap datang ke lokasi atau pengerjaan di tempat sesuai kesepakatan.</p>
                  </div>
                </div>
              </div>

              {/* Pricing & Booking Card (1 col) */}
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 p-5 rounded-2xl border border-emerald-100 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Perkiraan Biaya</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{service.priceEstimate}</div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-medium">Uang Muka (DP):</span>
                    <span className="font-bold text-emerald-700">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(service.dpAmount || 50000)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    id="btn-open-order-form"
                    onClick={() => setShowOrderForm(!showOrderForm)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-[0.99]"
                  >
                    <Calendar className="w-4 h-4" />
                    {showOrderForm ? 'Tutup Form Pesanan' : 'Kirim Pesanan Jasa'}
                  </button>

                  <button
                    type="button"
                    id="btn-pay-dp-direct"
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition active:scale-[0.99]"
                  >
                    <CreditCard className="w-4 h-4" />
                    Bayar DP (PayPal / QRIS)
                  </button>
                </div>
              </div>
            </div>

            {/* Order Confirmation Form */}
            {showOrderForm && (
              <form onSubmit={handleOrderSubmit} className="p-5 bg-emerald-50/80 rounded-2xl border border-emerald-200 animate-in fade-in slide-in-from-top-2 duration-200">
                <h3 className="text-sm font-bold text-emerald-950 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Formulir Pemesanan Layanan
                </h3>
                <p className="text-xs text-emerald-800 mb-4">
                  Kirim rincian pengerjaan ke penyedia jasa {service.providerName}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pilih Tanggal Pengerjaan *
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor WhatsApp Anda *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 08123456789"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Lengkap Lokasi Anda *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan/kecamatan"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Keluhan / Kebutuhan Tambahan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: AC kamar bocor air, unit 1 PK di lantai 2"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowOrderForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/60"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOrder}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingOrder ? 'Mengirim...' : 'Kirim Pesanan Sekarang'}
                  </button>
                </div>
              </form>
            )}

            {orderSuccessMsg && (
              <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Pesanan berhasil dikirim! Silakan bayar DP untuk mengunci jadwal teknisi.</span>
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                >
                  Bayar DP Sekarang
                </button>
              </div>
            )}

            {/* Reviews and Ratings Section */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ulasan & Penilaian Pelanggan</h3>
                  <p className="text-xs text-slate-500">Ulasan asli dari penyewa jasa terverifikasi</p>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-slate-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{service.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                </div>
              </div>

              {/* Form to submit review */}
              <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-800 mb-2">Beri Rating & Tulis Ulasan Anda:</p>
                
                {/* Star rating selector */}
                <div className="flex items-center gap-1.5 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 hover:scale-110 transition focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= userRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-slate-600 ml-2">
                    {userRating} dari 5 Bintang
                  </span>
                </div>

                <div className="mb-3">
                  <textarea
                    rows={2}
                    required
                    placeholder="Ceritakan pengalaman Anda, hasil pengerjaan, ketepatan waktu, dan keramahan..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Posting sebagai: {profile?.displayName || 'Penyewa Jasa'}
                  </span>
                  <button
                    type="submit"
                    disabled={submittingReview || !userComment.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                  </button>
                </div>

                {reviewSuccess && (
                  <p className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ulasan Anda telah ditambahkan!
                  </p>
                )}
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Belum ada ulasan untuk layanan ini. Jadilah yang pertama memberikan ulasan!
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                            alt={rev.userName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 pl-9">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* DP Payment Modal */}
      <PaymentDPModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        serviceTitle={service.title}
        providerName={service.providerName}
        providerId={service.providerId}
        serviceId={service.id}
        dpAmount={service.dpAmount || 50000}
        paymentLink={service.paymentLink}
        orderId={createdOrderId}
        onConfirmPaid={(method) => {
          console.log('Payment DP confirmed via', method);
        }}
      />
    </>
  );
};
