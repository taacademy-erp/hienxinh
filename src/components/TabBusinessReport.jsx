import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  FileSpreadsheet,
  TrendingUp,
  Users,
  Calendar,
  RotateCw,
  Landmark,
  Coins,
  ShieldAlert,
  Building2,
  CheckCircle2,
  Receipt,
  Filter,
  ArrowDownRight,
  Info
} from 'lucide-react';

/**
 * Match a raw bankAccount string or payment method from invoice/installment
 * to a configured BankAccount entity in the system.
 */
export const matchBankAccount = (accountStr, methodStr, bankAccounts = []) => {
  const isCash = (methodStr || '').toLowerCase().includes('tiền mặt') ||
                 (accountStr || '').toLowerCase().includes('tiền mặt') ||
                 (accountStr || '').toLowerCase().includes('tienmat');

  if (isCash) {
    const cashAcc = (bankAccounts || []).find(b =>
      b.accountNumber === 'TIENMAT' ||
      (b.name || '').toLowerCase().includes('tiền mặt') ||
      (b.bankName || '').toLowerCase().includes('tiền mặt')
    );
    if (cashAcc) return cashAcc;
    return {
      id: 'acc_cash_default',
      name: 'Tiền mặt tại quầy',
      bankName: 'Tiền mặt',
      accountNumber: 'TIENMAT',
      accountHolder: 'Quầy Thu Ngân'
    };
  }

  if (!accountStr) {
    const nonCash = (bankAccounts || []).find(b => b.accountNumber !== 'TIENMAT');
    return nonCash || bankAccounts?.[0] || null;
  }

  const raw = String(accountStr).trim().toLowerCase();

  // 1. Match by specific accountNumber (e.g. 0481000807399, 9983953351, MS00P00000001413734)
  for (const b of (bankAccounts || [])) {
    if (b.accountNumber && b.accountNumber !== 'TIENMAT') {
      const cleanAccNum = b.accountNumber.trim().toLowerCase();
      if (raw.includes(cleanAccNum)) {
        return b;
      }
    }
  }

  // 2. Match by Account ID
  for (const b of (bankAccounts || [])) {
    if (b.id && raw === String(b.id).toLowerCase()) {
      return b;
    }
  }

  // 3. Match by Account Holder
  for (const b of (bankAccounts || [])) {
    if (b.accountHolder) {
      const holder = b.accountHolder.trim().toLowerCase();
      if (raw.includes(holder)) {
        return b;
      }
    }
  }

  // 4. Match by exact Name
  const exactName = (bankAccounts || []).find(b => (b.name || '').toLowerCase() === raw);
  if (exactName) return exactName;

  // 5. Partial match by Name or BankName
  for (const b of (bankAccounts || [])) {
    if (b.name && raw.includes(b.name.toLowerCase())) {
      return b;
    }
    if (b.bankName && raw.includes(b.bankName.toLowerCase())) {
      return b;
    }
  }

  // Fallback for custom entries
  return {
    id: `acc_custom_${accountStr}`,
    name: accountStr,
    bankName: accountStr,
    accountNumber: '—',
    accountHolder: '—'
  };
};

