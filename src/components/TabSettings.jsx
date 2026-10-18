import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, ShieldCheck, Sparkles, Building, Plus, Trash2, Check, User } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currencyUtils';

export default function TabSettings() {
  const {
    services,
    setServices,
    staff,
    user,
    switchRole,
    formatVND,
    formatNumber,
    addToast
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('services'); // 'services' | 'permissions' | 'spa'
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;
    const newService = {
      id: 'DV' + String(services.length + 1).padStart(2, '0'),
      name: newServiceName,
      price: Number(newServicePrice),
      category: 'Phun xăm & Chăm sóc da'
    };
    setServices([...services, newService]);
    setNewServiceName('');
    setNewServicePrice('');
    addToast('Đã thêm gói dịch vụ mới vào danh mục!', 'success');
  };

  const handleDeleteService = (id) => {
    setServices(services.filter(s => s.id !== id));
    addToast('Đã xóa dịch vụ.', 'info');
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
      <div className="flex items-center gap-3 border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('services')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeSubTab === 'services'
              ? 'border-[#E60026] text-[#E60026]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Gói dịch vụ & Bảng giá
        </button>
        <button
          onClick={() => setActiveSubTab('permissions')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeSubTab === 'permissions'
              ? 'border-[#E60026] text-[#E60026]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Phân quyền người dùng
        </button>
        <button
          onClick={() => setActiveSubTab('spa')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeSubTab === 'spa'
              ? 'border-[#E60026] text-[#E60026]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Thông tin Hiền Xinh Spa
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
                        <button
                          onClick={() => handleDeleteService(s.id)}
                          className="p-1 text-red-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
}
