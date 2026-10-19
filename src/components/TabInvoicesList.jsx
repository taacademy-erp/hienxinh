import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Calendar,
  RotateCw,
  Plus,
  Eye,
  Printer,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  FileText,
  Users,
  Coins
} from 'lucide-react';
import CalendarDatePicker from './CalendarDatePicker';
import { formatCurrencyInput, formatVNDWithDot } from '../utils/currencyUtils';

export default function TabInvoicesList() {
  const {
    invoices,
    services,
    deleteInvoice,
    setActiveTab,
    formatNumber,
    formatVND,
    hasPermission,
    setSelectedInvoice,
    loadData,
    user,
    normalizeRole
  } = useApp();

  // If role is Nhân viên, show forbidden message
  if (!hasPermission('invoicesList')) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto mt-12 border border-gray-100 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#E60026] flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-sans text-gray-900">Không có quyền truy cập</h2>
        <p className="text-sm text-gray-500 mt-2">
          Theo cấu hình phân quyền hệ thống, vai trò <strong>Nhân viên</strong> không có quyền xem Danh sách hóa đơn.
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

  // Filters
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState('Tất cả');
  const [timeMode, setTimeMode] = useState('all'); // 'all', 'day', 'month'
  const [selectedMonth, setSelectedMonth] = useState('10/2026');
  const [selectedDay, setSelectedDay] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  // Extract available months and days from invoices
  const { availableMonths, availableDays } = useMemo(() => {
    const monthsSet = new Set(['10/2026', '09/2026']);
    const daysSet = new Set();
    (invoices || []).forEach(inv => {
      if (inv.date) {
        daysSet.add(inv.date);
        const parts = inv.date.split('/');
        if (parts.length === 3) {
          monthsSet.add(`${parts[1]}/${parts[2]}`);
        }
      }
    });

    const months = Array.from(monthsSet);
    const days = Array.from(daysSet).sort((a, b) => {
      const pA = a.split('/').map(Number);
      const pB = b.split('/').map(Number);
      return (pB[2] * 10000 + pB[1] * 100 + pB[0]) - (pA[2] * 10000 + pA[1] * 100 + pA[0]);
    });

    return { availableMonths: months, availableDays: days };
  }, [invoices]);

  // Today string formatted as DD/MM/YYYY
  const todayStr = useMemo(() => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${d}/${m}/${y}`;
  }, []);

  // Target date for "Số Hóa Đơn trong ngày"
  const targetDay = (timeMode === 'day' && selectedDay && selectedDay !== 'all') ? selectedDay : todayStr;

  // 1. Số Hóa Đơn trong ngày
  const dayInvoicesCount = useMemo(() => {
    return (invoices || []).filter(inv => inv.date === targetDay || (inv.date || '').startsWith(targetDay)).length;
  }, [invoices, targetDay]);

  // 2. Số khách hàng còn nợ & 3. Số tiền cần thu
  const debtStats = useMemo(() => {
    const debtCustomers = new Set();
    let totalDebt = 0;
    (invoices || []).forEach(inv => {
      const total = Number(inv.totalAmount) || 0;
      const paid = inv.paidAmount !== undefined && inv.paidAmount !== null ? Number(inv.paidAmount) : total;
      const remaining = inv.remainingAmount !== undefined && inv.remainingAmount !== null ? Number(inv.remainingAmount) : Math.max(0, total - paid);
      if (remaining > 0) {
        const key = (inv.customerPhone || '').trim() || (inv.customerName || '').trim() || inv.id;
        debtCustomers.add(key);
        totalDebt += remaining;
      }
    });
    return {
      debtCustomersCount: debtCustomers.size,
      totalDebtAmount: totalDebt
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return (invoices || []).filter(inv => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        inv.code.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerPhone.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));
      const matchService = selectedService === 'Tất cả' || (inv.serviceSummary || '').includes(selectedService);
      
      // Date filtering
      let matchDate = true;
      if (timeMode === 'day' && selectedDay && selectedDay !== 'all') {
        matchDate = inv.date === selectedDay || (inv.date || '').startsWith(selectedDay);
      } else if (timeMode === 'month' && selectedMonth && selectedMonth !== 'all') {
        matchDate = (inv.date || '').includes(selectedMonth);
      }

      return matchSearch && matchService && matchDate;
    });
  }, [invoices, search, selectedService, timeMode, selectedDay, selectedMonth]);

  // Pagination
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedInvoices.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedInvoices.map(i => i.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-sans text-gray-900 tracking-tight">
          Danh sách hóa đơn
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Tra cứu, quản lý và theo dõi toàn bộ hóa đơn
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        {/* 3 ô tổng hợp trên thanh lọc: 1 ô tổng hợp là Số Hóa Đơn trong ngày, số khách hàng còn nợ và số tiền cần thu */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3.5 p-3.5 bg-rose-50/50 rounded-xl border border-rose-100">
            <div className="w-10 h-10 rounded-xl bg-[#E60026] text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Số Hóa Đơn trong ngày {timeMode === 'day' && selectedDay && selectedDay !== 'all' ? `(${selectedDay})` : '(Hôm nay)'}
              </div>
              <div className="text-xl font-black text-gray-900 font-sans mt-0.5">
                {dayInvoicesCount} <span className="text-xs font-normal text-gray-500">hóa đơn</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 bg-amber-50/50 rounded-xl border border-amber-100">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Số khách hàng còn nợ
              </div>
              <div className="text-xl font-black text-amber-600 font-sans mt-0.5">
                {debtStats.debtCustomersCount} <span className="text-xs font-normal text-gray-500">khách hàng</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 bg-red-50/50 rounded-xl border border-red-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#E60026] to-rose-700 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-600/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Số tiền cần thu
              </div>
              <div className="text-xl font-black text-[#E60026] font-sans mt-0.5">
                {formatCurrencyInput(debtStats.totalDebtAmount)} <span className="text-xs font-bold text-[#E60026]">đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[220px]">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Tìm theo mã HD, tên khách hàng, SĐT..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026] transition-all"
              />
            </div>
          </div>

        {/* Time Filter Mode Toggle */}
        <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200 text-xs">
          <button
            type="button"
            onClick={() => { setTimeMode('day'); setCurrentPage(1); }}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
              timeMode === 'day' ? 'bg-[#E60026] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lọc theo ngày
          </button>
          <button
            type="button"
            onClick={() => { setTimeMode('month'); setCurrentPage(1); }}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
              timeMode === 'month' ? 'bg-[#E60026] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lọc theo tháng
          </button>
          <button
            type="button"
            onClick={() => { setTimeMode('all'); setSelectedDay('all'); setSelectedMonth('all'); setCurrentPage(1); }}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
              timeMode === 'all' ? 'bg-[#E60026] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tất cả
          </button>
        </div>

        {/* If Day Mode: Calendar Date Picker matching reference image 1 */}
        {timeMode === 'day' && (
          <div>
            <CalendarDatePicker
              value={selectedDay}
              onChange={(d) => { setSelectedDay(d); setCurrentPage(1); }}
              placeholder="Chọn ngày lập..."
            />
          </div>
        )}

        {/* If Month Mode: Dropdown listing months */}
        {timeMode === 'month' && (
          <div className="relative min-w-[170px]">
            <span className="absolute -top-2 left-2 px-1 bg-white text-[10px] text-[#E60026] font-bold">
              Chọn tháng
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-rose-50/40 border border-rose-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026]"
            >
              <option value="all">Tất cả các tháng</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>
        )}

        {/* Service Filter (Dynamic list) */}
        <div className="w-48">
          <div className="relative">
            <span className="absolute -top-2 left-2 px-1 bg-white text-[10px] text-gray-400 font-medium">Dịch vụ</span>
            <select
              value={selectedService}
              onChange={(e) => { setSelectedService(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026]"
            >
              <option value="Tất cả">Tất cả dịch vụ</option>
              {(services || []).map(srv => (
                <option key={srv.id} value={srv.name}>{srv.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => {
            setSearch('');
            setSelectedService('Tất cả');
            setTimeMode('all');
            setSelectedDay('all');
            setSelectedMonth('all');
            loadData();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-rose-200 text-[#E60026] hover:bg-rose-50 rounded-xl text-sm font-semibold transition-all"
        >
          <RotateCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>

          {/* Create Invoice Button */}
          <button
            onClick={() => setActiveTab('createInvoice')}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#E60026] hover:bg-[#c90021] text-white font-semibold text-sm rounded-xl shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm hóa đơn</span>
          </button>
        </div>
      </div>

      {/* Invoice Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#E60026] text-white flex items-center justify-center text-xs font-bold">
              ≡
            </div>
            <h2 className="font-bold text-gray-900 text-base">
              <span className="text-[#E60026]">Danh sách hóa đơn</span> ({totalItems})
            </h2>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 pl-6 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedInvoices.length && paginatedInvoices.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-[#E60026] focus:ring-rose-400 accent-[#E60026]"
                  />
                </th>
                <th className="py-3.5 px-3 w-12 text-gray-500 font-bold">STT</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Mã hóa đơn</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Ngày lập</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Họ và tên khách hàng</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Số điện thoại</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Dịch vụ</th>
                <th className="py-3.5 px-4 font-bold text-gray-800 text-right">Tổng tiền</th>
                <th className="py-3.5 px-4 font-bold text-gray-800 text-right">Đã thanh toán</th>
                <th className="py-3.5 px-4 font-bold text-gray-800 text-right">Còn lại</th>
                <th className="py-3.5 pr-6 pl-4 text-center font-bold text-gray-800 w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-gray-400">
                    Không tìm thấy hóa đơn nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const isChecked = selectedRows.includes(inv.id);
                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-rose-50/20 transition-colors ${isChecked ? 'bg-rose-50/30' : ''}`}
                    >
                      <td className="py-3.5 pl-6 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(inv.id)}
                          className="w-4 h-4 rounded text-[#E60026] focus:ring-rose-400 accent-[#E60026]"
                        />
                      </td>
                      <td className="py-3.5 px-3 text-gray-500 font-medium">{globalIdx}</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-[#E60026] hover:bg-rose-100 border border-rose-100 transition-all font-sans"
                        >
                          {inv.code}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{inv.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{inv.customerName}</td>
                      <td className="py-3.5 px-4 font-sans text-gray-700">{inv.customerPhone}</td>
                      <td className="py-3.5 px-4 text-gray-700 max-w-[200px] truncate" title={inv.serviceSummary}>{inv.serviceSummary}</td>
                      {/* Tổng tiền */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-extrabold text-[#E60026] font-sans">
                          {formatCurrencyInput(Number(inv.totalAmount) || 0)}đ
                        </span>
                      </td>

                      {/* Đã thanh toán */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-semibold text-emerald-600 font-sans">
                          {formatCurrencyInput(inv.paidAmount !== undefined && inv.paidAmount !== null ? Number(inv.paidAmount) : (Number(inv.totalAmount) || 0))}đ
                        </span>
                      </td>

                      {/* Còn lại */}
                      <td className="py-3.5 px-4 text-right">
                        {(() => {
                          const tot = Number(inv.totalAmount) || 0;
                          const paid = inv.paidAmount !== undefined && inv.paidAmount !== null ? Number(inv.paidAmount) : tot;
                          const rem = inv.remainingAmount !== undefined && inv.remainingAmount !== null ? Number(inv.remainingAmount) : Math.max(0, tot - paid);
                          return (
                            <span className={`font-bold font-sans ${rem > 0 ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block border border-amber-200/80' : 'text-gray-400'}`}>
                              {formatCurrencyInput(rem)}đ
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3.5 pr-6 pl-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Xem chi tiết */}
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* In hóa đơn */}
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setTimeout(() => window.print(), 300);
                            }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="In hóa đơn"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {/* Xóa - chỉ Chủ */}
                          {normalizeRole(user?.role) === 'chu' && (
                          <button
                            onClick={() => {
                              if (confirm(`Bạn chắc chắn muốn xóa hóa đơn "${inv.code}"?`)) {
                                deleteInvoice(inv.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa hóa đơn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <div>
            Hiển thị <span className="font-semibold">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> -{' '}
            <span className="font-semibold">{Math.min(currentPage * pageSize, totalItems)}</span> /{' '}
            <span className="font-semibold">{totalItems}</span> hóa đơn
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === pageNum
                    ? 'bg-[#E60026] text-white shadow-sm'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="8">8</option>
              <option value="15">15</option>
              <option value="25">25</option>
            </select>
            <span>hóa đơn/trang</span>
          </div>
        </div>
      </div>
    </div>
  );
}
