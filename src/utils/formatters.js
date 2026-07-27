import { format } from 'date-fns';
import { useSettingsStore } from '../store/useSettingsStore';
import { SUPPORTED_CURRENCIES } from '../data/constants';

export const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

export const getCurrencyInfo = (currencyCode = 'INR') => {
  const found = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  return found || { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', locale: 'en-IN' };
};

/**
 * Custom React hook to subscribe to the active currency settings.
 * Re-renders automatically when the user updates their currency preference in Settings.
 */
export function useCurrency() {
  const currencyCode = useSettingsStore((state) => state.currency) || 'INR';
  const currencyInfo = getCurrencyInfo(currencyCode);
  return {
    code: currencyCode,
    symbol: currencyInfo.symbol,
    name: currencyInfo.name,
    locale: currencyInfo.locale,
  };
}

/**
 * Formats a numeric currency value using Intl.NumberFormat.
 * Reads the active currency preference from useSettingsStore by default.
 * Returns fallback ('-') when amount is 0, null, or undefined.
 *
 * @param {number} amount - The numeric monetary value.
 * @param {Object} options - { currency, symbol, fallback = '-', sign = false, decimals = 2 }
 * @returns {string} Formatted currency string (e.g. "₹ 25,000.00", "$ 1,250.00")
 */
export const formatCurrency = (amount, options = {}) => {
  let selectedCurrencyCode = options.currency;
  if (!selectedCurrencyCode) {
    try {
      selectedCurrencyCode = useSettingsStore.getState().currency || 'INR';
    } catch {
      selectedCurrencyCode = 'INR';
    }
  }

  const {
    symbol,
    fallback = '-',
    sign = false,
    decimals = 2,
  } = options;

  if (amount === null || amount === undefined) return fallback;
  const num = Number(amount);
  if (isNaN(num) || num === 0) {
    return fallback;
  }

  const currInfo = getCurrencyInfo(selectedCurrencyCode);
  const currSymbol = symbol || currInfo.symbol;
  const locale = currInfo.locale || (selectedCurrencyCode === 'INR' ? 'en-IN' : 'en-US');

  // Format using standard JavaScript Intl.NumberFormat API
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const absFormatted = formatter.format(Math.abs(num));
  const signPrefix = num > 0 ? (sign ? '+' : '') : '-';

  return `${signPrefix}${currSymbol} ${absFormatted}`;
};

/**
 * Formats a percentage value.
 * Returns fallback ('-') when percent is 0, null, or undefined.
 *
 * @param {number} percent - The percentage number.
 * @param {Object} options - { fallback = '-', decimals = 1, sign = false }
 * @returns {string} Formatted percent string
 */
export const formatPercent = (percent, options = {}) => {
  const { fallback = '-', decimals = 1, sign = false } = options;
  if (percent === null || percent === undefined) return fallback;
  const num = Number(percent);
  if (isNaN(num) || num === 0) {
    return fallback;
  }
  const signPrefix = num > 0 && sign ? '+' : '';
  return `${signPrefix}${num.toFixed(decimals)}%`;
};
