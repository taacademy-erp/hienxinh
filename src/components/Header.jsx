import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, ChevronDown, LogOut, Menu, KeyRound, Eye, EyeOff, Lock, X, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Header({ onMenuToggle }) {
  const {
    user,
    logout,
    changePassword,
    globalSearchQuery,
    setGlobalSearchQuery,
    setActiveTab,
    activeTab
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // State cho Modal Đổi Mật Khẩu
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      case 'chu': return 'Owner (Chủ)';
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

  const handleOpenChangePassword = () => {
    setIsDropdownOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
    setChangeError('');
    setChangeSuccess(false);
    setIsChangePasswordOpen(true);
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangeError('');

    if (!currentPassword) {
      setChangeError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (!newPassword) {
      setChangeError('Vui lòng nhập mật khẩu mới.');
      return;
    }
    if (newPassword.length < 4) {
      setChangeError('Mật khẩu mới phải có tối thiểu 4 ký tự.');
      return;
    }
    if (newPassword === currentPassword) {
      setChangeError('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setChangeSuccess(true);
        setTimeout(() => {
          setIsChangePasswordOpen(false);
        }, 1800);
      } else {
        setChangeError(res.message || 'Đổi mật khẩu không thành công.');
      }
    } catch (err) {
      setChangeError('Lỗi hệ thống: ' + (err.message || 'Không thể đổi mật khẩu'));
    } finally {
      setIsSubmitting(false);
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
            <span className="hidden sm:block text-xs font-semibold text-gray-800 max-w-[120px] truncate">
              {user?.name || getRoleDisplayName(user?.role)}
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
                  onClick={handleOpenChangePassword}
                  className="w-full px-4 py-2.5 text-left text-xs text-gray-700 hover:bg-rose-50 hover:text-[#C0001A] flex items-center gap-2.5 font-medium transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#C0001A]" />
                  <span>Đổi mật khẩu</span>
                </button>
                <button
                  onClick={() => { logout(); setIsDropdownOpen(false); }}
                  className="w-full px-4 py-2.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium border-t border-gray-100 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Đổi Mật Khẩu */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-[#C0001A] to-rose-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Đổi mật khẩu</h3>
                  <p className="text-[11px] text-rose-100 opacity-90">
                    Cập nhật mật khẩu mới cho tài khoản {user?.name || user?.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4">
              {/* Badge thông tin tài khoản */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#C0001A] text-white font-bold flex items-center justify-center text-xs">
                    {user?.avatar || getRoleInitial(user?.role)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800">{user?.name}</div>
                    <div className="text-[11px] text-gray-400">Username: <span className="font-semibold text-gray-600">{user?.username || 'chu'}</span></div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#C0001A] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>

              {changeError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <span className="font-bold">⚠️</span>
                  <span>{changeError}</span>
                </div>
              )}

              {changeSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Đổi mật khẩu thành công! Mật khẩu mới đã được đồng bộ lên Supabase.</span>
                </div>
              )}

              {/* Mật khẩu hiện tại */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                    disabled={isSubmitting || changeSuccess}
                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#C0001A] focus:ring-1 focus:ring-[#C0001A] transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)"
                    required
                    disabled={isSubmitting || changeSuccess}
                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#C0001A] focus:ring-1 focus:ring-[#C0001A] transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    disabled={isSubmitting || changeSuccess}
                    className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#C0001A] focus:ring-1 focus:ring-[#C0001A] transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Gợi ý */}
              <p className="text-[11px] text-gray-400 leading-relaxed">
                ℹ️ Sau khi đổi mật khẩu, hệ thống sẽ xóa mật khẩu cũ trên Supabase. Bạn sẽ sử dụng mật khẩu mới cho toàn bộ các lần đăng nhập tiếp theo.
              </p>

              {/* Nút hành động */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || changeSuccess}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C0001A] to-rose-700 text-white text-xs font-bold hover:shadow-md hover:shadow-rose-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Xác nhận đổi mật khẩu</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
