'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Layers, 
  Search,
  Edit,
  Save,
  Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

interface CategoryListProps {
  type: 'all' | 'furniture' | 'wood';
  title: string;
  description: string;
}

export default function CategoryList({ type, title, description }: CategoryListProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'furniture' | 'wood'>(type);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: type === 'all' ? 'furniture' : type,
    description: ''
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('categories').select('*').order('name');
    
    if (type !== 'all') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    
    if (error) toast.error(error.message);
    else setCategories(data || []);
    setLoading(false);
  }, [type]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let error;
    if (editingCategory) {
      const { error: err } = await supabase
        .from('categories')
        .update({ name: formData.name, type: formData.type })
        .eq('id', editingCategory.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('categories')
        .insert([{ name: formData.name, type: formData.type }]);
      error = err;
    }

    if (error) toast.error(error.message);
    else {
      toast.success(editingCategory ? 'Category updated' : 'Category added');
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', type: type === 'all' ? 'furniture' : type, description: '' });
      fetchCategories();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure? This might affect products using this category.')) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error('Cannot delete: Category might be in use');
    else {
      toast.success('Category deleted');
      fetchCategories();
    }
  };

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || cat.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 font-medium">{description}</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', type: type === 'all' ? 'furniture' : type, description: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Add New Category
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        {type === 'all' && (
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['all', 'furniture', 'wood'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                    filterType === t 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-3xl"></div>
          ))
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium">No categories found.</div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Layers className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      setEditingCategory(cat);
                      setFormData({ name: cat.name, type: cat.type, description: '' });
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{cat.name}</h3>
              <span className={cn(
                "inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                cat.type === 'furniture' ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"
              )}>
                {cat.type}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
              placeholder="e.g. Sofa Sets, Teak Logs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['furniture', 'wood'] as const).map((t) => (
                <button 
                  key={t} 
                  type="button" 
                  disabled={type !== 'all'}
                  onClick={() => setFormData({ ...formData, type: t })} 
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all", 
                    formData.type === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500",
                    type !== 'all' && "cursor-not-allowed"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
