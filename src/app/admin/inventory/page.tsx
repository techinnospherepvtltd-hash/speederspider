'use client';

import React, { useState, useEffect } from 'react';
import { InventoryItem, InventoryCategory, InventoryTransaction } from '@/types';
import { formatCurrencyAED } from '@/lib/utils';
import {
  Boxes,
  Plus,
  Minus,
  Sliders,
  AlertTriangle,
  Search,
  Filter,
  History,
  CheckCircle2,
  X,
  Edit,
  Trash2,
  Loader2,
  PackagePlus,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<InventoryItem | null>(null);

  // New Item Form State
  const initialFormState = {
    name_en: '',
    name_ar: '',
    sku: '',
    category_id: '',
    description: '',
    quantity: 0,
    min_threshold: 5,
    cost_price: 0,
    supplier: '',
    storage_location: '',
    status: 'active' as 'active' | 'discontinued' | 'archived',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transaction Modal State
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [modalType, setModalType] = useState<'stock_in' | 'stock_out' | 'adjustment' | null>(null);
  const [transQuantity, setTransQuantity] = useState<number>(1);
  const [transReason, setTransReason] = useState<string>('');
  const [transError, setTransError] = useState<string>('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        setCategories(data.categories || []);
        setTransactions(data.transactions || []);
        if (data.categories?.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: data.categories[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const generateRandomSKU = () => {
    const prefix = 'SS-PRT-';
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${rand}`;
  };

  const handleOpenAddModal = () => {
    setFormData({
      ...initialFormState,
      sku: generateRandomSKU(),
      category_id: categories[0]?.id || '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
          min_threshold: Number(formData.min_threshold),
          cost_price: Number(formData.cost_price),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.errors?.[0]?.message || data.message || 'Failed to add item');
        setIsSubmitting(false);
        return;
      }

      setItems((prev) => [data.item, ...prev]);
      setIsAddModalOpen(false);
      setFormData(initialFormState);
    } catch (err) {
      setFormError('Network error while saving inventory item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingItem,
          quantity: Number(editingItem.quantity),
          min_threshold: Number(editingItem.min_threshold),
          cost_price: Number(editingItem.cost_price),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.message || 'Failed to update item');
        setIsSubmitting(false);
        return;
      }

      setItems((prev) => prev.map((item) => (item.id === data.item.id ? data.item : item)));
      setEditingItem(null);
    } catch (err) {
      setFormError('Network error while updating item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setDeleteConfirmItem(null);
      } else {
        alert(data.message || 'Could not delete item');
      }
    } catch (err) {
      alert('Network error while deleting item');
    }
  };

  const handleExecuteTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !modalType) return;
    setTransError('');

    if (!transReason.trim()) {
      setTransError('A mandatory reason is required for audit compliance.');
      return;
    }

    try {
      const res = await fetch('/api/inventory/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: activeItem.id,
          type: modalType,
          quantity: Number(transQuantity),
          reason: transReason.trim(),
          performedBy: 'Active Workshop Supervisor',
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setTransError(data.message || data.errors?.[0]?.message || 'Transaction failed');
        return;
      }

      // Update state with updated item
      setItems((prev) => prev.map((i) => (i.id === data.item.id ? data.item : i)));

      // Add to local audit list
      const qtyDelta =
        modalType === 'stock_in'
          ? transQuantity
          : modalType === 'stock_out'
          ? -transQuantity
          : transQuantity - activeItem.quantity;

      const newTx: InventoryTransaction = {
        id: 'tx-' + Date.now(),
        item_id: activeItem.id,
        transaction_type: modalType,
        quantity_changed: qtyDelta,
        resulting_quantity: data.item.quantity,
        reason: transReason.trim(),
        performed_by: 'Active Workshop Supervisor',
        created_at: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);

      // Close modal
      setActiveItem(null);
      setModalType(null);
      setTransQuantity(1);
      setTransReason('');
    } catch (err) {
      setTransError('Network error while processing transaction');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name_en.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || item.category_id === selectedCategory;

    const matchesLowStock = !onlyLowStock || item.quantity <= item.min_threshold;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-steelBlue/30">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase font-display flex items-center gap-2">
            <Boxes className="w-6 h-6 text-brand-cyan" />
            Internal Workshop Stock Control
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Private inventory management • Atomic stock-in, stock-out, and audit trails
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            className="p-2 rounded-lg bg-brand-deepNavy border border-brand-steelBlue/50 text-gray-400 hover:text-white transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-cyan' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-colors shadow-[0_0_15px_rgba(91,192,222,0.3)]"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-brand-navy border border-brand-steelBlue/40 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search SKU, item name, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-brand-cyan text-brand-deepNavy font-bold'
                : 'bg-brand-deepNavy text-gray-400 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-brand-cyan text-brand-deepNavy font-bold'
                  : 'bg-brand-deepNavy text-gray-400 hover:text-white'
              }`}
            >
              {c.name_en}
            </button>
          ))}
        </div>

        {/* Low-Stock Quick Filter Toggle */}
        <button
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors shrink-0 ${
            onlyLowStock
              ? 'bg-brand-amber text-brand-deepNavy font-bold shadow-[0_0_12px_rgba(217,119,6,0.5)]'
              : 'bg-brand-deepNavy text-gray-400 border border-brand-steelBlue/40 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Low-Stock Alerts Only</span>
        </button>
      </div>

      {/* Inventory Items Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-cyan" />
          <span className="text-xs font-mono">Loading workshop stock records...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
          <Boxes className="w-12 h-12 text-gray-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-display uppercase">No Inventory Items Found</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              {search || selectedCategory !== 'all' || onlyLowStock
                ? 'No items matched your current filters. Clear filters or search term to see all stock.'
                : 'Your workshop inventory is currently empty. Add real consumables, tints, films, or parts manually to start tracking stock.'}
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-colors"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Add First Inventory Item</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-steelBlue/40 bg-brand-navy shadow-xl">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-brand-deepNavy/80 text-[11px] font-mono uppercase text-gray-400 border-b border-brand-steelBlue/30">
              <tr>
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Item Name (EN / AR)</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Min. Threshold</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Storage Bay</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Stock Adjustment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-steelBlue/20 font-mono">
              {filteredItems.map((item) => {
                const isLowStock = item.quantity <= item.min_threshold;
                return (
                  <tr key={item.id} className="hover:bg-brand-deepNavy/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-brand-cyan">{item.sku}</td>
                    <td className="py-3 px-4 font-sans text-white">
                      <p className="font-semibold">{item.name_en}</p>
                      <p className="text-[11px] text-gray-400 font-arabic">{item.name_ar}</p>
                      <p className="text-[11px] text-gray-500 font-mono">Supplier: {item.supplier || 'N/A'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${
                          isLowStock
                            ? 'bg-brand-amber/20 text-brand-amber border border-brand-amber/40 animate-pulse'
                            : 'bg-brand-deepNavy text-white border border-brand-steelBlue/40'
                        }`}
                      >
                        {item.quantity} units
                        {isLowStock && <AlertTriangle className="w-3 h-3" />}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{item.min_threshold} units</td>
                    <td className="py-3 px-4 text-brand-warmBeige">{formatCurrencyAED(item.cost_price)}</td>
                    <td className="py-3 px-4 text-gray-400">{item.storage_location || 'General Bay'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          item.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : item.status === 'discontinued'
                            ? 'bg-brand-amber/20 text-brand-amber'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveItem(item);
                            setModalType('stock_in');
                            setTransQuantity(1);
                            setTransReason('Supplier replenishment delivery');
                            setTransError('');
                          }}
                          className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold uppercase text-[10px] flex items-center gap-1"
                          title="Stock In (+)"
                        >
                          <ArrowDownRight className="w-3 h-3" />
                          <span>+ In</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveItem(item);
                            setModalType('stock_out');
                            setTransQuantity(1);
                            setTransReason('Workshop job allocation');
                            setTransError('');
                          }}
                          className="px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold uppercase text-[10px] flex items-center gap-1"
                          title="Stock Out (-)"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          <span>- Out</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveItem(item);
                            setModalType('adjustment');
                            setTransQuantity(item.quantity);
                            setTransReason('Physical workshop audit recount');
                            setTransError('');
                          }}
                          className="px-2 py-1 rounded bg-brand-deepNavy text-brand-cyan hover:bg-brand-steelBlue/40 font-bold uppercase text-[10px]"
                          title="Audit Adjustment"
                        >
                          Adjust
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setFormError('');
                          }}
                          className="p-1.5 rounded bg-brand-deepNavy hover:bg-brand-steelBlue/50 text-brand-cyan hover:text-white transition-colors"
                          title="Edit Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem(item)}
                          className="p-1.5 rounded bg-brand-deepNavy hover:bg-red-900/40 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Transaction History Audit Log */}
      <div className="p-6 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
        <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
          <History className="w-4 h-4 text-brand-cyan" />
          Recent Inventory Transaction Audit Trail
        </h2>

        {transactions.length === 0 ? (
          <p className="text-xs text-gray-500 font-mono py-4 text-center">
            No stock transactions recorded yet. Stock additions, deductions, and adjustments will appear here.
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-lg bg-brand-deepNavy/80 border border-brand-steelBlue/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
              >
                <div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2 ${
                      tx.transaction_type === 'stock_in'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : tx.transaction_type === 'stock_out'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-brand-cyan/20 text-brand-cyan'
                    }`}
                  >
                    {tx.transaction_type} ({tx.quantity_changed > 0 ? `+${tx.quantity_changed}` : tx.quantity_changed})
                  </span>
                  <span className="text-white font-semibold">{tx.reason}</span>
                </div>
                <div className="text-gray-400 text-[11px]">
                  Resulting: <span className="text-brand-warmBeige font-bold">{tx.resulting_quantity} units</span> •{' '}
                  {new Date(tx.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1. ADD INVENTORY ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-brand-navy border border-brand-steelBlue rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-steelBlue/30">
              <h2 className="text-lg font-bold text-white font-display uppercase flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-brand-cyan" />
                Add New Inventory Item
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Item Name (English) <span className="text-brand-cyan">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ceramic Pro 9H Coating (50ml)"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Item Name (Arabic) <span className="text-brand-cyan">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    placeholder="مثال: طلاء سيراميك نانو 9H"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white focus:outline-none focus:border-brand-cyan text-right font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    SKU / Part Code <span className="text-brand-cyan">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. SS-PRT-4091"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sku: generateRandomSKU() })}
                      className="px-2.5 py-2 text-xs font-mono bg-brand-steelBlue/40 text-brand-cyan hover:text-white rounded shrink-0"
                      title="Generate New SKU"
                    >
                      Gen
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Category <span className="text-brand-cyan">*</span>
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white focus:outline-none focus:border-brand-cyan"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_en} ({c.name_ar})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Initial Quantity <span className="text-brand-cyan">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Min Threshold Alert <span className="text-brand-cyan">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.min_threshold}
                    onChange={(e) => setFormData({ ...formData, min_threshold: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                    Unit Cost (AED) <span className="text-brand-cyan">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Supplier / Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Chemical Guys / 3M Authorized"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Workshop Storage Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bay 2 Detailing Rack A"
                    value={formData.storage_location}
                    onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Technical specifications or storage instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {formError && (
                <div className="p-3 rounded bg-red-900/30 border border-red-500/50 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-steelBlue/30">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono uppercase text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan rounded-lg hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add Item to Inventory</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT INVENTORY ITEM MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-brand-navy border border-brand-steelBlue rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-brand-steelBlue/30">
              <h2 className="text-lg font-bold text-white font-display uppercase flex items-center gap-2">
                <Edit className="w-5 h-5 text-brand-cyan" />
                Edit Item: {editingItem.name_en}
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Item Name (EN)</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name_en}
                    onChange={(e) => setEditingItem({ ...editingItem, name_en: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Item Name (AR)</label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={editingItem.name_ar}
                    onChange={(e) => setEditingItem({ ...editingItem, name_ar: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white text-right font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={editingItem.sku}
                    onChange={(e) => setEditingItem({ ...editingItem, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Category</label>
                  <select
                    value={editingItem.category_id || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white"
                  >
                    <option value="active">Active</option>
                    <option value="discontinued">Discontinued</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Min Threshold Alert</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingItem.min_threshold}
                    onChange={(e) => setEditingItem({ ...editingItem, min_threshold: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Unit Cost (AED)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingItem.cost_price}
                    onChange={(e) => setEditingItem({ ...editingItem, cost_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={editingItem.supplier || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-300 mb-1">Storage Bay</label>
                  <input
                    type="text"
                    value={editingItem.storage_location || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, storage_location: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-xs text-white"
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded bg-red-900/30 border border-red-500/50 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-steelBlue/30">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-mono uppercase text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan rounded-lg hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Item</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-brand-navy border border-red-500/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-base font-bold uppercase font-display text-white">Confirm Item Deletion</h2>
            </div>
            <p className="text-xs text-gray-300">
              Are you sure you want to remove <span className="text-white font-bold">{deleteConfirmItem.name_en}</span> ({deleteConfirmItem.sku}) from workshop inventory?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-steelBlue/30">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 text-xs font-mono uppercase text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(deleteConfirmItem.id)}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. STOCK TRANSACTION ACTION MODAL */}
      {activeItem && modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-brand-navy border border-brand-steelBlue rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-steelBlue/30">
              <h2 className="text-base font-bold text-white font-display uppercase">
                {modalType === 'stock_in'
                  ? 'Record Stock In (+)'
                  : modalType === 'stock_out'
                  ? 'Record Stock Out (-)'
                  : 'Manual Stock Audit Adjustment'}
              </h2>
              <button
                onClick={() => {
                  setActiveItem(null);
                  setModalType(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-brand-deepNavy rounded-lg text-xs space-y-1 font-mono">
              <p className="font-bold text-white">{activeItem.name_en}</p>
              <p className="text-gray-400">SKU: {activeItem.sku} • Current Stock: {activeItem.quantity} units</p>
            </div>

            <form onSubmit={handleExecuteTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                  {modalType === 'adjustment' ? 'Target Absolute Stock Units' : 'Quantity Units'}
                </label>
                <input
                  type="number"
                  min={modalType === 'adjustment' ? 0 : 1}
                  required
                  value={transQuantity}
                  onChange={(e) => setTransQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-300 mb-1">
                  Mandatory Audit Reason <span className="text-brand-cyan">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Job #8821 Mercedes G63 or physical count"
                  value={transReason}
                  onChange={(e) => setTransReason(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {transError && (
                <p className="text-xs text-red-400 bg-red-900/30 p-2.5 rounded border border-red-500/40 font-mono">
                  {transError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-steelBlue/30">
                <button
                  type="button"
                  onClick={() => {
                    setActiveItem(null);
                    setModalType(null);
                  }}
                  className="px-4 py-2 text-xs font-mono uppercase text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan rounded hover:bg-brand-cyan/90 transition-colors shadow-[0_0_15px_rgba(91,192,222,0.3)]"
                >
                  Confirm & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
