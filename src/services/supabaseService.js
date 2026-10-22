import { supabase } from '../lib/supabase.js';

// ==============================================================================
// FIELD NORMALIZERS (Chuyển đổi giữa snake_case của SQL và camelCase của UI)
// ==============================================================================

export const normalizeCustomer = (c) => {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    birthdate: c.birthdate || '',
    dob: c.birthdate || '',
    group: c.customer_group || c.group || 'Khách mới',
    source: c.source || 'Tại quầy',
    address: c.address || '',
    notes: c.notes || '',
    totalSpent: Number(c.total_spent ?? c.totalSpent ?? 0),
    visitCount: Number(c.visit_count ?? c.visitCount ?? 0),
    lastVisit: c.last_visit || c.lastVisit || '',
    createdAt: c.created_at || c.createdAt || new Date().toISOString()
  };
};

export const normalizeInvoice = (inv) => {
  if (!inv) return null;

  let rawNotes = inv.notes ?? inv.note ?? '';
  let payments = Array.isArray(inv.payments) ? inv.payments : [];

  // Trích xuất mảng đợt thanh toán từ chuỗi ghi chú nếu có
  if (payments.length === 0 && typeof rawNotes === 'string') {
    const paymentMatch = rawNotes.match(/<!--PAYMENTS:(.*?)-->/);
    if (paymentMatch) {
      try {
        payments = JSON.parse(paymentMatch[1]);
        rawNotes = rawNotes.replace(/<!--PAYMENTS:.*?-->/, '').trim();
      } catch (e) {}
    }
  }

  const tot = Number(inv.total_amount ?? inv.totalAmount ?? 0);
  const paid = Number(inv.paid_amount ?? inv.paidAmount ?? tot);
  const rem = Number(inv.remaining_amount ?? inv.remainingAmount ?? Math.max(0, tot - paid));

  // Nếu hóa đơn có số tiền đã trả nhưng chưa có mảng đợt thanh toán -> khởi tạo đợt 1 mặc định
  if (payments.length === 0 && paid > 0) {
    payments = [
      {
        id: 1,
        date: inv.date || new Date().toLocaleDateString('vi-VN'),
        time: 'Ban đầu',
        amount: paid,
        paymentMethod: inv.payment_method ?? inv.paymentMethod ?? 'Chuyển khoản',
        bankAccount: inv.bank_account ?? inv.bankAccount ?? '',
        note: 'Thanh toán đợt 1 khi lập hóa đơn'
      }
    ];
  }

  return {
    id: inv.id,
    code: inv.code,
    date: inv.date,
    customerId: inv.customer_id ?? inv.customerId,
    customerName: inv.customer_name ?? inv.customerName,
    customerPhone: inv.customer_phone ?? inv.customerPhone ?? '',
    customerDob: inv.customer_dob ?? inv.customerDob ?? '',
    staffId: inv.staff_id ?? inv.staffId ?? '',
    staffName: inv.staff_name ?? inv.staffName ?? '',
    services: Array.isArray(inv.services) ? inv.services : [],
    serviceSummary: inv.service_summary ?? inv.serviceSummary ?? '',
    subtotal: Number(inv.subtotal ?? 0),
    discount: Number(inv.discount ?? 0),
    totalAmount: tot,
    paidAmount: paid,
    remainingAmount: rem,
    paymentMethod: inv.payment_method ?? inv.paymentMethod ?? 'Chuyển khoản',
    bankAccount: inv.bank_account ?? inv.bankAccount ?? '',
    notes: rawNotes,
    note: rawNotes,
    payments,
    status: inv.status ?? (rem === 0 ? 'Đã thanh toán' : (paid > 0 ? 'Còn nợ' : 'Chưa thanh toán')),
    createdBy: inv.created_by ?? inv.createdBy ?? '',
    createdAt: inv.created_at || inv.createdAt || new Date().toISOString()
  };
};

export const normalizeExpense = (exp) => {
  if (!exp) return null;
  return {
    id: exp.id,
    code: exp.code,
    date: exp.date,
    amount: Number(exp.amount ?? 0),
    category: exp.category,
    content: exp.content,
    notes: exp.notes ?? '',
    createdBy: exp.created_by ?? exp.createdBy ?? '',
    createdAt: exp.created_at || exp.createdAt || new Date().toISOString()
  };
};

