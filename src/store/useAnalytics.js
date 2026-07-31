import { useMemo } from 'react';
import { useTransactionStore } from './useTransactionStore';
import { useSavingsStore } from './useSavingsStore';
import {
  getMonthlyAggregation,
  getLastNMonthsAggregation,
  getYearWiseAggregation,
  getYearMonthlySeries,
  getSummaryAnalytics,
  filterByYear,
  getPreviousMonthKey,
  getSameMonthLastYearKey,
  compareSummaries,
  applyAnalyticsFilters,
} from '../utils/analytics';

/**
 * Normalizes a raw summary object into the requested analytics selector interface.
 * Returns: totalIncome, totalExpense, netBalance, categoryBreakdown, paymentModeBreakdown, savingsTotals.
 */
export const normalizeAnalyticsSummary = (summary) => {
  if (!summary) return null;
  return {
    totalIncome: summary.income || 0,
    income: summary.income || 0,
    totalExpense: summary.expense || 0,
    expense: summary.expense || 0,
    netBalance: summary.netBalance || 0,
    openingBalance: summary.carryForward?.openingBalance || 0,
    closingBalance: summary.carryForward?.closingBalance || summary.netBalance || 0,
    openingSavings: summary.carryForward?.openingSavings || 0,
    closingSavings: summary.carryForward?.closingSavings || summary.savingsMovement?.netSavings || 0,
    openingMF: summary.carryForward?.openingMF || 0,
    closingMF: summary.carryForward?.closingMF || 0,
    openingGold: summary.carryForward?.openingGold || 0,
    closingGold: summary.carryForward?.closingGold || 0,
    categoryBreakdown: summary.categoryBreakdown || { totals: {}, categories: [], totalExpense: 0 },
    paymentModeBreakdown: summary.paymentModeBreakdown || { cashExpense: 0, onlineExpense: 0, totalExpense: 0, cashPercent: 0, onlinePercent: 0 },
    savingsTotals: summary.savingsMovement || { totalAdded: 0, totalWithdrawn: 0, netSavings: 0, count: 0 },
    count: summary.count || 0,
    carryForward: summary.carryForward || null,
  };
};

/**
 * Pure Selector: Selected Month Summary
 */
export const selectMonthSummary = (transactions = [], savingsTransactions = [], yearMonth) => {
  const targetMonth = yearMonth || new Date().toISOString().substring(0, 7);
  const agg = getMonthlyAggregation(transactions, savingsTransactions, targetMonth);
  return {
    period: targetMonth,
    ...normalizeAnalyticsSummary(agg.summary),
    transactions: agg.transactions,
    savingsTransactions: agg.savingsTransactions,
  };
};

/**
 * Pure Selector: Last 6 Months Summary
 */
export const selectLast6MonthsSummary = (transactions = [], savingsTransactions = [], refDate = new Date()) => {
  const agg = getLastNMonthsAggregation(transactions, savingsTransactions, 6, refDate);
  return {
    period: 'Last 6 Months',
    ...normalizeAnalyticsSummary(agg.overallSummary),
    monthlySeries: agg.monthlySeries.map((m) => ({
      ...m,
      summary: normalizeAnalyticsSummary(m.summary),
    })),
  };
};

/**
 * Pure Selector: Last 12 Months Summary
 */
export const selectLast12MonthsSummary = (transactions = [], savingsTransactions = [], refDate = new Date()) => {
  const agg = getLastNMonthsAggregation(transactions, savingsTransactions, 12, refDate);
  return {
    period: 'Last 12 Months',
    ...normalizeAnalyticsSummary(agg.overallSummary),
    monthlySeries: agg.monthlySeries.map((m) => ({
      ...m,
      summary: normalizeAnalyticsSummary(m.summary),
    })),
  };
};

/**
 * Pure Selector: Yearly Summary
 */
export const selectYearlySummary = (transactions = [], savingsTransactions = [], year) => {
  const yearStr = year ? String(year) : String(new Date().getFullYear());
  const filteredTxs = filterByYear(transactions, yearStr);
  const filteredSavings = filterByYear(savingsTransactions, yearStr);
  const summary = getSummaryAnalytics(filteredTxs, filteredSavings);

  const rawMonthlySeries = getYearMonthlySeries(transactions, savingsTransactions, yearStr);
  const agg = getYearWiseAggregation(transactions, savingsTransactions);

  return {
    period: `Year ${yearStr}`,
    year: yearStr,
    ...normalizeAnalyticsSummary(summary),
    monthlySeries: rawMonthlySeries.map((m) => ({
      ...m,
      summary: normalizeAnalyticsSummary(m.summary),
    })),
    years: agg.years,
    yearlySeries: agg.yearlySeries.map((y) => ({
      ...y,
      summary: normalizeAnalyticsSummary(y.summary),
    })),
    transactions: filteredTxs,
    savingsTransactions: filteredSavings,
  };
};

/**
 * Pure Selector: Compare selected month against baseline month (prevMonth or sameMonthLastYear).
 */
