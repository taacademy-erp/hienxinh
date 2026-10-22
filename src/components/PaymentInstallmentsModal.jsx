import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Trash2, Calendar, CreditCard, Building2, CheckCircle2, AlertCircle, Clock, DollarSign, Wallet } from 'lucide-react';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currencyUtils';

export default function PaymentInstallmentsModal({ invoice, onClose }) {
  const {
    bankAccounts,
    addPaymentInstallment,
    deletePaymentInstallment,
    invoices
  } = useApp();

  // Luôn lấy hóa đơn mới nhất từ Context để số tiền và lịch sử luôn đồng bộ
  const currentInvoice = invoices.find(inv => inv.id === invoice?.id) || invoice;

  if (!currentInvoice) return null;

  const total = Number(currentInvoice.totalAmount) || 0;
  const paid = currentInvoice.paidAmount !== undefined && currentInvoice.paidAmount !== null
    ? Number(currentInvoice.paidAmount)
    : total;
  const remaining = currentInvoice.remainingAmount !== undefined && currentInvoice.remainingAmount !== null
    ? Number(currentInvoice.remainingAmount)
    : Math.max(0, total - paid);

  const payments = Array.isArray(currentInvoice.payments) ? currentInvoice.payments : [];

  // Form thêm đợt thanh toán
  const todayStr = new Date().toLocaleDateString('vi-VN');
  const nowTimeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const [payDate, setPayDate] = useState(todayStr);
  const [payTime, setPayTime] = useState(nowTimeStr);
  const [payAmount, setPayAmount] = useState(remaining > 0 ? remaining : '');
  const [payMethod, setPayMethod] = useState(currentInvoice.paymentMethod || 'Chuyển khoản');
  const [payBankAccount, setPayBankAccount] = useState(
    currentInvoice.bankAccount || (bankAccounts[0]?.name) || 'Vietcombank Spa'
  );
  const [payNote, setPayNote] = useState(`Đợt ${payments.length + 1}`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khi số tiền còn lại thay đổi và người dùng chưa gõ, tự động cập nhật gợi ý
  useEffect(() => {
    if (remaining > 0 && !payAmount) {
      setPayAmount(remaining);
    }
  }, [remaining]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const numAmt = Number(payAmount) || 0;
    if (numAmt <= 0) return;

    setIsSubmitting(true);
    await addPaymentInstallment(currentInvoice.id, {
      date: payDate,
      time: payTime,
      amount: numAmt,
      paymentMethod: payMethod,
      bankAccount: payBankAccount,
      note: payNote
    });

    setIsSubmitting(false);
    // Reset form cho đợt tiếp theo nếu cần
    setPayAmount('');
    setPayNote(`Đợt ${payments.length + 2}`);
  };

  const handleDelete = async (paymentId, installmentName) => {
    if (confirm(`Bạn có chắc chắn muốn xóa "${installmentName || 'đợt thanh toán này'}" không? Hệ thống sẽ tự động tính lại công nợ.`)) {
      await deletePaymentInstallment(currentInvoice.id, paymentId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 my-6 max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-[#E60026] border border-rose-100 inline-flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" />
                <span>Thanh toán nhiều đợt</span>
              </span>
              <span className="font-sans font-extrabold text-[#E60026] text-sm">
                {currentInvoice.code}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
              Khách hàng: <span className="text-[#E60026]">{currentInvoice.customerName}</span>
              {currentInvoice.customerPhone && (
                <span className="text-gray-500 text-sm font-normal ml-2 font-sans">
                  ({currentInvoice.customerPhone})
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Dịch vụ: {currentInvoice.serviceSummary || 'Chăm sóc sắc đẹp'} • Ngày lập: {currentInvoice.date}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Container */}
        <div className="overflow-y-auto space-y-6 pr-1 mt-4 flex-1">
          
          {/* STATS BANNER: 3 thẻ tài chính */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tổng tiền */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4">
              <div className="text-xs text-gray-500 font-semibold mb-1">Tổng tiền hóa đơn</div>
              <div className="text-xl sm:text-2xl font-black font-sans text-gray-900">
                {formatCurrencyInput(total)} <span className="text-sm font-bold text-gray-500">đ</span>
              </div>
            </div>

            {/* Thực nhận / Đã thanh toán */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4">
              <div className="text-xs text-emerald-700 font-semibold mb-1 flex items-center justify-between">
                <span>Thực nhận (Đã TT)</span>
                <span className="text-[11px] font-bold">
                  {total > 0 ? `${Math.min(100, Math.round((paid / total) * 100))}%` : '100%'}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-sans text-emerald-600">
                {formatCurrencyInput(paid)} <span className="text-sm font-bold text-emerald-700">đ</span>
              </div>
            </div>

            {/* Còn lại / Công nợ */}
            <div className={`rounded-2xl p-4 border ${remaining > 0 ? 'bg-rose-50/70 border-rose-200/80' : 'bg-gray-50 border-gray-200/60'}`}>
              <div className="text-xs font-semibold mb-1 flex items-center justify-between">
                <span className={remaining > 0 ? 'text-[#E60026]' : 'text-gray-500'}>Còn lại (Công nợ)</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  remaining === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-[#E60026]'
                }`}>
                  {remaining === 0 ? 'Hoàn tất' : 'Chưa thu đủ'}
                </span>
              </div>
              <div className={`text-xl sm:text-2xl font-black font-sans ${remaining > 0 ? 'text-[#E60026]' : 'text-gray-400'}`}>
                {formatCurrencyInput(remaining)} <span className="text-sm font-bold">đ</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: FORM THÊM ĐỢT THANH TOÁN */}
          <div className="bg-gradient-to-br from-rose-50/60 via-white to-gray-50/50 p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-2xs">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#E60026]" />
                <span>Thêm đợt thanh toán mới</span>
              </h3>
              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => setPayAmount(remaining)}
                  className="text-xs text-[#E60026] hover:underline font-semibold"
                >
                  Điền số nợ còn lại ({formatCurrencyInput(remaining)}đ)
                </button>
              )}
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                
                {/* Thời gian: Ngày */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ngày thanh toán <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    placeholder="VD: 22/10/2026"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-sans focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                {/* Thời gian: Giờ */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Giờ thu tiền
                  </label>
                  <input
                    type="text"
                    value={payTime}
                    onChange={(e) => setPayTime(e.target.value)}
                    placeholder="VD: 09:30"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-sans focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                {/* Số tiền nhận */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Số tiền nhận (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formatCurrencyInput(payAmount)}
                    onChange={(e) => setPayAmount(parseCurrencyInput(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-sans font-bold text-[#E60026] focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                {/* Hình thức thanh toán */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Hình thức thanh toán
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="Chuyển khoản">Chuyển khoản</option>
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Thẻ tín dụng / POS">Thẻ tín dụng / POS</option>
                    <option value="Ví điện tử">Ví điện tử</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Số tài khoản nhận tiền */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tài khoản / STK nhận tiền
                  </label>
                  <select
                    value={payBankAccount}
                    onChange={(e) => setPayBankAccount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.name}>
                        {b.name} {b.accountNumber && b.accountNumber !== 'TIENMAT' ? `(STK: ${b.accountNumber} - ${b.accountHolder || ''})` : ''}
                      </option>
                    ))}
                    <option value="Tiền mặt tại quầy">Tiền mặt tại quầy</option>
                  </select>
                </div>

                {/* Ghi chú đợt thanh toán */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ghi chú đợt thanh toán
                  </label>
                  <input
                    type="text"
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    placeholder="VD: Khách trả nốt phần còn lại, Đặt cọc..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || !payAmount || Number(payAmount) <= 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E60026] hover:bg-[#c90021] disabled:bg-gray-300 text-white font-semibold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Xác nhận thu tiền đợt này</span>
                </button>
              </div>
            </form>
          </div>

          {/* SECTION 2: LỊCH SỬ THANH TOÁN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E60026]" />
                <span>Lịch sử các đợt thanh toán ({payments.length} đợt)</span>
              </h3>
              <span className="text-xs text-gray-500 font-sans">
                Đã nhận: <strong className="text-emerald-600 font-bold">{formatCurrencyInput(paid)}đ</strong> / {formatCurrencyInput(total)}đ
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50/60 rounded-2xl border border-gray-200/70 text-gray-400 text-xs">
                Chưa có đợt thanh toán nào được ghi nhận. Vui lòng thêm đợt thanh toán ở trên.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200/80 shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3 w-14 text-center">Đợt</th>
                      <th className="py-2.5 px-3">Thời gian</th>
                      <th className="py-2.5 px-3 text-right">Số tiền nhận</th>
                      <th className="py-2.5 px-3">Hình thức</th>
                      <th className="py-2.5 px-3">Tài khoản nhận</th>
                      <th className="py-2.5 px-3">Ghi chú</th>
                      <th className="py-2.5 px-3 text-center w-16">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {payments.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-rose-50/20 transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-gray-700">
                          #{idx + 1}
                        </td>
                        <td className="py-3 px-3 font-sans text-gray-800">
                          <div className="font-semibold">{p.date}</div>
                          {p.time && p.time !== 'Ban đầu' && (
                            <div className="text-[10px] text-gray-400 font-normal">{p.time}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold text-emerald-600 font-sans text-sm">
                          +{formatCurrencyInput(p.amount)} đ
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            p.paymentMethod === 'Tiền mặt'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            {p.paymentMethod || 'Chuyển khoản'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-gray-700 max-w-[160px] truncate" title={p.bankAccount}>
                          {p.bankAccount || '—'}
                        </td>
                        <td className="py-3 px-3 text-gray-600 max-w-[150px] truncate" title={p.note}>
                          {p.note || '—'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, `Đợt #${idx + 1}`)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa đợt thanh toán này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50/80 font-bold border-t border-gray-200">
                    <tr>
                      <td colSpan={2} className="py-2.5 px-3 text-gray-800">
                        Tổng cộng thực nhận:
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 font-extrabold font-sans text-sm">
                        {formatCurrencyInput(paid)} đ
                      </td>
                      <td colSpan={4} className="py-2.5 px-3 text-right font-sans text-gray-500">
                        Còn lại: <span className={remaining > 0 ? 'text-[#E60026] font-extrabold' : 'text-gray-400'}>{formatCurrencyInput(remaining)} đ</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            * Mọi đợt thanh toán đều được lưu trữ vĩnh viễn trên Supabase và đồng bộ vào sổ quỹ.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
