import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  FiCreditCard,
  FiCalendar,
  FiFilter,
  FiSearch,
  FiPlusCircle,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { useTransactionStore } from '../store/useTransactionStore';
import { formatCurrency, useCurrency } from '../utils/formatters';
import {
  SectionHeader,
  Card,
  CardHeader,
  CardTitle,
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

const CATEGORY_OPTIONS = [
  'Need',
  'Food Ordered',
  'Dine Out',
  'Travel',
  'Entertainment',
  'Investment',
  'Miscellaneous',
];

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

export default function TransactionsPage() {
  const { symbol: currencySymbol } = useCurrency();
  const { transactions, addTransaction, deleteTransaction, updateTransaction } =
    useTransactionStore();

  const currentMonthValue = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);

  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

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

  const monthSummary = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    monthTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const t = (tx.type || '').toLowerCase();
      if (t === 'debit') totalDebit += amt;
      if (t === 'credit') totalCredit += amt;
    });

    return {
      totalDebit,
      totalCredit,
      netBalance: totalCredit - totalDebit,
      count: monthTransactions.length,
    };
  }, [monthTransactions]);

  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter((tx) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const descMatch = (tx.description || '').toLowerCase().includes(query);
        const catMatch = (tx.category || '').toLowerCase().includes(query);
        if (!descMatch && !catMatch) return false;
      }
      if (filterType) {
        if ((tx.type || '').toLowerCase() !== filterType.toLowerCase()) return false;
      }
      if (filterMode) {
        if ((tx.mode || '').toLowerCase() !== filterMode.toLowerCase()) return false;
      }
      if (filterCategory) {
        if ((tx.category || '').toLowerCase() !== filterCategory.toLowerCase()) return false;
      }
      return true;
    });
  }, [monthTransactions, searchQuery, filterType, filterMode, filterCategory]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date).getTime();
      const timeB = new Date(b.createdAt || b.date).getTime();
      return timeB - timeA;
    });
  }, [filteredTransactions]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || filterType || filterMode || filterCategory
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterType('');
    setFilterMode('');
    setFilterCategory('');
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const defaultFormValues = {
    amount: '',
    date: todayStr,
    description: '',
    category: 'Need',
    type: 'Debit',
    mode: 'Online',
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

  const onSubmit = (data) => {
    if (editingId) {
      if (updateTransaction) {
        updateTransaction(editingId, {
          amount: Number(data.amount),
          date: data.date,
          description: data.description,
          category: data.category,
          type: data.type,
          mode: data.mode,
        });
      } else {
        deleteTransaction(editingId);
        addTransaction({
          amount: Number(data.amount),
          date: data.date,
          description: data.description,
          category: data.category,
          type: data.type,
          mode: data.mode,
        });
      }

      setToastMessage(`Transaction "${data.description}" updated.`);
      setShowToast(true);
      setEditingId(null);
      reset(defaultFormValues);
    } else {
      addTransaction({
        amount: Number(data.amount),
        date: data.date,
        description: data.description,
        category: data.category,
        type: data.type,
        mode: data.mode,
      });

      if (data.date && data.date.substring(0, 7) !== selectedMonth) {
        setSelectedMonth(data.date.substring(0, 7));
      }

      setToastMessage(`New ${data.type.toLowerCase()} entry added.`);
      setShowToast(true);
      reset({
        ...defaultFormValues,
        date: data.date,
      });
    }
  };

  const handleEdit = (tx) => {
    setEditingId(tx.id);
    setValue('amount', tx.amount);
    setValue('date', tx.date);
    setValue('description', tx.description);
    setValue('category', tx.category || 'Need');
    setValue('type', tx.type || 'Debit');
    setValue('mode', tx.mode || 'Online');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset(defaultFormValues);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteTransaction(deletingId);
      setDeletingId(null);
      setToastMessage('Transaction deleted.');
      setShowToast(true);
    }
  };

  return (
    <div className="space-y-6">
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
        title="Delete Transaction"
        message="This will permanently remove this entry."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Document Header */}
      <DocumentHeader
        docType="BOOKKEEPING JOURNAL"
        docRef="GLR-2026-07"
        title="General Ledger Register"
        subtitle="Official statement transactions log & journal entry records"
        icon={FiCreditCard}
        period={selectedMonthLabel}
      />

      {/* Period Selector */}
      <Card>
        <CardHeader variant="dark">
          <CardTitle icon={FiCalendar} iconColor="text-amber-400">Statement Period</CardTitle>
          <Badge variant="muted">{selectedMonthLabel}</Badge>
        </CardHeader>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest block">
              Active Month
            </span>
            <h2 className="text-xl font-extrabold text-stone-900 uppercase tracking-wider font-display mt-0.5">{selectedMonthLabel}</h2>
          </div>

          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={monthOptions}
            className="min-w-[220px]"
          />
        </CardContent>
      </Card>

      {/* Entry Form */}
      <Card>
        <CardHeader variant="dark">
          <CardTitle icon={FiPlusCircle} iconColor="text-amber-400">
            {editingId ? 'Edit Ledger Entry' : 'New Transaction Entry'}
          </CardTitle>
          {editingId ? (
            <Badge variant="amber" showDot>Edit Mode</Badge>
          ) : (
            <Badge variant="muted">New Entry</Badge>
          )}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <Input
                  label="Description"
                  placeholder="e.g. Office supplies & equipment restock"
                  required
                  error={errors.description?.message}
                  {...register('description', {
                    required: 'Description is required',
                  })}
                />
              </div>

              <Select
                label="Category"
                options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
                {...register('category')}
              />

              <Select
                label="Type"
                options={[
                  { value: 'Debit', label: 'Debit (Expense)' },
                  { value: 'Credit', label: 'Credit (Income)' },
                ]}
                {...register('type')}
              />

              <Select
                label="Mode"
                options={[
                  { value: 'Online', label: 'Online' },
                  { value: 'Cash', label: 'Cash' },
                ]}
                {...register('mode')}
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
                  Update Entry
                </PrimaryButton>
              </>
            ) : (
              <>
                <SecondaryButton type="button" onClick={handleCancelEdit}>
                  Reset
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  leftIcon={FiPlusCircle}
                  isLoading={isSubmitting}
                >
                  Save Entry
                </PrimaryButton>
              </>
            )}
          </CardFooter>
        </form>
      </Card>

      {/* Search & Filter */}
      <Card>
        <CardHeader variant="dark">
          <CardTitle>Filter & Search Entries</CardTitle>
          <span className="text-[11px] font-mono text-stone-300 font-bold uppercase">
            {filteredTransactions.length} Items
          </span>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <Input
                label="Search Keywords"
                placeholder="Search description or category..."
                leftIcon={FiSearch}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-mono font-bold uppercase text-stone-700 bg-stone-200 hover:bg-stone-300 border border-stone-400 transition-all shrink-0 self-end"
              >
                <FiX className="text-xs" />
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Type Filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              placeholder="All Types"
            >
              <option value="">All Types</option>
              <option value="Debit">Debit</option>
              <option value="Credit">Credit</option>
            </Select>

            <Select
              label="Mode Filter"
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              placeholder="All Modes"
            >
              <option value="">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
            </Select>

            <Select
              label="Category Filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              placeholder="All Categories"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <Card>
        <CardHeader variant="dark">
          <CardTitle>Ledger Statement — {selectedMonthLabel}</CardTitle>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-rose-400 font-bold uppercase">
              Debits: {formatCurrency(monthSummary.totalDebit)}
            </span>
            <span className="text-stone-600">|</span>
            <span className="text-emerald-400 font-bold uppercase">
              Credits: {formatCurrency(monthSummary.totalCredit, { sign: true })}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {sortedTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">
                {hasActiveFilters
                  ? 'No ledger entries match your filter criteria'
                  : `No statement records for ${selectedMonthLabel}`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111111] text-stone-100 text-[11px] font-mono font-bold uppercase tracking-wider select-none border-b-2 border-black">
                    <th className="py-3 px-4 sm:px-5">Entry #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 sm:px-5 text-center w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-mono">
                  {sortedTransactions.map((tx, idx) => {
                    const isDebit = tx.type === 'Debit';
                    const isEditing = tx.id === editingId;
                    const voucherId = `#GL-${String(sortedTransactions.length - idx).padStart(3, '0')}`;

                    return (
                      <tr
                        key={tx.id}
                        className={`border-b border-stone-200 transition-colors hover:bg-[#fcfbf9] ${
                          isEditing ? 'bg-amber-100/60 font-semibold' : idx % 2 === 1 ? 'bg-[#fdfcfa]' : ''
                        }`}
                      >
                        <td className="py-3 px-4 sm:px-5 text-stone-500 font-bold whitespace-nowrap text-[11px]">
                          {voucherId}
                        </td>
                        <td className="py-3 px-4 text-stone-700 font-bold whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="py-3 px-4 text-stone-900 font-sans font-bold max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-stone-700 font-medium">
                          {tx.category}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge variant={isDebit ? 'rose' : 'emerald'} size="sm" showDot>
                            {tx.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-stone-600 uppercase font-bold text-[11px]">
                          {tx.mode}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-extrabold whitespace-nowrap text-sm ${
                            isDebit ? 'text-rose-800' : 'text-emerald-800'
                          }`}
                        >
                          {formatCurrency(isDebit ? -Number(tx.amount) : Number(tx.amount), { sign: true })}
                        </td>
                        <td className="py-3 px-4 sm:px-5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(tx)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
                              title="Edit record"
                              aria-label="Edit record"
                            >
                              <FiEdit2 className="text-xs" />
                            </button>
                            <button
                              onClick={() => setDeletingId(tx.id)}
                              className="p-1.5 text-rose-700 hover:text-rose-950 hover:bg-rose-100 rounded transition-colors"
                              title="Delete record"
                              aria-label="Delete record"
                            >
                              <FiTrash2 className="text-xs" />
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
      <DocumentFooter docRef="GLR-2026-07" pageNumber="1 OF 1" />
    </div>
  );
}
