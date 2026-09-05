import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where
} from './firebase';
import { 
  ServiceItem, 
  ReviewItem, 
  OrderItem, 
  JobVacancy, 
  JastipItem, 
  UserProfile,
  PaymentTransaction,
  PaymentStatus,
  BankAccountDetails
} from '../types';
import { INITIAL_SERVICES, INITIAL_JOBS, INITIAL_JASTIPS } from '../data/seedData';

// User Profile Operations
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
  } catch (error) {
    console.warn('Could not fetch user profile from Firestore:', error);
  }
  return null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}

// Services Operations
export function listenToServices(callback: (services: ServiceItem[]) => void) {
  try {
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Return initial sample services mapped with IDs
        const seeded = INITIAL_SERVICES.map((s, idx) => ({
          ...s,
          id: `seed-service-${idx + 1}`
        }));
        callback(seeded);
      } else {
        const items: ServiceItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as ServiceItem);
        });
        callback(items);
      }
    }, (error) => {
      console.warn('Services snapshot listener error, falling back to seed data:', error);
      const seeded = INITIAL_SERVICES.map((s, idx) => ({
        ...s,
        id: `seed-service-${idx + 1}`
      }));
      callback(seeded);
    });
  } catch (err) {
    console.warn('Failed to listen to services:', err);
    callback(INITIAL_SERVICES.map((s, idx) => ({ ...s, id: `seed-service-${idx + 1}` })));
    return () => {};
  }
}

export async function addService(service: Omit<ServiceItem, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'services'), {
    ...service,
    rating: 5.0,
    reviewCount: 0,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateService(id: string, data: Partial<ServiceItem>): Promise<void> {
  const serviceRef = doc(db, 'services', id);
  try {
    const snap = await getDoc(serviceRef);
    if (snap.exists()) {
      await updateDoc(serviceRef, data);
    } else {
      await setDoc(serviceRef, { ...data, id }, { merge: true });
    }
  } catch (err) {
    // Attempt direct updateDoc if getDoc failed
    await updateDoc(serviceRef, data);
  }
}

export async function deleteService(id: string): Promise<void> {
  await deleteDoc(doc(db, 'services', id));
}

// Admin: Block / Hide service listing
export async function blockService(
  id: string, 
  reason: string, 
  adminIdentifier?: string
): Promise<void> {
  const serviceRef = doc(db, 'services', id);
  const blockData = {
    isApproved: false,
    status: 'BLOCKED' as const,
    blockReason: reason,
    blockedAt: new Date().toISOString(),
    blockedBy: adminIdentifier || 'Admin'
  };

  try {
    const snap = await getDoc(serviceRef);
    if (snap.exists()) {
      await updateDoc(serviceRef, blockData);
    } else {
      // If was from seed data, create it with blocked status
      await setDoc(serviceRef, blockData, { merge: true });
    }
  } catch (err) {
    await setDoc(serviceRef, blockData, { merge: true });
  }
}

// Admin: Restore / Unblock service listing
export async function unblockService(id: string): Promise<void> {
  const serviceRef = doc(db, 'services', id);
  const unblockData = {
    isApproved: true,
    status: 'ACTIVE' as const,
    blockReason: null,
    blockedAt: null,
    blockedBy: null
  };

  try {
    await updateDoc(serviceRef, unblockData);
  } catch (err) {
    await setDoc(serviceRef, unblockData, { merge: true });
  }
}

export async function syncProviderServices(
  providerId: string,
  data: { whatsapp?: string; location?: string; providerName?: string; paymentLink?: string }
): Promise<number> {
  try {
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, where('providerId', '==', providerId));
    const snapshot = await getDocs(q);
    let count = 0;
    const updatePromises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      count++;
      updatePromises.push(updateDoc(docSnap.ref, data));
    });
    await Promise.all(updatePromises);
    return count;
  } catch (err) {
    console.warn('syncProviderServices warning:', err);
    return 0;
  }
}

