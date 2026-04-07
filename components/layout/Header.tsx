'use client';

import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices, products, customers..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-none">
                {user?.email?.split('@')[0] || 'Admin User'}
              </p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">
                Super Admin
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
