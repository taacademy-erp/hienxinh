import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  FileText,
  UserCheck,
  Calendar,
  RotateCw,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';
import CalendarDatePicker from './CalendarDatePicker';

export default function TabCommissionReport() {
  const {
    staff,
    invoices,
    formatNumber,
    formatVND,
    setSelectedStaffCommission,
    loadData
  } = useApp();

  // Helper: Get today's date formatted as DD/MM/YYYY
  const getTodayStr = () => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${now.getFullYear()}`;
  };

  const [dateFilter, setDateFilter] = useState(getTodayStr());
  const [timeMode, setTimeMode] = useState('Ngày'); // 'Ngày' | 'Tháng'
  const [search, setSearch] = useState('');
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);

  // Filter invoices strictly according to selected date / month
  const filteredInvoices = useMemo(() => {
    if (!dateFilter || dateFilter === 'all') return invoices || [];

    const filt = dateFilter.trim();
    if (timeMode === 'Tháng') {
      const parts = filt.split('/');
      const targetMonthYear = parts.length === 3 ? `${parts[1]}/${parts[2]}` : filt;
      return (invoices || []).filter(inv => (inv.date || '').includes(targetMonthYear));
    }

    // Default: 'Ngày' -> Match exact date (e.g. "24/10/2026")
    return (invoices || []).filter(inv => {
      const invDate = (inv.date || '').trim();
      if (invDate === filt) return true;
      if (filt.length <= 2 && invDate.startsWith(`${filt.padStart(2, '0')}/`)) return true;
      return false;
    });
  }, [invoices, dateFilter, timeMode]);

  // Compute commission stats per staff member dynamically from filteredInvoices
  const staffCommissionList = useMemo(() => {
    return (staff || []).map((member) => {
      let dynInvoices = [];
      let dynCount = 0;
      let dynTotal = 0;

      (filteredInvoices || []).forEach(inv => {
        let memberInInv = false;
        (inv.services || []).forEach(srv => {
          if (srv.onlineStaff === member.name) {
            memberInInv = true;
            const amt = Number(srv.onlineCommissionAmount) || Math.round(((srv.total || 0) * (srv.onlineCommissionRate || 0)) / 100);
            dynTotal += amt;
            dynInvoices.push({
              code: inv.code,
              date: inv.date,
              customer: inv.customerName,
              service: srv.name,
              role: 'Tư vấn Online',
              rate: `${srv.onlineCommissionRate || 5}%`,
              amount: amt
            });
          }
          if (srv.directStaff === member.name) {
            memberInInv = true;
            const amt = Number(srv.directCommissionAmount) || Math.round(((srv.total || 0) * (srv.directCommissionRate || 0)) / 100);
            dynTotal += amt;
            dynInvoices.push({
              code: inv.code,
              date: inv.date,
              customer: inv.customerName,
              service: srv.name,
              role: 'Tư vấn trực tiếp',
              rate: `${srv.directCommissionRate || 10}%`,
              amount: amt
            });
          }
          if (srv.execStaff === member.name) {
            memberInInv = true;
            const amt = Number(srv.execCommissionAmount) || Math.round(((srv.total || 0) * (srv.execCommissionRate || 0)) / 100);
            dynTotal += amt;
            dynInvoices.push({
              code: inv.code,
              date: inv.date,
              customer: inv.customerName,
              service: srv.name,
              role: 'Kỹ thuật viên thực hiện',
              rate: `${srv.execCommissionRate || 15}%`,
              amount: amt
            });
          }
        });
        if (memberInInv) dynCount++;
      });

      return {
        ...member,
        invoiceCount: dynCount,
        totalCommission: dynTotal,
        averageRate: dynCount > 0 ? (member.commissionRate ? `${member.commissionRate}%` : '5%') : '0%',
        breakdown: dynInvoices
      };
    }).sort((a, b) => b.totalCommission - a.totalCommission);
  }, [staff, filteredInvoices]);

  // Filtered by search
  const filteredList = useMemo(() => {
    return staffCommissionList.filter(s =>
      !search || s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [staffCommissionList, search]);

  const totalCommissionAll = staffCommissionList.reduce((sum, s) => sum + s.totalCommission, 0);

  const dateDescription = !dateFilter || dateFilter === 'all'
    ? 'Toàn bộ thời gian'
    : (timeMode === 'Tháng' ? `Tháng ${dateFilter}` : `Ngày ${dateFilter}`);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans text-gray-900 tracking-tight">
            Báo cáo hoa hồng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Đang hiển thị hoa hồng theo: <strong className="text-[#E60026]">{dateDescription}</strong>
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        {/* Time mode toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Thời gian:</span>
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
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-2">
          <CalendarDatePicker
            value={dateFilter}
            onChange={(newDate) => setDateFilter(newDate)}
            placeholder="Chọn ngày lọc..."
          />

          <button
            onClick={() => setDateFilter(getTodayStr())}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              dateFilter === getTodayStr()
                ? 'bg-rose-50 text-[#E60026] border-rose-200 font-bold'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Hôm nay
          </button>

          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              dateFilter === 'all'
                ? 'bg-rose-50 text-[#E60026] border-rose-200 font-bold'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Tất cả
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-xs relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên nhân viên..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {/* Refresh */}
        <button
          onClick={() => { setSearch(''); loadData(); }}
          className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-rose-200 text-[#E60026] hover:bg-rose-50 rounded-xl text-xs font-semibold transition-all shadow-2xs"
          title="Tải lại dữ liệu từ hệ thống"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* 3 Metric Cards matching mockup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Tổng hoa hồng */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#E60026] flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng hoa hồng</p>
            <h3 className="text-2xl font-black text-[#E60026] font-sans mt-1">
              {formatNumber(totalCommissionAll)} đ
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{dateDescription}</p>
          </div>
        </div>

        {/* Card 2: Số hóa đơn */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Số hóa đơn phát sinh</p>
            <h3 className="text-2xl font-black text-gray-900 font-sans mt-1">
              {filteredInvoices.length} <span className="text-sm font-normal text-gray-500">hóa đơn</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{dateDescription}</p>
          </div>
        </div>

        {/* Card 3: Số nhân viên */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nhân viên nhận hoa hồng</p>
            <h3 className="text-2xl font-black text-gray-900 font-sans mt-1">
              {staffCommissionList.filter(s => s.totalCommission > 0).length} <span className="text-sm font-normal text-gray-500">nhân viên</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Có phát sinh hoa hồng trong kỳ</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#E60026] text-white flex items-center justify-center text-xs font-bold">
              ≡
            </div>
            <h2 className="font-bold text-gray-900 text-base">
              <span className="text-[#E60026]">Chi tiết hoa hồng theo nhân viên</span> ({dateDescription})
            </h2>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 pl-6 pr-3 w-12 text-gray-500 font-bold">#</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Nhân viên</th>
                <th className="py-3.5 px-4 font-bold text-gray-800 text-center">Số hóa đơn</th>
                <th className="py-3.5 px-4 font-bold text-gray-800 text-right">Tổng hoa hồng</th>
                <th className="py-3.5 px-4 font-bold text-gray-800 text-center">Tỷ lệ hoa hồng TB</th>
                <th className="py-3.5 pr-6 pl-4 text-center font-bold text-gray-800 w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {totalCommissionAll === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 font-medium">
                    Không có hoa hồng nào phát sinh trong <strong>{dateDescription}</strong>.
                    <div className="mt-2 text-xs text-gray-400">
                      Bấm vào nút <strong>[Tất cả]</strong> hoặc chọn ngày khác để xem hoa hồng các ngày có hóa đơn.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-rose-50/20 transition-colors">
                    <td className="py-3.5 pl-6 pr-3 text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${member.color || 'bg-rose-600'} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                          {member.initials}
                        </div>
                        <span className="font-bold text-gray-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                      {member.invoiceCount}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-extrabold text-[#E60026] font-sans">
                        {formatNumber(member.totalCommission)} đ
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-gray-700 font-medium">
                      {member.averageRate}
                    </td>
                    <td className="py-3.5 pr-6 pl-4 text-center">
                      <button
                        onClick={() => setSelectedStaffDetails(member)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#E60026] bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Commission Breakdown Modal */}
      {selectedStaffDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${selectedStaffDetails.color || 'bg-rose-600'} text-white font-bold text-sm flex items-center justify-center`}>
                  {selectedStaffDetails.initials}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 font-sans">
                    Chi tiết hoa hồng: {selectedStaffDetails.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Thời gian: <strong className="text-gray-900">{dateDescription}</strong> • Tổng hoa hồng: <strong className="text-[#E60026]">{formatNumber(selectedStaffDetails.totalCommission)} đ</strong> ({selectedStaffDetails.invoiceCount} hóa đơn)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffDetails(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Mã HD</th>
                    <th className="py-2.5 px-3">Ngày</th>
                    <th className="py-2.5 px-3">Khách hàng</th>
                    <th className="py-2.5 px-3">Dịch vụ</th>
                    <th className="py-2.5 px-3">Vai trò</th>
                    <th className="py-2.5 px-3 text-center">Tỷ lệ</th>
                    <th className="py-2.5 px-3 text-right">Hoa hồng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedStaffDetails.breakdown && selectedStaffDetails.breakdown.length > 0 ? (
                    selectedStaffDetails.breakdown.map((item, i) => (
                      <tr key={i} className="hover:bg-rose-50/20">
                        <td className="py-2.5 px-3 font-sans font-bold text-[#E60026]">{item.code}</td>
                        <td className="py-2.5 px-3 font-sans text-gray-600">{item.date}</td>
                        <td className="py-2.5 px-3 font-medium">{item.customer}</td>
                        <td className="py-2.5 px-3">{item.service}</td>
                        <td className="py-2.5 px-3 text-gray-600">{item.role}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{item.rate}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-[#E60026]">
                          +{formatNumber(item.amount)} đ
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-gray-400">
                        Không có hóa đơn hoa hồng nào phát sinh trong {dateDescription}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