export const normalizeBankAccount = (acc) => {
  if (!acc) return null;
  return {
    id: acc.id,
    name: acc.name,
    bankName: acc.bank_name ?? acc.bankName,
    accountNumber: acc.account_number ?? acc.accountNumber,
    accountHolder: acc.account_holder ?? acc.accountHolder,
    balance: Number(acc.balance ?? 0)
  };
};

export const normalizeStaff = (stf) => {
  if (!stf) return null;
  return {
    id: stf.id,
    name: stf.name,
    initials: stf.initials || (stf.name || '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    color: stf.color || 'bg-rose-600',
    role: stf.role || 'Kỹ thuật viên',
    phone: stf.phone || '',
    commissionRate: Number(stf.commission_rate ?? stf.commissionRate ?? 5)
  };
};

// ==============================================================================
// SUPABASE CRUD OPERATIONS
// ==============================================================================

export const supabaseService = {
  // 1. AUTH / USERS
  async login(username, password) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', (username || '').trim())
        .maybeSingle();

      if (error || !data) return null;
      if (data.password !== password) return null;

      return {
        id: data.id,
        username: data.username,
        name: data.name,
        role: data.role,
        avatar: data.avatar || 'U',
        phone: data.phone || ''
      };
    } catch (e) {
      console.warn('Supabase login error:', e);
      return null;
    }
  },

  // 2. CUSTOMERS
  async getCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('id', { ascending: false });

      if (error || !data) return null;
      return data.map(normalizeCustomer);
    } catch (e) {
      console.warn('Supabase getCustomers error:', e);
      return null;
    }
  },

  async addCustomer(customer) {
    try {
      const payload = {
        name: customer.name,
        phone: customer.phone,
        birthdate: customer.birthdate || customer.dob || '',
        customer_group: customer.group || customer.customer_group || 'Khách mới',
        source: customer.source || 'Tại quầy',
        address: customer.address || '',
        notes: customer.notes || '',
        total_spent: Number(customer.totalSpent ?? 0),
        visit_count: Number(customer.visitCount ?? 0),
        last_visit: customer.lastVisit || ''
      };

      const { data, error } = await supabase
        .from('customers')
        .insert([payload])
        .select()
        .single();

      if (error || !data) throw error;
      return normalizeCustomer(data);
    } catch (e) {
      console.error('🔴 Supabase addCustomer FAILED:', {
        message: e?.message,
        code: e?.code,
        details: e?.details,
        hint: e?.hint,
        status: e?.status,
        full: e
      });
      return null;
    }
  },

  async updateCustomer(id, updates) {
    try {
      const payload = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.birthdate !== undefined || updates.dob !== undefined) payload.birthdate = updates.birthdate || updates.dob;
      if (updates.group !== undefined) payload.customer_group = updates.group;
      if (updates.source !== undefined) payload.source = updates.source;
      if (updates.address !== undefined) payload.address = updates.address;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.totalSpent !== undefined) payload.total_spent = Number(updates.totalSpent);
      if (updates.visitCount !== undefined) payload.visit_count = Number(updates.visitCount);
      if (updates.lastVisit !== undefined) payload.last_visit = updates.lastVisit;

      const { data, error } = await supabase
        .from('customers')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) throw error;
      return normalizeCustomer(data);
    } catch (e) {
      console.warn('Supabase updateCustomer error:', e);
      return null;
    }
  },

  async deleteCustomer(id) {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // 3. INVOICES
  async getInvoices() {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('id', { ascending: false });

      if (error || !data) return null;
      return data.map(normalizeInvoice);
    } catch (e) {
      console.warn('Supabase getInvoices error:', e);
      return null;
    }
  },

  async addInvoice(inv) {
    let notePayload = inv.notes || inv.note || '';
    if (Array.isArray(inv.payments) && inv.payments.length > 0) {
      const cleanNote = notePayload.replace(/<!--PAYMENTS:.*?-->/, '').trim();
      notePayload = (cleanNote ? cleanNote + '\n' : '') + `<!--PAYMENTS:${JSON.stringify(inv.payments)}-->`;
    }

    // Payload đầy đủ (yêu cầu bảng có đủ cột theo supabase-migration.sql)
    const fullPayload = {
      code:             inv.code,
      date:             inv.date,
      customer_id:      inv.customerId || null,
      customer_name:    inv.customerName,
      customer_phone:   inv.customerPhone || '',
      customer_dob:     inv.customerDob || '',
      staff_id:         inv.staffId || null,
      staff_name:       inv.staffName || '',
      services:         inv.services || [],
      service_summary:  inv.serviceSummary || (inv.services || []).map(s => s.name).join(', '),
      subtotal:         Number(inv.subtotal ?? 0),
      discount:         Number(inv.discount ?? 0),
      total_amount:     Number(inv.totalAmount ?? 0),
      paid_amount:      Number(inv.paidAmount ?? inv.totalAmount ?? 0),
      remaining_amount: Number(inv.remainingAmount ?? 0),
      payment_method:   inv.paymentMethod || 'Chuyển khoản',
      bank_account:     inv.bankAccount || '',
      notes:            notePayload,
      status:           inv.status || 'Đã thanh toán',
      created_by:       inv.createdBy || ''
    };

    // Payload tối thiểu (phòng trường hợp bảng chưa được migration đầy đủ)
    const minimalPayload = {
      code:          inv.code,
      date:          inv.date,
      customer_name: inv.customerName,
      total_amount:  Number(inv.totalAmount ?? 0),
    };

    try {
      // Lần 1: thử payload đầy đủ
      const { data, error } = await supabase
        .from('invoices')
        .insert([fullPayload])
        .select()
        .single();

      if (error) {
        // Nếu lỗi PGRST204 (column not found) → nhắc user chạy migration
        if (error.code === 'PGRST204' || (error.message || '').includes('column')) {
          console.error('🔴 Supabase invoices: Thiếu cột trong bảng!', error.message);
          console.error('👉 Vui lòng chạy file supabase-migration.sql trong Supabase Dashboard → SQL Editor');

          // Lần 2: thử payload tối thiểu
          const { data: d2, error: e2 } = await supabase
            .from('invoices')
            .insert([minimalPayload])
            .select()
            .single();
          if (e2) throw e2;
          return normalizeInvoice(d2);
        }
        throw error;
      }

      return normalizeInvoice(data);
    } catch (e) {
      console.error('🔴 Supabase addInvoice FAILED:', {
        message: e?.message,
        code: e?.code,
        details: e?.details,
        hint: e?.hint,
        status: e?.status,
        full: e
      });
      return null;
    }
  },

  async updateInvoice(id, updates) {
    try {
      const payload = {};
      if (updates.customerName !== undefined) payload.customer_name = updates.customerName;
      if (updates.customerPhone !== undefined) payload.customer_phone = updates.customerPhone;
      if (updates.customerDob !== undefined) payload.customer_dob = updates.customerDob;
      if (updates.serviceSummary !== undefined) payload.service_summary = updates.serviceSummary;
      if (updates.services !== undefined) payload.services = updates.services;
      if (updates.totalAmount !== undefined) payload.total_amount = Number(updates.totalAmount);
      if (updates.paidAmount !== undefined) payload.paid_amount = Number(updates.paidAmount);
      if (updates.remainingAmount !== undefined) payload.remaining_amount = Number(updates.remainingAmount);
      if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod;
      if (updates.bankAccount !== undefined) payload.bank_account = updates.bankAccount;
      
      let noteStr = updates.notes !== undefined ? updates.notes : (updates.note !== undefined ? updates.note : undefined);
      if (updates.payments !== undefined) {
        const cleanNote = (noteStr !== undefined ? noteStr : '').replace(/<!--PAYMENTS:.*?-->/, '').trim();
        payload.notes = (cleanNote ? cleanNote + '\n' : '') + `<!--PAYMENTS:${JSON.stringify(updates.payments)}-->`;
      } else if (noteStr !== undefined) {
        payload.notes = noteStr;
      }

      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.status !== undefined) payload.status = updates.status;

      const numId = Number(id) || id;
      const { data, error } = await supabase
        .from('invoices')
        .update(payload)
        .eq('id', numId)
        .select()
        .single();

      if (error || !data) throw error;
      return normalizeInvoice(data);
    } catch (e) {
      console.error('🔴 Supabase updateInvoice FAILED:', e);
      return null;
    }
  },

  async deleteInvoice(id) {
    try {
      const numId = Number(id) || id;
      const { error } = await supabase.from('invoices').delete().eq('id', numId);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // 4. EXPENSES
  async getExpenses() {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('id', { ascending: false });

      if (error || !data) return null;
      return data.map(normalizeExpense);
    } catch (e) {
      console.warn('Supabase getExpenses error:', e);
      return null;
    }
  },

  async addExpense(exp) {
    try {
      // Bảng expenses có check constraint: category phải là một trong 4 loại: 'Marketing', 'Mặt bằng', 'Mỹ phẩm', 'Nhân sự'
      const validCategories = ['Marketing', 'Mặt bằng', 'Mỹ phẩm', 'Nhân sự'];
      let matchedCat = validCategories.find(c => c.toLowerCase() === (exp.category || '').toLowerCase());
      if (!matchedCat) {
        const c = (exp.category || '').toLowerCase();
        if (c.includes('mặt bằng') || c.includes('thuê') || c.includes('điện') || c.includes('nước')) matchedCat = 'Mặt bằng';
        else if (c.includes('nhân sự') || c.includes('lương') || c.includes('thưởng') || c.includes('đồng phục') || c.includes('đào tạo')) matchedCat = 'Nhân sự';
        else if (c.includes('marketing') || c.includes('quảng cáo') || c.includes('ads') || c.includes('fb') || c.includes('tiktok')) matchedCat = 'Marketing';
        else matchedCat = 'Mỹ phẩm';
      }

      const payload = {
        code: exp.code || ('CP' + String(Date.now()).slice(-6)),
        date: exp.date || new Date().toLocaleDateString('vi-VN'),
        amount: Number(exp.amount ?? 0),
        category: matchedCat,
        content: exp.content || 'Chi phí vận hành',
        notes: exp.notes || exp.note || '',
        created_by: exp.createdBy || ''
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([payload])
        .select()
        .single();

      if (error || !data) throw error;
      return normalizeExpense(data);
    } catch (e) {
      console.error('🔴 Supabase addExpense FAILED:', e);
      return null;
    }
  },

  async updateExpense(id, updates) {
    try {
      const payload = {};
      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.amount !== undefined) payload.amount = Number(updates.amount);
      if (updates.category !== undefined) {
        const validCategories = ['Marketing', 'Mặt bằng', 'Mỹ phẩm', 'Nhân sự'];
        let matchedCat = validCategories.find(c => c.toLowerCase() === (updates.category || '').toLowerCase());
        if (!matchedCat) {
          const c = (updates.category || '').toLowerCase();
          if (c.includes('mặt bằng') || c.includes('thuê') || c.includes('điện') || c.includes('nước')) matchedCat = 'Mặt bằng';
          else if (c.includes('nhân sự') || c.includes('lương') || c.includes('thưởng') || c.includes('đồng phục') || c.includes('đào tạo')) matchedCat = 'Nhân sự';
          else if (c.includes('marketing') || c.includes('quảng cáo') || c.includes('ads') || c.includes('fb') || c.includes('tiktok')) matchedCat = 'Marketing';
          else matchedCat = 'Mỹ phẩm';
        }
        payload.category = matchedCat;
      }
      if (updates.content !== undefined) payload.content = updates.content;
      if (updates.notes !== undefined || updates.note !== undefined) payload.notes = updates.notes || updates.note;

      const numId = Number(id) || id;
      const { data, error } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', numId)
        .select()
        .single();

      if (error || !data) throw error;
      return normalizeExpense(data);
    } catch (e) {
      console.error('🔴 Supabase updateExpense FAILED:', e);
      return null;
    }
  },

  async deleteExpense(id) {
    try {
      const numId = Number(id) || id;
      const { error } = await supabase.from('expenses').delete().eq('id', numId);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // 5. SERVICES
  async getServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('id', { ascending: true });

      if (error || !data) return null;
      return data;
    } catch (e) {
      console.warn('Supabase getServices error:', e);
      return null;
    }
  },

  async addService(srv) {
    try {
      const payload = {
        id: srv.id,
        name: srv.name,
        price: Number(srv.price || 0),
        category: srv.category || 'Phun xăm & Chăm sóc da'
      };

      const { data, error } = await supabase
        .from('services')
        .insert([payload])
        .select()
        .single();

      if (error || !data) throw error;
      return data;
    } catch (e) {
      console.error('🔴 Supabase addService FAILED:', e);
      return null;
    }
  },

  async updateService(id, updates) {
    try {
      const payload = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.price !== undefined) payload.price = Number(updates.price);
      if (updates.category !== undefined) payload.category = updates.category;

      const { data, error } = await supabase
        .from('services')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) throw error;
      return data;
    } catch (e) {
      console.error('🔴 Supabase updateService FAILED:', e);
      return null;
    }
  },

  async deleteService(id) {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      return !error;
    } catch (e) {
      console.error('🔴 Supabase deleteService FAILED:', e);
      return false;
    }
  },

  // 6. STAFF
  async getStaff() {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('id', { ascending: true });

      if (error || !data) return null;
      return data.map(normalizeStaff);
    } catch (e) {
      return null;
    }
  },

  async addStaff(stf) {
    try {
      const payload = {
        id: stf.id,
        name: stf.name,
        initials: stf.initials || (stf.name || '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        color: stf.color || 'bg-rose-600',
        role: stf.role || 'Kỹ thuật viên',
        phone: stf.phone || '',
        commission_rate: Number(stf.commissionRate || 5)
      };

      const { data, error } = await supabase
        .from('staff')
        .insert([payload])
        .select()
        .single();

      if (error || !data) throw error;
      return normalizeStaff(data);
    } catch (e) {
      return null;
    }
  },

  async deleteStaff(id) {
    try {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      return !error;
    } catch (e) {
      console.error('🔴 Supabase deleteStaff FAILED:', e);
      return false;
    }
  },

  // 7. BANK ACCOUNTS
  async getBankAccounts() {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('id', { ascending: true });

      if (error || !data) return null;
      return data.map(normalizeBankAccount);
    } catch (e) {
      return null;
    }
  },

  async addBankAccount(acc) {
    try {
      const payload = {
        id: acc.id,
        name: acc.name,
        bank_name: acc.bankName || acc.bank_name,
        account_number: acc.accountNumber || acc.account_number,
        account_holder: acc.accountHolder || acc.account_holder,
        balance: Number(acc.balance || 0)
      };

      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([payload])
        .select()
        .single();

      if (error || !data) throw error;
      return normalizeBankAccount(data);
    } catch (e) {
      return null;
    }
  },

  async deleteBankAccount(id) {
    try {
      const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
      return !error;
    } catch (e) {
      console.error('🔴 Supabase deleteBankAccount FAILED:', e);
      return false;
    }
  },

  async updateBankAccountBalance(id, newBalance) {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ balance: Number(newBalance) })
        .eq('id', id);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // 8. DAILY TRANSACTIONS
  async getDailyTransactions() {
    try {
      const { data, error } = await supabase
        .from('daily_transactions')
        .select('*')
        .order('id', { ascending: false });

      if (error || !data) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  async addDailyTransaction(tx) {
    try {
      const payload = {
        date: tx.date,
        type: tx.type,
        amount: Number(tx.amount || 0),
        content: tx.content,
        reference_code: tx.referenceCode || tx.code || '',
        account_id: tx.accountId || '',
        account_name: tx.accountName || ''
      };

      const { data, error } = await supabase
        .from('daily_transactions')
        .insert([payload])
        .select()
        .single();

      return data;
    } catch (e) {
      return null;
    }
  }
};

export default supabaseService;
