import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';

const AppContext = createContext();

// Pre-seeded fallback data
const DEFAULT_SERVICES = [
  { id: 'DV01', name: 'Xử lý thâm', price: 2000000, category: 'Phun xăm thẩm mỹ' },
  { id: 'DV02', name: 'Phun môi Tế bào gốc', price: 3300000, category: 'Phun xăm thẩm mỹ' },
  { id: 'DV03', name: 'Phun môi NaNoLips', price: 2800000, category: 'Phun xăm thẩm mỹ' },
  { id: 'DV04', name: 'Phun môi PenLips Plus', price: 3800000, category: 'Phun xăm thẩm mỹ' },
  { id: 'DV05', name: 'Chân mày shadding ombre', price: 2000000, category: 'Phun xăm thẩm mỹ' },
  { id: 'DV06', name: 'Chân mày điêu khắc đầu + phun shaddinh đuôi', price: 2800000, category: 'Phun xăm thẩm mỹ' },
  { id: 'DV07', name: 'Chân mày điêu khắc sợi hairtrokes', price: 3000000, category: 'Phun xăm thẩm mỹ' },
  { id: 'DV08', name: 'Chân mày sợi nét siêu thực', price: 4000000, category: 'Phun xăm thẩm mỹ' },
  { id: 'DV12', name: 'Chăm sóc da chuyên sâu', price: 850000, category: 'Chăm sóc da' },
  { id: 'DV13', name: 'Triệt lông nách / Vĩnh viễn', price: 1300000, category: 'Triệt lông vĩnh viễn' },
  { id: 'DV14', name: 'Laser Pico & Điều trị nám', price: 1500000, category: 'Laser & Điều trị' },
  { id: 'DV15', name: 'Tiêm thẩm mỹ Filler môi/Botox', price: 2800000, category: 'Tiêm thẩm mỹ (Filler/Botox)' }
];

const DEFAULT_STAFF = [
  { id: 'NV01', name: 'Nguyễn Thảo', initials: 'NT', color: 'bg-blue-600', role: 'Tư vấn Online & Trực tiếp', phone: '0901 111 001', commissionRate: 5 },
  { id: 'NV02', name: 'Trần Minh Anh', initials: 'MA', color: 'bg-purple-600', role: 'Tư vấn trực tiếp', phone: '0901 111 002', commissionRate: 5 },
  { id: 'NV03', name: 'Lê Thu Hà', initials: 'LH', color: 'bg-rose-600', role: 'Kỹ thuật viên chính', phone: '0901 111 003', commissionRate: 7 },
  { id: 'NV04', name: 'Nguyễn Mai', initials: 'NM', color: 'bg-indigo-600', role: 'Chuyên viên chăm sóc da', phone: '0901 111 004', commissionRate: 5 },
  { id: 'NV05', name: 'Vũ Thị Quỳnh', initials: 'QN', color: 'bg-sky-600', role: 'Kỹ thuật viên phun xăm', phone: '0901 111 005', commissionRate: 6 },
  { id: 'NV06', name: 'Đặng Thảo Vy', initials: 'TV', color: 'bg-pink-600', role: 'Kỹ thuật viên', phone: '0901 111 006', commissionRate: 5 }
];

const DEFAULT_BANK_ACCOUNTS = [
  { id: 'acc1', name: 'Vietcombank Spa', bankName: 'Vietcombank (VCB)', accountNumber: '9988776655', accountHolder: 'NGUYEN THI HIEN', balance: 0 },
  { id: 'acc2', name: 'Techcombank Spa', bankName: 'Techcombank (TCB)', accountNumber: '1903668899', accountHolder: 'NGUYEN THI HIEN', balance: 0 },
  { id: 'acc3', name: 'Tiền mặt tại quầy', bankName: 'Tiền mặt', accountNumber: 'TIENMAT', accountHolder: 'Quầy Thu Ngân', balance: 0 }
];

