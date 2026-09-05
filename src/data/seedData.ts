import { ServiceItem, JobVacancy, JastipItem } from '../types';

export const INITIAL_SERVICES: Omit<ServiceItem, 'id'>[] = [
  {
    providerId: 'demo-provider-1',
    providerName: 'Budi Santoso (Karya Mandiri Service)',
    providerEmail: 'budi.ac@example.com',
    providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Spesialis Servis AC & Pasang AC Rumah/Kantor Bergaransi',
    category: 'Elektronik & AC',
    description: 'Melayani cuci AC, perbaikan AC bocor/kurang dingin, isi freon R32/R410, bongkar pasang AC semua merk (Daikin, Panasonic, Sharp, LG). Teknisi berpengalaman 8+ tahun dengan peralatan vakum modern dan garansi pengerjaan 30 hari.',
    photos: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    location: 'Jl. Surya Sumantri No. 42, Sukajadi, Bandung',
    whatsapp: '6281223344551',
    priceEstimate: 'Rp 65.000 - Rp 250.000',
    dpAmount: 50000,
    paymentLink: 'https://paypal.me/demo',
    rating: 4.9,
    reviewCount: 28,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    providerId: 'demo-provider-2',
    providerName: 'Pak Joko Tukang Bangunan & Renovasi',
    providerEmail: 'joko.renov@example.com',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Jasa Tukang Bangunan, Cat Dinding, Pasang Keramik & Atap Bocor',
    category: 'Bangunan & Renovasi',
    description: 'Menerima borongan atau harian untuk perbaikan atap bocor, plester acian, pengecatan interior/eksterior, pasang keramik & granit, sekat partisi gypsum, dan instalasi pipa air. Kerja rapi, cepat, dan jujur.',
    photos: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
    ],
    location: 'Jl. Margonda Raya No. 120, Beji, Depok',
    whatsapp: '6281388997722',
    priceEstimate: 'Rp 150.000 / hari (Tukang)',
    dpAmount: 100000,
    paymentLink: 'https://paypal.me/demo',
    rating: 4.8,
    reviewCount: 19,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
  },
  {
    providerId: 'demo-provider-3',
    providerName: 'Kinclong Clean Services',
    providerEmail: 'kinclong.clean@example.com',
    providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Jasa Deep Cleaning Rumah, Kost, Apartemen & Cuci Sofa Kasur',
    category: 'Kebersihan / Cleaning',
    description: 'Layanan kebersihan total meliputi sedot debu/tungau sofa, springbed, pembersihan kamar mandi berkerak, poles lantai, kitchen set, serta sterilisasi disinfektan. Tim profesional berseragam dengan chemical aman keluarga.',
    photos: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80'
    ],
    location: 'Kebayoran Baru, Jakarta Selatan',
    whatsapp: '6287711223344',
    priceEstimate: 'Rp 180.000 - Rp 450.000',
    dpAmount: 75000,
    paymentLink: 'https://paypal.me/demo',
    rating: 5.0,
    reviewCount: 34,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    providerId: 'demo-provider-4',
    providerName: 'Rian Pratama Visual',
    providerEmail: 'rian.photo@example.com',
    providerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    title: 'Fotografer & Videografer Dokumentasi Event, Wisuda & Produk',
    category: 'Fotografi & Desain',
    description: 'Menyediakan dokumentasi foto & video sinematik untuk wisuda, lamaran, prewedding, event kantor, maupun foto produk katalog UMKM. Termasuk editing tone warna profesional, file Google Drive resolusi tinggi, dan revisi warna.',
    photos: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&auto=format&fit=crop&q=80'
    ],
    location: 'Jl. Kaliurang KM 6, Sleman, Yogyakarta',
    whatsapp: '6285643217890',
    priceEstimate: 'Rp 350.000 - Rp 1.200.000',
    dpAmount: 150000,
    paymentLink: 'https://paypal.me/demo',
    rating: 4.9,
    reviewCount: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  }
];