// Reviews Operations
export function listenToReviews(serviceId: string, callback: (reviews: ReviewItem[]) => void) {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('serviceId', '==', serviceId), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const reviews: ReviewItem[] = [];
      snapshot.forEach((docSnap) => {
        reviews.push({ id: docSnap.id, ...docSnap.data() } as ReviewItem);
      });
      callback(reviews);
    }, (error) => {
      console.warn('Reviews listener warning:', error);
      callback([]);
    });
  } catch (err) {
    console.warn('Reviews listener failed:', err);
    callback([]);
    return () => {};
  }
}

export async function addReview(review: Omit<ReviewItem, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(collection(db, 'reviews'), {
    ...review,
    createdAt: new Date().toISOString()
  });

  // Recalculate average rating for the service if it's a real Firestore service document
  try {
    const serviceRef = doc(db, 'services', review.serviceId);
    const serviceSnap = await getDoc(serviceRef);
    if (serviceSnap.exists()) {
      const data = serviceSnap.data() as ServiceItem;
      const currentCount = data.reviewCount || 0;
      const currentRating = data.rating || 5;
      const newCount = currentCount + 1;
      const newRating = Number(((currentRating * currentCount + review.rating) / newCount).toFixed(1));
      await updateDoc(serviceRef, {
        rating: newRating,
        reviewCount: newCount
      });
    }
  } catch (e) {
    console.warn('Could not update service rating aggregate:', e);
  }
}

// Orders Operations
export function listenToOrders(userId: string, role: 'provider' | 'customer', callback: (orders: OrderItem[]) => void) {
  try {
    const ordersRef = collection(db, 'orders');
    const fieldToQuery = role === 'provider' ? 'providerId' : 'customerId';
    const q = query(ordersRef, where(fieldToQuery, '==', userId), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const orders: OrderItem[] = [];
      snapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...docSnap.data() } as OrderItem);
      });
      callback(orders);
    }, (error) => {
      console.warn('Orders listener warning:', error);
      callback([]);
    });
  } catch (err) {
    console.warn('Orders query failed:', err);
    callback([]);
    return () => {};
  }
}

export async function createOrder(order: Omit<OrderItem, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...order,
    status: 'pending',
    dpPaid: false,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateOrderPayment(
  orderId: string, 
  dpPaid: boolean, 
  paymentMethod: string,
  newStatus?: OrderItem['status']
): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    dpPaid,
    paymentMethod,
    status: newStatus || (dpPaid ? 'dp_paid' : 'pending')
  });
}

// Jobs Operations
export function listenToJobs(callback: (jobs: JobVacancy[]) => void) {
  try {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        const seeded = INITIAL_JOBS.map((j, idx) => ({
          ...j,
          id: `seed-job-${idx + 1}`
        }));
        callback(seeded);
      } else {
        const items: JobVacancy[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as JobVacancy);
        });
        callback(items);
      }
    }, (error) => {
      console.warn('Jobs listener error, using seed data:', error);
      callback(INITIAL_JOBS.map((j, idx) => ({ ...j, id: `seed-job-${idx + 1}` })));
    });
  } catch (err) {
    console.warn('Jobs subscription failed:', err);
    callback(INITIAL_JOBS.map((j, idx) => ({ ...j, id: `seed-job-${idx + 1}` })));
    return () => {};
  }
}

