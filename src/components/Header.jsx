import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, ChevronDown, LogOut, Menu } from 'lucide-react';

export default function Header({ onMenuToggle }) {
  const {
    user,
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

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'chu': return 'Owner';
      case 'ql': return 'Quản lý';
      default: return 'Nhân viên';
    }
  };

  const getRoleInitial = (role) => {
    switch (role) {
      case 'chu': return 'O';
      case 'ql': return 'Q';
      default: return 'N';
    }
  };

  return (
    <header className="px-4 sm:px-8 pt-4 sm:pt-6 pb-2 flex items-center justify-between gap-3 select-none">
      {/* Left: Hamburger menu (mobile only) */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all"
        aria-label="Mở menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Center: Search bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-sm relative"
      >
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
          placeholder="Tìm khách hàng..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-full text-xs text-gray-700 placeholder-gray-400 shadow-xs focus:outline-none focus:ring-1 focus:ring-rose-400 transition-all"
        />
      </form>

      {/* Right: Bell + User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Bell */}
        <button
          className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-xs border border-gray-100 hover:bg-gray-50 transition-colors relative"
          title="Thông báo"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 bg-[#C0001A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
            3
          </span>
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 sm:pr-3 py-1 bg-white rounded-full shadow-xs border border-gray-100 hover:bg-gray-50 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-[#C0001A] text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.avatar || getRoleInitial(user?.role)}
            </div>
            {/* Hide name on very small screens */}
            <span className="hidden sm:block text-xs font-semibold text-gray-800 max-w-[80px] truncate">
              {user?.name?.split(' ').slice(-1)[0] || getRoleDisplayName(user?.role)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Tài khoản</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{user?.name}</p>
                <span className="inline-block mt-1 text-[11px] font-semibold text-[#C0001A] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                  {user?.role === 'chu' ? 'Owner (Toàn quyền)' : user?.role === 'ql' ? 'Quản lý' : 'Nhân viên'}
                </span>
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
