import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Download,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function TabCustomers() {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    invoices,
    formatVND,
    globalSearchQuery,
    setGlobalSearchQuery,
    user,
    normalizeRole
  } = useApp();

  // Filters state
  const [search, setSearch] = useState(globalSearchQuery || '');
  const [selectedGroup, setSelectedGroup] = useState('Tất cả');
  const [selectedSource, setSelectedSource] = useState('Tất cả');
  const [selectedRows, setSelectedRows] = useState([]);
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewHistoryCust, setViewHistoryCust] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    group: 'Khách mới',
    source: 'Facebook'
  });

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const query = (search || globalSearchQuery || '').toLowerCase().trim();
      const matchSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.phone.replace(/\s+/g, '').includes(query.replace(/\s+/g, ''));
      const matchGroup = selectedGroup === 'Tất cả' || c.group === selectedGroup;
      const matchSource = selectedSource === 'Tất cả' || c.source === selectedSource;
      return matchSearch && matchGroup && matchSource;
    });
  }, [customers, search, globalSearchQuery, selectedGroup, selectedSource]);

  // Pagination
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Checkbox toggle
  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedCustomers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedCustomers.map(c => c.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      dob: '',
      group: 'Khách mới',
      source: 'Facebook'
    });
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      dob: c.dob || '',
      group: c.group || 'Khách mới',
      source: c.source || 'Facebook'
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, formData);
    } else {
      await addCustomer(formData);
    }
    setIsModalOpen(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['STT', 'Họ và tên', 'Ngày sinh', 'Số điện thoại', 'Nhóm khách hàng', 'Nguồn khách'];
    const rows = filteredCustomers.map((c, i) => [
      i + 1,
      `"${c.name}"`,
      `"${c.dob || ''}"`,
      `"${c.phone}"`,
      `"${c.group}"`,
      `"${c.source}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_khach_hang_hien_xinh.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group Badge Color Helper
  const renderGroupBadge = (group) => {
    switch (group) {
      case 'Khách quen':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#E60026] border border-rose-100">
            Khách quen
          </span>
        );
      case 'VIP':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            VIP
          </span>
        );
      case 'Khách mới':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
            Khách mới
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans text-gray-900 tracking-tight">
            Khách hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý thông tin khách hàng, lịch sử dịch vụ và giao dịch.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E60026] hover:bg-[#c90021] text-white font-semibold text-sm rounded-xl shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khách hàng</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Tìm kiếm</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setGlobalSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tên khách hàng, SĐT..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026] transition-all"
            />
          </div>
        </div>

        {/* Customer Group Filter */}
        <div className="w-44">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Nhóm khách hàng</label>
          <select
            value={selectedGroup}
            onChange={(e) => { setSelectedGroup(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026] transition-all"
          >
            <option value="Tất cả">Tất cả</option>
            <option value="Khách quen">Khách quen</option>
            <option value="Khách mới">Khách mới</option>
            <option value="VIP">VIP</option>
          </select>
        </div>

        {/* Source Filter */}
        <div className="w-44">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Nguồn khách</label>
          <select
            value={selectedSource}
            onChange={(e) => { setSelectedSource(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026] transition-all"
          >
            <option value="Tất cả">Tất cả</option>
            <option value="Facebook">Facebook</option>
            <option value="Giới thiệu">Giới thiệu</option>
            <option value="Tiktok">Tiktok</option>
            <option value="Website">Website</option>
            <option value="Khách cũ">Khách cũ</option>
            <option value="Tại quầy">Tại quầy</option>
          </select>
        </div>

        {/* Advanced Filter Button */}
        <div className="self-end pt-1">
          <button
            onClick={() => {
              setSearch('');
              setSelectedGroup('Tất cả');
              setSelectedSource('Tất cả');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-rose-200 text-[#E60026] hover:bg-rose-50 rounded-xl text-sm font-medium transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Lọc nâng cao</span>
          </button>
        </div>
      </div>

      {/* Customer List Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-base">
            <span className="text-[#E60026]">Danh sách khách hàng</span> ({totalItems})
          </h2>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-rose-200 text-[#E60026] hover:bg-rose-50 rounded-lg text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất dữ liệu</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 pl-6 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedCustomers.length && paginatedCustomers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-[#E60026] focus:ring-rose-400 accent-[#E60026]"
                  />
                </th>
                <th className="py-3.5 px-3 w-14 text-gray-500 font-bold">STT</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Họ và tên</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Ngày sinh</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">SĐT</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Nhóm khách hàng</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Nguồn khách</th>
                <th className="py-3.5 pr-6 pl-4 text-center font-bold text-gray-800 w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    Không tìm thấy khách hàng nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const isChecked = selectedRows.includes(cust.id);
                  return (
                    <tr
                      key={cust.id}
                      className={`hover:bg-rose-50/20 transition-colors ${isChecked ? 'bg-rose-50/30' : ''}`}
                    >
                      <td className="py-3.5 pl-6 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(cust.id)}
                          className="w-4 h-4 rounded text-[#E60026] focus:ring-rose-400 accent-[#E60026]"
                        />
                      </td>
                      <td className="py-3.5 px-3 text-gray-500 font-medium">{globalIdx}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{cust.name}</td>
                      <td className="py-3.5 px-4 text-gray-600">{cust.dob || '—'}</td>
                      <td className="py-3.5 px-4 font-sans text-gray-700">{cust.phone}</td>
                      <td className="py-3.5 px-4">{renderGroupBadge(cust.group)}</td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium">{cust.source || 'Facebook'}</td>
                      <td className="py-3.5 pr-6 pl-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Xem lịch sử - tất cả vai trò */}
                          <button
                            onClick={() => { setViewHistoryCust(cust); }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem lịch sử hóa đơn"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Chỉnh sửa - Chủ & Quản lý */}
                          {normalizeRole(user?.role) !== 'nhanvien' && (
                          <button
                            onClick={() => handleOpenEdit(cust)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          )}
                          {/* Xóa - chỉ Chủ */}
                          {normalizeRole(user?.role) === 'chu' && (
                          <button
                            onClick={() => {
                              if (confirm(`Bạn chắc chắn muốn xóa khách hàng "${cust.name}"?`)) {
                                deleteCustomer(cust.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa khách hàng"
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
            <span className="font-semibold">{totalItems}</span> khách hàng
          </div>

          {/* Page numbers */}
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

          {/* Page size dropdown */}
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
            <span>khách hàng/trang</span>
          </div>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 font-sans">
                {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Thị Mai"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ví dụ: 0933 003 995"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="text"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  placeholder="dd/mm/yyyy (Ví dụ: 12/05/2005)"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nhóm khách hàng
                  </label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026]"
                  >
                    <option value="Khách mới">Khách mới</option>
                    <option value="Khách quen">Khách quen</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nguồn khách
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026]"
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="Giới thiệu">Giới thiệu</option>
                    <option value="Tiktok">Tiktok</option>
                    <option value="Website">Website</option>
                    <option value="Khách cũ">Khách cũ</option>
                    <option value="Tại quầy">Tại quầy</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E60026] hover:bg-[#c90021] text-white rounded-xl text-sm font-semibold shadow-md shadow-rose-600/20"
                >
                  {editingCustomer ? 'Cập nhật' : 'Lưu khách hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Invoices History Modal */}
      {viewHistoryCust && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-lg text-gray-900 font-sans">
                  Lịch sử hóa đơn: {viewHistoryCust.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">SĐT: {viewHistoryCust.phone}</p>
              </div>
              <button
                onClick={() => setViewHistoryCust(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              {(() => {
                const custInvoices = invoices.filter(
                  inv => inv.customerPhone.replace(/\s+/g, '') === viewHistoryCust.phone.replace(/\s+/g, '') ||
                         inv.customerName.toLowerCase() === viewHistoryCust.name.toLowerCase()
                );
                if (custInvoices.length === 0) {
                  return <p className="py-8 text-center text-gray-400 text-sm">Chưa có hóa đơn nào cho khách hàng này.</p>;
                }
                return (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 text-xs font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Mã HD</th>
                        <th className="py-2.5 px-3">Ngày</th>
                        <th className="py-2.5 px-3">Dịch vụ</th>
                        <th className="py-2.5 px-3 text-right">Tổng tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {custInvoices.map(inv => (
                        <tr key={inv.id}>
                          <td className="py-2.5 px-3 font-semibold text-[#E60026]">{inv.code}</td>
                          <td className="py-2.5 px-3 text-gray-600">{inv.date}</td>
                          <td className="py-2.5 px-3">{inv.serviceSummary}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#E60026]">{formatVND(inv.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
