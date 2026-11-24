'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  UserMinus,
  UserPlus,
  Plus,
  Edit2,
  Trash2,
  Download,
  Filter,
  Search,
  Calendar,
  CreditCard,
  Building2,
  Banknote,
  MoreHorizontal,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Tag,
  FileText,
  DollarSign,
  PieChart,
} from 'lucide-react';
import {
  PaymentItem,
  PaymentTransactionType,
  PaymentMethod,
  PaymentDateFilterPreset,
  PaymentSummary,
} from '@/types';

// Preset Category lists per Transaction Type
const CATEGORY_PRESETS: Record<PaymentTransactionType, string[]> = {
  INCOME: [
    'Customer Payment',
    'Service Payment',
    'Product Sale',
    'Consulting / Inspection',
    'Other',
  ],
  EXPENSE: [
    'Inventory Purchases',
    'Workshop Rent',
    'Utilities & Electricity',
    'Equipment & Tools',
    'Marketing & Ads',
    'Staff & Salaries',
    'Maintenance & Repairs',
    'Fuel & Transport',
    'Office & Shop Supplies',
    'Other',
  ],
  OWNER_WITHDRAWAL: [
    'Personal Withdrawal',
    'Owner Drawings',
    'Profit Share',
    'Other',
  ],
  OWNER_CONTRIBUTION: [
    'Initial Capital',
    'Additional Investment',
    'Emergency Funding',
    'Short-Term Loan',
    'Other',
  ],
};