export const INITIAL_JOBS: Omit<JobVacancy, 'id'>[] = [
  {
    posterId: 'demo-user-101',
    posterName: 'Toko Berkah Fotokopi',
    posterAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    title: 'Dibutuhkan Penjaga Kios Fotokopi & Alat Tulis',
    category: 'Pelayanan / Toko',
    salary: 'Rp 90.000',
    salaryType: 'harian',
    location: 'Dekat Kampus UNPAD Dipatiukur, Bandung',
    description: 'Dicari tenaga kerja jujur, teliti, dan disiplin untuk menjaga kios fotokopi. Tugas utama: melayani fotokopi, print dokumen, laminating, jilid skripsi, dan kasir alat tulis. Jam kerja 08.00 - 17.00 WIB. Disediakan makan siang.',
    whatsapp: '6281234567890',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    posterId: 'demo-user-102',
    posterName: 'Kedai Kopi Sudut Senja',
    posterAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    title: 'Lowongan Barista & Kasir Coffee Shop',
    category: 'F&B / Restoran',
    salary: 'Rp 2.800.000 - Rp 3.200.000',
    salaryType: 'bulanan',
    location: 'Tebet Timur Dalam, Jakarta Selatan',
    description: 'Kami membuka kesempatan bagi kamu yang ramah dan bersemangat untuk bergabung sebagai Barista (pengalaman minimal 6 bulan manual brew/espresso machine). Bonus omset dan jenjang karir supervisor.',
    whatsapp: '6289876543210',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  },
  {
    posterId: 'demo-user-103',
    posterName: 'Bengkel Motor Berkah Jaya',
    posterAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    title: 'Mekanik / Montir Motor Matic & Bebek',
    category: 'Otomotif / Montir',
    salary: 'Rp 120.000',
    salaryType: 'harian',
    location: 'Jl. Raya Bogor Km 28, Pasar Rebo',
    description: 'Dibutuhkan segera mekanik motor yang paham servis rutin, ganti oli, bersihkan CVT, kelistrikan standar, dan tambal ban tubeless. Jujur dan komunikatif.',
    whatsapp: '6282112233445',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  }
];

export const INITIAL_JASTIPS: Omit<JastipItem, 'id'>[] = [
  {
    creatorId: 'demo-user-201',
    creatorName: 'Amanda Putri (Jastip Bandung Express)',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Jastip Oleh-oleh Khas Bandung (Kartika Sari, Prima Rasa & Bolu Susu Lembang)',
    routeFrom: 'Bandung',
    routeTo: 'Jabodetabek (Same-day / Next-day delivery)',
    travelDate: 'Setiap Sabtu & Minggu',
    feeEstimate: 'Mulai Rp 10.000 / kotak',
    description: 'Bisa titip molen pisang keju Kartika Sari, brownies Prima Rasa, pia bakar, baso aci acang, batagor riri, dan kopi aroma. Belanja langsung di outlet resmi terjamin baru dan fresh! Dikirim pakai travel/paxel/grab.',
    photos: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
    ],
    whatsapp: '6281299887766',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    creatorId: 'demo-user-202',
    creatorName: 'Rizky Home Living',
    creatorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    title: 'Jastip IKEA Alam Sutera & KKV Bintaro Xchange',
    routeFrom: 'Tangerang / BSD',
    routeTo: 'Seluruh Indonesia (Packing Bubble wrap tebal + kardus)',
    travelDate: 'Jadwal Belanja: Tiap Hari Selasa & Jumat',
    feeEstimate: 'Rp 15.000 - Rp 35.000 / item',
    description: 'Titip perabot mini IKEA (lampu meja, organizer laci, wajan, boneka shark, bantal kursi, printilan estetik) atau makeup/stationery KKV. Free packing kardus + bubble tebal.',
    photos: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80'
    ],
    whatsapp: '6287811992288',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  }
];
