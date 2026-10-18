import React from 'react';
import { useApp } from './context/AppContext';
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
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

  // If not logged in, render the login page
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
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <Header />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'home' && <TabHome />}
          {activeTab === 'customers' && <TabCustomers />}
          {activeTab === 'createInvoice' && <TabCreateInvoice />}
          {activeTab === 'invoicesList' && <TabInvoicesList />}
          {activeTab === 'expenses' && <TabExpenses />}
          {activeTab === 'commissionReport' && <TabCommissionReport />}
          {activeTab === 'businessReport' && <TabBusinessReport />}
          {activeTab === 'settings' && <TabSettings />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <InvoiceDetailModal />
      <Toast />
    </div>
  );
}
