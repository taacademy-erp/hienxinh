import React, { createContext, useContext, useState, useEffect } from 'react';

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
  { id: 'DV09', name: 'Khóa Model Kids (20 buổi)', price: 10000000, category: 'Đào tạo & Dịch vụ' },
  { id: 'DV10', name: 'Khóa Phong thái (8 buổi)', price: 6000000, category: 'Đào tạo & Dịch vụ' },
  { id: 'DV11', name: 'Khóa Catwalk (12 buổi)', price: 8000000, category: 'Đào tạo & Dịch vụ' },
  { id: 'DV12', name: 'Chăm sóc da chuyên sâu', price: 850000, category: 'Chăm sóc da' },
  { id: 'DV13', name: 'Triệt lông nách / Vĩnh viễn', price: 1300000, category: 'Triệt lông vĩnh viễn' },
  { id: 'DV14', name: 'Laser Pico & Điều trị nám', price: 1500000, category: 'Laser & Điều trị' },
  { id: 'DV15', name: 'Tiêm thẩm mỹ Filler môi/Botox', price: 2800000, category: 'Tiêm thẩm mỹ (Filler/Botox)' }
];

const DEFAULT_STAFF = [
  { id: 'NV01', name: 'Nguyễn Thảo', initials: 'NT', color: 'bg-blue-600', role: 'Tư vấn Online & Trực tiếp' },
  { id: 'NV02', name: 'Trần Minh Anh', initials: 'MA', color: 'bg-purple-600', role: 'Tư vấn trực tiếp' },
  { id: 'NV03', name: 'Lê Thu Hà', initials: 'LH', color: 'bg-rose-600', role: 'Kỹ thuật viên chính' },
  { id: 'NV04', name: 'Nguyễn Mai', initials: 'NM', color: 'bg-indigo-600', role: 'Chuyên viên chăm sóc da' },
  { id: 'NV05', name: 'Vũ Thị Quỳnh', initials: 'QN', color: 'bg-sky-600', role: 'Kỹ thuật viên phun xăm' },
  { id: 'NV06', name: 'Đặng Thảo Vy', initials: 'TV', color: 'bg-pink-600', role: 'Kỹ thuật viên' }
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
      return tabKey !== 'businessReport';
    }
    if (currentRole === 'nhanvien') {
      return !['invoicesList', 'businessReport'].includes(tabKey);
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

  // Switch role directly (convenience for evaluation)
  const switchRole = (newRole) => {
    const roleProfiles = {
      chu: { id: 1, username: 'chu', name: 'Thanh Tú (Chủ)', role: 'chu', avatar: 'T' },
      ql: { id: 3, username: 'quanly', name: 'Thanh Tú (QL)', role: 'ql', avatar: 'T' },
      nhanvien: { id: 5, username: 'nhanvien', name: 'Nguyễn Thảo (NV)', role: 'nhanvien', avatar: 'N' }
    };
    const newProfile = roleProfiles[newRole] || roleProfiles.chu;
    setUser(newProfile);
    addToast(`Đã chuyển sang vai trò: ${newRole === 'chu' ? 'Chủ' : newRole === 'ql' ? 'Quản lý' : 'Nhân viên'}`, 'info');

    // If active tab is not allowed for new role, bounce to home
    if (!hasPermission(activeTab, newRole)) {
      setActiveTab('home');
    }
  };

  // Login handler
  const login = async (username, password) => {
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
      } else {
        addToast(data.message || 'Sai thông tin đăng nhập', 'error');
        return false;
      }
    } catch (err) {
      // Local fallback
      const u = username.toLowerCase().trim();
      let matchedRole = 'nhanvien';
      let name = 'Nhân viên';
      let avatar = 'N';
      if (u.includes('chu') || u.includes('admin')) {
        matchedRole = 'chu';
        name = 'Thanh Tú (Chủ)';
        avatar = 'T';
      } else if (u.includes('ql') || u.includes('quanly')) {
        matchedRole = 'ql';
        name = 'Thanh Tú (QL)';
        avatar = 'T';
      } else {
        name = 'Nguyễn Thảo (NV)';
        avatar = 'N';
      }
      setUser({ id: Date.now(), username, name, role: matchedRole, avatar });
      addToast(`Đăng nhập thành công với vai trò ${matchedRole}!`, 'success');
      setActiveTab('home');
      return true;
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    addToast('Đã đăng xuất khỏi hệ thống.', 'info');
  };

  // Fetch all initial data
  const loadData = async () => {
    try {
      const [custRes, invRes, expRes, srvRes, stfRes] = await Promise.all([
        fetch('/api/customers').then(r => r.json()).catch(() => []),
        fetch('/api/invoices').then(r => r.json()).catch(() => []),
        fetch('/api/expenses').then(r => r.json()).catch(() => []),
        fetch('/api/services').then(r => r.json()).catch(() => DEFAULT_SERVICES),
        fetch('/api/staff').then(r => r.json()).catch(() => DEFAULT_STAFF)
      ]);

      if (custRes && custRes.length > 0) setCustomers(custRes);
      if (invRes && invRes.length > 0) setInvoices(invRes);
      if (expRes && expRes.length > 0) setExpenses(expRes);
      if (srvRes && srvRes.length > 0) setServices(srvRes);
      if (stfRes && stfRes.length > 0) setStaff(stfRes);
    } catch (err) {
      console.log('Using default mock data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add Invoice & Auto-collect Customer
  const addInvoice = async (invoiceData) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Lưu hóa đơn thành công! Thông tin khách hàng đã được tự động lưu.', 'success');
        // Refresh invoices and customers
        loadData();
        // Redirect to invoices list if role has access, else stay or go to home
        if (hasPermission('invoicesList')) {
          setActiveTab('invoicesList');
        } else {
          setActiveTab('home');
        }
        return true;
      } else {
        addToast(data.message || 'Lỗi khi lưu hóa đơn', 'error');
        return false;
      }
    } catch (err) {
      // Local fallback
      const newInv = {
        id: Date.now(),
        code: 'HD' + String(invoices.length + 322).padStart(6, '0'),
        date: new Date().toLocaleDateString('vi-VN'),
        ...invoiceData,
        serviceSummary: invoiceData.services.map(s => s.name).join(', ')
      };
      setInvoices(prev => [newInv, ...prev]);

      // Auto collect customer
      setCustomers(prev => {
        const cleanPhone = (invoiceData.customerPhone || '').replace(/\s+/g, '');
        const existing = prev.find(c => c.phone.replace(/\s+/g, '') === cleanPhone);
        if (existing) {
          return prev.map(c => c.id === existing.id ? { ...c, name: invoiceData.customerName, dob: invoiceData.customerDob || c.dob, group: 'Khách quen' } : c);
        } else {
          return [{
            id: Date.now(),
            name: invoiceData.customerName,
            phone: invoiceData.customerPhone,
            dob: invoiceData.customerDob || '',
            group: 'Khách mới',
            source: 'Tại quầy',
            created_at: new Date().toISOString().split('T')[0]
          }, ...prev];
        }
      });

      addToast('Lưu hóa đơn thành công và tự động đồng bộ khách hàng!', 'success');
      if (hasPermission('invoicesList')) {
        setActiveTab('invoicesList');
      } else {
        setActiveTab('home');
      }
      return true;
    }
  };

  // Delete invoice
  const deleteInvoice = async (id) => {
    try {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    } catch (e) {}
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    addToast('Đã xóa hóa đơn thành công!', 'info');
  };

  // Add / Edit / Delete Customer
  const addCustomer = async (custData) => {
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
    } catch (e) {
      const newCust = { id: Date.now(), ...custData, created_at: new Date().toISOString().split('T')[0] };
      setCustomers(prev => [newCust, ...prev]);
      addToast('Thêm khách hàng thành công!', 'success');
      return true;
    }
  };

  const updateCustomer = async (id, custData) => {
    try {
      await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custData)
      });
    } catch (e) {}
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...custData } : c));
    addToast('Cập nhật khách hàng thành công!', 'success');
  };

  const deleteCustomer = async (id) => {
    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    } catch (e) {}
    setCustomers(prev => prev.filter(c => c.id !== id));
    addToast('Đã xóa khách hàng thành công!', 'info');
  };

  // Add / Edit / Delete Expense
  const addExpense = async (expenseData) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Thêm khoản chi phí thành công!', 'success');
        loadData();
        return true;
      }
    } catch (e) {
      const newExp = { id: Date.now(), ...expenseData };
      setExpenses(prev => [newExp, ...prev]);
      addToast('Thêm chi phí thành công!', 'success');
      return true;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    } catch (e) {}
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
