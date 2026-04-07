'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  UserSquare2, 
  FileText, 
  Receipt, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight,
  Truck,
  Undo2,
  Wallet,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'POS Furniture', icon: ShoppingCart, href: '/pos-furniture' },
  { name: 'POS Wood', icon: ShoppingCart, href: '/pos-wood' },
  { name: 'Invoices', icon: FileText, href: '/invoices' },
  { name: 'Estimates', icon: Calculator, href: '/estimates' },
  { name: 'Returns', icon: Undo2, href: '/returns' },
  { name: 'Inventory', icon: Package, href: '/inventory' },
  { name: 'Customers', icon: Users, href: '/customers' },
  { name: 'Staff', icon: UserSquare2, href: '/staff' },
  { name: 'Vendors', icon: Truck, href: '/vendors' },
  { name: 'Transactions', icon: Wallet, href: '/transactions' },
  { name: 'Reports', icon: BarChart3, href: '/reports' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col sticky top-0 overflow-y-auto scrollbar-hide">
      <div className="p-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          UNICORN <span className="text-blue-600">FURNITURE</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">MANAGEMENT SYSTEM</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-blue-50 text-blue-700 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
