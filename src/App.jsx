import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import TabHome from './components/TabHome';
import TabCustomers from './components/TabCustomers';
import TabCreateInvoice from './components/TabCreateInvoice';
import TabInvoicesList from './components/TabInvoicesList';
import TabExpenses from './components/TabExpenses';
import TabCommissionReport from './components/TabCommissionReport';
import TabBusinessReport from './components/TabBusinessReport';
import TabSettings from './components/TabSettings';
import InvoiceDetailModal from './components/InvoiceDetailModal';
import Toast from './components/Toast';

export default function App() {
  const { user, activeTab } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return (
      <>
        <LoginView />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FAF6F7] text-slate-800 antialiased font-sans">

      {/* ── Sidebar (always fixed, drawer on mobile / visible on desktop) ── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/*
        Desktop spacer: reserves 224px (same as sidebar width) in the flex layout
        so main content doesn't slide under the fixed sidebar on large screens.
        Hidden on mobile because sidebar becomes a drawer overlay there.
      */}
      <div className="hidden lg:block w-56 shrink-0" aria-hidden="true" />

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {activeTab === 'home'             && <TabHome />}
          {activeTab === 'customers'        && <TabCustomers />}
          {activeTab === 'createInvoice'    && <TabCreateInvoice />}
          {activeTab === 'invoicesList'     && <TabInvoicesList />}
          {activeTab === 'expenses'         && <TabExpenses />}
          {activeTab === 'commissionReport' && <TabCommissionReport />}
          {activeTab === 'businessReport'   && <TabBusinessReport />}
          {activeTab === 'settings'         && <TabSettings />}
        </main>
      </div>

      {/* ── Bottom Nav (mobile only) ── */}
      <BottomNav />

      {/* ── Global Modals & Notifications ── */}
      <InvoiceDetailModal />
      <Toast />
    </div>
  );
}
