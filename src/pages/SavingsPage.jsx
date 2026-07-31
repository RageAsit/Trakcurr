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
  FiEdit2,
  FiRefreshCw,
  FiX,
  FiPieChart,
  FiFilter,
  FiLayers,
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
  SecondaryButton,
  Badge,
  Toast,
  ConfirmDialog,
  DocumentHeader,
  DocumentFooter,
} from '../components/ui';
import { AnalyticsLineChart, AnalyticsBarChart } from '../components/charts';

export default function SavingsPage() {
  const { symbol: currencySymbol } = useCurrency();
  const {
    savingsTransactions,
    addSavingsTransaction,
    deleteSavingsTransaction,
    updateSavingsTransaction,
  } = useSavingsStore();

  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const defaultFormValues = {
    amount: '',
    date: todayStr,
    description: '',
    category: 'Mutual Funds',
    transactionType: 'Added',
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaultFormValues,
  });

  const {
    savingsTotal,
    totalAdded,
    totalWithdrawn,
    mfTotal,
    mfAdded,
    mfWithdrawn,
    goldTotal,
    goldAdded,
    goldWithdrawn,
  } = useMemo(() => {
    let added = 0;
    let withdrawn = 0;
    let mfA = 0, mfW = 0;
    let goldA = 0, goldW = 0;

    savingsTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const cat = tx.category || 'Mutual Funds';
      const isDeposit = tx.type === 'deposit';

      if (isDeposit) {
        added += amt;
        if (cat === 'Gold') {
          goldA += amt;
        } else {
          mfA += amt;
        }
      } else if (tx.type === 'withdraw') {
        withdrawn += amt;
        if (cat === 'Gold') {
          goldW += amt;
        } else {
          mfW += amt;
        }
      }
    });

    return {
      savingsTotal: added - withdrawn,
      totalAdded: added,
      totalWithdrawn: withdrawn,
      mfTotal: mfA - mfW,
      mfAdded: mfA,
      mfWithdrawn: mfW,
      goldTotal: goldA - goldW,
      goldAdded: goldA,
      goldWithdrawn: goldW,
    };
  }, [savingsTransactions]);

  const filteredTransactions = useMemo(() => {
    if (activeCategoryFilter === 'All') return savingsTransactions;
    return savingsTransactions.filter((tx) => {
      const cat = tx.category || 'Mutual Funds';
      return cat === activeCategoryFilter;
    });
  }, [savingsTransactions, activeCategoryFilter]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date).getTime();
      const timeB = new Date(b.createdAt || b.date).getTime();
      return timeB - timeA;
    });
  }, [filteredTransactions]);

  const onSubmit = (data) => {
    const storeType = data.transactionType === 'Added' ? 'deposit' : 'withdraw';
    const payload = {
      amount: Number(data.amount),
      date: data.date,
      description: data.description,
      category: data.category || 'Mutual Funds',
      type: storeType,
    };

    if (editingId) {
      if (updateSavingsTransaction) {
        updateSavingsTransaction(editingId, payload);
      } else {
        deleteSavingsTransaction(editingId);
        addSavingsTransaction(payload);
      }

      setToastMessage(`Savings record "${data.description}" updated.`);
      setShowToast(true);
      setEditingId(null);
      reset(defaultFormValues);
    } else {
      addSavingsTransaction(payload);

      setToastMessage(
        `${data.category} ${data.transactionType === 'Added' ? 'deposit' : 'withdrawal'} of ${formatCurrency(Number(data.amount))} recorded!`
      );
      setShowToast(true);
      reset(defaultFormValues);
    }
  };

  const handleEdit = (tx) => {
    setEditingId(tx.id);
    setValue('amount', tx.amount);
    setValue('date', tx.date);
    setValue('description', tx.description);
    setValue('category', tx.category || 'Mutual Funds');
    setValue('transactionType', tx.type === 'deposit' ? 'Added' : 'Withdrawn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
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
        subtitle="Official reserve account statement divided into Mutual Funds & Gold investments"
        icon={FiTrendingUp}
      />

      {/* OVERALL ACCRUED SAVINGS STATEMENT */}
      <Card className="border-l-4 border-l-stone-900">
        <CardHeader variant="dark">
          <CardTitle icon={FiShield} iconColor="text-amber-400">Total Accrued Savings & Portfolio</CardTitle>
          <Badge variant="emerald" showDot>Total Reserves</Badge>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 block">
                Net Cumulative Savings
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

      {/* MUTUAL FUNDS VS GOLD DIVISION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MUTUAL FUNDS CARD */}
        <Card className="border-l-4 border-l-indigo-600 bg-white">
          <CardHeader variant="dark">
            <CardTitle icon={FiPieChart} iconColor="text-indigo-400">Mutual Funds Reserve</CardTitle>
            <Badge variant="indigo" showDot>SIP & Funds</Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 block">
                Mutual Funds Balance
              </span>
              <div className="text-3xl font-mono font-extrabold text-indigo-950 mt-1">
                {formatCurrency(mfTotal)}
              </div>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
              <span className="text-stone-600">
                Deposited: <span className="font-bold text-emerald-700">{formatCurrency(mfAdded)}</span>
              </span>
              <span className="text-stone-600">
                Withdrawn: <span className="font-bold text-rose-700">{formatCurrency(mfWithdrawn)}</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* GOLD CARD */}
        <Card className="border-l-4 border-l-amber-500 bg-white">
          <CardHeader variant="dark">
            <CardTitle icon={FiAward} iconColor="text-amber-400">Gold Investment Reserve</CardTitle>
            <Badge variant="amber" showDot>Gold & Bullion</Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 block">
                Gold Reserve Balance
              </span>
              <div className="text-3xl font-mono font-extrabold text-amber-950 mt-1">
                {formatCurrency(goldTotal)}
              </div>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
              <span className="text-stone-600">
                Purchased: <span className="font-bold text-emerald-700">{formatCurrency(goldAdded)}</span>
              </span>
              <span className="text-stone-600">
                Redeemed: <span className="font-bold text-rose-700">{formatCurrency(goldWithdrawn)}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SAVINGS ANALYTICS SECTION */}
      <SavingsAnalyticsSection savingsTransactions={savingsTransactions} />

      {/* SAVINGS TRANSACTION FORM */}
      <Card>
        <CardHeader variant="dark">
          <CardTitle icon={FiPlusCircle} iconColor="text-amber-400">
            {editingId ? 'Edit Savings Activity' : 'Record Savings Activity'}
          </CardTitle>
          {editingId ? (
            <Badge variant="amber" showDot>Edit Mode</Badge>
          ) : (
            <Badge variant="muted">{savingsTransactions.length} Entries</Badge>
          )}
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <Select
                label="Category / Instrument"
                options={[
                  { value: 'Mutual Funds', label: 'Mutual Funds' },
                  { value: 'Gold', label: 'Gold' },
                ]}
                {...register('category')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Description"
                placeholder="e.g. Monthly SIP investment or Sovereign Gold Bond purchase"
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

          <CardFooter border className="justify-end gap-3">
            {editingId ? (
              <>
                <SecondaryButton type="button" onClick={handleCancelEdit} leftIcon={FiX}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  leftIcon={FiRefreshCw}
                  isLoading={isSubmitting}
                >
                  Update Record
                </PrimaryButton>
              </>
            ) : (
              <>
                <SecondaryButton type="button" onClick={handleCancelEdit}>
                  Reset
                </SecondaryButton>
                <PrimaryButton type="submit" isLoading={isSubmitting} leftIcon={FiPlusCircle}>
                  Save Record
                </PrimaryButton>
              </>
            )}
          </CardFooter>
        </form>
      </Card>

      {/* SAVINGS TRANSACTIONS TABLE & FILTER TABS */}
      <Card>
        <CardHeader variant="dark" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle icon={FiList}>Savings Statement History</CardTitle>
            <CardDescription className="text-stone-400">
              Showing {sortedTransactions.length} of {savingsTransactions.length} Records
            </CardDescription>
          </div>

          {/* FILTER TABS */}
          <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-lg border border-stone-700 text-xs font-mono">
            {['All', 'Mutual Funds', 'Gold'].map((filterName) => {
              const isActive = activeCategoryFilter === filterName;
              return (
                <button
                  key={filterName}
                  type="button"
                  onClick={() => setActiveCategoryFilter(filterName)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-stone-100 text-stone-900 font-bold shadow'
                      : 'text-stone-300 hover:text-white hover:bg-stone-700'
                  }`}
                >
                  {filterName}
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {sortedTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <FiTrendingUp className="mx-auto text-4xl text-stone-400 mb-3" />
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                No {activeCategoryFilter !== 'All' ? activeCategoryFilter : ''} Records Found
              </p>
              <p className="text-xs text-stone-500 font-mono mt-1">
                Log your first {activeCategoryFilter !== 'All' ? activeCategoryFilter : 'savings'} deposit or withdrawal above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-900 text-stone-100 text-[11px] font-mono font-bold uppercase tracking-wider select-none border-b-2 border-stone-950">
                    <th className="py-3 px-4 sm:px-6">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs font-mono">
                  {sortedTransactions.map((tx) => {
                    const isDeposit = tx.type === 'deposit';
                    const isEditing = tx.id === editingId;
                    const cat = tx.category || 'Mutual Funds';
                    const isGold = cat === 'Gold';

                    return (
                      <tr
                        key={tx.id}
                        className={`transition-colors hover:bg-[#fcfbf9] ${
                          isEditing ? 'bg-amber-100/60 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-4 sm:px-6 text-stone-700 font-bold whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="py-3 px-4 text-stone-900 font-bold max-w-xs truncate font-sans">
                          {tx.description}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge
                            variant={isGold ? 'amber' : 'indigo'}
                            size="sm"
                          >
                            {cat}
                          </Badge>
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
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(tx)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md transition-colors"
                              title="Edit savings record"
                              aria-label="Edit savings record"
                            >
                              <FiEdit2 className="text-sm" />
                            </button>
                            <button
                              onClick={() => setDeletingId(tx.id)}
                              className="p-1.5 text-rose-700 hover:text-rose-950 hover:bg-rose-100 rounded-md transition-colors"
                              title="Delete savings record"
                              aria-label="Delete savings record"
                            >
                              <FiTrash2 className="text-sm" />
                            </button>
                          </div>
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
        monthMap[monthKey] = { added: 0, withdrawn: 0, net: 0, mf: 0, gold: 0 };
      }
      const amt = Number(tx.amount) || 0;
      const cat = tx.category || 'Mutual Funds';
      const isDeposit = tx.type === 'deposit';

      if (isDeposit) {
        monthMap[monthKey].added += amt;
        if (cat === 'Gold') monthMap[monthKey].gold += amt;
        else monthMap[monthKey].mf += amt;
      } else if (tx.type === 'withdraw') {
        monthMap[monthKey].withdrawn += amt;
        if (cat === 'Gold') monthMap[monthKey].gold -= amt;
        else monthMap[monthKey].mf -= amt;
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
      const opening = cumulative;
      cumulative += data.net;
      const closing = cumulative;
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
        OpeningSavings: opening,
        Added: data.added,
        Withdrawn: data.withdrawn,
        NetSavings: data.net,
        CumulativeSavings: closing,
        ClosingSavings: closing,
        MutualFunds: Math.max(0, data.mf),
        Gold: Math.max(0, data.gold),
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
          Savings & Investment Analytics
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
                  Added: <span className="font-bold text-emerald-800">{formatCurrency(highestMonth.added, { sign: true })}</span> |
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
          title="Mutual Funds vs Gold Investments"
          description="Monthly contributions by asset category"
          badge="Asset Division"
          height={260}
          series={[
            { key: 'MutualFunds', name: 'Mutual Funds', color: '#4f46e5' },
            { key: 'Gold', name: 'Gold', color: '#f59e0b' },
          ]}
        />
      </div>

      <Card>
        <CardHeader variant="dark">
          <CardTitle>Month-by-Month Savings Breakdown</CardTitle>
          <span className="text-xs font-mono text-stone-300">Detailed Statement with Carried Forward Balance</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-stone-900 text-stone-100 text-[11px] font-bold uppercase tracking-wider select-none border-b-2 border-stone-950">
                  <th className="py-3 px-4 sm:px-6">Month</th>
                  <th className="py-3 px-4 text-right">Opening (Carried Forward)</th>
                  <th className="py-3 px-4 text-right">Added</th>
                  <th className="py-3 px-4 text-right">Withdrawn</th>
                  <th className="py-3 px-4 text-right">Month Net</th>
                  <th className="py-3 px-4 text-right">Closing Balance</th>
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
                      <td className="py-3 px-4 text-right font-medium text-stone-600 whitespace-nowrap">
                        {formatCurrency(item.OpeningSavings)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-800 whitespace-nowrap">
                        {item.Added > 0 ? formatCurrency(item.Added, { sign: true }) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-rose-800 whitespace-nowrap">
                        {item.Withdrawn > 0 ? formatCurrency(-item.Withdrawn) : '-'}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                          isPositive ? 'text-stone-900' : 'text-rose-800'
                        }`}
                      >
                        {item.NetSavings !== 0 ? formatCurrency(item.NetSavings, { sign: true }) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-stone-900 whitespace-nowrap">
                        {formatCurrency(item.ClosingSavings)}
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