interface TransactionFormData {
  id?: string;
  transaction_date: string;
  transaction_type: PaymentTransactionType;
  amount: string; // string for input handling
  category_preset: string;
  custom_category: string;
  description: string;
  payment_method: PaymentMethod;
  reference_number: string;
}

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const defaultFormData: TransactionFormData = {
  transaction_date: getTodayDateString(),
  transaction_type: 'EXPENSE',
  amount: '',
  category_preset: 'Inventory Purchases',
  custom_category: '',
  description: '',
  payment_method: 'CASH',
  reference_number: '',
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters State
  const [datePreset, setDatePreset] = useState<PaymentDateFilterPreset>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [typeFilter, setTypeFilter] = useState<PaymentTransactionType | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>(defaultFormData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch Payments Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
      params.set('datePreset', datePreset);
      if (datePreset === 'custom') {
        if (customStart) params.set('startDate', customStart);
        if (customEnd) params.set('endDate', customEnd);
      }
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/payments?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch financial records');
      }

      setPayments(data.payments || []);
      setSummary(data.summary || null);
    } catch (err: any) {
      console.error('Fetch payments error:', err);
      setError(err.message || 'Error loading financial tracker data');
    } finally {
      setLoading(false);
    }
  }, [datePreset, customStart, customEnd, typeFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Unique categories list for the dropdown filter
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    payments.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [payments]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      ...defaultFormData,
      transaction_date: getTodayDateString(),
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: PaymentItem) => {
    setIsEditing(true);
    const presets = CATEGORY_PRESETS[item.transaction_type];
    const isPreset = presets.includes(item.category);

    setFormData({
      id: item.id,
      transaction_date: item.transaction_date,
      transaction_type: item.transaction_type,
      amount: item.amount.toString(),
      category_preset: isPreset ? item.category : 'Other',
      custom_category: isPreset ? '' : item.category,
      description: item.description || '',
      payment_method: item.payment_method,
      reference_number: item.reference_number || '',
    });
    setIsModalOpen(true);
  };

  // Save Transaction (Create / Update)
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    const resolvedCategory =
      formData.category_preset === 'Other'
        ? formData.custom_category.trim()
        : formData.category_preset.trim();

    if (!resolvedCategory) {
      setError('Please specify a valid category');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        transaction_date: formData.transaction_date,
        transaction_type: formData.transaction_type,
        amount: amt,
        category: resolvedCategory,
        description: formData.description.trim() || null,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number.trim() || null,
      };

      let res: Response;
      if (isEditing && formData.id) {
        res = await fetch('/api/payments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: formData.id, ...payload }),
        });
      } else {
        res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (data.errors ? data.errors[0]?.message : 'Failed to save transaction'));
      }

      setSuccessMsg(isEditing ? 'Transaction updated successfully!' : 'Transaction recorded successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the transaction');
    } finally {
      setSaving(false);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/payments?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete transaction');
      }

      setSuccessMsg('Transaction deleted successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
      setDeleteConfirmId(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Error deleting transaction');
    }
  };

  // Export Filtered Transactions to CSV
  const handleExportCSV = () => {
    if (payments.length === 0) {
      alert('No transactions available to export in the current view.');
      return;
    }

    const headers = [
      'ID',
      'Transaction Date',
      'Type',
      'Category',
      'Amount (AED)',
      'Payment Method',
      'Reference Number',
      'Description',
      'Recorded By',
      'Created At',
    ];

    const rows = payments.map((p) => [
      `"${p.id}"`,
      `"${p.transaction_date}"`,
      `"${p.transaction_type}"`,
      `"${p.category.replace(/"/g, '""')}"`,
      p.amount.toFixed(2),
      `"${p.payment_method}"`,
      `"${(p.reference_number || '').replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      `"${(p.creator_name || '').replace(/"/g, '""')}"`,
      `"${p.created_at}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `speeder-spider-transactions-${getTodayDateString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helpers for Type Styling
  const getTypeBadge = (type: PaymentTransactionType) => {
    switch (type) {
      case 'INCOME':
        return {
          label: 'Income',
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          icon: ArrowDownLeft,
          prefix: '+',
          color: 'text-emerald-400',
        };
      case 'EXPENSE':
        return {
          label: 'Expense',
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          icon: ArrowUpRight,
          prefix: '-',
          color: 'text-rose-400',
        };
      case 'OWNER_WITHDRAWAL':
        return {
          label: 'Owner Withdrawal',
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          icon: UserMinus,
          prefix: '-',
          color: 'text-amber-400',
        };
      case 'OWNER_CONTRIBUTION':
        return {
          label: 'Owner Contribution',
          bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
          icon: UserPlus,
          prefix: '+',
          color: 'text-cyan-400',
        };
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="w-3.5 h-3.5 text-emerald-400" />;
      case 'CARD':
        return <CreditCard className="w-3.5 h-3.5 text-brand-cyan" />;
      case 'BANK_TRANSFER':
        return <Building2 className="w-3.5 h-3.5 text-blue-400" />;
      case 'OTHER':
        return <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-steelBlue/30 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan shadow-[0_0_15px_rgba(91,192,222,0.15)]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide font-display">
                Business Money & Payment Tracker
              </h1>
              <p className="text-sm text-gray-400">
                Simple manual tracking for business cash flow, owner investments, and operating expenses (AED).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-lg bg-brand-navy border border-brand-steelBlue/40 text-gray-300 hover:text-white hover:border-brand-cyan/50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-cyan' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-navy border border-brand-steelBlue/40 text-gray-200 hover:text-white hover:border-brand-steelBlue transition-all text-sm font-medium shadow-sm"
            title="Download CSV of current transactions"
          >
            <Download className="w-4 h-4 text-brand-cyan" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-600 text-brand-deepNavy font-semibold text-sm transition-all shadow-[0_0_20px_rgba(91,192,222,0.3)] hover:shadow-[0_0_25px_rgba(91,192,222,0.5)] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between gap-3 animate-fade-in shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Date Filter Presets */}
      <div className="bg-brand-navy/60 p-4 rounded-2xl border border-brand-steelBlue/30 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-brand-cyan" />
            <span>Reporting Period:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'this_week', label: 'This Week' },
                { id: 'this_month', label: 'This Month' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'custom', label: 'Custom Range' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                onClick={() => setDatePreset(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  datePreset === preset.id
                    ? 'bg-brand-cyan text-brand-deepNavy font-bold shadow-[0_0_12px_rgba(91,192,222,0.35)]'
                    : 'bg-brand-deepNavy/80 text-gray-300 hover:text-white hover:bg-brand-steelBlue/30 border border-brand-steelBlue/30'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Inputs if "custom" is active */}
        {datePreset === 'custom' && (
          <div className="pt-3 border-t border-brand-steelBlue/20 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">From:</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-brand-deepNavy border border-brand-steelBlue/50 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-brand-cyan"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">To:</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-brand-deepNavy border border-brand-steelBlue/50 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-brand-cyan"
              />
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 rounded-lg bg-brand-steelBlue/40 hover:bg-brand-steelBlue text-xs text-white font-medium transition-colors"
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>

      {/* 6 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Income */}
        <div className="bg-brand-navy p-5 rounded-2xl border border-brand-steelBlue/30 relative overflow-hidden shadow-sm hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              1. Total Income
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            AED {summary ? summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Money entering the business from clients & services.
          </p>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="bg-brand-navy p-5 rounded-2xl border border-brand-steelBlue/30 relative overflow-hidden shadow-sm hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              2. Total Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            AED {summary ? summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Inventory, workshop rent, salaries, utilities, and marketing.
          </p>
        </div>

        {/* Card 3: Total Owner Withdrawals */}
        <div className="bg-brand-navy p-5 rounded-2xl border border-brand-steelBlue/30 relative overflow-hidden shadow-sm hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              3. Owner Withdrawals
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserMinus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            AED {summary ? summary.totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Funds personally taken out of the business by the owner.
          </p>
        </div>

        {/* Card 4: Total Owner Contributions */}
        <div className="bg-brand-navy p-5 rounded-2xl border border-brand-steelBlue/30 relative overflow-hidden shadow-sm hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              4. Owner Contributions
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-brand-cyan">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            AED {summary ? summary.totalContributions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Personal capital invested or injected into the business.
          </p>
        </div>

        {/* Card 5: Net Operating Cash Flow */}
        <div
          className={`p-5 rounded-2xl border relative overflow-hidden shadow-sm transition-colors ${
            (summary?.netOperatingCashFlow ?? 0) >= 0
              ? 'bg-brand-navy border-emerald-500/30 hover:border-emerald-500/50'
              : 'bg-brand-navy border-rose-500/30 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                5. Net Operating Cash Flow
              </span>
              <span className="block text-[10px] text-gray-500 font-mono mt-0.5">
                (Income - Expenses)
              </span>
            </div>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                (summary?.netOperatingCashFlow ?? 0) >= 0
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {(summary?.netOperatingCashFlow ?? 0) >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <div
            className={`text-2xl font-bold font-mono ${
              (summary?.netOperatingCashFlow ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {(summary?.netOperatingCashFlow ?? 0) >= 0 ? '+' : ''}AED{' '}
            {summary
              ? summary.netOperatingCashFlow.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '0.00'}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Pure operational profitability before owner drawings/capital.
          </p>
        </div>

        {/* Card 6: Net Cash Movement */}
        <div
          className={`p-5 rounded-2xl border relative overflow-hidden shadow-sm transition-colors ${
            (summary?.netCashMovement ?? 0) >= 0
              ? 'bg-brand-navy border-brand-cyan/40 hover:border-brand-cyan shadow-[0_0_15px_rgba(91,192,222,0.1)]'
              : 'bg-brand-navy border-rose-500/30 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                6. Net Cash Movement
              </span>
              <span className="block text-[10px] text-gray-500 font-mono mt-0.5">
                (Income + Invested - Spent - Withdrawn)
              </span>
            </div>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                (summary?.netCashMovement ?? 0) >= 0
                  ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-bold font-mono ${
              (summary?.netCashMovement ?? 0) >= 0 ? 'text-brand-cyan' : 'text-rose-400'
            }`}
          >
            {(summary?.netCashMovement ?? 0) >= 0 ? '+' : ''}AED{' '}
            {summary
              ? summary.netCashMovement.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '0.00'}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Total actual net change in cash reserves for this period.
          </p>
        </div>
      </div>

      {/* Spending Breakdown & Monthly Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="bg-brand-navy p-6 rounded-2xl border border-brand-steelBlue/30">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <PieChart className="w-5 h-5 text-rose-400" />
              <h3 className="font-semibold text-white text-base">
                Where is the money being spent?
              </h3>
            </div>
            <span className="text-xs text-gray-400">
              Total Expenses: AED {summary?.totalExpenses.toFixed(2) || '0.00'}
            </span>
          </div>

          {!summary || summary.spendingByCategory.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              No expenses recorded for this reporting period.
            </div>
          ) : (
            <div className="space-y-4">
              {summary.spendingByCategory.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-200">{cat.category}</span>
                    <span className="font-mono text-gray-300">
                      AED {cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                      <span className="text-gray-500">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-brand-deepNavy overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Income Sources Breakdown */}
        <div className="bg-brand-navy p-6 rounded-2xl border border-brand-steelBlue/30">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white text-base">
                Income Sources Breakdown
              </h3>
            </div>
            <span className="text-xs text-gray-400">
              Total Income: AED {summary?.totalIncome.toFixed(2) || '0.00'}
            </span>
          </div>

          {!summary || summary.incomeByCategory.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              No income recorded for this reporting period.
            </div>
          ) : (
            <div className="space-y-4">
              {summary.incomeByCategory.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-200">{cat.category}</span>
                    <span className="font-mono text-gray-300">
                      AED {cat.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                      <span className="text-gray-500">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-brand-deepNavy overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Records Table Section */}
      <div className="bg-brand-navy rounded-2xl border border-brand-steelBlue/30 overflow-hidden shadow-sm">
        {/* Table Filters Bar */}
        <div className="p-5 border-b border-brand-steelBlue/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {(
              [
                { id: 'ALL', label: 'All Transactions' },
                { id: 'INCOME', label: 'Income' },
                { id: 'EXPENSE', label: 'Expenses' },
                { id: 'OWNER_WITHDRAWAL', label: 'Withdrawals' },
                { id: 'OWNER_CONTRIBUTION', label: 'Contributions' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  typeFilter === tab.id
                    ? 'bg-brand-steelBlue text-white font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-brand-steelBlue/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-3">
            {allCategories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-brand-deepNavy border border-brand-steelBlue/40 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-cyan"
              >
                <option value="ALL">All Categories</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes or reference..."
                className="bg-brand-deepNavy border border-brand-steelBlue/40 text-gray-200 text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-brand-cyan w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-deepNavy/80 text-gray-400 uppercase tracking-wider text-[11px] border-b border-brand-steelBlue/20">
              <tr>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Description / Notes</th>
                <th className="py-3 px-4 font-semibold">Method</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-steelBlue/20">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-cyan mb-2" />
                    <span>Loading transactions...</span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-brand-deepNavy border border-brand-steelBlue/40 flex items-center justify-center mx-auto text-gray-400">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <h4 className="text-white font-medium">No transactions recorded yet</h4>
                      <p className="text-xs text-gray-400">
                        Record your first income, expense, or owner contribution using the button below.
                      </p>
                      <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-cyan text-brand-deepNavy font-semibold text-xs hover:bg-cyan-400 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Record First Transaction</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((item) => {
                  const badge = getTypeBadge(item.transaction_type);
                  const Icon = badge.icon;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-brand-steelBlue/10 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-gray-300">
                        {item.transaction_date}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-white">{item.category}</span>
                      </td>

                      {/* Description & Reference */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-gray-300 truncate">
                          {item.description || <span className="text-gray-600">—</span>}
                        </div>
                        {item.reference_number && (
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            Ref: {item.reference_number}
                          </div>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          {getMethodIcon(item.payment_method)}
                          <span className="capitalize">{item.payment_method.toLowerCase().replace('_', ' ')}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-sm">
                        <span className={badge.color}>
                          {badge.prefix}AED{' '}
                          {item.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-cyan hover:bg-brand-steelBlue/20 transition-colors"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-navy border border-brand-steelBlue/50 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-brand-navy p-5 border-b border-brand-steelBlue/30 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                  <Wallet className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-white">
                  {isEditing ? 'Edit Transaction' : 'Record Business Transaction'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-5">
              {/* Transaction Type Radio Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Transaction Type <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        type: 'INCOME',
                        label: 'Income',
                        sub: 'Money in from sales/services',
                        color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
                      },
                      {
                        type: 'EXPENSE',
                        label: 'Expense',
                        sub: 'Rent, stock, utilities, ads',
                        color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
                      },
                      {
                        type: 'OWNER_WITHDRAWAL',
                        label: 'Owner Withdrawal',
                        sub: 'Personal money taken out',
                        color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
                      },
                      {
                        type: 'OWNER_CONTRIBUTION',
                        label: 'Owner Contribution',
                        sub: 'Capital/investment put in',
                        color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      type="button"
                      key={opt.type}
                      onClick={() => {
                        const newPresets = CATEGORY_PRESETS[opt.type];
                        setFormData({
                          ...formData,
                          transaction_type: opt.type,
                          category_preset: newPresets[0],
                          custom_category: '',
                        });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.transaction_type === opt.type
                          ? `${opt.color} ring-2 ring-brand-cyan/40`
                          : 'bg-brand-deepNavy/60 border-brand-steelBlue/30 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">{opt.label}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Amount (AED) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-mono font-bold">
                      AED
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full bg-brand-deepNavy border border-brand-steelBlue/50 rounded-xl pl-12 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                    className="w-full bg-brand-deepNavy border border-brand-steelBlue/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.category_preset}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category_preset: e.target.value,
                      custom_category: e.target.value === 'Other' ? formData.custom_category : '',
                    })
                  }
                  className="w-full bg-brand-deepNavy border border-brand-steelBlue/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-cyan"
                >
                  {CATEGORY_PRESETS[formData.transaction_type].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Custom Category Input if "Other" is chosen */}
                {formData.category_preset === 'Other' && (
                  <div className="mt-2.5 animate-fade-in">
                    <input
                      type="text"
                      required
                      placeholder="Type custom category name..."
                      value={formData.custom_category}
                      onChange={(e) => setFormData({ ...formData, custom_category: e.target.value })}
                      className="w-full bg-brand-deepNavy border border-brand-cyan/50 rounded-xl px-4 py-2 text-white text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Payment Method & Reference Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_method: e.target.value as PaymentMethod,
                      })
                    }
                    className="w-full bg-brand-deepNavy border border-brand-steelBlue/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="CASH">Cash (نقد)</option>
                    <option value="BANK_TRANSFER">Bank Transfer (تحويل بنكي)</option>
                    <option value="CARD">Card / POS (بطاقة)</option>
                    <option value="OTHER">Other (أخرى)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Reference / Receipt # (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-1049, TRX-883"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    className="w-full bg-brand-deepNavy border border-brand-steelBlue/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context or supplier/customer details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-brand-deepNavy border border-brand-steelBlue/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-cyan resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-brand-steelBlue/30 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-brand-steelBlue/30 hover:bg-brand-steelBlue/50 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-cyan text-brand-deepNavy font-semibold text-sm hover:bg-cyan-400 transition-colors shadow-lg disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isEditing ? 'Save Changes' : 'Record Transaction'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-navy border border-brand-steelBlue/50 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Transaction?</h3>
              <p className="text-xs text-gray-400">
                Are you sure you want to permanently delete this financial record? This will alter historical cash flow totals.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-brand-steelBlue/30 hover:bg-brand-steelBlue/50 text-gray-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTransaction(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-colors shadow-lg"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
