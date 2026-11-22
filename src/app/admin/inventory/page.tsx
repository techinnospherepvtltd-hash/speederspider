'use client';

import React, { useState } from 'react';
import { InventoryItem, InventoryTransaction } from '@/types';
import { INITIAL_INVENTORY, INITIAL_CATEGORIES } from '@/lib/data/mock-data';
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
  X
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [categories] = useState(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Transaction Modal State
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [modalType, setModalType] = useState<'stock_in' | 'stock_out' | 'adjustment' | null>(null);
  const [transQuantity, setTransQuantity] = useState<number>(1);
  const [transReason, setTransReason] = useState<string>('');
  const [transError, setTransError] = useState<string>('');

  // Transaction History Log
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([
    {
      id: 'tx-1',
      item_id: 'inv-1',
      transaction_type: 'stock_in',
      quantity_changed: 5,
      resulting_quantity: 12,
      reason: 'Supplier replenishment delivery (Milano Hides)',
      performed_by: 'Staff Workshop',
      created_at: '2026-11-20T10:00:00Z',
    },
    {
      id: 'tx-2',
      item_id: 'inv-2',
      transaction_type: 'stock_out',
      quantity_changed: -2,
      resulting_quantity: 3,
      reason: 'Job: Porsche 911 GT3 Multi-stage Detailing',
      performed_by: 'Detailing Specialist',
      created_at: '2026-11-21T14:30:00Z',
    },
  ]);

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

  const handleExecuteTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !modalType) return;
    setTransError('');

    if (!transReason.trim()) {
      setTransError('A mandatory reason is required for audit compliance.');
      return;
    }

    let newQuantity = activeItem.quantity;
    let qtyDelta = 0;

    if (modalType === 'stock_in') {
      if (transQuantity <= 0) {
        setTransError('Quantity must be greater than zero.');
        return;
      }
      newQuantity += transQuantity;
      qtyDelta = transQuantity;
    } else if (modalType === 'stock_out') {
      if (transQuantity <= 0) {
        setTransError('Quantity must be greater than zero.');
        return;
      }
      if (activeItem.quantity < transQuantity) {
        setTransError(`Insufficient stock! Current stock is ${activeItem.quantity}.`);
        return;
      }
      newQuantity -= transQuantity;
      qtyDelta = -transQuantity;
    } else if (modalType === 'adjustment') {
      if (transQuantity < 0) {
        setTransError('Quantity cannot be negative.');
        return;
      }
      qtyDelta = transQuantity - activeItem.quantity;
      newQuantity = transQuantity;
    }

    // Update item
    setItems((prev) =>
      prev.map((i) => (i.id === activeItem.id ? { ...i, quantity: newQuantity } : i))
    );

    // Record audit transaction
    const newTx: InventoryTransaction = {
      id: 'tx-' + Date.now(),
      item_id: activeItem.id,
      transaction_type: modalType,
      quantity_changed: qtyDelta,
      resulting_quantity: newQuantity,
      reason: transReason,
      performed_by: 'Active Workshop Supervisor',
      created_at: new Date().toISOString(),
    };
    setTransactions([newTx, ...transactions]);

    // Close modal
    setActiveItem(null);
    setModalType(null);
    setTransQuantity(1);
    setTransReason('');
  };

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

        <button
          onClick={() => {
            const newItem: InventoryItem = {
              id: 'inv-' + Date.now(),
              sku: 'NEW-PART-' + Math.floor(Math.random() * 900 + 100),
              name_en: 'New Workshop Consumable',
              name_ar: 'مادة ورشة جديدة',
              category_id: categories[0]?.id,
              quantity: 10,
              min_threshold: 5,
              cost_price: 150.0,
              supplier: 'Direct Supplier',
              storage_location: 'Bay 1',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setItems([...items, newItem]);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan hover:bg-brand-cyan/90 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock SKU</span>
        </button>
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
      <div className="overflow-x-auto rounded-xl border border-brand-steelBlue/40 bg-brand-navy shadow-xl">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-brand-deepNavy/80 text-[11px] font-mono uppercase text-gray-400 border-b border-brand-steelBlue/30">
            <tr>
              <th className="py-3 px-4">SKU / Code</th>
              <th className="py-3 px-4">Item Name (EN)</th>
              <th className="py-3 px-4">Available Stock</th>
              <th className="py-3 px-4">Min. Threshold</th>
              <th className="py-3 px-4">Unit Cost</th>
              <th className="py-3 px-4">Storage Bay</th>
              <th className="py-3 px-4 text-right">Stock Actions</th>
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
                  <td className="py-3 px-4 text-gray-400">{item.storage_location || 'General'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setActiveItem(item);
                          setModalType('stock_in');
                          setTransQuantity(1);
                          setTransReason('Supplier replenishment delivery');
                        }}
                        className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold uppercase text-[10px]"
                        title="Stock In"
                      >
                        + In
                      </button>
                      <button
                        onClick={() => {
                          setActiveItem(item);
                          setModalType('stock_out');
                          setTransQuantity(1);
                          setTransReason('Job allocation');
                        }}
                        className="px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold uppercase text-[10px]"
                        title="Stock Out"
                      >
                        - Out
                      </button>
                      <button
                        onClick={() => {
                          setActiveItem(item);
                          setModalType('adjustment');
                          setTransQuantity(item.quantity);
                          setTransReason('Physical workshop audit recount');
                        }}
                        className="px-2 py-1 rounded bg-brand-deepNavy text-brand-cyan hover:bg-brand-steelBlue/40 font-bold uppercase text-[10px]"
                        title="Adjust"
                      >
                        Adjust
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transaction History Audit Log */}
      <div className="p-6 rounded-2xl bg-brand-navy border border-brand-steelBlue/40 space-y-4">
        <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
          <History className="w-4 h-4 text-brand-cyan" />
          Recent Inventory Transaction Audit Trail
        </h2>

        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-lg bg-brand-deepNavy/80 border border-brand-steelBlue/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
            >
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2 ${
                  tx.transaction_type === 'stock_in'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : tx.transaction_type === 'stock_out'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-brand-cyan/20 text-brand-cyan'
                }`}>
                  {tx.transaction_type} ({tx.quantity_changed > 0 ? `+${tx.quantity_changed}` : tx.quantity_changed})
                </span>
                <span className="text-white font-semibold">{tx.reason}</span>
              </div>
              <div className="text-gray-400 text-[11px]">
                Resulting: <span className="text-brand-warmBeige font-bold">{tx.resulting_quantity} units</span> • {new Date(tx.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Transaction Action Modal */}
      {activeItem && modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
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
                  {modalType === 'adjustment' ? 'Target Absolute Stock' : 'Quantity Units'}
                </label>
                <input
                  type="number"
                  min={modalType === 'adjustment' ? 0 : 1}
                  required
                  value={transQuantity}
                  onChange={(e) => setTransQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white font-mono"
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
                  className="w-full px-3 py-2 bg-brand-deepNavy border border-brand-steelBlue/50 rounded text-sm text-white"
                />
              </div>

              {transError && (
                <p className="text-xs text-red-400 bg-red-900/30 p-2 rounded border border-red-500/40">
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
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-brand-deepNavy bg-brand-cyan rounded hover:bg-brand-cyan/90 transition-colors"
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
