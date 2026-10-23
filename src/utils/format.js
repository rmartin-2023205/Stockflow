/**
 * Format helper utilities for StockFlow
 */

/**
 * Format numeric value as currency
 * @param {number|string} amount
 * @param {string} currency - GTQ, USD, MXN, etc.
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'GTQ') {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numeric) || numeric === null || numeric === undefined) {
    return `${currency === 'GTQ' ? 'Q' : '$'} 0.00`;
  }

  const symbol = currency === 'GTQ' ? 'Q' : currency === 'USD' ? '$' : `${currency} `;
  const formatted = new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);

  return `${symbol} ${formatted}`;
}

/**
 * Calculate profit and margin percentage
 * @param {number|string} costPrice
 * @param {number|string} salePrice
 */
export function calculateProfitAndMargin(costPrice, salePrice) {
  const cost = parseFloat(costPrice) || 0;
  const sale = parseFloat(salePrice) || 0;
  const profit = sale - cost;
  const marginPercentage = sale > 0 ? (profit / sale) * 100 : 0;

  let health = 'neutral';
  if (profit < 0) {
    health = 'negative';
  } else if (marginPercentage >= 30) {
    health = 'healthy';
  } else if (marginPercentage >= 10) {
    health = 'moderate';
  } else if (marginPercentage > 0) {
    health = 'low';
  }

  return {
    profit,
    marginPercentage: Math.round(marginPercentage * 10) / 10,
    health,
  };
}

/**
 * Format date in friendly localized format
 * @param {string|Date} date
 */
export function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}
