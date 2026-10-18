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
  FileText,
  TrendingUp
} from 'lucide-react';
import CalendarDatePicker from './CalendarDatePicker';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currencyUtils';

export default function TabExpenses() {
  const {
    expenses,
    addExpense,
    deleteExpense,
    loadData,
    formatVND
  } = useApp();

  // Filters state
  const [timeMode, setTimeMode] = useState('Ngày'); // 'Ngày' | 'Tháng' | 'Tất cả'
  const [selectedDay, setSelectedDay] = useState('17/10/2026');
  const [selectedMonth, setSelectedMonth] = useState('10/2026');
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

  // Default seed list with 4 required categories: marketing, mặt bằng, mỹ phẩm, nhân sự
  const initialSortedExpenses = [
    { id: 1, date: '17/10/2026', content: 'Quảng cáo Facebook & Fanpage', category: 'Marketing', amount: 2000000, note: 'Chạy quảng cáo tuần 3' },
    { id: 2, date: '16/10/2026', content: 'Tiền điện nước mặt bằng', category: 'Mặt bằng', amount: 1800000, note: 'Tháng 10/2026' },
    { id: 3, date: '15/10/2026', content: 'Tiền thuê mặt bằng', category: 'Mặt bằng', amount: 15000000, note: 'Tháng 10/2026' },
    { id: 4, date: '14/10/2026', content: 'Đồng phục & phụ cấp nhân sự', category: 'Nhân sự', amount: 3500000, note: 'Đồng phục nhân viên' },
    { id: 5, date: '14/10/2026', content: 'Tài liệu đào tạo nhân sự', category: 'Nhân sự', amount: 1200000, note: 'In tờ rơi, giáo trình' },
    { id: 6, date: '13/10/2026', content: 'Mua mỹ phẩm & dưỡng chất spa', category: 'Mỹ phẩm', amount: 4800000, note: 'Mỹ phẩm dùng lớp học & khách hàng' },
    { id: 7, date: '12/10/2026', content: 'Mỹ phẩm điều trị chuyên sâu', category: 'Mỹ phẩm', amount: 1500000, note: 'Mỹ phẩm tái tạo da' },
    { id: 8, date: '10/10/2026', content: 'Quảng cáo TikTok Ads', category: 'Marketing', amount: 300000, note: 'Tháng 10/2026' }
  ];

  const allExpenses = useMemo(() => {
    return Array.isArray(expenses) ? [...expenses].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0)) : [];
  }, [expenses]);

  // Extract available days and months
  const { availableMonths, availableDays } = useMemo(() => {
    const monthsSet = new Set(['10/2026']);
    const daysSet = new Set(['17/10/2026']);

    allExpenses.forEach(exp => {
      if (exp.date) {
        daysSet.add(exp.date);
        const parts = exp.date.split('/');
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
  }, [allExpenses]);

  // Effective day & month for summary cards
  const effectiveDay = (timeMode === 'Ngày' && selectedDay && selectedDay !== 'all') ? selectedDay : (availableDays[0] || '17/10/2026');
  const effectiveMonth = (timeMode === 'Tháng' && selectedMonth && selectedMonth !== 'all') ? selectedMonth : (availableMonths[0] || '10/2026');

  // Daily statistics
  const dailyExpenses = useMemo(() => {
    return allExpenses.filter(e => e.date === effectiveDay);
  }, [allExpenses, effectiveDay]);
  const dayTotal = useMemo(() => {
    return dailyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [dailyExpenses]);

  // Monthly statistics
  const monthlyExpenses = useMemo(() => {
    return allExpenses.filter(e => (e.date || '').includes(effectiveMonth));
  }, [allExpenses, effectiveMonth]);
  const monthTotal = useMemo(() => {
    return monthlyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [monthlyExpenses]);

  // Filtered expenses for table
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(e => {
      const matchCat = categoryFilter === 'Tất cả' || (e.category || '').toLowerCase() === categoryFilter.toLowerCase();
      let matchDate = true;
      if (timeMode === 'Ngày' && selectedDay && selectedDay !== 'all') {
        matchDate = e.date === selectedDay;
      } else if (timeMode === 'Tháng' && selectedMonth && selectedMonth !== 'all') {
        matchDate = (e.date || '').includes(selectedMonth);
      }
      return matchCat && matchDate;
    });
  }, [allExpenses, categoryFilter, timeMode, selectedDay, selectedMonth]);

  // Pagination calculation
  const totalItems = filteredExpenses.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExpenses.slice(start, start + pageSize);
  }, [filteredExpenses, currentPage, pageSize]);

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedExpenses.length && paginatedExpenses.length > 0) {
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
      date: effectiveDay || '17/10/2026',
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

  // Render Category Badge for marketing, mặt bằng, mỹ phẩm, nhân sự
  const renderCategoryBadge = (category) => {
    const norm = (category || '').toLowerCase();
    switch (norm) {
      case 'marketing':
        return (
          <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-[#FFEBEF] text-[#E60026]">
            Marketing
          </span>
        );
      case 'mặt bằng':
        return (
          <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-[#FFF0E0] text-[#E67E22]">
            Mặt bằng
          </span>
        );
      case 'mỹ phẩm':
        return (
          <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-[#F3E8FF] text-[#9333EA]">
            Mỹ phẩm
          </span>
        );
      case 'nhân sự':
        return (
          <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-[#E5F3FF] text-[#2B7FFF]">
            Nhân sự
          </span>
        );
      default:
        return (
          <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-[#F0F2F5] text-[#64748B]">
            {category}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 2 Summary Report Cards (Chi phí ngày & Tổng chi phí tháng) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ô 1: Tổng chi phí ngày */}
        <div className="bg-white rounded-2xl p-5 border border-rose-100/90 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="absolute -right-3 -top-3 w-20 h-20 bg-rose-50 rounded-full opacity-60 group-hover:scale-110 transition-transform"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 font-sans">
                Chi phí ngày ({effectiveDay})
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#C0001A] flex items-center justify-center shadow-2xs">
                <Calendar className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-[#C0001A] font-sans tracking-tight">
                {formatVND ? formatVND(dayTotal) : `${dayTotal.toLocaleString('vi-VN')} đ`}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {dailyExpenses.length} khoản chi trong ngày
              </p>
            </div>
          </div>
        </div>

        {/* Ô 2: Tổng chi phí tháng */}
        <div className="bg-white rounded-2xl p-5 border border-indigo-100/90 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="absolute -right-3 -top-3 w-20 h-20 bg-indigo-50 rounded-full opacity-60 group-hover:scale-110 transition-transform"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 font-sans">
                Tổng chi phí tháng ({effectiveMonth})
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
                <TrendingUp className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-indigo-700 font-sans tracking-tight">
                {formatVND ? formatVND(monthTotal) : `${monthTotal.toLocaleString('vi-VN')} đ`}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {monthlyExpenses.length} khoản chi trong tháng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section Card with CalendarDatePicker */}
      <div className="bg-[#FFF5F6] rounded-2xl p-4 sm:p-5 border border-rose-100/60 shadow-xs flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          {/* Chế độ lọc thời gian */}
          <div>
            <span className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans">
              Thời gian
            </span>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200/60 shadow-2xs">
              <button
                type="button"
                onClick={() => { setTimeMode('Ngày'); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeMode === 'Ngày' ? 'bg-[#C0001A] text-white shadow-xs' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Lọc theo ngày
              </button>
              <button
                type="button"
                onClick={() => { setTimeMode('Tháng'); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeMode === 'Tháng' ? 'bg-[#C0001A] text-white shadow-xs' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Lọc theo tháng
              </button>
              <button
                type="button"
                onClick={() => { setTimeMode('Tất cả'); setSelectedDay('all'); setSelectedMonth('all'); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeMode === 'Tất cả' ? 'bg-[#C0001A] text-white shadow-xs' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Tất cả
              </button>
            </div>
          </div>

          {/* Lọc theo ngày - Datepicker popup exact to reference image 1 */}
          {timeMode === 'Ngày' && (
            <div>
              <span className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C0001A]" />
                <span>Lịch từng ngày trong tháng</span>
              </span>
              <CalendarDatePicker
                value={selectedDay}
                onChange={(d) => { setSelectedDay(d); setCurrentPage(1); }}
                placeholder="Chọn ngày chi..."
              />
            </div>
          )}

          {/* Lọc theo tháng */}
          {timeMode === 'Tháng' && (
            <div>
              <span className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C0001A]" />
                <span>Chọn tháng</span>
              </span>
              <div className="relative min-w-[170px]">
                <select
                  value={selectedMonth}
                  onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-white rounded-lg px-3.5 py-2 pr-8 border border-rose-200/90 shadow-2xs text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-rose-500 appearance-none"
                >
                  <option value="all">Tất cả các tháng</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m}>Tháng {m}</option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
                  ▼
                </div>
              </div>
            </div>
          )}

          {/* Danh mục (Marketing, Mặt bằng, Mỹ phẩm, Nhân sự) */}
          <div>
            <span className="block text-xs font-semibold text-[#0F172A] mb-1.5 font-sans">
              Danh mục
            </span>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="bg-white rounded-lg px-3.5 py-2 pr-8 border border-gray-200/60 shadow-2xs text-xs font-medium text-gray-800 focus:outline-none appearance-none min-w-[160px]"
              >
                <option value="Tất cả">Tất cả danh mục</option>
                <option value="Marketing">Marketing</option>
                <option value="Mặt bằng">Mặt bằng</option>
                <option value="Mỹ phẩm">Mỹ phẩm</option>
                <option value="Nhân sự">Nhân sự</option>
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
            type="button"
            onClick={() => {
              setTimeMode('Ngày');
              setSelectedDay('17/10/2026');
              setSelectedMonth('10/2026');
              setCategoryFilter('Tất cả');
              setCurrentPage(1);
              loadData();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF0F2] hover:bg-rose-100/80 border border-rose-200/80 text-[#C0001A] rounded-lg text-xs font-semibold transition-all shadow-2xs"
          >
            <RotateCw className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
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
            Danh sách chi phí ({filteredExpenses.length})
          </h2>
        </div>

        {/* Table Body Card */}
        <div className="bg-white rounded-2xl border border-gray-100/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-[#0F172A] font-sans border-b border-gray-100">
                <tr>
                  <th className="py-3.5 pl-6 pr-2 w-10">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === paginatedExpenses.length && paginatedExpenses.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-[#C0001A] focus:ring-rose-400 accent-[#C0001A]"
                    />
                  </th>
                  <th className="py-3.5 px-3 w-12 text-gray-800 font-bold">STT</th>
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
                {paginatedExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400 font-sans">
                      Không tìm thấy khoản chi phí nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  paginatedExpenses.map((exp, idx) => {
                    const isChecked = selectedRows.includes(exp.id);
                    const itemStt = (currentPage - 1) * pageSize + idx + 1;
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
                        <td className="py-3.5 px-3 text-gray-800 font-medium font-sans">{itemStt}</td>
                        <td className="py-3.5 px-4 text-gray-700 font-medium font-sans">{exp.date}</td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900 font-sans">{exp.content}</td>
                        <td className="py-3.5 px-4">{renderCategoryBadge(exp.category)}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-[#C0001A] text-xs font-sans">
                            {Number(exp.amount).toLocaleString('en-US')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 text-xs font-sans">{exp.note}</td>
                        <td className="py-3.5 pr-6 pl-4 text-center relative">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() => setActiveMenuId(activeMenuId === exp.id ? null : exp.id)}
                              className="p-1 text-gray-500 hover:text-gray-800 rounded transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {activeMenuId === exp.id && (
                              <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 text-left text-xs">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(exp)}
                                  className="w-full px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Chỉnh sửa</span>
                                </button>
                                <button
                                  type="button"
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="pt-2 px-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#334155] font-sans">
          <div>
            Hiển thị {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalItems)} / {totalItems} chi phí
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 shadow-2xs disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                  currentPage === page
                    ? 'bg-[#C0001A] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-2xs'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 shadow-2xs disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
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
              <h3 className="font-bold text-lg text-gray-900 font-sans">
                {editingExpense ? 'Chỉnh sửa khoản chi phí' : 'Thêm khoản chi phí mới'}
              </h3>
              <button
                type="button"
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
                  placeholder="Ví dụ: Quảng cáo Facebook, Tiền thuê mặt bằng..."
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
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Mặt bằng">Mặt bằng</option>
                    <option value="Mỹ phẩm">Mỹ phẩm</option>
                    <option value="Nhân sự">Nhân sự</option>
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
                  type="text"
                  required
                  value={formatCurrencyInput(formData.amount)}
                  onChange={(e) => setFormData({ ...formData, amount: parseCurrencyInput(e.target.value) })}
                  placeholder="1.500.000"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-[#C0001A] focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
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
