import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  FileSpreadsheet,
  CreditCard,
  Plus,
  Trash2,
  Bookmark,
  Lock,
  Calendar,
  Sparkles,
  Search
} from 'lucide-react';

export default function TabCreateInvoice() {
  const {
    services: availableServices,
    staff: availableStaff,
    customers,
    addInvoice,
    formatVND,
    formatNumber,
    addToast
  } = useApp();

  // Customer fields
  const [customerName, setCustomerName] = useState('Nguyễn Thị Mai');
  const [customerPhone, setCustomerPhone] = useState('0933003995');
  const [customerDob, setCustomerDob] = useState('12/05/2005');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);

  // Service line items
  const [serviceRows, setServiceRows] = useState([
    {
      id: 1,
      serviceName: 'Khóa Model Kids (20 buổi)',
      listedPrice: 10000000,
      discountPrice: 8000000,
      total: 8000000,
      onlineStaff: 'Nguyễn Thảo',
      onlineCommissionRate: 5,
      directStaff: 'Trần Minh Anh',
      directCommissionRate: 10,
      execStaff: 'Lê Thu Hà',
      execCommissionRate: 15
    },
    {
      id: 2,
      serviceName: 'Khóa Phong thái (8 buổi)',
      listedPrice: 6000000,
      discountPrice: 5000000,
      total: 5000000,
      onlineStaff: 'Nguyễn Thảo',
      onlineCommissionRate: 5,
      directStaff: 'Trần Minh Anh',
      directCommissionRate: 10,
      execStaff: 'Lê Thu Hà',
      execCommissionRate: 15
    },
    {
      id: 3,
      serviceName: 'Khóa Catwalk (12 buổi)',
      listedPrice: 8000000,
      discountPrice: 6500000,
      total: 6500000,
      onlineStaff: 'Nguyễn Thảo',
      onlineCommissionRate: 5,
      directStaff: 'Trần Minh Anh',
      directCommissionRate: 10,
      execStaff: 'Lê Thu Hà',
      execCommissionRate: 15
    }
  ]);

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState('Chuyển khoản');
  const [bankAccount, setBankAccount] = useState('Vietcombank Spa');
  const [totalPayment, setTotalPayment] = useState(19500000);
  const [note, setNote] = useState('');

  // Auto-calculate sum
  const computedTotal = serviceRows.reduce((acc, row) => acc + (Number(row.total) || 0), 0);

  useEffect(() => {
    setTotalPayment(computedTotal);
  }, [computedTotal]);

  // Handle customer suggestion lookup when typing phone or name
  const handlePhoneChange = (val) => {
    setCustomerPhone(val);
    if (val.trim().length >= 3) {
      const matches = customers.filter(c =>
        c.phone.includes(val.trim()) || c.name.toLowerCase().includes(val.toLowerCase())
      );
      setCustomerSuggestions(matches);
    } else {
      setCustomerSuggestions([]);
    }
  };

  const selectSuggestedCustomer = (c) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerDob(c.dob || '');
    setCustomerSuggestions([]);
    addToast(`Đã tự động điền thông tin khách hàng: ${c.name}`, 'info');
  };

  // Add new service row
  const handleAddRow = () => {
    const firstService = availableServices[0] || { name: 'Xử lý thâm', price: 2000000 };
    const newRow = {
      id: Date.now(),
      serviceName: firstService.name,
      listedPrice: firstService.price,
      discountPrice: firstService.price,
      total: firstService.price,
      onlineStaff: availableStaff[0]?.name || 'Nguyễn Thảo',
      onlineCommissionRate: 5,
      directStaff: availableStaff[1]?.name || 'Trần Minh Anh',
      directCommissionRate: 10,
      execStaff: availableStaff[2]?.name || 'Lê Thu Hà',
      execCommissionRate: 15
    };
    setServiceRows([...serviceRows, newRow]);
  };

  // Remove row
  const handleRemoveRow = (id) => {
    if (serviceRows.length <= 1) {
      addToast('Hóa đơn cần có ít nhất 1 dịch vụ!', 'error');
      return;
    }
    setServiceRows(serviceRows.filter(r => r.id !== id));
  };

  // Update row service selection
  const handleServiceSelect = (id, serviceName) => {
    const found = availableServices.find(s => s.name === serviceName);
    const price = found ? found.price : 2000000;
    setServiceRows(serviceRows.map(r => {
      if (r.id === id) {
        return {
          ...r,
          serviceName,
          listedPrice: price,
          discountPrice: price,
          total: price
        };
      }
      return r;
    }));
  };

  // Update row values
  const handleRowChange = (id, field, value) => {
    setServiceRows(serviceRows.map(r => {
      if (r.id === id) {
        const updated = { ...r, [field]: value };
        if (field === 'discountPrice') {
          updated.total = Number(value) || 0;
        }
        return updated;
      }
      return r;
    }));
  };

  // Submit invoice
  const handleSaveInvoice = async (isDraft = false) => {
    if (!customerName.trim() || !customerPhone.trim()) {
      addToast('Vui lòng nhập Họ tên và Số điện thoại khách hàng!', 'error');
      return;
    }
    if (serviceRows.length === 0) {
      addToast('Vui lòng thêm ít nhất một dịch vụ!', 'error');
      return;
    }

    const formattedServices = serviceRows.map(r => {
      const actTotal = Number(r.discountPrice) || Number(r.listedPrice) || 0;
      const onlRate = Number(r.onlineCommissionRate) || 0;
      const dirRate = Number(r.directCommissionRate) || 0;
      const exeRate = Number(r.execCommissionRate) || 0;

      return {
        name: r.serviceName,
        listedPrice: Number(r.listedPrice) || 0,
        discountPrice: Number(r.discountPrice) || 0,
        total: actTotal,
        onlineStaff: r.onlineStaff,
        onlineCommissionRate: onlRate,
        onlineCommissionAmount: Math.round((actTotal * onlRate) / 100),
        directStaff: r.directStaff,
        directCommissionRate: dirRate,
        directCommissionAmount: Math.round((actTotal * dirRate) / 100),
        execStaff: r.execStaff,
        execCommissionRate: exeRate,
        execCommissionAmount: Math.round((actTotal * exeRate) / 100)
      };
    });

    const payload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerDob: customerDob.trim(),
      services: formattedServices,
      totalAmount: Number(totalPayment) || computedTotal,
      paymentMethod,
      bankAccount,
      note: isDraft ? 'Bản nháp' : note
    };

    await addInvoice(payload);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 tracking-tight">
          Nhập hóa đơn
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Tạo hóa đơn nhanh chóng, chính xác và dễ dàng quản lý
        </p>
      </div>

      {/* SECTION 01: Customer Information */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-[#E60026] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-base text-gray-900">
            <span className="text-[#E60026]">01.</span> Thông tin khách hàng
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nguyễn Thị Mai"
              className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026] transition-all"
            />
          </div>

          {/* Customer Phone */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="0933003995"
              className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026] transition-all font-mono"
            />

            {/* Suggestions dropdown if customer already in DB */}
            {customerSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-rose-100 p-2 z-30 space-y-1">
                <p className="text-[11px] font-semibold text-gray-400 px-2 py-0.5 uppercase">
                  Khách hàng đã có trong hệ thống:
                </p>
                {customerSuggestions.slice(0, 4).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectSuggestedCustomer(c)}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 rounded-lg text-xs flex items-center justify-between transition-colors"
                  >
                    <span className="font-semibold text-gray-800">{c.name}</span>
                    <span className="font-mono text-gray-500">{c.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Date of Birth */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Ngày sinh <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={customerDob}
                onChange={(e) => setCustomerDob(e.target.value)}
                placeholder="12/05/2005"
                className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026] transition-all"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 02: Registered Services */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E60026] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-base text-gray-900">
              <span className="text-[#E60026]">02.</span> Dịch vụ đăng ký
            </h2>
          </div>

          {/* Add Service Button */}
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E60026] hover:bg-[#c90021] text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm dịch vụ</span>
          </button>
        </div>

        {/* Services Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs font-bold text-gray-600 border-b border-gray-100">
                <th className="pb-3 px-2 w-8 text-center">#</th>
                <th className="pb-3 px-3 min-w-[200px]">Dịch vụ</th>
                <th className="pb-3 px-3 min-w-[120px]">Giá niêm yết</th>
                <th className="pb-3 px-3 min-w-[120px]">Giá khuyến mãi</th>
                <th className="pb-3 px-3 min-w-[110px] text-center text-[#E60026]">Thành tiền</th>
                <th className="pb-3 px-3 min-w-[170px] text-center">
                  Nhân viên tư vấn Online <br />
                  <span className="text-[11px] font-normal text-gray-500">Hoa hồng (%)</span>
                </th>
                <th className="pb-3 px-3 min-w-[170px] text-center">
                  Nhân viên tư vấn trực tiếp <br />
                  <span className="text-[11px] font-normal text-gray-500">Hoa hồng (%)</span>
                </th>
                <th className="pb-3 px-3 min-w-[170px] text-center">
                  Nhân viên thực hiện <br />
                  <span className="text-[11px] font-normal text-gray-500">Hoa hồng (%)</span>
                </th>
                <th className="pb-3 px-2 w-12 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {serviceRows.map((row, index) => {
                // Calculation on discounted price
                const currentPrice = Number(row.discountPrice) || Number(row.listedPrice) || 0;
                const onlineCommAmt = Math.round((currentPrice * (Number(row.onlineCommissionRate) || 0)) / 100);
                const directCommAmt = Math.round((currentPrice * (Number(row.directCommissionRate) || 0)) / 100);
                const execCommAmt = Math.round((currentPrice * (Number(row.execCommissionRate) || 0)) / 100);

                return (
                  <tr key={row.id} className="bg-gray-50/50 hover:bg-rose-50/20 rounded-xl transition-colors">
                    {/* Index */}
                    <td className="py-3 px-2 text-center font-semibold text-gray-500">
                      {index + 1}
                    </td>

                    {/* Service Package Dropdown */}
                    <td className="py-3 px-3">
                      <select
                        value={row.serviceName}
                        onChange={(e) => handleServiceSelect(row.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      >
                        {availableServices.map(srv => (
                          <option key={srv.id} value={srv.name}>
                            {srv.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Listed Price */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        value={row.listedPrice}
                        onChange={(e) => handleRowChange(row.id, 'listedPrice', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-right font-medium text-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>

                    {/* Discount Price */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        value={row.discountPrice}
                        onChange={(e) => handleRowChange(row.id, 'discountPrice', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-right font-bold text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>

                    {/* Total Amount (Thành tiền bold red) */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-extrabold text-[#E60026] text-sm">
                        {formatNumber(row.total)}
                      </span>
                    </td>

                    {/* Online Staff & Commission */}
                    <td className="py-3 px-3">
                      <div className="space-y-1.5 bg-white p-2 rounded-xl border border-gray-200/80 shadow-xs">
                        <select
                          value={row.onlineStaff}
                          onChange={(e) => handleRowChange(row.id, 'onlineStaff', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-medium"
                        >
                          {availableStaff.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={row.onlineCommissionRate}
                            onChange={(e) => handleRowChange(row.id, 'onlineCommissionRate', Number(e.target.value))}
                            placeholder="%"
                            className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-md text-xs text-center font-bold"
                          />
                          <span className="text-[11px] text-gray-400 font-semibold">%</span>
                          <span className="text-xs font-bold text-emerald-600 ml-auto whitespace-nowrap">
                            + {formatNumber(onlineCommAmt)} đ
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Direct Staff & Commission */}
                    <td className="py-3 px-3">
                      <div className="space-y-1.5 bg-white p-2 rounded-xl border border-gray-200/80 shadow-xs">
                        <select
                          value={row.directStaff}
                          onChange={(e) => handleRowChange(row.id, 'directStaff', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-medium"
                        >
                          {availableStaff.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={row.directCommissionRate}
                            onChange={(e) => handleRowChange(row.id, 'directCommissionRate', Number(e.target.value))}
                            placeholder="%"
                            className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-md text-xs text-center font-bold"
                          />
                          <span className="text-[11px] text-gray-400 font-semibold">%</span>
                          <span className="text-xs font-bold text-emerald-600 ml-auto whitespace-nowrap">
                            + {formatNumber(directCommAmt)} đ
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Execution Staff & Commission */}
                    <td className="py-3 px-3">
                      <div className="space-y-1.5 bg-white p-2 rounded-xl border border-gray-200/80 shadow-xs">
                        <select
                          value={row.execStaff}
                          onChange={(e) => handleRowChange(row.id, 'execStaff', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-medium"
                        >
                          {availableStaff.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={row.execCommissionRate}
                            onChange={(e) => handleRowChange(row.id, 'execCommissionRate', Number(e.target.value))}
                            placeholder="%"
                            className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-md text-xs text-center font-bold"
                          />
                          <span className="text-[11px] text-gray-400 font-semibold">%</span>
                          <span className="text-xs font-bold text-emerald-600 ml-auto whitespace-nowrap">
                            + {formatNumber(execCommAmt)} đ
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Trash Delete Action */}
                    <td className="py-3 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa dịch vụ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 03: Payment */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-[#E60026] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <CreditCard className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-base text-gray-900">
            <span className="text-[#E60026]">03.</span> Thanh toán
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Payment Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Số tiền thanh toán <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={totalPayment}
              onChange={(e) => setTotalPayment(Number(e.target.value))}
              placeholder="10,000,000"
              className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-base font-bold text-[#E60026] focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026]"
            />
          </div>

          {/* Payment Method Radio */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Hình thức thanh toán <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-6 mt-1.5">
              <label className="flex items-center gap-2 text-sm text-gray-800 font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Chuyển khoản"
                  checked={paymentMethod === 'Chuyển khoản'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-[#E60026] accent-[#E60026]"
                />
                <span>Chuyển khoản</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-800 font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Tiền mặt"
                  checked={paymentMethod === 'Tiền mặt'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-[#E60026] accent-[#E60026]"
                />
                <span>Tiền mặt</span>
              </label>
            </div>
          </div>

          {/* Bank Account Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Tài khoản ngân hàng nhận tiền <span className="text-red-500">*</span>
            </label>
            <select
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026]"
            >
              <option value="Vietcombank Spa">Vietcombank Spa</option>
              <option value="Techcombank Spa">Techcombank Spa</option>
              <option value="Tiền mặt tại quầy">Tiền mặt tại quầy</option>
              <option value="Chuyển khoản">Chuyển khoản</option>
            </select>
          </div>
        </div>

        {/* Action Buttons: Lưu nháp & Lưu hóa đơn */}
        <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-end gap-3.5">
          <button
            type="button"
            onClick={() => handleSaveInvoice(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-rose-300 text-[#E60026] hover:bg-rose-50 font-semibold text-sm rounded-xl transition-all"
          >
            <Bookmark className="w-4 h-4" />
            <span>Lưu nháp</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveInvoice(false)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E60026] hover:bg-[#c90021] text-white font-semibold text-sm rounded-xl shadow-lg shadow-rose-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Lock className="w-4 h-4" />
            <span>Lưu hóa đơn</span>
          </button>
        </div>
      </div>
    </div>
  );
}
