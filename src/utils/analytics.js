import { formatCurrency } from './formatters';

/**
 * Analytics Utility Functions
 * Pure functions for calculating budget and savings summaries across time periods and dimensions.
 */

/**
 * Filter transactions/savings by a specific year and month (YYYY-MM).
 * @param {Array} items - Array of transaction or savings objects.
 * @param {string} yearMonth - Format 'YYYY-MM'.
 * @returns {Array} Filtered items.
 */
export const filterByMonth = (items = [], yearMonth) => {
  if (!yearMonth) return items;
  return items.filter((item) => item.date && item.date.startsWith(yearMonth));
};

/**
 * Filter transactions/savings within a date range [startDateStr, endDateStr] (inclusive).
 * @param {Array} items - Array of transaction or savings objects.
 * @param {string} startDateStr - Format 'YYYY-MM-DD'.
 * @param {string} endDateStr - Format 'YYYY-MM-DD'.
 * @returns {Array} Filtered items.
 */
export const filterByDateRange = (items = [], startDateStr, endDateStr) => {
  const start = startDateStr ? new Date(startDateStr + 'T00:00:00') : null;
  const end = endDateStr ? new Date(endDateStr + 'T23:59:59') : null;

  return items.filter((item) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date + 'T00:00:00');
    if (start && itemDate < start) return false;
    if (end && itemDate > end) return false;
    return true;
  });
};

/**
 * Filter transactions/savings for the last N calendar months leading up to a reference date.
 * @param {Array} items - Array of objects containing a 'date' field (YYYY-MM-DD).
 * @param {number} nMonths - Number of months to include (e.g. 6 or 12).
 * @param {Date|string} [refDate=new Date()] - Reference date anchor.
 * @returns {Array} Filtered items.
 */
export const filterByLastNMonths = (items = [], nMonths = 6, refDate = new Date()) => {
  const reference = new Date(refDate);
  const endYear = reference.getFullYear();
  const endMonth = reference.getMonth();

  const startDate = new Date(endYear, endMonth - (nMonths - 1), 1);
  const endDate = new Date(endYear, endMonth + 1, 0, 23, 59, 59);

  return items.filter((item) => {
    if (!item.date) return false;
    const d = new Date(item.date + 'T00:00:00');
    return d >= startDate && d <= endDate;
  });
};

/**
 * Filter transactions/savings for a specific year (YYYY or number).
 * @param {Array} items - Array of items with 'date' field.
 * @param {number|string} year - E.g. 2026.
 * @returns {Array} Filtered items.
 */
export const filterByYear = (items = [], year) => {
  const yearStr = String(year);
  return items.filter((item) => item.date && item.date.startsWith(yearStr));
};

/**
 * Compute Income vs Expense totals for a set of budget transactions.
 * @param {Array} transactions - Array of budget transaction objects.
 * @returns {Object} { income, expense, netBalance, count }
 */
export const calculateIncomeVsExpense = (transactions = []) => {
  let income = 0;
  let expense = 0;

  transactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    const type = (tx.type || '').toLowerCase();
    if (type === 'credit') {
      income += amt;
    } else if (type === 'debit') {
      expense += amt;
    }
  });

  return {
    income,
    expense,
    netBalance: income - expense,
    count: transactions.length,
  };
};

/**
 * Compute Category-wise spend breakdown for debits/expenses.
 * @param {Array} transactions - Array of budget transaction objects.
 * @returns {Object} { totals: { [category]: amount }, categories: Array<{ name, spent, percent }> }
 */
export const calculateCategorySpend = (transactions = []) => {
  const totals = {};
  let totalExpense = 0;

  transactions.forEach((tx) => {
    const type = (tx.type || '').toLowerCase();
    if (type === 'debit') {
      const amt = Number(tx.amount) || 0;
      const category = tx.category || 'Miscellaneous';
      totals[category] = (totals[category] || 0) + amt;
      totalExpense += amt;
    }
  });

  const categories = Object.keys(totals).map((catName) => {
    const spent = totals[catName];
    const percent = totalExpense > 0 ? (spent / totalExpense) * 100 : 0;
    return {
      name: catName,
      spent,
      percent: Number(percent.toFixed(1)),
    };
  }).sort((a, b) => b.spent - a.spent);

  return { totals, categories, totalExpense };
};

/**
 * Compute Cash vs Online expense totals and percentages.
 * @param {Array} transactions - Array of budget transaction objects.
 * @returns {Object} { cashExpense, onlineExpense, totalExpense, cashPercent, onlinePercent }
 */
