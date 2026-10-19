/**
 * Utility functions for currency input and formatting in Vietnamese Dong (VNĐ)
 * Định dạng số tiền tự động phân chia cứ 3 số là 1 dấu chấm từ phải qua trái: 100.000, 1.500.000
 * Sử dụng new Intl.NumberFormat('vi-VN').format()
 */

/**
 * Định dạng chuỗi số thành chuỗi có dấu chấm phân cách hàng nghìn (VD: 1500000 -> "1.500.000", 0 -> "0")
 * @param {string|number} value
 * @returns {string}
 */
export const formatCurrencyInput = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const rawDigits = String(value).replace(/\D/g, '');
  if (rawDigits === '') return '';
  return new Intl.NumberFormat('vi-VN').format(Number(rawDigits));
};

/**
 * Lấy giá trị số nguyên từ chuỗi đã định dạng (VD: "1.500.000" -> 1500000)
 * @param {string|number} formattedValue
 * @returns {number}
 */
export const parseCurrencyInput = (formattedValue) => {
  if (formattedValue === null || formattedValue === undefined || formattedValue === '') return 0;
  const rawDigits = String(formattedValue).replace(/\D/g, '');
  return rawDigits ? parseInt(rawDigits, 10) : 0;
};

/**
 * Định dạng hiển thị tiền kèm chữ "đ"
 * @param {string|number} value
 * @returns {string}
 */
export const formatVNDWithDot = (value) => {
  if (value === null || value === undefined || value === '') return '0đ';
  const num = parseCurrencyInput(value);
  return (formatCurrencyInput(num) || '0') + 'đ';
};