export const selectMonthlyComparison = (
  transactions = [],
  savingsTransactions = [],
  selectedMonth,
  comparisonMode = 'prevMonth'
) => {
  const currentMonthKey = selectedMonth || new Date().toISOString().substring(0, 7);
  const baselineMonthKey =
    comparisonMode === 'sameMonthLastYear'
      ? getSameMonthLastYearKey(currentMonthKey)
      : getPreviousMonthKey(currentMonthKey);

  const currentMonthData = selectMonthSummary(transactions, savingsTransactions, currentMonthKey);
  const baselineMonthData = selectMonthSummary(transactions, savingsTransactions, baselineMonthKey);

  const comparison = compareSummaries(currentMonthData, baselineMonthData);

  return {
    currentMonthKey,
    baselineMonthKey,
    comparisonMode,
    currentSummary: currentMonthData,
    baselineSummary: baselineMonthData,
    ...comparison,
  };
};

/**
 * Pure Selector: Compare two years (targetYear vs baselineYear).
 */
export const selectYearlyComparison = (
  transactions = [],
  savingsTransactions = [],
  targetYear,
  baselineYear
) => {
  const currentYear = targetYear ? String(targetYear) : String(new Date().getFullYear());
  const baseYear = baselineYear ? String(baselineYear) : String(Number(currentYear) - 1);

  const targetSummary = selectYearlySummary(transactions, savingsTransactions, currentYear);
  const baselineSummary = selectYearlySummary(transactions, savingsTransactions, baseYear);

  const summaryDiff = compareSummaries(targetSummary, baselineSummary);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthWiseDifferences = monthNames.map((monthName, idx) => {
    const tMonth = targetSummary.monthlySeries[idx]?.summary || {};
    const bMonth = baselineSummary.monthlySeries[idx]?.summary || {};

    const tIncome = tMonth.totalIncome || 0;
    const bIncome = bMonth.totalIncome || 0;
    const incomeDiff = tIncome - bIncome;

    const tExpense = tMonth.totalExpense || 0;
    const bExpense = bMonth.totalExpense || 0;
    const expenseDiff = tExpense - bExpense;

    const tSavings = tMonth.savingsTotals?.netSavings || 0;
    const bSavings = bMonth.savingsTotals?.netSavings || 0;
    const savingsDiff = tSavings - bSavings;

    return {
      monthName,
      targetIncome: tIncome,
      baselineIncome: bIncome,
      incomeDiff,
      targetExpense: tExpense,
      baselineExpense: bExpense,
      expenseDiff,
      targetSavings: tSavings,
      baselineSavings: bSavings,
      savingsDiff,
    };
  });

  return {
    targetYear: currentYear,
    baselineYear: baseYear,
    targetSummary,
    baselineSummary,
    ...summaryDiff,
    monthWiseDifferences,
  };
};

/**
 * Custom React Hook for Monthly Comparison
 */
export const useMonthlyComparison = (selectedMonth, comparisonMode = 'prevMonth') => {
  const transactions = useTransactionStore((state) => state.transactions);
  const savingsTransactions = useSavingsStore((state) => state.savingsTransactions);

  return useMemo(() => {
    return selectMonthlyComparison(transactions, savingsTransactions, selectedMonth, comparisonMode);
  }, [transactions, savingsTransactions, selectedMonth, comparisonMode]);
};

/**
 * Custom React Hook for Year-to-Year Comparison
 */
export const useYearlyComparison = (targetYear, baselineYear) => {
  const transactions = useTransactionStore((state) => state.transactions);
  const savingsTransactions = useSavingsStore((state) => state.savingsTransactions);

  return useMemo(() => {
    return selectYearlyComparison(transactions, savingsTransactions, targetYear, baselineYear);
  }, [transactions, savingsTransactions, targetYear, baselineYear]);
};

/**
 * Custom React Hook: Returns memoized derived analytics for any timeframe with filters.
 */
export const useAnalytics = (options = {}) => {
  const { timeframe = 'month', selectedMonth, selectedYear, refDate, filters = {} } = options;
  const transactions = useTransactionStore((state) => state.transactions);
  const savingsTransactions = useSavingsStore((state) => state.savingsTransactions);

  const filtersKey = JSON.stringify(filters);

  return useMemo(() => {
    const { filteredTransactions, filteredSavingsTransactions } = applyAnalyticsFilters(
      transactions,
      savingsTransactions,
      filters
    );

    switch (timeframe) {
      case '6months':
      case 'last6Months':
        return selectLast6MonthsSummary(filteredTransactions, filteredSavingsTransactions, refDate);
      case '12months':
      case 'last12Months':
        return selectLast12MonthsSummary(filteredTransactions, filteredSavingsTransactions, refDate);
      case 'year':
      case 'yearly':
        return selectYearlySummary(filteredTransactions, filteredSavingsTransactions, selectedYear || filters.year);
      case 'month':
      case 'monthly':
      default:
        return selectMonthSummary(filteredTransactions, filteredSavingsTransactions, selectedMonth || filters.month);
    }
  }, [transactions, savingsTransactions, timeframe, selectedMonth, selectedYear, refDate, filtersKey]);
};