export const AppProvider = ({ children }) => {
  // Default: null so user sees the login page first
  const [user, setUser] = useState(null);

  const [activeTab, setActiveTab] = useState('home');
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [staff, setStaff] = useState(DEFAULT_STAFF);
  const [bankAccounts, setBankAccounts] = useState(DEFAULT_BANK_ACCOUNTS);
  const [toasts, setToasts] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedStaffCommission, setSelectedStaffCommission] = useState(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Toast helper
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Currency Formatter
  const formatVND = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '0đ';
    return Number(value).toLocaleString('vi-VN') + 'đ';
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    return Number(value).toLocaleString('vi-VN');
  };

  // Role permissions checker
  const hasPermission = (tabKey, currentRole = user?.role) => {
    if (!currentRole) return false;
    if (currentRole === 'chu') return true;
    if (currentRole === 'ql') {
      return !['businessReport', 'settings'].includes(tabKey);
    }
    if (currentRole === 'nhanvien') {
      return !['invoicesList', 'businessReport', 'settings'].includes(tabKey);
    }
    return false;
  };

  // Safe navigation with permission check
  const navigateToTab = (tabKey) => {
    if (!hasPermission(tabKey)) {
      addToast('Bạn không có quyền truy cập vào mục này!', 'error');
      return;
    }
    setActiveTab(tabKey);
  };

  // Switch role directly
  const switchRole = (newRole) => {
    const roleProfiles = {
      chu: { id: 1, username: 'chu', name: 'Hiền Xinh (Chủ)', role: 'chu', avatar: 'H' },
      ql: { id: 3, username: 'quanly', name: 'Thanh Tú (QL)', role: 'ql', avatar: 'T' },
      nhanvien: { id: 5, username: 'nhanvien', name: 'Nguyễn Thảo (NV)', role: 'nhanvien', avatar: 'N' }
    };
    const newProfile = roleProfiles[newRole] || roleProfiles.chu;
    setUser(newProfile);
    addToast(`Đã chuyển sang vai trò: ${newRole === 'chu' ? 'Chủ' : newRole === 'ql' ? 'Quản lý' : 'Nhân viên'}`, 'info');

    if (!hasPermission(activeTab, newRole)) {
      setActiveTab('home');
    }
  };

  // Login handler with Supabase support
  const login = async (username, password) => {
    // 1. Try Supabase Auth/Users table first
    const sbUser = await supabaseService.login(username, password);
    if (sbUser) {
      setUser(sbUser);
      addToast(`Xin chào ${sbUser.name}! Đăng nhập thành công qua Supabase.`, 'success');
      setActiveTab('home');
      return true;
    }

    // 2. Fallback to local server API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        addToast(`Xin chào ${data.user.name}! Đăng nhập thành công.`, 'success');
        setActiveTab('home');
        return true;
      }
    } catch (err) {}

    // 3. Fallback to local predefined accounts
    const u = (username || '').toLowerCase().trim();
    if (password === '123456') {
      let matchedRole = 'nhanvien';
      let name = 'Nhân viên';
      let avatar = 'N';
      if (u.includes('chu') || u.includes('admin')) {
        matchedRole = 'chu';
        name = 'Hiền Xinh (Chủ)';
        avatar = 'H';
      } else if (u.includes('ql') || u.includes('quanly')) {
        matchedRole = 'ql';
        name = 'Thanh Tú (QL)';
        avatar = 'T';
      } else {
        name = 'Nguyễn Thảo (NV)';
        avatar = 'N';
      }
      const localProfile = { id: Date.now(), username, name, role: matchedRole, avatar };
      setUser(localProfile);
      addToast(`Đăng nhập thành công với vai trò ${matchedRole}!`, 'success');
      setActiveTab('home');
      return true;
    }

    addToast('Tài khoản hoặc mật khẩu không chính xác!', 'error');
    return false;
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    addToast('Đã đăng xuất khỏi hệ thống.', 'info');
  };

  // Fetch all data (Supabase First, Local Fallback Second)
  const loadData = async () => {
    try {
      // 1. Tải trực tiếp từ Supabase Cloud
      const [sbCust, sbInv, sbExp, sbSrv, sbStf, sbBnk] = await Promise.all([
        supabaseService.getCustomers(),
        supabaseService.getInvoices(),
        supabaseService.getExpenses(),
        supabaseService.getServices(),
        supabaseService.getStaff(),
        supabaseService.getBankAccounts()
      ]);

      let hasSupabaseData = false;
      if (sbCust !== null) { setCustomers(sbCust); hasSupabaseData = true; }
      if (sbInv !== null) { setInvoices(sbInv); hasSupabaseData = true; }
      if (sbExp !== null) { setExpenses(sbExp); hasSupabaseData = true; }
      if (sbSrv !== null && sbSrv.length > 0) { setServices(sbSrv); hasSupabaseData = true; }
      if (sbStf !== null && sbStf.length > 0) { setStaff(sbStf); hasSupabaseData = true; }
      if (sbBnk !== null && sbBnk.length > 0) { setBankAccounts(sbBnk); hasSupabaseData = true; }

      if (hasSupabaseData) {
        console.log('✅ Đã đồng bộ dữ liệu từ Supabase Cloud thành công!');
        return;
      }
    } catch (err) {
      console.warn('Supabase offline or tables not created, falling back to local API:', err);
    }

    // 2. Fallback to Local Express API
    try {
      const [custRes, invRes, expRes, srvRes, stfRes, bnkRes] = await Promise.all([
        fetch('/api/customers').then(r => r.json()).catch(() => []),
        fetch('/api/invoices').then(r => r.json()).catch(() => []),
        fetch('/api/expenses').then(r => r.json()).catch(() => []),
        fetch('/api/services').then(r => r.json()).catch(() => DEFAULT_SERVICES),
        fetch('/api/staff').then(r => r.json()).catch(() => DEFAULT_STAFF),
        fetch('/api/bank-accounts').then(r => r.json()).catch(() => DEFAULT_BANK_ACCOUNTS)
      ]);

      setCustomers(Array.isArray(custRes) ? custRes : []);
      setInvoices(Array.isArray(invRes) ? invRes : []);
      setExpenses(Array.isArray(expRes) ? expRes : []);
      if (srvRes && srvRes.length > 0) setServices(srvRes);
      if (stfRes && stfRes.length > 0) setStaff(stfRes);
      if (bnkRes && bnkRes.length > 0) setBankAccounts(bnkRes);
    } catch (err) {
      console.log('Using default mock data:', err);
    }
  };

  // Add Staff Member (Supabase + Local sync)
  const addStaff = async (staffData) => {
    const initials = (staffData.name || '').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const newStf = {
      id: staffData.id || ('NV' + String(staff.length + 1).padStart(2, '0')),
      name: staffData.name,
      role: staffData.role || 'Tư vấn & Kỹ thuật viên',
      phone: staffData.phone || '',
      initials,
      color: 'bg-rose-600',
      commissionRate: staffData.commissionRate || 5
    };

    // 1. Supabase
    try {
      const sbStaff = await supabaseService.addStaff(newStf);
      if (sbStaff) {
        fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStf)
        }).catch(() => {});
        setStaff(prev => [...prev, sbStaff]);
        addToast(`Đã lưu nhân viên lên Supabase: ${sbStaff.name}`, 'success');
        return sbStaff;
      }
    } catch (e) {}

    // 2. Local Server
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStf)
      });
      const data = await res.json();
      if (data.success && data.staff) {
        setStaff(prev => [...prev, data.staff]);
        addToast(`Đã thêm nhân viên: ${data.staff.name}`, 'success');
        return data.staff;
      }
    } catch (e) {}

    setStaff(prev => [...prev, newStf]);
    addToast(`Đã thêm nhân viên mới: ${newStf.name}`, 'success');
    return newStf;
  };

  // Add Bank Account (Supabase + Local sync)
  const addBankAccount = async (bankData) => {
    const newAcc = {
      id: bankData.id || ('acc' + (bankAccounts.length + 1)),
      name: bankData.name || `${bankData.bankName} Spa`,
      bankName: bankData.bankName,
      accountNumber: bankData.accountNumber,
      accountHolder: (bankData.accountHolder || 'HIEN XINH').toUpperCase(),
      balance: 0
    };

    // 1. Supabase
    try {
      const sbAcc = await supabaseService.addBankAccount(newAcc);
      if (sbAcc) {
        fetch('/api/bank-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAcc)
        }).catch(() => {});
        setBankAccounts(prev => [...prev, sbAcc]);
        addToast(`Đã lưu tài khoản lên Supabase: ${sbAcc.name}`, 'success');
        return sbAcc;
      }
    } catch (e) {}

    // 2. Local Server
    try {
      const res = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAcc)
      });
      const data = await res.json();
      if (data.success && data.account) {
        setBankAccounts(prev => [...prev, data.account]);
        addToast(`Đã thêm thông tin ngân hàng: ${data.account.name}`, 'success');
        return data.account;
      }
    } catch (e) {}

    setBankAccounts(prev => [...prev, newAcc]);
    addToast(`Đã thêm tài khoản: ${newAcc.name}`, 'success');
    return newAcc;
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add Invoice & Auto-collect Customer (Supabase + Local sync)
  const addInvoice = async (invoiceData) => {
    const newCode = invoiceData.code || ('HD' + String(invoices.length + 322).padStart(6, '0'));
    const newDate = invoiceData.date || new Date().toLocaleDateString('vi-VN');
    const tot = Number(invoiceData.totalAmount) || 0;
    const paid = invoiceData.paidAmount !== undefined ? Number(invoiceData.paidAmount) : tot;
    const rem = invoiceData.remainingAmount !== undefined ? Number(invoiceData.remainingAmount) : Math.max(0, tot - paid);
    const status = invoiceData.status || (rem === 0 ? 'Đã thanh toán' : (paid > 0 ? 'Còn nợ' : 'Chưa thanh toán'));

    const fullInv = {
      ...invoiceData,
      code: newCode,
      date: newDate,
      totalAmount: tot,
      paidAmount: paid,
      remainingAmount: rem,
      status,
      serviceSummary: invoiceData.serviceSummary || (invoiceData.services || []).map(s => s.name).join(', ')
    };

    // 1. GUARANTEED: Update local customers state immediately!
    const cleanPhone = (fullInv.customerPhone || '').replace(/\s+/g, '');
    if (cleanPhone) {
      setCustomers(prev => {
        const idx = prev.findIndex(c => (c.phone || '').replace(/\s+/g, '') === cleanPhone);
        if (idx >= 0) {
          const existing = prev[idx];
          const updated = {
            ...existing,
            name: fullInv.customerName || existing.name,
            dob: fullInv.customerDob || existing.dob || existing.birthdate || '',
            birthdate: fullInv.customerDob || existing.birthdate || existing.dob || '',
            totalSpent: (Number(existing.totalSpent) || 0) + tot,
            visitCount: (Number(existing.visitCount) || 0) + 1,
            lastVisit: fullInv.date
          };
          const copy = [...prev];
          copy[idx] = updated;
          return copy;
        } else {
          const newCust = {
            id: Date.now(),
            name: fullInv.customerName,
            phone: fullInv.customerPhone,
            dob: fullInv.customerDob || '',
            birthdate: fullInv.customerDob || '',
            group: 'Khách mới',
            source: 'Tại quầy',
            address: '',
            notes: `Hóa đơn ${fullInv.code}`,
            totalSpent: tot,
            visitCount: 1,
            lastVisit: fullInv.date,
            createdAt: new Date().toISOString()
          };
          return [newCust, ...prev];
        }
      });
    }

    // 2. GUARANTEED: Update local invoices state immediately!
    setInvoices(prev => [fullInv, ...prev.filter(inv => inv.id !== fullInv.id && inv.code !== fullInv.code)]);

    // 3. Persist to Supabase Cloud in background
    try {
      const sbInv = await supabaseService.addInvoice(fullInv);
      if (sbInv && cleanPhone) {
        const existingCust = customers.find(c => (c.phone || '').replace(/\s+/g, '') === cleanPhone);
        if (existingCust) {
          await supabaseService.updateCustomer(existingCust.id, {
            totalSpent: (Number(existingCust.totalSpent) || 0) + tot,
            visitCount: (Number(existingCust.visitCount) || 0) + 1,
            lastVisit: fullInv.date
          });
        } else {
          await supabaseService.addCustomer({
            name: fullInv.customerName,
            phone: fullInv.customerPhone,
            dob: fullInv.customerDob || '',
            birthdate: fullInv.customerDob || '',
            customer_group: 'Khách mới',
            source: 'Tại quầy',
            total_spent: tot,
            visit_count: 1,
            last_visit: fullInv.date
          });
        }

        await supabaseService.addDailyTransaction({
          date: fullInv.date,
          type: 'income',
          amount: paid,
          content: `Thanh toán ${fullInv.code}`,
          referenceCode: fullInv.code,
          accountName: fullInv.bankAccount || fullInv.paymentMethod
        });
      }
    } catch (e) {
      console.warn('Supabase addInvoice sync error:', e);
    }

    // 4. Persist to local express server
    fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullInv)
    }).catch(() => {});

    addToast('Lưu hóa đơn thành công! Thông tin khách hàng đã tự động xuất hiện tại Tab Khách hàng.', 'success');
    if (hasPermission('invoicesList')) {
      setActiveTab('invoicesList');
    } else {
      setActiveTab('home');
    }
    return true;
  };

  // Delete invoice (Supabase + Local)
  const deleteInvoice = async (id) => {
    await supabaseService.deleteInvoice(id);
    fetch(`/api/invoices/${id}`, { method: 'DELETE' }).catch(() => {});
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    addToast('Đã xóa hóa đơn thành công!', 'info');
  };

  // Add / Edit / Delete Customer (Supabase + Local)
  const addCustomer = async (custData) => {
    // 1. Supabase
    try {
      const sbCust = await supabaseService.addCustomer(custData);
      if (sbCust) {
        fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(custData)
        }).catch(() => {});
        addToast('Thêm khách hàng lên Supabase thành công!', 'success');
        await loadData();
        return true;
      }
    } catch (e) {}

    // 2. Local server
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custData)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Thêm khách hàng mới thành công!', 'success');
        loadData();
        return true;
      }
    } catch (e) {}

    // 3. In-memory
    const newCust = { id: Date.now(), ...custData, created_at: new Date().toISOString().split('T')[0] };
    setCustomers(prev => [newCust, ...prev]);
    addToast('Thêm khách hàng thành công!', 'success');
    return true;
  };

  const updateCustomer = async (id, custData) => {
    await supabaseService.updateCustomer(id, custData);
    fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custData)
    }).catch(() => {});
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...custData } : c));
    addToast('Cập nhật khách hàng thành công!', 'success');
  };

  const deleteCustomer = async (id) => {
    await supabaseService.deleteCustomer(id);
    fetch(`/api/customers/${id}`, { method: 'DELETE' }).catch(() => {});
    setCustomers(prev => prev.filter(c => c.id !== id));
    addToast('Đã xóa khách hàng thành công!', 'info');
  };

  // Add / Edit / Delete Expense (Supabase + Local)
  const addExpense = async (expenseData) => {
    const newCode = expenseData.code || ('CP' + String(expenses.length + 1).padStart(6, '0'));
    const fullExp = { ...expenseData, code: newCode };

    // 1. Supabase
    try {
      const sbExp = await supabaseService.addExpense(fullExp);
      if (sbExp) {
        await supabaseService.addDailyTransaction({
          date: fullExp.date,
          type: 'expense',
          amount: Number(fullExp.amount || 0),
          content: fullExp.content,
          referenceCode: fullExp.code,
          accountName: 'Chi phí vận hành'
        });

        fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullExp)
        }).catch(() => {});

        addToast('Thêm khoản chi phí lên Supabase thành công!', 'success');
        await loadData();
        return true;
      }
    } catch (e) {}

    // 2. Local Server
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullExp)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Thêm khoản chi phí thành công!', 'success');
        loadData();
        return true;
      }
    } catch (e) {}

    // 3. In-memory
    setExpenses(prev => [fullExp, ...prev]);
    addToast('Thêm chi phí thành công!', 'success');
    return true;
  };

  const deleteExpense = async (id) => {
    await supabaseService.deleteExpense(id);
    fetch(`/api/expenses/${id}`, { method: 'DELETE' }).catch(() => {});
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    addToast('Đã xóa khoản chi phí.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        switchRole,
        activeTab,
        setActiveTab: navigateToTab,
        hasPermission,
        isReportDropdownOpen,
        setIsReportDropdownOpen,
        customers,
        invoices,
        expenses,
        services,
        setServices,
        staff,
        addStaff,
        bankAccounts,
        addBankAccount,
        addInvoice,
        deleteInvoice,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addExpense,
        deleteExpense,
        formatVND,
        formatNumber,
        toasts,
        addToast,
        removeToast,
        selectedInvoice,
        setSelectedInvoice,
        selectedStaffCommission,
        setSelectedStaffCommission,
        globalSearchQuery,
        setGlobalSearchQuery,
        loadData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
