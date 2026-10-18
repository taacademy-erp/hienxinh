import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  FileText,
  UserCheck,
  Calendar,
  RotateCw,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export default function TabCommissionReport() {
  const {
    staff,
    invoices,
    formatNumber,
    formatVND,
    setSelectedStaffCommission,
    loadData
  } = useApp();

  const [dateFilter, setDateFilter] = useState('17/10/2026');
  const [timeMode, setTimeMode] = useState('Ngày');
  const [search, setSearch] = useState('');
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);

  // Compute commission stats per staff member dynamically from invoices
  const staffCommissionList = useMemo(() => {
    return staff.map((member) => {
      let dynInvoices = [];
      let dynCount = 0;
      let dynTotal = 0;

      (invoices || []).forEach(inv => {
        let memberInInv = false;
        (inv.services || []).forEach(srv => {
          if (srv.onlineStaff === member.name) {
            memberInInv = true;
            const amt = Number(srv.onlineCommissionAmount) || Math.round(((srv.total || 0) * (srv.onlineCommissionRate || 0)) / 100);
            dynTotal += amt;
            dynInvoices.push({
              code: inv.code,
              date: inv.date,
              customer: inv.customerName,
              service: srv.name,
              role: 'Tư vấn Online',
              rate: `${srv.onlineCommissionRate || 5}%`,
              amount: amt
            });
          }
          if (srv.directStaff === member.name) {
            memberInInv = true;
            const amt = Number(srv.directCommissionAmount) || Math.round(((srv.total || 0) * (srv.directCommissionRate || 0)) / 100);
            dynTotal += amt;
            dynInvoices.push({
              code: inv.code,
              date: inv.date,
              customer: inv.customerName,
              service: srv.name,
              role: 'Tư vấn trực tiếp',
              rate: `${srv.directCommissionRate || 10}%`,
              amount: amt
            });
          }
          if (srv.execStaff === member.name) {
            memberInInv = true;
            const amt = Number(srv.execCommissionAmount) || Math.round(((srv.total || 0) * (srv.execCommissionRate || 0)) / 100);
            dynTotal += amt;
            dynInvoices.push({
              code: inv.code,
              date: inv.date,
              customer: inv.customerName,
              service: srv.name,
              role: 'Kỹ thuật viên thực hiện',
              rate: `${srv.execCommissionRate || 15}%`,
              amount: amt
            });
          }
        });
        if (memberInInv) dynCount++;
      });

      return {
        ...member,
        invoiceCount: dynCount,
        totalCommission: dynTotal,
        averageRate: dynCount > 0 ? (member.commissionRate ? `${member.commissionRate}%` : '5%') : '0%',
        breakdown: dynInvoices
      };
    }).sort((a, b) => b.totalCommission - a.totalCommission);
  }, [staff, invoices]);

  // Filtered by search
  const filteredList = useMemo(() => {
    return staffCommissionList.filter(s =>
      !search || s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [staffCommissionList, search]);

  const totalCommissionAll = staffCommissionList.reduce((sum, s) => sum + s.totalCommission, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-sans text-gray-900 tracking-tight">
          Báo cáo hoa hồng
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi và tổng hợp hoa hồng của từng nhân viên
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Thời gian</span>
          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setTimeMode('Ngày')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeMode === 'Ngày' ? 'bg-[#E60026] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => setTimeMode('Tháng')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeMode === 'Tháng' ? 'bg-[#E60026] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tháng
            </button>
          </div>

          <div className="relative">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên nhân viên..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {/* Refresh */}
        <button
          onClick={() => { setDateFilter('17/10/2026'); setSearch(''); loadData(); }}
          className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 border border-rose-200 text-[#E60026] hover:bg-rose-50 rounded-xl text-xs font-semibold transition-all"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* 3 Metric Cards matching mockup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Tổng hoa hồng */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#E60026] flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Tổng hoa hồng</p>
            <h3 className="text-2xl font-extrabold text-[#E60026] font-sans mt-1">
              {formatNumber(totalCommissionAll)} đ
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Trong ngày {dateFilter || '17/10/2026'}</p>
          </div>
        </div>

        {/* Card 2: Số hóa đơn */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Số hóa đơn</p>
            <h3 className="text-2xl font-extrabold text-gray-900 font-sans mt-1">
              {(invoices || []).length}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Trong ngày {dateFilter || '17/10/2026'}</p>
          </div>
        </div>

        {/* Card 3: Số nhân viên */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Số nhân viên</p>
            <h3 className="text-2xl font-extrabold text-gray-900 font-sans mt-1">
              {staffCommissionList.filter(s => s.totalCommission > 0).length}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Có phát sinh hoa hồng</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#E60026] text-white flex items-center justify-center text-xs font-bold">
              ≡
            </div>
            <h2 className="font-bold text-gray-900 text-base">
              <span className="text-[#E60026]">Chi tiết hoa hồng theo nhân viên</span> (ngày {dateFilter || '17/10/2026'})
            </h2>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 pl-6 pr-3 w-12 text-gray-500 font-bold">#</th>
                <th className="py-3.5 px-4 font-bold text-gray-800">Nhân viên</th>
                <th className="py-3.5 px-4 font-bold text-gray-800 text-center">Số hóa đơn</th>
                <th className="py-3.5 px-4 font-bold text-gray-800 text-right">Tổng hoa hồng</th>
                <th className="py-3.5 px-4 font-bold text-gray-800 text-center">Tỷ lệ hoa hồng TB</th>
                <th className="py-3.5 pr-6 pl-4 text-center font-bold text-gray-800 w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {totalCommissionAll === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 font-medium">
                    Chưa có dữ liệu hoa hồng phát sinh trong hệ thống.
                  </td>
                </tr>
              ) : (
                filteredList.map((member, idx) => (
                <tr key={member.id} className="hover:bg-rose-50/20 transition-colors">
                  <td className="py-3.5 pl-6 pr-3 text-gray-500 font-medium">{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${member.color || 'bg-rose-600'} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                        {member.initials}
                      </div>
                      <span className="font-bold text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                    {member.invoiceCount}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-extrabold text-[#E60026] font-sans">
                      {formatNumber(member.totalCommission)} đ
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-gray-700 font-medium">
                    {member.averageRate}
                  </td>
                  <td className="py-3.5 pr-6 pl-4 text-center">
                    <button
                      onClick={() => setSelectedStaffDetails(member)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#E60026] bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem</span>
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <div>
            Hiển thị 1 - {filteredList.length} / {filteredList.length} nhân viên
          </div>

          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#E60026] text-white font-semibold text-xs">
              1
            </button>
            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white">
              <option>10</option>
              <option>20</option>
            </select>
            <span>nhân viên/trang</span>
          </div>
        </div>
      </div>

      {/* Staff Commission Breakdown Modal */}
      {selectedStaffDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${selectedStaffDetails.color} text-white font-bold text-sm flex items-center justify-center`}>
                  {selectedStaffDetails.initials}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 font-sans">
                    Chi tiết hoa hồng: {selectedStaffDetails.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Tổng tích lũy: <strong className="text-[#E60026]">{formatNumber(selectedStaffDetails.totalCommission)} đ</strong> ({selectedStaffDetails.invoiceCount} hóa đơn)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffDetails(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Mã HD</th>
                    <th className="py-2.5 px-3">Khách hàng</th>
                    <th className="py-2.5 px-3">Dịch vụ</th>
                    <th className="py-2.5 px-3">Vai trò</th>
                    <th className="py-2.5 px-3 text-center">Tỷ lệ</th>
                    <th className="py-2.5 px-3 text-right">Hoa hồng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedStaffDetails.breakdown && selectedStaffDetails.breakdown.length > 0 ? (
                    selectedStaffDetails.breakdown.map((item, i) => (
                      <tr key={i} className="hover:bg-rose-50/20">
                        <td className="py-2.5 px-3 font-sans font-bold text-[#E60026]">{item.code}</td>
                        <td className="py-2.5 px-3 font-medium">{item.customer}</td>
                        <td className="py-2.5 px-3">{item.service}</td>
                        <td className="py-2.5 px-3 text-gray-600">{item.role}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{item.rate}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-[#E60026]">
                          +{formatNumber(item.amount)} đ
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-gray-400">
                        Bản ghi hoa hồng mẫu cố định: {formatNumber(selectedStaffDetails.totalCommission)} đ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
