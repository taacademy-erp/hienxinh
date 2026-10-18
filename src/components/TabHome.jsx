import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, FilePlus, FileText, Wallet, ArrowRight } from 'lucide-react';

export default function TabHome() {
  const { setActiveTab } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title Section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-serif flex items-center gap-2">
          <span className="text-[#0F172A]">Xin chào,</span>
          <span className="text-[#C0001A]">Hiền Xinh!</span>
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1 font-serif">
          Chào mừng bạn đến với hệ thống quản lý Hiền Xinh Beauty Center.
        </p>
      </div>

      {/* Main Promo Banner */}
      <div className="flex justify-center">
        <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-soft border border-rose-100/60 transition-transform duration-300 hover:scale-[1.005]">
          <img
            src="/home-banner.png"
            alt="Hiền Xinh Beauty Center - Quản lý tinh gọn, Chăm sóc tận tâm"
            className="w-full h-auto object-cover block"
          />
        </div>
      </div>

      {/* 4 Quick Access Cards matching mockup exactly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        {/* Card 1: Khách hàng */}
        <div
          onClick={() => setActiveTab('customers')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100/80 shadow-xs hover:shadow-md hover:border-rose-200 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FDF0F2] text-[#C0001A] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Users className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0F172A] font-serif group-hover:text-[#C0001A] transition-colors">
                Khách hàng
              </h3>
              <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                Quản lý thông tin<br />khách hàng
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#FDF0F2] text-[#C0001A] group-hover:bg-[#C0001A] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 2: Nhập hóa đơn */}
        <div
          onClick={() => setActiveTab('createInvoice')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100/80 shadow-xs hover:shadow-md hover:border-rose-200 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FDF0F2] text-[#C0001A] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <FilePlus className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0F172A] font-serif group-hover:text-[#C0001A] transition-colors">
                Nhập hóa đơn
              </h3>
              <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                Tạo và lưu<br />hóa đơn nhanh chóng
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#FDF0F2] text-[#C0001A] group-hover:bg-[#C0001A] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 3: Danh sách hóa đơn */}
        <div
          onClick={() => setActiveTab('invoicesList')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100/80 shadow-xs hover:shadow-md hover:border-rose-200 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FDF0F2] text-[#C0001A] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <FileText className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0F172A] font-serif group-hover:text-[#C0001A] transition-colors">
                Danh sách hóa đơn
              </h3>
              <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                Tra cứu và quản lý<br />hóa đơn
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#FDF0F2] text-[#C0001A] group-hover:bg-[#C0001A] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 4: Chi phí */}
        <div
          onClick={() => setActiveTab('expenses')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100/80 shadow-xs hover:shadow-md hover:border-rose-200 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FDF0F2] text-[#C0001A] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Wallet className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0F172A] font-serif group-hover:text-[#C0001A] transition-colors">
                Chi phí
              </h3>
              <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                Quản lý các khoản<br />chi phí
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#FDF0F2] text-[#C0001A] group-hover:bg-[#C0001A] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
        </div>
      </div>
    </div>
  );
}
