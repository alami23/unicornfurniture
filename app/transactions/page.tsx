'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  MoreVertical, 
  Download,
  Plus,
  Trash2,
  Save,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  payment_method: string;
  description: string;
  reference_id: string;
  created_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'expense',
    amount: 0,
    payment_method: 'cash',
    category: 'General'
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch transactions: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = () => {
    setFormData({
      type: 'expense',
      amount: 0,
      payment_method: 'cash',
      category: 'General'
    });
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([formData]);
      if (error) throw error;
      toast.success('Transaction recorded successfully');
      setIsModalOpen(false);
      fetchTransactions();
    } catch (error: any) {
      toast.error('Error saving transaction: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionToDelete.id);
      if (error) throw error;
      toast.success('Transaction deleted successfully');
      setIsDeleteModalOpen(false);
      fetchTransactions();
    } catch (error: any) {
      toast.error('Error deleting transaction: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaction Ledger</h1>
          <p className="text-slate-500 font-medium">Track every single income and expense entry.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Income</p>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalIncome)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expense</p>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalExpense)}</h3>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-white/10 text-white rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Balance</p>
          </div>
          <h3 className="text-2xl font-bold text-white">{formatCurrency(totalIncome - totalExpense)}</h3>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by description or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4"><div className="h-10 bg-slate-50 rounded-lg"></div></td>
                  </tr>
                ))
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">No transactions found.</td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(t.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{t.description || 'No description'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.reference_id || 'DIRECT'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-600 capitalize">{t.payment_method}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "flex items-center gap-1.5 font-bold text-sm",
                        t.type === 'income' ? "text-green-600" : "text-red-600"
                      )}>
                        {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        {formatCurrency(t.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setTransactionToDelete(t); setIsDeleteModalOpen(true); }}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Transaction"
        size="md"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleSaveTransaction} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
              {isSaving ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4" />
                  Save Transaction
                </>
              )}
            </button>
          </>
        }
      >
        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Type</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['income', 'expense'] as const).map((type) => (
                <button key={type} type="button" onClick={() => setFormData({ ...formData, type })} className={cn("flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all", formData.type === type ? (type === 'income' ? "bg-green-600 text-white shadow-sm" : "bg-red-600 text-white shadow-sm") : "text-slate-500")}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (BDT)</label>
              <input type="number" required value={formData.amount || 0} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</label>
              <select value={formData.payment_method || 'cash'} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bkash">bKash</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
            <input type="text" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Rent, Salary, Raw Material" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} placeholder="Enter details about this transaction" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Transaction"
        size="sm"
        footer={
          <>
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleDeleteTransaction} disabled={isSaving} className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">
              {isSaving ? 'Deleting...' : 'Delete Transaction'}
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center"><Trash2 className="w-8 h-8" /></div>
          <div>
            <p className="text-slate-900 font-bold">Are you sure?</p>
            <p className="text-sm text-slate-500 mt-1">This will remove the transaction record. This action cannot be undone.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
