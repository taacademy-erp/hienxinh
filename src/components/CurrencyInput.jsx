import React, { useRef, useState, useEffect } from 'react';

/**
 * Reusable Currency Input for Vietnamese Dong (VNĐ)
 * - Xóa sạch các ký tự không phải là số: value.replace(/\D/g, '')
 * - Tự động thêm dấu chấm chuẩn Việt Nam: new Intl.NumberFormat('vi-VN').format()
 * - Đảm bảo số 0 giữ nguyên là số 0 không bị nhảy số
 */
export default function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  required = false,
  readOnly = false,
  ...props
}) {
  const inputRef = useRef(null);

  // Hàm format chuẩn Việt Nam bằng Intl.NumberFormat('vi-VN')
  const formatNumber = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const clean = String(val).replace(/\D/g, '');
    if (clean === '') return '';
    return new Intl.NumberFormat('vi-VN').format(Number(clean));
  };

  // State cục bộ giúp hiển thị mượt mà khi gõ từng ký tự
  const [displayValue, setDisplayValue] = useState(() => {
    if (value === 0 || value === '0') return '0';
    return formatNumber(value);
  });

  // Đồng bộ khi value từ component cha thay đổi từ bên ngoài
  useEffect(() => {
    const currentNum = Number(String(displayValue).replace(/\D/g, '')) || 0;
    const incomingNum = Number(value) || 0;
    if (incomingNum !== currentNum || (displayValue === '' && value !== '' && value !== null && value !== undefined)) {
      if (value === 0 || value === '0') {
        setDisplayValue('0');
      } else {
        setDisplayValue(formatNumber(value));
      }
    }
  }, [value]);

  const handleChange = (e) => {
    const rawValue = e.target.value;

    // 1. Bắt buộc dùng value.replace(/\D/g, '') để xóa sạch các ký tự không phải là số trước
    const cleanValue = rawValue.replace(/\D/g, '');

    // Đo khoảng cách con trỏ từ mép phải để giữ vị trí khi tự động chèn dấu chấm
    const oldCursor = e.target.selectionStart || 0;
    const distanceFromRight = rawValue.length - oldCursor;

    // Nếu người dùng xóa sạch ô nhập
    if (cleanValue === '') {
      setDisplayValue('');
      if (onChange) {
        onChange(0);
      }
      return;
    }

    // 2. Dùng new Intl.NumberFormat('vi-VN').format() để tự động thêm dấu chấm chuẩn Việt Nam
    const num = Number(cleanValue);
    const formatted = new Intl.NumberFormat('vi-VN').format(num);

    // Cập nhật giá trị hiển thị giữ nguyên số 0 không bị nhảy số
    setDisplayValue(formatted);

    // Gọi onChange truyền giá trị số cho component cha
    if (onChange) {
      onChange(num);
    }

    // Giữ vị trí con trỏ chuột chính xác không bị nhảy
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const newLen = formatted.length;
        const newCursor = Math.max(0, newLen - distanceFromRight);
        inputRef.current.setSelectionRange(newCursor, newCursor);
      }
    });
  };

  const handleFocus = (e) => {
    e.target.select();
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e) => {
    // Khi rời khỏi ô, nếu ô trống thì hiển thị '0'
    if (displayValue === '') {
      setDisplayValue('0');
      if (onChange) {
        onChange(0);
      }
    }
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
      className={className}
      {...props}
    />
  );
}
