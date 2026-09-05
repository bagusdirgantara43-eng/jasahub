import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ServiceItem, JobVacancy, JastipItem } from './types';
import { 
  listenToServices, 
  listenToJobs, 
  listenToJastips 
} from './lib/dbService';

import { Navbar } from './components/Navbar';
import { ServicesList } from './components/ServicesList';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { AddServiceModal } from './components/AddServiceModal';
import { EditServiceModal } from './components/EditServiceModal';
import { JobsList } from './components/JobsList';
import { AddJobModal } from './components/AddJobModal';
import { JastipList } from './components/JastipList';
import { AddJastipModal } from './components/AddJastipModal';
import { OrdersManager } from './components/OrdersManager';
import { ProfileView } from './components/ProfileView';
import { LoginModal } from './components/LoginModal';
import { PaymentDPModal } from './components/PaymentDPModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Wrench, Heart, ShieldCheck, Sparkles } from 'lucide-react';

function MainApp() {
  const { profile } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'services' | 'jobs' | 'jastip' | 'orders' | 'profile' | 'admin'>('services');

  // Real-time collections state
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [jastips, setJastips] = useState<JastipItem[]>([]);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isAddJastipOpen, setIsAddJastipOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Quick DP payment trigger directly from list
  const [quickPayService, setQuickPayService] = useState<ServiceItem | null>(null);

  // Subscribe to Firestore collections
  useEffect(() => {
    const unsubServices = listenToServices((data) => setServices(data));
    const unsubJobs = listenToJobs((data) => setJobs(data));
    const unsubJastips = listenToJastips((data) => setJastips(data));

    return () => {
      unsubServices();
      unsubJobs();
      unsubJastips();
    };
  }, []);

  const handleOpenAddService = () => {
    if (!profile) {
      setIsLoginOpen(true);
      return;
    }
    setIsAddServiceOpen(true);
  };

  const handleOpenAddJob = () => {
    if (!profile) {
      setIsLoginOpen(true);
      return;
    }
    setIsAddJobOpen(true);
  };

  const handleOpenAddJastip = () => {
    if (!profile) {
      setIsLoginOpen(true);
      return;
    }
    setIsAddJastipOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-emerald-500 selection:text-white antialiased">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenAddService={handleOpenAddService}
        onOpenAddJob={handleOpenAddJob}
        onOpenAddJastip={handleOpenAddJastip}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'services' && (
          <ServicesList
            services={services}
            onSelectService={(service) => setSelectedService(service)}
            onOpenAddService={handleOpenAddService}
            onQuickPayDP={(service) => setQuickPayService(service)}
            onEditService={(service) => setEditingService(service)}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsList
            jobs={jobs}
            onOpenAddJob={handleOpenAddJob}
          />
        )}

        {activeTab === 'jastip' && (
          <JastipList
            jastips={jastips}
            onOpenAddJastip={handleOpenAddJastip}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersManager />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            onOpenAddService={handleOpenAddService}
            services={services}
            onEditService={(service) => setEditingService(service)}
            onSelectService={(service) => setSelectedService(service)}
            onDeleteService={(id) => setServices((prev) => prev.filter((s) => s.id !== id))}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard 
            services={services} 
            jobs={jobs} 
            jastips={jastips} 
          />
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900">
                  Jasa<span className="text-emerald-600">Hub</span>
                </span>
                <p className="text-xs text-slate-500">
                  Platform Layanan Jasa, Lowongan Kerja & Jasa Titip Indonesia
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-medium">
              <button onClick={() => setActiveTab('services')} className="hover:text-emerald-600 transition">
                Cari Jasa
              </button>
              <button onClick={() => setActiveTab('jobs')} className="hover:text-emerald-600 transition">
                Lowongan Kerja
              </button>
              <button onClick={() => setActiveTab('jastip')} className="hover:text-emerald-600 transition">
                Jastip
              </button>
              <button onClick={() => setActiveTab('orders')} className="hover:text-emerald-600 transition">
                Pesanan & Pembayaran DP
              </button>
            </div>

            <div className="text-xs text-slate-400 text-center sm:text-right">
              Didukung oleh Firebase Firestore & Google Auth
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <ServiceDetailModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        onOrderSuccess={() => {
          setActiveTab('orders');
        }}
        onEditService={(service) => {
          setSelectedService(null);
          setEditingService(service);
        }}
      />

      <AddServiceModal
        isOpen={isAddServiceOpen}
        onClose={() => setIsAddServiceOpen(false)}
        onSuccess={() => {
          setActiveTab('services');
        }}
      />

      <EditServiceModal
        service={editingService}
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        onSuccess={(updated) => {
          setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          if (selectedService && selectedService.id === updated.id) {
            setSelectedService(updated);
          }
        }}
      />

      <AddJobModal
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
        onSuccess={() => {
          setActiveTab('jobs');
        }}
      />

      <AddJastipModal
        isOpen={isAddJastipOpen}
        onClose={() => setIsAddJastipOpen(false)}
        onSuccess={() => {
          setActiveTab('jastip');
        }}
      />

      {/* Quick Pay DP modal from list cards */}
      {quickPayService && (
        <PaymentDPModal
          isOpen={!!quickPayService}
          onClose={() => setQuickPayService(null)}
          serviceTitle={quickPayService.title}
          providerName={quickPayService.providerName}
          providerId={quickPayService.providerId}
          serviceId={quickPayService.id}
          dpAmount={quickPayService.dpAmount || 50000}
          paymentLink={quickPayService.paymentLink}
          onConfirmPaid={(method) => {
            console.log('Payment DP confirmed via', method);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
