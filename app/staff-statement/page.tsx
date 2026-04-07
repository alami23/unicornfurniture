'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  FileText, 
  Download, 
  Printer, 
  Calendar,
  UserSquare2,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Wallet
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function StaffStatementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [statements, setStatements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchStaff = async () => {
    const { data } = await supabase.from('staff').select('id, name, role').order('name');
    setStaff(data || []);
  };

  const fetchStatements = useCallback(async () => {
    setLoading(true);
    
    // Fetch Transactions related to this staff
    // For now, we'll filter transactions by description containing staff name
    const staffMember = staff.find(s => s.id === selectedStaffId);
    if (!staffMember) return;

    let query = supabase
      .from('transactions')
      .select('*')
      .ilike('description', `%${staffMember.name}%`)
      .order('date', { ascending: false });

    if (dateRange.start) query = query.gte('date', dateRange.start);
    if (dateRange.end) query = query.lte('date', dateRange.end);

    const { data: transactions } = await query;

    const combined = (transactions || []).map(t => ({
      id: t.id,
      date: t.date,
      type: t.type === 'expense' ? 'Payment' : 'Adjustment',
      description: t.description,
      category: t.category,
      method: t.payment_method,
      amount: t.amount
    }));

    setStatements(combined);
    setLoading(false);
  }, [selectedStaffId, dateRange, staff]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStaff();
  }, []);

  useEffect(() => {
    if (selectedStaffId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchStatements();
    }
  }, [selectedStaffId, dateRange, fetchStatements]);

  const selectedStaffMember = staff.find(s => s.id === selectedStaffId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Statement</h1>
          <p className="text-slate-500 font-medium">Track salary payments and financial history for your staff.</p>
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
              <UserSquare2 className="w-3 h-3" />
              Select Staff Member
            </label>
            <select 
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Choose a staff member...</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
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

      {selectedStaffId ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Statement Header */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">{selectedStaffMember?.name}</h2>
                <p className="text-sm text-slate-500 font-medium">{selectedStaffMember?.role}</p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid (Period)</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(statements.filter(s => s.type === 'Payment').reduce((acc, curr) => acc + curr.amount, 0))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Salary</p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(staff.find(s => s.id === selectedStaffId)?.salary || 0)}
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
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-medium">Loading statement...</td>
                  </tr>
                ) : statements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-medium">No transactions found for this period.</td>
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
                          item.type === 'Payment' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {item.type === 'Payment' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {item.type}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-900">{item.description}</td>
                      <td className="px-8 py-4 text-sm font-medium text-slate-600">{item.method}</td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-900 text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
          <UserSquare2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="font-bold text-slate-900 mb-2">No Staff Selected</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">Please select a staff member from the dropdown above to view their detailed statement.</p>
        </div>
      )}
    </div>
  );
}
