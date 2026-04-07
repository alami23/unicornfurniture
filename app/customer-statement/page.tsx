'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  FileText, 
  Download, 
  Printer, 
  Calendar,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function CustomerStatementPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [statements, setStatements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('id, name, phone').order('name');
    setCustomers(data || []);
  };

  const fetchStatements = useCallback(async () => {
    setLoading(true);
    
    // Fetch Invoices
    let invoiceQuery = supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', selectedCustomerId)
      .order('created_at', { ascending: false });

    if (dateRange.start) invoiceQuery = invoiceQuery.gte('created_at', dateRange.start);
    if (dateRange.end) invoiceQuery = invoiceQuery.lte('created_at', dateRange.end);

    const { data: invoices } = await invoiceQuery;

    // Fetch Transactions (Payments)
    // Note: This assumes transactions are linked to customers via description or a customer_id field if added later
    // For now, we'll just show invoices as the primary statement data
    
    const combined = (invoices || []).map(inv => ({
      id: inv.id,
      date: inv.created_at,
      type: 'Invoice',
      reference: inv.invoice_number,
      amount: inv.total_amount,
      paid: inv.amount_paid,
      balance: inv.total_amount - inv.amount_paid,
      status: inv.status
    }));

    setStatements(combined);
    setLoading(false);
  }, [selectedCustomerId, dateRange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchStatements();
    }
  }, [selectedCustomerId, dateRange, fetchStatements]);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Statement</h1>
          <p className="text-slate-500 font-medium">View detailed transaction history for your customers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <User className="w-3 h-3" />
              Select Customer
            </label>
            <select 
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Choose a customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Start Date
            </label>
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              End Date
            </label>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
            />
          </div>
        </div>
      </div>

      {selectedCustomerId ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Statement Header */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">{selectedCustomer?.name}</h2>
                <p className="text-sm text-slate-500 font-medium">{selectedCustomer?.phone}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Invoiced</p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(statements.reduce((acc, curr) => acc + curr.amount, 0))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(statements.reduce((acc, curr) => acc + curr.paid, 0))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Due</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(statements.reduce((acc, curr) => acc + curr.balance, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statement Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Paid</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Balance</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-12 text-center text-slate-500 font-medium">Loading statement...</td>
                  </tr>
                ) : statements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-12 text-center text-slate-500 font-medium">No transactions found for this period.</td>
                  </tr>
                ) : (
                  statements.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 text-sm font-medium text-slate-600">
                        {format(new Date(item.date), 'dd MMM, yyyy')}
                      </td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          item.type === 'Invoice' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {item.type === 'Invoice' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          {item.type}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-900">{item.reference}</td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-900 text-right">{formatCurrency(item.amount)}</td>
                      <td className="px-8 py-4 text-sm font-bold text-emerald-600 text-right">{formatCurrency(item.paid)}</td>
                      <td className="px-8 py-4 text-sm font-bold text-red-600 text-right">{formatCurrency(item.balance)}</td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                          item.status === 'paid' ? "bg-emerald-100 text-emerald-700" : 
                          item.status === 'partial' ? "bg-amber-100 text-amber-700" : 
                          "bg-red-100 text-red-700"
                        )}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
          <User className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="font-bold text-slate-900 mb-2">No Customer Selected</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">Please select a customer from the dropdown above to view their detailed statement.</p>
        </div>
      )}
    </div>
  );
}
