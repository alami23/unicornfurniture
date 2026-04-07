'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Bell, 
  Shield, 
  Smartphone, 
  Globe, 
  Save,
  Plus,
  Trash2,
  Layers,
  Tag,
  Database,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { seedDemoData } from '@/lib/seed-data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states for Categories/Brands
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('furniture');
  const [newBrandName, setNewBrandName] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [catRes, brandRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('brands').select('*').order('name')
    ]);
    setCategories(catRes.data || []);
    setBrands(brandRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'data') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
  }, [activeTab, fetchData]);

  const handleAddCategory = async () => {
    if (!newCatName) return;
    const { error } = await supabase.from('categories').insert([{ name: newCatName, type: newCatType }]);
    if (error) toast.error(error.message);
    else {
      toast.success('Category added');
      setNewCatName('');
      fetchData();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error('Cannot delete: Category might be in use');
    else {
      toast.success('Category deleted');
      fetchData();
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName) return;
    const { error } = await supabase.from('brands').insert([{ name: newBrandName }]);
    if (error) toast.error(error.message);
    else {
      toast.success('Brand added');
      setNewBrandName('');
      fetchData();
    }
  };

  const handleDeleteBrand = async (id: string) => {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) toast.error('Cannot delete: Brand might be in use');
    else {
      toast.success('Brand deleted');
      fetchData();
    }
  };

  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: Building2 },
    { id: 'data', label: 'Categories & Brands', icon: Layers },
    { id: 'notifications', label: 'SMS & WhatsApp', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'localization', label: 'Localization', icon: Globe },
    { id: 'developer', label: 'Developer Tools', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 font-medium">Configure your business preferences and system defaults.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {activeTab === 'profile' && (
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Business Profile</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shop Name</label>
                  <input type="text" defaultValue="UNICORN FURNITURE BD" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Owner Name</label>
                  <input type="text" placeholder="Enter owner name" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input type="text" defaultValue="+880 1XXX XXXXXX" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input type="email" placeholder="shop@example.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shop Address</label>
                  <textarea rows={3} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Enter full shop address..."></textarea>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Categories */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900">Product Categories</h3>
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Category name" 
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    />
                    <select 
                      value={newCatType}
                      onChange={(e) => setNewCatType(e.target.value)}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="furniture">Furniture</option>
                      <option value="wood">Wood</option>
                    </select>
                    <button onClick={handleAddCategory} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{cat.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{cat.type}</p>
                        </div>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900">Product Brands</h3>
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder="Brand name" 
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    />
                    <button onClick={handleAddBrand} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {brands.map((brand) => (
                      <div key={brand.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                        <p className="text-sm font-bold text-slate-900">{brand.name}</p>
                        <button onClick={() => handleDeleteBrand(brand.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-8 space-y-8">
              <h3 className="text-lg font-bold text-slate-900">SMS & WhatsApp Alerts</h3>
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                <Smartphone className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h4 className="font-bold text-slate-900 mb-2">Integration Coming Soon</h4>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">We are working on integrating local SMS gateways and WhatsApp Business API for automated customer reminders.</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-8 space-y-8">
              <h3 className="text-lg font-bold text-slate-900">Security & Access</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'localization' && (
            <div className="p-8 space-y-8">
              <h3 className="text-lg font-bold text-slate-900">Localization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Currency Symbol</label>
                  <input type="text" defaultValue="৳ (BDT)" disabled className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timezone</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>Asia/Dhaka (GMT+6)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Developer Tools</h3>
              </div>
              
              <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Seed Demo Data</h4>
                    <p className="text-sm text-slate-600">Populate your database with sample categories, brands, products, customers, and staff for testing purposes.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  {!showSeedConfirm ? (
                    <button 
                      onClick={() => setShowSeedConfirm(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Seed All Demo Data
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={async () => {
                          setLoading(true);
                          const result = await seedDemoData();
                          setLoading(false);
                          setShowSeedConfirm(false);
                          
                          if (result.success) {
                            toast.success('Demo data seeded successfully!');
                          } else {
                            toast.error('Seeding failed: ' + result.error);
                          }
                        }}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Confirm Seeding
                      </button>
                      <button 
                        onClick={() => setShowSeedConfirm(false)}
                        className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-300 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 italic">Note: This will not delete existing data.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
