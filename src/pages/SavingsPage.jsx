import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPlusCircle,
  FiTrash2,
  FiList,
  FiBarChart2,
  FiAward,
  FiShield,
} from 'react-icons/fi';
import { useSavingsStore } from '../store/useSavingsStore';
import { formatCurrency, useCurrency } from '../utils/formatters';
import {
  SectionHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  DatePicker,
  Select,
  PrimaryButton,
  Badge,
  Toast,
  ConfirmDialog,
  DocumentHeader,
  DocumentFooter,
} from '../components/ui';
import { AnalyticsLineChart, AnalyticsBarChart } from '../components/charts';

export default function SavingsPage() {
  const { symbol: currencySymbol } = useCurrency();
  const { savingsTransactions, addSavingsTransaction, deleteSavingsTransaction } =
    useSavingsStore();

  const [deletingId, setDeletingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const defaultFormValues = {
    amount: '',
    date: todayStr,
    description: '',
    transactionType: 'Added',
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaultFormValues,
  });

  const { savingsTotal, totalAdded, totalWithdrawn } = useMemo(() => {
    let added = 0;
    let withdrawn = 0;

    savingsTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'deposit') {
        added += amt;
      } else if (tx.type === 'withdraw') {
        withdrawn += amt;
      }
    });

    return {
      savingsTotal: added - withdrawn,
      totalAdded: added,
      totalWithdrawn: withdrawn,
    };
  }, [savingsTransactions]);

  const sortedTransactions = useMemo(() => {
    return [...savingsTransactions].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date).getTime();
      const timeB = new Date(b.createdAt || b.date).getTime();
      return timeB - timeA;
    });
  }, [savingsTransactions]);

  const onSubmit = (data) => {
    const storeType = data.transactionType === 'Added' ? 'deposit' : 'withdraw';

    addSavingsTransaction({
      amount: Number(data.amount),
      date: data.date,
      description: data.description,
      type: storeType,
    });

    setToastMessage(
      `Savings ${data.transactionType === 'Added' ? 'deposit' : 'withdrawal'} of ${formatCurrency(Number(data.amount))} recorded!`
    );
    setShowToast(true);
    reset(defaultFormValues);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteSavingsTransaction(deletingId);
      setDeletingId(null);
      setToastMessage('Savings transaction deleted — balance recalculated.');
      setShowToast(true);
    }
  };

  return (
    <div className="space-y-8">
      <Toast
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        type="success"
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Savings Entry"
        message="Are you sure you want to delete this savings entry? Your statement balance will be updated immediately."
        confirmText="Delete Entry"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Document Header */}
      <DocumentHeader
        docType="SAVINGS PASSBOOK"
        docRef="SPB-9042-07"
        title="Savings & Reserves Passbook"
        subtitle="Official reserve account statement & cumulative savings register"
        icon={FiTrendingUp}
      />

      {/* CURRENT SAVINGS STATEMENT CARD */}
      <Card className="border-l-4 border-l-stone-900">
        <CardHeader variant="dark">
          <CardTitle icon={FiShield} iconColor="text-amber-400">Total Accrued Savings Statement</CardTitle>
          <Badge variant="emerald" showDot>Accrued Balance</Badge>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 block">
                Net Cumulative Reserves
              </span>

              <div
                className={`text-4xl sm:text-5xl font-mono font-extrabold tracking-tight pb-3 ledger-total-rule ${
                  savingsTotal >= 0 ? 'text-stone-900' : 'text-rose-800'
                }`}
              >
                {formatCurrency(savingsTotal)}
              </div>

              <div className="flex items-center gap-4 pt-1 font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="text-stone-700">
                    Total Added:{' '}
                    <span className="font-extrabold text-emerald-800">
                      {formatCurrency(totalAdded)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span className="text-stone-700">
                    Withdrawn:{' '}
                    <span className="font-extrabold text-rose-800">
                      {formatCurrency(totalWithdrawn)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-stone-900 bg-stone-900 text-stone-50 flex items-center justify-center shadow-md font-mono text-3xl font-extrabold">
                {currencySymbol}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SAVINGS ANALYTICS SECTION */}
      <SavingsAnalyticsSection savingsTransactions={savingsTransactions} />

      {/* SAVINGS TRANSACTION FORM */}
      <Card>
        <CardHeader variant="dark">
          <CardTitle icon={FiPlusCircle} iconColor="text-amber-400">Record Savings Activity</CardTitle>
          <Badge variant="muted">{savingsTransactions.length} Entries</Badge>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                leftIcon={currencySymbol}
                required
                error={errors.amount?.message}
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be > 0' },
                })}
              />

              <DatePicker
                label="Date"
                required
                error={errors.date?.message}
                {...register('date', {
                  required: 'Date is required',
                })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Description"
                placeholder="e.g. Monthly emergency fund contribution"
                required
                error={errors.description?.message}
                {...register('description', {
                  required: 'Description is required',
                })}
              />

              <Select
                label="Transaction Type"
                options={[
                  { value: 'Added', label: '+ Savings Deposit (Added)' },
                  { value: 'Withdrawn', label: '- Savings Withdrawal (Withdrawn)' },
                ]}
                {...register('transactionType')}
              />
            </div>
          </CardContent>

          <CardFooter border className="justify-end">
            <PrimaryButton type="submit" isLoading={isSubmitting} leftIcon={FiPlusCircle}>
              Save Record
            </PrimaryButton>
          </CardFooter>
        </form>
      </Card>

      {/* SAVINGS TRANSACTIONS TABLE */}
      <Card>
        <CardHeader variant="dark">
          <CardTitle>Savings Statement History</CardTitle>
          <Badge variant="muted">{sortedTransactions.length} Records</Badge>
        </CardHeader>

        <CardContent className="p-0">
          {sortedTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <FiTrendingUp className="mx-auto text-4xl text-stone-400 mb-3" />
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">No Savings Records Logged</p>
              <p className="text-xs text-stone-500 font-mono mt-1">
                Log your first savings deposit or withdrawal above to update your statement.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-900 text-stone-100 text-[11px] font-mono font-bold uppercase tracking-wider select-none border-b-2 border-stone-950">
                    <th className="py-3 px-4 sm:px-6">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs font-mono">
                  {sortedTransactions.map((tx) => {
                    const isDeposit = tx.type === 'deposit';

                    return (
                      <tr
                        key={tx.id}
                        className="transition-colors hover:bg-[#fcfbf9]"
                      >
                        <td className="py-3 px-4 sm:px-6 text-stone-700 font-bold whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="py-3 px-4 text-stone-900 font-bold max-w-xs truncate font-sans">
                          {tx.description}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge
                            variant={isDeposit ? 'emerald' : 'rose'}
                            size="sm"
                            showDot
                          >
                            {isDeposit ? 'Added' : 'Withdrawn'}
                          </Badge>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-extrabold whitespace-nowrap text-sm ${
                            isDeposit ? 'text-emerald-800' : 'text-rose-800'
                          }`}
                        >
                          {formatCurrency(isDeposit ? Number(tx.amount) : -Number(tx.amount), { sign: true })}
                        </td>
                        <td className="py-3 px-4 sm:px-6 whitespace-nowrap text-center">
                          <button
                            onClick={() => setDeletingId(tx.id)}
                            className="p-1.5 text-rose-700 hover:text-rose-950 hover:bg-rose-100 rounded-md transition-colors"
                            title="Delete savings record"
                            aria-label="Delete savings record"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Footer */}
      <DocumentFooter docRef="SPB-9042-07" pageNumber="1 OF 1" />
    </div>
  );
}

/* ==================================================================== */
/* COMPONENT: Savings Analytics Section */
/* ==================================================================== */
function SavingsAnalyticsSection({ savingsTransactions = [] }) {
  const analytics = useMemo(() => {
    const monthMap = {};
    const sorted = [...savingsTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach((tx) => {
      const monthKey = tx.date ? tx.date.substring(0, 7) : new Date().toISOString().substring(0, 7);
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { added: 0, withdrawn: 0, net: 0 };
      }
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'deposit') {
        monthMap[monthKey].added += amt;
      } else if (tx.type === 'withdraw') {
        monthMap[monthKey].withdrawn += amt;
      }
      monthMap[monthKey].net = monthMap[monthKey].added - monthMap[monthKey].withdrawn;
    });

    const monthKeys = Object.keys(monthMap).sort();

    let cumulative = 0;
    let highestMonth = null;
    let highestNet = -Infinity;
    let lowestMonth = null;
    let lowestNet = Infinity;

    const series = monthKeys.map((key) => {
      const data = monthMap[key];
      cumulative += data.net;
      const [y, m] = key.split('-').map(Number);
      const dateObj = new Date(y, m - 1, 1);
      const monthLabel = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });

      if (data.net > highestNet) {
        highestNet = data.net;
        highestMonth = { key, label: monthLabel, net: data.net, added: data.added, withdrawn: data.withdrawn };
      }
      if (data.net < lowestNet) {
        lowestNet = data.net;
        lowestMonth = { key, label: monthLabel, net: data.net, added: data.added, withdrawn: data.withdrawn };
      }

      return {
        monthKey: key,
        monthLabel,
        Added: data.added,
        Withdrawn: data.withdrawn,
        NetSavings: data.net,
        CumulativeSavings: cumulative,
      };
    });

    return {
      series,
      highestMonth: highestNet !== -Infinity ? highestMonth : null,
      lowestMonth: lowestNet !== Infinity ? lowestMonth : null,
    };
  }, [savingsTransactions]);

  const { series, highestMonth, lowestMonth } = analytics;

  if (series.length === 0) return null;

  return (
    <div className="space-y-6 animate-page-enter">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-900 flex items-center gap-2">
          <FiBarChart2 className="text-stone-900" />
          Savings Growth Analytics & Trends
        </h3>
        <Badge variant="emerald" showDot>
          Verified Audit
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader variant="dark">
            <CardTitle>Peak Savings Month</CardTitle>
            <Badge variant="emerald">Highest Growth</Badge>
          </CardHeader>
          <CardContent className="p-5">
            {highestMonth ? (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-base font-extrabold uppercase text-stone-900 font-display">{highestMonth.label}</h4>
                  <span className="text-2xl font-mono font-extrabold text-emerald-800">
                    {formatCurrency(highestMonth.net, { sign: true })}
                  </span>
                </div>
                <p className="text-xs font-mono text-stone-700">
                  Added: <span className="font-bold text-emerald-800">{formatCurrency(highestMonth.added, { sign: true })}</span> |
                  Withdrawn: <span className="font-bold text-rose-800">{formatCurrency(highestMonth.withdrawn)}</span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-stone-500 font-mono">No data recorded.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-600">
          <CardHeader variant="dark">
            <CardTitle>Lowest Savings Month</CardTitle>
            <Badge variant="rose">Lowest Growth</Badge>
          </CardHeader>
          <CardContent className="p-5">
            {lowestMonth ? (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-base font-extrabold uppercase text-stone-900 font-display">{lowestMonth.label}</h4>
                  <span
                    className={`text-2xl font-mono font-extrabold ${
                      lowestMonth.net >= 0 ? 'text-stone-900' : 'text-rose-800'
                    }`}
                  >
                    {formatCurrency(lowestMonth.net, { sign: true })}
                  </span>
                </div>
                <p className="text-xs font-mono text-stone-700">
                  Added: <span className="font-bold text-emerald-800">{formatCurrency(lowestMonth.added, { sign: true })}</span> |
                  Withdrawn: <span className="font-bold text-rose-800">{formatCurrency(lowestMonth.withdrawn)}</span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-stone-500 font-mono">No data recorded.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsLineChart
          data={series}
          xKey="monthLabel"
          title="Cumulative Savings Growth"
          description="Accrued total reserve trajectory month by month"
          badge="Growth Line"
          height={260}
          series={[
            { key: 'CumulativeSavings', name: 'Cumulative Savings', color: '#16a34a', strokeWidth: 2.5 },
            { key: 'NetSavings', name: 'Monthly Net', color: '#2563eb', strokeWidth: 2 },
          ]}
        />

        <AnalyticsBarChart
          data={series}
          xKey="monthLabel"
          title="Monthly Savings Deposits vs Withdrawals"
          description="Deposits added vs funds withdrawn each month"
          badge="Bar Chart"
          height={260}
          series={[
            { key: 'Added', name: 'Deposits Added', color: '#16a34a' },
            { key: 'Withdrawn', name: 'Withdrawn', color: '#b91c1c' },
          ]}
        />
      </div>

      <Card>
        <CardHeader variant="dark">
          <CardTitle>Month-by-Month Savings Breakdown</CardTitle>
          <span className="text-xs font-mono text-stone-300">Detailed Statement</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-stone-900 text-stone-100 text-[11px] font-bold uppercase tracking-wider select-none border-b-2 border-stone-950">
                  <th className="py-3 px-4 sm:px-6">Month</th>
                  <th className="py-3 px-4 text-right">Added</th>
                  <th className="py-3 px-4 text-right">Withdrawn</th>
                  <th className="py-3 px-4 text-right">Net Savings</th>
                  <th className="py-3 px-4 text-right">Cumulative Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {series.map((item) => {
                  const isPositive = item.NetSavings >= 0;
                  return (
                    <tr key={item.monthKey} className="transition-colors hover:bg-[#fcfbf9]">
                      <td className="py-3 px-4 sm:px-6 font-bold text-stone-900 whitespace-nowrap font-display uppercase">
                        {item.monthLabel}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-800 whitespace-nowrap">
                        {item.Added > 0 ? formatCurrency(item.Added, { sign: true }) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-rose-800 whitespace-nowrap">
                        {item.Withdrawn > 0 ? formatCurrency(-item.Withdrawn) : '-'}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-extrabold whitespace-nowrap ${
                          isPositive ? 'text-stone-900' : 'text-rose-800'
                        }`}
                      >
                        {item.NetSavings !== 0 ? formatCurrency(item.NetSavings, { sign: true }) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-stone-900 whitespace-nowrap">
                        {formatCurrency(item.CumulativeSavings)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
