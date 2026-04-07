'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  Download,
  Printer,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalSales: 0,
    totalExpenses: 0,
    totalProfit: 0,
    salesGrowth: 12.5,
    expenseGrowth: -5.2,
    profitGrowth: 18.7
  });

  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  const fetchReportData = async () => {
    setLoading(true);
    
    // Fetch Invoices for sales
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount, created_at')
      .gte('created_at', startOfMonth(subMonths(new Date(), 5)).toISOString());

    // Fetch Transactions for expenses
    const { data: expenses } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('type', 'expense')
      .gte('date', startOfMonth(subMonths(new Date(), 5)).toISOString());

    // Process data for charts
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return format(d, 'MMM');
    });

    const chartData = months.map(month => {
      const monthInvoices = (invoices || []).filter(inv => format(new Date(inv.created_at), 'MMM') === month);
      const monthExpenses = (expenses || []).filter(exp => format(new Date(exp.date), 'MMM') === month);
      
      const sales = monthInvoices.reduce((acc, curr) => acc + curr.total_amount, 0);
      const exp = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
      
      return {
        name: month,
        sales,
        expenses: exp,
        profit: sales - exp
      };
    });

    setSalesData(chartData);
    
    // Mock category data
    setCategoryData([
      { name: 'Sofa Sets', value: 45, color: '#3b82f6' },
      { name: 'Dining', value: 25, color: '#10b981' },
      { name: 'Beds', value: 20, color: '#f59e0b' },
      { name: 'Wood Logs', value: 10, color: '#ef4444' },
    ]);

    setStats({
      totalSales: (invoices || []).reduce((acc, curr) => acc + curr.total_amount, 0),
      totalExpenses: (expenses || []).reduce((acc, curr) => acc + curr.amount, 0),
      totalProfit: (invoices || []).reduce((acc, curr) => acc + curr.total_amount, 0) - (expenses || []).reduce((acc, curr) => acc + curr.amount, 0),
      salesGrowth: 12.5,
      expenseGrowth: -5.2,
      profitGrowth: 18.7
    });

    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReportData();
  }, [activeTab]);

  const tabs = [
    { id: 'sales', label: 'Sales Report', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory Report', icon: Package },
    { id: 'customers', label: 'Customer Insights', icon: Users },
    { id: 'financial', label: 'Financial Summary', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Business Reports</h1>
          <p className="text-slate-500 font-medium">Analyze your business performance with detailed insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.id 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
              stats.salesGrowth > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {stats.salesGrowth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(stats.salesGrowth)}%
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Sales (6M)</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalSales)}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 rounded-2xl">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
              stats.expenseGrowth < 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {stats.expenseGrowth < 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
              {Math.abs(stats.expenseGrowth)}%
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Expenses (6M)</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalExpenses)}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
              stats.profitGrowth > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {stats.profitGrowth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(stats.profitGrowth)}%
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Net Profit (6M)</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalProfit)}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Sales vs Expenses</h3>
            <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                  tickFormatter={(value) => `৳${value/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Sales by Category</h3>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>
          <div className="h-80 w-full flex items-center">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-48 space-y-4">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Top Selling Products</h3>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Qty Sold</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Luxury 3-Seater Sofa', cat: 'Furniture', qty: 45, rev: 2025000, growth: 15.2 },
                { name: 'Teak Wood Dining Table', cat: 'Furniture', qty: 28, rev: 1400000, growth: 8.4 },
                { name: 'Burma Teak Log', cat: 'Wood', qty: 150, rev: 525000, growth: -2.1 },
                { name: 'Mahogany Bed Frame', cat: 'Furniture', qty: 18, rev: 900000, growth: 12.0 },
              ].map((prod, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 text-sm font-bold text-slate-900">{prod.name}</td>
                  <td className="px-8 py-4 text-sm font-medium text-slate-500">{prod.cat}</td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-900 text-right">{prod.qty}</td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-900 text-right">{formatCurrency(prod.rev)}</td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      prod.growth > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {prod.growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(prod.growth)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
