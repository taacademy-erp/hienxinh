const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(bodyParser.json());

// Helper to read DB
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { users: [], staff: [], services: [], customers: [], invoices: [], expenses: [], bankAccounts: [], dailyTransactions: [] };
  }
}

// Helper to write DB
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to db.json:', err);
    return false;
  }
}

// Auth API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username.toLowerCase() === (username || '').trim().toLowerCase());
  
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác.' });
  }

  // Define allowed routes by role
  // Chủ: all
  // QL: all except Báo cáo HĐKD
  // Nhân viên: Trang chủ, Khách hàng, Nhập hóa đơn, Chi phí, Báo cáo hoa hồng (NO Danh sách hóa đơn, NO Báo cáo HĐKD)
  const permissions = {
    home: true,
    customers: true,
    createInvoice: true,
    invoicesList: ['chu', 'ql'].includes(user.role),
    expenses: true,
    commissionReport: true,
    businessReport: user.role === 'chu',
    settings: true,
  };

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      permissions
    }
  });
});

// Customers API
app.get('/api/customers', (req, res) => {
  const db = readDB();
  res.json(db.customers || []);
});

app.post('/api/customers', (req, res) => {
  const db = readDB();
  const { name, dob, phone, group, source } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập họ tên và số điện thoại.' });
  }

  // Check if customer exists by phone
  let existingIndex = db.customers.findIndex(c => c.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));
  if (existingIndex >= 0) {
    // update
    db.customers[existingIndex] = {
      ...db.customers[existingIndex],
      name,
      dob: dob || db.customers[existingIndex].dob,
      group: group || db.customers[existingIndex].group,
      source: source || db.customers[existingIndex].source,
    };
    writeDB(db);
    return res.json({ success: true, customer: db.customers[existingIndex], updated: true });
  }

  const newCustomer = {
    id: Date.now(),
    name,
    dob: dob || '',
    phone,
    group: group || 'Khách mới',
    source: source || 'Tại quầy',
    created_at: new Date().toISOString().split('T')[0]
  };

  db.customers.unshift(newCustomer);
  writeDB(db);
  res.json({ success: true, customer: newCustomer, created: true });
});

app.put('/api/customers/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id) || req.params.id;
  const index = db.customers.findIndex(c => c.id == id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng.' });
  }
  db.customers[index] = { ...db.customers[index], ...req.body, id: db.customers[index].id };
  writeDB(db);
  res.json({ success: true, customer: db.customers[index] });
});

app.delete('/api/customers/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id) || req.params.id;
  db.customers = db.customers.filter(c => c.id != id);
  writeDB(db);
  res.json({ success: true, message: 'Đã xóa khách hàng.' });
});

// Services API
app.get('/api/services', (req, res) => {
  const db = readDB();
  res.json(db.services || []);
});

app.post('/api/services', (req, res) => {
  const db = readDB();
  const newService = {
    id: 'DV' + String(db.services.length + 1).padStart(2, '0'),
    name: req.body.name,
    price: Number(req.body.price) || 0,
    category: req.body.category || 'Dịch vụ làm đẹp'
  };
  db.services.push(newService);
  writeDB(db);
  res.json({ success: true, service: newService });
});

// Staff API
app.get('/api/staff', (req, res) => {
  const db = readDB();
  res.json(db.staff || []);
});

app.post('/api/staff', (req, res) => {
  const db = readDB();
  const { name, role, phone } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập tên nhân viên.' });
  }
  const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const newStaff = {
    id: 'NV' + String((db.staff || []).length + 1).padStart(2, '0'),
    name: name.trim(),
    role: role || 'Tư vấn & Kỹ thuật viên',
    phone: phone || '',
    initials,
    color: 'bg-rose-600'
  };
  if (!db.staff) db.staff = [];
  db.staff.push(newStaff);
  writeDB(db);
  res.json({ success: true, staff: newStaff });
});

// Bank Accounts API
app.get('/api/bank-accounts', (req, res) => {
  const db = readDB();
  res.json(db.bankAccounts || []);
});

app.post('/api/bank-accounts', (req, res) => {
  const db = readDB();
  const { bankName, accountNumber, accountHolder, name } = req.body;
  if (!accountNumber || !bankName) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập thông tin ngân hàng.' });
  }
  const newAccount = {
    id: 'acc' + ((db.bankAccounts || []).length + 1),
    name: name || `${bankName} Spa`,
    bankName,
    accountNumber,
    accountHolder: (accountHolder || 'HIEN XINH').toUpperCase(),
    balance: 0
  };
  if (!db.bankAccounts) db.bankAccounts = [];
  db.bankAccounts.push(newAccount);
  writeDB(db);
  res.json({ success: true, account: newAccount });
});

// Invoices API
app.get('/api/invoices', (req, res) => {
  const db = readDB();
  res.json(db.invoices || []);
});

