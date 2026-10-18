import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginView() {
  const { login } = useApp();
  const [username, setUsername] = useState('chu');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  const handleQuickLogin = async (roleName, userAccount) => {
    setUsername(userAccount);
    setPassword('123456');
    setLoading(true);
    await login(userAccount, '123456');
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#fce7ea] flex items-center justify-center p-4 sm:p-8">
      {/* Centered Modal Card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-rose-100">
        
        {/* Left Column: Red Gradient Promo Branding */}
        <div className="w-full md:w-5/12 bg-login-gradient p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center">
            <img
              src="/brand-logo-white.png"
              alt="Hiền Xinh Beauty Center"
              className="h-12 w-auto max-w-[220px] object-contain drop-shadow-md"
            />
          </div>

          {/* Slogan in middle / lower */}
          <div className="relative z-10 my-10 md:my-auto">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-rose-200 block mb-3">
              HIỀN XINH BEAUTY CENTER
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif leading-tight drop-shadow-sm text-white">
              Quản lý tinh gọn – Chăm sóc tận tâm
            </h1>
            <p className="text-sm text-rose-100 mt-3 font-normal leading-relaxed">
              Mọi thông tin khách hàng, dịch vụ và doanh thu trong một nơi
            </p>
            {/* Dots */}
            <div className="flex items-center gap-1.5 mt-5 text-rose-200">
              <span className="w-6 h-0.5 bg-rose-200/60 rounded"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/70"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              <span className="w-6 h-0.5 bg-rose-200/60 rounded"></span>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-white/60">
            Phiên bản chuyên nghiệp 2026 • Hiền Xinh
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight font-serif">
              Đăng nhập
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">
              Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tài khoản
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tài khoản"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026] transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E60026] focus:ring-rose-400 accent-[#E60026]"
                  />
                  <span className="text-gray-700 font-medium">Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Vui lòng liên hệ bộ phận kỹ thuật hoặc dùng tài khoản dùng thử bên dưới.')}
                  className="text-[#E60026] hover:underline font-medium"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#E60026] hover:bg-[#c90021] text-white font-semibold rounded-xl shadow-lg shadow-rose-600/25 transition-all duration-200 flex items-center justify-center text-sm disabled:opacity-75"
                >
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
              </div>
            </form>

            {/* Quick Login Box matching mockups */}
            <div className="mt-6 p-4 rounded-2xl border border-dashed border-rose-300 bg-rose-50/40">
              <p className="text-xs text-gray-600 text-center font-medium">
                Tài khoản dùng thử <span className="text-rose-600 font-semibold">(mật khẩu 123456)</span>
              </p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('chu', 'chu')}
                  className="py-1.5 px-3 bg-white hover:bg-rose-100 text-[#E60026] font-semibold text-xs rounded-lg border border-rose-200 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Chủ
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('ql', 'quanly')}
                  className="py-1.5 px-3 bg-white hover:bg-rose-100 text-[#E60026] font-semibold text-xs rounded-lg border border-rose-200 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Quản lý
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('nhanvien', 'nhanvien')}
                  className="py-1.5 px-3 bg-white hover:bg-rose-100 text-[#E60026] font-semibold text-xs rounded-lg border border-rose-200 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Nhân viên
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
