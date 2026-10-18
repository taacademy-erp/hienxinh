import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Calendar,
  RotateCw,
  Plus,
  MoreHorizontal,
  Eye,
  Printer,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function TabInvoicesList() {
  const {
    invoices,
    deleteInvoice,
    setActiveTab,
    formatNumber,
    formatVND,
    hasPermission,
    setSelectedInvoice,
    loadData
  } = useApp();

  // If role is Nhân viên, show forbidden message
  if (!hasPermission('invoicesList')) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto mt-12 border border-gray-100 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#E60026] flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-gray-900">Không có quyền truy cập</h2>
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
  const [filterDate, setFilterDate] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        inv.code.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerPhone.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));
      const matchService = selectedService === 'Tất cả' || (inv.serviceSummary || '').includes(selectedService);
      const matchDate = !filterDate || inv.date.includes(filterDate);
      return matchSearch && matchService && matchDate;
    });
  }, [invoices, search, selectedService, filterDate]);

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
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 tracking-tight">
          Danh sách hóa đơn
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Tra cứu, quản lý và theo dõi toàn bộ hóa đơn
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
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

        {/* Date Filter */}
        <div className="w-40 relative">
          <input
            type="text"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder="Ngày (dd/mm/yyyy)"
            className="w-full pl-9 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026]"
          />
          <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Service Filter */}
        <div className="w-48">
          <div className="relative">
            <span className="absolute -top-2 left-2 px-1 bg-white text-[10px] text-gray-400 font-medium">Dịch vụ</span>
            <select
              value={selectedService}
              onChange={(e) => { setSelectedService(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026]"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Khóa Model Kids">Khóa Model Kids</option>
              <option value="Khóa Phong thái">Khóa Phong thái</option>
              <option value="Khóa Catwalk">Khóa Catwalk</option>
              <option value="Phun môi">Phun môi</option>
              <option value="Chân mày">Chân mày</option>
              <option value="Chăm sóc da">Chăm sóc da</option>
            </select>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => {
            setSearch('');
            setSelectedService('Tất cả');
            setFilterDate('');
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
                <th className="py-3.5 px-3 w-10 text-gray-500 font-bold">#</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Mã hóa đơn</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Ngày lập</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Họ và tên khách hàng</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Số điện thoại</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Dịch vụ</th>
                <th className="py-3.5 px-4 font-bold text-gray-800 text-right">Thành tiền</th>
                <th className="py-3.5 pr-6 pl-4 text-center font-bold text-gray-800 w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-400">
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
                          className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-[#E60026] hover:bg-rose-100 border border-rose-100 transition-all font-mono"
                        >
                          {inv.code}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{inv.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{inv.customerName}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-700">{inv.customerPhone}</td>
                      <td className="py-3.5 px-4 text-gray-700">{inv.serviceSummary}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-extrabold text-[#E60026]">
                          {formatNumber(inv.totalAmount)}
                        </span>
                      </td>
                      <td className="py-3.5 pr-6 pl-4 text-center relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === inv.id ? null : inv.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeMenuId === inv.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 text-left text-xs">
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-3.5 h-3.5 text-gray-400" />
                                <span>Xem chi tiết</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setActiveMenuId(null);
                                  setTimeout(() => window.print(), 300);
                                }}
                                className="w-full px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Printer className="w-3.5 h-3.5 text-blue-500" />
                                <span>In hóa đơn</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Bạn chắc chắn muốn xóa hóa đơn "${inv.code}"?`)) {
                                    deleteInvoice(inv.id);
                                    setActiveMenuId(null);
                                  }
                                }}
                                className="w-full px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                <span>Xóa hóa đơn</span>
                              </button>
                            </div>
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
