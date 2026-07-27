import { useState } from 'react';
import {
  FiSettings,
  FiTrash2,
  FiAlertTriangle,
  FiRefreshCw,
  FiDollarSign,
  FiTrendingUp,
  FiShield,
  FiGlobe,
} from 'react-icons/fi';
import { useTransactionStore } from '../store/useTransactionStore';
import { useSavingsStore } from '../store/useSavingsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { SUPPORTED_CURRENCIES } from '../data/constants';
import { getCurrencyInfo } from '../utils/formatters';
import {
  SectionHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Select,
  Badge,
  Toast,
  ConfirmDialog,
  DocumentHeader,
  DocumentFooter,
} from '../components/ui';

export default function SettingsPage() {
  const { transactions, clearTransactions } = useTransactionStore();
  const { savingsTransactions, clearSavingsTransactions } = useSavingsStore();
  const { currency, updateSettings, resetSettings } = useSettingsStore();

  const [activeConfirm, setActiveConfirm] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);


  const currentCurrencyInfo = getCurrencyInfo(currency || 'INR');

  const showSuccess = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const handleCurrencyChange = (newCurrencyCode) => {
    updateSettings({ currency: newCurrencyCode });
    const info = getCurrencyInfo(newCurrencyCode);
    showSuccess(`Currency updated to ${info.name} (${info.symbol}) across all app views!`);
  };

  const handleConfirm = () => {
    switch (activeConfirm) {
      case 'transactions':
        clearTransactions();
        showSuccess('All transactions have been cleared.');
        break;
      case 'savings':
        clearSavingsTransactions();
        showSuccess('All savings transactions have been cleared.');
        break;
      case 'reset':
        clearTransactions();
        clearSavingsTransactions();
        resetSettings();
        showSuccess('App has been fully reset to factory defaults.');
        break;
      default:
        break;
    }
    setActiveConfirm(null);
  };

  const confirmDialogs = {
    transactions: {
      title: 'Clear All Transactions',
      message: `This will permanently delete all ${transactions.length} transaction(s). Your savings data and settings will not be affected. This action cannot be undone.`,
      confirmText: 'Clear Transactions',
      variant: 'danger',
    },
    savings: {
      title: 'Clear All Savings',
      message: `This will permanently delete all ${savingsTransactions.length} savings transaction(s) and reset your savings balance to 0. Your budget transactions and settings will not be affected.`,
      confirmText: 'Clear Savings',
      variant: 'danger',
    },
    reset: {
      title: 'Reset Entire App',
      message: 'This will delete ALL transactions, ALL savings data, and reset all settings to their defaults. Everything will be wiped clean. This action cannot be undone.',
      confirmText: 'Reset Everything',
      variant: 'danger',
    },
  };

  const currentDialog = activeConfirm ? confirmDialogs[activeConfirm] : null;

  const dangerActions = [
    {
      key: 'transactions',
      icon: FiDollarSign,
      title: 'Clear All Transactions',
      description: 'Permanently remove every budget transaction you\'ve logged. Savings and settings are kept.',
      count: transactions.length,
      countLabel: 'transaction',
      accentColor: 'rose',
      iconBg: 'bg-rose-50 border-rose-200 text-rose-800',
      hoverBorder: 'hover:border-rose-400',
      buttonClasses: 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100',
      buttonLabel: 'Clear Transactions',
    },
    {
      key: 'savings',
      icon: FiTrendingUp,
      title: 'Clear All Savings',
      description: 'Permanently remove all savings deposits and withdrawals. Your balance resets to 0.',
      count: savingsTransactions.length,
      countLabel: 'savings entry',
      accentColor: 'amber',
      iconBg: 'bg-amber-50 border-amber-200 text-amber-900',
      hoverBorder: 'hover:border-amber-400',
      buttonClasses: 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100',
      buttonLabel: 'Clear Savings',
    },
    {
      key: 'reset',
      icon: FiRefreshCw,
      title: 'Reset App',
      description: 'Wipe everything — transactions, savings, and settings — back to factory defaults.',
      count: transactions.length + savingsTransactions.length,
      countLabel: 'total record',
      accentColor: 'rose',
      iconBg: 'bg-rose-50 border-rose-200 text-rose-800',
      hoverBorder: 'hover:border-rose-400',
      buttonClasses: 'bg-rose-700 border-rose-800 text-white hover:bg-rose-800',
      buttonLabel: 'Reset Everything',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Toast */}
      <Toast
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        type="success"
      />


      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={activeConfirm !== null}
        onClose={() => setActiveConfirm(null)}
        onConfirm={handleConfirm}
        title={currentDialog?.title || ''}
        message={currentDialog?.message || ''}
        confirmText={currentDialog?.confirmText || 'Confirm'}
        cancelText="Cancel"
        variant={currentDialog?.variant || 'danger'}
      />

      {/* Document Header */}
      <DocumentHeader
        docType="CLIENT PROFILE FORM"
        docRef="SET-1001-07"
        title="Account Preferences & Config"
        subtitle="Official client profile settings, display currency, & system data"
        icon={FiSettings}
      />

      {/* CURRENCY PREFERENCES CARD */}
      <Card>
        <CardHeader variant="dark">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FiGlobe className="text-white text-base" />
              Currency & Regional Display Settings
            </CardTitle>
            <CardDescription dark>
              Select active currency symbol and formatting for Trakcurr
            </CardDescription>
          </div>
          <Badge variant="emerald" showDot>
            {currentCurrencyInfo.code} ({currentCurrencyInfo.symbol})
          </Badge>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 block">
                Primary Display Currency
              </label>
              <Select
                value={currency || 'INR'}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                options={SUPPORTED_CURRENCIES.map((c) => ({
                  value: c.code,
                  label: `${c.symbol} — ${c.name}`,
                }))}
                className="min-w-[220px]"
              />
              <p className="text-[11px] font-mono text-stone-500 leading-relaxed">
                Updates amounts in transactions, savings goals, monthly & annual dashboards, reports, and analytics tools.
              </p>
            </div>

            {/* QUICK CURRENCY SELECTOR PILLS */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-600 block">
                Popular Currencies
              </label>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_CURRENCIES.slice(0, 5).map((c) => {
                  const isSelected = (currency || 'INR') === c.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => handleCurrencyChange(c.code)}
                      className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all duration-200 border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-stone-900 border-stone-900 text-stone-50 shadow-xs'
                          : 'bg-[#fbf9f4] border-stone-300 text-stone-800 hover:border-stone-400 hover:bg-stone-100'
                      }`}
                    >
                      <span>{c.symbol}</span>
                      <span>{c.code}</span>
                      {c.code === 'INR' && <span className="text-[10px] text-amber-600 font-extrabold ml-0.5">(Primary)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DATA OVERVIEW CARD */}
      <Card>
        <CardHeader variant="dark">
          <CardTitle>Data Store Summary</CardTitle>
          <Badge variant="muted">System Records</Badge>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="text-xs font-mono font-bold uppercase text-stone-600 tracking-wider">
            Your Stored Ledger Records Summary
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="bg-[#fbf9f4] border border-stone-300 rounded-lg p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Transactions
              </div>
              <div className="text-3xl font-extrabold text-stone-900">
                {transactions.length}
              </div>
              <div className="text-[11px] text-stone-500">Budget entries logged</div>
            </div>

            <div className="bg-[#fbf9f4] border border-stone-300 rounded-lg p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Savings Entries
              </div>
              <div className="text-3xl font-extrabold text-stone-900">
                {savingsTransactions.length}
              </div>
              <div className="text-[11px] text-stone-500">Deposits & withdrawals</div>
            </div>

            <div className="bg-[#fbf9f4] border border-stone-300 rounded-lg p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Total Records
              </div>
              <div className="text-3xl font-extrabold text-stone-900">
                {transactions.length + savingsTransactions.length}
              </div>
              <div className="text-[11px] text-stone-500">Across all stores</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DANGER ZONE */}
      <Card className="border-l-4 border-l-rose-600">
        <CardHeader variant="dark">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FiAlertTriangle className="text-rose-400 text-base" />
              Danger Zone
            </CardTitle>
            <CardDescription dark>
              Destructive actions that permanently delete your statement data
            </CardDescription>
          </div>
          <Badge variant="rose" showDot>
            Irreversible
          </Badge>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {dangerActions.map((action) => {
            const Icon = action.icon;
            const isEmpty = action.count === 0;
            const pluralLabel =
              action.count === 1 ? action.countLabel : action.countLabel + (action.countLabel.endsWith('y') ? '' : 's');

            return (
              <div
                key={action.key}
                className="bg-[#fbf9f4] border border-stone-300 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-lg border shrink-0 ${action.iconBg}`}>
                    <Icon className="text-lg" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-stone-900 leading-snug">{action.title}</div>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed max-w-md font-mono">
                      {action.description}
                    </p>
                    <div className="mt-2">
                      <Badge variant={isEmpty ? 'slate' : action.accentColor} size="sm" outline>
                        {action.count} {pluralLabel}
                      </Badge>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveConfirm(action.key)}
                  disabled={isEmpty && action.key !== 'reset'}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-all shrink-0 select-none active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${action.buttonClasses}`}
                >
                  <FiTrash2 className="text-sm" />
                  {action.buttonLabel}
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Document Footer */}
      <DocumentFooter docRef="SET-1001-07" pageNumber="1 OF 1" />
    </div>
  );
}
