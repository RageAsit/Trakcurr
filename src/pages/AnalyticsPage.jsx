import { useState, useMemo, memo, useTransition } from 'react';
import {
  FiBarChart2,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCreditCard,
  FiLayers,
  FiGlobe,
  FiClock,
  FiHome,
  FiShoppingBag,
  FiCoffee,
  FiNavigation,
  FiTv,
  FiBox,
  FiPlusCircle,
  FiMinusCircle,
  FiAward,
  FiArrowDownRight,
  FiPieChart,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
  FiGitCommit,
  FiActivity,
  FiZap,
  FiRepeat,
  FiCpu,
  FiFilter,
  FiX,
  FiRotateCcw,
  FiRefreshCw,
} from 'react-icons/fi';
import { useAnalytics, useMonthlyComparison, useYearlyComparison } from '../store/useAnalytics';
import { generateAutoInsights } from '../utils/analytics';
import { formatCurrency, formatPercent, useCurrency } from '../utils/formatters';
import {
  SectionHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Select,
  DatePicker,
  Badge,
  SecondaryButton,
  DocumentHeader,
  DocumentFooter,
} from '../components/ui';
import {
  AnalyticsLineChart,
  AnalyticsBarChart,
  AnalyticsDonutChart,
} from '../components/charts';

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

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const options = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    options.push({ value: String(y), label: `Year ${y}` });
  }
  return options;
};

const MONTH_NAMES_OPTIONS = [
  { value: 'all', label: 'All Months' },
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'Need', label: 'Need' },
  { value: 'Food Ordered', label: 'Food Ordered' },
  { value: 'Dine Out', label: 'Dine Out' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Investment', label: 'Investment' },
  { value: 'Miscellaneous', label: 'Miscellaneous' },
];

const formatYearMonthLabel = (yearMonthStr) => {
  if (!yearMonthStr || !yearMonthStr.includes('-')) return yearMonthStr;
  const [year, month] = yearMonthStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, 1);
  return dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
};

const CATEGORIES_ICONS = {
  Need: FiHome,
  'Food Ordered': FiShoppingBag,
  'Dine Out': FiCoffee,
  Travel: FiNavigation,
  Entertainment: FiTv,
  Investment: FiTrendingUp,
  Miscellaneous: FiBox,
};

const CATEGORY_COLORS = {
  Need: '#475569',
  'Food Ordered': '#d97706',
  'Dine Out': '#e11d48',
  Travel: '#0284c7',
  Entertainment: '#7c3aed',
  Investment: '#10b981',
  Miscellaneous: '#64748b',
};

const INSIGHT_ICONS = {
  FiTrendingDown,
  FiTrendingUp,
  FiDollarSign,
  FiZap,
  FiAward,
  FiGlobe,
  FiCreditCard,
};

const TAB_OPTIONS = [
  { id: 'month', label: 'Monthly Statement', icon: FiCalendar },
  { id: '6months', label: '6-Month Audit', icon: FiClock },
  { id: '12months', label: '12-Month Performance', icon: FiBarChart2 },
  { id: 'yearly', label: 'Annual Report', icon: FiLayers },
];

const DEFAULT_FILTERS = {
  startDate: '',
  endDate: '',
  type: 'all',
  mode: 'all',
  category: 'all',
  year: 'all',
  month: 'all',
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('month');
  const [isPending, startTransition] = useTransition();

  const currentMonthValue = new Date().toISOString().substring(0, 7);
  const currentYearValue = String(new Date().getFullYear());

  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  const [selectedYear, setSelectedYear] = useState(currentYearValue);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const yearOptions = useMemo(() => generateYearOptions(), []);

  const selectedMonthLabel = useMemo(() => {
    const found = monthOptions.find((m) => m.value === selectedMonth);
    if (found) return found.label;
    return selectedMonth;
  }, [selectedMonth, monthOptions]);

  const handleTabSwitch = (tabId) => {
    startTransition(() => {
      setActiveTab(tabId);
    });
  };

  const analyticsData = useAnalytics({
    timeframe: activeTab,
    selectedMonth,
    selectedYear,
    filters,
  });

  return (
    <div className="space-y-8">
      {/* Document Header */}
      <DocumentHeader
        docType="FINANCIAL AUDIT REPORT"
        docRef="FAR-2026-07"
        title="Financial Audit & BI Report"
        subtitle="Executive statement audit, trend analysis, & business intelligence"
        icon={FiBarChart2}
      />

      {/* COMPACT ANALYTICS FILTER BAR */}
      <AnalyticsFilterBar
        filters={filters}
        setFilters={setFilters}
        yearOptions={yearOptions}
      />

      {/* BINDER INDEX TAB NAVIGATION BAR */}
      <div className="bg-[#111111] p-1.5 rounded-xl border border-stone-800 shadow-md">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono">
          {TAB_OPTIONS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id)}
                className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all select-none uppercase tracking-wider ${
                  isActive
                    ? 'bg-[#faf8f5] text-stone-900 shadow-xs border-l-4 border-amber-600'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Icon className="text-sm shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TRANSITION LOADING OVERLAY */}
      {isPending ? (
        <div className="p-12 text-center space-y-2 bg-white rounded-xl border border-stone-300 animate-pulse font-mono">
          <FiRefreshCw className="text-xl text-stone-800 animate-spin mx-auto" />
          <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">Recalculating Statement Aggregations...</p>
        </div>
      ) : (
        <>
          {/* AUTO INSIGHTS PANEL */}
          <AutoInsightsPanel analyticsData={analyticsData} />

          {/* TAB CONTENT AREA 1: MONTHLY */}
          {activeTab === 'month' && (
            <div className="space-y-8 animate-page-enter">
              <Card>
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="bg-stone-100 p-2.5 rounded-lg border border-stone-300 text-stone-900 shrink-0">
                      <FiCalendar className="text-xl" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500">
                        Statement Month
                      </span>
                      <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 uppercase tracking-wider font-display">
                        {selectedMonthLabel}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      options={monthOptions}
                      className="min-w-[200px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <MonthlySummaryGrid data={analyticsData} periodLabel={selectedMonthLabel} />
              <MonthlyComparisonView selectedMonth={selectedMonth} />
              <PaymentModeGrid breakdown={analyticsData.paymentModeBreakdown} periodLabel={selectedMonthLabel} />
              <MonthlyCategoryInsights breakdown={analyticsData.categoryBreakdown} periodLabel={selectedMonthLabel} />
            </div>
          )}

          {/* TAB CONTENT AREA 2: LAST 6 MONTHS */}
          {activeTab === '6months' && (
            <div className="space-y-8 animate-page-enter">
              <Last6MonthsDashboard analyticsData={analyticsData} />
            </div>
          )}

          {/* TAB CONTENT AREA 3: LAST 12 MONTHS */}
          {activeTab === '12months' && (
            <div className="space-y-8 animate-page-enter">
              <Last12MonthsDashboard analyticsData={analyticsData} />
            </div>
          )}

          {/* TAB CONTENT AREA 4: YEARLY DASHBOARD */}
          {activeTab === 'yearly' && (
            <div className="space-y-8 animate-page-enter">
              <YearlyAnalyticsDashboard
                analyticsData={analyticsData}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                yearOptions={yearOptions}
              />
            </div>
          )}
        </>
      )}

      {/* Document Footer */}
      <DocumentFooter docRef="FAR-2026-07" pageNumber="1 OF 1" />
    </div>
  );
}