export const calculatePaymentModeTotals = (transactions = []) => {
  let cashExpense = 0;
  let onlineExpense = 0;

  transactions.forEach((tx) => {
    const type = (tx.type || '').toLowerCase();
    if (type === 'debit') {
      const amt = Number(tx.amount) || 0;
      const mode = (tx.mode || tx.paymentMode || '').toLowerCase();
      if (mode === 'cash') {
        cashExpense += amt;
      } else if (mode === 'online') {
        onlineExpense += amt;
      }
    }
  });

  const totalExpense = cashExpense + onlineExpense;
  const cashPercent = totalExpense > 0 ? (cashExpense / totalExpense) * 100 : 0;
  const onlinePercent = totalExpense > 0 ? (onlineExpense / totalExpense) * 100 : 0;

  return {
    cashExpense,
    onlineExpense,
    totalExpense,
    cashPercent: Number(cashPercent.toFixed(1)),
    onlinePercent: Number(onlinePercent.toFixed(1)),
  };
};

/**
 * Compute Savings movement totals (deposits vs withdrawals).
 * @param {Array} savingsTransactions - Array of savings transaction objects.
 * @returns {Object} { totalAdded, totalWithdrawn, netSavings, count }
 */
export const calculateSavingsMovement = (savingsTransactions = []) => {
  let totalAdded = 0;
  let totalWithdrawn = 0;

  savingsTransactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    const type = (tx.type || '').toLowerCase();
    if (type === 'deposit' || type === 'added') {
      totalAdded += amt;
    } else if (type === 'withdraw' || type === 'withdrawn') {
      totalWithdrawn += amt;
    }
  });

  return {
    totalAdded,
    totalWithdrawn,
    netSavings: totalAdded - totalWithdrawn,
    count: savingsTransactions.length,
  };
};

/**
 * Generate complete summary stats for a given dataset of transactions & savings.
 * @param {Array} transactions 
 * @param {Array} savingsTransactions 
 * @returns {Object} Complete summary metrics
 */
export const getSummaryAnalytics = (transactions = [], savingsTransactions = []) => {
  const financial = calculateIncomeVsExpense(transactions);
  const category = calculateCategorySpend(transactions);
  const paymentMode = calculatePaymentModeTotals(transactions);
  const savings = calculateSavingsMovement(savingsTransactions);

  return {
    ...financial,
    categoryBreakdown: category,
    paymentModeBreakdown: paymentMode,
    savingsMovement: savings,
  };
};

/**
 * Applies multi-dimensional filtering to transactions and savings.
 * @param {Array} transactions 
 * @param {Array} savingsTransactions 
 * @param {Object} filters - { startDate, endDate, type, mode, category, year, month }
 * @returns {Object} { filteredTransactions, filteredSavingsTransactions }
 */
export const applyAnalyticsFilters = (transactions = [], savingsTransactions = [], filters = {}) => {
  const { startDate, endDate, type, mode, category, year, month } = filters;

  const filteredTxs = transactions.filter((tx) => {
    if (!tx.date) return false;

    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;

    if (year && year !== 'all' && !tx.date.startsWith(String(year))) return false;

    if (month && month !== 'all') {
      if (month.includes('-') && !tx.date.startsWith(month)) return false;
      if (!month.includes('-') && tx.date.substring(5, 7) !== month) return false;
    }

    if (type && type !== 'all') {
      if ((tx.type || '').toLowerCase() !== type.toLowerCase()) return false;
    }

    if (mode && mode !== 'all') {
      const txMode = (tx.mode || tx.paymentMode || '').toLowerCase();
      if (txMode !== mode.toLowerCase()) return false;
    }

    if (category && category !== 'all') {
      if ((tx.category || '').toLowerCase() !== category.toLowerCase()) return false;
    }

    return true;
  });

  const filteredSavings = savingsTransactions.filter((tx) => {
    if (!tx.date) return false;

    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;

    if (year && year !== 'all' && !tx.date.startsWith(String(year))) return false;

    if (month && month !== 'all') {
      if (month.includes('-') && !tx.date.startsWith(month)) return false;
      if (!month.includes('-') && tx.date.substring(5, 7) !== month) return false;
    }

    if (type && type !== 'all') {
      const t = (tx.type || '').toLowerCase();
      if (type.toLowerCase() === 'credit' && !(t === 'deposit' || t === 'added')) return false;
      if (type.toLowerCase() === 'debit' && !(t === 'withdraw' || t === 'withdrawn')) return false;
    }

    return true;
  });

  return {
    filteredTransactions: filteredTxs,
    filteredSavingsTransactions: filteredSavings,
  };
};

