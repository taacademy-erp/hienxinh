import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, ShieldCheck, Sparkles, Building, Plus, Trash2, Edit2, X, Check, User, Users, CreditCard, Building2, Phone, Percent } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currencyUtils';

export default function TabSettings() {
  const {
    services,
    setServices,
    addService,
    updateService,
    deleteService,
    staff,
    addStaff,
    deleteStaff,
    bankAccounts,
    addBankAccount,
    deleteBankAccount,
    user,
    normalizeRole,
    switchRole,
    formatVND,
    formatNumber,
    addToast
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('services'); // 'services' | 'staff' | 'bank' | 'permissions' | 'spa'
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Editing state for a service
  const [editingService, setEditingService] = useState(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editServicePrice, setEditServicePrice] = useState('');

  // Staff form state
  const [staffForm, setStaffForm] = useState({
    name: '',
    role: 'Kỹ thuật viên chính',
    phone: '',
    commissionRate: 5
  });

  // Bank account form state
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    name: ''
  });

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;
    
    // Tìm mã DV cao nhất để tránh trùng lặp PK
    let maxId = 15;
    services.forEach(s => {
      const m = (s.id || '').match(/^DV(\d+)$/i);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > maxId) maxId = n;
      }
    });

    const newService = {
      id: 'DV' + String(maxId + 1).padStart(2, '0'),
      name: newServiceName,
      price: Number(newServicePrice),
      category: 'Phun xăm & Chăm sóc da'
    };
    if (addService) {
      await addService(newService);
    } else {
      setServices([...services, newService]);
      addToast('Đã thêm gói dịch vụ mới vào danh mục!', 'success');
    }
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleOpenEdit = (s) => {
    setEditingService(s);
    setEditServiceName(s.name);
    setEditServicePrice(s.price);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingService || !editServiceName || editServicePrice === '') return;
    const updated = {
      name: editServiceName,
      price: Number(editServicePrice)
    };
    if (updateService) {
      await updateService(editingService.id, updated);
    } else {
      setServices(services.map(s => s.id === editingService.id ? { ...s, ...updated } : s));
      addToast('Đã cập nhật dịch vụ thành công!', 'success');
    }
    setEditingService(null);
  };

  const handleDeleteService = async (id) => {
    if (deleteService) {
      await deleteService(id);
    } else {
      setServices(services.filter(s => s.id !== id));
      addToast('Đã xóa dịch vụ.', 'info');
    }
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffForm.name.trim()) {
      addToast('Vui lòng nhập tên nhân viên!', 'error');
      return;
    }
    await addStaff(staffForm);
    setStaffForm({
      name: '',
      role: 'Kỹ thuật viên chính',
      phone: '',
      commissionRate: 5
    });
  };

  const handleDeleteStaff = async (id, name) => {
    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên "${name}" khỏi hệ thống không?`)) {
      await deleteStaff(id);
    }
  };

  const handleAddBankSubmit = async (e) => {
    e.preventDefault();
    if (!bankForm.bankName.trim() || !bankForm.accountNumber.trim()) {
      addToast('Vui lòng nhập tên ngân hàng và số tài khoản!', 'error');
      return;
    }
    await addBankAccount(bankForm);
    setBankForm({
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      name: ''
    });
  };

  const handleDeleteBank = async (id, name, accNum) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ngân hàng "${name}" (${accNum || 'Tiền mặt'}) không?`)) {
      await deleteBankAccount(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-sans text-gray-900 tracking-tight">
          Cài đặt hệ thống
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý cấu hình dịch vụ, phân quyền tài khoản và thông tin trung tâm làm đẹp.
        </p>
      </div>

      {/* Sub tabs */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-gray-200 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('services')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === 'services'
              ? 'border-[#E60026] text-[#E60026]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Gói dịch vụ & Bảng giá ({services.length})
        </button>
        <button
          onClick={() => setActiveSubTab('staff')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === 'staff'
              ? 'border-[#E60026] text-[#E60026]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Quản lý nhân viên ({staff.length})
        </button>
        <button
          onClick={() => setActiveSubTab('bank')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === 'bank'
              ? 'border-[#E60026] text-[#E60026]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Tài khoản ngân hàng ({bankAccounts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('permissions')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === 'permissions'
              ? 'border-[#E60026] text-[#E60026]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Phân quyền người dùng
        </button>
        <button
          onClick={() => setActiveSubTab('spa')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === 'spa'
              ? 'border-[#E60026] text-[#E60026]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Thông tin Spa
        </button>
      </div>

      {/* SUBTAB 1: Services */}
      {activeSubTab === 'services' && (
        <div className="space-y-6">
          {/* Add Service Box */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#E60026]" />
              <span>Thêm gói dịch vụ mới</span>
            </h3>
            <form onSubmit={handleAddService} className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Tên gói dịch vụ (Ví dụ: Chân mày sợi nét siêu thực)"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="flex-1 min-w-[280px] px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <input
                type="text"
                placeholder="Giá niêm yết (VNĐ)"
                value={formatCurrencyInput(newServicePrice)}
                onChange={(e) => setNewServicePrice(parseCurrencyInput(e.target.value))}
                className="w-48 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-[#E60026] hover:bg-[#c90021] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Lưu dịch vụ
              </button>
            </form>
          </div>

          {/* List of Services */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">
                Danh sách gói dịch vụ sẵn sàng ({services.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4 w-16">Mã</th>
                    <th className="py-3 px-4">Tên dịch vụ</th>
                    <th className="py-3 px-4">Danh mục</th>
                    <th className="py-3 px-4 text-right">Giá niêm yết</th>
                    <th className="py-3 px-4 text-center w-20">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {services.map(s => (
                    <tr key={s.id} className="hover:bg-rose-50/20">
                      <td className="py-3 px-4 font-sans font-bold text-gray-500">{s.id}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{s.name}</td>
                      <td className="py-3 px-4 text-gray-600">{s.category || 'Làm đẹp'}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-[#E60026] text-sm">
                        {formatNumber(s.price)} đ
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Chỉnh sửa dịch vụ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn chắc chắn muốn xóa dịch vụ "${s.name}"?`)) {
                                handleDeleteService(s.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa dịch vụ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: Staff Management */}
      {activeSubTab === 'staff' && (
        <div className="space-y-6">
          {/* Add Staff Box */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#E60026]" />
              <span>Thêm nhân viên mới vào hệ thống</span>
            </h3>
            <form onSubmit={handleAddStaffSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Thu Trang"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Chức vụ / Vai trò
                </label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="Kỹ thuật viên chính">Kỹ thuật viên chính</option>
                  <option value="Kỹ thuật viên phun xăm">Kỹ thuật viên phun xăm</option>
                  <option value="Chuyên viên chăm sóc da">Chuyên viên chăm sóc da</option>
                  <option value="Tư vấn Online & Trực tiếp">Tư vấn Online & Trực tiếp</option>
                  <option value="Tư vấn Online">Tư vấn Online</option>
                  <option value="Tư vấn trực tiếp">Tư vấn trực tiếp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  placeholder="09xx xxx xxx"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Hoa hồng (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={staffForm.commissionRate}
                    onChange={(e) => setStaffForm({ ...staffForm, commissionRate: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 h-[38px] bg-[#E60026] hover:bg-[#c90021] text-white rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
                >
                  Lưu nhân viên
                </button>
              </div>
            </form>
          </div>

          {/* List of Staff */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-[#E60026]" />
                <span>Danh sách nhân sự & Kỹ thuật viên ({staff.length})</span>
              </h3>
              <span className="text-xs text-gray-500">Xóa nhân viên khi cần thiết</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4 w-16">Mã</th>
                    <th className="py-3 px-4">Họ và tên</th>
                    <th className="py-3 px-4">Chức vụ / Vai trò</th>
                    <th className="py-3 px-4">Số điện thoại</th>
                    <th className="py-3 px-4 text-center">Hoa hồng mặc định</th>
                    <th className="py-3 px-4 text-center w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staff.map(s => (
                    <tr key={s.id} className="hover:bg-rose-50/20">
                      <td className="py-3 px-4 font-sans font-bold text-gray-500">{s.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full ${s.color || 'bg-rose-600'} text-white font-bold flex items-center justify-center text-xs shadow-2xs`}>
                            {s.initials || (s.name || '').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-700">{s.role}</td>
                      <td className="py-3 px-4 font-sans text-gray-600">{s.phone || '—'}</td>
                      <td className="py-3 px-4 text-center font-bold text-[#E60026] font-sans">
                        {s.commissionRate || 5}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteStaff(s.id, s.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors font-medium shadow-2xs"
                          title="Xóa nhân viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: Bank Accounts Management */}
      {activeSubTab === 'bank' && (
        <div className="space-y-6">
          {/* Add Bank Account Box */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#E60026]" />
              <span>Thêm tài khoản ngân hàng nhận tiền</span>
            </h3>
            <form onSubmit={handleAddBankSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tên ngân hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Vietcombank, Techcombank, MB..."
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số tài khoản (STK) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 1903668899..."
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Chủ tài khoản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="NGUYEN THI HIEN"
                  value={bankForm.accountHolder}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans font-semibold"
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tên hiển thị gọi nhớ
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Vietcombank Spa"
                    value={bankForm.name}
                    onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 h-[38px] bg-[#E60026] hover:bg-[#c90021] text-white rounded-xl text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
                >
                  Lưu tài khoản
                </button>
              </div>
            </form>
          </div>

          {/* List of Bank Accounts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#E60026]" />
                <span>Danh sách tài khoản ngân hàng nhận tiền ({bankAccounts.length})</span>
              </h3>
              <span className="text-xs text-gray-500">Xóa những tài khoản không dùng</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Tên hiển thị</th>
                    <th className="py-3 px-4">Ngân hàng</th>
                    <th className="py-3 px-4">Số tài khoản</th>
                    <th className="py-3 px-4">Chủ tài khoản</th>
                    <th className="py-3 px-4 text-center w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bankAccounts.map(b => (
                    <tr key={b.id} className="hover:bg-rose-50/20">
                      <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#E60026] shrink-0" />
                        <span>{b.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-700">{b.bankName || b.name}</td>
                      <td className="py-3.5 px-4 font-sans font-bold text-[#E60026]">{b.accountNumber || '—'}</td>
                      <td className="py-3.5 px-4 uppercase font-semibold text-gray-800">{b.accountHolder || '—'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDeleteBank(b.id, b.name, b.accountNumber)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors font-medium shadow-2xs"
                          title="Xóa tài khoản không dùng"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Role Permissions Matrix */}
      {activeSubTab === 'permissions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-base text-gray-900 font-sans flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-[#E60026]" />
              <span>Ma trận phân quyền người dùng (Chuẩn xác theo yêu cầu)</span>
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Hệ thống tự động kiểm soát quyền truy cập ở cấp độ giao diện và API máy chủ.
            </p>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FFF1F2] text-[#880013] text-xs font-bold uppercase">
                  <tr>
                    <th className="py-3.5 px-6">TÍNH NĂNG</th>
                    <th className="py-3.5 px-6 text-center">CHỦ</th>
                    <th className="py-3.5 px-6 text-center">QUẢN LÝ (QL)</th>
                    <th className="py-3.5 px-6 text-center">NHÂN VIÊN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-6 font-semibold text-gray-900">Trang chủ</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x)</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x)</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (X)</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-6 font-semibold text-gray-900">Khách hàng</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x)</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x)</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (X)</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-6 font-semibold text-gray-900">Nhập hóa đơn</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x)</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x)</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (X)</td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-rose-50/20">
                    <td className="py-3 px-6 font-semibold text-gray-900">Danh sách hóa đơn</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x)</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x)</td>
                    <td className="py-3 px-6 text-center text-red-500 font-bold">✕ (Không)</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-6 font-semibold text-gray-900">Chi phí</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x)</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x)</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x)</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-6 font-semibold text-gray-900">Báo cáo hoa hồng</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x)</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x)</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (X)</td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-rose-50/30">
                    <td className="py-3 px-6 font-semibold text-[#E60026]">Báo cáo HĐKD</td>
                    <td className="py-3 px-6 text-center text-emerald-600 font-bold">✓ (x - Độc quyền)</td>
                    <td className="py-3 px-6 text-center text-red-500 font-bold">✕ (Không)</td>
                    <td className="py-3 px-6 text-center text-red-500 font-bold">✕ (Không)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Test quick switch */}
            <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-xs font-bold text-gray-700 mb-2">Chuyển vai trò thử nghiệm trực tiếp:</p>
              <div className="flex gap-3">
                <button
                  onClick={() => switchRole('chu')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    user?.role === 'chu' ? 'bg-[#E60026] text-white shadow-md' : 'bg-white border text-gray-700'
                  }`}
                >
                  Đăng nhập quyền Chủ
                </button>
                <button
                  onClick={() => switchRole('ql')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    user?.role === 'ql' ? 'bg-[#E60026] text-white shadow-md' : 'bg-white border text-gray-700'
                  }`}
                >
                  Đăng nhập quyền Quản lý (QL)
                </button>
                <button
                  onClick={() => switchRole('nhanvien')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    user?.role === 'nhanvien' ? 'bg-[#E60026] text-white shadow-md' : 'bg-white border text-gray-700'
                  }`}
                >
                  Đăng nhập quyền Nhân viên
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Spa info */}
      {activeSubTab === 'spa' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 max-w-xl">
          <h3 className="font-bold text-base text-gray-900 font-sans flex items-center gap-2">
            <Building className="w-5 h-5 text-[#E60026]" />
            <span>Thông tin Hiền Xinh Beauty Center</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-600 mb-1">Tên trung tâm</label>
              <input
                type="text"
                readOnly
                value="HIỀN XINH BEAUTY CENTER"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[#E60026]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-600 mb-1">Khẩu hiệu / Slogan</label>
              <input
                type="text"
                readOnly
                value="Quản lý tinh gọn – Chăm sóc tận tâm"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-600 mb-1">Số điện thoại Hotline</label>
              <input
                type="text"
                readOnly
                value="0988 888 999"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-600 mb-1">Địa chỉ</label>
              <input
                type="text"
                readOnly
                value="Việt Nam"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900 font-sans">
                Chỉnh sửa dịch vụ <span className="text-[#E60026]">({editingService.id})</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tên dịch vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editServiceName}
                  onChange={(e) => setEditServiceName(e.target.value)}
                  placeholder="Nhập tên dịch vụ..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Giá niêm yết (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formatCurrencyInput(editServicePrice)}
                  onChange={(e) => setEditServicePrice(parseCurrencyInput(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-[#E60026] focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E60026] hover:bg-[#c90021] text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/20"
                >
                  Cập nhật dịch vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