/* ==================================================================== */
/* COMPONENT: Compact Analytics Filter Bar (MEMOIZED) */
/* ==================================================================== */
const AnalyticsFilterBar = memo(function AnalyticsFilterBar({ filters, setFilters, yearOptions }) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.type && filters.type !== 'all') count++;
    if (filters.mode && filters.mode !== 'all') count++;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.year && filters.year !== 'all') count++;
    if (filters.month && filters.month !== 'all') count++;
    return count;
  }, [filters]);

  const handleChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <Card>
      <CardHeader border className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-stone-100 border border-stone-300 text-stone-900 hover:bg-stone-200 transition-all flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider"
            >
              <FiFilter className="text-base" />
              <span>Filter Engine</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-stone-900 text-stone-50 font-mono font-extrabold text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div>
              <CardTitle className="text-xs sm:text-sm font-extrabold uppercase tracking-wider font-display">Audit Filter Parameters</CardTitle>
              <CardDescription className="text-xs font-mono">
                Filter statements, charts, and summary cards dynamically
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <SecondaryButton size="sm" onClick={handleReset} leftIcon={FiRotateCcw}>
                Reset
              </SecondaryButton>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              {isOpen ? <FiX className="text-base" /> : <FiFilter className="text-base" />}
            </button>
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-4 sm:p-5 border-t border-[#eeebe3] space-y-4 bg-[#fbf9f4] animate-page-enter">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />

            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
            />

            <Select
              label="Transaction Type"
              value={filters.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={[
                { value: 'all', label: 'All Types (Credit & Debit)' },
                { value: 'credit', label: 'Income / Credits Only' },
                { value: 'debit', label: 'Expenses / Debits Only' },
              ]}
            />

            <Select
              label="Transaction Mode"
              value={filters.mode}
              onChange={(e) => handleChange('mode', e.target.value)}
              options={[
                { value: 'all', label: 'All Modes (Cash & Online)' },
                { value: 'cash', label: 'Cash Only' },
                { value: 'online', label: 'Online Digital Only' },
              ]}
            />

            <Select
              label="Category"
              value={filters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              options={CATEGORY_OPTIONS}
            />

            <Select
              label="Year Filter"
              value={filters.year}
              onChange={(e) => handleChange('year', e.target.value)}
              options={[{ value: 'all', label: 'All Years' }, ...yearOptions]}
            />

            <Select
              label="Month Filter"
              value={filters.month}
              onChange={(e) => handleChange('month', e.target.value)}
              options={MONTH_NAMES_OPTIONS}
            />

            <div className="flex items-end justify-end pt-2">
              {activeFilterCount > 0 ? (
                <div className="w-full flex items-center justify-between text-xs bg-stone-100 border border-stone-300 rounded-lg p-2 font-mono">
                  <span className="text-stone-800 font-bold">{activeFilterCount} active filters</span>
                  <button
                    onClick={handleReset}
                    className="text-stone-900 font-bold underline"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <span className="text-xs text-stone-500 font-mono italic pb-2">All statement records active</span>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
});

/* ==================================================================== */
/* COMPONENT: Financial Auto-Insights Panel (MEMOIZED) */
/* ==================================================================== */
const AutoInsightsPanel = memo(function AutoInsightsPanel({ analyticsData }) {
  const insights = useMemo(() => generateAutoInsights(analyticsData), [analyticsData]);

  if (!insights || insights.length === 0) return null;

  return (
    <Card>
      <CardHeader border>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 font-display">
              <FiCpu className="text-stone-900 text-base shrink-0" />
              Automated Statement Highlights
            </CardTitle>
            <CardDescription className="font-mono">
              Key observations and pattern metrics extracted from statement logs
            </CardDescription>
          </div>
          <Badge variant="indigo" showDot className="shrink-0 self-start sm:self-center">
            Auto Summary
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {insights.map((item) => {
            const Icon = INSIGHT_ICONS[item.iconName] || FiZap;

            return (
              <div
                key={item.id}
                className="bg-[#fbf9f4] border border-stone-300 rounded-lg p-4 flex flex-col justify-between hover:border-stone-400 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-1.5 rounded-md bg-stone-100 border border-stone-300 text-stone-900">
                      <Icon className="text-sm" />
                    </div>
                    <Badge variant={item.type || 'indigo'} size="sm">
                      {item.badge}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
                      {item.title}
                    </span>
                    <h4 className="text-sm font-mono font-extrabold text-stone-900 tracking-tight leading-snug mt-0.5">
                      {item.value}
                    </h4>
                  </div>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-stone-200">
                  <p className="text-[11px] font-mono text-stone-600 leading-normal">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

/* ==================================================================== */
/* COMPONENT: Yearly Analytics Dashboard (MEMOIZED) */
/* ==================================================================== */
const YearlyAnalyticsDashboard = memo(function YearlyAnalyticsDashboard({
  analyticsData,
  selectedYear,
  setSelectedYear,
  yearOptions,
}) {
  const { symbol: currencySymbol } = useCurrency();
  const { totalIncome, totalExpense, savingsTotals, monthlySeries = [], categoryBreakdown } = analyticsData;

  const netSavings = savingsTotals?.netSavings || 0;
  const avgMonthlyIncome = totalIncome / 12;
  const avgMonthlyExpense = totalExpense / 12;

  const chartData = useMemo(() => {
    return monthlySeries.map((m) => ({
      month: m.monthLabel,
      Income: m.summary?.totalIncome || 0,
      Expense: m.summary?.totalExpense || 0,
      NetSavings: m.summary?.savingsTotals?.netSavings || 0,
    }));
  }, [monthlySeries]);

  const categoryPieData = useMemo(() => {
    return (categoryBreakdown?.categories || [])
      .filter((c) => c.spent > 0)
      .map((c) => ({
        name: c.name,
        value: c.spent,
        fill: CATEGORY_COLORS[c.name] || '#64748b',
      }));
  }, [categoryBreakdown]);

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-stone-100 p-2.5 rounded-lg border border-stone-300 text-stone-900 shrink-0">
              <FiLayers className="text-xl" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500">
                Annual Statement
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 uppercase tracking-wider font-display">
                Annual Financial Statement — Year {selectedYear}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              options={yearOptions}
              className="min-w-[160px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500">
                Total Income
              </span>
              <div className="p-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800">
                <FiTrendingUp className="text-sm" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-xl font-mono font-extrabold text-stone-900 tracking-tight">
                {formatCurrency(totalIncome)}
              </div>
              <Badge variant="emerald" size="sm">
                Year {selectedYear}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500">
                Total Expense
              </span>
              <div className="p-1.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800">
                <FiTrendingDown className="text-sm" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-xl font-mono font-extrabold text-stone-900 tracking-tight">
                {formatCurrency(totalExpense)}
              </div>
              <Badge variant="rose" size="sm">
                Year {selectedYear}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500">
                Net Savings
              </span>
              <div className="p-1.5 rounded-md bg-stone-100 border border-stone-300 text-stone-800">
                <FiZap className="text-sm" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-xl font-mono font-extrabold text-stone-900 tracking-tight">
                {formatCurrency(netSavings)}
              </div>
              <Badge variant="violet" size="sm">
                Year {selectedYear}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500">
                Avg Monthly Income
              </span>
              <div className="p-1.5 rounded-md bg-stone-100 border border-stone-300 text-stone-900 font-mono font-extrabold text-sm flex items-center justify-center w-7 h-7">
                {currencySymbol}
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-xl font-mono font-extrabold text-stone-900 tracking-tight">
                {formatCurrency(avgMonthlyIncome)}
              </div>
              <span className="text-[10px] font-mono text-stone-500">Per month in {selectedYear}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500">
                Avg Monthly Expense
              </span>
              <div className="p-1.5 rounded-md bg-stone-100 border border-stone-300 text-stone-800">
                <FiGlobe className="text-sm" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-xl font-mono font-extrabold text-stone-900 tracking-tight">
                {formatCurrency(avgMonthlyExpense)}
              </div>
              <span className="text-[10px] font-mono text-stone-500">Per month in {selectedYear}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <YearlyComparisonView targetYear={selectedYear} yearOptions={yearOptions} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsBarChart
            data={chartData}
            xKey="month"
            title={`Month-by-Month Income vs Expense (${selectedYear})`}
            description="Monthly totals breakdown across all 12 months"
            badge="Bar Chart"
            height={300}
            series={[
              { key: 'Income', name: 'Income', color: '#16a34a' },
              { key: 'Expense', name: 'Expense', color: '#b91c1c' },
            ]}
          />
        </div>

        <div className="lg:col-span-1">
          <AnalyticsDonutChart
            data={categoryPieData}
            title={`Category Spend (${selectedYear})`}
            description="Yearly distribution"
            badge="Donut"
            height={280}
            nameKey="name"
            valueKey="value"
            colorKey="fill"
          />
        </div>
      </div>

      <BreakdownSection data={analyticsData} periodLabel={`Year ${selectedYear}`} />
      <MonthlySeriesTable series={monthlySeries} title={`Month-by-Month Totals for Year ${selectedYear}`} />
    </div>
  );
});

/* ==================================================================== */
/* COMPONENT: Year-to-Year Comparison View (MEMOIZED) */
/* ==================================================================== */
const YearlyComparisonView = memo(function YearlyComparisonView({ targetYear, yearOptions }) {
  const defaultBaseYear = String(Number(targetYear) - 1);
  const [baselineYear, setBaselineYear] = useState(defaultBaseYear);

  const comparisonData = useYearlyComparison(targetYear, baselineYear);
  const { incomeChange, expenseChange, savingsChange, categoryDifferences, monthWiseDifferences } = comparisonData;

  return (
    <Card>
      <CardHeader border>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 font-display">
              <FiRepeat className="text-stone-900 text-base" />
              Year-to-Year Statement Audit
            </CardTitle>
            <CardDescription className="font-mono">
              Comparing <span className="text-stone-50 font-bold">Year {targetYear}</span> vs{' '}
              <span className="text-stone-50 font-bold">Year {baselineYear}</span>
            </CardDescription>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-stone-300">Baseline Year:</span>
            <Select
              value={baselineYear}
              onChange={(e) => setBaselineYear(e.target.value)}
              options={yearOptions.filter((y) => y.value !== targetYear)}
              className="min-w-[140px]"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          <ComparisonMetricCard
            label="Annual Income Diff"
            currentVal={incomeChange.current}
            baselineVal={incomeChange.baseline}
            diff={incomeChange.diff}
            percent={incomeChange.percent}
            direction={incomeChange.direction}
            isPositiveGood={true}
            baselineLabel={`Year ${baselineYear}`}
          />

          <ComparisonMetricCard
            label="Annual Expense Diff"
            currentVal={expenseChange.current}
            baselineVal={expenseChange.baseline}
            diff={expenseChange.diff}
            percent={expenseChange.percent}
            direction={expenseChange.direction}
            isPositiveGood={false}
            baselineLabel={`Year ${baselineYear}`}
          />

          <ComparisonMetricCard
            label="Annual Savings Diff"
            currentVal={savingsChange.current}
            baselineVal={savingsChange.baseline}
            diff={savingsChange.diff}
            percent={savingsChange.percent}
            direction={savingsChange.direction}
            isPositiveGood={true}
            baselineLabel={`Year ${baselineYear}`}
          />
        </div>

        <div className="space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
              <FiCalendar className="text-stone-900" />
              Month-Wise Differences (Year {targetYear} vs {baselineYear})
            </h4>
            <Badge variant="indigo" size="sm">
              12 Months
            </Badge>
          </div>

          <div className="overflow-x-auto border border-[#d8d4c8] rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-stone-900 bg-stone-900 text-stone-100 text-[11px] font-bold uppercase tracking-wider select-none">
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4 text-right">Income Diff</th>
                  <th className="py-3 px-4 text-right">Expense Diff</th>
                  <th className="py-3 px-4 text-right">Savings Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeebe3]">
                {monthWiseDifferences.map((m) => {
                  return (
                    <tr key={m.monthName} className="transition-colors hover:bg-[#fcfbf9]">
                      <td className="py-3 px-4 font-bold text-stone-900 whitespace-nowrap">{m.monthName}</td>
                      <td
                        className={`py-3 px-4 text-right font-extrabold whitespace-nowrap ${
                          m.incomeDiff > 0 ? 'text-emerald-800' : m.incomeDiff < 0 ? 'text-rose-800' : 'text-stone-500'
                        }`}
                      >
                        {formatCurrency(m.incomeDiff, { sign: true })}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-extrabold whitespace-nowrap ${
                          m.expenseDiff > 0 ? 'text-rose-800' : m.expenseDiff < 0 ? 'text-emerald-800' : 'text-stone-500'
                        }`}
                      >
                        {formatCurrency(m.expenseDiff, { sign: true })}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-extrabold whitespace-nowrap ${
                          m.savingsDiff > 0 ? 'text-stone-900' : m.savingsDiff < 0 ? 'text-amber-800' : 'text-stone-500'
                        }`}
                      >
                        {formatCurrency(m.savingsDiff, { sign: true })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 font-mono">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
            <FiPieChart className="text-stone-900" />
            Category Spending Differences
          </h4>

          {categoryDifferences.length === 0 ? (
            <p className="text-xs text-stone-500 italic">No category data recorded for comparison.</p>
          ) : (
            <div className="overflow-x-auto border border-[#d8d4c8] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-stone-900 bg-stone-900 text-stone-100 text-[11px] font-bold uppercase tracking-wider select-none">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Year {baselineYear}</th>
                    <th className="py-3 px-4 text-right">Year {targetYear}</th>
                    <th className="py-3 px-4 text-right">Difference</th>
                    <th className="py-3 px-4 text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeebe3]">
                  {categoryDifferences.map((cat) => {
                    const Icon = CATEGORIES_ICONS[cat.category] || FiBox;
                    const isIncreased = cat.diff > 0;
                    const isDecreased = cat.diff < 0;

                    return (
                      <tr key={cat.category} className="transition-colors hover:bg-[#fcfbf9]">
                        <td className="py-3 px-4 font-semibold text-stone-800 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Icon className="text-stone-700 text-xs" />
                            <span className="font-sans font-bold">{cat.category}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-stone-600 font-medium whitespace-nowrap">
                          {formatCurrency(cat.baseline)}
                        </td>
                        <td className="py-3 px-4 text-right text-stone-900 font-bold whitespace-nowrap">
                          {formatCurrency(cat.current)}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-extrabold whitespace-nowrap ${
                            isIncreased ? 'text-amber-800' : isDecreased ? 'text-emerald-800' : 'text-stone-500'
                          }`}
                        >
                          {formatCurrency(cat.diff, { sign: true })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end">
                            <DirectionBadge direction={cat.direction} percent={cat.percent} isPositiveGood={false} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

/* ==================================================================== */
/* COMPONENT: Last 12 Months Dashboard (MEMOIZED) */
/* ==================================================================== */
const Last12MonthsDashboard = memo(function Last12MonthsDashboard({ analyticsData }) {
  const { symbol: currencySymbol } = useCurrency();
  const { totalIncome, totalExpense, netBalance, savingsTotals, monthlySeries = [] } = analyticsData;
  const numMonths = monthlySeries.length || 12;

  const totalAdded = savingsTotals?.totalAdded || 0;
  const totalWithdrawn = savingsTotals?.totalWithdrawn || 0;
  const netSavings = savingsTotals?.netSavings || 0;

  const chartData = useMemo(() => {
    return monthlySeries.map((item) => ({
      month: item.monthLabel,
      Income: item.summary?.totalIncome || 0,
      Expense: item.summary?.totalExpense || 0,
      NetBalance: item.summary?.netBalance || 0,
      Savings: item.summary?.savingsTotals?.netSavings || 0,
    }));
  }, [monthlySeries]);

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-stone-100 p-2.5 rounded-lg border border-stone-300 text-stone-900 shrink-0">
              <FiBarChart2 className="text-xl" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500">
                12-Month Performance
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 uppercase tracking-wider font-display">
                Last 12 Months Audit Sheet
              </h2>
            </div>
          </div>
          <Badge variant="indigo">12-Month Trends</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 font-mono">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Total 12m Income
              </span>
              <div className="p-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800">
                <FiTrendingUp className="text-base" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {formatCurrency(totalIncome)}
              </div>
              <Badge variant="emerald" size="sm">
                Avg {formatCurrency(totalIncome / numMonths)}/mo
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Total 12m Expenses
              </span>
              <div className="p-2 rounded-md bg-rose-50 border border-rose-200 text-rose-800">
                <FiTrendingDown className="text-base" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {formatCurrency(totalExpense)}
              </div>
              <Badge variant="rose" size="sm">
                Avg {formatCurrency(totalExpense / numMonths)}/mo
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Savings Movement
              </span>
              <div className="p-2 rounded-md bg-stone-100 border border-stone-300 text-stone-800">
                <FiCreditCard className="text-base" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {formatCurrency(netSavings)}
              </div>
              <div className="text-[11px] text-stone-500 font-medium">
                Added: <span className="text-emerald-800 font-bold">{formatCurrency(totalAdded, { sign: true })}</span> | Withdrawn:{' '}
                <span className="text-rose-800 font-bold">{formatCurrency(totalWithdrawn)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                12m Net Balance
              </span>
              <div className="p-2 rounded-md bg-stone-100 border border-stone-300 text-stone-900 font-mono font-extrabold text-sm flex items-center justify-center w-8 h-8">
                {currencySymbol}
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div
                className={`text-2xl font-extrabold tracking-tight ${
                  netBalance >= 0 ? 'text-stone-900' : 'text-rose-800'
                }`}
              >
                {formatCurrency(netBalance)}
              </div>
              <Badge variant={netBalance >= 0 ? 'indigo' : 'rose'} size="sm">
                {netBalance >= 0 ? 'Annual Surplus' : 'Annual Deficit'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <AnalyticsLineChart
        data={chartData}
        xKey="month"
        title="12-Month Financial Performance Trends"
        description="Monthly Income, Expense, and Net Savings trajectories over the last 12 months"
        badge="Line Graph"
        height={300}
        series={[
          { key: 'Income', name: 'Monthly Income', color: '#16a34a', strokeWidth: 2.5 },
          { key: 'Expense', name: 'Monthly Expense', color: '#dc2626', strokeWidth: 2.5 },
          { key: 'Savings', name: 'Monthly Savings', color: '#2563eb', strokeWidth: 2.5 },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsLineChart
          data={chartData}
          xKey="month"
          title="Monthly Income Trend"
          badge="12 Months"
          height={200}
          series={[{ key: 'Income', name: 'Income', color: '#16a34a' }]}
        />
        <AnalyticsLineChart
          data={chartData}
          xKey="month"
          title="Monthly Expense Trend"
          badge="12 Months"
          height={200}
          series={[{ key: 'Expense', name: 'Expense', color: '#dc2626' }]}
        />
        <AnalyticsLineChart
          data={chartData}
          xKey="month"
          title="Monthly Savings Trend"
          badge="12 Months"
          height={200}
          series={[{ key: 'Savings', name: 'Savings', color: '#2563eb' }]}
        />
      </div>

      <MonthlySeriesTable series={analyticsData.monthlySeries} title="12-Month Breakdown by Month" />
      <BreakdownSection data={analyticsData} periodLabel="Last 12 Months" />
    </div>
  );
});

/* ==================================================================== */
/* COMPONENT: Last 6 Months Dashboard (MEMOIZED) */
/* ==================================================================== */
const Last6MonthsDashboard = memo(function Last6MonthsDashboard({ analyticsData }) {
  const { symbol: currencySymbol } = useCurrency();
  const { totalIncome, totalExpense, savingsTotals, monthlySeries = [], categoryBreakdown } = analyticsData;
  const numMonths = monthlySeries.length || 6;

  const avgMonthlyIncome = totalIncome / numMonths;
  const avgMonthlyExpense = totalExpense / numMonths;
  const avgMonthlySavings = (savingsTotals?.netSavings || 0) / numMonths;

  const chartData = useMemo(() => {
    return monthlySeries.map((item) => ({
      month: item.monthLabel,
      Income: item.summary?.totalIncome || 0,
      Expense: item.summary?.totalExpense || 0,
      NetBalance: item.summary?.netBalance || 0,
      NetSavings: item.summary?.savingsTotals?.netSavings || 0,
    }));
  }, [monthlySeries]);

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-stone-100 p-2.5 rounded-lg border border-stone-300 text-stone-900 shrink-0">
              <FiClock className="text-xl" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500">
                6-Month Audit
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 uppercase tracking-wider font-display">
                Last 6 Months Audit Sheet
              </h2>
            </div>
          </div>
          <Badge variant="indigo">6-Month Averages</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Avg Monthly Income
              </span>
              <div className="p-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800">
                <FiTrendingUp className="text-sm" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {formatCurrency(avgMonthlyIncome)}
              </div>
              <div className="text-[11px] text-stone-500">
                Total 6m Income:{' '}
                <span className="font-bold text-emerald-800">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Avg Monthly Expense
              </span>
              <div className="p-1.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800">
                <FiTrendingDown className="text-sm" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {formatCurrency(avgMonthlyExpense)}
              </div>
              <div className="text-[11px] text-stone-500">
                Total 6m Expense:{' '}
                <span className="font-bold text-rose-800">
                  {formatCurrency(totalExpense)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Avg Monthly Savings
              </span>
              <div className="p-1.5 rounded-md bg-stone-100 border border-stone-300 text-stone-800">
                <FiZap className="text-sm" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {formatCurrency(avgMonthlySavings)}
              </div>
              <div className="text-[11px] text-stone-500">
                Total 6m Savings:{' '}
                <span className="font-bold text-stone-900">
                  {formatCurrency(savingsTotals?.netSavings)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsBarChart
          data={chartData}
          xKey="month"
          title="Income vs Expense (6 Months)"
          description="Monthly credits vs debits comparison"
          badge="Bar Chart"
          height={280}
          series={[
            { key: 'Income', name: 'Income', color: '#16a34a' },
            { key: 'Expense', name: 'Expense', color: '#b91c1c' },
          ]}
        />

        <AnalyticsLineChart
          data={chartData}
          xKey="month"
          title="Monthly Spending Trend"
          description="Expense trajectory over the last 6 months"
          badge="Line Trend"
          height={280}
          series={[{ key: 'Expense', name: 'Expense', color: '#b91c1c', strokeWidth: 2.5 }]}
        />
      </div>

      <SixMonthsCategoryAnalytics breakdown={categoryBreakdown} numMonths={numMonths} />
      <MonthlySeriesTable series={analyticsData.monthlySeries} title="6-Month Breakdown by Month" />
      <BreakdownSection data={analyticsData} periodLabel="Last 6 Months" />
    </div>
  );
});

/* ==================================================================== */
/* COMPONENT: 6-Month Category Analytics Section (MEMOIZED) */
/* ==================================================================== */
const SixMonthsCategoryAnalytics = memo(function SixMonthsCategoryAnalytics({ breakdown, numMonths = 6 }) {
  const categoriesList = breakdown?.categories || [];
  const total6mExpense = breakdown?.totalExpense || 0;

  const spentCategories = useMemo(() => {
    return categoriesList.filter((c) => c.spent > 0);
  }, [categoriesList]);

  const topCategory = spentCategories.length > 0 ? spentCategories[0] : null;

  const pieChartData = useMemo(() => {
    return spentCategories.map((c) => ({
      name: c.name,
      value: c.spent,
      fill: CATEGORY_COLORS[c.name] || '#64748b',
    }));
  }, [spentCategories]);

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-700 flex items-center gap-2">
        <FiPieChart className="text-stone-900" />
        6-Month Category Spend & Ranking Audit
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-amber-300 bg-amber-50/40">
          <CardContent className="p-5 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-amber-100 border border-amber-300 text-amber-900">
                  <FiAward className="text-base" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">
                  #1 Category
                </span>
              </div>
              <Badge variant="amber">Top Spend</Badge>
            </div>

            {topCategory ? (
              <div className="space-y-3 pt-1">
                <div>
                  <span className="text-[11px] text-amber-900 font-bold">Ranked #1 (6 Months)</span>
                  <h4 className="text-xl font-extrabold text-stone-900 uppercase tracking-wider font-display">{topCategory.name}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500">6m Total</span>
                    <p className="text-base font-extrabold text-stone-900">
                      {formatCurrency(topCategory.spent)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500">Avg / Month</span>
                    <p className="text-base font-bold text-stone-800">
                      {formatCurrency(topCategory.spent / numMonths)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs text-stone-700 font-bold">
                    <span>Share of 6m Budget:</span>
                    <span className="text-stone-900">{formatPercent(topCategory.percent)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-stone-900"
                      style={{ width: `${Math.min(topCategory.percent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500">No expense records found.</p>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <AnalyticsDonutChart
            data={pieChartData}
            title="Category Share Distribution"
            description="Proportional spend per category over the last 6 months"
            badge="Donut Chart"
            height={260}
            nameKey="name"
            valueKey="value"
            colorKey="fill"
          />
        </div>
      </div>

      <Card className="border-[#d8d4c8]">
        <CardHeader border>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="font-display">Category Ranking & Monthly Averages (6 Months)</CardTitle>
              <CardDescription className="font-mono">
                Ranked from highest spend to lowest with total 6-month spend and monthly averages
              </CardDescription>
            </div>
            <Badge variant="indigo">
              {formatCurrency(total6mExpense)} Total Spent (6m)
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {categoriesList.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500 font-mono">No categories found.</div>
          ) : (
            <div className="divide-y divide-[#eeebe3]">
              {categoriesList.map((cat, index) => {
                const Icon = CATEGORIES_ICONS[cat.name] || FiBox;
                const rank = index + 1;
                const isTop = rank === 1 && cat.spent > 0;
                const avgMonthly = cat.spent / numMonths;

                return (
                  <div key={cat.name} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono transition-colors hover:bg-[#fcfbf9]">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                          isTop
                            ? 'bg-amber-100 text-amber-950 border border-amber-300'
                            : 'bg-stone-100 text-stone-700 border border-stone-300'
                        }`}
                      >
                        #{rank}
                      </span>

                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-md border shrink-0 bg-stone-100 border-stone-300 text-stone-800">
                          <Icon className="text-xs" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900 truncate font-sans">{cat.name}</span>
                            {isTop && (
                              <Badge variant="amber" size="sm">
                                Top Category
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-500">
                            Avg/mo: <span className="font-bold text-stone-800">{formatCurrency(avgMonthly)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-stone-900">
                          {formatCurrency(cat.spent)}
                        </div>
                        <div className="text-[10px] font-bold text-stone-500">
                          {formatPercent(cat.percent)} of 6m budget
                        </div>
                      </div>

                      <div className="w-24 hidden sm:block">
                        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                          <div
                            className="h-full rounded-full bg-stone-900"
                            style={{ width: `${Math.min(cat.percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

/* ==================================================================== */
/* COMPONENT: Monthly Comparison View (MEMOIZED) */
/* ==================================================================== */
const MonthlyComparisonView = memo(function MonthlyComparisonView({ selectedMonth }) {
  const [comparisonMode, setComparisonMode] = useState('prevMonth');

  const comparisonData = useMonthlyComparison(selectedMonth, comparisonMode);
  const { currentMonthKey, baselineMonthKey, incomeChange, expenseChange, savingsChange, categoryDifferences } =
    comparisonData;

  const currentLabel = formatYearMonthLabel(currentMonthKey);
  const baselineLabel = formatYearMonthLabel(baselineMonthKey);

  return (
    <Card>
      <CardHeader border>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 font-display">
              <FiGitCommit className="text-stone-900 text-base" />
              Monthly Statement Comparison
            </CardTitle>
            <CardDescription className="font-mono">
              Comparing <span className="text-stone-50 font-bold">{currentLabel}</span> vs{' '}
              <span className="text-stone-50 font-bold">{baselineLabel}</span>
            </CardDescription>
          </div>

          <div className="bg-stone-100 p-1 rounded-lg border border-stone-300 flex items-center gap-1 shrink-0 font-mono">
            <button
              onClick={() => setComparisonMode('prevMonth')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all select-none uppercase ${
                comparisonMode === 'prevMonth'
                  ? 'bg-stone-900 text-stone-50 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Previous Month
            </button>
            <button
              onClick={() => setComparisonMode('sameMonthLastYear')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all select-none uppercase ${
                comparisonMode === 'sameMonthLastYear'
                  ? 'bg-stone-900 text-stone-50 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Same Month Last Year
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          <ComparisonMetricCard
            label="Income Change"
            currentVal={incomeChange.current}
            baselineVal={incomeChange.baseline}
            diff={incomeChange.diff}
            percent={incomeChange.percent}
            direction={incomeChange.direction}
            isPositiveGood={true}
            baselineLabel={baselineLabel}
          />

          <ComparisonMetricCard
            label="Expense Change"
            currentVal={expenseChange.current}
            baselineVal={expenseChange.baseline}
            diff={expenseChange.diff}
            percent={expenseChange.percent}
            direction={expenseChange.direction}
            isPositiveGood={false}
            baselineLabel={baselineLabel}
          />

          <ComparisonMetricCard
            label="Net Savings Change"
            currentVal={savingsChange.current}
            baselineVal={savingsChange.baseline}
            diff={savingsChange.diff}
            percent={savingsChange.percent}
            direction={savingsChange.direction}
            isPositiveGood={true}
            baselineLabel={baselineLabel}
          />
        </div>

        <div className="space-y-3 font-mono">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Category Spending Differences
          </h4>

          {categoryDifferences.length === 0 ? (
            <p className="text-xs text-stone-500 italic">No category data recorded for comparison.</p>
          ) : (
            <div className="overflow-x-auto border border-[#d8d4c8] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-stone-900 bg-stone-900 text-stone-100 text-[11px] font-bold uppercase tracking-wider select-none">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">{baselineLabel}</th>
                    <th className="py-3 px-4 text-right">{currentLabel}</th>
                    <th className="py-3 px-4 text-right">Difference</th>
                    <th className="py-3 px-4 text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeebe3]">
                  {categoryDifferences.map((cat) => {
                    const Icon = CATEGORIES_ICONS[cat.category] || FiBox;
                    const isIncreased = cat.diff > 0;
                    const isDecreased = cat.diff < 0;

                    return (
                      <tr key={cat.category} className="transition-colors hover:bg-[#fcfbf9]">
                        <td className="py-3 px-4 font-semibold text-stone-800 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Icon className="text-stone-700 text-xs" />
                            <span className="font-sans font-bold">{cat.category}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-stone-600 font-medium whitespace-nowrap">
                          {formatCurrency(cat.baseline)}
                        </td>
                        <td className="py-3 px-4 text-right text-stone-900 font-bold whitespace-nowrap">
                          {formatCurrency(cat.current)}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-extrabold whitespace-nowrap ${
                            isIncreased ? 'text-amber-800' : isDecreased ? 'text-emerald-800' : 'text-stone-500'
                          }`}
                        >
                          {formatCurrency(cat.diff, { sign: true })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end">
                            <DirectionBadge direction={cat.direction} percent={cat.percent} isPositiveGood={false} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

/* Helper Metric Card for Comparison */
const ComparisonMetricCard = memo(function ComparisonMetricCard({
  label,
  currentVal,
  baselineVal,
  diff,
  percent,
  direction,
  isPositiveGood = true,
  baselineLabel,
}) {
  return (
    <div className="bg-[#fbf9f4] border border-stone-300 rounded-lg p-4 space-y-2 font-mono">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600">{label}</span>
        <DirectionBadge direction={direction} percent={percent} isPositiveGood={isPositiveGood} />
      </div>

      <div className="flex items-baseline justify-between gap-2 pt-1">
        <span className="text-lg font-extrabold text-stone-900">
          {formatCurrency(currentVal)}
        </span>
        <span
          className={`text-xs font-extrabold ${
            diff > 0
              ? isPositiveGood
                ? 'text-emerald-800'
                : 'text-rose-800'
              : diff < 0
              ? isPositiveGood
                ? 'text-rose-800'
                : 'text-emerald-800'
              : 'text-stone-500'
          }`}
        >
          {formatCurrency(diff, { sign: true })}
        </span>
      </div>

      <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200 flex items-center justify-between">
        <span>Baseline ({baselineLabel}):</span>
        <span className="font-bold text-stone-800">{formatCurrency(baselineVal)}</span>
      </div>
    </div>
  );
});

/* Minimal Percentage & Arrow Badge Component */
const DirectionBadge = memo(function DirectionBadge({ direction, percent, isPositiveGood = true }) {
  if (direction === 'neutral' || percent === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-stone-100 text-stone-600 border border-stone-300">
        <FiMinus className="text-xs" />
        -
      </span>
    );
  }

  const isUp = direction === 'up';
  const isGood = isUp ? isPositiveGood : !isPositiveGood;

  const bgClass = isGood
    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
    : 'bg-rose-50 text-rose-800 border-rose-300';

  const Icon = isUp ? FiArrowUp : FiArrowDown;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${bgClass}`}>
      <Icon className="text-xs shrink-0" />
      <span>
        {formatPercent(percent, { sign: true })}
      </span>
    </span>
  );
});

/* ==================================================================== */
/* COMPONENT: Monthly Upgraded Summary Grid (MEMOIZED) */
/* ==================================================================== */
const MonthlySummaryGrid = memo(function MonthlySummaryGrid({ data, periodLabel }) {
  const { symbol: currencySymbol } = useCurrency();
  const { totalIncome, totalExpense, netBalance, savingsTotals } = data;
  const totalAdded = savingsTotals?.totalAdded || 0;
  const totalWithdrawn = savingsTotals?.totalWithdrawn || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 font-mono">
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
              Total Income
            </span>
            <div className="p-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800">
              <FiTrendingUp className="text-sm" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-2xl font-extrabold text-stone-900 tracking-tight leading-none">
              {formatCurrency(totalIncome)}
            </div>
            <Badge variant="emerald" size="sm">
              Credits
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
              Total Expense
            </span>
            <div className="p-1.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800">
              <FiTrendingDown className="text-sm" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-2xl font-extrabold text-stone-900 tracking-tight leading-none">
              {formatCurrency(totalExpense)}
            </div>
            <Badge variant="rose" size="sm">
              Debits
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
              Net Balance
            </span>
            <div className="p-1.5 rounded-md bg-stone-100 border border-stone-300 text-stone-900 font-mono font-extrabold text-sm flex items-center justify-center w-7 h-7">
              {currencySymbol}
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div
              className={`text-2xl font-extrabold tracking-tight leading-none ${
                (data.closingBalance !== undefined ? data.closingBalance : netBalance) >= 0 ? 'text-stone-900' : 'text-rose-800'
              }`}
            >
              {formatCurrency(data.closingBalance !== undefined ? data.closingBalance : netBalance)}
            </div>
            <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-stone-500 font-mono">
              <span>Op: <strong className="text-stone-800">{formatCurrency(data.openingBalance || 0)}</strong></span>
              <span>•</span>
              <span>Net: <strong className={netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{formatCurrency(netBalance, { sign: true })}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
              Savings Added
            </span>
            <div className="p-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800">
              <FiPlusCircle className="text-sm" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-2xl font-extrabold text-emerald-800 tracking-tight leading-none">
              {formatCurrency(totalAdded, { sign: true })}
            </div>
            <Badge variant="emerald" size="sm">
              Deposits
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
              Withdrawn
            </span>
            <div className="p-1.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800">
              <FiMinusCircle className="text-sm" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-2xl font-extrabold text-rose-800 tracking-tight leading-none">
              {formatCurrency(totalWithdrawn)}
            </div>
            <Badge variant="rose" size="sm">
              Withdrawals
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

/* ==================================================================== */
/* COMPONENT: Payment Mode Grid (MEMOIZED) */
/* ==================================================================== */
const PaymentModeGrid = memo(function PaymentModeGrid({ breakdown, periodLabel }) {
  const { symbol: currencySymbol } = useCurrency();
  const cashExpense = breakdown?.cashExpense || 0;
  const onlineExpense = breakdown?.onlineExpense || 0;
  const cashPercent = breakdown?.cashPercent || 0;
  const onlinePercent = breakdown?.onlinePercent || 0;

  return (
    <div className="space-y-3 font-mono">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
        <FiLayers className="text-stone-900" />
        Payment Mode Breakdown ({periodLabel})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Cash Expense
              </div>
              <div className="text-xl font-extrabold text-stone-900">
                {formatCurrency(cashExpense)}
              </div>
              <div className="text-xs text-amber-800 font-bold">
                {formatPercent(cashPercent)} of total expenses
              </div>
            </div>
            <div className="p-2.5 rounded-md bg-amber-50 border border-amber-300 text-amber-900 font-mono font-extrabold text-base flex items-center justify-center min-w-[36px] h-9 shrink-0">
              {currencySymbol}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Online Digital Expense
              </div>
              <div className="text-xl font-extrabold text-stone-900">
                {formatCurrency(onlineExpense)}
              </div>
              <div className="text-xs text-sky-800 font-bold">
                {formatPercent(onlinePercent)} of total expenses
              </div>
            </div>
            <div className="p-3 rounded-md bg-sky-50 border border-sky-200 text-sky-800 shrink-0">
              <FiGlobe className="text-xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

/* ==================================================================== */
/* COMPONENT: Category Insights (MEMOIZED) */
/* ==================================================================== */
const MonthlyCategoryInsights = memo(function MonthlyCategoryInsights({ breakdown, periodLabel }) {
  const categoriesList = breakdown?.categories || [];
  const totalExpense = breakdown?.totalExpense || 0;

  const spentCategories = useMemo(() => {
    return categoriesList.filter((c) => c.spent > 0);
  }, [categoriesList]);

  const topCategory = spentCategories.length > 0 ? spentCategories[0] : null;
  const lowestCategory = spentCategories.length > 0 ? spentCategories[spentCategories.length - 1] : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border-amber-300 bg-amber-50/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-amber-100 border border-amber-300 text-amber-900">
                  <FiAward className="text-base" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500">
                  Top Spending Category
                </span>
              </div>
              <Badge variant="amber">Highest</Badge>
            </div>

            {topCategory ? (
              <div className="mt-3 space-y-2 font-mono">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-lg font-extrabold text-stone-900 font-display uppercase tracking-wider">{topCategory.name}</h4>
                  <span className="text-xl font-extrabold text-stone-900">
                    {formatCurrency(topCategory.spent)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-700">
                  <span>Share of Total Budget</span>
                  <span className="font-bold">{formatPercent(topCategory.percent)}</span>
                </div>
                <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full bg-stone-900"
                    style={{ width: `${Math.min(topCategory.percent, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500 font-mono mt-3">No spending logged for {periodLabel}.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-stone-300 bg-stone-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-stone-100 border border-stone-300 text-stone-800">
                  <FiArrowDownRight className="text-base" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500">
                  Lowest Spending Category
                </span>
              </div>
              <Badge variant="slate" outline>
                Lowest
              </Badge>
            </div>

            {lowestCategory ? (
              <div className="mt-3 space-y-2 font-mono">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-lg font-extrabold text-stone-900 font-display uppercase tracking-wider">{lowestCategory.name}</h4>
                  <span className="text-xl font-extrabold text-stone-900">
                    {formatCurrency(lowestCategory.spent)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-700">
                  <span>Share of Total Budget</span>
                  <span className="font-bold">{formatPercent(lowestCategory.percent)}</span>
                </div>
                <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full bg-stone-700"
                    style={{ width: `${Math.min(lowestCategory.percent, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500 font-mono mt-3">No spending logged for {periodLabel}.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader border>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 font-display">
                <FiPieChart className="text-stone-900" />
                Category Spend Breakdown
              </CardTitle>
              <CardDescription className="font-mono">
                Detailed spend distribution across all categories for {periodLabel}
              </CardDescription>
            </div>
            <Badge variant="indigo">
              {formatCurrency(totalExpense)} Total Spent
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {categoriesList.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs font-mono font-bold text-stone-500">No expense records found for {periodLabel}.</p>
            </div>
          ) : (
            categoriesList.map((cat) => {
              const Icon = CATEGORIES_ICONS[cat.name] || FiBox;
              const isTop = topCategory && topCategory.name === cat.name;

              return (
                <div key={cat.name} className="space-y-2 font-mono">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-md border shrink-0 bg-stone-100 border-stone-300 text-stone-800">
                        <Icon className="text-xs" />
                      </div>
                      <span className="text-xs font-bold text-stone-800 truncate font-sans">{cat.name}</span>
                      {isTop && (
                        <Badge variant="amber" size="sm">
                          Top Category
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-extrabold text-stone-900">
                        {formatCurrency(cat.spent)}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-stone-100 border-stone-300 text-stone-800">
                        {formatPercent(cat.percent)}
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="h-full rounded-full bg-stone-900 transition-all duration-500"
                      style={{ width: `${Math.min(cat.percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
});

/* ==================================================================== */
/* COMPONENT: Payment Mode & Category Breakdown (MEMOIZED) */
/* ==================================================================== */
const BreakdownSection = memo(function BreakdownSection({ data, periodLabel }) {
  const { symbol: currencySymbol } = useCurrency();
  const { paymentModeBreakdown, categoryBreakdown } = data;
  const categoriesList = categoryBreakdown?.categories || [];

  return (
    <div className="space-y-6">
      <div className="space-y-3 font-mono">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
          <FiLayers className="text-stone-900" />
          Payment Mode Breakdown ({periodLabel})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  Cash Expense
                </div>
                <div className="text-xl font-extrabold text-stone-900">
                  {formatCurrency(paymentModeBreakdown?.cashExpense)}
                </div>
                <div className="text-xs text-amber-800 font-bold">
                  {formatPercent(paymentModeBreakdown?.cashPercent)} of total expenses
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-amber-50 border border-amber-300 text-amber-900 font-mono font-extrabold text-base flex items-center justify-center min-w-[36px] h-9 shrink-0">
                {currencySymbol}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  Online Expense
                </div>
                <div className="text-xl font-extrabold text-stone-900">
                  {formatCurrency(paymentModeBreakdown?.onlineExpense)}
                </div>
                <div className="text-xs text-sky-800 font-bold">
                  {formatPercent(paymentModeBreakdown?.onlinePercent)} of total expenses
                </div>
              </div>
              <div className="p-3 rounded-md bg-sky-50 border border-sky-200 text-sky-800 shrink-0">
                <FiGlobe className="text-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader border>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="font-display uppercase tracking-wider font-extrabold">Category Breakdown</CardTitle>
              <CardDescription className="font-mono">
                Expenses grouped by category for {periodLabel}
              </CardDescription>
            </div>
            <Badge variant="indigo">
              {formatCurrency(categoryBreakdown?.totalExpense)} Total Spent
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {categoriesList.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs font-mono font-bold text-stone-500">No expense records found for {periodLabel}.</p>
            </div>
          ) : (
            categoriesList.map((cat) => {
              const Icon = CATEGORIES_ICONS[cat.name] || FiBox;
              return (
                <div key={cat.name} className="space-y-2 font-mono">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-md border shrink-0 bg-stone-100 border-stone-300 text-stone-800">
                        <Icon className="text-xs" />
                      </div>
                      <span className="text-xs font-bold text-stone-800 truncate font-sans">{cat.name}</span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-extrabold text-stone-900">
                        {formatCurrency(cat.spent)}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-stone-100 border-stone-300 text-stone-800">
                        {formatPercent(cat.percent)}
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="h-full rounded-full bg-stone-900 transition-all duration-500"
                      style={{ width: `${Math.min(cat.percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
});

/* ==================================================================== */
/* HELPER COMPONENT: Monthly Series Breakdown Table (MEMOIZED) */
/* ==================================================================== */
const MonthlySeriesTable = memo(function MonthlySeriesTable({ series = [], title }) {
  return (
    <Card className="border-[#d8d4c8]">
      <CardHeader border>
        <CardTitle className="font-display">{title}</CardTitle>
        <CardDescription className="font-mono">Month-by-month financial summary statement</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-stone-900 bg-stone-900 text-stone-100 text-[11px] font-bold uppercase tracking-wider select-none">
                <th className="py-3 px-4 sm:px-6">Month</th>
                <th className="py-3 px-4 text-right">Income</th>
                <th className="py-3 px-4 text-right">Expense</th>
                <th className="py-3 px-4 text-right">Net Balance</th>
                <th className="py-3 px-4 text-right">Net Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeebe3]">
              {series.map((item) => {
                const s = item.summary || {};
                const isPositive = (s.netBalance || 0) >= 0;
                return (
                  <tr key={item.monthKey} className="transition-colors hover:bg-[#fcfbf9]">
                    <td className="py-3 px-4 sm:px-6 font-bold text-stone-900 whitespace-nowrap">
                      {item.monthLabel}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-800 whitespace-nowrap">
                      {s.totalIncome > 0 ? formatCurrency(s.totalIncome, { sign: true }) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-800 whitespace-nowrap">
                      {s.totalExpense > 0 ? formatCurrency(-s.totalExpense) : '-'}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-extrabold whitespace-nowrap ${
                        isPositive ? 'text-stone-900' : 'text-rose-800'
                      }`}
                    >
                      {s.netBalance !== 0 ? formatCurrency(s.netBalance, { sign: true }) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-stone-800 whitespace-nowrap">
                      {s.savingsTotals?.netSavings !== 0 ? formatCurrency(s.savingsTotals?.netSavings, { sign: true }) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});
