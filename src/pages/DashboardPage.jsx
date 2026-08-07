import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiFilter,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiArrowRight,
  FiRepeat,
  FiHome,
  FiShoppingBag,
  FiCoffee,
  FiNavigation,
  FiTv,
  FiBox,
} from 'react-icons/fi';
import { useTransactionStore } from '../store/useTransactionStore';
import { useSavingsStore } from '../store/useSavingsStore';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { calculateMonthCarryForward } from '../utils/analytics';
import {
  SectionHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  Badge,
  DocumentHeader,
  DocumentFooter,
} from '../components/ui';

// Utility to generate month options
const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  const currentYear = now.getFullYear();

  for (let year = currentYear - 1; year <= currentYear + 1; year++) {
    for (let month = 0; month < 12; month++) {
      const dateObj = new Date(year, month, 1);
      const value = `${year}-${String(month + 1).padStart(2, '0')}`;
      const label = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
  }
  return options;
};

const CATEGORIES_LIST = [
  { name: 'Need', icon: FiHome },
  { name: 'Food Ordered', icon: FiShoppingBag },
  { name: 'Dine Out', icon: FiCoffee },
  { name: 'Travel', icon: FiNavigation },
  { name: 'Entertainment', icon: FiTv },
  { name: 'Investment', icon: FiTrendingUp },
  { name: 'Miscellaneous', icon: FiBox },
];

