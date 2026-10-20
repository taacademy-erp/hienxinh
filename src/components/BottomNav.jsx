import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Users, FilePlus, FileText, Wallet, BarChart3 } from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab, hasPermission } = useApp();

  const navItems = [
    { key: 'home', label: 'Trang chủ', icon: Home },
    { key: 'customers', label: 'Khách hàng', icon: Users },
    { key: 'createInvoice', label: 'Hóa đơn', icon: FilePlus },
    { key: 'invoicesList', label: 'DS Hóa đơn', icon: FileText },
    { key: 'expenses', label: 'Chi phí', icon: Wallet },
    { key: 'commissionReport', label: 'Báo cáo', icon: BarChart3 },
  ].filter(item => hasPermission(item.key));

  // Show max 5 items on bottom nav
  const visibleItems = navItems.slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl safe-bottom">
      <div className="flex items-stretch justify-around">
        {visibleItems.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                isActive ? 'text-[#C0001A]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {/* Active indicator dot on top */}
              <span className={`block w-5 h-0.5 rounded-full mb-1 transition-all ${isActive ? 'bg-[#C0001A]' : 'bg-transparent'}`} />
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className={`text-[10px] font-medium leading-tight mt-0.5 ${isActive ? 'font-bold' : ''}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
