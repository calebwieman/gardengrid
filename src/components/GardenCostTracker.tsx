'use client';

import { useState, useEffect } from 'react';

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: 'seeds' | 'soil' | 'plants' | 'tools' | 'fertilizer' | 'mulch' | 'irrigation' | 'other';
  date: string;
  notes?: string;
  quantity?: number;
}

const categoryIcons: Record<Expense['category'], string> = {
  seeds: '🌱',
  soil: '🪴',
  plants: '🌿',
  tools: '🔧',
  fertilizer: '🧪',
  mulch: '🍂',
  irrigation: '💧',
  other: '📦',
};

const categoryLabels: Record<Expense['category'], string> = {
  seeds: 'Seeds & Bulbs',
  soil: 'Soil & Compost',
  plants: 'Nursery Plants',
  tools: 'Tools & Equipment',
  fertilizer: 'Fertilizers',
  mulch: 'Mulch & Straw',
  irrigation: 'Irrigation',
  other: 'Other',
};

interface GardenCostTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GardenCostTracker({ isOpen, onClose }: GardenCostTrackerProps) {
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<Expense['category'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'seeds' as Expense['category'],
    date: new Date().toISOString().split('T')[0],
    notes: '',
    quantity: '',
  });

  // Load expenses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('garden-expenses');
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load expenses:', e);
      }
    }
  }, []);

  // Save expenses to localStorage
  useEffect(() => {
    localStorage.setItem('garden-expenses', JSON.stringify(expenses));
  }, [expenses]);

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      category: 'seeds',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      quantity: '',
    });
    setShowAddForm(false);
    setEditingExpense(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount) return;

    const newExpense: Expense = {
      id: editingExpense?.id || Date.now().toString(),
      name: formData.name,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      notes: formData.notes || undefined,
      quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
    };

    if (editingExpense) {
      setExpenses(prev => prev.map(exp => exp.id === editingExpense.id ? newExpense : exp));
    } else {
      setExpenses(prev => [...prev, newExpense]);
    }

    resetForm();
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      notes: expense.notes || '',
      quantity: expense.quantity?.toString() || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this expense?')) {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    }
  };

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(exp => filterCategory === 'all' || exp.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'amount') return b.amount - a.amount;
      return a.category.localeCompare(b.category);
    });

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<Expense['category'], number>);

  // Group by month
  const monthlyExpenses = expenses.reduce((acc, exp) => {
    const month = exp.date.substring(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const currentMonth = new Date().toISOString().substring(0, 7);
  const thisMonthTotal = monthlyExpenses[currentMonth] || 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">💰 Garden Cost Tracker</h2>
              <p className="text-green-100 text-sm mt-1">Track your garden spending</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800">
          <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">This Month</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">${thisMonthTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total All Time</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Items Tracked</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{expenses.length}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(categoryLabels) as Expense['category'][]).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filterCategory === cat
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {categoryIcons[cat]} {categoryLabels[cat]}: ${(categoryTotals[cat] || 0).toFixed(2)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Add/Edit Form */}
          {showAddForm ? (
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                {editingExpense ? '✏️ Edit Expense' : '➕ Add New Expense'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="e.g., Tomato Seeds"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as Expense['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    {(Object.keys(categoryLabels) as Expense['category'][]).map(cat => (
                      <option key={cat} value={cat}>{categoryIcons[cat]} {categoryLabels[cat]}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="Optional"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="Optional notes"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {editingExpense ? 'Save Changes' : 'Add Expense'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span> Add New Expense
            </button>
          )}

          {/* Sort */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>

          {/* Expenses List */}
          <div className="space-y-2">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-4xl mb-2">🌱</p>
                <p>No expenses recorded yet</p>
                <p className="text-sm">Start tracking your garden spending!</p>
              </div>
            ) : (
              filteredExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="text-2xl">{categoryIcons[expense.category]}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate">
                        {expense.name}
                      </h4>
                      {expense.quantity && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">
                          ×{expense.quantity}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{categoryLabels[expense.category]}</span>
                      <span>•</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                      {expense.notes && (
                        <>
                          <span>•</span>
                          <span className="truncate">{expense.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      ${expense.amount.toFixed(2)}
                    </p>
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monthly Breakdown Chart */}
        {Object.keys(monthlyExpenses).length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">📊 Monthly Spending</h3>
            <div className="flex items-end gap-1 h-24">
              {Object.entries(monthlyExpenses)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, amount]) => {
                  const maxAmount = Math.max(...Object.values(monthlyExpenses));
                  const height = (amount / maxAmount) * 100;
                  const isCurrentMonth = month === currentMonth;
                  
                  return (
                    <div
                      key={month}
                      className={`flex-1 rounded-t transition-all ${
                        isCurrentMonth ? 'bg-green-500' : 'bg-green-300 dark:bg-green-700'
                      }`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${month}: $${amount.toFixed(2)}`}
                    />
                  );
                })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              {Object.keys(monthlyExpenses).sort().map(month => (
                <span key={month}>{month.slice(5)}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
