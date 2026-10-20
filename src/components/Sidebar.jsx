import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Users,
  FilePlus,
  FileText,
  Wallet,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Settings,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const {
    activeTab,
    setActiveTab,
    hasPermission,
    isReportDropdownOpen,
    setIsReportDropdownOpen
  } = useApp();

  const handleNav = (tab) => {
    setActiveTab(tab);
    onClose?.();
  };

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-56 min-w-[14rem]
          bg-gradient-to-b from-[#8B0012] via-[#B8001E] to-[#73000F]
          text-white flex flex-col justify-between select-none overflow-hidden shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:z-20
        `}
      >
        {/* Glass effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: 'linear-gradient(135deg, transparent 0%, transparent 45%, rgba(255,255,255,0.4) 55%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-96 pointer-events-none opacity-25"
          style={{ background: 'linear-gradient(60deg, transparent 20%, rgba(255,255,255,0.3) 40%, transparent 60%)' }}
        />

        <div className="relative z-10">
          {/* Brand Header */}
          <div className="pt-6 pb-6 px-4 flex items-center justify-between border-b border-white/10">
            <img
              src="/brand-logo-white.png"
              alt="Hiền Xinh Beauty Center"
              className="h-11 w-auto max-w-[160px] object-contain drop-shadow-md"
            />
            {/* Close button - mobile only */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-4 px-2 space-y-1.5 font-medium text-[13px]">
            {hasPermission('home') && (
              <button
                onClick={() => handleNav('home')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-left ${
                  activeTab === 'home'
                    ? 'bg-white text-[#C0001A] font-bold shadow-md'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-[#C0001A]' : 'text-white/90'}`} />
                <span>Trang chủ</span>
              </button>
            )}

            {hasPermission('customers') && (
              <button
                onClick={() => handleNav('customers')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-left ${
                  activeTab === 'customers'
                    ? 'bg-white text-[#C0001A] font-bold shadow-md'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Users className={`w-4 h-4 ${activeTab === 'customers' ? 'text-[#C0001A]' : 'text-white/90'}`} />
                <span>Khách hàng</span>
              </button>
            )}

            {hasPermission('createInvoice') && (
              <button
                onClick={() => handleNav('createInvoice')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-left ${
                  activeTab === 'createInvoice'
                    ? 'bg-white text-[#C0001A] font-bold shadow-md'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <FilePlus className={`w-4 h-4 ${activeTab === 'createInvoice' ? 'text-[#C0001A]' : 'text-white/90'}`} />
                <span>Nhập hóa đơn</span>
              </button>
            )}

            {hasPermission('invoicesList') && (
              <button
                onClick={() => handleNav('invoicesList')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-left ${
                  activeTab === 'invoicesList'
                    ? 'bg-white text-[#C0001A] font-bold shadow-md'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <FileText className={`w-4 h-4 ${activeTab === 'invoicesList' ? 'text-[#C0001A]' : 'text-white/90'}`} />
                <span>Danh sách hóa đơn</span>
              </button>
            )}

            {hasPermission('expenses') && (
              <button
                onClick={() => handleNav('expenses')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-left ${
                  activeTab === 'expenses'
                    ? 'bg-white text-[#C0001A] font-bold shadow-md'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Wallet className={`w-4 h-4 ${activeTab === 'expenses' ? 'text-[#C0001A]' : 'text-white/90'}`} />
                <span>Chi phí</span>
              </button>
            )}

            {/* Báo cáo dropdown */}
            <div className="pt-0.5">
              <button
                onClick={() => setIsReportDropdownOpen(!isReportDropdownOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 text-left ${
                  activeTab === 'commissionReport' || activeTab === 'businessReport'
                    ? 'bg-black/15 text-white font-semibold'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-white/90" />
                  <span>Báo cáo</span>
                </div>
                {isReportDropdownOpen
                  ? <ChevronUp className="w-3.5 h-3.5 text-white/70" />
                  : <ChevronDown className="w-3.5 h-3.5 text-white/70" />
                }
              </button>

              {isReportDropdownOpen && (
                <div className="mt-1 ml-5 pl-3 border-l border-white/30 space-y-1">
                  {hasPermission('commissionReport') && (
                    <button
                      onClick={() => handleNav('commissionReport')}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all text-left ${
                        activeTab === 'commissionReport'
                          ? 'bg-white text-[#C0001A] font-bold shadow-xs'
                          : 'text-white/85 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'commissionReport' ? 'bg-[#C0001A]' : 'bg-white/70'}`} />
                      <span>Báo cáo hoa hồng</span>
                    </button>
                  )}

                  {hasPermission('businessReport') && (
                    <button
                      onClick={() => handleNav('businessReport')}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all text-left ${
                        activeTab === 'businessReport'
                          ? 'bg-white text-[#C0001A] font-bold shadow-xs'
                          : 'text-white/85 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'businessReport' ? 'bg-[#C0001A]' : 'bg-white/70'}`} />
                      <span>Báo cáo HĐKD</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {hasPermission('settings') && (
              <div className="pt-2">
                <button
                  onClick={() => handleNav('settings')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 text-left ${
                    activeTab === 'settings'
                      ? 'bg-white text-[#C0001A] font-bold shadow-md'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#C0001A]' : 'text-white/90'}`} />
                  <span>Cài đặt</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        <div className="p-3 text-[10px] text-white/50 text-center relative z-10">
          Hiền Xinh Beauty Center © 2026
        </div>
      </aside>
    </>
  );
}
