import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-gray-900 text-white';
        let Icon = Info;
        if (toast.type === 'success') {
          bg = 'bg-white border-l-4 border-[#E60026] text-gray-800 shadow-xl border border-gray-100';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bg = 'bg-white border-l-4 border-red-500 text-gray-800 shadow-xl border border-gray-100';
          Icon = AlertCircle;
        } else if (toast.type === 'info') {
          bg = 'bg-white border-l-4 border-blue-500 text-gray-800 shadow-xl border border-gray-100';
          Icon = Info;
        }

        return (
          <div
            key={toast.id}
            className={`${bg} px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 text-xs pointer-events-auto animate-in slide-in-from-bottom-5 duration-200`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 shrink-0 ${toast.type === 'success' ? 'text-[#E60026]' : toast.type === 'error' ? 'text-red-500' : 'text-blue-500'}`} />
              <span className="font-semibold">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
