import { supabase } from '../lib/supabase';

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
    totalAmount: Number(inv.total_amount ?? inv.totalAmount ?? 0),
    paymentMethod: inv.payment_method ?? inv.paymentMethod ?? 'Chuyển khoản',
    bankAccount: inv.bank_account ?? inv.bankAccount ?? '',
    notes: inv.notes ?? '',
    status: inv.status ?? 'Đã thanh toán',
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
      console.warn('Supabase addCustomer error:', e);
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
    try {
      const payload = {
        code: inv.code,
        date: inv.date,
        customer_id: inv.customerId || null,
        customer_name: inv.customerName,
        customer_phone: inv.customerPhone || '',
        customer_dob: inv.customerDob || '',
        staff_id: inv.staffId || null,
        staff_name: inv.staffName || '',
        services: inv.services || [],
        service_summary: inv.serviceSummary || (inv.services || []).map(s => s.name).join(', '),
        subtotal: Number(inv.subtotal ?? 0),
        discount: Number(inv.discount ?? 0),
        total_amount: Number(inv.totalAmount ?? 0),
        payment_method: inv.paymentMethod || 'Chuyển khoản',
        bank_account: inv.bankAccount || '',
        notes: inv.notes || '',
        status: inv.status || 'Đã thanh toán',
        created_by: inv.createdBy || ''
      };

      const { data, error } = await supabase
        .from('invoices')
        .insert([payload])
        .select()
        .single();

      if (error || !data) throw error;
      return normalizeInvoice(data);
    } catch (e) {
      console.warn('Supabase addInvoice error:', e);
      return null;
    }
  },

  async deleteInvoice(id) {
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
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
      const payload = {
        code: exp.code,
        date: exp.date,
        amount: Number(exp.amount ?? 0),
        category: exp.category,
        content: exp.content,
        notes: exp.notes || '',
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
      console.warn('Supabase addExpense error:', e);
      return null;
    }
  },

  async updateExpense(id, updates) {
    try {
      const payload = {};
      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.amount !== undefined) payload.amount = Number(updates.amount);
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.content !== undefined) payload.content = updates.content;
      if (updates.notes !== undefined) payload.notes = updates.notes;

      const { data, error } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) throw error;
      return normalizeExpense(data);
    } catch (e) {
      return null;
    }
  },

  async deleteExpense(id) {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
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
      return null;
    }
  },

  async addService(srv) {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([srv])
        .select()
        .single();

      if (error || !data) throw error;
      return data;
    } catch (e) {
      return null;
    }
  },

  async deleteService(id) {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      return !error;
    } catch (e) {
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
