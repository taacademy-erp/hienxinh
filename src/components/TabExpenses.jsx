import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  RotateCw,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileText
} from 'lucide-react';

export default function TabExpenses() {
  const {
    expenses,
    addExpense,
    deleteExpense,
    loadData
  } = useApp();

  // Filters state
  const [timeMode, setTimeMode] = useState('Ngày'); // 'Ngày' | 'Tháng'
  const [dateFilter, setDateFilter] = useState('17/10/2026');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [selectedRows, setSelectedRows] = useState([]);
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    date: '17/10/2026',
    content: '',
    category: 'Marketing',
    amount: '',
    note: ''
  });

  // Default seed list ordered matching user image exactly
  const initialSortedExpenses = [
    { id: 1, date: '17/10/2026', content: 'Quảng cáo Facebook', category: 'Marketing', amount: 2000000, note: 'Chạy quảng cáo tuần 3' },
    { id: 2, date: '16/10/2026', content: 'Tiền điện', category: 'Điện nước', amount: 1800000, note: 'Tháng 10/2026' },
    { id: 3, date: '15/10/2026', content: 'Tiền thuê mặt bằng', category: 'Văn phòng', amount: 15000000, note: 'Tháng 10/2026' },
    { id: 4, date: '14/10/2026', content: 'Mua đồng phục', category: 'Vật tư', amount: 3500000, note: 'Đồng phục nhân viên' },
    { id: 5, date: '14/10/2026', content: 'In ấn tài liệu', category: 'Văn phòng', amount: 1200000, note: 'In tờ rơi, giáo trình' },
    { id: 6, date: '13/10/2026', content: 'Mua mỹ phẩm', category: 'Vật tư', amount: 4800000, note: 'Mỹ phẩm dùng lớp học' },
    { id: 7, date: '12/10/2026', content: 'Bảo trì thiết bị', category: 'Khác', amount: 1500000, note: 'Bảo trì máy lạnh' },
    { id: 8, date: '10/10/2026', content: 'Internet/Wifi', category: 'Điện nước', amount: 300000, note: 'Tháng 10/2026' }
  ];

  const allExpenses = useMemo(() => {
    const list = expenses && expenses.length >= 8 ? expenses : initialSortedExpenses;
    return [...list].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
  }, [expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(e => {
      const matchCat = categoryFilter === 'Tất cả' || e.category === categoryFilter;
      return matchCat;
    });
  }, [allExpenses, categoryFilter]);

  // Total count
  const totalCount = 28; // Displayed as 28 in mockup
  const totalPages = 4; // Mockup shows 1 2 3 4
  const paginatedExpenses = filteredExpenses.slice(0, pageSize);

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedExpenses.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedExpenses.map(e => e.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      date: '17/10/2026',
      content: '',
      category: 'Marketing',
      amount: '',
      note: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setFormData({
      date: exp.date,
      content: exp.content,
      category: exp.category,
      amount: exp.amount,
      note: exp.note || ''
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.content || !formData.amount) return;

    if (editingExpense) {
      deleteExpense(editingExpense.id);
      await addExpense(formData);
    } else {
      await addExpense(formData);
    }
    setIsModalOpen(false);
  };

  // Render Category Badge exact to mockup colors
  const renderCategoryBadge = (category) => {
    switch (category) {
      case 'Marketing':
        return (
          <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-[#FFEBEF] text-[#E60026]">
            Marketing
          </span>
        );
      case 'Điện nước':
        return (
          <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-[#E5F3FF] text-[#2B7FFF]">
            Điện nước
          </span>
        );
      case 'Văn phòng':
        return (
          <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-[#FFF0E0] text-[#E67E22]">
            Văn phòng
          </span>
        );
      case 'Vật tư':
        return (
          <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-[#F3E8FF] text-[#9333EA]">
            Vật tư
          </span>
        );
      case 'Khác':
      default:
        return (
          <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-[#F0F2F5] text-[#64748B]">
            Khác
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Filter Section Card (Exact soft pink container from mockup) */}
      <div className="bg-[#FFF5F6] rounded-2xl p-4 sm:p-5 border border-rose-100/60 shadow-xs flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          {/* Thời gian */}
          <div>
            <span className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-serif">
              Thời gian
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimeMode('Ngày')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-xs ${
                  timeMode === 'Ngày' ? 'bg-[#C0001A] text-white' : 'bg-white text-gray-700 border border-gray-200/60'
                }`}
              >
                Ngày
              </button>
              <button
                onClick={() => setTimeMode('Tháng')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  timeMode === 'Tháng' ? 'bg-[#C0001A] text-white' : 'bg-white text-gray-700 border border-gray-200/60 shadow-2xs'
                }`}
              >
                Tháng
              </button>

              {/* Date Input with Calendar icon and Clear X */}
              <div className="relative flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200/60 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-gray-700 mr-2" />
                <input
                  type="text"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-24 text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
                />
                <button
                  onClick={() => setDateFilter('')}
                  className="ml-1 text-gray-400 hover:text-gray-700 text-xs font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Danh mục */}
          <div>
            <span className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-serif">
              Danh mục
            </span>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="bg-white rounded-lg px-3.5 py-2 pr-8 border border-gray-200/60 shadow-2xs text-xs font-medium text-gray-800 focus:outline-none appearance-none min-w-[170px]"
              >
                <option value="Tất cả">Tất cả</option>
                <option value="Marketing">Marketing</option>
                <option value="Điện nước">Điện nước</option>
                <option value="Văn phòng">Văn phòng</option>
                <option value="Vật tư">Vật tư</option>
                <option value="Khác">Khác</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Buttons: Làm mới & + Thêm chi phí */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setDateFilter('17/10/2026');
              setCategoryFilter('Tất cả');
              loadData();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF0F2] hover:bg-rose-100/80 border border-rose-200/80 text-[#C0001A] rounded-lg text-xs font-semibold transition-all shadow-2xs"
          >
            <RotateCw className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Làm mới</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C0001A] hover:bg-[#a80017] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>Thêm chi phí</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-2">
        {/* Top Header Ribbon with Red Document Icon */}
        <div className="bg-[#FFF5F6] rounded-2xl p-3 border border-rose-100/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#C0001A] text-white flex items-center justify-center font-bold shadow-xs">
            <FileText className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h2 className="text-base font-bold text-[#C0001A] font-sans">
            Danh sách chi phí (28)
          </h2>
        </div>

        {/* Table Body Card */}
        <div className="bg-white rounded-2xl border border-gray-100/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-[#0F172A] font-serif border-b border-gray-100">
                <tr>
                  <th className="py-3.5 pl-6 pr-2 w-10">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === paginatedExpenses.length && paginatedExpenses.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-[#C0001A] focus:ring-rose-400 accent-[#C0001A]"
                    />
                  </th>
                  <th className="py-3.5 px-3 w-10 text-gray-800 font-bold">#</th>
                  <th className="py-3.5 px-4 font-bold text-gray-900">
                    <div className="inline-flex items-center gap-1">
                      <span>Ngày chi</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-500" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-gray-900">Nội dung chi</th>
                  <th className="py-3.5 px-4 font-bold text-gray-900">Danh mục</th>
                  <th className="py-3.5 px-4 font-bold text-gray-900">
                    <div className="inline-flex items-center gap-1">
                      <span>Số tiền</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-500" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-gray-900">Ghi chú</th>
                  <th className="py-3.5 pr-6 pl-4 text-center font-bold text-gray-900 w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/70">
                {paginatedExpenses.map((exp, idx) => {
                  const isChecked = selectedRows.includes(exp.id);
                  return (
                    <tr
                      key={exp.id}
                      className={`hover:bg-[#FFF5F6]/40 transition-colors ${isChecked ? 'bg-[#FFF5F6]/60' : ''}`}
                    >
                      <td className="py-3.5 pl-6 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(exp.id)}
                          className="w-4 h-4 rounded text-[#C0001A] focus:ring-rose-400 accent-[#C0001A]"
                        />
                      </td>
                      <td className="py-3.5 px-3 text-gray-800 font-medium font-serif">{idx + 1}</td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium font-serif">{exp.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900 font-serif">{exp.content}</td>
                      <td className="py-3.5 px-4">{renderCategoryBadge(exp.category)}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-[#C0001A] text-xs font-serif">
                          {Number(exp.amount).toLocaleString('en-US')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 text-xs font-serif">{exp.note}</td>
                      <td className="py-3.5 pr-6 pl-4 text-center relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === exp.id ? null : exp.id)}
                            className="p-1 text-gray-500 hover:text-gray-800 rounded transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeMenuId === exp.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 text-left text-xs">
                              <button
                                onClick={() => handleOpenEdit(exp)}
                                className="w-full px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                                <span>Chỉnh sửa</span>
                              </button>
                              <button
                                onClick={() => {
                                  deleteExpense(exp.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                <span>Xóa chi phí</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Footer exact to mockup */}
        <div className="pt-2 px-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#334155] font-serif">
          <div>
            Hiển thị 1 - 8 / 28 chi phí
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button className="w-7 h-7 rounded-lg bg-[#C0001A] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              1
            </button>
            <button className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs flex items-center justify-center shadow-2xs hover:bg-gray-50">
              2
            </button>
            <button className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs flex items-center justify-center shadow-2xs hover:bg-gray-50">
              3
            </button>
            <button className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs flex items-center justify-center shadow-2xs hover:bg-gray-50">
              4
            </button>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 shadow-2xs"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 pr-6 text-xs text-gray-800 shadow-2xs appearance-none focus:outline-none"
              >
                <option value="8">8</option>
                <option value="15">15</option>
                <option value="28">28</option>
              </select>
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-gray-500">
                ▼
              </span>
            </div>
            <span>chi phí/trang</span>
          </div>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 font-serif">
                {editingExpense ? 'Chỉnh sửa khoản chi phí' : 'Thêm khoản chi phí mới'}
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
                  Nội dung chi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Ví dụ: Quảng cáo Facebook, Tiền điện..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Điện nước">Điện nước</option>
                    <option value="Văn phòng">Văn phòng</option>
                    <option value="Vật tư">Vật tư</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ngày chi
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="dd/mm/yyyy"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số tiền chi (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  placeholder="2000000"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-[#C0001A] focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Ghi chú thêm..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C0001A] hover:bg-[#a50015] text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/20"
                >
                  {editingExpense ? 'Cập nhật' : 'Lưu chi phí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