export async function addJob(job: Omit<JobVacancy, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'jobs'), {
    ...job,
    status: 'open',
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function toggleJobStatus(jobId: string, currentStatus: 'open' | 'closed' | 'BLOCKED'): Promise<void> {
  const jobRef = doc(db, 'jobs', jobId);
  await updateDoc(jobRef, {
    status: currentStatus === 'open' ? 'closed' : 'open'
  });
}

// Admin: Block / Hide Job Vacancy
export async function blockJob(
  id: string,
  reason: string,
  adminIdentifier?: string
): Promise<void> {
  const jobRef = doc(db, 'jobs', id);
  const blockData = {
    isApproved: false,
    status: 'BLOCKED' as const,
    blockReason: reason,
    blockedAt: new Date().toISOString(),
    blockedBy: adminIdentifier || 'Admin'
  };

  try {
    const snap = await getDoc(jobRef);
    if (snap.exists()) {
      await updateDoc(jobRef, blockData);
    } else {
      await setDoc(jobRef, blockData, { merge: true });
    }
  } catch (err) {
    await setDoc(jobRef, blockData, { merge: true });
  }
}

// Admin: Restore / Unblock Job Vacancy
export async function unblockJob(id: string): Promise<void> {
  const jobRef = doc(db, 'jobs', id);
  const unblockData = {
    isApproved: true,
    status: 'open' as const,
    blockReason: null,
    blockedAt: null,
    blockedBy: null
  };

  try {
    await updateDoc(jobRef, unblockData);
  } catch (err) {
    await setDoc(jobRef, unblockData, { merge: true });
  }
}

// Admin / Poster: Delete Job Vacancy permanently
export async function deleteJob(id: string): Promise<void> {
  await deleteDoc(doc(db, 'jobs', id));
}

// Jastip Operations
export function listenToJastips(callback: (jastips: JastipItem[]) => void) {
  try {
    const jastipsRef = collection(db, 'jastips');
    const q = query(jastipsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        const seeded = INITIAL_JASTIPS.map((jt, idx) => ({
          ...jt,
          id: `seed-jastip-${idx + 1}`
        }));
        callback(seeded);
      } else {
        const items: JastipItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as JastipItem);
        });
        callback(items);
      }
    }, (error) => {
      console.warn('Jastip listener error, using seed data:', error);
      callback(INITIAL_JASTIPS.map((jt, idx) => ({ ...jt, id: `seed-jastip-${idx + 1}` })));
    });
  } catch (err) {
    console.warn('Jastip subscription failed:', err);
    callback(INITIAL_JASTIPS.map((jt, idx) => ({ ...jt, id: `seed-jastip-${idx + 1}` })));
    return () => {};
  }
}

export async function addJastip(jastip: Omit<JastipItem, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'jastips'), {
    ...jastip,
    status: 'open',
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function toggleJastipStatus(jastipId: string, currentStatus: 'open' | 'closed' | 'BLOCKED'): Promise<void> {
  const jastipRef = doc(db, 'jastips', jastipId);
  await updateDoc(jastipRef, {
    status: currentStatus === 'open' ? 'closed' : 'open'
  });
}

// Admin: Block / Hide Jastip Item
export async function blockJastip(
  id: string,
  reason: string,
  adminIdentifier?: string
): Promise<void> {
  const jastipRef = doc(db, 'jastips', id);
  const blockData = {
    isApproved: false,
    status: 'BLOCKED' as const,
    blockReason: reason,
    blockedAt: new Date().toISOString(),
    blockedBy: adminIdentifier || 'Admin'
  };

  try {
    const snap = await getDoc(jastipRef);
    if (snap.exists()) {
      await updateDoc(jastipRef, blockData);
    } else {
      await setDoc(jastipRef, blockData, { merge: true });
    }
  } catch (err) {
    await setDoc(jastipRef, blockData, { merge: true });
  }
}

// Admin: Restore / Unblock Jastip Item
export async function unblockJastip(id: string): Promise<void> {
  const jastipRef = doc(db, 'jastips', id);
  const unblockData = {
    isApproved: true,
    status: 'open' as const,
    blockReason: null,
    blockedAt: null,
    blockedBy: null
  };

  try {
    await updateDoc(jastipRef, unblockData);
  } catch (err) {
    await setDoc(jastipRef, unblockData, { merge: true });
  }
}

// Admin / Creator: Delete Jastip permanently
export async function deleteJastip(id: string): Promise<void> {
  await deleteDoc(doc(db, 'jastips', id));
}

// -------------------------------------------------------------
// SISTEM REKBER QRIS, KOMISI PLATFORM & PENCAIRAN DANA
// -------------------------------------------------------------

// Platform Commission Calculation (Default: 5%)
export const DEFAULT_PLATFORM_FEE_PERCENTAGE = 5;

export function calculateCommission(grossAmount: number, feePercentage = DEFAULT_PLATFORM_FEE_PERCENTAGE) {
  const platformFee = Math.round((grossAmount * feePercentage) / 100);
  const netPayout = grossAmount - platformFee;
  return {
    grossAmount,
    platformFeePercentage: feePercentage,
    platformFee,
    netPayout
  };
}

// Save Provider Bank Account details in User Profile
export async function saveProviderBankAccount(userId: string, bankAccount: BankAccountDetails): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { bankAccount }, { merge: true });
}