export default function TabBusinessReport() {
  const {
    hasPermission,
    setActiveTab,
    formatVND,
    formatNumber,
    loadData,
    invoices,
    expenses,
    customers,
    bankAccounts
  } = useApp();

  // Strict check: Only Role "Chủ" has permission to view Business Report
  if (!hasPermission('businessReport')) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto mt-12 border border-gray-100 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#E60026] flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-sans text-gray-900">Giới hạn quyền truy cập</h2>
        <p className="text-sm text-gray-500 mt-2">
          Theo ma trận phân quyền, chỉ tài khoản <strong>Chủ</strong> mới có quyền xem Báo cáo Hoạt động kinh doanh.
        </p>
        <button
          onClick={() => setActiveTab('home')}
          className="mt-6 px-5 py-2.5 bg-[#E60026] text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-all shadow-md"
        >
          Quay về Trang chủ
        </button>
      </div>
    );
  }

  // Filters state
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBankFilter, setSelectedBankFilter] = useState('all');

  // Normalize all transactions / receipts from invoices and installments
  const allReceipts = useMemo(() => {
    const list = [];
    (invoices || []).forEach(inv => {
      const invTotal = Number(inv.totalAmount) || 0;
      const invPaid = Number(inv.paidAmount ?? invTotal);
      const invRem = Number(inv.remainingAmount ?? Math.max(0, invTotal - invPaid));

      if (Array.isArray(inv.payments) && inv.payments.length > 0) {
        inv.payments.forEach((p, pIdx) => {
          const pAmt = Number(p.amount) || 0;
          if (pAmt > 0) {
            const pMethod = p.paymentMethod || inv.paymentMethod || 'Chuyển khoản';
            const pBankStr = p.bankAccount || inv.bankAccount || (pMethod === 'Tiền mặt' ? 'Tiền mặt tại quầy' : '');
            const matched = matchBankAccount(pBankStr, pMethod, bankAccounts);

            list.push({
              id: `${inv.id}-p-${p.id || pIdx}`,
              invoiceId: inv.id,
              invoiceCode: inv.code,
              date: p.date || inv.date,
              time: p.time && p.time !== 'Ban đầu' ? p.time : '',
              customerName: inv.customerName,
              customerPhone: inv.customerPhone,
              serviceSummary: inv.serviceSummary || (inv.services || []).map(s => s.name).join(', ') || 'Dịch vụ spa',
              services: inv.services || [],
              paymentMethod: pMethod,
              bankAccountRaw: pBankStr,
              matchedBank: matched,
              bankName: matched?.bankName || 'Khác',
              accountNumber: matched?.accountNumber || '—',
              accountHolder: matched?.accountHolder || '—',
              accountDisplayName: matched?.name || pBankStr || 'Tiền mặt tại quầy',
              amount: pAmt,
              note: p.note || `Thanh toán đợt ${pIdx + 1} (${inv.code})`,
              invoiceTotal: invTotal,
              invoicePaid: invPaid,
              invoiceRemaining: invRem,
              invoiceStatus: inv.status
            });
          }
        });
      } else if (invPaid > 0) {
        // Fallback for invoice without installment array
        const pMethod = inv.paymentMethod || 'Chuyển khoản';
        const pBankStr = inv.bankAccount || (pMethod === 'Tiền mặt' ? 'Tiền mặt tại quầy' : '');
        const matched = matchBankAccount(pBankStr, pMethod, bankAccounts);

        list.push({
          id: `${inv.id}-single`,
          invoiceId: inv.id,
          invoiceCode: inv.code,
          date: inv.date,
          time: '',
          customerName: inv.customerName,
          customerPhone: inv.customerPhone,
          serviceSummary: inv.serviceSummary || (inv.services || []).map(s => s.name).join(', ') || 'Dịch vụ spa',
          services: inv.services || [],
          paymentMethod: pMethod,
          bankAccountRaw: pBankStr,
          matchedBank: matched,
          bankName: matched?.bankName || 'Khác',
          accountNumber: matched?.accountNumber || '—',
          accountHolder: matched?.accountHolder || '—',
          accountDisplayName: matched?.name || pBankStr || 'Tiền mặt tại quầy',
          amount: invPaid,
          note: inv.notes || `Thanh toán ${inv.code}`,
          invoiceTotal: invTotal,
          invoicePaid: invPaid,
          invoiceRemaining: invRem,
          invoiceStatus: inv.status
        });
      }
    });

    return list;
  }, [invoices, bankAccounts]);

  // Filtered receipts by date
  const dateFilteredReceipts = useMemo(() => {
    if (!dateFilter.trim()) return allReceipts;
    const filter = dateFilter.trim().toLowerCase();
    return allReceipts.filter(r => (r.date || '').toLowerCase().includes(filter));
  }, [allReceipts, dateFilter]);

  // Filtered expenses by date
  const dateFilteredExpenses = useMemo(() => {
    if (!dateFilter.trim()) return expenses || [];
    const filter = dateFilter.trim().toLowerCase();
    return (expenses || []).filter(e => (e.date || '').toLowerCase().includes(filter));
  }, [expenses, dateFilter]);

  // Invoices filtered by date (for gross bill & debt context)
  const dateFilteredInvoices = useMemo(() => {
    if (!dateFilter.trim()) return invoices || [];
    const filter = dateFilter.trim().toLowerCase();
    return (invoices || []).filter(inv => (inv.date || '').toLowerCase().includes(filter));
  }, [invoices, dateFilter]);

  // KEY BUSINESS METRICS
  // 1. Thực nhận (Actual Revenue) - ALWAYS based on actual received money!
  const totalActualRevenue = useMemo(() => {
    return dateFilteredReceipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [dateFilteredReceipts]);

  // Gross total of bills issued (Tổng giá trị hóa đơn đã xuất)
  const totalGrossBills = useMemo(() => {
    return dateFilteredInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  }, [dateFilteredInvoices]);

  // Remaining debt (Tổng công nợ còn thiếu chưa thu)
  const totalRemainingDebt = useMemo(() => {
    return dateFilteredInvoices.reduce((sum, inv) => {
      const tot = Number(inv.totalAmount) || 0;
      const paid = Number(inv.paidAmount ?? tot);
      return sum + Math.max(0, tot - paid);
    }, 0);
  }, [dateFilteredInvoices]);

  // Total expenses
  const totalExpenseAmount = useMemo(() => {
    return dateFilteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [dateFilteredExpenses]);

  // Net actual profit (Lợi nhuận thực tế = Thực nhận - Chi phí)
  const netActualProfit = totalActualRevenue - totalExpenseAmount;
  const totalCustomers = (customers || []).length;

  // BANK ACCOUNTS BREAKDOWN (Reconciliation per STK)
  const cashFlowBreakdown = useMemo(() => {
    const list = [];
    const colorPalette = ['#059669', '#2563EB', '#D97706', '#DC2626', '#7C3AED', '#DB2777'];

    // Ensure all configured bank accounts are represented
    (bankAccounts || []).forEach((bank, idx) => {
      // Find all receipts matching this bank account
      const receiptsForBank = dateFilteredReceipts.filter(r => {
        if (!r.matchedBank) return false;
        if (r.matchedBank.id && bank.id && r.matchedBank.id === bank.id) return true;
        if (r.matchedBank.accountNumber && bank.accountNumber &&
            r.matchedBank.accountNumber !== 'TIENMAT' &&
            r.matchedBank.accountNumber === bank.accountNumber) return true;
        if (bank.accountNumber === 'TIENMAT' && r.matchedBank.accountNumber === 'TIENMAT') return true;
        return false;
      });

      const collectedAmount = receiptsForBank.reduce((sum, r) => sum + Number(r.amount || 0), 0);
      const pct = totalActualRevenue > 0
        ? Number(((collectedAmount / totalActualRevenue) * 100).toFixed(1))
        : 0;

      list.push({
        id: bank.id,
        name: bank.name,
        bankName: bank.bankName || (bank.accountNumber === 'TIENMAT' ? 'Tiền mặt' : 'Ngân hàng'),
        accountNumber: bank.accountNumber || '—',
        accountHolder: bank.accountHolder || '—',
        isCash: bank.accountNumber === 'TIENMAT' || (bank.bankName || '').toLowerCase().includes('tiền mặt'),
        amount: collectedAmount,
        transactionCount: receiptsForBank.length,
        pct,
        color: colorPalette[idx % colorPalette.length]
      });
    });

    // Check if there are any unallocated receipts not in bankAccounts
    const allocatedSum = list.reduce((sum, item) => sum + item.amount, 0);
    const unallocatedDiff = totalActualRevenue - allocatedSum;
    if (unallocatedDiff > 0) {
      list.push({
        id: 'acc_other',
        name: 'Tài khoản khác / Tiền mặt trực tiếp',
        bankName: 'Khác',
        accountNumber: '—',
        accountHolder: '—',
        isCash: true,
        amount: unallocatedDiff,
        transactionCount: 0,
        pct: Number(((unallocatedDiff / totalActualRevenue) * 100).toFixed(1)),
        color: '#6B7280'
      });
    }

    return list;
  }, [bankAccounts, dateFilteredReceipts, totalActualRevenue]);

  // SERVICES BREAKDOWN (Based on actual revenue proportion)
  const servicesBreakdown = useMemo(() => {
    if (dateFilteredReceipts.length === 0) return [];
    const map = {};

    dateFilteredReceipts.forEach(r => {
      const svcs = r.services;
      if (Array.isArray(svcs) && svcs.length > 0) {
        // Distribute receipt amount across services proportionally to their totals
        const totalSvcCost = svcs.reduce((acc, s) => acc + (Number(s.total) || 0), 0) || 1;
        svcs.forEach(s => {
          const cat = s.category || (s.name.includes('Phun') || s.name.includes('môi') || s.name.includes('mày') ? 'Phun xăm thẩm mỹ' : 'Chăm sóc da & Thẩm mỹ');
          const portion = (Number(s.total || 0) / totalSvcCost) * r.amount;
          map[cat] = (map[cat] || 0) + portion;
        });
      } else {
        const cat = 'Dịch vụ làm đẹp tổng hợp';
        map[cat] = (map[cat] || 0) + r.amount;
      }
    });

    const colors = ['#E60026', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];
    return Object.entries(map).map(([name, amount], i) => ({
      name,
      amount: Math.round(amount),
      pct: totalActualRevenue > 0 ? Number(((amount / totalActualRevenue) * 100).toFixed(1)) : 0,
      color: colors[i % colors.length]
    })).sort((a, b) => b.amount - a.amount);
  }, [dateFilteredReceipts, totalActualRevenue]);

  // Receipts displayed in the detailed table (applying both Date & Bank Account filter)
  const displayedTransactions = useMemo(() => {
    if (selectedBankFilter === 'all') {
      return dateFilteredReceipts;
    }
    return dateFilteredReceipts.filter(r => {
      if (!r.matchedBank) return false;
      return (
        r.matchedBank.id === selectedBankFilter ||
        r.matchedBank.accountNumber === selectedBankFilter ||
        r.matchedBank.name === selectedBankFilter
      );
    });
  }, [dateFilteredReceipts, selectedBankFilter]);

  const displayedTransactionsTotal = useMemo(() => {
    return displayedTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [displayedTransactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Filter Bar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans text-gray-900 tracking-tight flex items-center gap-3">
            <span>Báo cáo hoạt động kinh doanh</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
              Thực nhận thực tế
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Báo cáo chuẩn kế toán: Doanh thu tính theo số tiền thực nhận về từng STK ngân hàng
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Lọc ngày (VD: 22/10/2026)"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 pr-7 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026] shadow-2xs"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                title="Xóa bộ lọc ngày"
              >
                ×
              </button>
            )}
          </div>

          <button
            onClick={() => {
              const todayStr = new Date().toLocaleDateString('vi-VN');
              setDateFilter(todayStr);
            }}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all"
          >
            Hôm nay
          </button>

          <button
            onClick={() => {
              setDateFilter('');
              loadData();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-rose-200 text-[#E60026] hover:bg-rose-50 rounded-xl text-xs font-semibold transition-all shadow-2xs"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Tổng doanh thu THỰC NHẬN */}
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFF5F6] text-[#E60026] flex items-center justify-center shrink-0 border border-rose-100">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">DOANH THU THỰC NHẬN</p>
              <h3 className="text-2xl font-black text-[#E60026] font-sans mt-0.5 tracking-tight">
                {formatVND(totalActualRevenue)}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {dateFilteredReceipts.length} đợt thu tiền
            </span>
            {totalRemainingDebt > 0 && (
              <span className="text-amber-600 font-semibold" title="Khoản khách chưa thanh toán đủ">
                Nợ: {formatVND(totalRemainingDebt)}
              </span>
            )}
          </div>
        </div>

        {/* Metric 2: Tổng chi phí */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">TỔNG CHI PHÍ THỰC TẾ</p>
              <h3 className="text-2xl font-black text-gray-900 font-sans mt-0.5 tracking-tight">
                {formatVND(totalExpenseAmount)}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{dateFilteredExpenses.length} khoản chi</span>
            <span>Vận hành spa</span>
          </div>
        </div>

        {/* Metric 3: Lợi nhuận thực tế (Thực thu - Chi) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              netActualProfit >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">LỢI NHUẬN THỰC TẾ</p>
              <h3 className={`text-2xl font-black font-sans mt-0.5 tracking-tight ${
                netActualProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {formatVND(netActualProfit)}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Thực nhận - Chi phí</span>
            <span className={netActualProfit >= 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
              {netActualProfit >= 0 ? '✓ Dương' : '⚠ Âm'}
            </span>
          </div>
        </div>

        {/* Metric 4: Tổng khách & Bill xuất */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">KHÁCH HÀNG & HÓA ĐƠN</p>
              <h3 className="text-2xl font-black text-gray-900 font-sans mt-0.5 tracking-tight">
                {dateFilteredInvoices.length} <span className="text-sm font-normal text-gray-500">hóa đơn</span>
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Tổng bill: {formatVND(totalGrossBills)}</span>
            <span>{totalCustomers} khách</span>
          </div>
        </div>
      </div>

      {/* Middle Row: 2 Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Doanh thu theo dịch vụ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#E60026] text-white flex items-center justify-center text-xs">
                  📈
                </div>
                <h3 className="font-bold text-sm text-gray-900 uppercase">
                  DOANH THU THEO DỊCH VỤ (THỰC TẾ)
                </h3>
              </div>
              <span className="text-xs text-gray-400">{servicesBreakdown.length} nhóm dịch vụ</span>
            </div>

            <div className="mt-5 space-y-4">
              {servicesBreakdown.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">Chưa có giao dịch dịch vụ nào</p>
              ) : (
                servicesBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-gray-700">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-900 font-sans">
                        {formatNumber(item.amount)}đ{' '}
                        <span className="text-gray-400 font-normal">({item.pct}%)</span>
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.pct}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Phân bổ doanh thu thực nhận theo từng mảng dịch vụ</span>
            <span className="font-bold text-gray-900 font-sans">{formatVND(totalActualRevenue)}</span>
          </div>
        </div>

        {/* Right: DÒNG TIỀN THEO TÀI KHOẢN NGÂN HÀNG (STK) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs">
                  💳
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 uppercase">
                    DÒNG TIỀN THEO TÀI KHOẢN NGÂN HÀNG (STK)
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Đối chiếu chính xác số tiền về từng tài khoản/STK đã chọn trên bill
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Khớp 100%</span>
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {cashFlowBreakdown.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">Chưa có dữ liệu dòng tiền</p>
              ) : (
                cashFlowBreakdown.map((acc, idx) => (
                  <div
                    key={acc.id || idx}
                    onClick={() => setSelectedBankFilter(acc.id === selectedBankFilter ? 'all' : acc.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedBankFilter === acc.id
                        ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-400'
                        : 'bg-gray-50/40 border-gray-100 hover:border-gray-200 hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          acc.isCash ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {acc.isCash ? <Coins className="w-3.5 h-3.5" /> : <Landmark className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-2">
                            <span>{acc.name}</span>
                            {acc.accountNumber !== 'TIENMAT' && acc.accountNumber !== '—' && (
                              <span className="font-sans text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                STK: {acc.accountNumber}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                            <span>{acc.bankName}</span>
                            {acc.accountHolder !== '—' && (
                              <span>• Chủ TK: <strong>{acc.accountHolder}</strong></span>
                            )}
                            <span>• {acc.transactionCount} giao dịch</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-sm text-gray-900 font-sans">
                          {formatNumber(acc.amount)}đ
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium">
                          {acc.pct}% tổng thực thu
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200/70 h-1.5 rounded-full overflow-hidden mt-2.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${acc.pct}%`,
                          backgroundColor: acc.color
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Total Line */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900 text-sm block">
                Tổng Thu Thực Tế (Tất cả tài khoản):
              </span>
              <span className="text-[11px] text-gray-400">
                Cộng dồn chính xác từ tất cả các STK nhận tiền
              </span>
            </div>
            <span className="text-xl font-black text-[#E60026] font-sans">
              {formatVND(totalActualRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Table Card: CHI TIẾT DOANH THU THỰC TẾ & ĐỐI CHIẾU STK */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Table Header & Interactive Filter Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#E60026] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm uppercase flex items-center gap-2">
                <span>CHI TIẾT DOANH THU THỰC TẾ</span>
                {dateFilter && <span className="text-[#E60026]">NGÀY {dateFilter}</span>}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Bảng kê chi tiết từng giao dịch thực nhận kèm STK đối chiếu ngân hàng
              </p>
            </div>
          </div>

          {/* Filter by Bank Account Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              Lọc theo tài khoản:
            </span>
            <select
              value={selectedBankFilter}
              onChange={(e) => setSelectedBankFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E60026]"
            >
              <option value="all">Tất cả tài khoản ({allReceipts.length} giao dịch)</option>
              {(bankAccounts || []).map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.accountNumber && b.accountNumber !== 'TIENMAT' ? `(STK: ${b.accountNumber} - ${b.accountHolder})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-3 w-10 text-gray-500 text-center">#</th>
                <th className="py-3 px-3">Thời gian</th>
                <th className="py-3 px-3">Mã HĐ</th>
                <th className="py-3 px-3">Khách hàng</th>
                <th className="py-3 px-4">Dịch vụ / Ghi chú</th>
                <th className="py-3 px-3">Hình thức</th>
                <th className="py-3 px-4">Tài khoản nhận (STK & Chủ TK)</th>
                <th className="py-3 px-3 text-right">Tổng HĐ</th>
                <th className="py-3 px-4 text-right font-black text-gray-900">Thực nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-400 font-medium">
                    {dateFilter || selectedBankFilter !== 'all'
                      ? 'Không có giao dịch nào khớp với bộ lọc đã chọn.'
                      : 'Chưa có giao dịch thực thu nào trong hệ thống.'}
                  </td>
                </tr>
              ) : (
                displayedTransactions.map((tx, idx) => (
                  <tr key={tx.id || idx} className="hover:bg-rose-50/20 transition-colors">
                    <td className="py-3 px-3 text-gray-400 text-center font-medium font-sans">{idx + 1}</td>
                    <td className="py-3 px-3 text-gray-600 font-sans whitespace-nowrap">
                      <div>{tx.date}</div>
                      {tx.time && <div className="text-[10px] text-gray-400">{tx.time}</div>}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-sans font-bold text-[#E60026] bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        {tx.invoiceCode}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{tx.customerName}</div>
                      {tx.customerPhone && (
                        <div className="text-[11px] text-gray-400 font-sans">{tx.customerPhone}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-800 line-clamp-1">{tx.serviceSummary}</div>
                      {tx.note && (
                        <div className="text-[10px] text-gray-500 italic mt-0.5">
                          {tx.note}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {tx.paymentMethod === 'Tiền mặt' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Coins className="w-3 h-3" />
                          Tiền mặt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Landmark className="w-3 h-3" />
                          Chuyển khoản
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <Building2 className="w-3.5 h-3.5 text-[#E60026]" />
                        <span>{tx.accountDisplayName}</span>
                      </div>
                      {tx.accountNumber !== 'TIENMAT' && tx.accountNumber !== '—' ? (
                        <div className="text-[11px] text-gray-600 mt-0.5 font-sans">
                          STK: <strong className="text-emerald-700">{tx.accountNumber}</strong>
                          {tx.accountHolder !== '—' && <span> ({tx.accountHolder})</span>}
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400">Quầy Thu Ngân</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-sans text-gray-500 whitespace-nowrap">
                      <div>{formatNumber(tx.invoiceTotal)}đ</div>
                      {tx.invoiceRemaining > 0 && (
                        <div className="text-[10px] text-amber-600 font-semibold">
                          (Nợ: {formatNumber(tx.invoiceRemaining)}đ)
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="text-sm font-black text-[#E60026] font-sans">
                        +{formatNumber(tx.amount)}đ
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Footer */}
            <tfoot className="bg-gray-50/90 font-bold border-t-2 border-gray-200">
              <tr>
                <td colSpan="8" className="py-3.5 px-4 text-gray-900 uppercase text-xs">
                  Tổng thực thu ({displayedTransactions.length} giao dịch)
                  {selectedBankFilter !== 'all' && ' theo tài khoản đã chọn'}
                </td>
                <td className="py-3.5 px-4 text-right text-base text-[#E60026] font-sans font-black whitespace-nowrap">
                  {formatVND(displayedTransactionsTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
