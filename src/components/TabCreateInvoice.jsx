import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  Search,
  Building2,
  X,
  ChevronDown
} from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currencyUtils';
import CurrencyInput from './CurrencyInput';

// Hàm chuẩn hóa tiếng Việt không dấu để tìm kiếm thông minh và chính xác
function removeVietnameseTones(str) {
  if (!str) return '';
  str = String(str).toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  return str.trim();
}

// Component chọn gói dịch vụ / sản phẩm: gõ tên tìm kiếm trực tiếp trong ô của bảng
function SearchableServiceSelect({ value, services, onChange, isProduct, isFiller }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState(value || '');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 320 });
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Đồng bộ searchText khi giá trị dịch vụ của dòng thay đổi
  useEffect(() => {
    if (!isOpen) {
      setSearchText(value || '');
    }
  }, [value, isOpen]);

  // Cập nhật tọa độ hiển thị dropdown nổi (Fixed positioning)
  const updatePosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 250;
      const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      setCoords({
        top: showAbove ? Math.max(10, rect.top - dropdownHeight - 4) : rect.bottom + 4,
        left: Math.max(10, rect.left),
        width: Math.max(rect.width, 320)
      });
    }
  };

  const handleOpen = () => {
    updatePosition();
    setIsOpen(true);
    // Bôi đen toàn bộ chữ khi click vào để người dùng gõ từ khóa là thay thế tìm kiếm được ngay
    setTimeout(() => {
      inputRef.current?.select();
    }, 20);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Nếu người dùng gõ tìm nhưng click ra ngoài không chọn:
    // Kiểm tra xem từ khóa có khớp chính xác dịch vụ nào không, nếu không thì hoàn lại tên cũ
    const exact = (services || []).find(s => (s.name || '').toLowerCase() === (searchText || '').trim().toLowerCase());
    if (exact) {
      onChange(exact.name);
      setSearchText(exact.name);
    } else {
      setSearchText(value || '');
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        handleClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, searchText, value, services]);

  // Lọc sản phẩm / dịch vụ theo nội dung người dùng nhập
  const filteredServices = useMemo(() => {
    const list = services || [];
    const q = (searchText || '').trim().toLowerCase();
    if (!q) return list;

    const qNoTone = removeVietnameseTones(q);
    return list.filter(s => {
      const name = (s.name || '').toLowerCase();
      const nameNoTone = removeVietnameseTones(name);
      const cat = (s.category || '').toLowerCase();
      const catNoTone = removeVietnameseTones(cat);

      return name.includes(q) || nameNoTone.includes(qNoTone) ||
             cat.includes(q) || catNoTone.includes(qNoTone);
    });
  }, [services, searchText]);

  const handleSelectService = (srv) => {
    onChange(srv.name);
    setSearchText(srv.name);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (!isOpen) {
              updatePosition();
              setIsOpen(true);
            }
          }}
          onFocus={handleOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (filteredServices.length > 0) {
                handleSelectService(filteredServices[0]);
              }
            } else if (e.key === 'Escape') {
              handleClose();
            }
          }}
          placeholder="Nhập tên gói dịch vụ / sản phẩm (gõ tên để tìm)..."
          className="w-full pl-3 pr-8 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026] transition-all"
        />
        <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Render dropdown gợi ý theo phong cách đồng bộ với ô tìm kiếm khách hàng */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            zIndex: 99999
          }}
          className="bg-white rounded-xl shadow-xl border border-rose-100 p-2 z-50 space-y-1 max-h-64 overflow-y-auto animate-in fade-in duration-100"
        >
          <p className="text-[11px] font-semibold text-gray-400 px-2 py-0.5 uppercase flex items-center justify-between">
            <span>Gói dịch vụ / SP đã lưu ({filteredServices.length}):</span>
            {searchText && <span className="text-[#E60026] normal-case font-medium truncate max-w-[140px]">"{searchText}"</span>}
          </p>

          {filteredServices.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400 italic text-center">
              Không tìm thấy gói dịch vụ hoặc sản phẩm nào khớp với "{searchText}"
            </div>
          ) : (
            filteredServices.map((srv) => (
              <button
                key={srv.id}
                type="button"
                onMouseDown={(e) => {
                  // Ngăn sự kiện blur của input trước khi click được ghi nhận
                  e.preventDefault();
                  handleSelectService(srv);
                }}
                className={`w-full text-left px-2.5 py-1.5 hover:bg-rose-50 rounded-lg text-xs flex items-center justify-between transition-colors group ${
                  srv.name === value ? 'bg-rose-50/80 font-bold text-[#E60026]' : 'text-gray-800'
                }`}
              >
                <div className="flex-1 pr-2 truncate">
                  <span className="font-semibold text-gray-800 group-hover:text-[#E60026]">{srv.name}</span>
                  {srv.category && (
                    <span className="ml-2 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {srv.category}
                    </span>
                  )}
                </div>
                <span className="font-sans font-bold text-[#E60026] text-xs shrink-0">
                  {formatCurrencyInput(srv.price)}đ
                </span>
              </button>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

export default function TabCreateInvoice() {
  const {
    services: availableServices,
    staff: availableStaff,
    addStaff,
    deleteStaff,
    bankAccounts: availableBanks,
    addBankAccount,
    deleteBankAccount,
    customers,
    addInvoice,
    formatVND,
    formatNumber,
    addToast
  } = useApp();

  // Customer fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerDob, setCustomerDob] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [suggestionSource, setSuggestionSource] = useState(null); // 'name' | 'phone'

  // Service line items:
  // 1. Dịch vụ bắt đầu bằng chữ "sản phẩm" -> Giá niêm yết (đã cài sẵn khi nhập dịch vụ vào cài đặt) * Số lượng - Khuyến mãi
  // 2. Dịch vụ có chữ "filler" -> Đơn giá/CC * Số lượng CC - Khuyến mãi
  const isFillerService = (name) => (name || '').toLowerCase().includes('filler');
  const isProductService = (name) => {
    if (!name) return false;
    const clean = name.trim().toLowerCase();
    return clean.startsWith('sản phẩm') || clean.startsWith('san pham') || clean.startsWith('sp ') || clean.startsWith('sp:') || clean.startsWith('sp-');
  };

  const [serviceRows, setServiceRows] = useState([
    {
      id: 1,
      serviceName: 'Xử lý thâm',
      quantity: 1,
      unitPrice: 2000000,
      unitPriceCc: 2000000,
      quantityCc: 1,
      listedPrice: 2000000,
      discountPrice: 0,
      total: 2000000,
      onlineStaff: '',
      onlineCommissionRate: 5,
      directStaff: '',
      directCommissionRate: 10,
      execStaff: '',
      execCommissionRate: 15
    }
  ]);

  // Sync initial row with availableServices when loaded if default isn't in list
  useEffect(() => {
    if (availableServices && availableServices.length > 0) {
      setServiceRows(prev => {
        if (prev.length === 1 && prev[0].serviceName === 'Xử lý thâm') {
          const match = availableServices.find(s => s.name === 'Xử lý thâm');
          if (!match) {
            const first = availableServices[0];
            const p = Number(first.price) || 2000000;
            return [
              {
                ...prev[0],
                serviceName: first.name,
                listedPrice: p,
                unitPrice: p,
                unitPriceCc: p,
                total: p
              }
            ];
          }
        }
        return prev;
      });
    }
  }, [availableServices]);

  // Modals state for Staff and Bank
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({ name: '', role: 'Tư vấn viên', phone: '' });

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [newBankForm, setNewBankForm] = useState({ bankName: '', accountNumber: '', accountHolder: '', name: '' });

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState('Chuyển khoản');
  const [bankAccount, setBankAccount] = useState('Vietcombank Spa');
  const [paidAmount, setPaidAmount] = useState(2000000);
  const [isPaidCustom, setIsPaidCustom] = useState(false);
  const [note, setNote] = useState('');

  // Auto-calculate sum from services
  const computedTotal = serviceRows.reduce((acc, row) => acc + (Number(row.total) || 0), 0);

  useEffect(() => {
    if (!isPaidCustom) {
      setPaidAmount(computedTotal);
    }
  }, [computedTotal, isPaidCustom]);

  // Handle customer suggestion lookup when typing name
  const handleNameChange = (val) => {
    setCustomerName(val);
    if (val.trim().length >= 2) {
      const q = val.trim().toLowerCase();
      const matches = customers.filter(c =>
        (c.name && c.name.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q))
      );
      setCustomerSuggestions(matches);
      setSuggestionSource('name');
    } else {
      if (suggestionSource === 'name') setCustomerSuggestions([]);
    }
  };

  // Handle customer suggestion lookup when typing phone
  const handlePhoneChange = (val) => {
    setCustomerPhone(val);
    if (val.trim().length >= 3) {
      const q = val.trim().toLowerCase();
      const matches = customers.filter(c =>
        (c.phone && c.phone.includes(val.trim())) || (c.name && c.name.toLowerCase().includes(q))
      );
      setCustomerSuggestions(matches);
      setSuggestionSource('phone');
    } else {
      if (suggestionSource === 'phone') setCustomerSuggestions([]);
    }
  };

  const selectSuggestedCustomer = (c) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerDob(c.dob || '');
    setCustomerSuggestions([]);
    setSuggestionSource(null);
    addToast(`Đã tự động điền thông tin khách hàng: ${c.name}`, 'info');
  };

  // Add new service row
  const handleAddRow = () => {
    const firstService = availableServices[0] || { name: 'Xử lý thâm', price: 2000000 };
    const price = Number(firstService.price) || 2000000;
    const qty = 1;

    const newRow = {
      id: Date.now(),
      serviceName: firstService.name,
      quantity: qty,
      quantityCc: qty,
      unitPrice: price,
      unitPriceCc: price,
      listedPrice: price,
      discountPrice: 0,
      total: price,
      onlineStaff: availableStaff[0]?.name || '',
      onlineCommissionRate: 5,
      directStaff: availableStaff[1]?.name || '',
      directCommissionRate: 10,
      execStaff: availableStaff[2]?.name || '',
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

  // Update row service selection: tự động lấy Giá niêm yết từ Cài đặt
  const handleServiceSelect = (id, serviceName) => {
    const found = availableServices.find(s => s.name === serviceName);
    const price = found ? (Number(found.price) || 0) : 2000000;

    setServiceRows(serviceRows.map(r => {
      if (r.id === id) {
        const qty = Number(r.quantity) > 0 ? Number(r.quantity) : 1;
        const discount = Number(r.discountPrice) || 0;
        const total = Math.max(0, (price * qty) - discount);
        return {
          ...r,
          serviceName,
          quantity: qty,
          quantityCc: qty,
          unitPrice: price,
          unitPriceCc: price,
          listedPrice: price,
          discountPrice: discount,
          total
        };
      }
      return r;
    }));
  };

  // Update row values: Thành tiền = (Giá niêm yết * Số lượng) - Giá khuyến mãi
  const handleRowChange = (id, field, value) => {
    setServiceRows(serviceRows.map(r => {
      if (r.id === id) {
        const updated = { ...r, [field]: value };
        if (field === 'quantity') {
          updated.quantityCc = value;
        } else if (field === 'quantityCc') {
          updated.quantity = value;
        } else if (field === 'unitPriceCc') {
          updated.listedPrice = value;
        } else if (field === 'listedPrice') {
          updated.unitPriceCc = value;
          updated.unitPrice = value;
        }

        const price = Number(updated.listedPrice) || 0;
        const qty = updated.quantity === '' ? 0 : (Number(updated.quantity) || 0);
        const discount = Number(updated.discountPrice) || 0;
        updated.total = Math.max(0, (price * qty) - discount);
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
      const isProduct = isProductService(r.serviceName);
      const isFiller = isFillerService(r.serviceName);
      const unit = Number(r.listedPrice) || 0;
      const qty = Number(r.quantity) > 0 ? Number(r.quantity) : 1;
      const discount = Number(r.discountPrice) || 0;
      const actTotal = Math.max(0, (unit * qty) - discount);
      const onlRate = Number(r.onlineCommissionRate) || 0;
      const dirRate = Number(r.directCommissionRate) || 0;
      const exeRate = Number(r.execCommissionRate) || 0;

      let displayName = r.serviceName;
      if (isProduct && qty > 1) {
        displayName = `${r.serviceName} (SL: ${qty})`;
      } else if (isFiller && qty) {
        displayName = `${r.serviceName} (${qty} CC)`;
      }

      return {
        name: displayName,
        baseName: r.serviceName,
        isProduct,
        isFiller,
        unitPrice: unit,
        quantity: qty,
        unitPriceCc: isFiller ? unit : undefined,
        quantityCc: isFiller ? qty : undefined,
        listedPrice: unit,
        discountPrice: discount,
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

    const tot = Number(computedTotal) || 0;
    const paid = Number(paidAmount) || 0;
    const rem = Math.max(0, tot - paid);

    const payload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerDob: customerDob.trim(),
      services: formattedServices,
      totalAmount: tot,
      paidAmount: paid,
      remainingAmount: rem,
      status: rem === 0 ? 'Đã thanh toán' : (paid > 0 ? 'Còn nợ' : 'Chưa thanh toán'),
      paymentMethod,
      bankAccount,
      note: isDraft ? 'Bản nháp' : note
    };

    const success = await addInvoice(payload);
    if (success) {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerDob('');
      setNote('');
      setIsPaidCustom(false);
      setServiceRows([
        {
          id: Date.now(),
          serviceName: availableServices[0]?.name || 'Xử lý thâm',
          quantity: 1,
          quantityCc: 1,
          unitPrice: availableServices[0]?.price || 2000000,
          unitPriceCc: availableServices[0]?.price || 2000000,
          listedPrice: availableServices[0]?.price || 2000000,
          discountPrice: 0,
          total: availableServices[0]?.price || 2000000,
          onlineStaff: '',
          onlineCommissionRate: 5,
          directStaff: '',
          directCommissionRate: 10,
          execStaff: '',
          execCommissionRate: 15
        }
      ]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-sans text-gray-900 tracking-tight">
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
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Họ và tên <span className="text-red-500">*</span></span>
              <span className="text-[10px] text-gray-400 font-normal">Gõ tên để tìm khách cũ</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nguyễn Thị Mai (gõ tên để tìm)"
                className="w-full pl-3.5 pr-8 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026] transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Suggestions dropdown if customer already in DB when typing name */}
            {suggestionSource === 'name' && customerSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-rose-100 p-2 z-30 space-y-1 animate-in fade-in">
                <p className="text-[11px] font-semibold text-gray-400 px-2 py-0.5 uppercase">
                  Khách hàng khớp với tên vừa nhập:
                </p>
                {customerSuggestions.slice(0, 5).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectSuggestedCustomer(c)}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 rounded-lg text-xs flex items-center justify-between transition-colors group"
                  >
                    <span className="font-semibold text-gray-800 group-hover:text-[#E60026]">{c.name}</span>
                    <span className="font-sans text-gray-500 text-[11px]">{c.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Phone */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Số điện thoại <span className="text-red-500">*</span></span>
              <span className="text-[10px] text-gray-400 font-normal">Gõ SĐT để tìm</span>
            </label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="0933003995"
              className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026] transition-all font-sans"
            />

            {/* Suggestions dropdown if customer already in DB when typing phone */}
            {suggestionSource === 'phone' && customerSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-rose-100 p-2 z-30 space-y-1 animate-in fade-in">
                <p className="text-[11px] font-semibold text-gray-400 px-2 py-0.5 uppercase">
                  Khách hàng khớp với SĐT:
                </p>
                {customerSuggestions.slice(0, 5).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectSuggestedCustomer(c)}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 rounded-lg text-xs flex items-center justify-between transition-colors group"
                  >
                    <span className="font-semibold text-gray-800 group-hover:text-[#E60026]">{c.name}</span>
                    <span className="font-sans text-gray-500 text-[11px]">{c.phone}</span>
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

          <div className="flex items-center gap-2">
            {/* Add Staff Button */}
            <button
              type="button"
              onClick={() => setIsStaffModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-[#E60026] border border-rose-200 text-xs font-semibold rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm nhân viên</span>
            </button>

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
        </div>

        {/* Services Table */}
        <div className="mt-5 overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs font-bold text-gray-600 border-b border-gray-100">
                <th className="pb-3 px-2 w-10 text-center font-bold">STT</th>
                <th className="pb-3 px-3 min-w-[240px]">Gói dịch vụ / Sản phẩm</th>
                <th className="pb-3 px-3 min-w-[130px] text-center">
                  Giá niêm yết <br />
                  <span className="text-[10px] font-normal text-gray-400">(Từ cài đặt)</span>
                </th>
                <th className="pb-3 px-2 min-w-[85px] text-center">Số lượng</th>
                <th className="pb-3 px-3 min-w-[120px] text-center">Giá khuyến mãi</th>
                <th className="pb-3 px-3 min-w-[120px] text-center text-[#E60026]">Thành tiền</th>
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
                <th className="pb-3 px-2 w-12 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {serviceRows.map((row, index) => {
                const isProduct = isProductService(row.serviceName);
                const isFiller = isFillerService(row.serviceName);
                const currentPrice = Number(row.total) || 0;
                const hasOnline = row.onlineStaff && row.onlineStaff !== 'Trống';
                const hasDirect = row.directStaff && row.directStaff !== 'Trống';
                const hasExec = row.execStaff && row.execStaff !== 'Trống';

                const onlineCommAmt = hasOnline ? Math.round((currentPrice * (Number(row.onlineCommissionRate) || 0)) / 100) : 0;
                const directCommAmt = hasDirect ? Math.round((currentPrice * (Number(row.directCommissionRate) || 0)) / 100) : 0;
                const execCommAmt = hasExec ? Math.round((currentPrice * (Number(row.execCommissionRate) || 0)) / 100) : 0;

                return (
                  <tr key={row.id} className="bg-gray-50/50 hover:bg-rose-50/20 rounded-xl transition-colors">
                    {/* Index */}
                    <td className="py-3 px-2 text-center font-semibold text-gray-500">
                      {index + 1}
                    </td>

                    {/* Service Package Dropdown - Tìm kiếm nhập tên thay vì nhấp mũi tên kiếm */}
                    <td className="py-3 px-3 min-w-[240px]">
                      <div className="space-y-1">
                        <SearchableServiceSelect
                          value={row.serviceName}
                          services={availableServices}
                          onChange={(selectedName) => handleServiceSelect(row.id, selectedName)}
                          isProduct={isProduct}
                          isFiller={isFiller}
                        />
                        {isProduct && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold px-1">
                            <span>🛍️ Sản phẩm bán lẻ</span>
                          </div>
                        )}
                        {isFiller && (
                          <div className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold px-1">
                            <span>💉 Dịch vụ tiêm Filler</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Giá niêm yết (đã cài sẵn khi nhập dịch vụ vào cài đặt) */}
                    <td className="py-3 px-3">
                      <div className="relative">
                        <CurrencyInput
                          value={row.listedPrice}
                          onChange={(val) => handleRowChange(row.id, 'listedPrice', val)}
                          showZero={true}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-right font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                        />
                        {isFiller && (
                          <span className="block text-[10px] text-gray-400 text-right mt-0.5">
                            (Đơn giá / CC)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Số lượng */}
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min={isFiller ? "0.1" : "1"}
                          step={isFiller ? "0.5" : "1"}
                          value={row.quantity ?? 1}
                          onChange={(e) => handleRowChange(row.id, 'quantity', e.target.value)}
                          className={`w-16 px-1.5 py-1.5 bg-white border rounded-lg text-xs text-center font-bold text-gray-800 focus:outline-none focus:ring-1 font-sans shadow-2xs ${
                            isProduct
                              ? 'border-amber-300 focus:ring-amber-500 bg-amber-50/30'
                              : isFiller
                              ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                              : 'border-gray-200 focus:ring-rose-500'
                          }`}
                        />
                        {isFiller && (
                          <span className="text-[10px] text-[#E60026] font-bold">CC</span>
                        )}
                      </div>
                    </td>

                    {/* Discount Price */}
                    <td className="py-3 px-3">
                      <CurrencyInput
                        value={row.discountPrice}
                        onChange={(val) => handleRowChange(row.id, 'discountPrice', val)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-right font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                      />
                    </td>

                    {/* Total Amount (Thành tiền bold red) */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-extrabold text-[#E60026] text-sm font-sans">
                          {formatCurrencyInput(row.total)}đ
                        </span>
                        {(Number(row.quantity) > 1 || Number(row.discountPrice) > 0) && (
                          <span className="text-[10px] text-gray-400 font-normal font-sans">
                            {Number(row.quantity) > 1 ? `${formatCurrencyInput(row.listedPrice)} × ${row.quantity}` : ''}
                            {Number(row.quantity) > 1 && Number(row.discountPrice) > 0 ? ' - ' : ''}
                            {Number(row.discountPrice) > 0 ? `${formatCurrencyInput(row.discountPrice)}` : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Online Staff & Commission */}
                    <td className="py-3 px-3">
                      <div className="space-y-1.5 bg-white p-2 rounded-xl border border-gray-200/80 shadow-xs">
                        <select
                          value={row.onlineStaff}
                          onChange={(e) => handleRowChange(row.id, 'onlineStaff', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-medium"
                        >
                          <option value="">Trống (Không chọn)</option>
                          {availableStaff.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={!hasOnline}
                            value={row.onlineCommissionRate}
                            onChange={(e) => handleRowChange(row.id, 'onlineCommissionRate', Number(e.target.value))}
                            placeholder="%"
                            className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-md text-xs text-center font-bold disabled:bg-gray-100 disabled:text-gray-400"
                          />
                          <span className="text-[11px] text-gray-400 font-semibold">%</span>
                          <span className={`text-xs font-bold ml-auto whitespace-nowrap ${hasOnline ? 'text-emerald-600' : 'text-gray-400'}`}>
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
                          <option value="">Trống (Không chọn)</option>
                          {availableStaff.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={!hasDirect}
                            value={row.directCommissionRate}
                            onChange={(e) => handleRowChange(row.id, 'directCommissionRate', Number(e.target.value))}
                            placeholder="%"
                            className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-md text-xs text-center font-bold disabled:bg-gray-100 disabled:text-gray-400"
                          />
                          <span className="text-[11px] text-gray-400 font-semibold">%</span>
                          <span className={`text-xs font-bold ml-auto whitespace-nowrap ${hasDirect ? 'text-emerald-600' : 'text-gray-400'}`}>
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
                          <option value="">Trống (Không chọn)</option>
                          {availableStaff.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={!hasExec}
                            value={row.execCommissionRate}
                            onChange={(e) => handleRowChange(row.id, 'execCommissionRate', Number(e.target.value))}
                            placeholder="%"
                            className="w-14 px-1.5 py-1 bg-white border border-gray-200 rounded-md text-xs text-center font-bold disabled:bg-gray-100 disabled:text-gray-400"
                          />
                          <span className="text-[11px] text-gray-400 font-semibold">%</span>
                          <span className={`text-xs font-bold ml-auto whitespace-nowrap ${hasExec ? 'text-emerald-600' : 'text-gray-400'}`}>
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
            <tfoot>
              <tr className="bg-rose-50/70 font-bold border-t-2 border-rose-200">
                <td colSpan="4" className="py-3.5 px-4 text-gray-800 text-right uppercase text-xs tracking-wider">
                  Tổng tiền các dịch vụ:
                </td>
                <td className="py-3.5 px-3 text-center">
                  <span className="text-base font-extrabold text-[#E60026] font-sans">
                    {formatCurrencyInput(computedTotal)}đ
                  </span>
                </td>
                <td colSpan="4" className="py-3.5 px-3 text-xs text-gray-500 font-medium">
                  (Cộng các giá tiền tại cột thành tiền: {serviceRows.length} dịch vụ)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Ô tổng tiền dưới khung dịch vụ cộng dồn các thành tiền */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 border border-rose-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-[#E60026] animate-pulse"></div>
            <div>
              <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Tổng tiền tại khung dịch vụ:
              </span>
              <span className="text-xs text-gray-500 ml-2">
                (Tổng cộng dồn từ cột thành tiền của {serviceRows.length} dịch vụ)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Tổng cộng:</span>
            <span className="text-2xl font-extrabold text-[#E60026] font-sans">
              {formatCurrencyInput(computedTotal)} đ
            </span>
          </div>
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

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Tổng tiền */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Tổng tiền (VNĐ) <span className="text-gray-400 font-normal">(Cộng từ khung dịch vụ)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={formatCurrencyInput(computedTotal)}
                className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-base font-extrabold text-gray-900 cursor-not-allowed font-sans"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">đ</span>
            </div>
          </div>

          {/* Đã thanh toán */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Đã thanh toán (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CurrencyInput
                required
                value={paidAmount}
                onChange={(val) => {
                  setIsPaidCustom(true);
                  setPaidAmount(val);
                }}
                showZero={true}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-base font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">đ</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Mặc định thanh toán đủ, có thể sửa khi khách trả trước</p>
          </div>

          {/* Còn lại (Khách nợ) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Còn lại (Khách còn nợ)
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={formatCurrencyInput(Math.max(0, computedTotal - paidAmount))}
                className={`w-full px-3.5 py-2.5 bg-gray-100 border rounded-xl text-base font-extrabold cursor-not-allowed font-sans ${computedTotal - paidAmount > 0 ? 'text-[#E60026] border-rose-200' : 'text-gray-600 border-gray-200'}`}
              />
              <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold ${computedTotal - paidAmount > 0 ? 'text-[#E60026]' : 'text-gray-500'}`}>đ</span>
            </div>
            {computedTotal - paidAmount > 0 && (
              <p className="text-[11px] text-[#E60026] font-semibold mt-1">Ghi nhận công nợ của khách hàng</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

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
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Tài khoản ngân hàng nhận tiền <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(true)}
                className="text-xs text-[#E60026] hover:text-[#b8001e] font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thông tin ngân hàng</span>
              </button>
            </div>
            <select
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026]"
            >
              {(availableBanks || []).map(b => {
                const val = b.accountNumber && b.accountNumber !== 'TIENMAT'
                  ? `${b.name} - STK: ${b.accountNumber}`
                  : b.name;
                return (
                  <option key={b.id} value={val}>
                    {b.name} {b.accountNumber && b.accountNumber !== 'TIENMAT' ? `(STK: ${b.accountNumber} - ${b.accountHolder || ''})` : ''}
                  </option>
                );
              })}
            </select>

            {/* Display detailed bank information (STK - Chủ tài khoản - Ngân hàng) */}
            {(() => {
              const activeBank = (availableBanks || []).find(b => 
                b.name === bankAccount || 
                (b.accountNumber && b.accountNumber !== 'TIENMAT' && bankAccount.includes(b.accountNumber))
              ) || (availableBanks || [])[0];
              if (!activeBank) return null;
              return (
                <div className="mt-2.5 p-3 rounded-xl bg-[#FFF5F6] border border-rose-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#E60026]" />
                    <span className="text-gray-500">Ngân hàng:</span>
                    <strong className="text-gray-900">{activeBank.bankName || activeBank.name}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">STK:</span>
                    <strong className="font-sans text-[#E60026] ml-1">{activeBank.accountNumber || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Chủ tài khoản:</span>
                    <strong className="text-gray-900 ml-1">{activeBank.accountHolder || '—'}</strong>
                  </div>
                </div>
              );
            })()}
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

      {/* MODAL: Quản lý & Thêm nhân viên */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-[#E60026]" />
                <span>Quản lý & Thêm nhân viên</span>
              </h3>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 pr-1 mt-3">
              {/* Form Thêm */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newStaffForm.name.trim()) return;
                  await addStaff(newStaffForm);
                  setNewStaffForm({ name: '', role: 'Tư vấn viên', phone: '' });
                }}
                className="space-y-3 text-xs bg-gray-50/60 p-4 rounded-xl border border-gray-100"
              >
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5 text-[#E60026]" />
                  <span>Thêm nhân viên mới</span>
                </h4>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Họ và tên nhân viên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaffForm.name}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                    placeholder="Ví dụ: Hoàng Thu Trang"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Chức vụ / Vai trò</label>
                    <select
                      value={newStaffForm.role}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="Tư vấn Online & Trực tiếp">Tư vấn Online & Trực tiếp</option>
                      <option value="Tư vấn Online">Tư vấn Online</option>
                      <option value="Tư vấn trực tiếp">Tư vấn trực tiếp</option>
                      <option value="Kỹ thuật viên chính">Kỹ thuật viên chính</option>
                      <option value="Kỹ thuật viên phun xăm">Kỹ thuật viên phun xăm</option>
                      <option value="Chuyên viên chăm sóc da">Chuyên viên chăm sóc da</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      value={newStaffForm.phone}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                      placeholder="09xx xxx xxx"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#E60026] text-white rounded-xl font-semibold hover:bg-[#c90021] text-xs shadow-md shadow-rose-600/20"
                  >
                    + Lưu nhân viên
                  </button>
                </div>
              </form>

              {/* Danh sách nhân viên & Nút Xóa */}
              <div>
                <h4 className="font-bold text-gray-900 text-xs mb-2.5 flex items-center justify-between">
                  <span>Danh sách nhân viên ({availableStaff.length})</span>
                  <span className="text-[11px] text-gray-500 font-normal">Nhấn nút xóa để gỡ nhân viên</span>
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  {availableStaff.map(stf => (
                    <div key={stf.id} className="p-2.5 flex items-center justify-between hover:bg-rose-50/20 text-xs transition-colors">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${stf.color || 'bg-rose-600'} text-white font-bold flex items-center justify-center text-xs`}>
                          {stf.initials || (stf.name || '').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{stf.name}</div>
                          <div className="text-[11px] text-gray-500">{stf.role} {stf.phone ? `• ${stf.phone}` : ''}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Bạn có chắc chắn muốn xóa nhân viên "${stf.name}" không?`)) {
                            await deleteStaff(stf.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold transition-colors"
                        title="Xóa nhân viên"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Quản lý & Thêm thông tin ngân hàng */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#E60026]" />
                <span>Quản lý & Thêm tài khoản ngân hàng</span>
              </h3>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 pr-1 mt-3">
              {/* Form Thêm */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newBankForm.bankName.trim() || !newBankForm.accountNumber.trim()) return;
                  const created = await addBankAccount(newBankForm);
                  if (created) {
                    setBankAccount(created.name);
                  }
                  setNewBankForm({ bankName: '', accountNumber: '', accountHolder: '', name: '' });
                }}
                className="space-y-3 text-xs bg-gray-50/60 p-4 rounded-xl border border-gray-100"
              >
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5 text-[#E60026]" />
                  <span>Thêm tài khoản ngân hàng mới</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Tên ngân hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newBankForm.bankName}
                      onChange={(e) => setNewBankForm({ ...newBankForm, bankName: e.target.value })}
                      placeholder="Ví dụ: Vietcombank, Techcombank..."
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Số tài khoản (STK) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newBankForm.accountNumber}
                      onChange={(e) => setNewBankForm({ ...newBankForm, accountNumber: e.target.value })}
                      placeholder="Ví dụ: 1023456789"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Tên chủ tài khoản <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newBankForm.accountHolder}
                      onChange={(e) => setNewBankForm({ ...newBankForm, accountHolder: e.target.value.toUpperCase() })}
                      placeholder="NGUYEN THI HIEN"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Tên gọi nhớ (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={newBankForm.name}
                      onChange={(e) => setNewBankForm({ ...newBankForm, name: e.target.value })}
                      placeholder="Ví dụ: Vietcombank Spa"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#E60026] text-white rounded-xl font-semibold hover:bg-[#c90021] text-xs shadow-md shadow-rose-600/20"
                  >
                    + Lưu tài khoản
                  </button>
                </div>
              </form>

              {/* Danh sách tài khoản ngân hàng & Nút Xóa */}
              <div>
                <h4 className="font-bold text-gray-900 text-xs mb-2.5 flex items-center justify-between">
                  <span>Danh sách tài khoản ngân hàng ({availableBanks.length})</span>
                  <span className="text-[11px] text-gray-500 font-normal">Xóa tài khoản không dùng</span>
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  {availableBanks.map(bnk => (
                    <div key={bnk.id} className="p-2.5 flex items-center justify-between hover:bg-rose-50/20 text-xs transition-colors">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#E60026] shrink-0" />
                        <div>
                          <div className="font-bold text-gray-900">{bnk.name}</div>
                          <div className="text-[11px] text-gray-500">
                            {bnk.bankName || bnk.name} • STK: <span className="font-bold text-[#E60026] font-sans">{bnk.accountNumber || '—'}</span> {bnk.accountHolder ? `(${bnk.accountHolder})` : ''}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ngân hàng "${bnk.name}" (${bnk.accountNumber || 'Tiền mặt'}) không?`)) {
                            await deleteBankAccount(bnk.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold transition-colors shrink-0"
                        title="Xóa tài khoản"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
