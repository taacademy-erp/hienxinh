import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { formatCurrencyInput } from '../utils/currencyUtils';

export default function InvoiceDetailModal() {
  const { selectedInvoice, setSelectedInvoice, formatNumber, formatVND } = useApp();

  if (!selectedInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const total = Number(selectedInvoice.totalAmount) || 0;
  const paid = selectedInvoice.paidAmount !== undefined && selectedInvoice.paidAmount !== null ? Number(selectedInvoice.paidAmount) : total;
  const remaining = selectedInvoice.remainingAmount !== undefined && selectedInvoice.remainingAmount !== null ? Number(selectedInvoice.remainingAmount) : Math.max(0, total - paid);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Modal Top Close */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E60026] bg-rose-50 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hóa đơn hợp lệ</span>
          </div>

          <button
            onClick={() => setSelectedInvoice(null)}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="pt-6 space-y-6">
          {/* Header Brand */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <img
                src="/brand-logo-transparent.png"
                alt="Hiền Xinh Beauty Center"
                className="h-10 w-auto object-contain mb-2"
              />
              <p className="text-xs text-gray-500">Quản lý tinh gọn – Chăm sóc tận tâm</p>
              <p className="text-xs text-gray-500">Hotline: 0988 888 999</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-[#E60026] font-sans block">
                {selectedInvoice.code}
              </span>
              <p className="text-xs text-gray-400 mt-1">Ngày lập: {selectedInvoice.date}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 p-4 rounded-xl text-xs grid grid-cols-2 gap-3">
            <div>
              <span className="text-gray-500 block">Khách hàng:</span>
              <strong className="text-sm text-gray-900">{selectedInvoice.customerName}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Số điện thoại:</span>
              <strong className="text-sm font-sans text-gray-900">{selectedInvoice.customerPhone}</strong>
            </div>
            {selectedInvoice.customerDob && (
              <div>
                <span className="text-gray-500 block">Ngày sinh:</span>
                <span className="text-gray-800 font-medium">{selectedInvoice.customerDob}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500 block">Hình thức thanh toán:</span>
              <span className="text-gray-800 font-medium">
                {selectedInvoice.paymentMethod} ({selectedInvoice.bankAccount})
              </span>
            </div>
          </div>

          {/* Table of Services */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Chi tiết dịch vụ đăng ký</h4>
            <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Dịch vụ</th>
                  <th className="py-2.5 px-3 text-right">Giá niêm yết</th>
                  <th className="py-2.5 px-3 text-right">Giá khuyến mãi</th>
                  <th className="py-2.5 px-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(selectedInvoice.services || []).map((s, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3 text-gray-500">{i + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{s.name}</td>
                    <td className="py-2.5 px-3 text-right text-gray-500 line-through">
                      {formatCurrencyInput(s.listedPrice)} đ
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      {formatCurrencyInput(s.discountPrice)} đ
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-[#E60026]">
                      {formatCurrencyInput(s.total)} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Commissions Note (internal info) */}
          {selectedInvoice.services && selectedInvoice.services[0]?.onlineStaff && (
            <div className="p-3 bg-rose-50/50 rounded-xl text-[11px] text-gray-600 space-y-1 border border-rose-100">
              <span className="font-bold text-[#E60026] block">Phân bổ hoa hồng nhân sự:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  Online: <strong>{selectedInvoice.services[0].onlineStaff}</strong> (+{formatCurrencyInput(selectedInvoice.services[0].onlineCommissionAmount)} đ)
                </div>
                <div>
                  Tư vấn TT: <strong>{selectedInvoice.services[0].directStaff}</strong> (+{formatCurrencyInput(selectedInvoice.services[0].directCommissionAmount)} đ)
                </div>
                <div>
                  Thực hiện: <strong>{selectedInvoice.services[0].execStaff}</strong> (+{formatCurrencyInput(selectedInvoice.services[0].execCommissionAmount)} đ)
                </div>
              </div>
            </div>
          )}

          {/* Grand Total with Payment Breakdown */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Tổng tiền dịch vụ:</span>
              <span className="font-bold text-gray-900 font-sans text-sm">{formatCurrencyInput(total)} đ</span>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-700">
              <span>Đã thanh toán:</span>
              <span className="font-bold font-sans text-sm">{formatCurrencyInput(paid)} đ</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200">
              <div>
                <span className="text-xs font-bold text-gray-700">Còn lại (Công nợ):</span>
                <p className="text-[11px] text-gray-400">Số tiền khách còn phải thanh toán</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black font-sans ${remaining > 0 ? 'text-[#E60026]' : 'text-emerald-600'}`}>
                  {formatCurrencyInput(remaining)} đ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={() => setSelectedInvoice(null)}
            className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#E60026] hover:bg-[#c90021] text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>In hóa đơn</span>
          </button>
        </div>

      </div>
    </div>
  );
}
