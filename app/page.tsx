'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  CreditCard, 
  Clock, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

const data = [
  { name: 'Jan', sales: 4000, expenses: 2400 },
  { name: 'Feb', sales: 3000, expenses: 1398 },
  { name: 'Mar', sales: 2000, expenses: 9800 },
  { name: 'Apr', sales: 2780, expenses: 3908 },
  { name: 'May', sales: 1890, expenses: 4800 },
  { name: 'Jun', sales: 2390, expenses: 3800 },
  { name: 'Jul', sales: 3490, expenses: 4300 },
];

const stats = [
  { name: 'Total Sales', value: 1245000, change: '+12.5%', icon: TrendingUp, color: 'blue' },
  { name: 'Active Orders', value: 42, change: '+5', icon: Clock, color: 'orange' },
  { name: 'Total Customers', value: 856, change: '+18', icon: Users, color: 'green' },
  { name: 'Low Stock Items', value: 12, change: '-2', icon: AlertCircle, color: 'red' },
];

const recentTransactions = [
  { id: 'INV-2024-001', customer: 'Robert Knox', amount: 45000, status: 'paid', date: '2024-03-20' },
  { id: 'INV-2024-002', customer: 'Sarah Ahmed', amount: 12500, status: 'partial', date: '2024-03-19' },
  { id: 'INV-2024-003', customer: 'Karim Ullah', amount: 85000, status: 'unpaid', date: '2024-03-18' },
  { id: 'INV-2024-004', customer: 'Zayed Khan', amount: 32000, status: 'paid', date: '2024-03-17' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back, here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            Download Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "p-3 rounded-xl transition-colors",
                stat.color === 'blue' && "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
                stat.color === 'orange' && "bg-orange-50 text-orange-600 group-hover:bg-orange-100",
                stat.color === 'green' && "bg-green-50 text-green-600 group-hover:bg-green-100",
                stat.color === 'red' && "bg-red-50 text-red-600 group-hover:bg-red-100",
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.change.startsWith('+') ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}>
                {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.name}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {typeof stat.value === 'number' && stat.name.includes('Sales') 
                ? formatCurrency(stat.value) 
                : stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Sales vs Expenses</h3>
            <select className="text-sm border-slate-200 rounded-lg bg-slate-50 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>Last 7 Months</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `৳${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={0} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    tx.status === 'paid' ? "bg-green-50 text-green-600" : 
                    tx.status === 'partial' ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
                  )}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{tx.customer}</p>
                    <p className="text-xs text-slate-500 font-medium">{tx.id} • {tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(tx.amount)}</p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    tx.status === 'paid' ? "text-green-600" : 
                    tx.status === 'partial' ? "text-orange-600" : "text-red-600"
                  )}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
            View All Transactions
          </button>
        </div>
      </div>

      {/* Quick Actions & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'New Sale', icon: ShoppingCart, color: 'bg-blue-600' },
              { name: 'Add Product', icon: Package, color: 'bg-purple-600' },
              { name: 'Add Customer', icon: Users, color: 'bg-green-600' },
              { name: 'Add Expense', icon: CreditCard, color: 'bg-red-600' },
            ].map((action) => (
              <button key={action.name} className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg", action.color)}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Low Stock Alerts</h3>
            <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-md uppercase tracking-wider">Action Required</span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Teak Wood Sofa Set', stock: 2, min: 5, unit: 'pcs' },
              { name: 'Mahogany Dining Table', stock: 1, min: 3, unit: 'pcs' },
              { name: 'Burma Teak Logs', stock: 15, min: 50, unit: 'cft' },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500 font-medium">Min. Level: {item.min} {item.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{item.stock} {item.unit}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for cn (already in utils, but just in case)
import { cn } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
