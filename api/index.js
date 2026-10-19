// Vercel Serverless Function — bao gồm toàn bộ API routes của server.js
// File system trên Vercel là READ-ONLY → không thể ghi db.json
// Tất cả dữ liệu thực tế lưu qua Supabase; file này chỉ trả về fallback data

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://khulunssdjnckelwhcww.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_TgaFe-4QlZucygM1xC7BLQ_vBYF5Jaa';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Predefined accounts (fallback nếu Supabase không có bảng users)
const LOCAL_USERS = [
  { id: 1, username: 'chu', password: '123456', name: 'Hiền Xinh (Chủ)', role: 'chu', avatar: 'H', phone: '' },
  { id: 2, username: 'ql', password: '123456', name: 'Thanh Tú (QL)', role: 'ql', avatar: 'T', phone: '' },
  { id: 3, username: 'nhanvien', password: '123456', name: 'Nguyễn Thảo (NV)', role: 'nhanvien', avatar: 'N', phone: '' }
];

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { resolve({}); }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(statusCode).json(data);
}

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  const url = req.url || '';
  const method = req.method || 'GET';

  // Parse path (remove /api prefix)
  const path = url.replace(/^\/api/, '').split('?')[0];

  // ===== AUTH =====
  if (path === '/auth/login' && method === 'POST') {
    const body = await parseBody(req);
    const { username, password } = body;

    // Try Supabase users table first
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', (username || '').trim())
        .maybeSingle();

      if (!error && data && data.password === password) {
        return sendJSON(res, 200, {
          success: true,
          user: { id: data.id, username: data.username, name: data.name, role: data.role, avatar: data.avatar || 'U', phone: data.phone || '' }
        });
      }
    } catch (e) {}

    // Fallback to local predefined accounts
    const u = LOCAL_USERS.find(u => u.username.toLowerCase() === (username || '').toLowerCase().trim());
    if (u && u.password === password) {
      return sendJSON(res, 200, {
        success: true,
        user: { id: u.id, username: u.username, name: u.name, role: u.role, avatar: u.avatar, phone: u.phone }
      });
    }

    return sendJSON(res, 401, { success: false, message: 'Tài khoản hoặc mật khẩu không chính xác.' });
  }

  // ===== CUSTOMERS =====
  if (path === '/customers' && method === 'GET') {
    try {
      const { data, error } = await supabase.from('customers').select('*').order('id', { ascending: false });
      if (!error && data) return sendJSON(res, 200, data);
    } catch (e) {}
    return sendJSON(res, 200, []);
  }

  if (path === '/customers' && method === 'POST') {
    const body = await parseBody(req);
    try {
      const { data, error } = await supabase.from('customers').insert([{
        name: body.name, phone: body.phone,
        birthdate: body.dob || body.birthdate || '',
        customer_group: body.group || 'Khách mới',
        source: body.source || 'Tại quầy',
        total_spent: Number(body.totalSpent ?? 0),
        visit_count: Number(body.visitCount ?? 0),
        last_visit: body.lastVisit || ''
      }]).select().single();
      if (!error && data) return sendJSON(res, 200, { success: true, customer: data });
    } catch (e) {}
    return sendJSON(res, 200, { success: true, customer: body });
  }

  // ===== INVOICES =====
  if (path === '/invoices' && method === 'GET') {
    try {
      const { data, error } = await supabase.from('invoices').select('*').order('id', { ascending: false });
      if (!error && data) return sendJSON(res, 200, data);
    } catch (e) {}
    return sendJSON(res, 200, []);
  }

  if (path === '/invoices' && method === 'POST') {
    const body = await parseBody(req);
    try {
      const { data, error } = await supabase.from('invoices').insert([{
        code: body.code, date: body.date,
        customer_id: body.customerId || null,
        customer_name: body.customerName,
        customer_phone: body.customerPhone || '',
        customer_dob: body.customerDob || '',
        staff_id: body.staffId || null,
        staff_name: body.staffName || '',
        services: body.services || [],
        service_summary: body.serviceSummary || '',
        subtotal: Number(body.subtotal ?? 0),
        discount: Number(body.discount ?? 0),
        total_amount: Number(body.totalAmount ?? 0),
        paid_amount: Number(body.paidAmount ?? body.totalAmount ?? 0),
        remaining_amount: Number(body.remainingAmount ?? 0),
        payment_method: body.paymentMethod || 'Chuyển khoản',
        bank_account: body.bankAccount || '',
        notes: body.notes || '',
        status: body.status || 'Đã thanh toán',
        created_by: body.createdBy || ''
      }]).select().single();
      if (!error && data) return sendJSON(res, 200, { success: true, invoice: data });
    } catch (e) {}
    return sendJSON(res, 200, { success: true, invoice: body });
  }

  // ===== EXPENSES =====
  if (path === '/expenses' && method === 'GET') {
    try {
      const { data, error } = await supabase.from('expenses').select('*').order('id', { ascending: false });
      if (!error && data) return sendJSON(res, 200, data);
    } catch (e) {}
    return sendJSON(res, 200, []);
  }

  if (path === '/expenses' && method === 'POST') {
    const body = await parseBody(req);
    try {
      const { data, error } = await supabase.from('expenses').insert([{
        code: body.code, date: body.date,
        amount: Number(body.amount ?? 0),
        category: body.category, content: body.content,
        notes: body.notes || '', created_by: body.createdBy || ''
      }]).select().single();
      if (!error && data) return sendJSON(res, 200, { success: true, expense: data });
    } catch (e) {}
    return sendJSON(res, 200, { success: true, expense: body });
  }

  // ===== SERVICES =====
  if (path === '/services' && method === 'GET') {
    try {
      const { data, error } = await supabase.from('services').select('*');
      if (!error && data && data.length > 0) return sendJSON(res, 200, data);
    } catch (e) {}
    // Return default services
    return sendJSON(res, 200, [
      { id: 'DV01', name: 'Xóa lá thâm', price: 2000000, category: 'Phun xăm thẩm mỹ' },
      { id: 'DV02', name: 'Phun môi Tế bào gốc', price: 3300000, category: 'Phun xăm thẩm mỹ' },
      { id: 'DV03', name: 'Phun môi NaNoLips', price: 2800000, category: 'Phun xăm thẩm mỹ' },
      { id: 'DV12', name: 'Chăm sóc da chuyên sâu', price: 850000, category: 'Chăm sóc da' },
      { id: 'DV13', name: 'Triệt lông nách / Vĩnh viễn', price: 1300000, category: 'Triệt lông vĩnh viễn' },
      { id: 'DV14', name: 'Laser Pico & Điều trị nám', price: 1500000, category: 'Laser & Điều trị' },
      { id: 'DV15', name: 'Tiêm thẩm mỹ Filler môi/Botox', price: 2800000, category: 'Tiêm thẩm mỹ (Filler/Botox)' }
    ]);
  }

  // ===== STAFF =====
  if (path === '/staff' && method === 'GET') {
    try {
      const { data, error } = await supabase.from('staff').select('*');
      if (!error && data && data.length > 0) return sendJSON(res, 200, data);
    } catch (e) {}
    return sendJSON(res, 200, [
      { id: 'NV01', name: 'Nguyễn Thảo', initials: 'NT', color: 'bg-blue-600', role: 'Tư vấn Online & Trực tiếp', phone: '0901 111 001', commissionRate: 5 },
      { id: 'NV02', name: 'Trần Minh Anh', initials: 'MA', color: 'bg-purple-600', role: 'Tư vấn trực tiếp', phone: '0901 111 002', commissionRate: 5 },
      { id: 'NV03', name: 'Lê Thu Hà', initials: 'LH', color: 'bg-rose-600', role: 'Kỹ thuật viên chính', phone: '0901 111 003', commissionRate: 7 }
    ]);
  }

  // ===== BANK ACCOUNTS =====
  if (path === '/bank-accounts' && method === 'GET') {
    try {
      const { data, error } = await supabase.from('bank_accounts').select('*');
      if (!error && data && data.length > 0) return sendJSON(res, 200, data);
    } catch (e) {}
    return sendJSON(res, 200, [
      { id: 'acc1', name: 'Vietcombank Spa', bankName: 'Vietcombank (VCB)', accountNumber: '9988776655', accountHolder: 'NGUYEN THI HIEN', balance: 0 },
      { id: 'acc2', name: 'Techcombank Spa', bankName: 'Techcombank (TCB)', accountNumber: '1903668899', accountHolder: 'NGUYEN THI HIEN', balance: 0 },
      { id: 'acc3', name: 'Tiền mặt tại quầy', bankName: 'Tiền mặt', accountNumber: 'TIENMAT', accountHolder: 'Quầy Thu Ngân', balance: 0 }
    ]);
  }

  // 404 for unknown routes
  return sendJSON(res, 404, { error: 'API route not found', path, method });
};
