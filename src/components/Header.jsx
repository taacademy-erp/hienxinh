import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, ChevronDown, User, Shield, LogOut } from 'lucide-react';

export default function Header() {
  const {
    user,
    switchRole,
    logout,
    globalSearchQuery,
    setGlobalSearchQuery,
    setActiveTab,
    activeTab
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (globalSearchQuery.trim()) {
      setActiveTab('customers');
    }
  };

  const isChiPhi = activeTab === 'expenses';

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'chu':
        return 'Owner';
      case 'ql':
        return 'Quản lý';
      case 'nhanvien':
      default:
        return 'Nhân viên';
    }
  };

  const getRoleInitial = (role) => {
    switch (role) {
      case 'chu':
        return 'O';
      case 'ql':
        return 'Q';
      case 'nhanvien':
      default:
        return 'N';
    }
  };

  return (
    <header className="px-8 pt-6 pb-2 flex items-center justify-between select-none">
      {/* Left side */}
      <div>
        {isChiPhi ? (
          <div>
            <h1 className="text-2xl font-bold font-sans text-[#0C1E3A] tracking-tight">
              Chi phí
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Quản lý và theo dõi các khoản chi phí hoạt động
            </p>
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search input (displayed on Trang chủ and others, hidden on Chi phí like mockup) */}
        {!isChiPhi && (
          <form onSubmit={handleSearchSubmit} className="relative w-64 sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Tìm khách hàng (tên, SĐT)..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-full text-xs text-gray-700 placeholder-gray-400 shadow-xs focus:outline-none focus:ring-1 focus:ring-rose-400 transition-all"
            />
          </form>
        )}

        {/* Bell notification button */}
        <button
          className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-xs border border-gray-100 hover:bg-gray-50 transition-colors relative"
          title="Thông báo"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 bg-[#C0001A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
            {isChiPhi ? '1' : '3'}
          </span>
        </button>

        {/* User profile dropdown pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white rounded-full shadow-xs border border-gray-100 hover:bg-gray-50 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-[#C0001A] text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {getRoleInitial(user?.role)}
            </div>
            <span className="text-xs font-semibold text-gray-800">
              {getRoleDisplayName(user?.role)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* User popup dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Vị trí / Quyền hạn</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{getRoleDisplayName(user?.role)}</p>
                <span className="inline-block mt-1 text-[11px] font-semibold text-[#C0001A] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                  {user?.role === 'chu' ? 'Owner (Toàn quyền)' : user?.role === 'ql' ? 'Quản lý' : 'Nhân viên'}
                </span>
              </div>

              {/* Quick Role Switcher */}
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 mb-1.5 uppercase">Chuyển vai trò test:</p>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => { switchRole('chu'); setIsDropdownOpen(false); }}
                    className={`py-1 text-xs font-semibold rounded-lg border ${
                      user?.role === 'chu' ? 'bg-[#C0001A] text-white border-[#C0001A]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Chủ
                  </button>
                  <button
                    onClick={() => { switchRole('ql'); setIsDropdownOpen(false); }}
                    className={`py-1 text-xs font-semibold rounded-lg border ${
                      user?.role === 'ql' ? 'bg-[#C0001A] text-white border-[#C0001A]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Quản lý
                  </button>
                  <button
                    onClick={() => { switchRole('nhanvien'); setIsDropdownOpen(false); }}
                    className={`py-1 text-xs font-semibold rounded-lg border ${
                      user?.role === 'nhanvien' ? 'bg-[#C0001A] text-white border-[#C0001A]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Nhân viên
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => { logout(); setIsDropdownOpen(false); }}
                  className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