/**
 * Aggregates transaction & savings data for a specific month (YYYY-MM).
 * @param {Array} transactions 
 * @param {Array} savingsTransactions 
 * @param {string} yearMonth - Format 'YYYY-MM'
 * @returns {Object} Monthly summary
 */
export const getMonthlyAggregation = (transactions = [], savingsTransactions = [], yearMonth) => {
  const filteredTxs = filterByMonth(transactions, yearMonth);
  const filteredSavings = filterByMonth(savingsTransactions, yearMonth);
  return {
    period: yearMonth,
    summary: getSummaryAnalytics(filteredTxs, filteredSavings),
    transactions: filteredTxs,
    savingsTransactions: filteredSavings,
  };
};

/**
 * Aggregates transaction & savings data across the last N months (e.g. 6 or 12 months),
 * broken down month-by-month in chronological order.
 * @param {Array} transactions 
 * @param {Array} savingsTransactions 
 * @param {number} nMonths - Number of months (default 6 or 12)
 * @param {Date|string} [refDate=new Date()] 
 * @returns {Object} { overallSummary, monthlySeries: Array<{ monthKey, monthLabel, summary }> }
 */
export const getLastNMonthsAggregation = (
  transactions = [],
  savingsTransactions = [],
  nMonths = 6,
  refDate = new Date()
) => {
  const reference = new Date(refDate);
  const monthlySeries = [];

  const filteredTxs = filterByLastNMonths(transactions, nMonths, reference);
  const filteredSavings = filterByLastNMonths(savingsTransactions, nMonths, reference);

  for (let i = nMonths - 1; i >= 0; i--) {
    const d = new Date(reference.getFullYear(), reference.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleString('default', { month: 'short', year: 'numeric' });

    const monthTxs = filterByMonth(transactions, monthKey);
    const monthSavings = filterByMonth(savingsTransactions, monthKey);

    monthlySeries.push({
      monthKey,
      monthLabel,
      summary: getSummaryAnalytics(monthTxs, monthSavings),
      transactions: monthTxs,
      savingsTransactions: monthSavings,
    });
  }

  return {
    nMonths,
    overallSummary: getSummaryAnalytics(filteredTxs, filteredSavings),
    monthlySeries,
  };
};

/**
 * Aggregates month-by-month series for all 12 months (Jan-Dec) of a specific year.
 * @param {Array} transactions 
 * @param {Array} savingsTransactions 
 * @param {number|string} yearStr - Format 'YYYY'
 * @returns {Array} Array of 12 monthly summary objects
 */
export const getYearMonthlySeries = (transactions = [], savingsTransactions = [], yearStr) => {
  const series = [];
  const y = Number(yearStr) || new Date().getFullYear();
  for (let m = 1; m <= 12; m++) {
    const monthKey = `${y}-${String(m).padStart(2, '0')}`;
    const d = new Date(y, m - 1, 1);
    const monthLabel = d.toLocaleString('default', { month: 'short' });
    const monthTxs = filterByMonth(transactions, monthKey);
    const monthSavings = filterByMonth(savingsTransactions, monthKey);
    series.push({
      monthKey,
      monthLabel,
      summary: getSummaryAnalytics(monthTxs, monthSavings),
      transactions: monthTxs,
      savingsTransactions: monthSavings,
    });
  }
  return series;
};

/**
 * Aggregates transaction & savings data year-by-year across all available data.
 * @param {Array} transactions 
 * @param {Array} savingsTransactions 
 * @returns {Object} { yearlySeries: Array<{ year, summary }> }
 */
export const getYearWiseAggregation = (transactions = [], savingsTransactions = []) => {
  const yearsSet = new Set();

  transactions.forEach((tx) => {
    if (tx.date && tx.date.length >= 4) {
      yearsSet.add(tx.date.substring(0, 4));
    }
  });

  savingsTransactions.forEach((tx) => {
    if (tx.date && tx.date.length >= 4) {
      yearsSet.add(tx.date.substring(0, 4));
    }
  });

  if (yearsSet.size === 0) {
    yearsSet.add(String(new Date().getFullYear()));
  }

  const sortedYears = Array.from(yearsSet).sort((a, b) => Number(a) - Number(b));

  const yearlySeries = sortedYears.map((yearStr) => {
    const yearTxs = filterByYear(transactions, yearStr);
    const yearSavings = filterByYear(savingsTransactions, yearStr);
    return {
      year: yearStr,
      summary: getSummaryAnalytics(yearTxs, yearSavings),
      transactions: yearTxs,
      savingsTransactions: yearSavings,
    };
  });

  return {
    years: sortedYears,
    yearlySeries,
  };
};

/**
 * Helper: Given YYYY-MM, returns the previous month's YYYY-MM string.
 * @param {string} yearMonthStr - 'YYYY-MM'
 * @returns {string} 'YYYY-MM'
 */
export const getPreviousMonthKey = (yearMonthStr) => {
  if (!yearMonthStr || !yearMonthStr.includes('-')) return '';
  const [y, m] = yearMonthStr.split('-').map(Number);
  const prevDate = new Date(y, m - 2, 1);
  return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Helper: Given YYYY-MM, returns the same month last year's YYYY-MM string.
 * @param {string} yearMonthStr - 'YYYY-MM'
 * @returns {string} 'YYYY-MM'
 */
export const getSameMonthLastYearKey = (yearMonthStr) => {
  if (!yearMonthStr || !yearMonthStr.includes('-')) return '';
  const [y, m] = yearMonthStr.split('-');
  return `${Number(y) - 1}-${m}`;
};

/**
 * Compute difference metrics and percentage change between current and baseline numeric values.
 * @param {number} currentVal 
 * @param {number} baselineVal 
 * @returns {Object} { current, baseline, diff, percent, direction }
 */
export const calcDiffMetrics = (currentVal = 0, baselineVal = 0) => {
  const diff = currentVal - baselineVal;
  let percent = 0;
  if (baselineVal !== 0) {
    percent = (diff / Math.abs(baselineVal)) * 100;
  } else if (currentVal !== 0) {
    percent = 100;
  }
  const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';
  return {
    current: currentVal,
    baseline: baselineVal,
    diff,
    percent: Number(percent.toFixed(1)),
    direction,
  };
};

/**
 * Compare two summary analytics objects and return income, expense, savings, and category differences.
 * @param {Object} currentSummary 
 * @param {Object} baselineSummary 
 * @returns {Object} Comparison metrics object
 */
export const compareSummaries = (currentSummary, baselineSummary) => {
  const cIncome = currentSummary?.totalIncome ?? currentSummary?.income ?? 0;
  const bIncome = baselineSummary?.totalIncome ?? baselineSummary?.income ?? 0;
  const incomeChange = calcDiffMetrics(cIncome, bIncome);

  const cExpense = currentSummary?.totalExpense ?? currentSummary?.expense ?? 0;
  const bExpense = baselineSummary?.totalExpense ?? baselineSummary?.expense ?? 0;
  const expenseChange = calcDiffMetrics(cExpense, bExpense);

  const cNetSavings = currentSummary?.savingsTotals?.netSavings ?? currentSummary?.savingsMovement?.netSavings ?? 0;
  const bNetSavings = baselineSummary?.savingsTotals?.netSavings ?? baselineSummary?.savingsMovement?.netSavings ?? 0;
  const savingsChange = calcDiffMetrics(cNetSavings, bNetSavings);

  const cCats = currentSummary?.categoryBreakdown?.totals || {};
  const bCats = baselineSummary?.categoryBreakdown?.totals || {};
  const allCategoriesSet = new Set([...Object.keys(cCats), ...Object.keys(bCats)]);

  const categoryDifferences = Array.from(allCategoriesSet).map((catName) => {
    const cSpent = cCats[catName] || 0;
    const bSpent = bCats[catName] || 0;
    return {
      category: catName,
      ...calcDiffMetrics(cSpent, bSpent),
    };
  }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  return {
    incomeChange,
    expenseChange,
    savingsChange,
    categoryDifferences,
  };
};

/**
 * Automatically generates data-driven financial insights.
 * @param {Object} analyticsData - Computed summary analytics object.
 * @returns {Array} Array of insight objects
 */
export const generateAutoInsights = (analyticsData = {}) => {
  const insights = [];
  const {
    totalIncome = 0,
    totalExpense = 0,
    savingsTotals = {},
    monthlySeries = [],
    categoryBreakdown = {},
    paymentModeBreakdown = {},
  } = analyticsData;

  const numMonths = monthlySeries.length || 1;
  const netSavings = savingsTotals.netSavings || 0;
  const avgMonthlySavings = netSavings / numMonths;

  // 1. Highest Spending Month
  if (monthlySeries.length > 0) {
    let maxExpMonth = null;
    let maxExpVal = -1;

    monthlySeries.forEach((m) => {
      const exp = m.summary?.totalExpense || 0;
      if (exp > maxExpVal) {
        maxExpVal = exp;
        maxExpMonth = m;
      }
    });

    if (maxExpMonth && maxExpVal > 0) {
      insights.push({
        id: 'highest-spending-month',
        title: 'Highest Spending Month',
        value: maxExpMonth.monthLabel,
        detail: `${formatCurrency(maxExpVal)} total debits logged`,
        type: 'rose',
        iconName: 'FiTrendingDown',
        badge: 'Peak Expense',
      });
    }
  }

  // 2. Lowest Spending Month
  if (monthlySeries.length > 0) {
    let minExpMonth = null;
    let minExpVal = Infinity;

    monthlySeries.forEach((m) => {
      const exp = m.summary?.totalExpense || 0;
      if (exp < minExpVal && exp > 0) {
        minExpVal = exp;
        minExpMonth = m;
      }
    });

    if (minExpMonth && minExpVal < Infinity) {
      insights.push({
        id: 'lowest-spending-month',
        title: 'Lowest Spending Month',
        value: minExpMonth.monthLabel,
        detail: `${formatCurrency(minExpVal)} total debits logged`,
        type: 'emerald',
        iconName: 'FiTrendingUp',
        badge: 'Most Frugal',
      });
    }
  }

  // 3. Highest Income Month
  if (monthlySeries.length > 0) {
    let maxIncMonth = null;
    let maxIncVal = -1;

    monthlySeries.forEach((m) => {
      const inc = m.summary?.totalIncome || 0;
      if (inc > maxIncVal) {
        maxIncVal = inc;
        maxIncMonth = m;
      }
    });

    if (maxIncMonth && maxIncVal > 0) {
      insights.push({
        id: 'highest-income-month',
        title: 'Highest Income Month',
        value: maxIncMonth.monthLabel,
        detail: `${formatCurrency(maxIncVal)} total income credited`,
        type: 'emerald',
        iconName: 'FiDollarSign',
        badge: 'Peak Earnings',
      });
    }
  }

  // 4. Best Savings Month
  if (monthlySeries.length > 0) {
    let bestSavMonth = null;
    let maxSavVal = -Infinity;

    monthlySeries.forEach((m) => {
      const sav = m.summary?.savingsTotals?.netSavings || 0;
      if (sav > maxSavVal) {
        maxSavVal = sav;
        bestSavMonth = m;
      }
    });

    if (bestSavMonth && maxSavVal > 0) {
      insights.push({
        id: 'best-savings-month',
        title: 'Best Savings Month',
        value: bestSavMonth.monthLabel,
        detail: `${formatCurrency(maxSavVal)} net savings growth`,
        type: 'sky',
        iconName: 'FiZap',
        badge: 'Top Savings',
      });
    }
  }

  // 5. Top Category
  const categories = categoryBreakdown.categories || [];
  if (categories.length > 0 && categories[0].spent > 0) {
    const topCat = categories[0];
    insights.push({
      id: 'top-category',
      title: 'Top Spending Category',
      value: topCat.name,
      detail: `${formatCurrency(topCat.spent)} (${topCat.percent.toFixed(1)}% of budget)`,
      type: 'amber',
      iconName: 'FiAward',
      badge: 'Highest Category',
    });
  }

  // 6. Biggest Expense Pattern (Cash vs Online)
  const cashPct = paymentModeBreakdown.cashPercent || 0;
  const onlinePct = paymentModeBreakdown.onlinePercent || 0;

  if (cashPct > 0 || onlinePct > 0) {
    const dominantMode = onlinePct >= cashPct ? 'Online Digital' : 'Cash';
    const dominantPct = onlinePct >= cashPct ? onlinePct : cashPct;
    insights.push({
      id: 'biggest-expense-pattern',
      title: 'Payment Mode Pattern',
      value: `${dominantMode} Dominance`,
      detail: `${dominantPct.toFixed(1)}% of all expenses paid via ${dominantMode.toLowerCase()}`,
      type: 'indigo',
      iconName: 'FiGlobe',
      badge: 'Payment Behavior',
    });
  }

  // 7. Average Monthly Savings
  if (avgMonthlySavings !== 0) {
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    insights.push({
      id: 'avg-monthly-savings',
      title: 'Average Monthly Savings',
      value: `${formatCurrency(avgMonthlySavings)} / mo`,
      detail: `Savings rate: ${savingsRate.toFixed(1)}% of overall income`,
      type: 'violet',
      iconName: 'FiCreditCard',
      badge: 'Monthly Target',
    });
  }

  return insights;
};
