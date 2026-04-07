'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Printer, 
  FileText, 
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: 'paid' | 'unpaid' | 'partial';
  created_at: string;
  type: 'furniture' | 'wood';
  customer: { name: string; phone: string } | null;
  invoice_items?: any[];
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');

  // Modal states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData = (data as any[])?.map(inv => ({
        ...inv,
        customer: Array.isArray(inv.customer) ? inv.customer[0] : inv.customer
      }));

      setInvoices(mappedData || []);
    } catch (error: any) {
      toast.error('Failed to fetch invoices: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      const { data: items, error } = await supabase
        .from('invoice_items')
        .select('*, product:products(name, sku, unit)')
        .eq('invoice_id', invoice.id);
      
      if (error) throw error;
      
      const mappedItems = (items as any[])?.map(item => ({
        ...item,
        product: Array.isArray(item.product) ? item.product[0] : item.product
      }));

      setSelectedInvoice({ ...invoice, invoice_items: mappedItems });
      setIsViewModalOpen(true);
    } catch (error: any) {
      toast.error('Error loading invoice details: ' + error.message);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    setIsProcessing(true);
    try {
      // Note: In a real app, deleting an invoice should revert stock and transactions.
      // For this demo, we'll just delete the invoice and its items.
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceToDelete.id);
      
      if (error) throw error;
      toast.success('Invoice deleted successfully');
      setIsDeleteModalOpen(false);
      fetchInvoices();
    } catch (error: any) {
      toast.error('Error deleting invoice: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         inv.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoice Management</h1>
          <p className="text-slate-500 font-medium">View and manage all sales invoices.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {(['all', 'paid', 'partial', 'unpaid'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all",
                statusFilter === status ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4"><div className="h-10 bg-slate-50 rounded-lg"></div></td>
                  </tr>
                ))
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">No invoices found.</td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{inv.invoice_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{inv.customer?.name || 'Walk-in Customer'}</span>
                        <span className="text-[10px] font-bold text-slate-400">{inv.customer?.phone || 'No Phone'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(inv.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(inv.total_amount)}</p>
                      {inv.due_amount > 0 && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Due: {formatCurrency(inv.due_amount)}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit",
                        inv.status === 'paid' ? "bg-green-50 text-green-600" : (inv.status === 'partial' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600")
                      )}>
                        {inv.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : (inv.status === 'partial' ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />)}
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleViewInvoice(inv)} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg transition-colors"><Printer className="w-4 h-4" /></button>
                        <button onClick={() => { setInvoiceToDelete(inv); setIsDeleteModalOpen(true); }} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Invoice Details: ${selectedInvoice?.invoice_number}`}
        size="lg"
        footer={<button onClick={() => setIsViewModalOpen(false)} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">Close</button>}
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Details</label>
                  <p className="text-sm font-bold text-slate-900">{selectedInvoice.customer?.name}</p>
                  <p className="text-xs text-slate-500">{selectedInvoice.customer?.phone}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoice Date</label>
                  <p className="text-sm font-bold text-slate-900">{new Date(selectedInvoice.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <p className={cn("text-sm font-bold capitalize", selectedInvoice.status === 'paid' ? "text-green-600" : "text-red-600")}>{selectedInvoice.status}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Type</label>
                  <p className="text-sm font-bold text-slate-900 uppercase">{selectedInvoice.type}</p>
                </div>
              </div>
            </div>

            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">Qty</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Price</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.invoice_items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-900">{item.product?.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{item.product?.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-600 text-center">{item.quantity} {item.product?.unit}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-600 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedInvoice.total_amount / 1.05)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>VAT (5%)</span>
                  <span>{formatCurrency(selectedInvoice.total_amount - (selectedInvoice.total_amount / 1.05))}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span>{formatCurrency(selectedInvoice.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-green-600">
                  <span>Paid</span>
                  <span>{formatCurrency(selectedInvoice.paid_amount)}</span>
                </div>
                {selectedInvoice.due_amount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-red-600">
                    <span>Due</span>
                    <span>{formatCurrency(selectedInvoice.due_amount)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Invoice"
        size="sm"
        footer={
          <>
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleDeleteInvoice} disabled={isProcessing} className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">
              {isProcessing ? 'Deleting...' : 'Delete Invoice'}
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center"><Trash2 className="w-8 h-8" /></div>
          <div>
            <p className="text-slate-900 font-bold">Are you sure?</p>
            <p className="text-sm text-slate-500 mt-1">This will permanently delete invoice <span className="font-bold text-slate-900">{invoiceToDelete?.invoice_number}</span>. Stock and balances will NOT be automatically reverted in this version.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
