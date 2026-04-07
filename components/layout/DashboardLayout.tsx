'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Initializing Unicorn BD...</p>
        </div>
      </div>
    );
  }

  // In a real app, we would redirect to login if !user
  // For now, we'll show the layout to allow the user to see the UI
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}