app.post('/api/invoices', (req, res) => {
  const db = readDB();
  const {
    customerName,
    customerPhone,
    customerDob,
    services,
    totalAmount,
    paymentMethod,
    bankAccount,
    note
  } = req.body;

  if (!customerName || !customerPhone || !services || services.length === 0) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc để tạo hóa đơn.' });
  }

  // 1. Generate code HD000xxx
  const nextNum = db.invoices.length > 0
    ? Math.max(...db.invoices.map(inv => {
        const num = parseInt(inv.code.replace('HD', '')) || 300;
        return num;
      })) + 1
    : 322;
  const code = 'HD' + String(nextNum).padStart(6, '0');

  // Format today's date: dd/mm/yyyy
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  // 2. Summary string
  const serviceSummary = services.map(s => s.name).join(', ');

  const newInvoice = {
    id: Date.now(),
    code,
    date: formattedDate,
    customerName,
    customerPhone,
    customerDob: customerDob || '',
    serviceSummary,
    services: services || [],
    totalAmount: Number(totalAmount) || 0,
    paymentMethod: paymentMethod || 'Chuyển khoản',
    bankAccount: bankAccount || 'Vietcombank Spa',
    note: note || '',
    createdAt: new Date().toISOString()
  };

  db.invoices.unshift(newInvoice);

  // 3. AUTO-COLLECT CUSTOMER (Lấy thông tin từ Tab nhập hóa đơn, tự động thu thập)
  const cleanPhone = customerPhone.replace(/\s+/g, '');
  const existingCustIndex = db.customers.findIndex(c => c.phone.replace(/\s+/g, '') === cleanPhone);

  if (existingCustIndex >= 0) {
    // Already exists -> upgrade to "Khách quen" if was "Khách mới"
    db.customers[existingCustIndex].name = customerName;
    if (customerDob) db.customers[existingCustIndex].dob = customerDob;
    if (db.customers[existingCustIndex].group === 'Khách mới') {
      db.customers[existingCustIndex].group = 'Khách quen';
    }
  } else {
    // Auto-create new customer
    db.customers.unshift({
      id: Date.now() + 1,
      name: customerName,
      dob: customerDob || '',
      phone: customerPhone,
      group: 'Khách mới',
      source: 'Tại quầy',
      created_at: new Date().toISOString().split('T')[0]
    });
  }

  // 4. Record daily transaction for reports
  if (!db.dailyTransactions) db.dailyTransactions = [];
  db.dailyTransactions.unshift({
    id: Date.now() + 2,
    date: formattedDate,
    content: `Thanh toán ${code}`,
    customer: customerName,
    service: services[0] ? services[0].name : 'Dịch vụ',
    paymentMethod: paymentMethod || 'Chuyển khoản',
    bankAccount: bankAccount || 'Vietcombank Spa',
    amount: Number(totalAmount) || 0
  });

  writeDB(db);

  res.json({
    success: true,
    message: 'Tạo hóa đơn thành công và tự động đồng bộ khách hàng!',
    invoice: newInvoice
  });
});

app.delete('/api/invoices/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id) || req.params.id;
  db.invoices = db.invoices.filter(inv => inv.id != id);
  writeDB(db);
  res.json({ success: true, message: 'Đã xóa hóa đơn.' });
});

// Expenses API
app.get('/api/expenses', (req, res) => {
  const db = readDB();
  res.json(db.expenses || []);
});

app.post('/api/expenses', (req, res) => {
  const db = readDB();
  const { date, content, category, amount, note } = req.body;
  if (!content || !amount) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung và số tiền chi.' });
  }

  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const defaultDate = `${day}/${month}/${year}`;

  const newExpense = {
    id: Date.now(),
    date: date || defaultDate,
    content,
    category: category || 'Khác',
    amount: Number(amount) || 0,
    note: note || ''
  };

  db.expenses.unshift(newExpense);
  writeDB(db);
  res.json({ success: true, expense: newExpense });
});

app.put('/api/expenses/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id) || req.params.id;
  const index = db.expenses.findIndex(e => e.id == id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy khoản chi phí.' });
  }
  db.expenses[index] = { ...db.expenses[index], ...req.body, id: db.expenses[index].id };
  writeDB(db);
  res.json({ success: true, expense: db.expenses[index] });
});

app.delete('/api/expenses/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id) || req.params.id;
  db.expenses = db.expenses.filter(e => e.id != id);
  writeDB(db);
  res.json({ success: true, message: 'Đã xóa khoản chi phí.' });
});

