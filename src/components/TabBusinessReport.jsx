import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  FileSpreadsheet,
  TrendingUp,
  Users,
  Calendar,
  RotateCw,
  Landmark,
  Coins,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export default function TabBusinessReport() {
  const {
    user,
    hasPermission,
    setActiveTab,
    formatVND,
    formatNumber,
    loadData
  } = useApp();

  // If user is not "chu", block access strictly!
  if (!hasPermission('businessReport')) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto mt-12 border border-gray-100 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#E60026] flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-sans text-gray-900">Giới hạn quyền truy cập</h2>
        <p className="text-sm text-gray-500 mt-2">
          Theo ma trận phân quyền, chỉ tài khoản <strong>Chủ</strong> mới có quyền xem Báo cáo Hoạt động kinh doanh.
        </p>
        <button
          onClick={() => setActiveTab('home')}
          className="mt-6 px-5 py-2.5 bg-[#E60026] text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-all shadow-md"
        >
          Quay về Trang chủ
        </button>
      </div>
    );
  }

  const [dateFilter, setDateFilter] = useState('17/10/2026');
  const [timeMode, setTimeMode] = useState('Ngày');

  // Breakdown values from mockup
  const servicesBreakdown = [
    { name: 'Chăm sóc da', amount: 850000, pct: 9.5, color: '#EF4444' },
    { name: 'Triệt lông vĩnh viễn', amount: 1300000, pct: 14.53, color: '#3B82F6' },
    { name: 'Laser & Điều trị', amount: 1500000, pct: 16.76, color: '#F59E0B' },
    { name: 'Phun xăm thẩm mỹ', amount: 2500000, pct: 27.93, color: '#10B981' },
    { name: 'Tiêm thẩm mỹ (Filler/Botox)', amount: 2800000, pct: 31.28, color: '#06B6D4' },
    { name: 'Dưỡng sinh & Massage', amount: 0, pct: 0, color: '#8B5CF6' }
  ];

  const cashFlowBreakdown = [
    { name: 'Tiền mặt', amount: 400000, pct: 4.47, color: '#EF4444', icon: 'cash' },
    { name: 'Tiền mặt tại quầy', amount: 1250000, pct: 13.97, color: '#F59E0B', icon: 'register' },
    { name: 'Vietcombank Spa', amount: 4500000, pct: 50.28, color: '#10B981', icon: 'bank' },
    { name: 'Techcombank Spa', amount: 2800000, pct: 31.28, color: '#EC4899', icon: 'bank' }
  ];

  const transactions = [
    { id: 1, date: '17/10/2026', content: 'Thanh toán HD-000321', customer: 'Nguyễn Thị Mai', service: 'Chăm sóc da chuyên sâu', method: 'Tiền mặt', account: 'Tiền mặt tại quầy', amount: 400000 },
    { id: 2, date: '17/10/2026', content: 'Thanh toán HD-000320', customer: 'Trần Ngọc Anh', service: 'Triệt lông nách', method: 'Chuyển khoản', account: 'Vietcombank Spa', amount: 1250000 },
    { id: 3, date: '17/10/2026', content: 'HD-000319', customer: 'Lê Thu Hà', service: 'Laser Pico', method: 'Chuyển khoản', account: 'Techcombank Spa', amount: 1500000 },
    { id: 4, date: '17/10/2026', content: 'HD-000318', customer: 'Phạm Thị Ngọc', service: 'Phun môi', method: 'Tiền mặt', account: 'Tiền mặt', amount: 2500000 },
    { id: 5, date: '17/10/2026', content: 'HD-000317', customer: 'Hoàng Minh Anh', service: 'Filler môi', method: 'Chuyển khoản', account: 'Vietcombank Spa', amount: 2800000 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Filter Bar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans text-gray-900 tracking-tight">
            Báo cáo hoạt động kinh doanh
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng quan doanh thu, chi phí và hiệu quả hoạt động
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setTimeMode('Ngày')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeMode === 'Ngày' ? 'bg-[#E60026] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => setTimeMode('Tháng')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeMode === 'Tháng' ? 'bg-[#E60026] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tháng
            </button>
          </div>

          <div className="relative">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 pr-7 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          <button
            onClick={() => { setDateFilter('17/10/2026'); loadData(); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-rose-200 text-[#E60026] hover:bg-rose-50 rounded-xl text-xs font-semibold transition-all"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Tổng doanh thu */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#E60026] flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">TỔNG DOANH THU</p>
            <h3 className="text-xl font-extrabold text-[#E60026] font-sans mt-0.5">
              8.950.000đ
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">7 giao dịch</span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 12%
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Tổng chi phí */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">TỔNG CHI PHÍ</p>
            <h3 className="text-xl font-extrabold text-gray-900 font-sans mt-0.5">
              50.500.000đ
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">2 khoản chi</span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 8%
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Lợi nhuận thực tế */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">LỢI NHUẬN THỰC TẾ</p>
            <h3 className="text-xl font-extrabold text-emerald-600 font-sans mt-0.5">
              -41.550.000đ
            </h3>
            <p className="text-xs text-gray-500 mt-1">Doanh thu - Chi phí</p>
          </div>
        </div>

        {/* Metric 4: Khách hàng */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">KHÁCH HÀNG</p>
            <h3 className="text-xl font-extrabold text-gray-900 font-sans mt-0.5">
              7
            </h3>
            <p className="text-xs text-gray-500 mt-1">Khách hàng phát sinh trong ngày</p>
          </div>
        </div>
      </div>

      {/* Middle Row: 2 Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Doanh thu theo dịch vụ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#E60026] text-white flex items-center justify-center text-xs">
                📈
              </div>
              <h3 className="font-bold text-sm text-gray-900 uppercase">
                DOANH THU THEO DỊCH VỤ (THỰC TẾ)
              </h3>
            </div>
            <span className="text-xs text-gray-400">6 nhóm dịch vụ</span>
          </div>

          <div className="mt-5 space-y-4">
            {servicesBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-gray-700">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatNumber(item.amount)}đ{' '}
                    <span className="text-gray-400 font-normal">({item.pct}%)</span>
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.pct}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dòng tiền theo tài khoản ngân hàng */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#E60026] text-white flex items-center justify-center text-xs">
                  💳
                </div>
                <h3 className="font-bold text-sm text-gray-900 uppercase">
                  DÒNG TIỀN THEO TÀI KHOẢN NGÂN HÀNG (STK)
                </h3>
              </div>
              <span className="text-xs text-gray-400">Tháng 10/2026</span>
            </div>

            <div className="mt-5 space-y-4">
              {cashFlowBreakdown.map((acc, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 font-medium text-gray-800">
                      {acc.icon === 'cash' && <Coins className="w-4 h-4 text-red-500" />}
                      {acc.icon === 'register' && <Coins className="w-4 h-4 text-amber-500" />}
                      {acc.icon === 'bank' && <Landmark className="w-4 h-4 text-emerald-600" />}
                      <span>{acc.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formatNumber(acc.amount)}đ{' '}
                      <span className="text-gray-400 font-normal">({acc.pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${acc.pct}%`,
                        backgroundColor: acc.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Total Line matching mockup */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="font-bold text-gray-900 text-sm">
              Tổng Thu Thực Tế (Tất cả hình thức):
            </span>
            <span className="text-xl font-extrabold text-[#E60026] font-sans">
              8.950.000đ
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Table Card: Chi tiết doanh thu thực tế */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#E60026] text-white flex items-center justify-center text-xs font-bold">
              ≡
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm uppercase">
                <span className="text-[#E60026]">CHI TIẾT DOANH THU THỰC TẾ NGÀY 17/10/2026</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Danh sách các khoản thu dịch vụ spa ghi nhận thực tế từ hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-3 w-10 text-gray-500 font-bold">#</th>
                <th className="py-3 px-4 font-bold text-gray-800">Ngày</th>
                <th className="py-3 px-4 font-bold text-gray-800">Nội dung</th>
                <th className="py-3 px-4 font-bold text-gray-800">Khách hàng</th>
                <th className="py-3 px-4 font-bold text-gray-800">Dịch vụ / Liệu trình</th>
                <th className="py-3 px-4 font-bold text-gray-800">Hình thức thanh toán</th>
                <th className="py-3 px-4 font-bold text-gray-800">STK / Ngân hàng</th>
                <th className="py-3 px-4 font-bold text-gray-800 text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {transactions.map((tx, idx) => (
                <tr key={tx.id} className="hover:bg-rose-50/20 transition-colors">
                  <td className="py-3 px-3 text-gray-500 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4 text-gray-600">{tx.date}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{tx.content}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{tx.customer}</td>
                  <td className="py-3 px-4 text-gray-700">{tx.service}</td>
                  <td className="py-3 px-4">
                    {tx.method === 'Tiền mặt' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Tiền mặt
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                        Chuyển khoản
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{tx.account}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-[#E60026]">
                    {formatNumber(tx.amount)}đ
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Table Footer */}
            <tfoot className="bg-gray-50/90 font-bold border-t border-gray-200">
              <tr>
                <td colSpan="7" className="py-3 px-4 text-gray-900">
                  Tổng cộng ({transactions.length} giao dịch)
                </td>
                <td className="py-3 px-4 text-right text-base text-[#E60026] font-sans font-extrabold">
                  8.950.000đ
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
