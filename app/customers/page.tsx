'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  UserPlus, 
  Phone, 
  MapPin, 
  MoreVertical, 
  MessageSquare, 
  History,
  ExternalLink,
  Users,
  Trash2,
  Edit,
  Save
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

interface Customer {
  id: string;
  customer_id_custom: string;
  name: string;
  phone: string;
  whatsapp: string;
  imo: string;
  email: string;
  address: string;
  delivery_address: string;
  area_district: string;
  due_balance: number;
  customer_type: string;
  notes: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Customer>>({
    customer_type: 'retail',
    due_balance: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch customers: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      customer_type: 'retail',
      due_balance: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ ...customer });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required');
      return;
    }
    setIsSaving(true);
    try {
      if (editingCustomer) {
        const { error } = await supabase
          .from('customers')
          .update(formData)
          .eq('id', editingCustomer.id);
        if (error) throw error;
        toast.success('Customer updated successfully');
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([formData]);
        if (error) throw error;
        toast.success('Customer added successfully');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error('Error saving customer: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerToDelete.id);
      if (error) throw error;
      toast.success('Customer deleted successfully');
      setIsDeleteModalOpen(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error('Error deleting customer: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) ||
    c.customer_id_custom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Directory</h1>
          <p className="text-slate-500 font-medium">Manage your client relationships and balances.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
        >
          <UserPlus className="w-4 h-4" />
          Add New Customer
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        
        <div className="bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-500/20 flex flex-col justify-center">
          <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total Due Balance</p>
          <h3 className="text-xl font-bold text-white mt-1">
            {formatCurrency(customers.reduce((acc, c) => acc + (c.due_balance || 0), 0))}
          </h3>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No customers found matching your search.</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{customer.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{customer.customer_id_custom || 'CUST-NEW'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenEditModal(customer)} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setCustomerToDelete(customer); setIsDeleteModalOpen(true); }} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {customer.phone}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{customer.address || 'No address'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Balance</p>
                    <p className={cn(
                      "text-sm font-bold",
                      customer.due_balance > 0 ? "text-red-600" : "text-green-600"
                    )}>
                      {formatCurrency(customer.due_balance || 0)}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    {customer.customer_type}
                  </span>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors" title="WhatsApp">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="History">
                    <History className="w-4 h-4" />
                  </button>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  View Profile
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="lg"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleSaveCustomer} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
              {isSaving ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4" />
                  {editingCustomer ? 'Update Customer' : 'Save Customer'}
                </>
              )}
            </button>
          </>
        }
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</label>
              <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
              <input type="text" required value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp</label>
              <input type="text" value={formData.whatsapp || ''} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">IMO</label>
              <input type="text" value={formData.imo || ''} onChange={(e) => setFormData({ ...formData, imo: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Type</label>
              <select value={formData.customer_type || 'retail'} onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
            <textarea value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</label>
            <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Customer"
        size="sm"
        footer={
          <>
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleDeleteCustomer} disabled={isSaving} className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">
              {isSaving ? 'Deleting...' : 'Delete Customer'}
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center"><Trash2 className="w-8 h-8" /></div>
          <div>
            <p className="text-slate-900 font-bold">Are you sure?</p>
            <p className="text-sm text-slate-500 mt-1">You are about to delete <span className="font-bold text-slate-900">{customerToDelete?.name}</span>. This action cannot be undone.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
