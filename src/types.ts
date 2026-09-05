export type UserRole = 'provider' | 'customer' | 'admin';

export interface BankAccountDetails {
  bankName: string; // BCA, Mandiri, BNI, BRI, BSI, GoPay, OVO, DANA, ShopeePay
  accountNumber: string;
  accountHolder: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  isAdmin?: boolean;
  phoneWhatsApp?: string;
  address?: string;
  category?: string;
  bio?: string;
  paymentLink?: string; // e.g. PayPal.me/user or QRIS URL
  bankAccount?: BankAccountDetails;
  createdAt?: string;
}

export interface ServiceItem {
  id: string;
  providerId: string;
  providerName: string;
  providerEmail: string;
  providerAvatar?: string;
  title: string;
  category: string;
  description: string;
  photos: string[];
  location: string;
  whatsapp: string;
  priceEstimate: string;
  dpAmount: number;
  paymentLink?: string;
  rating: number;
  reviewCount: number;
  isApproved?: boolean;
  status?: 'ACTIVE' | 'BLOCKED';
  blockReason?: string;
  blockedAt?: string;
  blockedBy?: string;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  serviceId: string;
  providerId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceTitle: string;
  providerId: string;
  providerName: string;
  providerPhone: string;
  paymentLink?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  bookingDate: string;
  notes?: string;
  dpAmount: number;
  status: 'pending' | 'dp_paid' | 'in_progress' | 'completed' | 'cancelled';
  dpPaid: boolean;
  paymentMethod?: string;
  createdAt: string;
}

export type SalaryType = 'harian' | 'bulanan' | 'proyek';

export interface JobVacancy {
  id: string;
  posterId: string;
  posterName: string;
  posterAvatar?: string;
  title: string;
  category: string;
  salary: string;
  salaryType: SalaryType;
  location: string;
  description: string;
  whatsapp: string;
  status: 'open' | 'closed' | 'BLOCKED';
  isApproved?: boolean;
  blockReason?: string;
  blockedAt?: string;
  blockedBy?: string;
  createdAt: string;
}

export interface JastipItem {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  title: string;
  routeFrom: string;
  routeTo: string;
  travelDate: string;
  feeEstimate: string;
  description: string;
  photos: string[];
  whatsapp: string;
  status: 'open' | 'closed' | 'BLOCKED';
  isApproved?: boolean;
  blockReason?: string;
  blockedAt?: string;
  blockedBy?: string;
  createdAt: string;
}

export type PaymentStatus = 
  | 'PENDING'                    // User uploaded DP transfer receipt
  | 'DANA_DITAMPUNG'             // Admin approved QRIS transfer (Escrow held by JasaHub)
  | 'DP_DITERUSKAN_KE_PENYEDIA'  // Admin disbursed net payout to provider's bank/e-wallet
  | 'REJECTED';                  // Admin rejected invalid proof

export interface PaymentTransaction {
  id: string;
  orderId?: string;
  serviceId?: string;
  serviceTitle: string;
  providerId: string;
  providerName: string;
  providerPhone?: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;

  // Amounts & Commission calculation (default: 5%)
  grossAmount: number;           // Total DP masuk ke QRIS (misal: Rp 100.000)
  platformFeePercentage: number; // default: 5
  platformFee: number;           // 5% * grossAmount (misal: Rp 5.000)
  netPayout: number;             // grossAmount - platformFee (misal: Rp 95.000)

  // QRIS Payment Proof by Customer
  paymentProofUrl: string;       // Receipt photo
  senderName?: string;           // Optional sender name / account
  notes?: string;                // Optional transaction notes
  merchantName: string;          // "RAJA DIMSUM QR FOOD"
  
  // Status lifecycle
  status: PaymentStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectReason?: string;

  // Disbursement / Payout to Provider by Admin
  payoutProofUrl?: string;       // Admin payout transfer receipt
  payoutAt?: string;
  payoutBy?: string;
  payoutNotes?: string;
  providerBankAccount?: BankAccountDetails;

  createdAt: string;
}