// Create new DP payment record in 'payments' collection
export async function createPaymentTransaction(
  paymentData: Omit<PaymentTransaction, 'id' | 'createdAt' | 'status'> & { status?: PaymentStatus }
): Promise<string> {
  const paymentsRef = collection(db, 'payments');
  const newDoc = {
    ...paymentData,
    status: paymentData.status || ('PENDING' as PaymentStatus),
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(paymentsRef, newDoc);

  // If this payment is linked to an order, sync the order status to dp_paid
  if (paymentData.orderId) {
    try {
      const orderRef = doc(db, 'orders', paymentData.orderId);
      await updateDoc(orderRef, {
        status: 'dp_paid',
        dpPaid: true,
        paymentMethod: 'QRIS (Menunggu Verifikasi Admin)'
      });
    } catch (e) {
      console.warn('Could not sync order with payment transaction:', e);
    }
  }

  return docRef.id;
}

// Real-time listener for Payments
export function listenToPayments(callback: (payments: PaymentTransaction[]) => void): () => void {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const items: PaymentTransaction[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as PaymentTransaction);
      });
      callback(items);
    }, (error) => {
      console.warn('Payments listener error:', error);
      callback([]);
    });
  } catch (err) {
    console.warn('Payments subscription failed:', err);
    callback([]);
    return () => {};
  }
}

// Admin approves incoming DP payment ("DANA_DITAMPUNG")
export async function approvePayment(
  paymentId: string, 
  adminIdentifier: string
): Promise<void> {
  const paymentRef = doc(db, 'payments', paymentId);
  const now = new Date().toISOString();
  await updateDoc(paymentRef, {
    status: 'DANA_DITAMPUNG' as PaymentStatus,
    verifiedAt: now,
    verifiedBy: adminIdentifier
  });

  // Also update linked order if available
  try {
    const snap = await getDoc(paymentRef);
    if (snap.exists()) {
      const payment = snap.data() as PaymentTransaction;
      if (payment.orderId) {
        const orderRef = doc(db, 'orders', payment.orderId);
        await updateDoc(orderRef, {
          status: 'in_progress',
          dpPaid: true,
          paymentMethod: 'QRIS Rekber JasaHub (Dana Diamankan)'
        });
      }
    }
  } catch (e) {
    console.warn('Order sync on approve warning:', e);
  }
}

// Admin rejects invalid proof
export async function rejectPayment(
  paymentId: string, 
  reason: string, 
  adminIdentifier: string
): Promise<void> {
  const paymentRef = doc(db, 'payments', paymentId);
  await updateDoc(paymentRef, {
    status: 'REJECTED' as PaymentStatus,
    rejectReason: reason,
    verifiedAt: new Date().toISOString(),
    verifiedBy: adminIdentifier
  });
}

// Admin disburses DP net payout to Provider ("DP_DITERUSKAN_KE_PENYEDIA")
export async function disbursePayment(
  paymentId: string, 
  payoutData: {
    payoutProofUrl: string;
    payoutNotes?: string;
    adminName: string;
    providerBankAccount?: BankAccountDetails;
  }
): Promise<void> {
  const paymentRef = doc(db, 'payments', paymentId);
  const now = new Date().toISOString();
  await updateDoc(paymentRef, {
    status: 'DP_DITERUSKAN_KE_PENYEDIA' as PaymentStatus,
    payoutProofUrl: payoutData.payoutProofUrl,
    payoutNotes: payoutData.payoutNotes || '',
    payoutAt: now,
    payoutBy: payoutData.adminName,
    ...(payoutData.providerBankAccount ? { providerBankAccount: payoutData.providerBankAccount } : {})
  });
}
