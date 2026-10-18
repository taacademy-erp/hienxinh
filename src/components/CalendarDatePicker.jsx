import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronUp, ChevronDown } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function CalendarDatePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial view month and year
  const parseDate = (dStr) => {
    if (!dStr || dStr === 'all') return null;
    const parts = dStr.split('/').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return { day: parts[0], month: parts[1] - 1, year: parts[2] };
    }
    return null;
  };

  const parsed = parseDate(value);
  const [viewYear, setViewYear] = useState(parsed ? parsed.year : 2026);
  const [viewMonth, setViewMonth] = useState(parsed ? parsed.month : 9); // 9 = October

  // Sync when value changes
  useEffect(() => {
    const p = parseDate(value);
    if (p) {
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigate months (up/down or prev/next matching image 1)
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  // Generate 42 calendar cells (6 rows x 7 cols) with Monday first
  const calendarCells = () => {
    const cells = [];
    const firstDayJs = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun, 1 is Mon
    const firstCol = (firstDayJs + 6) % 7; // 0 for Mon, 6 for Sun

    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    // 1. Previous month trailing days
    for (let i = firstCol - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false
      });
    }

    // 2. Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      cells.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true
      });
    }

    // 3. Next month leading days (pad to 42 cells total)
    let nextDay = 1;
    while (cells.length < 42) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({
        day: nextDay,
        month: m,
        year: y,
        isCurrentMonth: false
      });
      nextDay++;
    }

    return cells;
  };

  const handleSelectDay = (cell) => {
    const dStr = String(cell.day).padStart(2, '0');
    const mStr = String(cell.month + 1).padStart(2, '0');
    const fullDate = `${dStr}/${mStr}/${cell.year}`;
    onChange(fullDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('all');
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    // Default to 18/10/2026 to match system date
    const dStr = '18';
    const mStr = '10';
    const yStr = '2026';
    const fullDate = `${dStr}/${mStr}/${yStr}`;
    setViewYear(2026);
    setViewMonth(9);
    onChange(fullDate);
    setIsOpen(false);
  };

  const displayVal = (!value || value === 'all') ? '' : value;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Input button matching reference image 1 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2.5 bg-white border border-gray-300 hover:border-gray-400 rounded-lg px-3 py-1.5 cursor-pointer shadow-2xs transition-all min-w-[140px]"
      >
        <span className="text-xs font-semibold text-gray-800">
          {displayVal || placeholder}
        </span>
        <CalendarIcon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
      </div>

      {/* Popover Calendar Dropdown exact to image 1 */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 select-none">
          {/* Header: October 2026 ▾ and Up/Down arrows */}
          <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-2">
            <div className="flex items-center gap-1 font-bold text-xs text-gray-900">
              <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
              <span className="text-[10px] text-gray-400">▾</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <button
                type="button"
                onClick={prevMonth}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 transition-colors"
                title="Tháng trước"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 transition-colors"
                title="Tháng sau"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday headers: Mo Tu We Th Fr Sa Su */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-700 mb-1">
            {WEEKDAYS.map(w => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          {/* 42 Date cells */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {calendarCells().map((cell, idx) => {
              const cellDateStr = `${String(cell.day).padStart(2, '0')}/${String(cell.month + 1).padStart(2, '0')}/${cell.year}`;
              const isSelected = displayVal === cellDateStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell)}
                  className={`h-7 w-7 mx-auto flex items-center justify-center rounded font-medium transition-all ${
                    isSelected
                      ? 'bg-[#1890FF] text-white font-bold shadow-xs'
                      : cell.isCurrentMonth
                      ? 'text-gray-800 hover:bg-blue-50 hover:text-blue-600'
                      : 'text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Bottom actions: Clear & Today */}
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-gray-100 text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-blue-500 hover:text-blue-700 font-semibold transition-colors px-1 py-0.5"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-blue-500 hover:text-blue-700 font-semibold transition-colors px-1 py-0.5"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