const formatDate = (dateStr) => {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

export default function DashboardPage() {
  const { transactions } = useTransactionStore();

  const currentMonthValue = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);

  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const selectedMonthLabel = useMemo(() => {
    const found = monthOptions.find((m) => m.value === selectedMonth);
    if (found) return found.label;
    const [year, month] = selectedMonth.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, 1);
    return dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [selectedMonth, monthOptions]);

  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date && tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const { savingsTransactions } = useSavingsStore();

  const carryForward = useMemo(() => {
    return calculateMonthCarryForward(transactions, savingsTransactions, selectedMonth);
  }, [transactions, savingsTransactions, selectedMonth]);

  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;

    monthTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const type = (tx.type || '').toLowerCase();
      if (type === 'credit') {
        income += amt;
      } else if (type === 'debit') {
        expense += amt;
      }
    });

    const monthNet = income - expense;
    const openingBalance = carryForward.openingBalance;
    const closingBalance = carryForward.closingBalance;
    const count = monthTransactions.length;

    return {
      income,
      expense,
      monthNet,
      openingBalance,
      closingBalance,
      netBalance: closingBalance,
      count,
    };
  }, [monthTransactions, carryForward]);

  const paymentModeMetrics = useMemo(() => {
    let cashExpense = 0;
    let onlineExpense = 0;
    let cashIncome = 0;
    let onlineIncome = 0;

    monthTransactions.forEach((tx) => {
      const type = (tx.type || '').toLowerCase();
      const amt = Number(tx.amount) || 0;
      const mode = (tx.mode || '').toLowerCase();

      if (type === 'debit') {
        if (mode === 'cash') {
          cashExpense += amt;
        } else if (mode === 'online') {
          onlineExpense += amt;
        }
      } else if (type === 'credit') {
        if (mode === 'cash') {
          cashIncome += amt;
        } else if (mode === 'online') {
          onlineIncome += amt;
        }
      }
    });

    const totalExpense = metrics.expense || 1;
    const cashPercent = metrics.expense > 0 ? (cashExpense / totalExpense) * 100 : 0;
    const onlinePercent = metrics.expense > 0 ? (onlineExpense / totalExpense) * 100 : 0;

    const openingCashBalance = carryForward.openingCash;
    const openingOnlineBalance = carryForward.openingOnline;
    const closingCashBalance = carryForward.closingCash;
    const closingOnlineBalance = carryForward.closingOnline;
    const cashMonthNet = cashIncome - cashExpense;
    const onlineMonthNet = onlineIncome - onlineExpense;

    return {
      cashExpense,
      onlineExpense,
      cashPercent,
      onlinePercent,
      cashIncome,
      onlineIncome,
      openingCashBalance,
      openingOnlineBalance,
      closingCashBalance,
      closingOnlineBalance,
      cashBalance: closingCashBalance,
      onlineBalance: closingOnlineBalance,
      cashMonthNet,
      onlineMonthNet,
    };
  }, [monthTransactions, metrics.expense, carryForward]);

  const categoryMetrics = useMemo(() => {
    const totals = {};
    CATEGORIES_LIST.forEach((cat) => {
      totals[cat.name] = 0;
    });

    monthTransactions.forEach((tx) => {
      const type = (tx.type || '').toLowerCase();
      if (type === 'debit') {
        const amt = Number(tx.amount) || 0;
        const catName = tx.category;
        if (totals[catName] !== undefined) {
          totals[catName] += amt;
        } else {
          totals['Miscellaneous'] += amt;
        }
      }
    });

    const totalExpense = metrics.expense > 0 ? metrics.expense : 1;

    return CATEGORIES_LIST.map((cat) => {
      const spent = totals[cat.name] || 0;
      const percent = metrics.expense > 0 ? (spent / totalExpense) * 100 : 0;
      return {
        ...cat,
        spent,
        percent,
      };
    });
  }, [monthTransactions, metrics.expense]);

  const recentMonthTransactions = useMemo(() => {
    return [...monthTransactions]
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
      .slice(0, 5);
  }, [monthTransactions]);

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <DocumentHeader
        docType="EXECUTIVE SUMMARY"
        docRef="EFS-2026-07"
        title="Executive Financial Summary"
        subtitle="CEO monthly financial metrics & statement performance indicators"
        icon={FiPieChart}
        period={selectedMonthLabel}
      />

      {/* Period Selector */}
      <Card>
        <CardHeader variant="dark">
          <CardTitle icon={FiCalendar} iconColor="text-amber-400">Statement Period</CardTitle>
          <Badge variant="muted">{selectedMonthLabel}</Badge>
        </CardHeader>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest block">
              Reporting Month
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 uppercase tracking-wider font-display mt-0.5">
              {selectedMonthLabel}
            </h2>
          </div>

          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={monthOptions}
            className="min-w-[220px]"
          />
        </CardContent>
      </Card>

      {/* 4 Metric Cards — Stripe / Linear design with black title strip, icon, large financial value & small label */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Total Entries */}
        <Card className="border-l-4 border-l-stone-500">
          <CardHeader variant="dark">
            <CardTitle icon={FiFilter} iconColor="text-stone-300">Total Entries</CardTitle>
            <Badge variant="muted">{metrics.count || '0'}</Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-1">
            <div className="text-2xl sm:text-3xl xl:text-2xl 2xl:text-3xl font-mono font-extrabold text-stone-900 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              {metrics.count || '0'}
            </div>
            <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-300">
              Logged Items
            </span>
          </CardContent>
        </Card>

        {/* 2. Net Balance */}
        <Card className="border-l-4 border-l-stone-900">
          <CardHeader variant="dark">
            <CardTitle icon={FiPieChart} iconColor="text-amber-400">Net Balance</CardTitle>
            <Badge variant={metrics.closingBalance >= 0 ? 'emerald' : 'rose'}>
              {metrics.closingBalance >= 0 ? 'Closing Surplus' : 'Deficit'}
            </Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div>
              <div
                className={`text-2xl sm:text-3xl xl:text-2xl 2xl:text-3xl font-mono font-extrabold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis ${
                  metrics.closingBalance >= 0 ? 'text-stone-900' : 'text-rose-800'
                }`}
              >
                {formatCurrency(metrics.closingBalance)}
              </div>
              <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-stone-600">
                <span className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                  Opening: <span className="font-bold text-stone-800">{formatCurrency(metrics.openingBalance)}</span>
                </span>
                <span className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                  Month Net: <span className={`font-bold ${metrics.monthNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(metrics.monthNet, { sign: true })}</span>
                </span>
              </div>
            </div>

            {/* Cash & Online Balance Breakdown */}
            <div className="border-t border-stone-200 pt-3 grid grid-cols-2 gap-3">
              {/* Cash Balance */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1">
                  <span>💵</span> Cash
                </span>
                <div
                  className={`text-base sm:text-lg font-mono font-extrabold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis ${
                    paymentModeMetrics.cashBalance >= 0 ? 'text-emerald-800' : 'text-rose-800'
                  }`}
                >
                  {formatCurrency(Math.round(paymentModeMetrics.cashBalance), { decimals: 0 })}
                </div>
                <div className="text-[9px] font-mono text-stone-500 truncate">
                  Op: {formatCurrency(Math.round(paymentModeMetrics.openingCashBalance), { decimals: 0 })}
                </div>
              </div>
              {/* Online Balance */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1">
                  <span>💳</span> Online
                </span>
                <div
                  className={`text-base sm:text-lg font-mono font-extrabold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis ${
                    paymentModeMetrics.onlineBalance >= 0 ? 'text-indigo-800' : 'text-rose-800'
                  }`}
                >
                  {formatCurrency(paymentModeMetrics.onlineBalance)}
                </div>
                <div className="text-[9px] font-mono text-stone-500 truncate">
                  Op: {formatCurrency(paymentModeMetrics.openingOnlineBalance)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Total Income */}
        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader variant="dark">
            <CardTitle icon={FiArrowDownLeft} iconColor="text-emerald-400">Total Income</CardTitle>
            <Badge variant="emerald">Credits</Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-1">
            <div className="text-2xl sm:text-3xl xl:text-2xl 2xl:text-3xl font-mono font-extrabold text-stone-900 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              {formatCurrency(metrics.income)}
            </div>
            <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Monthly Credits
            </span>
          </CardContent>
        </Card>

        {/* 4. Total Expense */}
        <Card className="border-l-4 border-l-rose-600">
          <CardHeader variant="dark">
            <CardTitle icon={FiArrowUpRight} iconColor="text-rose-400">Total Expense</CardTitle>
            <Badge variant="rose">Debits</Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-1">
            <div className="text-2xl sm:text-3xl xl:text-2xl 2xl:text-3xl font-mono font-extrabold text-stone-900 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              {formatCurrency(metrics.expense)}
            </div>
            <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
              Monthly Debits
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Payment Mode Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Online Outflow (Left) */}
        <Card>
          <CardHeader variant="dark">
            <CardTitle icon={FiTv} iconColor="text-indigo-400">Online Outflow</CardTitle>
            <Badge variant="muted">Online</Badge>
          </CardHeader>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-stone-900">
                {formatCurrency(paymentModeMetrics.onlineExpense)}
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600 block">
                {formatPercent(paymentModeMetrics.onlinePercent)} of expenses
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cash Outflow (Right) */}
        <Card>
          <CardHeader variant="dark">
            <CardTitle icon={FiShoppingBag} iconColor="text-amber-400">Cash Outflow</CardTitle>
            <Badge variant="muted">Cash</Badge>
          </CardHeader>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-stone-900">
                {formatCurrency(paymentModeMetrics.cashExpense)}
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600 block">
                {formatPercent(paymentModeMetrics.cashPercent)} of expenses
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader variant="dark">
          <CardTitle icon={FiBox} iconColor="text-amber-400">Category Breakdown</CardTitle>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-200">
            Total: {formatCurrency(metrics.expense)}
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-stone-200">
            {categoryMetrics.map((cat) => (
              <div key={cat.name} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[#fcfbf9] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded bg-[#111111] text-stone-100 shrink-0">
                    <cat.icon className="text-xs" />
                  </div>
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-stone-900">{cat.name}</span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs font-mono font-bold text-stone-500">
                    {formatPercent(cat.percent)}
                  </span>
                  <span className="text-sm font-mono font-extrabold text-stone-900 min-w-[90px] text-right">
                    {formatCurrency(cat.spent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader variant="dark">
          <CardTitle icon={FiTrendingUp} iconColor="text-amber-400">Recent Activity</CardTitle>
          <Link
            to="/transactions"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-stone-300 hover:text-white transition-colors"
          >
            <span>View All</span>
            <FiArrowRight className="text-xs" />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {recentMonthTransactions.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">
                No statement entries for {selectedMonthLabel}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200">
              {recentMonthTransactions.map((tx) => {
                const typeStr = (tx.type || '').toLowerCase();
                const isCredit = typeStr === 'credit';
                const isConversion =
                  typeStr === 'conversion' ||
                  typeStr.includes('cash to online') ||
                  typeStr.includes('online to cash');

                return (
                  <div
                    key={tx.id}
                    className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[#fcfbf9] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-1.5 rounded shrink-0 ${
                          isConversion
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : isCredit
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {isConversion ? (
                          <FiRepeat className="text-sm" />
                        ) : isCredit ? (
                          <FiArrowDownLeft className="text-sm" />
                        ) : (
                          <FiArrowUpRight className="text-sm" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-stone-900 truncate">{tx.description}</div>
                        <div className="text-[11px] text-stone-500 font-mono mt-0.5 uppercase tracking-wide">
                          {formatDate(tx.date)} · {tx.category} ·{' '}
                          {tx.mode === 'Cash to Online'
                            ? 'Cash ➔ Online'
                            : tx.mode === 'Online to Cash'
                            ? 'Online ➔ Cash'
                            : tx.mode}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-sm font-mono font-extrabold shrink-0 text-right ${
                        isConversion
                          ? 'text-indigo-900'
                          : isCredit
                          ? 'text-emerald-800'
                          : 'text-rose-800'
                      }`}
                    >
                      {isConversion
                        ? `⇄ ${formatCurrency(Number(tx.amount))}`
                        : formatCurrency(isCredit ? Number(tx.amount) : -Number(tx.amount), {
                            sign: true,
                          })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Footer */}
      <DocumentFooter docRef="EFS-2026-07" pageNumber="1 OF 1" />
    </div>
  );
}
