import React, { useRef } from 'react';
import { formatCurrencyInput } from '../utils/currencyUtils';

/**
 * Reusable Currency Input for Vietnamese Dong (VNĐ)
 * - Tự động phân chia cứ 3 số là 1 dấu chấm từ phải qua trái: 100.000, 1.500.000
 * - Tự động bôi đen toàn bộ số khi click/focus vào (select all) để nhập đè thay thế nhanh
 * - Xử lý thông minh khi nhấn Backspace qua dấu chấm
 * - Giữ con trỏ chuột mượt mà ở vị trí gõ không bị nhảy
 * - Cho phép nhập số thuần túy (VD: 100000) hoặc nhập kèm dấu chấm (VD: 100.000)
 */
export default function CurrencyInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  required = false,
  readOnly = false,
  showZero = false,
  ...props
}) {
  const inputRef = useRef(null);

  // Formatted display value: if 0 and !showZero, display empty string so placeholder is visible
  const numValue = typeof value === 'number' ? value : (parseInt(String(value || '').replace(/\D/g, ''), 10) || 0);
  const displayValue = numValue > 0 || showZero ? formatCurrencyInput(numValue) : '';

  const handleChange = (e) => {
    const input = e.target;
    const raw = input.value;
    const oldCursor = input.selectionStart || 0;
    const distanceFromRight = raw.length - oldCursor;

    // Sanitize to only numeric digits
    const digits = raw.replace(/\D/g, '');
    const num = digits ? parseInt(digits, 10) : 0;

    if (onChange) {
      onChange(num);
    }

    // Preserve cursor position relative to the right side
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const newLen = inputRef.current.value.length;
        const newCursor = Math.max(0, newLen - distanceFromRight);
        inputRef.current.setSelectionRange(newCursor, newCursor);
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      const input = e.target;
      const { selectionStart, selectionEnd, value: currentVal } = input;
      // If single cursor position (no range selected) and not at index 0
      if (selectionStart === selectionEnd && selectionStart > 0) {
        // If the character right before cursor is a dot '.', delete the digit before the dot
        if (currentVal[selectionStart - 1] === '.') {
          e.preventDefault();
          const before = currentVal.slice(0, selectionStart - 2);
          const after = currentVal.slice(selectionStart);
          const raw = before + after;
          const digits = raw.replace(/\D/g, '');
          const num = digits ? parseInt(digits, 10) : 0;
          if (onChange) onChange(num);

          requestAnimationFrame(() => {
            if (inputRef.current) {
              const newLen = inputRef.current.value.length;
              const distFromRight = currentVal.length - selectionStart;
              const newPos = Math.max(0, newLen - distFromRight);
              inputRef.current.setSelectionRange(newPos, newPos);
            }
          });
        }
      }
    }
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  const handleFocus = (e) => {
    // Automatically select all content on focus so typing replaces immediately
    const target = e.target;
    if (target) {
      target.select();
      setTimeout(() => {
        if (target) target.select();
      }, 30);
    }
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
      className={className}
      {...props}
    />
  );
}
