'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  Briefcase, 
  MoreVertical, 
  UserPlus,
  Users,
  Trash2,
  Edit,
  Save,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  salary: number;
  join_date: string;
  status: 'active' | 'inactive';
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Staff>>({
    status: 'active',
    salary: 0,
    join_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch staff: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormData({
      status: 'active',
      salary: 0,
      join_date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: Staff) => {
    setEditingStaff(member);
    setFormData({ ...member });
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required');
      return;
    }
    setIsSaving(true);
    try {
      if (editingStaff) {
        const { error } = await supabase
          .from('staff')
          .update(formData)
          .eq('id', editingStaff.id);
        if (error) throw error;
        toast.success('Staff member updated successfully');
      } else {
        const { error } = await supabase
          .from('staff')
          .insert([formData]);
        if (error) throw error;
        toast.success('Staff member added successfully');
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast.error('Error saving staff: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffToDelete.id);
      if (error) throw error;
      toast.success('Staff member deleted successfully');
      setIsDeleteModalOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast.error('Error deleting staff: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500 font-medium">Manage your team members and roles.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, role, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        
        <div className="bg-slate-900 p-4 rounded-xl shadow-lg flex flex-col justify-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Staff</p>
          <h3 className="text-xl font-bold text-white mt-1">{staff.length} Members</h3>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))
        ) : filteredStaff.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No staff members found.</p>
          </div>
        ) : (
          filteredStaff.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{member.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenEditModal(member)} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setStaffToDelete(member); setIsDeleteModalOpen(true); }} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {member.phone}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {member.role}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Joined: {new Date(member.join_date).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary</p>
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(member.salary)}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    member.status === 'active' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  )}>
                    {member.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        size="lg"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleSaveStaff} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
              {isSaving ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4" />
                  {editingStaff ? 'Update Staff' : 'Save Staff'}
                </>
              )}
            </button>
          </>
        }
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
              <input type="text" required value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role / Designation</label>
              <input type="text" value={formData.role || ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Sales Manager" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Salary (Monthly)</label>
              <input type="number" value={formData.salary || 0} onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Join Date</label>
              <input type="date" value={formData.join_date || ''} onChange={(e) => setFormData({ ...formData, join_date: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
              <select value={formData.status || 'active'} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Staff Member"
        size="sm"
        footer={
          <>
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleDeleteStaff} disabled={isSaving} className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">
              {isSaving ? 'Deleting...' : 'Delete Staff'}
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center"><Trash2 className="w-8 h-8" /></div>
          <div>
            <p className="text-slate-900 font-bold">Are you sure?</p>
            <p className="text-sm text-slate-500 mt-1">You are about to delete <span className="font-bold text-slate-900">{staffToDelete?.name}</span>. This action cannot be undone.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
