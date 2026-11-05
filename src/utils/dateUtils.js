/**
 * Utility functions for date normalization and comparison across the app.
 * Handles discrepancies between '5/11/2026' and '05/11/2026', 'YYYY-MM-DD', etc.
 */

/**
 * Standardize any date representation to 'DD/MM/YYYY' (with zero-padding)
 * @param {string|Date|number} d 
 * @returns {string} e.g. '05/11/2026'
 */
export function normalizeDate(d) {
  if (!d) return '';
  if (d instanceof Date && !isNaN(d)) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
  }

  let str = String(d).trim();
  if (!str) return '';

  // Handle ISO strings with time: '2026-11-05T14:30:00.000Z'
  if (str.includes('T')) {
    str = str.split('T')[0];
  }

  // Handle YYYY-MM-DD
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
  }

  // Handle D/M/YYYY or DD/MM/YYYY or D/M
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${day}/${month}/${year}`;
    }
    if (parts.length === 2) {
      const p1 = parts[0].padStart(2, '0');
      const p2 = parts[1].length === 4 ? parts[1] : parts[1].padStart(2, '0');
      return `${p1}/${p2}`;
    }
  }

  return str;
}

/**
 * Check if a record's date matches a user filter.
 * Handles variations like:
 * - '5/11/2026' matching '05/11/2026'
 * - '05/11/2026' matching month '11/2026'
 * - '05/11/2026' matching '05/11'
 * @param {string} recordDate 
 * @param {string} filter 
 * @returns {boolean}
 */
export function isDateMatch(recordDate, filter) {
  if (!filter || filter === 'all' || !filter.trim()) return true;
  if (!recordDate) return false;

  const rawRecord = String(recordDate).trim();
  const rawFilter = String(filter).trim();

  // Fast check: raw substring
  if (rawRecord.toLowerCase().includes(rawFilter.toLowerCase())) return true;

  const normRecord = normalizeDate(rawRecord);
  const normFilter = normalizeDate(rawFilter);

  // Exact match (full date e.g. 05/11/2026)
  if (normRecord === normFilter) return true;

  // Filter is Month/Year e.g. '11/2026'
  const filterParts = normFilter.split('/');
  const recordParts = normRecord.split('/');

  if (filterParts.length === 2 && recordParts.length === 3) {
    // If filter is MM/YYYY (2nd part is 4 digits)
    if (filterParts[1].length === 4) {
      if (recordParts[1] === filterParts[0] && recordParts[2] === filterParts[1]) {
        return true;
      }
    }
    // If filter is DD/MM
    if (recordParts[0] === filterParts[0] && recordParts[1] === filterParts[1]) {
      return true;
    }
  }

  return false;
}

/**
 * Returns today's date formatted as standard 'DD/MM/YYYY'
 * @returns {string}
 */
export function getTodayFormatted() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
}