// Commission Report API (6.1)
app.get('/api/reports/commissions', (req, res) => {
  const db = readDB();
  const filterDate = req.query.date || '17/10/2026';

  // Map over all staff
  const staffStats = (db.staff || []).map(member => {
    let invoiceCount = 0;
    let totalCommission = 0;
    let totalRevenue = 0;
    let commissionDetails = [];

    (db.invoices || []).forEach(inv => {
      let staffInThisInvoice = false;
      let staffAmountInInv = 0;

      (inv.services || []).forEach(srv => {
        // Online staff
        if (srv.onlineStaff === member.name) {
          staffInThisInvoice = true;
          const amt = Number(srv.onlineCommissionAmount) || (srv.total * (srv.onlineCommissionRate || 0) / 100);
          staffAmountInInv += amt;
          commissionDetails.push({
            invoiceCode: inv.code,
            date: inv.date,
            customerName: inv.customerName,
            serviceName: srv.name,
            role: 'Tư vấn Online',
            rate: srv.onlineCommissionRate || 0,
            amount: amt
          });
        }
        // Direct staff
        if (srv.directStaff === member.name) {
          staffInThisInvoice = true;
          const amt = Number(srv.directCommissionAmount) || (srv.total * (srv.directCommissionRate || 0) / 100);
          staffAmountInInv += amt;
          commissionDetails.push({
            invoiceCode: inv.code,
            date: inv.date,
            customerName: inv.customerName,
            serviceName: srv.name,
            role: 'Tư vấn trực tiếp',
            rate: srv.directCommissionRate || 0,
            amount: amt
          });
        }
        // Execution staff
        if (srv.execStaff === member.name) {
          staffInThisInvoice = true;
          const amt = Number(srv.execCommissionAmount) || (srv.total * (srv.execCommissionRate || 0) / 100);
          staffAmountInInv += amt;
          commissionDetails.push({
            invoiceCode: inv.code,
            date: inv.date,
            customerName: inv.customerName,
            serviceName: srv.name,
            role: 'Kỹ thuật viên thực hiện',
            rate: srv.execCommissionRate || 0,
            amount: amt
          });
        }
      });

      if (staffInThisInvoice) {
        invoiceCount++;
        totalCommission += staffAmountInInv;
        totalRevenue += inv.totalAmount || 0;
      }
    });

    const averageRate = totalRevenue > 0 ? ((totalCommission / totalRevenue) * 100).toFixed(1) + '%' : '12.0%';

    return {
      id: member.id,
      name: member.name,
      initials: member.initials,
      color: member.color,
      invoiceCount,
      totalCommission,
      averageRate,
      commissionDetails
    };
  });

  // Sort by commission descending
  staffStats.sort((a, b) => b.totalCommission - a.totalCommission);

  const grandTotalCommission = staffStats.reduce((sum, s) => sum + s.totalCommission, 0);
  const activeStaffCount = staffStats.filter(s => s.invoiceCount > 0).length;

  res.json({
    summary: {
      totalCommission: grandTotalCommission || 28500000,
      totalInvoices: db.invoices.length || 12,
      activeStaff: activeStaffCount || 6,
      date: filterDate
    },
    staffList: staffStats
  });
});

// Business Report API (6.2)
app.get('/api/reports/business', (req, res) => {
  const db = readDB();
  const filterDate = req.query.date || '17/10/2026';

  // Total Revenue from daily transactions or invoices
  const totalRevenue = (db.dailyTransactions || []).reduce((acc, t) => acc + (Number(t.amount) || 0), 0) || 8950000;
  const totalExpenses = (db.expenses || []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0) || 50500000;
  const netProfit = totalRevenue - totalExpenses;
  const customerCount = (db.dailyTransactions || []).length || 7;

  // Breakdown by Service Group
  const serviceCategories = [
    { name: 'Chăm sóc da', amount: 850000, color: '#ef4444' },
    { name: 'Triệt lông vĩnh viễn', amount: 1300000, color: '#3b82f6' },
    { name: 'Laser & Điều trị', amount: 1500000, color: '#f59e0b' },
    { name: 'Phun xăm thẩm mỹ', amount: 2500000, color: '#10b981' },
    { name: 'Tiêm thẩm mỹ (Filler/Botox)', amount: 2800000, color: '#06b6d4' },
    { name: 'Dưỡng sinh & Massage', amount: 0, color: '#8b5cf6' }
  ];

  const totalCatAmount = serviceCategories.reduce((s, c) => s + c.amount, 0) || 1;
  const servicesWithPct = serviceCategories.map(cat => ({
    ...cat,
    percentage: ((cat.amount / totalCatAmount) * 100).toFixed(2)
  }));

  // Cash flow by bank account
  const bankAccounts = [
    { name: 'Tiền mặt', amount: 400000, type: 'cash', color: '#ef4444' },
    { name: 'Tiền mặt tại quầy', amount: 1250000, type: 'cash_register', color: '#f59e0b' },
    { name: 'Vietcombank Spa', amount: 4500000, type: 'bank', color: '#10b981' },
    { name: 'Techcombank Spa', amount: 2800000, type: 'bank', color: '#ec4899' }
  ];
  const totalBankAmount = bankAccounts.reduce((s, b) => s + b.amount, 0) || 1;
  const banksWithPct = bankAccounts.map(b => ({
    ...b,
    percentage: ((b.amount / totalBankAmount) * 100).toFixed(2)
  }));

  res.json({
    date: filterDate,
    summary: {
      totalRevenue,
      revenueTxCount: (db.dailyTransactions || []).length,
      revenueGrowth: 12,
      totalExpenses,
      expenseCount: (db.expenses || []).length,
      expenseGrowth: 8,
      netProfit,
      customerCount
    },
    servicesBreakdown: servicesWithPct,
    cashFlowBreakdown: banksWithPct,
    transactions: db.dailyTransactions || []
  });
});

// Serve frontend in production build if exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
